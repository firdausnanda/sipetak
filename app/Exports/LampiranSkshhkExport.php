<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;

class LampiranSkshhkExport implements FromView, WithColumnWidths, WithTitle
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

    public function title(): string
    {
        if (isset($this->skshhkData[0]['skshhk']->no_skshhk)) {
            $no = $this->skshhkData[0]['skshhk']->no_skshhk;
            $safeTitle = str_replace(['\\', '/', '?', '*', ':', '[', ']'], '_', $no);
            return substr('Lampiran ' . $safeTitle, 0, 31);
        }
        return 'Lampiran SKSHHK';
    }
}
