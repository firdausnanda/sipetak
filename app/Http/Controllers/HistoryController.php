<?php

namespace App\Http\Controllers;

use App\Models\Pohon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $filter = $request->has('filter') ? $request->query('filter') : 'today';
        $search = $request->query('search');

        $query = Pohon::with(['petak', 'jenisPohon'])
            ->where('kelompok_id', $user->kelompok_id);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('petak', function ($q2) use ($search) {
                    $q2->where('nama_petak', 'like', "%{$search}%");
                })->orWhereHas('jenisPohon', function ($q3) use ($search) {
                    $q3->where('nama_jenis', 'like', "%{$search}%");
                });
            });
        }

        if ($filter === 'today') {
            $query->whereDate('created_at', Carbon::today());
        } elseif ($filter === 'yesterday') {
            $query->whereDate('created_at', Carbon::yesterday());
        } elseif ($filter === 'this_week') {
            $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        }

        $pohons = $query->latest()->paginate(10);

        if ($request->wantsJson()) {
            return response()->json($pohons);
        }

        return Inertia::render('History', [
            'pohons' => $pohons,
            'filters' => ['filter' => $filter, 'search' => $search]
        ]);
    }

    public function show(Request $request, $id)
    {
        $pohon = Pohon::with(['petak', 'jenisPohon', 'kelompok', 'batangs'])->findOrFail($id);
        if ($pohon->kelompok_id !== $request->user()->kelompok_id) {
            abort(403);
        }
        return Inertia::render('History/Show', ['pohon' => $pohon]);
    }
}
