<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pnbp;
use App\Models\Lhp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\RekonsiliasiPsdhExport;

class PnbpController extends Controller
{
    public function exportRekonsiliasi(Request $request)
    {
        $user = Auth::user();
        
        // We need LHPs with their PNBP, Kelompok, and JenisPohon
        $query = Lhp::with(['pnbp', 'kelompok', 'jenisPohon']);

        if ($user->hasRole('admin_kelompok') && $user->kelompok_id) {
            $query->where('kelompok_id', $user->kelompok_id);
        }

        // Apply filters similar to index
        if ($request->filled('kelompok_id')) {
            $query->where('kelompok_id', $request->kelompok_id);
        }
        
        if ($request->filled('tanggal_billing')) {
            $query->whereHas('pnbp', function($q) use ($request) {
                $q->whereDate('tanggal_kode_billing', $request->tanggal_billing);
            });
        }
        
        if ($request->filled('status')) {
            if ($request->status === 'lunas') {
                $query->whereHas('pnbp', function($q) {
                    $q->whereNotNull('ntpn');
                });
            } elseif ($request->status === 'belum_lunas') {
                $query->whereHas('pnbp', function($q) {
                    $q->whereNull('ntpn');
                })->orWhereDoesntHave('pnbp');
            }
        }

        $lhps = $query->orderBy('tanggal', 'asc')->get();
        
        // Determine Kelompok name for header
        $kelompokName = 'Semua Kelompok';
        if ($request->filled('kelompok_id')) {
            $kelompok = \App\Models\Kelompok::find($request->kelompok_id);
            if ($kelompok) {
                $kelompokName = 'KTH ' . $kelompok->nama_kelompok;
            }
        } elseif ($user->hasRole('admin_kelompok') && $user->kelompok) {
            $kelompokName = 'KTH ' . $user->kelompok->nama_kelompok;
        }

        // Determine Periode (e.g. from filtering by month/year)
        // Since we don't have a specific month filter in the request yet, we'll leave it generic
        // Or you can format the current quarter/year
        $periode = 'Tahun ' . date('Y');

        return Excel::download(new RekonsiliasiPsdhExport($lhps, $kelompokName, $periode), 'Rekonsiliasi_PSDH.xlsx');
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Pnbp::with(['lhp.kelompok', 'lhp.jenisPohon']);

        if ($user->hasRole('admin_kelompok') && $user->kelompok_id) {
            $query->whereHas('lhp', function($q) use ($user) {
                $q->where('kelompok_id', $user->kelompok_id);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_billing', 'like', "%{$search}%")
                  ->orWhere('ntpn', 'like', "%{$search}%")
                  ->orWhereHas('lhp', function($qLhp) use ($search) {
                      $qLhp->where('no_lhp', 'like', "%{$search}%");
                  });
            });
        }

        // Advanced filters
        if ($request->filled('tanggal_billing')) {
            $query->whereDate('tanggal_kode_billing', $request->tanggal_billing);
        }

        if ($request->filled('status')) {
            if ($request->status === 'lunas') {
                $query->whereNotNull('ntpn');
            } elseif ($request->status === 'belum_lunas') {
                $query->whereNull('ntpn');
            }
        }

        if ($request->filled('kelompok_id')) {
            $query->whereHas('lhp', function($q) use ($request) {
                $q->where('kelompok_id', $request->kelompok_id);
            });
        }

        $pnbps = $query->orderBy('tanggal_kode_billing', 'desc')->paginate(10)->withQueryString();

        $kelompoks = [];
        if ($user->hasRole('admin_cdk')) {
            $kelompoks = \App\Models\Kelompok::all();
        }

        return Inertia::render('Admin/Pnbp/Index', [
            'pnbps' => $pnbps,
            'filters' => $request->only(['search', 'tanggal_billing', 'status', 'kelompok_id']),
            'kelompoks' => $kelompoks
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        
        $lhpQuery = Lhp::doesntHave('pnbp')->with(['kelompok']);
        
        if ($user->hasRole('admin_kelompok') && $user->kelompok_id) {
            $lhpQuery->where('kelompok_id', $user->kelompok_id);
        }

        $lhps = $lhpQuery->get();

        return Inertia::render('Admin/Pnbp/Create', [
            'lhps' => $lhps
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $rules = [
            'lhp_id' => 'required|exists:lhps,id|unique:pnbps,lhp_id',
            'kode_billing' => 'required|string',
            'tanggal_kode_billing' => 'required|date',
            'jumlah' => 'required|numeric|min:0',
            'tanggal_bayar' => 'nullable|date',
            'ntpn' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ];

        $validated = $request->validate($rules);
        
        // Ensure user is authorized to create PNBP for this LHP
        if ($user->hasRole('admin_kelompok') && $user->kelompok_id) {
            $lhp = Lhp::findOrFail($validated['lhp_id']);
            if ($lhp->kelompok_id !== $user->kelompok_id) {
                abort(403, 'Unauthorized access to this LHP.');
            }
        }

        Pnbp::create($validated);

        return redirect()->route('admin.pnbp.index')->with('success', 'Data PNBP berhasil ditambahkan.');
    }

    public function show(Pnbp $pnbp)
    {
        // Not implemented
    }

    public function edit(Pnbp $pnbp)
    {
        $user = Auth::user();
        $pnbp->load('lhp.kelompok');
        
        if ($user->hasRole('admin_kelompok') && $user->kelompok_id && $pnbp->lhp->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this PNBP.');
        }

        $lhpQuery = Lhp::with(['kelompok']);
        if ($user->hasRole('admin_kelompok') && $user->kelompok_id) {
            $lhpQuery->where('kelompok_id', $user->kelompok_id);
        }
        
        // In edit, we need to show the currently selected LHP, even if it already has a PNBP
        $lhps = $lhpQuery->where(function($q) use ($pnbp) {
            $q->doesntHave('pnbp')->orWhere('id', $pnbp->lhp_id);
        })->get();

        return Inertia::render('Admin/Pnbp/Edit', [
            'pnbp' => $pnbp,
            'lhps' => $lhps
        ]);
    }

    public function update(Request $request, Pnbp $pnbp)
    {
        $user = Auth::user();
        $pnbp->load('lhp');

        if ($user->hasRole('admin_kelompok') && $user->kelompok_id && $pnbp->lhp->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this PNBP.');
        }

        $rules = [
            'lhp_id' => 'required|exists:lhps,id|unique:pnbps,lhp_id,' . $pnbp->id,
            'kode_billing' => 'required|string',
            'tanggal_kode_billing' => 'required|date',
            'jumlah' => 'required|numeric|min:0',
            'tanggal_bayar' => 'nullable|date',
            'ntpn' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ];

        $validated = $request->validate($rules);
        
        if ($user->hasRole('admin_kelompok') && $user->kelompok_id) {
            $lhp = Lhp::findOrFail($validated['lhp_id']);
            if ($lhp->kelompok_id !== $user->kelompok_id) {
                abort(403, 'Unauthorized access to this LHP.');
            }
        }

        $pnbp->update($validated);

        return redirect()->route('admin.pnbp.index')->with('success', 'Data PNBP berhasil diubah.');
    }

    public function destroy(Pnbp $pnbp)
    {
        $user = Auth::user();
        $pnbp->load('lhp');
        
        if ($user->hasRole('admin_kelompok') && $user->kelompok_id && $pnbp->lhp->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this PNBP.');
        }

        $pnbp->delete();

        return redirect()->route('admin.pnbp.index')->with('success', 'Data PNBP berhasil dihapus.');
    }
}
