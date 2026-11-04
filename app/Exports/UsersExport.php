<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UsersExport implements FromCollection, WithHeadings, WithMapping, WithColumnWidths, WithStyles
{
    public const COLUMNS = [
        'name' => 'Nama Pengguna',
        'username' => 'Username',
        'email' => 'Email',
        'role' => 'Peran',
        'kelompok' => 'Kelompok',
        'status_verifikasi' => 'Status Verifikasi',
        'created_by' => 'Dibuat Oleh',
        'created_at' => 'Tanggal Dibuat',
        'updated_at' => 'Terakhir Diperbarui',
    ];

    public const COLUMN_WIDTHS = [
        'name' => 25,
        'username' => 18,
        'email' => 30,
        'role' => 20,
        'kelompok' => 25,
        'status_verifikasi' => 20,
        'created_by' => 20,
        'created_at' => 22,
        'updated_at' => 22,
    ];

    protected Collection $users;
    protected array $columns;
    protected int $rowNumber = 0;

    public function __construct(Collection $users, array $columns = [])
    {
        $this->users = $users;
        // Keep the canonical column order regardless of the order requested
        $this->columns = array_values(array_intersect(array_keys(self::COLUMNS), $columns ?: array_keys(self::COLUMNS)));
    }

    public function collection()
    {
        return $this->users;
    }

    public function columns(): array
    {
        return $this->columns;
    }

    public function headings(): array
    {
        return array_merge(['No'], array_map(fn ($column) => self::COLUMNS[$column], $this->columns));
    }

    public function map($user): array
    {
        $values = [
            'name' => $user->name,
            'username' => $user->username ?? '-',
            'email' => $user->email,
            'role' => $user->roles->pluck('name')->map(fn ($role) => strtoupper(str_replace('_', ' ', $role)))->implode(', ') ?: '-',
            'kelompok' => $user->kelompok->nama_kelompok ?? '-',
            'status_verifikasi' => $user->email_verified_at ? 'Terverifikasi' : 'Belum Terverifikasi',
            'created_by' => $user->creator->name ?? 'Sistem',
            'created_at' => $user->created_at ? $user->created_at->translatedFormat('d F Y H:i') : '-',
            'updated_at' => $user->updated_at ? $user->updated_at->translatedFormat('d F Y H:i') : '-',
        ];

        return array_merge([++$this->rowNumber], array_map(fn ($column) => $values[$column], $this->columns));
    }

    /**
     * Fixed widths instead of ShouldAutoSize, which measures every cell.
     */
    public function columnWidths(): array
    {
        $widths = ['A' => 6];
        foreach ($this->columns as $index => $column) {
            $widths[Coordinate::stringFromColumnIndex($index + 2)] = self::COLUMN_WIDTHS[$column];
        }

        return $widths;
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        $sheet->getStyle("A1:{$lastColumn}{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
