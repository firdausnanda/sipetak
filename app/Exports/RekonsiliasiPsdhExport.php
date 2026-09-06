<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class RekonsiliasiPsdhExport implements FromView, ShouldAutoSize, WithStyles
{
    protected $lhps;
    protected $kelompokName;
    protected $periode;

    public function __construct($lhps, $kelompokName = 'Semua Kelompok', $periode = '')
    {
        $this->lhps = $lhps;
        $this->kelompokName = $kelompokName;
        $this->periode = $periode;
    }

    public function view(): View
    {
        // Group the data by tanggal
        $groupedLhps = $this->lhps->groupBy(function($item) {
            return \Carbon\Carbon::parse($item->tanggal)->format('Y-m-d');
        });

        return view('exports.rekonsiliasi_psdh', [
            'groupedLhps' => $groupedLhps,
            'kelompokName' => $this->kelompokName,
            'periode' => $this->periode,
        ]);
    }

    public function styles(Worksheet $sheet)
    {
        // Basic styling for the header rows (A1 to A4)
        $sheet->getStyle('A1:N3')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Borders and bold font for table headers
        $sheet->getStyle('A5:N6')->applyFromArray([
            'font' => [
                'bold' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true, // allow text wrap for header
            ],
        ]);

        // Apply borders to all data rows
        $lastRow = $sheet->getHighestRow();
        if ($lastRow > 6) {
            $sheet->getStyle("A7:N$lastRow")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);
        }
    }
}
