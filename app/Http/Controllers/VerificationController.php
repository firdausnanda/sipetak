<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DokumenAngkutan;
use App\Models\Skshhk;

class VerificationController extends Controller
{
    public function show($token)
    {
        $dokumen = DokumenAngkutan::with('penerbit')->where('verification_token', $token)->first();

        if ($dokumen) {
            return view('verifikasi.dokumen-angkutan', compact('dokumen'));
        }

        $skshhk = Skshhk::where('verification_token', $token)->first();

        if ($skshhk) {
            return view('verifikasi.skshhk', compact('skshhk'));
        }

        abort(404, 'Dokumen tidak ditemukan atau tidak valid.');
    }
}
