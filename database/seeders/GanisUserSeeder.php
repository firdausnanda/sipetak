<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class GanisUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'ganis@sipetak.com'],
            [
                'name' => 'Akun Ganis',
                'password' => Hash::make('password'),
            ]
        );

        if (!$user->hasRole('ganis')) {
            $user->assignRole('ganis');
        }
    }
}
