<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Regu;
use App\Models\ReguMember;
use App\Models\Kelompok;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ReguSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create a Kelompok
        $kelompok = Kelompok::first();
        if (!$kelompok) {
            $kelompok = Kelompok::create([
                'nama_kelompok' => 'Kelompok Tani Makmur',
                'kode_kelompok' => 'KTM-01'
            ]);
        }

        // Get or create 4 users to be team members
        $users = User::limit(4)->get();
        if ($users->count() < 4) {
            for ($i = $users->count() + 1; $i <= 4; $i++) {
                User::create([
                    'name' => "Pekerja Dummy $i",
                    'email' => "pekerja$i@example.com",
                    'password' => Hash::make('password'),
                    'kelompok_id' => $kelompok->id
                ]);
            }
            $users = User::latest()->limit(4)->get();
        }

        // Create Regu Potong
        $reguPotong = Regu::create([
            'kelompok_id' => $kelompok->id,
            'nama_regu' => 'Regu Potong A',
            'jenis_pekerjaan' => 'Penebangan'
        ]);

        // Attach members with percentage (Ketua 40%, Anggota 20% each)
        $porsi = [40, 20, 20, 20];
        foreach ($users as $index => $user) {
            ReguMember::create([
                'regu_id' => $reguPotong->id,
                'user_id' => $user->id,
                'porsi_persentase' => $porsi[$index] ?? 20 // Default 20 if more than 4
            ]);
        }
        
        // Create Regu Angkut
        $reguAngkut = Regu::create([
            'kelompok_id' => $kelompok->id,
            'nama_regu' => 'Regu Angkut B',
            'jenis_pekerjaan' => 'Pengangkutan'
        ]);

        // Attach same members for dummy purpose (Ketua 25%, Anggota 25% each)
        foreach ($users as $user) {
            ReguMember::create([
                'regu_id' => $reguAngkut->id,
                'user_id' => $user->id,
                'porsi_persentase' => 25
            ]);
        }
    }
}
