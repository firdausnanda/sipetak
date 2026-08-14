<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kelompok;
use App\Models\Petak;
use App\Models\JenisPohon;
use App\Models\Pohon;
use App\Models\Batang;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $kelompok = Kelompok::firstOrCreate(
            ['nama_kelompok' => 'Kelompok Tani Makmur']
        );

        $petak1 = Petak::firstOrCreate(
            ['no_petak' => 'Petak 1A', 'kelompok_id' => $kelompok->id]
        );

        $petak2 = Petak::firstOrCreate(
            ['no_petak' => 'Petak 1B', 'kelompok_id' => $kelompok->id]
        );

        $jenis1 = JenisPohon::firstOrCreate(
            ['nama_jenis' => 'Jati', 'kelompok_id' => $kelompok->id]
        );
        $jenis2 = JenisPohon::firstOrCreate(
            ['nama_jenis' => 'Mahoni', 'kelompok_id' => $kelompok->id]
        );
        
        $mutus = ['P', 'D', 'T', 'M'];

        for ($i = 1; $i <= 10; $i++) {
            $pohon = Pohon::create([
                'kelompok_id' => $kelompok->id,
                'petak_id' => $i <= 5 ? $petak1->id : $petak2->id,
                'jenis_pohon_id' => $i % 2 == 0 ? $jenis1->id : $jenis2->id,
                'tanggal' => Carbon::today()->subDays(rand(1, 10)),
                'tipe' => 'barcode',
                'no_barcode' => 'BC' . str_pad(rand(100, 99999), 5, '0', STR_PAD_LEFT),
                'no_pohon' => 'PHN' . rand(100, 99999),
            ]);

            $numBatang = rand(1, 3);
            for ($b = 1; $b <= $numBatang; $b++) {
                Batang::create([
                    'pohon_id' => $pohon->id,
                    'no_batang' => $b,
                    'panjang' => rand(150, 400) / 100,
                    'diameter_pangkal' => rand(20, 50),
                    'diameter_ujung' => rand(15, 45),
                    'mutu' => $mutus[array_rand($mutus)],
                ]);
            }
        }
    }
}
