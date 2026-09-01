<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Batang;
use App\Models\Kelompok;
use App\Models\Petak;

class DashboardController extends Controller
{
    private function buildQuery(Request $request)
    {
        $query = Batang::with(['pohon.kelompok', 'pohon.petak', 'pohon.jenisPohon', 'pohon.dokumenAngkutan', 'pohon.skshhk', 'creator'])
            ->select('batangs.*');

        $currentUser = auth()->user();

        if ($currentUser->hasRole('admin_kelompok') || $currentUser->hasRole('ganis')) {
            $query->whereHas('pohon', function ($q) use ($currentUser) {
                $q->where('kelompok_id', $currentUser->kelompok_id);
            });
        } elseif ($request->filled('kelompok_id')) {
            $query->whereHas('pohon', function ($q) use ($request) {
                $q->where('kelompok_id', $request->kelompok_id);
            });
        }

        if ($request->filled('petak_id')) {
            $query->whereHas('pohon', function ($q) use ($request) {
                $q->where('petak_id', $request->petak_id);
            });
        }

        if ($request->filled('start_date')) {
            $query->whereHas('pohon', function ($q) use ($request) {
                $q->where('tanggal', '>=', $request->start_date);
            });
        }

        if ($request->filled('end_date')) {
            $query->whereHas('pohon', function ($q) use ($request) {
                $q->where('tanggal', '<=', $request->end_date);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('pohon', function ($qPohon) use ($search) {
                $qPohon->whereHas('jenisPohon', function ($qJenis) use ($search) {
                    $qJenis->where('nama_jenis', 'like', "%{$search}%");
                })
                ->orWhereHas('petak', function ($qPetak) use ($search) {
                    $qPetak->where('no_petak', 'like', "%{$search}%");
                })
                ->orWhereHas('kelompok', function ($qKel) use ($search) {
                    $qKel->where('nama_kelompok', 'like', "%{$search}%");
                });
            });
        }

        // Advanced Search Filters
        if ($request->filled('no_barcode')) {
            $query->whereHas('pohon', function ($q) use ($request) {
                $q->where('no_barcode', 'like', "%{$request->no_barcode}%");
            });
        }

        if ($request->filled('no_pohon')) {
            $query->whereHas('pohon', function ($q) use ($request) {
                $q->where('no_pohon', 'like', "%{$request->no_pohon}%");
            });
        }

        if ($request->filled('no_batang')) {
            $query->where('no_batang', 'like', "%{$request->no_batang}%");
        }

        if ($request->filled('mutu')) {
            $query->where('mutu', $request->mutu);
        }

        return $query;
    }

    public function index(Request $request)
    {
        $query = $this->buildQuery($request);

        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');

        $batangColumns = ['no_batang', 'panjang', 'diameter_ujung', 'diameter_pangkal', 'mutu', 'created_at'];
        $pohonColumns = ['tanggal'];

        if (in_array($sort, $batangColumns)) {
            $query->orderBy("batangs.{$sort}", $direction);
        } elseif (in_array($sort, $pohonColumns)) {
            $query->join('pohons', 'batangs.pohon_id', '=', 'pohons.id')
                  ->orderBy("pohons.{$sort}", $direction);
        } else {
            $query->latest('batangs.created_at');
        }

        $perPage = $request->input('per_page', 10);
        $batangs = $query->paginate($perPage)->withQueryString();
        
        $currentUser = auth()->user();
        $kelompoksQuery = Kelompok::orderBy('nama_kelompok');
        $petaksQuery = Petak::orderBy('no_petak');

        if ($currentUser->hasRole('admin_kelompok') || $currentUser->hasRole('ganis')) {
            $kelompoksQuery->where('id', $currentUser->kelompok_id);
            $petaksQuery->where('kelompok_id', $currentUser->kelompok_id);
        }

        $kelompoks = $kelompoksQuery->get();
        $petaks = $petaksQuery->get();

        return Inertia::render('Admin/Dashboard', [
            'batangs' => $batangs,
            'kelompoks' => $kelompoks,
            'petaks' => $petaks,
            'filters' => $request->only(['kelompok_id', 'petak_id', 'start_date', 'end_date', 'sort', 'direction', 'search', 'per_page', 'no_barcode', 'no_pohon', 'no_batang', 'mutu'])
        ]);
    }

    public function export(Request $request)
    {
        $query = $this->buildQuery($request);
        
        $query->join('pohons', 'batangs.pohon_id', '=', 'pohons.id')
              ->orderBy('pohons.no_pohon', 'asc')
              ->orderBy('batangs.no_batang', 'asc');

        $filename = "laporan_hasil_tebangan_" . date('Y-m-d_H-i-s') . ".xlsx";
        
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\LaporanHasilTebanganExport($query), $filename);
    }

    public function updateBatang(Request $request, $id)
    {
        $request->validate([
            'no_batang' => 'required|string|max:255',
            'panjang' => 'required|numeric',
            'diameter_ujung' => 'required|numeric',
            'diameter_pangkal' => 'required|numeric',
            'volume' => 'required|numeric',
            'mutu' => 'required|string|in:P,D,T,M',
        ]);

        $batang = Batang::findOrFail($id);

        $currentUser = auth()->user();
        if ($currentUser->hasRole('admin_kelompok') || $currentUser->hasRole('ganis')) {
            $batang->load('pohon');
            if ($batang->pohon->kelompok_id != $currentUser->kelompok_id) {
                abort(403, 'Unauthorized action.');
            }
        }

        $batang->update([
            'no_batang' => $request->no_batang,
            'panjang' => $request->panjang,
            'diameter_ujung' => $request->diameter_ujung,
            'diameter_pangkal' => $request->diameter_pangkal,
            'volume' => $request->volume,
            'mutu' => $request->mutu,
        ]);

        return redirect()->back()->with('success', 'Data batang berhasil diperbarui.');
    }
}
