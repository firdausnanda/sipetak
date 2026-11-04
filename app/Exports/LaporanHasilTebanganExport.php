<?php

namespace App\Exports;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithCustomChunkSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanHasilTebanganExport implements FromQuery, WithHeadings, WithMapping, WithColumnWidths, WithStyles, WithCustomChunkSize
{
    protected Builder $query;

    public function __construct(Builder $query)
    {
        $this->query = $query;
    }

    /**
     * Data is read in chunks (see chunkSize) instead of loading every batang at once.
     */
    public function query()
    {
        return $this->query;
    }

    public function chunkSize(): int
    {
        return 500;
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
        $pohon = $batang->pohon;

        return [
            $pohon->kelompok->nama_kelompok ?? '-',
            $pohon?->tipe === 'barcode' ? 'Barcode' : 'Manual',
            $pohon->no_pohon ?? '-',
            $pohon->no_barcode ?? '-',
            $pohon && $pohon->tanggal ? Carbon::parse($pohon->tanggal)->translatedFormat('d F Y') : '-',
            $pohon->petak->no_petak ?? '-',
            $pohon->jenisPohon->nama_jenis ?? '-',
            $batang->no_batang,
            $batang->panjang,
            $batang->diameter_ujung,
            $batang->diameter_pangkal,
            $batang->volume,
            $batang->mutu,
            $batang->creator->name ?? 'Sistem',
        ];
    }

    /**
     * Fixed widths instead of ShouldAutoSize, which measures every cell.
     */
    public function columnWidths(): array
    {
        return [
            'A' => 25,
            'B' => 12,
            'C' => 12,
            'D' => 18,
            'E' => 18,
            'F' => 10,
            'G' => 20,
            'H' => 11,
            'I' => 12,
            'J' => 19,
            'K' => 21,
            'L' => 12,
            'M' => 8,
            'N' => 20,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
