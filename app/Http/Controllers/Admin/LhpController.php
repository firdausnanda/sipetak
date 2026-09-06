<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lhp;
use App\Models\Kelompok;
use App\Models\JenisPohon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LhpController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Lhp::with(['kelompok', 'jenisPohon']);

        // Scope by user's kelompok if admin_kelompok
        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $query->where('kelompok_id', $user->kelompok_id);
        }

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('no_lhp', 'like', "%{$search}%")
                  ->orWhereHas('jenisPohon', function($qJP) use ($search) {
                      $qJP->where('nama_jenis', 'like', "%{$search}%");
                  });
            });
        }

        // Apply kelompok filter if present (only useful for admin_cdk)
        if ($request->filled('kelompok_id')) {
            $query->where('kelompok_id', $request->kelompok_id);
        }

        // Advanced filters
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }
        if ($request->filled('sortimen')) {
            $query->where('sortimen', 'like', "%{$request->sortimen}%");
        }
        if ($request->filled('min_volume')) {
            $query->where('volume', '>=', $request->min_volume);
        }
        if ($request->filled('max_volume')) {
            $query->where('volume', '<=', $request->max_volume);
        }

        $lhps = $query->latest()->paginate(10)->withQueryString();

        $kelompoks = [];
        if (!$user->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $kelompoks = Kelompok::all();
        }

        return Inertia::render('Admin/Lhp/Index', [
            'lhps' => $lhps,
            'filters' => $request->only(['search', 'kelompok_id', 'tanggal', 'sortimen', 'min_volume', 'max_volume']),
            'kelompoks' => $kelompoks
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        
        $kelompoks = [];
        if (!$user->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $kelompoks = Kelompok::all();
        }

        // Fetch all jenis pohon. If user is admin_kelompok, maybe fetch only theirs.
        // Usually, JenisPohon might be specific to kelompok. Let's pass all to frontend and filter dynamically.
        $jenis_pohons = JenisPohon::all();
        $sortimens = \App\Enums\SortimenEnum::values();

        return Inertia::render('Admin/Lhp/Create', [
            'kelompoks' => $kelompoks,
            'jenis_pohons' => $jenis_pohons,
            'sortimens' => $sortimens
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $rules = [
            'no_lhp' => 'required|string|unique:lhps,no_lhp',
            'tanggal' => 'required|date',
            'jenis_pohon_id' => 'required|exists:jenis_pohons,id',
            'sortimen' => ['required', \Illuminate\Validation\Rule::enum(\App\Enums\SortimenEnum::class)],
            'volume' => 'required|numeric|min:0',
            'tarif' => 'required|numeric|min:0',
            'psdh' => 'required|numeric|min:0',
        ];

        if (!$user->kelompok_id) {
            $rules['kelompok_id'] = 'required|exists:kelompoks,id';
        }

        $validated = $request->validate($rules);
        
        $validated['kelompok_id'] = $user->kelompok_id ?? $request->kelompok_id;

        Lhp::create($validated);

        return redirect()->route('admin.lhp.index')->with('success', 'Data LHP berhasil ditambahkan.');
    }

    public function show(Lhp $lhp)
    {
        // Not needed for now
    }

    public function edit(Lhp $lhp)
    {
        $user = Auth::user();
        
        // Authorization Check
        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id && $lhp->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this LHP.');
        }

        $kelompoks = [];
        if (!$user->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $kelompoks = Kelompok::all();
        }

        $jenis_pohons = JenisPohon::all();
        $sortimens = \App\Enums\SortimenEnum::values();

        // Convert enum to scalar for frontend if necessary, although accessing it usually returns scalar in json
        $lhp->sortimen = $lhp->sortimen->value ?? $lhp->sortimen;

        return Inertia::render('Admin/Lhp/Edit', [
            'lhp' => $lhp,
            'kelompoks' => $kelompoks,
            'jenis_pohons' => $jenis_pohons,
            'sortimens' => $sortimens
        ]);
    }

    public function update(Request $request, Lhp $lhp)
    {
        $user = Auth::user();

        // Authorization Check
        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id && $lhp->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this LHP.');
        }

        $rules = [
            'no_lhp' => 'required|string|unique:lhps,no_lhp,' . $lhp->id,
            'tanggal' => 'required|date',
            'jenis_pohon_id' => 'required|exists:jenis_pohons,id',
            'sortimen' => ['required', \Illuminate\Validation\Rule::enum(\App\Enums\SortimenEnum::class)],
            'volume' => 'required|numeric|min:0',
            'tarif' => 'required|numeric|min:0',
            'psdh' => 'required|numeric|min:0',
        ];

        if (!$user->kelompok_id) {
            $rules['kelompok_id'] = 'required|exists:kelompoks,id';
        }

        $validated = $request->validate($rules);
        $validated['kelompok_id'] = $user->kelompok_id ?? $request->kelompok_id;

        $lhp->update($validated);

        return redirect()->route('admin.lhp.index')->with('success', 'Data LHP berhasil diubah.');
    }

    public function destroy(Lhp $lhp)
    {
        $user = Auth::user();
        
        // Authorization Check
        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id && $lhp->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this LHP.');
        }

        $lhp->delete();

        return redirect()->route('admin.lhp.index')->with('success', 'Data LHP berhasil dihapus.');
    }
}
