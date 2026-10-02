<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PnbpExportFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_export_combines_lhp_date_status_billing_sortimen_volume_and_group_filters(): void
    {
        Role::firstOrCreate(['name' => 'admin_cdk']);
        $user = User::factory()->create();
        $user->assignRole('admin_cdk');
        [$groupA, $groupB] = $this->seedExportRecords();

        Excel::fake();
        $this->actingAs($user)->get(route('admin.pnbp.export_rekonsiliasi', [
            'kelompok_id' => $groupA,
            'tanggal_mulai' => '2026-09-20',
            'tanggal_akhir' => '2026-09-20',
            'status' => 'belum_lunas',
            'tanggal_billing' => '2026-09-15',
            'sortimen' => 'AII',
            'min_volume' => 4.5,
            'max_volume' => 5.5,
        ]))->assertOk();

        Excel::assertDownloaded('Rekonsiliasi_PSDH.xlsx', function ($export) {
            $data = $export->view()->getData();

            return $this->exportedNumbers($data['groupedLhps']) === ['A2']
                && $data['kelompokName'] === 'KTH A'
                && $data['periode'] === 'Periode LHP: 20/09/2026 s.d. 20/09/2026';
        });
    }

    public function test_unpaid_export_keeps_admin_kelompok_scope_including_lhps_without_billing(): void
    {
        Role::firstOrCreate(['name' => 'admin_kelompok']);
        [$groupA] = $this->seedExportRecords();
        $user = User::factory()->create(['kelompok_id' => $groupA]);
        $user->assignRole('admin_kelompok');

        Excel::fake();
        $this->actingAs($user)->get(route('admin.pnbp.export_rekonsiliasi', [
            'status' => 'belum_lunas',
        ]))->assertOk();

        Excel::assertDownloaded('Rekonsiliasi_PSDH.xlsx', function ($export) {
            $data = $export->view()->getData();

            return $this->exportedNumbers($data['groupedLhps']) === ['A2', 'A4', 'A3']
                && $data['periode'] === 'Seluruh tanggal LHP';
        });
    }

    public function test_paid_export_accepts_an_open_ended_lhp_date_and_billing_search(): void
    {
        Role::firstOrCreate(['name' => 'admin_cdk']);
        $user = User::factory()->create();
        $user->assignRole('admin_cdk');
        $this->seedExportRecords();

        Excel::fake();
        $this->actingAs($user)->get(route('admin.pnbp.export_rekonsiliasi', [
            'tanggal_akhir' => '2026-09-10',
            'status' => 'lunas',
            'search' => 'BILL-A1',
            'max_volume' => 2,
        ]))->assertOk();

        Excel::assertDownloaded('Rekonsiliasi_PSDH.xlsx', function ($export) {
            $data = $export->view()->getData();

            $this->assertSame(['A1'], $this->exportedNumbers($data['groupedLhps']));
            $this->assertSame('Periode LHP: sampai 10/09/2026', $data['periode']);

            return true;
        });
    }

    public function test_export_rejects_reversed_date_or_volume_bounds(): void
    {
        Role::firstOrCreate(['name' => 'admin_cdk']);
        $user = User::factory()->create();
        $user->assignRole('admin_cdk');

        $this->actingAs($user)->get(route('admin.pnbp.export_rekonsiliasi', [
            'tanggal_mulai' => '2026-09-20', 'tanggal_akhir' => '2026-09-10',
        ]))->assertRedirect()->assertSessionHasErrors('tanggal_akhir');

        $this->actingAs($user)->get(route('admin.pnbp.export_rekonsiliasi', [
            'min_volume' => 10, 'max_volume' => 5,
        ]))->assertRedirect()->assertSessionHasErrors('max_volume');
    }

    private function seedExportRecords(): array
    {
        $groupA = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'A']);
        $groupB = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'B']);

        foreach ([
            [$groupA, 'A1', '2026-09-10', 'AI', 2, 'BILL-A1', '2026-09-15', 'NTPN-A1'],
            [$groupA, 'A2', '2026-09-20', 'AII', 5, 'BILL-A2', '2026-09-15', null],
            [$groupA, 'A3', '2026-09-21', 'AII', 6, 'BILL-A3', '2026-09-16', null],
            [$groupA, 'A4', '2026-09-20', 'AI', 3, null, null, null],
            [$groupB, 'B1', '2026-09-20', 'AII', 5, null, null, null],
        ] as [$group, $number, $date, $sortimen, $volume, $billing, $billingDate, $ntpn]) {
            $lhpId = DB::table('lhps')->insertGetId([
                'kelompok_id' => $group, 'no_lhp' => $number, 'tanggal' => $date,
                'sortimen' => $sortimen, 'volume' => $volume, 'tarif' => 10, 'psdh' => 10,
            ]);

            if ($billing) {
                DB::table('pnbps')->insert([
                    'lhp_id' => $lhpId, 'kode_billing' => $billing,
                    'tanggal_kode_billing' => $billingDate,
                    'tanggal_bayar' => $ntpn ? '2026-09-17' : null,
                    'ntpn' => $ntpn, 'jumlah' => 10,
                ]);
            }
        }

        return [$groupA, $groupB];
    }

    private function exportedNumbers($groupedLhps): array
    {
        return $groupedLhps->flatMap(fn ($lhps) => $lhps->pluck('no_lhp'))->values()->all();
    }
}
