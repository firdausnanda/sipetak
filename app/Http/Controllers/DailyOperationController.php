<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Regu;
use App\Models\WageRate;
use App\Models\DailyOperation;
use Illuminate\Support\Facades\DB;

class DailyOperationController extends Controller
{
    public function index(Request $request)
    {
        $query = DailyOperation::with(['regu', 'details.user']);

        if ($request->filled('search')) {
            $query->whereHas('regu', function($q) use ($request) {
                $q->where('nama_regu', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('tanggal_mulai') && $request->filled('tanggal_akhir')) {
            $query->whereBetween('tanggal', [$request->tanggal_mulai, $request->tanggal_akhir]);
        }

        $operations = $query->orderBy('tanggal', 'desc')->paginate(10)->withQueryString();

        return \Inertia\Inertia::render('Operations/Index', [
            'operations' => $operations,
            'filters' => $request->only(['search', 'tanggal_mulai', 'tanggal_akhir'])
        ]);
    }

    public function create()
    {
        $regus = Regu::with('members.user')->get();
        $wageRates = WageRate::all();
        return \Inertia\Inertia::render('Operations/Create', [
            'regus' => $regus,
            'wageRates' => $wageRates
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'regu_id' => 'required|exists:regus,id',
            'jumlah_pohon' => 'required|integer|min:0',
            'jumlah_batang' => 'required|integer|min:0',
            'total_volume' => 'required|numeric|min:0',
            'wage_rate_id' => 'required|exists:wage_rates,id'
        ]);

        DB::transaction(function () use ($request) {
            $regu = Regu::with('members')->findOrFail($request->regu_id);
            $wageRate = WageRate::findOrFail($request->wage_rate_id);
            
            $totalUpah = 0;
            $satuan = strtolower($wageRate->satuan_perhitungan);

            if ($satuan == 'pohon') {
                $totalUpah = $request->jumlah_pohon * $wageRate->tarif;
            } elseif ($satuan == 'batang') {
                $totalUpah = $request->jumlah_batang * $wageRate->tarif;
            } else {
                $totalUpah = $request->total_volume * $wageRate->tarif;
            }

            $operation = DailyOperation::create([
                'tanggal' => $request->tanggal,
                'regu_id' => $regu->id,
                'jumlah_pohon' => $request->jumlah_pohon,
                'jumlah_batang' => $request->jumlah_batang,
                'total_volume' => $request->total_volume,
                'total_upah_regu' => $totalUpah,
                'status' => 'pending'
            ]);

            foreach ($regu->members as $member) {
                $upahIndividu = $totalUpah * ($member->porsi_persentase / 100);
                $operation->details()->create([
                    'user_id' => $member->user_id,
                    'porsi_persentase' => $member->porsi_persentase,
                    'upah_individu' => $upahIndividu
                ]);
            }
        });

        return redirect()->route('operations.index')->with('success', 'Data kegiatan berhasil disimpan dan upah dihitung.');
    }

    public function markAsPaid($id)
    {
        $operation = DailyOperation::findOrFail($id);
        $operation->update([
            'status' => 'paid',
            'tanggal_pembayaran' => now()
        ]);

        return redirect()->back()->with('success', 'Status tagihan berhasil diubah menjadi Lunas.');
    }

    public function fetchResults(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'regu_id' => 'required|exists:regus,id'
        ]);

        $regu = Regu::findOrFail($request->regu_id);

        $pohons = \App\Models\Pohon::where('kelompok_id', $regu->kelompok_id)
            ->where('tanggal', $request->tanggal)
            ->get();

        $jumlah_pohon = $pohons->count();
        $pohonIds = $pohons->pluck('id');

        $jumlah_batang = \App\Models\Batang::whereIn('pohon_id', $pohonIds)->count();
        $total_volume = \App\Models\Batang::whereIn('pohon_id', $pohonIds)->sum('volume');

        return response()->json([
            'jumlah_pohon' => $jumlah_pohon,
            'jumlah_batang' => $jumlah_batang,
            'total_volume' => round($total_volume, 4)
        ]);
    }
}
