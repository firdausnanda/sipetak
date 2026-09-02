<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DokumenAngkutan;
use App\Models\Skshhk;
use App\Models\Pohon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class LampiranSkshhkController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Skshhk::withCount('pohons')
            ->withSum(['pohons as total_volume' => function ($q) {
                $q->join('batangs', 'pohons.id', '=', 'batangs.pohon_id');
            }], 'batangs.volume')
            ->latest();

        $summaryQuery = Skshhk::query();

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            // Filter SKSHHK by user's kelompok via trees' dokumen angkutan
            $query->whereHas('pohons.dokumenAngkutan', function($q) use ($user) {
                $q->where('kelompok_id', $user->kelompok_id);
            });
            $summaryQuery->whereHas('pohons.dokumenAngkutan', function($q) use ($user) {
                $q->where('kelompok_id', $user->kelompok_id);
            });
        }

        $filterKelompok = $request->input('kelompok_id');
        $filterTanggal = $request->input('tanggal');

        if ($filterKelompok) {
            $query->whereHas('pohons.dokumenAngkutan', function($q) use ($filterKelompok) {
                $q->where('kelompok_id', $filterKelompok);
            });
            $summaryQuery->whereHas('pohons.dokumenAngkutan', function($q) use ($filterKelompok) {
                $q->where('kelompok_id', $filterKelompok);
            });
        }

        if ($filterTanggal) {
            $query->whereDate('tanggal', $filterTanggal);
            $summaryQuery->whereDate('tanggal', $filterTanggal);
        }

        $skshhks = $query->paginate(10)->withQueryString();

        // Calculate Summary
        $allIds = $summaryQuery->pluck('id');
        $totalPohon = Pohon::whereIn('skshhk_id', $allIds)->count();
        $totalBatang = \App\Models\Batang::whereHas('pohon', function ($q) use ($allIds) {
            $q->whereIn('skshhk_id', $allIds);
        })->count();
        $totalVolume = \App\Models\Batang::whereHas('pohon', function ($q) use ($allIds) {
            $q->whereIn('skshhk_id', $allIds);
        })->sum('volume');

        // Calculate Vorad (Sisa Pohon yang belum masuk SKSHHK)
        $voradQuery = Pohon::whereNotNull('dokumen_angkutan_id')->whereNull('skshhk_id');
        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $voradQuery->whereHas('dokumenAngkutan', function($q) use ($user) {
                $q->where('kelompok_id', $user->kelompok_id);
            });
        }
        if ($filterKelompok) {
            $voradQuery->whereHas('dokumenAngkutan', function($q) use ($filterKelompok) {
                $q->where('kelompok_id', $filterKelompok);
            });
        }
        $voradPohonIds = $voradQuery->pluck('id');
        $voradPohon = $voradPohonIds->count();
        $voradBatang = \App\Models\Batang::whereIn('pohon_id', $voradPohonIds)->count();
        $voradVolume = \App\Models\Batang::whereIn('pohon_id', $voradPohonIds)->sum('volume');

        $kelompoks = [];
        if (!$user->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $kelompoks = \App\Models\Kelompok::all();
        }

        return Inertia::render('Admin/LampiranSkshhk/Index', [
            'skshhks' => $skshhks,
            'summary' => [
                'total_pohon' => $totalPohon,
                'total_batang' => $totalBatang,
                'total_volume' => $totalVolume
            ],
            'vorad' => [
                'pohon' => $voradPohon,
                'batang' => $voradBatang,
                'volume' => (float) $voradVolume,
            ],
            'filters' => $request->only(['kelompok_id', 'tanggal']),
            'kelompoks' => $kelompoks,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/LampiranSkshhk/Form', [
            'dokumenAngkutans' => [],
            'skshhk' => null,
            'selectedPohons' => []
        ]);
    }

    public function getAvailableTrees(Request $request)
    {
        $user = Auth::user();
        $search = $request->query('search');
        
        $query = Pohon::with(['jenisPohon', 'batangs'])
            ->whereNotNull('dokumen_angkutan_id')
            ->whereNull('skshhk_id');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('no_barcode', 'like', "%{$search}%")
                  ->orWhere('no_pohon', 'like', "%{$search}%");
            });
        }

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $query->whereHas('dokumenAngkutan', function($q) use ($user) {
                $q->where('kelompok_id', $user->kelompok_id);
            });
        }

        $pohons = $query->limit(50)->get();

        return response()->json($pohons);
    }

    public function store(Request $request)
    {
        $request->validate([
            'no_skshhk' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'pohon_ids' => 'array',
            'pohon_ids.*' => 'exists:pohons,id',
        ]);

        DB::beginTransaction();
        try {
            $skshhk = Skshhk::create([
                'no_skshhk' => $request->no_skshhk,
                'tanggal' => $request->tanggal,
            ]);

            if (!empty($request->pohon_ids)) {
                Pohon::whereIn('id', $request->pohon_ids)
                    ->update(['skshhk_id' => $skshhk->id]);
            }

            DB::commit();
            return redirect()->route('admin.lampiran_skshhk.index')->with('success', 'SKSHHK berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal membuat SKSHHK: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        $user = Auth::user();
        $skshhk = Skshhk::findOrFail($id);

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $hasUnauthorized = Pohon::where('skshhk_id', $skshhk->id)
                ->whereHas('dokumenAngkutan', function($q) use ($user) {
                    $q->where('kelompok_id', '!=', $user->kelompok_id);
                })->exists();
            if ($hasUnauthorized) {
                abort(403);
            }
        }

        $selectedPohons = Pohon::with(['jenisPohon', 'dokumenAngkutan', 'batangs'])
            ->where('skshhk_id', $skshhk->id)
            ->get();

        return Inertia::render('Admin/LampiranSkshhk/Form', [
            'dokumenAngkutans' => [],
            'skshhk' => $skshhk,
            'selectedPohons' => $selectedPohons
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'no_skshhk' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'pohon_ids' => 'array',
            'pohon_ids.*' => 'exists:pohons,id',
        ]);

        $user = Auth::user();

        DB::beginTransaction();
        try {
            $skshhk = Skshhk::findOrFail($id);
            
            if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
                $hasUnauthorized = Pohon::where('skshhk_id', $skshhk->id)
                    ->whereHas('dokumenAngkutan', function($q) use ($user) {
                        $q->where('kelompok_id', '!=', $user->kelompok_id);
                    })->exists();
                if ($hasUnauthorized) {
                    abort(403);
                }
            }

            $skshhk->update([
                'no_skshhk' => $request->no_skshhk,
                'tanggal' => $request->tanggal,
            ]);

            // Detach all trees first
            Pohon::where('skshhk_id', $skshhk->id)->update(['skshhk_id' => null]);

            // Attach new trees
            if (!empty($request->pohon_ids)) {
                Pohon::whereIn('id', $request->pohon_ids)
                    ->update(['skshhk_id' => $skshhk->id]);
            }

            DB::commit();
            return redirect()->route('admin.lampiran_skshhk.index')->with('success', 'SKSHHK berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memperbarui SKSHHK: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $user = Auth::user();

        DB::beginTransaction();
        try {
            $skshhk = Skshhk::findOrFail($id);

            if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
                $hasUnauthorized = Pohon::where('skshhk_id', $skshhk->id)
                    ->whereHas('dokumenAngkutan', function($q) use ($user) {
                        $q->where('kelompok_id', '!=', $user->kelompok_id);
                    })->exists();
                if ($hasUnauthorized) {
                    abort(403);
                }
            }

            Pohon::where('skshhk_id', $skshhk->id)->update(['skshhk_id' => null]);
            $skshhk->delete();

            DB::commit();
            return redirect()->route('admin.lampiran_skshhk.index')->with('success', 'SKSHHK berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menghapus SKSHHK: ' . $e->getMessage());
        }
    }

    public function exportPdf($id)
    {
        $user = Auth::user();
        $skshhk = Skshhk::with([
            'pohons.jenisPohon', 
            'pohons.batangs',
            'pohons.dokumenAngkutan.kelompok'
        ])->findOrFail($id);

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $hasUnauthorized = Pohon::where('skshhk_id', $skshhk->id)
                ->whereHas('dokumenAngkutan', function($q) use ($user) {
                    $q->where('kelompok_id', '!=', $user->kelompok_id);
                })->exists();
            if ($hasUnauthorized) {
                abort(403, 'Unauthorized access to this document.');
            }
        }

        // Determine Logo and Kelompok from the first tree's dokumen angkutan
        $firstTree = $skshhk->pohons->first();
        $dokumen = $firstTree ? $firstTree->dokumenAngkutan : null;
        
        $skshhkData = [];
        
        // Prepare Rekap
        $rekap = [];
        foreach(['P', 'D', 'T', 'M'] as $kat) {
            $rekap[$kat] = [
                'AI' => ['jumlah' => 0, 'volume' => 0],
                'AII' => ['jumlah' => 0, 'volume' => 0],
                'AIII' => ['jumlah' => 0, 'volume' => 0],
            ];
        }

        // Prepare Details
        $details = [];
        $no = 1;

        foreach ($skshhk->pohons as $pohon) {
            foreach ($pohon->batangs as $batang) {
                $avgDiameter = floor(($batang->diameter_pangkal + $batang->diameter_ujung) / 2);
                $subKat = \App\Helpers\MutuHelper::getSubKategori($avgDiameter);

                // Rekap
                if (isset($rekap[$batang->mutu])) {
                    $rekap[$batang->mutu][$subKat]['jumlah']++;
                    $rekap[$batang->mutu][$subKat]['volume'] += $batang->volume;
                }

                // Details
                $idBarcode = '';
                if ($pohon->tipe === 'barcode' && $pohon->no_barcode) {
                    $idBarcode = $pohon->no_barcode . '.' . str_pad($batang->no_batang, 2, '0', STR_PAD_LEFT);
                } else {
                    $idBarcode = ($pohon->no_pohon ?? 'NON-BARCODE') . '.' . str_pad($batang->no_batang, 2, '0', STR_PAD_LEFT);
                }

                $details[] = [
                    'no' => $no++,
                    'id_barcode' => $idBarcode,
                    'jenis' => $pohon->jenisPohon ? $pohon->jenisPohon->nama_jenis : '-',
                    'panjang' => $batang->panjang,
                    'diameter' => $avgDiameter,
                    'volume' => $batang->volume,
                    'mutu' => $batang->mutu . ' (' . $subKat . ')',
                ];
            }
        }
        
        $skshhkData[] = [
            'skshhk' => $skshhk,
            'rekap' => $rekap,
            'details' => $details,
        ];

        $pdf = Pdf::loadView('pdf.lampiran-skshhk', compact('dokumen', 'skshhkData'));
        $pdf->setPaper('A4', 'portrait');

        $safeNoSkshhk = str_replace(['/', '\\'], '_', $skshhk->no_skshhk);
        return $pdf->stream('Lampiran_SKSHHK_' . $safeNoSkshhk . '.pdf');
    }

    public function exportExcel($id)
    {
        $user = Auth::user();
        $skshhk = Skshhk::with([
            'pohons.jenisPohon', 
            'pohons.batangs',
            'pohons.dokumenAngkutan.kelompok'
        ])->findOrFail($id);

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $hasUnauthorized = Pohon::where('skshhk_id', $skshhk->id)
                ->whereHas('dokumenAngkutan', function($q) use ($user) {
                    $q->where('kelompok_id', '!=', $user->kelompok_id);
                })->exists();
            if ($hasUnauthorized) {
                abort(403, 'Unauthorized access to this document.');
            }
        }

        $firstTree = $skshhk->pohons->first();
        $dokumen = $firstTree ? $firstTree->dokumenAngkutan : null;
        
        $skshhkData = [];
        
        $rekap = [];
        foreach(['P', 'D', 'T', 'M'] as $kat) {
            $rekap[$kat] = [
                'AI' => ['jumlah' => 0, 'volume' => 0],
                'AII' => ['jumlah' => 0, 'volume' => 0],
                'AIII' => ['jumlah' => 0, 'volume' => 0],
            ];
        }

        $details = [];
        $no = 1;

        foreach ($skshhk->pohons as $pohon) {
            foreach ($pohon->batangs as $batang) {
                $avgDiameter = floor(($batang->diameter_pangkal + $batang->diameter_ujung) / 2);
                $subKat = \App\Helpers\MutuHelper::getSubKategori($avgDiameter);

                if (isset($rekap[$batang->mutu])) {
                    $rekap[$batang->mutu][$subKat]['jumlah']++;
                    $rekap[$batang->mutu][$subKat]['volume'] += $batang->volume;
                }

                $idBarcode = '';
                if ($pohon->tipe === 'barcode' && $pohon->no_barcode) {
                    $idBarcode = $pohon->no_barcode . '.' . str_pad($batang->no_batang, 2, '0', STR_PAD_LEFT);
                } else {
                    $idBarcode = ($pohon->no_pohon ?? 'NON-BARCODE') . '.' . str_pad($batang->no_batang, 2, '0', STR_PAD_LEFT);
                }

                $details[] = [
                    'no' => $no++,
                    'id_barcode' => $idBarcode,
                    'jenis' => $pohon->jenisPohon ? $pohon->jenisPohon->nama_jenis : '-',
                    'panjang' => $batang->panjang,
                    'diameter' => $avgDiameter,
                    'volume' => $batang->volume,
                    'mutu' => $batang->mutu . ' (' . $subKat . ')',
                ];
            }
        }
        
        $skshhkData[] = [
            'skshhk' => $skshhk,
            'rekap' => $rekap,
            'details' => $details,
        ];

        $safeNoSkshhk = str_replace(['/', '\\'], '_', $skshhk->no_skshhk);
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\LampiranSkshhkExport($dokumen, $skshhkData), 'Lampiran_SKSHHK_' . $safeNoSkshhk . '.xlsx');
    }
}
