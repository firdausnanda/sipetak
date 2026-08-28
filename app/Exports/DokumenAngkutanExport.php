<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use App\Models\DokumenAngkutan;

class DokumenAngkutanExport implements FromView, WithColumnWidths, WithTitle
{
    protected $dokumen;

    public function __construct(DokumenAngkutan $dokumen)
    {
        $this->dokumen = $dokumen;
    }

    public function view(): View
    {
        return view('pdf.dokumen-angkutan', [
            'dokumen' => $this->dokumen,
            'isExcel' => true
        ]);
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15,
            'B' => 20,
            'C' => 20,
            'D' => 20,
            'E' => 20,
            'F' => 20,
            'G' => 20,
        ];
    }

    public function title(): string
    {
        $safeTitle = str_replace(['\\', '/', '?', '*', ':', '[', ']'], '_', $this->dokumen->no_dokumen);
        return substr('Dok ' . $safeTitle, 0, 31);
    }
}
