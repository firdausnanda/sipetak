<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelompok;
use App\Models\TargetTebang;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TargetTebangController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/TargetTebang/Index', [
            'targets' => TargetTebang::with('kelompok:id,nama_kelompok')->orderByDesc('tahun')->get(),
            'kelompoks' => Kelompok::orderBy('nama_kelompok')->get(['id', 'nama_kelompok']),
            'currentYear' => now()->year,
        ]);
    }

    public function store(Request $request)
    {
        TargetTebang::create($this->validatedData($request));

        return redirect()->route('admin.target_tebangs.index')->with('success', 'Target tahunan berhasil ditambahkan.');
    }

    public function update(Request $request, TargetTebang $targetTebang)
    {
        $targetTebang->update($this->validatedData($request, $targetTebang));

        return redirect()->route('admin.target_tebangs.index')->with('success', 'Target tahunan berhasil diperbarui.');
    }

    public function destroy(TargetTebang $targetTebang)
    {
        $targetTebang->delete();

        return redirect()->route('admin.target_tebangs.index')->with('success', 'Target tahunan berhasil dihapus.');
    }

    private function validatedData(Request $request, ?TargetTebang $targetTebang = null): array
    {
        $volume = $request->input('volume_taksasi');
        if (is_string($volume) && preg_match('/^(?:\d{1,3}(?:\.\d{3})+|\d+),\d{1,3}$/', $volume)) {
            $request->merge(['volume_taksasi' => str_replace(',', '.', str_replace('.', '', $volume))]);
        } elseif (is_string($volume) && preg_match('/^[1-9]\d{0,2}(?:\.\d{3})+$/', $volume)) {
            $request->merge(['volume_taksasi' => str_replace('.', '', $volume)]);
        }

        return $request->validate([
            'kelompok_id' => ['required', 'integer', 'exists:kelompoks,id'],
            'tahun' => ['required', 'integer', 'between:1900,2100', Rule::unique('target_tebangs')->where('kelompok_id', $request->kelompok_id)->ignore($targetTebang?->id)],
            'jumlah_pohon' => ['required', 'integer', 'min:1', 'max:4294967295'],
            'volume_taksasi' => ['required', 'numeric', 'gt:0', 'max:99999999999.999', 'decimal:0,3'],
        ]);
    }
}
