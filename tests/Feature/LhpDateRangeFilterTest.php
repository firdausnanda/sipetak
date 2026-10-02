<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LhpDateRangeFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_lhp_date_range_filters_list_and_summaries_with_inclusive_bounds(): void
    {
        Role::firstOrCreate(['name' => 'admin_cdk']);
        $user = User::factory()->create();
        $user->assignRole('admin_cdk');

        $groupA = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'A']);
        $groupB = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'B']);
        foreach ([
            [$groupA, 'A01', '2026-09-01', 1],
            [$groupA, 'A10', '2026-09-10', 2],
            [$groupA, 'A20', '2026-09-20', 3],
            [$groupA, 'A30', '2026-09-30', 4],
            [$groupB, 'B15', '2026-09-15', 5],
        ] as [$group, $number, $date, $volume]) {
            DB::table('lhps')->insert([
                'kelompok_id' => $group,
                'no_lhp' => $number,
                'tanggal' => $date,
                'sortimen' => 'AI',
                'volume' => $volume,
                'tarif' => 10,
                'psdh' => $volume,
            ]);
        }

        $petak = DB::table('petaks')->insertGetId(['kelompok_id' => $groupA, 'no_petak' => 'P1']);
        $jenis = DB::table('jenis_pohons')->insertGetId(['kelompok_id' => $groupA, 'nama_jenis' => 'Jati']);
        foreach ([['2026-09-01', 1], ['2026-09-10', 2], ['2026-09-20', 3], ['2026-09-30', 4]] as [$date, $volume]) {
            $tree = DB::table('pohons')->insertGetId([
                'kelompok_id' => $groupA, 'petak_id' => $petak, 'jenis_pohon_id' => $jenis,
                'tanggal' => $date, 'tipe' => 'non_barcode',
            ]);
            DB::table('batangs')->insert([
                'pohon_id' => $tree, 'no_batang' => 1, 'panjang' => 1,
                'diameter_pangkal' => 20, 'diameter_ujung' => 18,
                'mutu' => 'P', 'volume' => $volume,
            ]);
        }

        $this->actingAs($user)->get(route('admin.lhp.index', [
            'kelompok_id' => $groupA,
            'tanggal_mulai' => '2026-09-10',
            'tanggal_akhir' => '2026-09-20',
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Lhp/Index')
            ->where('filters.tanggal_mulai', '2026-09-10')
            ->where('filters.tanggal_akhir', '2026-09-20')
            ->where('summary.total_lhp', 2)
            ->where('summary.total_volume', fn ($value) => (float) $value === 5.0)
            ->where('summary.total_volume_batang', fn ($value) => (float) $value === 5.0)
            ->where('lhps.data.0.no_lhp', 'A20')
            ->where('lhps.data.1.no_lhp', 'A10')
            ->etc());

        $this->actingAs($user)->get(route('admin.lhp.index', [
            'kelompok_id' => $groupA, 'tanggal_mulai' => '2026-09-20',
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('summary.total_lhp', 2)->etc());

        $this->actingAs($user)->get(route('admin.lhp.index', [
            'kelompok_id' => $groupA, 'tanggal_akhir' => '2026-09-10',
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('summary.total_lhp', 2)->etc());
    }
}
