<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserExportFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['user', 'admin_cdk', 'admin_kelompok', 'ganis', 'monitoring_viewer'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }

    public function test_export_combines_role_group_verification_and_date_filters(): void
    {
        [$groupA, $groupB] = $this->seedGroups();
        $admin = $this->makeUser('Admin', 'admin_cdk', null, '2026-01-01');
        $this->makeUser('Andi', 'user', $groupA, '2026-09-10');
        $this->makeUser('Budi', 'ganis', $groupA, '2026-09-15');
        $this->makeUser('Cici', 'user', $groupA, '2026-09-15', verified: false);
        $this->makeUser('Dodi', 'user', $groupB, '2026-09-15');
        $this->makeUser('Eka', 'admin_kelompok', $groupA, '2026-09-15');
        $this->makeUser('Fani', 'user', $groupA, '2026-10-01');

        Excel::fake();
        $this->actingAs($admin)->get(route('admin.users.export', [
            'roles' => ['user', 'ganis'],
            'kelompok_id' => $groupA,
            'status_verifikasi' => 'verified',
            'tanggal_mulai' => '2026-09-01',
            'tanggal_akhir' => '2026-09-30',
            'columns' => ['email', 'name'],
        ]))->assertOk();

        Excel::assertDownloaded('Data_Pengguna.xlsx', function ($export) {
            $this->assertSame(['Andi', 'Budi'], $export->collection()->pluck('name')->all());
            $this->assertSame(['No', 'Nama Pengguna', 'Email'], $export->headings());

            return true;
        });
    }

    public function test_export_can_target_users_without_group(): void
    {
        [$groupA] = $this->seedGroups();
        $admin = $this->makeUser('Admin', 'admin_cdk', null, '2026-01-01');
        $this->makeUser('Viewer', 'monitoring_viewer', null, '2026-02-01');
        $this->makeUser('Andi', 'user', $groupA, '2026-02-01');

        Excel::fake();
        $this->actingAs($admin)->get(route('admin.users.export', ['kelompok_id' => 'none']))->assertOk();

        Excel::assertDownloaded('Data_Pengguna.xlsx', function ($export) {
            return $export->collection()->pluck('name')->all() === ['Admin', 'Viewer'];
        });
    }

    public function test_admin_kelompok_export_is_scoped_to_own_group(): void
    {
        [$groupA, $groupB] = $this->seedGroups();
        $adminKelompok = $this->makeUser('Admin A', 'admin_kelompok', $groupA, '2026-01-01');
        $this->makeUser('Andi', 'user', $groupA, '2026-02-01');
        $this->makeUser('Dodi', 'user', $groupB, '2026-02-01');

        Excel::fake();
        $this->actingAs($adminKelompok)->get(route('admin.users.export', ['kelompok_id' => $groupB]))->assertOk();

        Excel::assertDownloaded('Data_Pengguna.xlsx', function ($export) {
            return $export->collection()->pluck('name')->all() === ['Admin A', 'Andi'];
        });

        $this->actingAs($adminKelompok)->get(route('admin.users.export', ['roles' => ['admin_cdk']]))
            ->assertRedirect()->assertSessionHasErrors('roles.0');
    }

    public function test_export_rejects_reversed_date_range(): void
    {
        $admin = $this->makeUser('Admin', 'admin_cdk', null, '2026-01-01');

        $this->actingAs($admin)->get(route('admin.users.export', [
            'tanggal_mulai' => '2026-09-20', 'tanggal_akhir' => '2026-09-10',
        ]))->assertRedirect()->assertSessionHasErrors('tanggal_akhir');
    }

    private function seedGroups(): array
    {
        return [
            DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'A']),
            DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'B']),
        ];
    }

    private function makeUser(string $name, string $role, ?int $kelompokId, string $createdAt, bool $verified = true): User
    {
        $user = User::factory()->create([
            'name' => $name,
            'kelompok_id' => $kelompokId,
            'email_verified_at' => $verified ? now() : null,
        ]);
        $user->forceFill(['created_at' => $createdAt])->saveQuietly();
        $user->assignRole($role);

        return $user;
    }
}
