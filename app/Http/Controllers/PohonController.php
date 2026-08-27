<?php

namespace App\Http\Controllers;

use App\Models\Pohon;
use App\Models\RencanaTebang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PohonController extends Controller
{
    public function checkPohon(Request $request)
    {
        $no_pohon = $request->query('no_pohon');
        $petak_id = $request->query('petak_id');
        
        $query = Pohon::where('kelompok_id', $request->user()->kelompok_id)
            ->where('no_pohon', $no_pohon);
            
        if ($petak_id) {
            $query->where('petak_id', $petak_id);
        }
            
        $pohon = $query->first();

        if ($pohon) {
            return response()->json([
                'exists' => true,
                'diangkut' => !is_null($pohon->dokumen_angkutan_id)
            ]);
        }
        return response()->json(['exists' => false]);
    }

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
        if ($request->has('batangs')) {
            $batangs = $request->input('batangs');
            foreach ($batangs as &$batang) {
                if (isset($batang['panjang'])) $batang['panjang'] = str_replace(',', '.', $batang['panjang']);
                if (isset($batang['diameter_pangkal'])) $batang['diameter_pangkal'] = str_replace(',', '.', $batang['diameter_pangkal']);
                if (isset($batang['diameter_ujung'])) $batang['diameter_ujung'] = str_replace(',', '.', $batang['diameter_ujung']);
            }
            $request->merge(['batangs' => $batangs]);
        }
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

        // Cek Rencana Tebang
        $rencana = RencanaTebang::where('kelompok_id', $request->user()->kelompok_id)
            ->where('no_barcode', $validated['no_barcode'])
            ->first();
            
        if ($rencana && $rencana->no_pohon != $validated['no_pohon']) {
            throw ValidationException::withMessages([
                'no_pohon' => 'No Pohon tidak sesuai dengan data Rencana Tebang untuk barcode ini (Seharusnya: ' . $rencana->no_pohon . ').'
            ]);
        }

        $existingPohon = Pohon::where('kelompok_id', $request->user()->kelompok_id)
            ->where('no_pohon', $validated['no_pohon'])
            ->where('petak_id', $validated['petak_id'])
            ->first();

        if ($existingPohon) {
            throw ValidationException::withMessages([
                'no_pohon' => $existingPohon->dokumen_angkutan_id ? 'Pohon sudah diangkut.' : 'Pohon sudah ditebang.'
            ]);
        }

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

            foreach ($validated['batangs'] as $batangData) {
                $batang = $pohon->batangs()->make($batangData);
                $batang->calculateVolume();
                $batang->save();
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
        if ($request->has('batangs')) {
            $batangs = $request->input('batangs');
            foreach ($batangs as &$batang) {
                if (isset($batang['panjang'])) $batang['panjang'] = str_replace(',', '.', $batang['panjang']);
                if (isset($batang['diameter_pangkal'])) $batang['diameter_pangkal'] = str_replace(',', '.', $batang['diameter_pangkal']);
                if (isset($batang['diameter_ujung'])) $batang['diameter_ujung'] = str_replace(',', '.', $batang['diameter_ujung']);
            }
            $request->merge(['batangs' => $batangs]);
        }
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

        $existingPohon = Pohon::where('kelompok_id', $request->user()->kelompok_id)
            ->where('no_pohon', $validated['no_pohon'])
            ->where('petak_id', $validated['petak_id'])
            ->first();

        if ($existingPohon) {
            throw ValidationException::withMessages([
                'no_pohon' => $existingPohon->dokumen_angkutan_id ? 'Pohon sudah diangkut.' : 'Pohon sudah ditebang.'
            ]);
        }

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

            foreach ($validated['batangs'] as $batangData) {
                $batang = $pohon->batangs()->make($batangData);
                $batang->calculateVolume();
                $batang->save();
            }

            DB::commit();

            return redirect()->back()->with('success', 'Data berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    public function calculateVolumeApi(Request $request)
    {
        $diameter_pangkal = floatval(str_replace(',', '.', $request->query('diameter_pangkal', 0)));
        $diameter_ujung = floatval(str_replace(',', '.', $request->query('diameter_ujung', 0)));
        $panjang = floatval(str_replace(',', '.', $request->query('panjang', 0)));
        $jenis_pohon_id = $request->query('jenis_pohon_id');
        $kelompok_id = $request->user()->kelompok_id;

        $avgDiameter = floor(($diameter_pangkal + $diameter_ujung) / 2);
        
        $tabelVolume = \App\Models\TabelVolume::where('kelompok_id', $kelompok_id)
            ->where('jenis_pohon_id', $jenis_pohon_id)
            ->where('diameter', '<=', $avgDiameter)
            ->where('panjang', '<=', $panjang)
            ->orderBy('diameter', 'desc')
            ->orderBy('panjang', 'desc')
            ->first();

        if ($tabelVolume) {
            return response()->json([
                'volume' => $tabelVolume->volume
            ]);
        }

        return response()->json([
            'volume' => 0
        ]);
    }
}
