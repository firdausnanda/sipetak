<?php

namespace Tests\Feature;

use App\Exports\LampiranSkshhkExport;
use App\Models\DokumenAngkutan;
use App\Models\Skshhk;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class LampiranSkshhkExcelExportTest extends TestCase
{
    public function test_excel_sheet_uses_the_sanitized_skshhk_number(): void
    {
        $dokumen = new DokumenAngkutan();
        $skshhk = new Skshhk(['no_skshhk' => '123/ABC/2026']);
        $export = new LampiranSkshhkExport($dokumen, [[
            'skshhk' => $skshhk,
            'rekap' => [],
            'details' => [],
        ]]);

        $path = tempnam(sys_get_temp_dir(), 'skshhk-export-');

        try {
            file_put_contents($path, Excel::raw($export, ExcelFormat::XLSX));
            $spreadsheet = IOFactory::load($path);

            $this->assertSame('Lampiran 123_ABC_2026', $spreadsheet->getActiveSheet()->getTitle());
        } finally {
            unlink($path);
        }
    }
}
