<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class HasilTebanganRekapTest extends TestCase
{
    use RefreshDatabase;

    public function test_rekap_uses_all_filtered_rows_across_pages_and_counts_each_tree_once(): void
    {
        Role::firstOrCreate(['name' => 'admin_cdk']);
        $user = User::factory()->create();
        $user->assignRole('admin_cdk');

        $groupA = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'Kelompok A']);
        $groupB = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'Kelompok B']);
        $treeA1 = $this->tree($groupA, '2026-09-10');
        $treeA2 = $this->tree($groupA, '2026-09-11');
        $treeB = $this->tree($groupB, '2026-09-10');

        $this->log($treeA1, 1, 1.125);
        $this->log($treeA1, 2, 2.250);
        $this->log($treeA2, 1, 3.375);
        $this->log($treeB, 1, 4.500);

        $this->actingAs($user)->get(route('admin.dashboard', [
            'kelompok_id' => $groupA, 'start_date' => '2026-09-10',
            'end_date' => '2026-09-11', 'per_page' => 1, 'page' => 2,
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('batangs.total', 3)
            ->has('batangs.data', 1)
            ->where('rekap.jumlah_pohon', 2)
            ->where('rekap.jumlah_batang', 3)
            ->where('rekap.jumlah_vol', 6.75)
            ->etc());

        $this->actingAs($user)->get(route('admin.dashboard', [
            'kelompok_id' => $groupA, 'no_batang' => '2',
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('rekap.jumlah_pohon', 1)
            ->where('rekap.jumlah_batang', 1)
            ->where('rekap.jumlah_vol', 2.25)
            ->etc());

        $this->actingAs($user)->get(route('admin.dashboard', [
            'search' => 'tidak-ada-hasil',
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('rekap.jumlah_pohon', 0)
            ->where('rekap.jumlah_batang', 0)
            ->where('rekap.jumlah_vol', 0)
            ->etc());
    }

    public function test_rekap_respects_group_access_scope(): void
    {
        Role::firstOrCreate(['name' => 'admin_kelompok']);
        $groupA = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'Kelompok A']);
        $groupB = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'Kelompok B']);
        $user = User::factory()->create(['kelompok_id' => $groupA]);
        $user->assignRole('admin_kelompok');

        $this->log($this->tree($groupA, '2026-09-10'), 1, 1.5);
        $this->log($this->tree($groupB, '2026-09-10'), 1, 9.5);

        $this->actingAs($user)->get(route('admin.dashboard', [
            'kelompok_id' => $groupB,
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('rekap.jumlah_pohon', 1)
            ->where('rekap.jumlah_batang', 1)
            ->where('rekap.jumlah_vol', 1.5)
            ->etc());
    }

    private function tree(int $group, string $date): int
    {
        $plot = DB::table('petaks')->insertGetId(['kelompok_id' => $group, 'no_petak' => 'P1']);
        $species = DB::table('jenis_pohons')->insertGetId(['kelompok_id' => $group, 'nama_jenis' => 'Jati']);

        return DB::table('pohons')->insertGetId([
            'kelompok_id' => $group, 'petak_id' => $plot, 'jenis_pohon_id' => $species,
            'tanggal' => $date, 'tipe' => 'non_barcode',
        ]);
    }

    private function log(int $tree, int $number, float $volume): void
    {
        DB::table('batangs')->insert([
            'pohon_id' => $tree, 'no_batang' => $number, 'panjang' => 1,
            'diameter_pangkal' => 20, 'diameter_ujung' => 18,
            'mutu' => 'P', 'volume' => $volume,
        ]);
    }
}
