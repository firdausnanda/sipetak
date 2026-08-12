<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Kelompok;

class JenisPohonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kelompok = Kelompok::first();
        $kelompokId = $kelompok ? $kelompok->id : 1;
        $now = now();

        $data = [
            ['kelompok_id' => $kelompokId, 'nama_jenis' => 'Jati', 'created_at' => $now, 'updated_at' => $now, 'created_by' => 1],
            ['kelompok_id' => $kelompokId, 'nama_jenis' => 'Sengon', 'created_at' => $now, 'updated_at' => $now, 'created_by' => 1],
            ['kelompok_id' => $kelompokId, 'nama_jenis' => 'Mahoni', 'created_at' => $now, 'updated_at' => $now, 'created_by' => 1],
            ['kelompok_id' => $kelompokId, 'nama_jenis' => 'Akasia', 'created_at' => $now, 'updated_at' => $now, 'created_by' => 1],
            ['kelompok_id' => $kelompokId, 'nama_jenis' => 'Gmelina', 'created_at' => $now, 'updated_at' => $now, 'created_by' => 1],
        ];

        DB::table('jenis_pohons')->insert($data);
    }
}
