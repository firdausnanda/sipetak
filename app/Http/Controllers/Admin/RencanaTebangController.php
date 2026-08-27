<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RencanaTebang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\RencanaTebangImport;
use Illuminate\Support\Facades\Auth;

class RencanaTebangController extends Controller
{
    public function index(Request $request)
    {
        $query = RencanaTebang::with(['petak', 'jenisPohon', 'kelompok']);
        $currentUser = Auth::user();

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $query->where('kelompok_id', $currentUser->kelompok_id);
        } elseif ($request->filled('kelompok_id')) {
            $query->where('kelompok_id', $request->kelompok_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('no_pohon', 'like', "%{$search}%")
                  ->orWhere('no_barcode', 'like', "%{$search}%");
            });
        }

        if ($request->filled('petak_id')) {
            $query->where('petak_id', $request->petak_id);
        }

        if ($request->filled('jenis_pohon_id')) {
            $query->where('jenis_pohon_id', $request->jenis_pohon_id);
        }

        $rencanaTebangs = $query->latest()->paginate(10)->withQueryString();

        $petaksQuery = \App\Models\Petak::orderBy('no_petak');
        $jenisPohonsQuery = \App\Models\JenisPohon::orderBy('nama_jenis');
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $petaksQuery->where('kelompok_id', $currentUser->kelompok_id);
            $jenisPohonsQuery->where('kelompok_id', $currentUser->kelompok_id);
        }

        return Inertia::render('Admin/RencanaTebang/Index', [
            'rencanaTebangs' => $rencanaTebangs,
            'petaks' => $petaksQuery->get(),
            'jenisPohons' => $jenisPohonsQuery->get(),
            'kelompoks' => \App\Models\Kelompok::orderBy('nama_kelompok')->get(),
            'filters' => $request->only(['search', 'petak_id', 'jenis_pohon_id', 'kelompok_id'])
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls',
            'kelompok_id' => 'nullable|exists:kelompoks,id',
        ]);

        $currentUser = Auth::user();
        $kelompok_id = $currentUser->kelompok_id ?? $request->kelompok_id;

        if (!$kelompok_id) {
            return redirect()->back()->withErrors(['error' => 'Silakan pilih Kelompok terlebih dahulu.']);
        }

        try {
            Excel::import(new RencanaTebangImport($kelompok_id), $request->file('file'));
            return redirect()->back()->with('success', 'Data Rencana Tebang berhasil diimport.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal mengimport data: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $rencanaTebang = RencanaTebang::findOrFail($id);
        $currentUser = Auth::user();
        
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis']) && $rencanaTebang->kelompok_id !== $currentUser->kelompok_id) {
            abort(403, 'Unauthorized access to data.');
        }

        $rencanaTebang->delete();

        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }

    public function checkBarcode(Request $request)
    {
        $barcode = $request->query('barcode');
        $currentUser = Auth::user();

        if (!$barcode) {
            return response()->json(['found' => false]);
        }

        $rencana = RencanaTebang::where('kelompok_id', $currentUser->kelompok_id)
            ->where('no_barcode', $barcode)
            ->first();

        if ($rencana) {
            return response()->json([
                'found' => true,
                'data' => [
                    'no_pohon' => $rencana->no_pohon,
                    'petak_id' => $rencana->petak_id,
                    'jenis_pohon_id' => $rencana->jenis_pohon_id,
                ]
            ]);
        }

        return response()->json(['found' => false]);
    }

    public function template()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_rencana_tebang.csv"',
        ];

        $columns = ['petak', 'jenis_pohon', 'no_pohon', 'no_barcode'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            // Contoh baris
            fputcsv($file, ['Petak 1A', 'Jati', '101', 'BRC123456']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
