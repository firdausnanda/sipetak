<?php

namespace Tests\Feature;

use App\Exports\DokumenAngkutanExport;
use App\Models\DokumenAngkutan;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Tests\TestCase;

class DokumenAngkutanExcelExportTest extends TestCase
{
    public function test_excel_export_accepts_a_document_number_with_a_slash(): void
    {
        $dokumen = new DokumenAngkutan([
            'no_dokumen' => '123/ANG/2026',
            'tanggal' => '2026-10-08',
        ]);
        $dokumen->setRelation('petaks', collect());
        $dokumen->setRelation('pohons', collect());

        $xlsx = Excel::raw(new DokumenAngkutanExport($dokumen), ExcelFormat::XLSX);

        $this->assertNotEmpty($xlsx);
    }
}
