<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TabelVolume;
use App\Models\JenisPohon;
use App\Imports\TabelVolumeImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class TabelVolumeController extends Controller
{
    public function index(Request $request)
    {
        $query = TabelVolume::with(['jenisPohon']);
        $currentUser = Auth::user();

        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $query->where('kelompok_id', $currentUser->kelompok_id);
        }

        if ($request->filled('jenis_pohon_id')) {
            $query->where('jenis_pohon_id', $request->jenis_pohon_id);
        }

        $tabelVolumes = $query->orderBy('jenis_pohon_id')
            ->orderBy('diameter')
            ->orderBy('panjang')
            ->paginate(15)
            ->withQueryString();

        $jenisPohonsQuery = JenisPohon::orderBy('nama_jenis');
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis'])) {
            $jenisPohonsQuery->where('kelompok_id', $currentUser->kelompok_id);
        }

        return Inertia::render('Admin/TabelVolume/Index', [
            'tabelVolumes' => $tabelVolumes,
            'jenisPohons' => $jenisPohonsQuery->get(),
            'filters' => $request->only(['jenis_pohon_id'])
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,xlsx,xls,txt',
            'jenis_pohon_id' => 'required|exists:jenis_pohons,id',
        ]);

        $jenisPohon = JenisPohon::findOrFail($request->jenis_pohon_id);
        $kelompok_id = $jenisPohon->kelompok_id;

        if (!$kelompok_id) {
            return redirect()->back()->withErrors(['error' => 'Jenis Pohon tidak memiliki Kelompok yang valid.']);
        }

        Excel::import(new TabelVolumeImport($request->jenis_pohon_id, $kelompok_id), $request->file('file'));

        return redirect()->back()->with('success', 'Tabel Volume berhasil diimport!');
    }

    public function template()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_tabel_volume.csv"',
        ];

        $columns = ['Diameter', '0.9', '1.00', '1.10', '1.20', '1.30', '1.50', '1.60', '1.70', '1.80', '1.90'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fputcsv($file, ['10', '0.01', '0.008', '0.009', '0.009', '0.01', '0.01', '0.01', '0.01', '0.01', '0.01']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function destroy($id)
    {
        $tabelVolume = TabelVolume::findOrFail($id);
        
        $currentUser = Auth::user();
        if ($currentUser->hasAnyRole(['admin_kelompok', 'ganis']) && $tabelVolume->kelompok_id !== $currentUser->kelompok_id) {
            abort(403);
        }
        
        $tabelVolume->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus');
    }
}
