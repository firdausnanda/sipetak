<?php

namespace App\Exports;

use RuntimeException;
use XMLWriter;
use ZipArchive;

class StreamingXlsxWriter
{
    public function write(LaporanHasilTebanganExport $export): string
    {
        $sheetPath = tempnam(sys_get_temp_dir(), 'sipetak_sheet_');
        $xlsxPath = tempnam(sys_get_temp_dir(), 'sipetak_xlsx_');

        if ($sheetPath === false || $xlsxPath === false) {
            if ($sheetPath !== false) {
                @unlink($sheetPath);
            }
            if ($xlsxPath !== false) {
                @unlink($xlsxPath);
            }
            throw new RuntimeException('Tidak dapat membuat file sementara untuk ekspor Excel.');
        }

        try {
            $this->writeSheet($sheetPath, $export);
            $this->writeArchive($xlsxPath, $sheetPath);

            return $xlsxPath;
        } catch (\Throwable $e) {
            @unlink($xlsxPath);
            throw $e;
        } finally {
            @unlink($sheetPath);
        }
    }

    private function writeSheet(string $path, LaporanHasilTebanganExport $export): void
    {
        $xml = new XMLWriter;
        if (! $xml->openUri($path)) {
            throw new RuntimeException('Tidak dapat menulis lembar kerja Excel.');
        }

        $xml->startDocument('1.0', 'UTF-8');
        $xml->startElement('worksheet');
        $xml->writeAttribute('xmlns', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
        $xml->startElement('cols');
        foreach (array_values($export->columnWidths()) as $index => $width) {
            $xml->startElement('col');
            $xml->writeAttribute('min', (string) ($index + 1));
            $xml->writeAttribute('max', (string) ($index + 1));
            $xml->writeAttribute('width', (string) $width);
            $xml->writeAttribute('customWidth', '1');
            $xml->endElement();
        }
        $xml->endElement();
        $xml->startElement('sheetData');

        $this->writeRow($xml, 1, $export->headings(), true);
        $rowNumber = 2;
        $export->query()->chunk($export->chunkSize(), function ($batangs) use ($xml, $export, &$rowNumber) {
            foreach ($batangs as $batang) {
                $this->writeRow($xml, $rowNumber++, $export->map($batang));
            }
            $xml->flush();
        });

        $xml->endElement();
        $xml->endElement();
        $xml->endDocument();
        $xml->flush();
    }

    private function writeRow(XMLWriter $xml, int $number, array $values, bool $heading = false): void
    {
        $xml->startElement('row');
        $xml->writeAttribute('r', (string) $number);

        foreach (array_values($values) as $index => $value) {
            if ($value === null) {
                continue;
            }

            $xml->startElement('c');
            $xml->writeAttribute('r', chr(65 + $index).$number);
            if ($heading) {
                $xml->writeAttribute('s', '1');
            }

            if (! $heading && $index >= 8 && $index <= 11 && is_numeric($value)) {
                $xml->writeAttribute('t', 'n');
                $xml->writeElement('v', (string) $value);
            } else {
                $xml->writeAttribute('t', 'inlineStr');
                $xml->startElement('is');
                $xml->startElement('t');
                $xml->text((string) $value);
                $xml->endElement();
                $xml->endElement();
            }
            $xml->endElement();
        }

        $xml->endElement();
    }

    private function writeArchive(string $path, string $sheetPath): void
    {
        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Tidak dapat membuat arsip Excel.');
        }

        $zip->addFromString('[Content_Types].xml', <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>
XML);
        $zip->addFromString('_rels/.rels', <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>
XML);
        $zip->addFromString('xl/workbook.xml', <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Laporan Hasil Tebangan" sheetId="1" r:id="rId1"/></sheets></workbook>
XML);
        $zip->addFromString('xl/_rels/workbook.xml.rels', <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>
XML);
        $zip->addFromString('xl/styles.xml', <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>
XML);
        if (! $zip->addFile($sheetPath, 'xl/worksheets/sheet1.xml')) {
            throw new RuntimeException('Tidak dapat menambahkan lembar kerja ke file Excel.');
        }

        if (! $zip->close()) {
            throw new RuntimeException('Tidak dapat menyelesaikan file Excel.');
        }
    }
}
