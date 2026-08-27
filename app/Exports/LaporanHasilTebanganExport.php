<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanHasilTebanganExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function collection()
    {
        return $this->query->get();
    }

    public function headings(): array
    {
        return [
            'Kelompok',
            'Tipe Input',
            'No. Pohon',
            'Barcode',
            'Tanggal',
            'Petak',
            'Jenis Pohon',
            'No. Batang',
            'Panjang (m)',
            'Diameter Ujung (cm)',
            'Diameter Pangkal (cm)',
            'Volume (m³)',
            'Mutu',
            'Input Oleh',
        ];
    }

    public function map($batang): array
    {
        return [
            $batang->pohon->kelompok->nama_kelompok ?? '-',
            $batang->pohon->tipe === 'barcode' ? 'Barcode' : 'Manual',
            $batang->pohon->no_pohon ?? '-',
            $batang->pohon->no_barcode ?? '-',
            $batang->created_at ? \Carbon\Carbon::parse($batang->created_at)->translatedFormat('d F Y H:i:s') : '-',
            $batang->pohon->petak->no_petak ?? '-',
            $batang->pohon->jenisPohon->nama_jenis ?? '-',
            $batang->no_batang,
            $batang->panjang,
            $batang->diameter_ujung,
            $batang->diameter_pangkal,
            $batang->volume,
            $batang->mutu,
            $batang->creator->name ?? 'Sistem'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true]],
        ];
    }
}
