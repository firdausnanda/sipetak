<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LaporanHasilTebanganExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_chunked_export_contains_every_filtered_row_exactly_once(): void
    {
        Role::firstOrCreate(['name' => 'admin_cdk']);
        $user = User::factory()->create();
        $user->assignRole('admin_cdk');

        $group = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'Kelompok A']);
        $otherGroup = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'Kelompok B']);

        // 3 trees x 400 logs = 1200 rows, more than two export chunks (500),
        // with duplicate no_pohon/no_batang pairs so the id tie-breaker matters.
        $rows = [];
        foreach (range(1, 3) as $i) {
            $tree = $this->tree($group, 'POH-1');
            foreach (range(1, 400) as $n) {
                $rows[] = [
                    'pohon_id' => $tree, 'no_batang' => $n, 'panjang' => 1,
                    'diameter_pangkal' => 20, 'diameter_ujung' => 18,
                    'mutu' => 'P', 'volume' => $i + $n / 1000,
                ];
            }
        }
        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('batangs')->insert($chunk);
        }
        DB::table('batangs')->insert([
            'pohon_id' => $this->tree($otherGroup, 'POH-X'), 'no_batang' => 1, 'panjang' => 1,
            'diameter_pangkal' => 20, 'diameter_ujung' => 18, 'mutu' => 'P', 'volume' => 9,
        ]);

        $response = $this->actingAs($user)
            ->get(route('admin.dashboard.export', ['kelompok_id' => $group]))
            ->assertOk();

        $sheet = IOFactory::load($response->baseResponse->getFile()->getPathname())->getActiveSheet();
        $data = $sheet->toArray();

        $this->assertSame('Kelompok', $data[0][0]);
        $this->assertCount(1201, $data);

        $keys = array_map(fn ($row) => $row[11] . '|' . $row[7], array_slice($data, 1));
        $this->assertCount(1200, array_unique($keys));
        $this->assertNotContains('Kelompok B', array_column($data, 0));
        $this->assertSame(25.0, $sheet->getColumnDimension('A')->getWidth());
    }

    private function tree(int $group, string $number): int
    {
        $plot = DB::table('petaks')->insertGetId(['kelompok_id' => $group, 'no_petak' => 'P1']);
        $species = DB::table('jenis_pohons')->insertGetId(['kelompok_id' => $group, 'nama_jenis' => 'Jati']);

        return DB::table('pohons')->insertGetId([
            'kelompok_id' => $group, 'petak_id' => $plot, 'jenis_pohon_id' => $species,
            'no_pohon' => $number, 'tanggal' => '2026-09-10', 'tipe' => 'non_barcode',
        ]);
    }
}
