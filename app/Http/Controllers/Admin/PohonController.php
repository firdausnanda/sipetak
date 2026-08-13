<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JenisPohon;
use App\Models\Kelompok;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PohonController extends Controller
{
    public function index(Request $request)
    {
        $query = JenisPohon::with(['kelompok']);
        $currentUser = auth()->user();

        if ($currentUser->hasRole('admin_kelompok')) {
            $query->where('kelompok_id', $currentUser->kelompok_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nama_jenis', 'like', "%{$search}%");
        }

        if ($request->filled('kelompok_id')) {
            $query->where('kelompok_id', $request->kelompok_id);
        }

        $sort = $request->input('sort', 'nama_jenis');
        $direction = $request->input('direction', 'asc');
        $allowedSorts = ['nama_jenis', 'created_at'];

        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest();
        }
        
        $perPage = $request->input('per_page', 10);
        $jenisPohons = $query->paginate($perPage)->withQueryString();
        
        $kelompoksQuery = Kelompok::orderBy('nama_kelompok');
        if ($currentUser->hasRole('admin_kelompok')) {
            $kelompoksQuery->where('id', $currentUser->kelompok_id);
        }
        $kelompoks = $kelompoksQuery->get();

        return Inertia::render('Admin/Pohon/Index', [
            'jenisPohons' => $jenisPohons,
            'kelompoks' => $kelompoks,
            'filters' => $request->only(['search', 'per_page', 'kelompok_id', 'sort', 'direction'])
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = auth()->user();
        if ($currentUser->hasRole('admin_kelompok')) {
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'kelompok_id' => 'required|exists:kelompoks,id',
            'nama_jenis' => 'required|string|max:255',
        ]);

        JenisPohon::create($request->all());

        return redirect()->route('admin.pohons.index')->with('success', 'Jenis Pohon berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $jenisPohon = JenisPohon::findOrFail($id);
        $currentUser = auth()->user();

        if ($currentUser->hasRole('admin_kelompok')) {
            if ($jenisPohon->kelompok_id !== $currentUser->kelompok_id) {
                abort(403, 'Unauthorized access to data.');
            }
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'kelompok_id' => 'required|exists:kelompoks,id',
            'nama_jenis' => 'required|string|max:255',
        ]);

        $jenisPohon->update($request->all());

        return redirect()->route('admin.pohons.index')->with('success', 'Jenis Pohon berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $jenisPohon = JenisPohon::findOrFail($id);
        $currentUser = auth()->user();
        
        if ($currentUser->hasRole('admin_kelompok') && $jenisPohon->kelompok_id !== $currentUser->kelompok_id) {
            abort(403, 'Unauthorized access to data.');
        }

        $jenisPohon->delete();

        return redirect()->route('admin.pohons.index')->with('success', 'Jenis Pohon berhasil dihapus.');
    }
}
