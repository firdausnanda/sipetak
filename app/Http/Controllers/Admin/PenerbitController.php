<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Penerbit;
use App\Models\Kelompok;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenerbitController extends Controller
{
    public function index(Request $request)
    {
        $query = Penerbit::with(['kelompok']);
        $currentUser = auth()->user();

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $query->where('kelompok_id', $currentUser->kelompok_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nama', 'like', "%{$search}%");
        }

        if ($request->filled('kelompok_id')) {
            $query->where('kelompok_id', $request->kelompok_id);
        }

        $sort = $request->input('sort', 'nama');
        $direction = $request->input('direction', 'asc');
        $allowedSorts = ['nama', 'created_at'];

        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest();
        }
        
        $perPage = $request->input('per_page', 10);
        $penerbits = $query->paginate($perPage)->withQueryString();
        
        $kelompoksQuery = Kelompok::orderBy('nama_kelompok');
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $kelompoksQuery->where('id', $currentUser->kelompok_id);
        }
        $kelompoks = $kelompoksQuery->get();

        return Inertia::render('Admin/Penerbit/Index', [
            'penerbits' => $penerbits,
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
            'nama' => 'required|string|max:255',
            'no_register' => 'nullable|string|max:255',
        ]);

        Penerbit::create($request->all());

        return redirect()->route('admin.penerbits.index')->with('success', 'Penerbit berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $penerbit = Penerbit::findOrFail($id);
        $currentUser = auth()->user();

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            if ($penerbit->kelompok_id !== $currentUser->kelompok_id) {
                abort(403, 'Unauthorized access to data.');
            }
            $request->merge(['kelompok_id' => $currentUser->kelompok_id]);
        }

        $request->validate([
            'kelompok_id' => 'required|exists:kelompoks,id',
            'nama' => 'required|string|max:255',
            'no_register' => 'nullable|string|max:255',
        ]);

        $penerbit->update($request->all());

        return redirect()->route('admin.penerbits.index')->with('success', 'Penerbit berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $penerbit = Penerbit::findOrFail($id);
        $currentUser = auth()->user();
        
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis']) && $penerbit->kelompok_id !== $currentUser->kelompok_id) {
            abort(403, 'Unauthorized access to data.');
        }

        $penerbit->delete();

        return redirect()->route('admin.penerbits.index')->with('success', 'Penerbit berhasil dihapus.');
    }
}
