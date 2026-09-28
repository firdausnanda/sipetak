<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AnnualFellingProgress;
use Database\Seeders\MonitoringRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnnualFellingProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_yearly_progress_counts_trees_and_sums_all_logs_without_other_years(): void
    {
        $a = $this->group('A');
        $b = $this->group('B');
        $c = $this->group('C');
        $this->target($a, 2026, 2, 1.500);
        $this->target($b, 2026, 1, 1.000);
        $this->tree($a, '2026-01-15', [0.750, 0.500]);
        $this->tree($a, '2026-06-01', [1.000]);
        $this->tree($a, '2026-08-03', [0.500]);
        $this->tree($a, '2025-01-15', [5.000]);
        $this->tree($c, '2026-03-01', [9.000]);

        $progress = app(AnnualFellingProgress::class)->forScope(null, 2026);

        $this->assertCount(3, $progress['groups']);
        $this->assertSame(3, $progress['groups'][0]['actual']['trees']);
        $this->assertEquals(2.75, $progress['groups'][0]['actual']['volume']);
        $this->assertEquals(150, $progress['groups'][0]['percent']['trees']);
        $this->assertGreaterThan(100, $progress['groups'][0]['percent']['volume']);
        $this->assertNull($progress['groups'][2]['target']);
        $this->assertNull($progress['groups'][2]['percent']);
        $this->assertSame(2, $progress['total']['targetedGroups']);
        $this->assertSame(3, $progress['total']['actual']['trees']);
        $this->assertEquals(2.75, $progress['total']['actual']['volume']);
        $this->assertSame(3, $progress['total']['target']['trees']);
        $this->assertEquals(2.5, $progress['total']['target']['volume']);

        $scoped = app(AnnualFellingProgress::class)->forScope($a, 2025);
        $this->assertCount(1, $scoped['groups']);
        $this->assertNull($scoped['groups'][0]['target']);
        $this->assertSame(1, $scoped['groups'][0]['actual']['trees']);
        $this->assertEquals(5, $scoped['groups'][0]['actual']['volume']);
        $this->assertNull($scoped['total']['target']);
    }

    public function test_monitoring_defaults_to_current_year_and_respects_user_group_scope(): void
    {
        $this->seed(MonitoringRoleSeeder::class);
        $a = $this->group('A');
        $b = $this->group('B');
        $this->target($a, 2026, 2, 1.500);
        $this->target($b, 2026, 5, 3.000);
        $this->target($b, 2020, 5, 3.000);
        $this->tree($a, '2026-01-01', [1.000]);
        $this->travelTo(\Carbon\Carbon::parse('2026-09-28'));
        $user = User::factory()->create(['kelompok_id' => $a]);
        $user->assignRole('monitoring_viewer');

        $this->actingAs($user)->get('/mobile/dashboard?days=7&kelompok_id='.$b)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Monitoring/Dashboard')
                ->where('annualProgress.year', 2026)
                ->has('annualProgress.groups', 1)
                ->where('annualProgress.groups.0.id', $a)
                ->where('annualProgress.groups.0.actual.trees', 1)
                ->where('yearOptions', [2026])
                ->where('filters.days', 7)
                ->etc());
        $this->actingAs($user)->get('/mobile/dashboard?days=7&year=2025&kelompok_id='.$b)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('annualProgress.year', 2025)
                ->where('annualProgress.groups.0.id', $a)
                ->where('annualProgress.groups.0.target', null)
                ->where('filters.days', 7)
                ->etc());
    }

    private function group(string $name): int
    {
        return DB::table('kelompoks')->insertGetId(['nama_kelompok' => $name]);
    }

    private function target(int $group, int $year, int $trees, float $volume): void
    {
        DB::table('target_tebangs')->insert(['kelompok_id' => $group, 'tahun' => $year, 'jumlah_pohon' => $trees, 'volume_taksasi' => $volume]);
    }

    private function tree(int $group, string $date, array $volumes): void
    {
        $petak = DB::table('petaks')->insertGetId(['kelompok_id' => $group, 'no_petak' => 'P'.$group]);
        $jenis = DB::table('jenis_pohons')->insertGetId(['kelompok_id' => $group, 'nama_jenis' => 'Jati']);
        $tree = DB::table('pohons')->insertGetId([
            'kelompok_id' => $group, 'petak_id' => $petak, 'jenis_pohon_id' => $jenis, 'tanggal' => $date, 'tipe' => 'non_barcode',
        ]);
        foreach ($volumes as $index => $volume) {
            DB::table('batangs')->insert([
                'pohon_id' => $tree, 'no_batang' => $index + 1, 'panjang' => 1,
                'diameter_pangkal' => 20, 'diameter_ujung' => 18, 'mutu' => 'P', 'volume' => $volume,
            ]);
        }
    }
}
