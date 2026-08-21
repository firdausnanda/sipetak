<?php

namespace App\Http\Controllers;

use App\Models\Petak;
use App\Models\JenisPohon;
use App\Models\Kelompok;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $petaks = Petak::where('kelompok_id', $user->kelompok_id)->get();
        $jenisPohons = JenisPohon::where('kelompok_id', $user->kelompok_id)->get();
        $kelompok = Kelompok::find($user->kelompok_id);

        return Inertia::render('Dashboard', [
            'petaks' => $petaks,
            'jenisPohons' => $jenisPohons,
            'namaKelompok' => $kelompok ? $kelompok->nama_kelompok : 'Belum Ada Kelompok',
        ]);
    }
}
