<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Kelompok;

class PetakSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kelompok = Kelompok::first();
        $kelompokId = $kelompok ? $kelompok->id : 1;
        $now = now();

        $data = [];
        for ($i = 1; $i <= 10; $i++) {
            $data[] = [
                'kelompok_id' => $kelompokId,
                'no_petak' => 'Petak ' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'created_at' => $now,
                'updated_at' => $now,
                'created_by' => 1,
            ];
        }

        DB::table('petaks')->insert($data);
    }
}
