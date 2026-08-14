<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DokumenAngkutan;
use App\Models\Petak;
use App\Models\Pohon;
use App\Models\Penerbit;
use App\Models\TujuanBongkar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class DokumenAngkutanController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = DokumenAngkutan::with(['kelompok', 'petaks'])->latest();
        
        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $query->where('kelompok_id', $user->kelompok_id);
        }

        $dokumens = $query->paginate(10);
        return Inertia::render('Admin/DokumenAngkutan/Index', [
            'dokumens' => $dokumens
        ]);
    }

    public function create(Request $request)
    {
        $user = Auth::user();
        
        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $petaks = Petak::where('kelompok_id', $user->kelompok_id)->get();
        } else {
            $petaks = Petak::all();
        }

        $pohons = [];
        $selectedPetakIds = $request->input('petak_ids', []);

        if (!empty($selectedPetakIds)) {
            $query = Pohon::whereIn('petak_id', $selectedPetakIds)
                          ->whereNull('dokumen_angkutan_id')
                          ->with(['jenisPohon', 'petak']);
            if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
                $query->where('kelompok_id', $user->kelompok_id);
            }
            $pohons = $query->get();
        }

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $penerbits = Penerbit::where('kelompok_id', $user->kelompok_id)->get();
            $tujuanBongkars = TujuanBongkar::where('kelompok_id', $user->kelompok_id)->get();
        } else {
            $penerbits = Penerbit::all();
            $tujuanBongkars = TujuanBongkar::all();
        }

        return Inertia::render('Admin/DokumenAngkutan/Create', [
            'petaks' => $petaks,
            'pohons' => $pohons,
            'selectedPetakIds' => $selectedPetakIds,
            'penerbits' => $penerbits,
            'tujuan_bongkars' => $tujuanBongkars,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'no_dokumen' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'penerbit_id' => 'required|exists:penerbits,id',
            'tujuan_bongkar_id' => 'required|exists:tujuan_bongkars,id',
            'jenis_angkutan' => 'required|string|max:255',
            'nopol_angkutan' => 'required|string|max:255',
            'masa_berlaku_hari' => 'required|integer|min:1',
            'petak_ids' => 'required|array|min:1',
            'petak_ids.*' => 'exists:petaks,id',
            'pohon_ids' => 'required|array|min:1',
            'pohon_ids.*' => 'exists:pohons,id',
        ]);

        $user = Auth::user();

        DB::beginTransaction();
        try {
            $dokumen = DokumenAngkutan::create([
                'kelompok_id' => $user->kelompok_id ?? 1,
                'no_dokumen' => $request->no_dokumen,
                'tanggal' => $request->tanggal,
                'penerbit_id' => $request->penerbit_id,
                'tujuan_bongkar_id' => $request->tujuan_bongkar_id,
                'jenis_angkutan' => $request->jenis_angkutan,
                'nopol_angkutan' => $request->nopol_angkutan,
                'masa_berlaku_hari' => $request->masa_berlaku_hari,
            ]);

            $dokumen->petaks()->attach($request->petak_ids);

            Pohon::whereIn('id', $request->pohon_ids)
                ->whereNull('dokumen_angkutan_id')
                ->update(['dokumen_angkutan_id' => $dokumen->id]);

            DB::commit();

            return redirect()->route('admin.dokumen_angkutans.index')
                ->with('success', 'Dokumen Angkutan berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal menyimpan dokumen angkutan: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        $user = Auth::user();
        $dokumen = DokumenAngkutan::with([
            'kelompok',
            'penerbit',
            'tujuanBongkar',
            'petaks',
            'pohons.jenisPohon',
            'pohons.petak',
            'pohons.batangs'
        ])->findOrFail($id);

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id && $dokumen->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this document.');
        }

        return Inertia::render('Admin/DokumenAngkutan/Show', [
            'dokumen' => $dokumen
        ]);
    }

    public function edit($id)
    {
        $user = Auth::user();
        $dokumen = DokumenAngkutan::findOrFail($id);

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id && $dokumen->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this document.');
        }

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id) {
            $penerbits = Penerbit::where('kelompok_id', $user->kelompok_id)->get();
            $tujuanBongkars = TujuanBongkar::where('kelompok_id', $user->kelompok_id)->get();
        } else {
            $penerbits = Penerbit::all();
            $tujuanBongkars = TujuanBongkar::all();
        }

        return Inertia::render('Admin/DokumenAngkutan/Edit', [
            'dokumen' => $dokumen,
            'penerbits' => $penerbits,
            'tujuanBongkars' => $tujuanBongkars,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $dokumen = DokumenAngkutan::findOrFail($id);

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id && $dokumen->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this document.');
        }

        $validated = $request->validate([
            'no_dokumen' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'penerbit_id' => 'required|exists:penerbits,id',
            'tujuan_bongkar_id' => 'required|exists:tujuan_bongkars,id',
            'jenis_angkutan' => 'required|string|max:255',
            'nopol_angkutan' => 'required|string|max:255',
            'masa_berlaku_hari' => 'required|integer|min:1',
        ]);

        $dokumen->update($validated);

        return redirect()->route('admin.dokumen_angkutans.show', $dokumen->id)
            ->with('success', 'Dokumen Angkutan berhasil diperbarui.');
    }

    public function exportPdf($id)
    {
        $user = Auth::user();
        $dokumen = DokumenAngkutan::with([
            'kelompok',
            'penerbit',
            'tujuanBongkar',
            'petaks',
            'pohons.jenisPohon',
            'pohons.petak',
            'pohons.batangs'
        ])->findOrFail($id);

        if ($user->hasAnyRole(['admin_kelompok', 'ganis']) && $user->kelompok_id && $dokumen->kelompok_id !== $user->kelompok_id) {
            abort(403, 'Unauthorized access to this document.');
        }

        $pdf = Pdf::loadView('pdf.dokumen-angkutan', compact('dokumen'));
        
        // Optional: customize paper size/orientation
        // $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Dokumen_Angkutan_' . $dokumen->no_dokumen . '.pdf');
    }
}
