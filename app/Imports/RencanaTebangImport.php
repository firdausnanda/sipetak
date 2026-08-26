<?php

namespace App\Imports;

use App\Models\RencanaTebang;
use App\Models\Petak;
use App\Models\JenisPohon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Auth;

class RencanaTebangImport implements ToModel, WithHeadingRow
{
    protected $kelompok_id;

    public function __construct($kelompok_id)
    {
        $this->kelompok_id = $kelompok_id;
    }

    public function model(array $row)
    {
        if (!isset($row['petak']) || !isset($row['jenis_pohon']) || !isset($row['no_pohon'])) {
            return null;
        }

        $petakName = trim($row['petak']);
        $jenisName = trim($row['jenis_pohon']);

        // Temukan Petak
        $petak = Petak::where('kelompok_id', $this->kelompok_id)
            ->where('no_petak', 'like', "%{$petakName}%")
            ->first();

        // Temukan Jenis Pohon
        $jenisPohon = JenisPohon::where('kelompok_id', $this->kelompok_id)
            ->where('nama_jenis', 'like', "%{$jenisName}%")
            ->first();

        if (!$petak) {
            throw new \Exception("Data Petak '$petakName' tidak ditemukan di database untuk kelompok ini.");
        }
        
        if (!$jenisPohon) {
            throw new \Exception("Data Jenis Pohon '$jenisName' tidak ditemukan di database untuk kelompok ini.");
        }

        return new RencanaTebang([
            'kelompok_id' => $this->kelompok_id,
            'petak_id' => $petak->id,
            'jenis_pohon_id' => $jenisPohon->id,
            'no_pohon' => $row['no_pohon'],
            'no_barcode' => $row['no_barcode'] ?? null,
        ]);
    }
}
