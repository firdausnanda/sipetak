<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithColumnWidths;

class LampiranSkshhkExport implements FromView, WithColumnWidths
{
    protected $dokumen;
    protected $skshhkData;

    public function __construct($dokumen, $skshhkData)
    {
        $this->dokumen = $dokumen;
        $this->skshhkData = $skshhkData;
    }

    public function view(): View
    {
        return view('pdf.lampiran-skshhk', [
            'dokumen' => $this->dokumen,
            'skshhkData' => $this->skshhkData,
            'isExcel' => true
        ]);
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 25,
            'C' => 25,
            'D' => 15,
            'E' => 15,
            'F' => 15,
            'G' => 25,
            'H' => 15,
        ];
    }
}
