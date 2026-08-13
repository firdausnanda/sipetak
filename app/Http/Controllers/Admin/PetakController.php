<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Petak;
use App\Models\Kelompok;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PetakController extends Controller
{
    public function index(Request $request)
    {
        $query = Petak::with(['kelompok']);
        $currentUser = auth()->user();

        if ($currentUser->hasRole('admin_kelompok')) {
            $query->where('kelompok_id', $currentUser->kelompok_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('no_petak', 'like', "%{$search}%");
        }

        if ($request->filled('kelompok_id')) {
            $query->where('kelompok_id', $request->kelompok_id);
        }

        $sort = $request->input('sort', 'no_petak');
        $direction = $request->input('direction', 'asc');
        $allowedSorts = ['no_petak', 'created_at'];

        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest();
        }
        
        $perPage = $request->input('per_page', 10);
        $petaks = $query->paginate($perPage)->withQueryString();
        
        $kelompoksQuery = Kelompok::orderBy('nama_kelompok');
        if ($currentUser->hasRole('admin_kelompok')) {
            $kelompoksQuery->where('id', $currentUser->kelompok_id);
        }
        $kelompoks = $kelompoksQuery->get();

        return Inertia::render('Admin/Petak/Index', [
            'petaks' => $petaks,
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
            'no_petak' => 'required|string|max:255',
        ]);

        Petak::create($request->all());

        return redirect()->route('admin.petaks.index')->with('success', 'Petak berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $petak = Petak::findOrFail($id);
        $currentUser = auth()->user();

        if ($currentUser->hasRole('admin_kelompok')) {
            if ($petak->kelompok_id !== $currentUser->kelompok_id) {
                abort(403, 'Unauthorized access to data.');
            }
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'kelompok_id' => 'required|exists:kelompoks,id',
            'no_petak' => 'required|string|max:255',
        ]);

        $petak->update($request->all());

        return redirect()->route('admin.petaks.index')->with('success', 'Petak berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $petak = Petak::findOrFail($id);
        $currentUser = auth()->user();
        
        if ($currentUser->hasRole('admin_kelompok') && $petak->kelompok_id !== $currentUser->kelompok_id) {
            abort(403, 'Unauthorized access to data.');
        }

        $petak->delete();

        return redirect()->route('admin.petaks.index')->with('success', 'Petak berhasil dihapus.');
    }
}
