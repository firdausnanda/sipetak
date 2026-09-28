<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AnnualMonitoringKpis;
use Carbon\Carbon;
use Database\Seeders\MonitoringRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnnualMonitoringKpisTest extends TestCase
{
    use RefreshDatabase;

    public function test_yearly_kpis_use_each_event_date_and_only_targeted_groups_for_target_percentages(): void
    {
        $this->travelTo(Carbon::parse('2026-09-28'));
        $a = $this->group('A');
        $b = $this->group('B');
        $c = $this->group('C');
        $this->target($a, 1, 2);
        $this->target($b, 1, 1);

        $aTree = $this->tree($a, '2026-01-10');
        $aP = $this->log($aTree, 'P', 1.5);
        $this->log($aTree, 'D', 0.5);
        $this->document($aTree, $a, '2026-02-01');
        $this->shipment($aP, '2026-03-01');
        $this->log($this->tree($a, '2026-09-28'), 'T', 1);

        $bTree = $this->tree($b, '2026-06-01');
        $this->log($bTree, 'M', 1);
        $this->document($bTree, $b, '2026-09-28');
        $this->log($this->tree($c, '2026-07-01'), 'P', 2);

        $oldTree = $this->tree($a, '2025-12-31');
        $oldLog = $this->log($oldTree, 'P', 4);
        $this->document($oldTree, $a, '2026-04-01');
        $this->shipment($oldLog, '2026-05-01');

        $futureTree = $this->tree($a, '2026-10-01');
        $this->log($futureTree, 'P', 9);
        $this->document($futureTree, $a, '2026-10-01');

        $this->lhp($a, '2026-04-01', 3);
        $this->lhp($b, '2026-06-01', 1.5);
        $this->lhp($a, '2025-12-31', 10);
        $this->lhp($a, '2026-10-01', 7);

        $kpis = app(AnnualMonitoringKpis::class)->forScope(null);

        $this->assertSame(2026, $kpis['year']);
        $this->assertSame('2026-09-28', $kpis['through']);
        $this->assertSame(4, $kpis['harvest']['trees']);
        $this->assertSame(5, $kpis['harvest']['logs']);
        $this->assertEquals(6, $kpis['harvest']['volume']);
        $this->assertSame(2, $kpis['harvest']['targetedGroups']);
        $this->assertSame(3, $kpis['harvest']['targetedActualTrees']);
        $this->assertEquals(4, $kpis['harvest']['targetedActualVolume']);
        $this->assertSame(2, $kpis['harvest']['targetTrees']);
        $this->assertEquals(3, $kpis['harvest']['targetVolume']);
        $this->assertEquals(150, $kpis['harvest']['treePercent']);
        $this->assertEquals(133.3, $kpis['harvest']['volumePercent']);
        $this->assertSame(4, $kpis['tpkIn']['logs']);
        $this->assertEquals(7, $kpis['tpkIn']['volume']);
        $this->assertEquals(80, $kpis['tpkIn']['logPercent']);
        $this->assertEquals(116.7, $kpis['tpkIn']['volumePercent']);
        $this->assertEquals(4.5, $kpis['lhp']['volume']);
        $this->assertEquals(300, $kpis['lhp']['volumePercent']);
        $this->assertSame(2, $kpis['buyerOut']['logs']);
        $this->assertEquals(5.5, $kpis['buyerOut']['volume']);
        $this->assertEquals(100, $kpis['buyerOut']['logPercent']);
        $this->assertEquals(366.7, $kpis['buyerOut']['volumePercent']);
        $this->assertSame(2, $kpis['stock']['logs']);
        $this->assertEquals(1.5, $kpis['stock']['volume']);
        $this->assertSame([
            ['code' => 'P', 'logs' => 2, 'volume' => 3.5],
            ['code' => 'D', 'logs' => 1, 'volume' => 0.5],
            ['code' => 'T', 'logs' => 1, 'volume' => 1.0],
            ['code' => 'M', 'logs' => 1, 'volume' => 1.0],
        ], $kpis['quality']);

        $scoped = app(AnnualMonitoringKpis::class)->forScope($a);
        $this->assertSame(2, $scoped['harvest']['trees']);
        $this->assertSame(3, $scoped['harvest']['logs']);
        $this->assertEquals(200, $scoped['harvest']['treePercent']);
        $this->assertEquals(150, $scoped['harvest']['volumePercent']);
        $this->assertSame(3, $scoped['tpkIn']['logs']);
        $this->assertEquals(3, $scoped['lhp']['volume']);
        $this->assertSame(1, $scoped['stock']['logs']);
    }

    public function test_stock_uses_all_history_through_today_and_zero_denominators_have_no_percentage(): void
    {
        $this->travelTo(Carbon::parse('2026-09-28'));
        $group = $this->group('A');
        $oldTree = $this->tree($group, '2025-12-31');
        $this->log($oldTree, 'P', 2);
        $this->document($oldTree, $group, '2025-12-31');
        $currentTree = $this->tree($group, '2026-01-01');
        $currentLog = $this->log($currentTree, 'D', 1);
        $this->document($currentTree, $group, '2026-02-01');
        $this->shipment($currentLog, '2026-10-01');
        $this->lhp($group, '2026-03-01', 1);

        $kpis = app(AnnualMonitoringKpis::class)->forScope($group);
        $this->assertSame(1, $kpis['harvest']['trees']);
        $this->assertSame(1, $kpis['tpkIn']['logs']);
        $this->assertSame(0, $kpis['buyerOut']['logs']);
        $this->assertSame(2, $kpis['stock']['logs']);
        $this->assertEquals(3, $kpis['stock']['volume']);
        $this->assertNull($kpis['harvest']['treePercent']);
        $this->assertNull($kpis['harvest']['volumePercent']);

        $empty = app(AnnualMonitoringKpis::class)->forScope($this->group('Empty'));
        $this->assertNull($empty['tpkIn']['logPercent']);
        $this->assertNull($empty['tpkIn']['volumePercent']);
        $this->assertNull($empty['lhp']['volumePercent']);
        $this->assertNull($empty['buyerOut']['logPercent']);
        $this->assertNull($empty['buyerOut']['volumePercent']);
        $this->assertSame(['P', 'D', 'T', 'M'], array_column($empty['quality'], 'code'));
        $this->assertSame([0, 0, 0, 0], array_column($empty['quality'], 'logs'));
    }

    public function test_monitoring_exposes_group_scoped_annual_kpis_independent_of_days_filter(): void
    {
        $this->travelTo(Carbon::parse('2026-09-28'));
        $this->seed(MonitoringRoleSeeder::class);
        $a = $this->group('A');
        $b = $this->group('B');
        $this->log($this->tree($a, '2026-01-01'), 'P', 1);
        $this->log($this->tree($b, '2026-01-01'), 'P', 5);
        $user = User::factory()->create(['kelompok_id' => $a]);
        $user->assignRole('monitoring_viewer');

        $this->actingAs($user)->get('/mobile/dashboard?days=7&kelompok_id='.$b)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Monitoring/Dashboard')
                ->where('annualKpis.harvest.trees', 1)
                ->where('annualKpis.harvest.volume', 1)
                ->where('filters.days', 7)
                ->where('filters.kelompok_id', $a)
                ->etc());
    }

    private function group(string $name): int
    {
        return DB::table('kelompoks')->insertGetId(['nama_kelompok' => $name]);
    }

    private function tree(int $group, string $date): int
    {
        $petak = DB::table('petaks')->insertGetId(['kelompok_id' => $group, 'no_petak' => 'P'.$group]);
        $jenis = DB::table('jenis_pohons')->insertGetId(['kelompok_id' => $group, 'nama_jenis' => 'Jati']);

        return DB::table('pohons')->insertGetId([
            'kelompok_id' => $group, 'petak_id' => $petak, 'jenis_pohon_id' => $jenis,
            'tanggal' => $date, 'tipe' => 'non_barcode',
        ]);
    }

    private function log(int $tree, string $quality, float $volume): int
    {
        return DB::table('batangs')->insertGetId([
            'pohon_id' => $tree,
            'no_batang' => DB::table('batangs')->where('pohon_id', $tree)->count() + 1,
            'panjang' => 1,
            'diameter_pangkal' => 20, 'diameter_ujung' => 18,
            'mutu' => $quality, 'volume' => $volume,
        ]);
    }

    private function document(int $tree, int $group, string $date): void
    {
        $document = DB::table('dokumen_angkutans')->insertGetId([
            'kelompok_id' => $group, 'no_dokumen' => 'DOC-'.$tree, 'tanggal' => $date,
        ]);
        DB::table('pohons')->where('id', $tree)->update(['dokumen_angkutan_id' => $document]);
    }

    private function shipment(int $log, string $date): void
    {
        $shipment = DB::table('skshhks')->insertGetId([
            'no_skshhk' => 'SK-'.$log, 'tanggal' => $date,
        ]);
        DB::table('batangs')->where('id', $log)->update(['skshhk_id' => $shipment]);
    }

    private function target(int $group, int $trees, float $volume): void
    {
        DB::table('target_tebangs')->insert([
            'kelompok_id' => $group, 'tahun' => 2026,
            'jumlah_pohon' => $trees, 'volume_taksasi' => $volume,
        ]);
    }

    private function lhp(int $group, string $date, float $volume): void
    {
        DB::table('lhps')->insert([
            'kelompok_id' => $group, 'no_lhp' => 'LHP-'.uniqid(), 'tanggal' => $date,
            'sortimen' => 'AI', 'volume' => $volume, 'tarif' => 1, 'psdh' => 1,
        ]);
    }
}
