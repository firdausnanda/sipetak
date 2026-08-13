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
    public function index(Request $request)
    {
        $query = Batang::with(['pohon.kelompok', 'pohon.petak', 'pohon.jenisPohon', 'creator'])
            ->select('batangs.*');

        if ($request->filled('kelompok_id')) {
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
        
        $kelompoks = Kelompok::orderBy('nama_kelompok')->get();
        // Fixing the column name from nama_petak to no_petak
        $petaks = Petak::orderBy('no_petak')->get();

        return Inertia::render('Admin/Dashboard', [
            'batangs' => $batangs,
            'kelompoks' => $kelompoks,
            'petaks' => $petaks,
            'filters' => $request->only(['kelompok_id', 'petak_id', 'start_date', 'end_date', 'sort', 'direction', 'search', 'per_page'])
        ]);
    }
}
