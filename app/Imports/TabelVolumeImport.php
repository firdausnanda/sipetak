<?php

namespace App\Imports;

use App\Models\TabelVolume;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class TabelVolumeImport implements ToCollection
{
    protected $jenisPohonId;
    protected $kelompokId;

    public function __construct($jenisPohonId, $kelompokId)
    {
        $this->jenisPohonId = $jenisPohonId;
        $this->kelompokId = $kelompokId;
    }

    public function collection(Collection $rows)
    {
        $headers = [];
        
        foreach ($rows as $index => $row) {
            if ($index === 0) {
                // Baris pertama adalah header
                // Index 0 adalah "Diameter", Index 1..N adalah "Panjang" (misal 0.9, 1.0)
                foreach ($row as $colIndex => $value) {
                    if ($colIndex > 0 && is_numeric($value)) {
                        $headers[$colIndex] = $value;
                    }
                }
                continue;
            }

            $diameter = $row[0];
            if (empty($diameter) || !is_numeric($diameter)) {
                continue;
            }

            foreach ($headers as $colIndex => $panjang) {
                $volume = $row[$colIndex] ?? 0;
                
                if (is_numeric($volume)) {
                    TabelVolume::updateOrCreate(
                        [
                            'kelompok_id' => $this->kelompokId,
                            'jenis_pohon_id' => $this->jenisPohonId,
                            'diameter' => $diameter,
                            'panjang' => $panjang,
                        ],
                        [
                            'volume' => $volume
                        ]
                    );
                }
            }
        }
    }
}
