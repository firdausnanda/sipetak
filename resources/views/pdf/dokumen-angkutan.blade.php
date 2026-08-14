<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dokumen Angkutan Kayu - {{ $dokumen->no_dokumen }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table {
            margin-bottom: 20px;
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
            font-size: 16px;
        }
        .form-table {
            border: 1px solid black;
        }
        .form-table td {
            border: 1px solid black;
            padding: 8px 12px;
            vertical-align: top;
            width: 50%;
        }
        .form-label {
            margin-bottom: 5px;
        }
        .form-data {
            margin-left: 20px;
        }
        .table-batang {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table-batang th, .table-batang td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>

    <!-- Cover Page -->
    <table class="header-table">
        <tr>
            <td style="width: 120px; text-align: center;">
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

                @if($logoBase64)
                    <img src="{{ $logoBase64 }}" style="max-width: 100px; max-height: 100px; width: auto; height: auto;" alt="Logo KTH">
                @else
                    <div class="logo-box">
                        LOGO<br>KTH
                    </div>
                @endif
            </td>
            <td>
                <div class="title">
                    KELOMPOK TANI HUTAN {{ strtoupper($dokumen->kelompok->nama_kelompok ?? '....................') }}<br>
                    DOKUMEN ANGKUTAN KAYU
                </div>
                <div style="margin-top: 10px; text-align: center;">
                    NOMOR DOKUMEN : {{ $dokumen->no_dokumen }}
                </div>
            </td>
        </tr>
    </table>

    <table class="form-table">
        <tr>
            <td>
                <div class="form-label">1. Pengirim</div>
                <div class="form-data">
                    <table style="width: 100%; border: none;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Nama</td><td style="border: none; padding: 2px;">: KTH {{ $dokumen->kelompok->nama_kelompok ?? '....' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Nomor Petak</td><td style="border: none; padding: 2px;">: {{ $dokumen->petaks->pluck('no_petak')->join(', ') ?: '....' }}</td></tr>
                    </table>
                </div>
            </td>
            <td>
                <div class="form-label">6. Tujuan bongkar TPK KTH {{ $dokumen->tujuanBongkar->nama_tpk ?? '....' }}</div>
                <div class="form-data">
                    <table style="width: 100%; border: none;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Titik Koordinat</td><td style="border: none; padding: 2px;">: {{ $dokumen->tujuanBongkar->titik_koordinat ?? '....' }}</td></tr>
                    </table>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                @php
                    $jenisKayu = $dokumen->pohons->map(function($p) { return $p->jenisPohon->nama_jenis ?? '-'; })->unique()->join(', ');
                    $jumlahBatang = 0;
                    foreach($dokumen->pohons as $p) {
                        $jumlahBatang += count($p->batangs);
                    }
                @endphp
                <div class="form-label">2. Kayu yang diangkut</div>
                <div class="form-data">
                    <table style="width: 100%; border: none;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Jenis kayu</td><td style="border: none; padding: 2px;">: {{ $jenisKayu ?: '....' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Jumlah batang</td><td style="border: none; padding: 2px;">: {{ $jumlahBatang }}</td></tr>
                    </table>
                </div>
            </td>
            <td rowspan="3">
                <div class="form-label">7. Penerbitan dokumen ini</div>
                <div class="form-data">
                    <table style="width: 100%; border: none;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Tanggal</td><td style="border: none; padding: 2px;">: {{ \Carbon\Carbon::parse($dokumen->tanggal)->locale('id')->translatedFormat('d F Y') }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Nama penerbit</td><td style="border: none; padding: 2px;">: {{ $dokumen->penerbit->nama ?? '(Ganis PKB)' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Nomor register</td><td style="border: none; padding: 2px;">: {{ $dokumen->penerbit->no_register ?? '....' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Tanda Tangan</td><td style="border: none; padding: 2px; height: 80px;">: </td></tr>
                    </table>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="form-label">3. Alat angkut</div>
                <div class="form-data">
                    <table style="width: 100%; border: none;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Jenis</td><td style="border: none; padding: 2px;">: {{ $dokumen->jenis_angkutan ?? 'Truk' }}</td></tr>
                        <tr><td style="border: none; padding: 2px;">Nopol</td><td style="border: none; padding: 2px;">: {{ $dokumen->nopol_angkutan ?? '....' }}</td></tr>
                    </table>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="form-label">4. Masa Berlaku</div>
                <div class="form-data">
                    <table style="width: 100%; border: none;">
                        <tr><td style="border: none; padding: 2px; width: 100px;">Tanggal</td><td style="border: none; padding: 2px;">: {{ \Carbon\Carbon::parse($dokumen->tanggal)->locale('id')->translatedFormat('d F Y') }}</td></tr>
                        <tr><td style="border: none; padding: 2px; width: 100px;">Berlaku</td><td style="border: none; padding: 2px;">: {{ $dokumen->masa_berlaku_hari ?? 1 }} Hari</td></tr>
                    </table>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="form-label">5. Daftar kayu terlampir</div>
            </td>
            <td>
                <div class="form-label">8. Telah diterima di TPK</div>
                <div class="form-data" style="margin-left: 20px;">
                    <table style="width: 100%; border: none;">
                        <tr><td style="border: none; padding: 2px; width: 120px;">Tanggal</td><td style="border: none; padding: 2px;">: </td></tr>
                        <tr><td style="border: none; padding: 2px;">Oleh</td><td style="border: none; padding: 2px;">: </td></tr>
                        <tr><td style="border: none; padding: 2px;">Jumlah batang</td><td style="border: none; padding: 2px;">: sesuai / tidak sesuai*)</td></tr>
                        <tr><td style="border: none; padding: 2px;">Tanda tangan</td><td style="border: none; padding: 2px; height: 60px;">: </td></tr>
                    </table>
                    <div style="font-size: 11px; margin-top: 5px;">*) coret yg tidak perlu</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Halaman Lampiran (Page Break) -->
    <div class="page-break"></div>

    <div style="text-align: center; margin-bottom: 20px;">
        <h3>DAFTAR KAYU TERLAMPIR</h3>
        <p>Nomor Dokumen: {{ $dokumen->no_dokumen }}</p>
    </div>

    @foreach($dokumen->pohons as $index => $pohon)
        <div style="margin-top: 20px; font-weight: bold;">
            Pohon #{{ $index + 1 }} - Barcode: {{ $pohon->no_barcode ?? $pohon->no_pohon ?? 'Tanpa Barcode' }} 
            (Jenis: {{ $pohon->jenisPohon->nama_jenis ?? '-' }}, Petak: {{ $pohon->petak->no_petak ?? '-' }})
        </div>
        
        @if($pohon->batangs->count() > 0)
            <table class="table-batang">
                <thead>
                    <tr>
                        <th>No. Batang</th>
                        <th>Panjang (m)</th>
                        <th>D. Pangkal (cm)</th>
                        <th>D. Ujung (cm)</th>
                        <th>Mutu</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($pohon->batangs as $batang)
                        <tr>
                            <td>{{ $batang->no_batang }}</td>
                            <td>{{ $batang->panjang }}</td>
                            <td>{{ $batang->diameter_pangkal }}</td>
                            <td>{{ $batang->diameter_ujung }}</td>
                            <td>{{ $batang->mutu }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p style="text-align: center; font-style: italic; border: 1px solid #ccc; padding: 10px;">Belum ada data ukuran batang.</p>
        @endif
    @endforeach

</body>
</html>
