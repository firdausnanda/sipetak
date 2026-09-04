<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DokumenAngkutan;
use App\Models\Skshhk;
use App\Models\Pohon;
use App\Models\Batang;
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
        
        $query = Skshhk::withCount(['batangs as pohons_count' => function ($q) {
                $q->select(DB::raw('count(distinct(pohon_id))'));
            }])
            ->withSum('batangs as total_volume', 'volume')
            ->latest();

        $summaryQuery = Skshhk::query();

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $query->whereHas('batangs.pohon.dokumenAngkutan', function($q) use ($user) {
                $q->where('kelompok_id', $user->kelompok_id);
            });
            $summaryQuery->whereHas('batangs.pohon.dokumenAngkutan', function($q) use ($user) {
                $q->where('kelompok_id', $user->kelompok_id);
            });
        }

        $filterKelompok = $request->input('kelompok_id');
        $filterTanggal = $request->input('tanggal');

        if ($filterKelompok) {
            $query->whereHas('batangs.pohon.dokumenAngkutan', function($q) use ($filterKelompok) {
                $q->where('kelompok_id', $filterKelompok);
            });
            $summaryQuery->whereHas('batangs.pohon.dokumenAngkutan', function($q) use ($filterKelompok) {
                $q->where('kelompok_id', $filterKelompok);
            });
        }

        if ($filterTanggal) {
            $query->whereDate('tanggal', $filterTanggal);
            $summaryQuery->whereDate('tanggal', $filterTanggal);
        }

        $skshhks = $query->paginate(10)->withQueryString();

        $allIds = $summaryQuery->pluck('id');
        $totalBatang = Batang::whereIn('skshhk_id', $allIds)->count();
        $totalVolume = Batang::whereIn('skshhk_id', $allIds)->sum('volume');
        $totalPohon = Batang::whereIn('skshhk_id', $allIds)->distinct('pohon_id')->count('pohon_id');

        // Calculate Vorad (Sisa Batang yang belum masuk SKSHHK dari pohon yang sudah ada dokumen angkutan)
        $voradBatangQuery = Batang::whereNull('skshhk_id')
            ->whereHas('pohon', function($q) use ($user, $filterKelompok) {
                $q->whereNotNull('dokumen_angkutan_id');
                if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
                    $q->whereHas('dokumenAngkutan', function($q2) use ($user) {
                        $q2->where('kelompok_id', $user->kelompok_id);
                    });
                }
                if ($filterKelompok) {
                    $q->whereHas('dokumenAngkutan', function($q2) use ($filterKelompok) {
                        $q2->where('kelompok_id', $filterKelompok);
                    });
                }
            });
        
        $voradBatang = $voradBatangQuery->count();
        $voradVolume = $voradBatangQuery->sum('volume');
        $voradPohon = $voradBatangQuery->distinct('pohon_id')->count('pohon_id');

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
            'selectedBatangs' => [],
            'selectedPohonsData' => []
        ]);
    }

    public function getAvailableTrees(Request $request)
    {
        $user = Auth::user();
        $search = $request->query('search');
        
        $query = Pohon::with(['jenisPohon', 'batangs' => function($q) {
                $q->whereNull('skshhk_id');
            }])
            ->whereHas('batangs', function($q) {
                $q->whereNull('skshhk_id');
            })
            ->whereNotNull('dokumen_angkutan_id');

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
            'batang_ids' => 'array',
            'batang_ids.*' => 'exists:batangs,id',
        ]);

        DB::beginTransaction();
        try {
            $skshhk = Skshhk::create([
                'no_skshhk' => $request->no_skshhk,
                'tanggal' => $request->tanggal,
            ]);

            if (!empty($request->batang_ids)) {
                Batang::whereIn('id', $request->batang_ids)
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
            $hasUnauthorized = Batang::where('skshhk_id', $skshhk->id)
                ->whereHas('pohon.dokumenAngkutan', function($q) use ($user) {
                    $q->where('kelompok_id', '!=', $user->kelompok_id);
                })->exists();
            if ($hasUnauthorized) {
                abort(403);
            }
        }

        $selectedPohonsData = Pohon::with(['jenisPohon', 'dokumenAngkutan', 'batangs' => function($q) use ($skshhk) {
                // To display all batangs of the trees that have some batangs selected, 
                // we might want to load batangs that are either unassigned or assigned to this SKSHHK.
                $q->whereNull('skshhk_id')->orWhere('skshhk_id', $skshhk->id);
            }])
            ->whereHas('batangs', function($q) use ($skshhk) {
                $q->where('skshhk_id', $skshhk->id);
            })
            ->get();

        $selectedBatangs = Batang::where('skshhk_id', $skshhk->id)->pluck('id')->toArray();

        return Inertia::render('Admin/LampiranSkshhk/Form', [
            'dokumenAngkutans' => [],
            'skshhk' => $skshhk,
            'selectedBatangs' => $selectedBatangs,
            'selectedPohonsData' => $selectedPohonsData
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'no_skshhk' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'batang_ids' => 'array',
            'batang_ids.*' => 'exists:batangs,id',
        ]);

        $user = Auth::user();

        DB::beginTransaction();
        try {
            $skshhk = Skshhk::findOrFail($id);
            
            if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
                $hasUnauthorized = Batang::where('skshhk_id', $skshhk->id)
                    ->whereHas('pohon.dokumenAngkutan', function($q) use ($user) {
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

            Batang::where('skshhk_id', $skshhk->id)->update(['skshhk_id' => null]);

            if (!empty($request->batang_ids)) {
                Batang::whereIn('id', $request->batang_ids)
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
                $hasUnauthorized = Batang::where('skshhk_id', $skshhk->id)
                    ->whereHas('pohon.dokumenAngkutan', function($q) use ($user) {
                        $q->where('kelompok_id', '!=', $user->kelompok_id);
                    })->exists();
                if ($hasUnauthorized) {
                    abort(403);
                }
            }

            Batang::where('skshhk_id', $skshhk->id)->update(['skshhk_id' => null]);
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
            'batangs.pohon.jenisPohon',
            'batangs.pohon.dokumenAngkutan.kelompok'
        ])->findOrFail($id);

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $hasUnauthorized = Batang::where('skshhk_id', $skshhk->id)
                ->whereHas('pohon.dokumenAngkutan', function($q) use ($user) {
                    $q->where('kelompok_id', '!=', $user->kelompok_id);
                })->exists();
            if ($hasUnauthorized) {
                abort(403, 'Unauthorized access to this document.');
            }
        }

        $firstBatang = $skshhk->batangs->first();
        $dokumen = ($firstBatang && $firstBatang->pohon) ? $firstBatang->pohon->dokumenAngkutan : null;
        
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

        // Group batangs by pohon for display logic if needed, or just iterate batangs
        $groupedBatangs = $skshhk->batangs->groupBy('pohon_id');

        foreach ($groupedBatangs as $pohonId => $batangs) {
            $pohon = $batangs->first()->pohon;
            foreach ($batangs as $batang) {
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

        $pdf = Pdf::loadView('pdf.lampiran-skshhk', compact('dokumen', 'skshhkData'));
        $pdf->setPaper('A4', 'portrait');

        $safeNoSkshhk = str_replace(['/', '\\'], '_', $skshhk->no_skshhk);
        return $pdf->stream('Lampiran_SKSHHK_' . $safeNoSkshhk . '.pdf');
    }

    public function exportExcel($id)
    {
        $user = Auth::user();
        $skshhk = Skshhk::with([
            'batangs.pohon.jenisPohon',
            'batangs.pohon.dokumenAngkutan.kelompok'
        ])->findOrFail($id);

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $hasUnauthorized = Batang::where('skshhk_id', $skshhk->id)
                ->whereHas('pohon.dokumenAngkutan', function($q) use ($user) {
                    $q->where('kelompok_id', '!=', $user->kelompok_id);
                })->exists();
            if ($hasUnauthorized) {
                abort(403, 'Unauthorized access to this document.');
            }
        }

        $firstBatang = $skshhk->batangs->first();
        $dokumen = ($firstBatang && $firstBatang->pohon) ? $firstBatang->pohon->dokumenAngkutan : null;
        
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

        $groupedBatangs = $skshhk->batangs->groupBy('pohon_id');

        foreach ($groupedBatangs as $pohonId => $batangs) {
            $pohon = $batangs->first()->pohon;
            foreach ($batangs as $batang) {
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

    public function migrateOldData(Request $request)
    {
        $user = Auth::user();
        if (!$user->hasRole('admin_cdk')) {
            abort(403, 'Unauthorized.');
        }

        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('pohons', 'skshhk_id')) {
                return response()->json(['success' => false, 'message' => 'Kolom skshhk_id di tabel pohons sudah tidak ada, data mungkin sudah dimigrasi.']);
            }
            
            DB::statement('UPDATE batangs b JOIN pohons p ON b.pohon_id = p.id SET b.skshhk_id = p.skshhk_id WHERE p.skshhk_id IS NOT NULL');
            return response()->json(['success' => true, 'message' => 'Data SKSHHK lama berhasil dimigrasi ke tabel batangs.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal memigrasi data: ' . $e->getMessage()]);
        }
    }
}
