<?php

namespace App\Http\Controllers;

use App\Models\Kelompok;
use App\Services\MonitoringSummary;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DashboardMonitoringController extends Controller
{
    public function index(Request $request, MonitoringSummary $monitoring)
    {
        $user = $request->user();
        $validated = $request->validate([
            'days' => ['sometimes', Rule::in(['7', '30', '90', 'all'])],
            'kelompok_id' => ['sometimes', 'nullable', 'integer', 'exists:kelompoks,id'],
        ]);
        $days = ($validated['days'] ?? '7') === 'all' ? 'all' : (int) ($validated['days'] ?? 7);
        $kelompokId = $user->kelompok_id
            ? (int) $user->kelompok_id
            : (isset($validated['kelompok_id']) ? (int) $validated['kelompok_id'] : null);

        return Inertia::render('Monitoring/Dashboard', [
            ...$monitoring->forScope($kelompokId, $days),
            'filters' => ['days' => $days, 'kelompok_id' => $kelompokId],
            'namaKelompok' => $kelompokId ? Kelompok::find($kelompokId)?->nama_kelompok : null,
            'canFilterKelompok' => ! $user->kelompok_id,
            'kelompokOptions' => $user->kelompok_id ? [] : Kelompok::orderBy('nama_kelompok')->get(['id', 'nama_kelompok']),
        ]);
    }
}
