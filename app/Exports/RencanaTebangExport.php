<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\DefaultValueBinder;

class RencanaTebangExport extends DefaultValueBinder implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles, WithEvents, WithCustomValueBinder
{
    public const COLUMNS = [
        'kelompok' => 'Kelompok',
        'petak' => 'Petak',
        'jenis_pohon' => 'Jenis Pohon',
        'no_pohon' => 'No Pohon',
        'no_barcode' => 'Barcode',
        'created_at' => 'Tanggal Dibuat',
        'updated_at' => 'Terakhir Diperbarui',
    ];

    private array $columns;
    private int $rowNumber = 0;

    public function __construct(private Builder $records, array $columns = [])
    {
        $this->columns = array_values(array_intersect(array_keys(self::COLUMNS), $columns ?: array_keys(self::COLUMNS)));
    }

    public function query(): Builder
    {
        return $this->records;
    }

    public function headings(): array
    {
        return array_merge(['No'], array_map(fn ($column) => self::COLUMNS[$column], $this->columns));
    }

    public function map($record): array
    {
        $values = [
            'kelompok' => $record->kelompok?->nama_kelompok ?? '-',
            'petak' => $record->petak?->no_petak ?? '-',
            'jenis_pohon' => $record->jenisPohon?->nama_jenis ?? '-',
            'no_pohon' => $record->no_pohon,
            'no_barcode' => $record->no_barcode ?? '-',
            'created_at' => $record->created_at?->format('d/m/Y H:i') ?? '-',
            'updated_at' => $record->updated_at?->format('d/m/Y H:i') ?? '-',
        ];

        return array_merge([++$this->rowNumber], array_map(fn ($column) => $values[$column], $this->columns));
    }

    public function bindValue(Cell $cell, $value)
    {
        if (is_string($value)) {
            $cell->setValueExplicit($value, DataType::TYPE_STRING);

            return true;
        }

        return parent::bindValue($cell, $value);
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '1B4332']],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $sheet->freezePane('A2');
                $sheet->setAutoFilter('A1:' . $sheet->getHighestColumn() . $sheet->getHighestRow());
            },
        ];
    }
}
