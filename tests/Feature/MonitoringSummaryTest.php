<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\MonitoringSummary;
use Carbon\Carbon;
use Database\Seeders\MonitoringRoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MonitoringSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_periods_end_today_year_starts_january_and_all_excludes_future_records(): void
    {
        $this->travelTo(Carbon::parse('2026-09-28'));
        $group = $this->group('A');
        foreach (['2025-12-31', '2026-01-01', '2026-09-21', '2026-09-28', '2026-09-29'] as $date) {
            $tree = $this->tree($group);
            DB::table('pohons')->where('id', $tree)->update(['tanggal' => $date]);
            $this->batang($tree);
            if ($date === '2026-09-28') {
                $todayTree = $tree;
            }
        }
        $futureDocument = DB::table('dokumen_angkutans')->insertGetId([
            'kelompok_id' => $group, 'no_dokumen' => 'DOC-FUTURE', 'tanggal' => '2026-09-29',
        ]);
        $futureShipment = DB::table('skshhks')->insertGetId([
            'no_skshhk' => 'SK-FUTURE', 'tanggal' => '2026-09-29',
        ]);
        DB::table('pohons')->where('id', $todayTree)->update(['dokumen_angkutan_id' => $futureDocument]);
        DB::table('batangs')->where('pohon_id', $todayTree)->update(['skshhk_id' => $futureShipment]);
        foreach ([['2025-12-31', 10], ['2026-01-01', 20], ['2026-09-29', 30]] as [$date, $amount]) {
            DB::table('lhps')->insert([
                'kelompok_id' => $group, 'no_lhp' => 'LHP-'.$date,
                'tanggal' => $date, 'sortimen' => 'AI',
                'volume' => 1, 'tarif' => $amount, 'psdh' => $amount,
            ]);
        }

        $service = app(MonitoringSummary::class);
        $week = $service->forScope($group, 7);
        $month = $service->forScope($group, 30);
        $quarter = $service->forScope($group, 90);
        $year = $service->forScope($group, 'year');
        $all = $service->forScope($group, 'all');

        $this->assertSame('2026-09-22', $week['periode']['from']);
        $this->assertSame('2026-09-28', $week['periode']['to']);
        $this->assertSame(1, $week['summary']['pohon']);
        $this->assertSame(1, $week['kelompok'][0]['pohon']);
        $this->assertEquals(0, $week['summary']['totalPsdh']);
        $this->assertSame('2026-08-30', $month['periode']['from']);
        $this->assertSame('2026-07-01', $quarter['periode']['from']);
        $this->assertSame('2026-01-01', $year['periode']['from']);
        $this->assertSame('month', $year['periode']['granularity']);
        $this->assertSame(3, $year['summary']['pohon']);
        $this->assertSame(3, $year['summary']['pohonPeriode']);
        $this->assertSame(3, array_sum(array_column($year['trend'], 'pohon')));
        $this->assertSame(3, $year['kelompok'][0]['pohon']);
        $this->assertSame(0, $year['summary']['batangTerdokumen']);
        $this->assertSame(0, $year['summary']['batangSkshhkTerdokumen']);
        $this->assertEquals(20, $year['summary']['totalPsdh']);
        $this->assertSame(4, $all['summary']['pohon']);
        $this->assertSame(4, $all['kelompok'][0]['pohon']);
        $this->assertSame(0, $all['summary']['batangTerdokumen']);
        $this->assertSame(0, $all['summary']['batangSkshhkTerdokumen']);
        $this->assertEquals(30, $all['summary']['totalPsdh']);
        $this->assertSame('month', $all['periode']['granularity']);
    }

    public function test_empty_recent_period_still_ends_today_instead_of_last_harvest(): void
    {
        $this->travelTo(Carbon::parse('2026-09-28'));
        $group = $this->group('A');
        $tree = $this->tree($group);
        DB::table('pohons')->where('id', $tree)->update(['tanggal' => '2026-01-01']);

        $recent = app(MonitoringSummary::class)->forScope($group, 7);

        $this->assertSame('2026-09-22', $recent['periode']['from']);
        $this->assertSame('2026-09-28', $recent['periode']['to']);
        $this->assertSame(0, $recent['summary']['pohon']);
        $this->assertCount(7, $recent['trend']);
        $this->assertSame(0, array_sum(array_column($recent['trend'], 'pohon')));
    }

    public function test_year_filter_advances_automatically_in_next_calendar_year(): void
    {
        $this->travelTo(Carbon::parse('2027-02-01'));

        $year = app(MonitoringSummary::class)->forScope(null, 'year');

        $this->assertSame('2027-01-01', $year['periode']['from']);
        $this->assertSame('2027-02-01', $year['periode']['to']);
        $this->assertSame('month', $year['periode']['granularity']);
        $this->assertCount(2, $year['trend']);
    }

    public function test_batang_funnel_uses_matching_documents_and_group_scope(): void
    {
        $service = app(MonitoringSummary::class);
        $this->assertSame(0, $service->forScope(null, 7)['summary']['batang']);

        $groupA = $this->group('A');
        $groupB = $this->group('B');
        $treeA = $this->tree($groupA);
        $treeB = $this->tree($groupB);
        $this->batang($treeA);
        $this->batang($treeB);

        $withoutDocuments = $service->forScope($groupA, 7)['summary'];
        $this->assertSame(1, $withoutDocuments['batang']);
        $this->assertSame(0, $withoutDocuments['batangTerdokumen']);
        $this->assertSame(0, $withoutDocuments['batangSkshhkTerdokumen']);

        $document = DB::table('dokumen_angkutans')->insertGetId([
            'kelompok_id' => $groupA, 'no_dokumen' => 'DOC-A', 'tanggal' => today()->toDateString(),
        ]);
        DB::table('pohons')->where('id', $treeA)->update(['dokumen_angkutan_id' => $document]);
        $withTransport = $service->forScope($groupA, 7)['summary'];
        $this->assertSame(1, $withTransport['batangTerdokumen']);
        $this->assertSame(0, $withTransport['batangSkshhkTerdokumen']);

        $skshhk = DB::table('skshhks')->insertGetId([
            'no_skshhk' => 'SK-A', 'tanggal' => today()->toDateString(),
        ]);
        DB::table('batangs')->where('pohon_id', $treeA)->update(['skshhk_id' => $skshhk]);
        DB::table('batangs')->where('pohon_id', $treeB)->update(['skshhk_id' => $skshhk]);

        $all = $service->forScope(null, 7)['summary'];
        $scoped = $service->forScope($groupA, 7);
        $this->assertSame(2, $all['batang']);
        $this->assertSame(1, $all['batangTerdokumen']);
        $this->assertSame(1, $all['batangSkshhkTerdokumen']);
        $this->assertSame(1, $scoped['summary']['batangSkshhkTerdokumen']);
        $this->assertSame(1, $scoped['kelompok'][0]['pohon']);
        $this->assertSame(1, $scoped['kelompok'][0]['pohonTerdokumen']);
        $this->assertSame(1, $scoped['kelompok'][0]['pohonSkshhkTerdokumen']);
        $this->assertEquals(1, $scoped['kelompok'][0]['volume']);
        $this->assertEquals(1, $scoped['kelompok'][0]['volumeTerdokumen']);
        $this->assertEquals(1, $scoped['kelompok'][0]['volumeSkshhkTerdokumen']);
        $this->assertSame(2, $service->forScope(null, 7)['summary']['batangPeriode']);
        $this->assertSame(1, $scoped['summary']['batangPeriode']);
        $this->assertSame(1, array_sum(array_column($scoped['trend'], 'batang')));
        $this->assertEquals(2, $service->forScope(null, 7)['summary']['volumePeriode']);
        $this->assertEquals(1, array_sum(array_column($scoped['trend'], 'volume')));
        $this->assertCount(1, $scoped['kelompok']);
        $this->assertSame($groupA, $scoped['kelompok'][0]['id']);
    }

    public function test_user_group_overrides_requested_group_filter(): void
    {
        $this->seed(MonitoringRoleSeeder::class);
        $groupA = $this->group('A');
        $groupB = $this->group('B');
        $this->batang($this->tree($groupA));
        $this->batang($this->tree($groupB));
        $user = User::factory()->create(['kelompok_id' => $groupA]);
        $user->assignRole('monitoring_viewer');

        $this->actingAs($user)
            ->get('/mobile/dashboard?kelompok_id='.$groupB)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Monitoring/Dashboard')
                ->where('filters.kelompok_id', $groupA)
                ->where('summary.batang', 1)
                ->where('canFilterKelompok', false)
                ->has('kelompok', 1)
                ->etc());
    }

    public function test_psdh_uses_lhp_amounts_and_group_scope(): void
    {
        $groupA = $this->group('A');
        $groupB = $this->group('B');
        foreach ([[$groupA, 'A', 100], [$groupB, 'B', 50], [null, 'X', 25]] as [$groupId, $number, $amount]) {
            DB::table('lhps')->insert([
                'kelompok_id' => $groupId,
                'no_lhp' => 'LHP-'.$number,
                'tanggal' => today()->toDateString(),
                'sortimen' => 'AI',
                'volume' => 1,
                'tarif' => $amount,
                'psdh' => $amount,
            ]);
        }
        $lhpA = DB::table('lhps')->where('no_lhp', 'LHP-A')->value('id');
        $lhpB = DB::table('lhps')->where('no_lhp', 'LHP-B')->value('id');
        foreach ([
            [$lhpA, 'PAID-A', 70, today()->toDateString(), 'NTPN-A'],
            [$lhpA, 'OLD-A', 20, today()->subMonth()->toDateString(), 'NTPN-OLD'],
            [$lhpA, 'UNPAID-A', 30, null, null],
            [$lhpA, 'NO-NTPN', 10, today()->toDateString(), null],
            [$lhpB, 'PAID-B', 50, today()->toDateString(), 'NTPN-B'],
        ] as [$lhpId, $billing, $amount, $paidAt, $ntpn]) {
            DB::table('pnbps')->insert([
                'lhp_id' => $lhpId, 'kode_billing' => $billing,
                'tanggal_kode_billing' => today()->toDateString(), 'tanggal_bayar' => $paidAt,
                'ntpn' => $ntpn, 'jumlah' => $amount,
            ]);
        }

        $all = app(MonitoringSummary::class)->forScope(null, 7);
        $scoped = app(MonitoringSummary::class)->forScope($groupA, 7);
        $this->assertEquals(175, $all['summary']['totalPsdh']);
        $this->assertEquals(25, $all['summary']['psdhTanpaKelompok']);
        $this->assertEquals(100, $scoped['summary']['totalPsdh']);
        $this->assertEquals(100, $scoped['kelompok'][0]['totalPsdh']);
        $this->assertEquals(120, $all['summary']['totalPnbpDibayar']);
        $this->assertSame(2, $all['summary']['pnbpDibayarCount']);
        $this->assertEquals(70, $scoped['summary']['totalPnbpDibayar']);
        $this->assertEquals(70, $scoped['kelompok'][0]['totalPnbpDibayar']);
        $this->assertEquals(140, app(MonitoringSummary::class)->forScope(null, 'all')['summary']['totalPnbpDibayar']);
    }

    public function test_psdh_and_pnbp_totals_ceil_only_after_summing_records(): void
    {
        $group = $this->group('A');
        foreach ([1, 2] as $number) {
            $lhpId = DB::table('lhps')->insertGetId([
                'kelompok_id' => $group, 'no_lhp' => 'LHP-'.$number,
                'tanggal' => today()->toDateString(), 'sortimen' => 'AI',
                'volume' => 1, 'tarif' => 1.2, 'psdh' => 1.2,
            ]);
            DB::table('pnbps')->insert([
                'lhp_id' => $lhpId, 'kode_billing' => 'BILL-'.$number,
                'tanggal_kode_billing' => today()->toDateString(),
                'tanggal_bayar' => today()->toDateString(),
                'ntpn' => 'NTPN-'.$number, 'jumlah' => 0.2,
            ]);
        }

        $result = app(MonitoringSummary::class)->forScope(null, 'year');

        $this->assertSame(3, $result['summary']['totalPsdh']);
        $this->assertSame(1, $result['summary']['totalPnbpDibayar']);
        $this->assertSame(3, $result['kelompok'][0]['totalPsdh']);
        $this->assertSame(1, $result['kelompok'][0]['totalPnbpDibayar']);
    }

    public function test_all_data_trend_groups_records_by_month(): void
    {
        $group = $this->group('A');
        $oldTree = $this->tree($group);
        DB::table('pohons')->where('id', $oldTree)->update(['tanggal' => today()->subMonth()->toDateString()]);
        $this->batang($oldTree);
        $this->batang($this->tree($group));
        $document = DB::table('dokumen_angkutans')->insertGetId([
            'kelompok_id' => $group, 'no_dokumen' => 'DOC-OLD', 'tanggal' => today()->toDateString(),
        ]);
        $skshhk = DB::table('skshhks')->insertGetId(['no_skshhk' => 'SK-OLD', 'tanggal' => today()->toDateString()]);
        DB::table('pohons')->where('id', $oldTree)->update(['dokumen_angkutan_id' => $document]);
        DB::table('batangs')->where('pohon_id', $oldTree)->update(['skshhk_id' => $skshhk]);
        DB::table('lhps')->insert([
            'kelompok_id' => $group, 'no_lhp' => 'LHP-OLD', 'tanggal' => today()->subMonth()->toDateString(),
            'sortimen' => 'AI', 'volume' => 1, 'tarif' => 100, 'psdh' => 100,
        ]);

        $all = app(MonitoringSummary::class)->forScope($group, 'all');
        $this->assertSame('month', $all['periode']['granularity']);
        $this->assertCount(2, $all['trend']);
        $this->assertSame(2, array_sum(array_column($all['trend'], 'pohon')));
        $this->assertSame(2, array_sum(array_column($all['trend'], 'batang')));
        $this->assertEquals(2, $all['summary']['volumePeriode']);
        $this->assertSame(2, $all['summary']['batang']);
        $this->assertSame(2, $all['kelompok'][0]['batang']);
        $this->assertSame(1, $all['summary']['batangTerdokumen']);
        $this->assertSame(1, $all['summary']['batangSkshhkTerdokumen']);
        $this->assertEquals(100, $all['summary']['totalPsdh']);

        $recent = app(MonitoringSummary::class)->forScope($group, 7);
        $this->assertSame('day', $recent['periode']['granularity']);
        $this->assertSame(1, $recent['summary']['batangPeriode']);
        $this->assertSame(1, $recent['summary']['batang']);
        $this->assertSame(1, $recent['kelompok'][0]['batang']);
        $this->assertSame(1, $recent['summary']['batangTerdokumen']);
        $this->assertSame(1, $recent['summary']['batangSkshhkTerdokumen']);
        $this->assertSame(1, $recent['kelompok'][0]['batangTerdokumen']);
        $this->assertSame(1, $recent['kelompok'][0]['batangSkshhkTerdokumen']);
        $this->assertEquals(0, $recent['summary']['totalPsdh']);
    }

    private function group(string $name): int
    {
        return DB::table('kelompoks')->insertGetId(['nama_kelompok' => $name]);
    }

    private function tree(int $group): int
    {
        $petak = DB::table('petaks')->insertGetId(['kelompok_id' => $group, 'no_petak' => 'P'.$group]);
        $jenis = DB::table('jenis_pohons')->insertGetId(['kelompok_id' => $group, 'nama_jenis' => 'Jati']);

        return DB::table('pohons')->insertGetId([
            'kelompok_id' => $group, 'petak_id' => $petak, 'jenis_pohon_id' => $jenis,
            'tanggal' => today()->toDateString(), 'tipe' => 'non_barcode',
        ]);
    }

    private function batang(int $tree): void
    {
        DB::table('batangs')->insert([
            'pohon_id' => $tree, 'no_batang' => 1, 'panjang' => 1,
            'diameter_pangkal' => 20, 'diameter_ujung' => 18, 'mutu' => 'P', 'volume' => 1,
        ]);
    }
}
