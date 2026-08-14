<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DokumenAngkutan;
use App\Models\Petak;
use App\Models\Pohon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DokumenAngkutanController extends Controller
{
    public function index()
    {
        $dokumens = DokumenAngkutan::with(['kelompok', 'petaks'])->latest()->paginate(10);
        return Inertia::render('Admin/DokumenAngkutan/Index', [
            'dokumens' => $dokumens
        ]);
    }

    public function create(Request $request)
    {
        $user = Auth::user();
        
        if ($user->hasRole('ganis') && $user->kelompok_id) {
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
            if ($user->hasRole('ganis') && $user->kelompok_id) {
                $query->where('kelompok_id', $user->kelompok_id);
            }
            $pohons = $query->get();
        }

        return Inertia::render('Admin/DokumenAngkutan/Create', [
            'petaks' => $petaks,
            'pohons' => $pohons,
            'selectedPetakIds' => $selectedPetakIds
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'no_dokumen' => 'required|string|max:255',
            'tanggal' => 'required|date',
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
        $dokumen = DokumenAngkutan::with([
            'kelompok',
            'petaks',
            'pohons.jenisPohon',
            'pohons.petak',
            'pohons.batangs'
        ])->findOrFail($id);

        return Inertia::render('Admin/DokumenAngkutan/Show', [
            'dokumen' => $dokumen
        ]);
    }
}
