<?php

namespace App\Http\Controllers;

use App\Models\Petak;
use App\Models\JenisPohon;
use App\Models\Kelompok;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $petaks = Petak::where('kelompok_id', $user->kelompok_id)->get();
        $jenisPohons = JenisPohon::where('kelompok_id', $user->kelompok_id)->get();
        $kelompok = Kelompok::find($user->kelompok_id);

        $today = \Carbon\Carbon::today();

        $prestasiHariIni = \App\Models\Pohon::leftJoin('batangs', 'pohons.id', '=', 'batangs.pohon_id')
            ->where('pohons.created_by', $user->id)
            ->whereDate('pohons.created_at', $today)
            ->select(
                \Illuminate\Support\Facades\DB::raw('COUNT(DISTINCT pohons.id) as jumlah_pohon'),
                \Illuminate\Support\Facades\DB::raw('COUNT(batangs.id) as jumlah_batang'),
                \Illuminate\Support\Facades\DB::raw('SUM(batangs.volume) as total_volume'),
                \Illuminate\Support\Facades\DB::raw("COUNT(DISTINCT CASE WHEN pohons.status_upah = 'lunas' THEN pohons.id END) as pohon_lunas"),
                \Illuminate\Support\Facades\DB::raw("COUNT(DISTINCT CASE WHEN pohons.status_upah != 'lunas' OR pohons.status_upah IS NULL THEN pohons.id END) as pohon_pending")
            )->first();

        $prestasiBulanIni = \App\Models\Pohon::leftJoin('batangs', 'pohons.id', '=', 'batangs.pohon_id')
            ->where('pohons.created_by', $user->id)
            ->whereYear('pohons.created_at', $today->year)
            ->whereMonth('pohons.created_at', $today->month)
            ->select(
                \Illuminate\Support\Facades\DB::raw('COUNT(DISTINCT pohons.id) as jumlah_pohon'),
                \Illuminate\Support\Facades\DB::raw('COUNT(batangs.id) as jumlah_batang'),
                \Illuminate\Support\Facades\DB::raw('SUM(batangs.volume) as total_volume'),
                \Illuminate\Support\Facades\DB::raw("COUNT(DISTINCT CASE WHEN pohons.status_upah = 'lunas' THEN pohons.id END) as pohon_lunas"),
                \Illuminate\Support\Facades\DB::raw("COUNT(DISTINCT CASE WHEN pohons.status_upah != 'lunas' OR pohons.status_upah IS NULL THEN pohons.id END) as pohon_pending")
            )->first();

        return Inertia::render('Dashboard', [
            'petaks' => $petaks,
            'jenisPohons' => $jenisPohons,
            'namaKelompok' => $kelompok ? $kelompok->nama_kelompok : 'Belum Ada Kelompok',
            'prestasiHariIni' => $prestasiHariIni,
            'prestasiBulanIni' => $prestasiBulanIni,
        ]);
    }

    public function prestasiKerja(Request $request)
    {
        $user = $request->user();
        
        $query = \App\Models\Pohon::leftJoin('batangs', 'pohons.id', '=', 'batangs.pohon_id')
            ->where('pohons.created_by', $user->id)
            ->select(
                \Illuminate\Support\Facades\DB::raw('DATE(pohons.created_at) as tanggal'),
                \Illuminate\Support\Facades\DB::raw('COUNT(DISTINCT pohons.id) as jumlah_pohon'),
                \Illuminate\Support\Facades\DB::raw('COUNT(batangs.id) as jumlah_batang'),
                \Illuminate\Support\Facades\DB::raw('SUM(batangs.volume) as total_volume'),
                \Illuminate\Support\Facades\DB::raw("COUNT(DISTINCT CASE WHEN pohons.status_upah = 'lunas' THEN pohons.id END) as pohon_lunas"),
                \Illuminate\Support\Facades\DB::raw("COUNT(DISTINCT CASE WHEN pohons.status_upah != 'lunas' OR pohons.status_upah IS NULL THEN pohons.id END) as pohon_pending")
            )
            ->groupByRaw('DATE(pohons.created_at)');

        // default to current month if no filter
        $bulanFilter = $request->input('bulan', date('Y-m'));
        $month = date('m', strtotime($bulanFilter));
        $year = date('Y', strtotime($bulanFilter));
        $query->whereMonth('pohons.created_at', $month)->whereYear('pohons.created_at', $year);

        $operationsRaw = $query->orderByRaw('DATE(pohons.created_at) DESC')->paginate(15)->withQueryString();

        return Inertia::render('PrestasiKerja', [
            'operations' => $operationsRaw,
            'filters' => ['bulan' => $bulanFilter]
        ]);
    }
}
