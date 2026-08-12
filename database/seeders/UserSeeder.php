<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kthLancarJaya = \App\Models\Kelompok::where('nama_kelompok', 'KTH Lancar Jaya')->first();
        $kthLhs = \App\Models\Kelompok::where('nama_kelompok', 'KTH Lingkungan Hidup Sejahtera')->first();

        $adminCdk = ['Taufik Sudaryo', 'A.K. Yuhandono', 'Fajar mahardika'];
        $userLancarJaya = ['Mesenan', 'Budi', 'Piton ade pangesti'];
        $userLhs = ['Giono', 'Hendi setiawan', 'Alka yotri yurisco', 'Qotrunada salsabila ramadhani'];
        $adminKelompokLancarJaya = ['Nanda', 'Hariono', 'Siswanto'];
        $adminKelompokLhs = ['Catur purwanto', 'Khori yuni Ismail'];

        foreach ($adminCdk as $name) {
            $username = strtolower(str_replace([' ', '.'], '', $name));
            $user = \App\Models\User::updateOrCreate(
                ['email' => $username . '@cdk.com'],
                ['name' => $name, 'password' => \Illuminate\Support\Facades\Hash::make('password_' . $username)]
            );
            $user->assignRole('admin_cdk');
        }

        foreach ($userLancarJaya as $name) {
            $username = strtolower(str_replace([' ', '.'], '', $name));
            $user = \App\Models\User::updateOrCreate(
                ['email' => $username . '@lancarjaya.com'],
                ['name' => $name, 'password' => \Illuminate\Support\Facades\Hash::make('password_' . $username), 'kelompok_id' => $kthLancarJaya?->id]
            );
            $user->assignRole('user');
        }

        foreach ($userLhs as $name) {
            $username = strtolower(str_replace([' ', '.'], '', $name));
            $user = \App\Models\User::updateOrCreate(
                ['email' => $username . '@lhs.com'],
                ['name' => $name, 'password' => \Illuminate\Support\Facades\Hash::make('password_' . $username), 'kelompok_id' => $kthLhs?->id]
            );
            $user->assignRole('user');
        }

        foreach ($adminKelompokLancarJaya as $name) {
            $username = strtolower(str_replace([' ', '.'], '', $name));
            $user = \App\Models\User::updateOrCreate(
                ['email' => $username . '@admin.lancarjaya.com'],
                ['name' => $name, 'password' => \Illuminate\Support\Facades\Hash::make('password_' . $username), 'kelompok_id' => $kthLancarJaya?->id]
            );
            $user->assignRole('admin_kelompok');
        }

        foreach ($adminKelompokLhs as $name) {
            $username = strtolower(str_replace([' ', '.'], '', $name));
            $user = \App\Models\User::updateOrCreate(
                ['email' => $username . '@admin.lhs.com'],
                ['name' => $name, 'password' => \Illuminate\Support\Facades\Hash::make('password_' . $username), 'kelompok_id' => $kthLhs?->id]
            );
            $user->assignRole('admin_kelompok');
        }
    }
}
