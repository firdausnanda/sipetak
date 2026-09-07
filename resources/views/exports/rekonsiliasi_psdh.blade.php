<table>
    <tr>
        <th colspan="14" style="text-align: center; font-weight: bold;">Kertas Kerja Rekonsiliasi Pembayaran PSDH</th>
    </tr>
    <tr>
        <th colspan="14" style="text-align: center; font-weight: bold;">{{ $kelompokName }}</th>
    </tr>
    <tr>
        <th colspan="14" style="text-align: center; font-weight: bold;">{{ $periode }}</th>
    </tr>
    <tr>
        <th colspan="14"></th>
    </tr>
    <tr>
        <th colspan="7" style="text-align: center; font-weight: bold; border: 1px solid black;">Kewajiban PSDH Berdasarkan LHP-Kayu</th>
        <th colspan="5" style="text-align: center; font-weight: bold; border: 1px solid black;">Realisasi Pembayaran PSDH</th>
        <th rowspan="2" style="text-align: center; font-weight: bold; border: 1px solid black;">Selisih<br>Pembayaran<br>PSDH</th>
        <th rowspan="2" style="text-align: center; font-weight: bold; border: 1px solid black;">Keterangan</th>
    </tr>
    <tr>
        <th style="font-weight: bold; border: 1px solid black;">Nomor LHP Kayu</th>
        <th style="font-weight: bold; border: 1px solid black;">Tanggal</th>
        <th style="font-weight: bold; border: 1px solid black;">Jenis Kayu dan Sortimen</th>
        <th style="font-weight: bold; border: 1px solid black;">Volume</th>
        <th style="font-weight: bold; border: 1px solid black;">Tarif</th>
        <th style="font-weight: bold; border: 1px solid black;">PSDH</th>
        <th style="font-weight: bold; border: 1px solid black;">Total</th>
        <th style="font-weight: bold; border: 1px solid black;">Kode Billing</th>
        <th style="font-weight: bold; border: 1px solid black;">Tanggal Kode Biling</th>
        <th style="font-weight: bold; border: 1px solid black;">Tanggal Bayar</th>
        <th style="font-weight: bold; border: 1px solid black;">NTPN</th>
        <th style="font-weight: bold; border: 1px solid black;">Jumlah</th>
    </tr>
    
    @php
        $grandTotalPsdh = 0;
        $grandTotalJumlah = 0;
    @endphp

    @foreach($groupedLhps as $tanggal => $lhps)
        @php
            $subTotalPsdh = 0;
            $subTotalJumlah = 0;
        @endphp
        
        @foreach($lhps as $index => $lhp)
            @php
                $subTotalPsdh += $lhp->psdh;
                $jumlahPnbp = $lhp->pnbp ? $lhp->pnbp->jumlah : 0;
                $subTotalJumlah += $jumlahPnbp;
                
                $grandTotalPsdh += $lhp->psdh;
                $grandTotalJumlah += $jumlahPnbp;
            @endphp
            <tr>
                <!-- Print Nomor LHP and Tanggal on every row -->
                <td style="border: 1px solid black;">{{ $lhp->no_lhp }}</td>
                <td style="border: 1px solid black;">{{ $lhp->tanggal ? \Carbon\Carbon::parse($lhp->tanggal)->format('d/m/Y') : '' }}</td>
                <td style="border: 1px solid black;">{{ $lhp->jenisPohon->nama_jenis ?? '' }} {{ $lhp->sortimen }}</td>
                <td style="border: 1px solid black;">{{ str_replace('.', ',', (float) round($lhp->volume, 2)) }}</td>
                <td style="border: 1px solid black;">Rp {{ number_format($lhp->tarif, 0, ',', '.') }}</td>
                <td style="border: 1px solid black;">Rp {{ number_format($lhp->psdh, 0, ',', '.') }}</td>
                <td style="border: 1px solid black;"></td>
                <td style="border: 1px solid black; mso-number-format:'\@';">{{ $lhp->pnbp?->kode_billing ?? '' }}</td>
                <td style="border: 1px solid black;">{{ $lhp->pnbp?->tanggal_kode_billing ? \Carbon\Carbon::parse($lhp->pnbp->tanggal_kode_billing)->format('d/m/Y') : '' }}</td>
                <td style="border: 1px solid black;">{{ $lhp->pnbp?->tanggal_bayar ? \Carbon\Carbon::parse($lhp->pnbp->tanggal_bayar)->format('d/m/Y') : '' }}</td>
                <td style="border: 1px solid black; mso-number-format:'\@';">{{ $lhp->pnbp?->ntpn ?? '' }}</td>
                <td style="border: 1px solid black;">{{ $lhp->pnbp?->jumlah ? 'Rp ' . number_format($lhp->pnbp->jumlah, 0, ',', '.') : '' }}</td>
                <td style="border: 1px solid black;"></td>{{-- Selisih diisi di baris Sub Total --}}
                <td style="border: 1px solid black;">{{ $lhp->pnbp?->keterangan ?? '' }}</td>
            </tr>
        @endforeach
        
        @php
            $selisih = $subTotalPsdh - $subTotalJumlah;
        @endphp
        <tr>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black; font-weight: bold;">Sub Total</td>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black; font-weight: bold;">Rp {{ number_format($subTotalPsdh, 0, ',', '.') }}</td>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black;"></td>
            <td style="border: 1px solid black; font-weight: bold;">Sub Total</td>
            <td style="border: 1px solid black; font-weight: bold;">Rp {{ number_format($subTotalJumlah, 0, ',', '.') }}</td>
            <td style="border: 1px solid black; font-weight: bold;">Rp {{ number_format($selisih, 0, ',', '.') }}</td>
            <td style="border: 1px solid black;"></td>
        </tr>
    @endforeach

    <tr>
        <td colspan="6" style="text-align: center; font-weight: bold; border: 1px solid black;">TOTAL</td>
        <td style="font-weight: bold; border: 1px solid black;">Rp {{ number_format($grandTotalPsdh, 0, ',', '.') }}</td>
        <td colspan="4" style="text-align: center; font-weight: bold; border: 1px solid black;">TOTAL</td>
        <td style="font-weight: bold; border: 1px solid black;">Rp {{ number_format($grandTotalJumlah, 0, ',', '.') }}</td>
        <td style="border: 1px solid black;"></td>
        <td style="border: 1px solid black;"></td>
    </tr>
</table>
