<?php

namespace App\Http\Controllers;

use App\Models\Pohon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PohonController extends Controller
{
    public function createBarcode()
    {
        return \Inertia\Inertia::render('Barcode');
    }

    public function createManual()
    {
        return \Inertia\Inertia::render('Manual');
    }

    public function storeBarcode(Request $request)
    {
        $validated = $request->validate([
            'no_barcode' => 'required|string',
            'no_pohon' => 'required|string',
            'petak_id' => 'required|exists:petaks,id',
            'jenis_pohon_id' => 'required|exists:jenis_pohons,id',
            'batangs' => 'required|array|min:1',
            'batangs.*.no_batang' => 'required|integer',
            'batangs.*.panjang' => 'required|numeric',
            'batangs.*.diameter_pangkal' => 'required|numeric',
            'batangs.*.diameter_ujung' => 'required|numeric',
            'batangs.*.mutu' => 'required|in:P,D,T,M',
        ]);

        try {
            DB::beginTransaction();

            $pohon = Pohon::create([
                'kelompok_id' => $request->user()->kelompok_id,
                'petak_id' => $validated['petak_id'],
                'jenis_pohon_id' => $validated['jenis_pohon_id'],
                'tanggal' => now()->toDateString(),
                'tipe' => 'barcode',
                'no_barcode' => $validated['no_barcode'],
                'no_pohon' => $validated['no_pohon'],
            ]);

            foreach ($validated['batangs'] as $batang) {
                $pohon->batangs()->create($batang);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Data berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    public function storeManual(Request $request)
    {
        $validated = $request->validate([
            'no_pohon' => 'required|string',
            'petak_id' => 'required|exists:petaks,id',
            'jenis_pohon_id' => 'required|exists:jenis_pohons,id',
            'batangs' => 'required|array|min:1',
            'batangs.*.no_batang' => 'required|integer',
            'batangs.*.panjang' => 'required|numeric',
            'batangs.*.diameter_pangkal' => 'required|numeric',
            'batangs.*.diameter_ujung' => 'required|numeric',
            'batangs.*.mutu' => 'required|in:P,D,T,M',
        ]);

        try {
            DB::beginTransaction();

            $pohon = Pohon::create([
                'kelompok_id' => $request->user()->kelompok_id,
                'petak_id' => $validated['petak_id'],
                'jenis_pohon_id' => $validated['jenis_pohon_id'],
                'tanggal' => now()->toDateString(),
                'tipe' => 'non_barcode',
                'no_pohon' => $validated['no_pohon'],
            ]);

            foreach ($validated['batangs'] as $batang) {
                $pohon->batangs()->create($batang);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Data berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal: ' . $e->getMessage()]);
        }
    }
}
