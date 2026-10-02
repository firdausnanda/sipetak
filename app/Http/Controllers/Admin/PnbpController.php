<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\SortimenEnum;
use App\Models\Pnbp;
use App\Models\Lhp;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\RekonsiliasiPsdhExport;

class PnbpController extends Controller
{
    public function exportRekonsiliasi(Request $request)
    {
        $user = Auth::user();
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'kelompok_id' => ['nullable', 'integer', 'exists:kelompoks,id'],
            'tanggal_mulai' => ['nullable', 'date_format:Y-m-d'],
            'tanggal_akhir' => ['nullable', 'date_format:Y-m-d'],
            'tanggal_billing' => ['nullable', 'date_format:Y-m-d'],
            'status' => ['nullable', Rule::in(['lunas', 'belum_lunas'])],
            'sortimen' => ['nullable', Rule::in(SortimenEnum::values())],
            'min_volume' => ['nullable', 'numeric', 'min:0'],
            'max_volume' => ['nullable', 'numeric', 'min:0'],
        ]);

        if (!empty($filters['tanggal_mulai']) && !empty($filters['tanggal_akhir'])
            && $filters['tanggal_akhir'] < $filters['tanggal_mulai']) {
            throw ValidationException::withMessages(['tanggal_akhir' => 'Tanggal akhir tidak boleh sebelum tanggal mulai.']);
        }
        if (isset($filters['min_volume'], $filters['max_volume'])
            && (float) $filters['max_volume'] < (float) $filters['min_volume']) {
            throw ValidationException::withMessages(['max_volume' => 'Volume maksimum tidak boleh kurang dari volume minimum.']);
        }

        $query = Lhp::with(['pnbp', 'kelompok', 'jenisPohon']);

        if ($user->hasRole('admin_kelompok') && $user->kelompok_id) {
            $query->where('kelompok_id', $user->kelompok_id);
        }

        if (!empty($filters['kelompok_id'])) {
            $query->where('kelompok_id', $filters['kelompok_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('no_lhp', 'like', "%{$search}%")
                    ->orWhereHas('pnbp', function ($pnbp) use ($search) {
                        $pnbp->where('kode_billing', 'like', "%{$search}%")
                            ->orWhere('ntpn', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['tanggal_mulai'])) {
            $query->whereDate('tanggal', '>=', $filters['tanggal_mulai']);
        }
        if (!empty($filters['tanggal_akhir'])) {
            $query->whereDate('tanggal', '<=', $filters['tanggal_akhir']);
        }
        if (!empty($filters['tanggal_billing'])) {
            $query->whereHas('pnbp', fn ($pnbp) => $pnbp->whereDate('tanggal_kode_billing', $filters['tanggal_billing']));
        }
        if (!empty($filters['sortimen'])) {
            $query->where('sortimen', $filters['sortimen']);
        }
        if (isset($filters['min_volume'])) {
            $query->where('volume', '>=', $filters['min_volume']);
        }
        if (isset($filters['max_volume'])) {
            $query->where('volume', '<=', $filters['max_volume']);
        }
        if (($filters['status'] ?? null) === 'lunas') {
            $query->whereHas('pnbp', fn ($pnbp) => $pnbp->whereNotNull('ntpn'));
        } elseif (($filters['status'] ?? null) === 'belum_lunas') {
            $query->where(function ($q) {
                $q->whereDoesntHave('pnbp')
                    ->orWhereHas('pnbp', fn ($pnbp) => $pnbp->whereNull('ntpn'));
            });
        }

        $lhps = $query->orderBy('tanggal', 'asc')->orderBy('id')->get();

        $kelompokName = 'Semua Kelompok';
        if ($user->hasRole('admin_kelompok') && $user->kelompok) {
            $kelompokName = 'KTH ' . $user->kelompok->nama_kelompok;
        } elseif (!empty($filters['kelompok_id'])) {
            $kelompok = \App\Models\Kelompok::find($filters['kelompok_id']);
            if ($kelompok) {
                $kelompokName = 'KTH ' . $kelompok->nama_kelompok;
            }
        }

        $from = !empty($filters['tanggal_mulai']) ? Carbon::parse($filters['tanggal_mulai'])->format('d/m/Y') : null;
        $to = !empty($filters['tanggal_akhir']) ? Carbon::parse($filters['tanggal_akhir'])->format('d/m/Y') : null;
        $periode = match (true) {
            $from !== null && $to !== null => "Periode LHP: {$from} s.d. {$to}",
            $from !== null => "Periode LHP: sejak {$from}",
            $to !== null => "Periode LHP: sampai {$to}",
            default => 'Seluruh tanggal LHP',
        };

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
            'kelompoks' => $kelompoks,
            'sortimens' => SortimenEnum::values(),
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
