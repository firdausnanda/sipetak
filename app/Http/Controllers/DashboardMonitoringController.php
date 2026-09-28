<?php

namespace App\Http\Controllers;

use App\Models\Kelompok;
use App\Services\AnnualMonitoringKpis;
use App\Services\MonitoringPeriod;
use App\Services\MonitoringSummary;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DashboardMonitoringController extends Controller
{
    public function index(Request $request, MonitoringSummary $monitoring, AnnualMonitoringKpis $annualKpis)
    {
        $user = $request->user();
        $validated = $request->validate([
            'days' => ['sometimes', Rule::in(['7', '30', '90', 'year', 'all'])],
            'kelompok_id' => ['sometimes', 'nullable', 'integer', 'exists:kelompoks,id'],
        ]);
        $selectedDays = $validated['days'] ?? 'year';
        $days = in_array($selectedDays, ['year', 'all'], true)
            ? $selectedDays
            : (int) $selectedDays;
        $period = MonitoringPeriod::forDays($days);
        $kelompokId = $user->kelompok_id
            ? (int) $user->kelompok_id
            : (isset($validated['kelompok_id']) ? (int) $validated['kelompok_id'] : null);
        return Inertia::render('Monitoring/Dashboard', [
            ...$monitoring->forScope($kelompokId, $days, $period),
            'annualKpis' => $annualKpis->forScope($kelompokId, $period),
            'filters' => ['days' => $days, 'kelompok_id' => $kelompokId],
            'namaKelompok' => $kelompokId ? Kelompok::find($kelompokId)?->nama_kelompok : null,
            'canFilterKelompok' => ! $user->kelompok_id,
            'kelompokOptions' => $user->kelompok_id ? [] : Kelompok::orderBy('nama_kelompok')->get(['id', 'nama_kelompok']),
        ]);
    }
}
