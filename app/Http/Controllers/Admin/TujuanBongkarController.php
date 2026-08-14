<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TujuanBongkar;
use App\Models\Kelompok;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TujuanBongkarController extends Controller
{
    public function index(Request $request)
    {
        $query = TujuanBongkar::with(['kelompok']);
        $currentUser = auth()->user();

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $query->where('kelompok_id', $currentUser->kelompok_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nama_tpk', 'like', "%{$search}%");
        }

        if ($request->filled('kelompok_id')) {
            $query->where('kelompok_id', $request->kelompok_id);
        }

        $sort = $request->input('sort', 'nama_tpk');
        $direction = $request->input('direction', 'asc');
        $allowedSorts = ['nama_tpk', 'created_at'];

        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest();
        }
        
        $perPage = $request->input('per_page', 10);
        $tujuanBongkars = $query->paginate($perPage)->withQueryString();
        
        $kelompoksQuery = Kelompok::orderBy('nama_kelompok');
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $kelompoksQuery->where('id', $currentUser->kelompok_id);
        }
        $kelompoks = $kelompoksQuery->get();

        return Inertia::render('Admin/TujuanBongkar/Index', [
            'tujuanBongkars' => $tujuanBongkars,
            'kelompoks' => $kelompoks,
            'filters' => $request->only(['search', 'per_page', 'kelompok_id', 'sort', 'direction'])
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = auth()->user();
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'kelompok_id' => 'required|exists:kelompoks,id',
            'nama_tpk' => 'required|string|max:255',
            'titik_koordinat' => 'nullable|string|max:255',
        ]);

        TujuanBongkar::create($request->all());

        return redirect()->route('admin.tujuan_bongkars.index')->with('success', 'Tujuan Bongkar berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $tujuanBongkar = TujuanBongkar::findOrFail($id);
        $currentUser = auth()->user();

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            if ($tujuanBongkar->kelompok_id !== $currentUser->kelompok_id) {
                abort(403, 'Unauthorized access to data.');
            }
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'kelompok_id' => 'required|exists:kelompoks,id',
            'nama_tpk' => 'required|string|max:255',
            'titik_koordinat' => 'nullable|string|max:255',
        ]);

        $tujuanBongkar->update($request->all());

        return redirect()->route('admin.tujuan_bongkars.index')->with('success', 'Tujuan Bongkar berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $tujuanBongkar = TujuanBongkar::findOrFail($id);
        $currentUser = auth()->user();
        
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis']) && $tujuanBongkar->kelompok_id !== $currentUser->kelompok_id) {
            abort(403, 'Unauthorized access to data.');
        }

        $tujuanBongkar->delete();

        return redirect()->route('admin.tujuan_bongkars.index')->with('success', 'Tujuan Bongkar berhasil dihapus.');
    }
}
