<?php

namespace Database\Seeders;

use App\Models\Kelompok;
use Illuminate\Database\Seeder;

class KelompokSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kelompoks = [
            ['nama_kelompok' => 'KTH Lancar Jaya'],
            ['nama_kelompok' => 'KTH Lingkungan Hidup Sejahtera'],
        ];

        foreach ($kelompoks as $kelompok) {
            Kelompok::firstOrCreate($kelompok);
        }
    }
}
