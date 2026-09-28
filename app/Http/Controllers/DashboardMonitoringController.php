<?php

namespace App\Http\Controllers;

use App\Models\Kelompok;
use App\Models\Pohon;
use App\Models\TargetTebang;
use App\Services\AnnualFellingProgress;
use App\Services\MonitoringSummary;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DashboardMonitoringController extends Controller
{
    public function index(Request $request, MonitoringSummary $monitoring, AnnualFellingProgress $annualProgress)
    {
        $user = $request->user();
        $validated = $request->validate([
            'days' => ['sometimes', Rule::in(['7', '30', '90', 'all'])],
            'kelompok_id' => ['sometimes', 'nullable', 'integer', 'exists:kelompoks,id'],
            'year' => ['sometimes', 'integer', 'between:1900,2100'],
        ]);
        $days = ($validated['days'] ?? '30') === 'all' ? 'all' : (int) ($validated['days'] ?? 30);
        $kelompokId = $user->kelompok_id
            ? (int) $user->kelompok_id
            : (isset($validated['kelompok_id']) ? (int) $validated['kelompok_id'] : null);
        $year = (int) ($validated['year'] ?? now()->year);
        $datedTrees = Pohon::query()->when($kelompokId, fn ($q) => $q->where('kelompok_id', $kelompokId));
        $datedTargets = TargetTebang::query()->when($kelompokId, fn ($q) => $q->where('kelompok_id', $kelompokId));
        $firstDate = (clone $datedTrees)->min('tanggal');
        $firstTargetYear = (clone $datedTargets)->min('tahun');
        $lastDate = $datedTrees->max('tanggal');
        $lastTargetYear = $datedTargets->max('tahun');
        $minYear = max(1900, min(array_filter([$firstDate ? (int) substr($firstDate, 0, 4) : null, $firstTargetYear, $year, now()->year])));
        $maxYear = min(2100, max(array_filter([$lastDate ? (int) substr($lastDate, 0, 4) : null, $lastTargetYear, $year, now()->year])));
        $years = range($maxYear, $minYear);

        return Inertia::render('Monitoring/Dashboard', [
            ...$monitoring->forScope($kelompokId, $days),
            'annualProgress' => $annualProgress->forScope($kelompokId, $year),
            'yearOptions' => $years,
            'filters' => ['days' => $days, 'kelompok_id' => $kelompokId, 'year' => $year],
            'namaKelompok' => $kelompokId ? Kelompok::find($kelompokId)?->nama_kelompok : null,
            'canFilterKelompok' => ! $user->kelompok_id,
            'kelompokOptions' => $user->kelompok_id ? [] : Kelompok::orderBy('nama_kelompok')->get(['id', 'nama_kelompok']),
        ]);
    }
}
