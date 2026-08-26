<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class MonitoringRoleSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view_felling_progress',
            'view_transport_progress'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $role = Role::firstOrCreate(['name' => 'monitoring_viewer']);
        $role->givePermissionTo($permissions);
    }
}
