<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Kelompok;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MonitoringViewerUserSeeder extends Seeder
{
    public function run(): void
    {
        $kelompoks = Kelompok::all();

        foreach ($kelompoks as $kelompok) {
            $username = 'monitoring_' . Str::slug($kelompok->nama_kelompok, '_');
            
            $user = User::updateOrCreate(
                ['email' => $username . '@monitoring.com'],
                [
                    'name' => 'Monitoring ' . $kelompok->nama_kelompok,
                    'password' => Hash::make('password_' . $username),
                    'kelompok_id' => $kelompok->id,
                ]
            );

            $user->assignRole('monitoring_viewer');
        }
    }
}
