<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DokumenAngkutanOrderingTest extends TestCase
{
    use RefreshDatabase;

    public function test_documents_are_ordered_by_newest_date_then_document_number_descending(): void
    {
        Role::findOrCreate('admin_cdk');
        $user = User::factory()->create();
        $user->assignRole('admin_cdk');
        $kelompokId = DB::table('kelompoks')->insertGetId(['nama_kelompok' => 'KTH Uji']);

        foreach ([
            ['DA-001', '2026-10-08'],
            ['DA-003', '2026-10-07'],
            ['DA-002', '2026-10-08'],
        ] as [$number, $date]) {
            DB::table('dokumen_angkutans')->insert([
                'kelompok_id' => $kelompokId,
                'no_dokumen' => $number,
                'tanggal' => $date,
            ]);
        }

        $this->actingAs($user)
            ->get(route('admin.dokumen_angkutans.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/DokumenAngkutan/Index')
                ->where('dokumens.data.0.no_dokumen', 'DA-002')
                ->where('dokumens.data.1.no_dokumen', 'DA-001')
                ->where('dokumens.data.2.no_dokumen', 'DA-003')
                ->etc());
    }
}
