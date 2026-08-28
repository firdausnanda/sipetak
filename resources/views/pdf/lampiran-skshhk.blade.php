<!DOCTYPE html>
<html>

<head>
    <title>Lampiran SKSHHK</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
        }

        table {
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .table-rekap {
            font-size: 14px;
            margin: 0 auto 20px auto;
        }

        .table-rekap th,
        .table-rekap td {
            border: 1px solid #000;
            padding: 8px;
        }

        .table-detail {
            width: 100%;
            font-size: 12px;
        }

        .table-detail th,
        .table-detail td {
            border: 1px solid #000;
            padding: 5px;
        }

        th {
            background-color: #f3f4f6;
            text-align: center;
            font-weight: bold;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .page-break {
            page-break-before: always;
        }

        .header-table {
            margin-bottom: 20px;
            border: none;
            width: 100%;
        }

        .header-table td {
            vertical-align: middle;
            border: none;
        }

        .logo-box {
            width: 100px;
            height: 80px;
            border: 1px solid black;
            text-align: center;
            display: inline-block;
            padding-top: 20px;
            font-weight: bold;
        }

        .title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .doc-no {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 12px;
        }

        .doc-no-rekap {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 15px;
            text-align: left;
        }
    </style>
</head>

<body>
    @php
        $logoBase64 = null;
        if ($dokumen->kelompok && $dokumen->kelompok->logo_url) {
            $url = ltrim($dokumen->kelompok->logo_url, '/');
            if (file_exists(storage_path('app/public/' . $url))) {
                $logoPath = storage_path('app/public/' . $url);
            } elseif (file_exists(public_path($url))) {
                $logoPath = public_path($url);
            } elseif (file_exists(public_path('storage/' . $url))) {
                $logoPath = public_path('storage/' . $url);
            } else {
                $logoPath = null;
            }

            if ($logoPath) {
                $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                $data = file_get_contents($logoPath);
                $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }
    @endphp

    @foreach($skshhkData as $index => $data)
        @php
            $skshhk = $data['skshhk'];
            $rekap = $data['rekap'];
            $details = $data['details'];
        @endphp

        <!-- Page 1: Rekap -->
        <table style="width: 100%; border: none; margin-bottom: 20px;">
            <tr>
                <td style="width: 90%; vertical-align: top; border: none;">
                    <table style="width: 100%; border: none; font-size: 12px;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Pemegang Izin</td><td style="border: none; padding: 2px;">: {{ $dokumen && $dokumen->kelompok ? $dokumen->kelompok->nama_kelompok : '' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Alamat</td><td style="border: none; padding: 2px;">: {{ $dokumen && $dokumen->kelompok ? $dokumen->kelompok->alamat : '' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Nomor Telepon</td><td style="border: none; padding: 2px;">: -</td></tr>
                    </table>
                </td>
                <td style="width: 10%; vertical-align: top; border: none;"></td>
            </tr>
        </table>

        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-weight: bold; font-size: 14px;">REKAP MUTU DAN VOLUME TOTAL</div>
            <div style="font-weight: bold; font-size: 12px;">Nomor : {{ $skshhk->no_skshhk }}</div>
        </div>

        <table style="width: 100%; border: none; margin-bottom: 10px;">
            <tr>
                <td style="width: 90%; vertical-align: bottom; border: none;">
                    <table style="width: 100%; border: none; font-size: 12px;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Provinsi</td><td style="border: none; padding: 2px;">: {{ $dokumen && $dokumen->kelompok ? $dokumen->kelompok->provinsi : '' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Kabupaten/Kota</td><td style="border: none; padding: 2px;">: {{ $dokumen && $dokumen->kelompok ? $dokumen->kelompok->kabupaten_kota : '' }}</td></tr>
                    </table>
                </td>
                <td style="width: 10%; border: none;"></td>
            </tr>
        </table>

        <div style="width: 70%; margin: 0 auto;">
            <table class="table-rekap" style="width: 100%;">
                <thead>
                    <tr>
                        <th style="width: 10%;">NO</th>
                        <th colspan="2" style="width: 40%;">MUTU</th>
                        <th style="width: 25%;">JUMLAH</th>
                        <th style="width: 25%;">VOLUME</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $i = 1;
                        $totalJumlah = 0;
                        $totalVolume = 0;
                    @endphp
                    @foreach($rekap as $mutu => $subData)
                        @foreach(['AI', 'AII', 'AIII'] as $index => $subKat)
                        <tr>
                            @if($index === 0)
                            <td class="text-center" rowspan="3" style="vertical-align: middle;">{{ $i++ }}</td>
                            <td class="text-center" rowspan="3" style="vertical-align: middle;">{{ $mutu }}</td>
                            @endif
                            <td class="text-center">{{ $subKat }}</td>
                            <td class="text-center">{{ $subData[$subKat]['jumlah'] }}</td>
                            <td class="text-right">{{ number_format($subData[$subKat]['volume'], 2, '.', '') }}</td>
                        </tr>
                        @php
                            $totalJumlah += $subData[$subKat]['jumlah'];
                            $totalVolume += $subData[$subKat]['volume'];
                        @endphp
                        @endforeach
                    @endforeach
                    <tr>
                        <td colspan="3" class="text-center" style="font-weight: bold;">Total</td>
                        <td class="text-center" style="font-weight: bold;">{{ $totalJumlah }}</td>
                        <td class="text-right" style="font-weight: bold;">{{ number_format($totalVolume, 2, '.', '') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        @if(!isset($isExcel) || !$isExcel)
    <div class="page-break"></div>
    @endif

        <!-- Page 2+: Detail -->
        <table style="width: 100%; border: none; margin-bottom: 5px;">
            <tr>
                <td style="width: 90%; vertical-align: top; border: none;">
                    <table style="width: 100%; border: none; font-size: 12px;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Pemegang Izin</td><td style="border: none; padding: 2px;">: {{ $dokumen && $dokumen->kelompok ? $dokumen->kelompok->nama_kelompok : '' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Alamat</td><td style="border: none; padding: 2px;">: {{ $dokumen && $dokumen->kelompok ? $dokumen->kelompok->alamat : '' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Nomor Telepon</td><td style="border: none; padding: 2px;">: -</td></tr>
                    </table>
                </td>
                <td style="width: 10%; vertical-align: top; border: none;"></td>
            </tr>
        </table>

        <div style="text-align: center; margin-bottom: 5px;">
            <div style="font-weight: bold; font-size: 14px;">DAFTAR KAYU BULAT</div>
            <div style="font-weight: bold; font-size: 12px;">Nomor : {{ $skshhk->no_skshhk }}</div>
        </div>

        <table style="width: 100%; border: none; margin-bottom: 0px;">
            <tr>
                <td style="width: 50%; vertical-align: bottom; border: none;">
                    <table style="width: 100%; border: none; font-size: 12px; margin-bottom: 0px;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Provinsi</td><td style="border: none; padding: 2px;">: {{ $dokumen && $dokumen->kelompok ? $dokumen->kelompok->provinsi : '' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Kabupaten/Kota</td><td style="border: none; padding: 2px;">: {{ $dokumen && $dokumen->kelompok ? $dokumen->kelompok->kabupaten_kota : '' }}</td></tr>
                    </table>
                </td>
                <td style="width: 50%; border: none;"></td>
            </tr>
        </table>
        
        <table class="table-detail">
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 30%;">Id Barcode</th>
                    <th style="width: 15%;">Jenis</th>
                    <th style="width: 15%;">Panjang(m)</th>
                    <th style="width: 10%;">Diameter(cm)</th>
                    <th style="width: 15%;">Volume(m3)</th>
                    <th style="width: 10%;">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($details as $detail)
                    <tr>
                        <td class="text-center">{{ $detail['no'] }}</td>
                        <td>{{ $detail['id_barcode'] }}</td>
                        <td class="text-center">{{ $detail['jenis'] }}</td>
                        <td class="text-right">{{ number_format($detail['panjang'], 1, '.', '') }}</td>
                        <td class="text-center">{{ $detail['diameter'] }}</td>
                        <td class="text-right">{{ number_format($detail['volume'], 2, '.', '') }}</td>
                        <td class="text-center">{{ $detail['mutu'] }}</td>
                    </tr>
                @endforeach
                <tr>
                    <td colspan="5" class="text-center" style="font-weight: bold;">TOTAL</td>
                    <td class="text-right" style="font-weight: bold;">{{ number_format(collect($details)->sum('volume'), 2, '.', '') }}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>

        <table style="width: 100%; border: none; margin-top: 30px; page-break-inside: avoid;">
            <tr>
                <td style="width: 70%; border: none;"></td>
                <td style="width: 30%; border: none; text-align: center;">
                    <p style="margin: 0; padding: 0;">Penerbit,</p>
                    <div style="margin: 10px 0; min-height: 70px;">
                        @if ($dokumen && !empty($dokumen->penerbit->nama))
                            @if((!isset($isExcel) || !$isExcel) && $skshhk->verification_token)
                            <img src="data:image/svg+xml;base64,{!! base64_encode(
                                \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(70)->margin(0)->generate(route('verifikasi.show', $skshhk->verification_token)),
                            ) !!}" alt="QR Tanda Tangan">
                            @endif
                        @endif
                    </div>
                    <p style="margin: 0; padding: 0; font-weight: bold; text-decoration: underline;">
                        {{ $dokumen->penerbit->nama ?? '(Ganis PKB)' }}</p>
                    <p style="margin: 0; padding: 0;">No Reg: {{ $dokumen->penerbit->no_register ?? '....' }}</p>
                </td>
            </tr>
        </table>

        @if(!$loop->last)
            @if(!isset($isExcel) || !$isExcel)
    <div class="page-break"></div>
    @endif
        @endif
    @endforeach
</body>

</html>
