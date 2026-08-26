<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WageRate;

class WageRateSeeder extends Seeder
{
    public function run(): void
    {
        $rates = [
            [
                'jenis_pekerjaan' => 'Penebangan (Chainsaw)',
                'tarif' => 15000,
                'satuan_perhitungan' => 'batang',
            ],
            [
                'jenis_pekerjaan' => 'Pengangkutan (Truk)',
                'tarif' => 20000,
                'satuan_perhitungan' => 'batang',
            ],
            [
                'jenis_pekerjaan' => 'Borongan Penebangan',
                'tarif' => 250000,
                'satuan_perhitungan' => 'pohon',
            ],
        ];

        foreach ($rates as $rate) {
            WageRate::create($rate);
        }
    }
}
