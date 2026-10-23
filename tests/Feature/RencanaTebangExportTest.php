<?php

namespace Tests\Feature;

use App\Exports\RencanaTebangExport;
use App\Models\RencanaTebang;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RencanaTebangExportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin_cdk', 'admin_kelompok', 'ganis'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }

    public function test_export_combines_filters_and_uses_selected_columns(): void
    {
        [$groupA, $petakA, $jenisA] = $this->makeReferences('A');
        [$groupB, $petakB, $jenisB] = $this->makeReferences('B');
        $admin = $this->makeUser('admin_cdk');

        $this->makeRecord($groupA, $petakA, $jenisA, '001', 'BAR-001', '2026-09-10');
        $this->makeRecord($groupA, $petakA, $jenisA, '002', 'BAR-002', '2026-09-15');
        $this->makeRecord($groupA, $petakA, $jenisA, '003', 'OTHER', '2026-09-15');
        $this->makeRecord($groupB, $petakB, $jenisB, '004', 'BAR-004', '2026-09-15');

        Excel::shouldReceive('download')->once()->withArgs(function (RencanaTebangExport $export, string $filename) {
            $this->assertSame('Rencana_Tebang.xlsx', $filename);
            $this->assertSame(['002', '001'], $export->query()->get()->pluck('no_pohon')->all());
            $this->assertSame(['No', 'No Pohon', 'Barcode'], $export->headings());

            return true;
        })->andReturn(response('exported'));

        $this->actingAs($admin)->get(route('admin.rencana_tebangs.export', [
            'search' => 'BAR-',
            'kelompok_id' => $groupA,
            'petak_id' => $petakA,
            'jenis_pohon_id' => $jenisA,
            'tanggal_mulai' => '2026-09-01',
            'tanggal_akhir' => '2026-09-30',
            'sort' => 'no_pohon',
            'direction' => 'desc',
            'columns' => ['no_barcode', 'no_pohon'],
        ]))->assertOk();

    }

    public function test_group_roles_cannot_export_other_groups_even_with_tampered_filter(): void
    {
        [$groupA, $petakA, $jenisA] = $this->makeReferences('A');
        [$groupB, $petakB, $jenisB] = $this->makeReferences('B');
        $this->makeRecord($groupA, $petakA, $jenisA, 'A1', 'A-001', '2026-09-10');
        $this->makeRecord($groupB, $petakB, $jenisB, 'B1', 'B-001', '2026-09-10');

        Excel::shouldReceive('download')->twice()->withArgs(function (RencanaTebangExport $export, string $filename) {
            $this->assertSame('Rencana_Tebang.xlsx', $filename);
            $this->assertSame(['A1'], $export->query()->get()->pluck('no_pohon')->all());

            return true;
        })->andReturn(response('exported'));

        foreach (['admin_kelompok', 'ganis'] as $role) {
            $this->actingAs($this->makeUser($role, $groupA))->get(route('admin.rencana_tebangs.export', [
                'kelompok_id' => $groupB,
            ]))->assertOk();
        }
    }

    public function test_export_rejects_invalid_range_and_columns(): void
    {
        $admin = $this->makeUser('admin_cdk');

        $this->actingAs($admin)->get(route('admin.rencana_tebangs.export', [
            'tanggal_mulai' => '2026-09-20',
            'tanggal_akhir' => '2026-09-10',
        ]))->assertRedirect()->assertSessionHasErrors('tanggal_akhir');

        $this->actingAs($admin)->get(route('admin.rencana_tebangs.export', [
            'columns' => ['no_pohon', 'invalid'],
        ]))->assertRedirect()->assertSessionHasErrors('columns.1');
    }

    public function test_xlsx_keeps_leading_zero_and_formula_like_values_as_text(): void
    {
        [$group, $petak, $jenis] = $this->makeReferences('A');
        $record = $this->makeRecord($group, $petak, $jenis, '0012', '=1+1', '2026-09-10');
        $export = new RencanaTebangExport(RencanaTebang::query()->whereKey($record), ['no_pohon', 'no_barcode']);

        $content = Excel::raw($export, \Maatwebsite\Excel\Excel::XLSX);
        $path = tempnam(sys_get_temp_dir(), 'rencana-tebang-');
        file_put_contents($path, $content);

        try {
            $sheet = IOFactory::load($path)->getActiveSheet();
            $this->assertSame(['No', 'No Pohon', 'Barcode'], $export->headings());
            $this->assertSame('0012', $sheet->getCell('B2')->getValue());
            $this->assertSame(DataType::TYPE_STRING, $sheet->getCell('B2')->getDataType());
            $this->assertSame('=1+1', $sheet->getCell('C2')->getValue());
            $this->assertSame(DataType::TYPE_STRING, $sheet->getCell('C2')->getDataType());
            $this->assertSame('A2', $sheet->getFreezePane());
        } finally {
            unlink($path);
        }
    }

    private function makeReferences(string $suffix): array
    {
        $group = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'Kelompok '.$suffix]);
        $petak = DB::table('petaks')->insertGetId(['kelompok_id' => $group, 'no_petak' => 'Petak '.$suffix]);
        $jenis = DB::table('jenis_pohons')->insertGetId(['kelompok_id' => $group, 'nama_jenis' => 'Jati '.$suffix]);

        return [$group, $petak, $jenis];
    }

    private function makeUser(string $role, ?int $group = null): User
    {
        $user = User::factory()->create(['kelompok_id' => $group]);
        $user->assignRole($role);

        return $user;
    }

    private function makeRecord(int $group, int $petak, int $jenis, string $number, string $barcode, string $createdAt): int
    {
        return DB::table('rencana_tebangs')->insertGetId([
            'kelompok_id' => $group,
            'petak_id' => $petak,
            'jenis_pohon_id' => $jenis,
            'no_pohon' => $number,
            'no_barcode' => $barcode,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }
}
