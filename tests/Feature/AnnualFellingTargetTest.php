<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AnnualFellingTargetTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cdk_can_create_target_with_three_decimal_volume(): void
    {
        $groupId = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'KTH Lancar Jaya']);
        $admin = User::factory()->create();
        \Spatie\Permission\Models\Role::findOrCreate('admin_cdk');
        $admin->assignRole('admin_cdk');

        $this->actingAs($admin)->post('/admin/target-tebangs', [
            'kelompok_id' => $groupId,
            'tahun' => 2026,
            'jumlah_pohon' => 8487,
            'volume_taksasi' => '3048.655',
        ])->assertRedirect();

        $this->assertDatabaseHas('target_tebangs', [
            'kelompok_id' => $groupId,
            'tahun' => 2026,
            'jumlah_pohon' => 8487,
            'volume_taksasi' => 3048.655,
        ]);
        $this->actingAs($admin)->get('/admin/target-tebangs')->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/TargetTebang/Index')
                ->has('targets', 1)
                ->where('targets.0.kelompok.nama_kelompok', 'KTH Lancar Jaya')
                ->etc());
    }

    public function test_localized_volume_is_saved_and_duplicate_group_year_is_rejected(): void
    {
        $groupId = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'KTH Lancar Jaya']);
        $admin = $this->userWithRole('admin_cdk');
        $payload = ['kelompok_id' => $groupId, 'tahun' => 2026, 'jumlah_pohon' => 8487, 'volume_taksasi' => '3.048,655'];

        $this->actingAs($admin)->post('/admin/target-tebangs', $payload)->assertRedirect();
        $this->assertDatabaseHas('target_tebangs', ['kelompok_id' => $groupId, 'tahun' => 2026, 'volume_taksasi' => 3048.655]);
        $this->actingAs($admin)->post('/admin/target-tebangs', $payload)->assertSessionHasErrors('tahun');
        $this->assertSame(1, DB::table('target_tebangs')->count());
    }

    public function test_only_admin_cdk_can_manage_targets(): void
    {
        $groupId = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'KTH Lancar Jaya']);
        $payload = ['kelompok_id' => $groupId, 'tahun' => 2026, 'jumlah_pohon' => 8487, 'volume_taksasi' => '3048.655'];
        $targetId = DB::table('target_tebangs')->insertGetId($payload);

        foreach (['admin_kelompok', 'monitoring_viewer'] as $role) {
            $user = $this->userWithRole($role);
            $this->actingAs($user)->get('/admin/target-tebangs')->assertForbidden();
            $this->actingAs($user)->post('/admin/target-tebangs', $payload)->assertForbidden();
            $this->actingAs($user)->put('/admin/target-tebangs/'.$targetId, $payload)->assertForbidden();
            $this->actingAs($user)->delete('/admin/target-tebangs/'.$targetId)->assertForbidden();
        }
    }

    public function test_admin_can_update_and_delete_target(): void
    {
        $groupId = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'KTH Lancar Jaya']);
        $admin = $this->userWithRole('admin_cdk');
        $targetId = DB::table('target_tebangs')->insertGetId([
            'kelompok_id' => $groupId, 'tahun' => 2026, 'jumlah_pohon' => 8487, 'volume_taksasi' => 3048.655,
        ]);

        $this->actingAs($admin)->put('/admin/target-tebangs/'.$targetId, [
            'kelompok_id' => $groupId, 'tahun' => 2026, 'jumlah_pohon' => 8500, 'volume_taksasi' => '3.100,125',
        ])->assertRedirect();
        $this->assertDatabaseHas('target_tebangs', ['id' => $targetId, 'jumlah_pohon' => 8500, 'volume_taksasi' => 3100.125]);
        $this->actingAs($admin)->delete('/admin/target-tebangs/'.$targetId)->assertRedirect();
        $this->assertDatabaseMissing('target_tebangs', ['id' => $targetId]);
    }

    public function test_values_outside_database_precision_are_rejected(): void
    {
        $groupId = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'KTH Lancar Jaya']);
        $admin = $this->userWithRole('admin_cdk');

        $this->actingAs($admin)->post('/admin/target-tebangs', [
            'kelompok_id' => $groupId, 'tahun' => 2026,
            'jumlah_pohon' => '4294967296', 'volume_taksasi' => '100000000000.000',
        ])->assertSessionHasErrors(['jumlah_pohon', 'volume_taksasi']);
        $this->assertDatabaseCount('target_tebangs', 0);
    }

    public function test_dot_grouped_integer_volume_uses_indonesian_thousands_separator(): void
    {
        $groupId = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'KTH Lancar Jaya']);
        $admin = $this->userWithRole('admin_cdk');

        $this->actingAs($admin)->post('/admin/target-tebangs', [
            'kelompok_id' => $groupId, 'tahun' => 2026,
            'jumlah_pohon' => 8487, 'volume_taksasi' => '3.048',
        ])->assertRedirect();
        $this->assertDatabaseHas('target_tebangs', ['kelompok_id' => $groupId, 'volume_taksasi' => 3048]);
    }

    private function userWithRole(string $role): User
    {
        Role::findOrCreate($role);
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
