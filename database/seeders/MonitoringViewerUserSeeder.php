<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class MonitoringViewerUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('monitoring.viewer_email');
        $password = config('monitoring.viewer_password');

        if (! $email || ! filter_var($email, FILTER_VALIDATE_EMAIL) || ! $password || strlen($password) < 8) {
            throw new RuntimeException('Set MONITORING_VIEWER_EMAIL and MONITORING_VIEWER_PASSWORD (minimum 8 characters) before seeding.');
        }

        $this->call(MonitoringRoleSeeder::class);

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'Monitoring Viewer',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );

        if ($user->wasRecentlyCreated) {
            $user->syncRoles(['monitoring_viewer']);
        } elseif (! $user->hasRole('monitoring_viewer') || $user->getRoleNames()->count() !== 1) {
            throw new RuntimeException('The configured email belongs to an account that is not exclusively a monitoring viewer.');
        }
    }
}
