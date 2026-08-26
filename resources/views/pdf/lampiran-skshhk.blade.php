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
        <div class="title" style="font-size: 18px; text-decoration: underline; margin-bottom: 20px; text-transform: uppercase;">
            Lampiran
        </div>

        <div style="width: 70%; margin: 0 auto;">
            <div class="title" style="font-size: 18px;">REKAP MUTU DAN VOLUME TOTAL</div>
            <div class="doc-no-rekap">
                No. SKSHHK : {{ $skshhk->no_skshhk }} ( {{ \Carbon\Carbon::parse($skshhk->tanggal)->translatedFormat('d F Y') }} )
            </div>
            
            <table class="table-rekap" style="width: 100%;">
                <thead>
                    <tr>
                        <th style="width: 15%;">NO</th>
                        <th style="width: 25%;">MUTU</th>
                        <th style="width: 30%;">JUMLAH</th>
                        <th style="width: 30%;">VOLUME</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $i = 1;
                        $totalJumlah = 0;
                        $totalVolume = 0;
                    @endphp
                    @foreach($rekap as $mutu => $mutuData)
                        <tr>
                            <td class="text-center">{{ $i++ }}</td>
                            <td class="text-center">{{ $mutu }}</td>
                            <td class="text-center">{{ $mutuData['jumlah'] }}</td>
                            <td class="text-right">{{ number_format($mutuData['volume'], 2, '.', '') }}</td>
                        </tr>
                        @php
                            $totalJumlah += $mutuData['jumlah'];
                            $totalVolume += $mutuData['volume'];
                        @endphp
                    @endforeach
                    <tr>
                        <td colspan="2" class="text-right" style="font-weight: bold;">TOTAL</td>
                        <td class="text-center" style="font-weight: bold;">{{ $totalJumlah }}</td>
                        <td class="text-right" style="font-weight: bold;">{{ number_format($totalVolume, 2, '.', '') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="page-break"></div>

        <!-- Page 2+: Detail -->
        <div class="title" style="font-size: 18px; text-decoration: underline; margin-bottom: 20px; text-transform: uppercase;">
            Lampiran
        </div>

        <div class="title" style="font-size: 16px;">DETAIL BARCODE</div>
        <div class="doc-no">
            No. SKSHHK : {{ $skshhk->no_skshhk }} ( {{ \Carbon\Carbon::parse($skshhk->tanggal)->translatedFormat('d F Y') }} )
        </div>
        
        <table class="table-detail">
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 30%;">Id Barcode</th>
                    <th style="width: 15%;">Jenis</th>
                    <th style="width: 15%;">Panjang(m)</th>
                    <th style="width: 10%;">Diameter(cm)</th>
                    <th style="width: 15%;">Volume(m3)</th>
                    <th style="width: 10%;">Mutu</th>
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
            </tbody>
        </table>

        @if(!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>

</html>
