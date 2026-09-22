<?php

namespace App\Services;

use App\Models\Batang;
use App\Models\Kelompok;
use App\Models\Lhp;
use App\Models\Pohon;
use App\Models\Pnbp;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class MonitoringSummary
{
    public function forScope(?int $kelompokId, int|string $days): array
    {
        $today = CarbonImmutable::today();

        $pohons = Pohon::query()->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId));
        $latestDate = $days === 'all'
            ? (clone $pohons)->max('tanggal')
            : (clone $pohons)->whereDate('tanggal', '<=', $today->toDateString())->max('tanggal');
        $end = $latestDate ? CarbonImmutable::parse($latestDate) : $today;
        $firstDate = $days === 'all' ? (clone $pohons)->min('tanggal') : null;
        $start = $days === 'all' && $firstDate ? CarbonImmutable::parse($firstDate) : ($days === 'all' ? $end : $end->subDays($days - 1));
        if ($days !== 'all') {
            $pohons->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()]);
        }
        $batangs = Batang::query()->whereHas('pohon', fn (Builder $q) => $q
            ->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId))
            ->when($days !== 'all', fn (Builder $q) => $q->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])));

        $pohonTotal = (clone $pohons)->count();
        $batangTotal = (clone $batangs)->count();
        $volumeTotal = (float) (clone $batangs)->sum('volume');
        $pohonTerdokumen = (clone $pohons)->whereNotNull('dokumen_angkutan_id')->count();
        $batangTerdokumen = (clone $batangs)->whereHas('pohon', fn (Builder $q) => $q->whereNotNull('dokumen_angkutan_id'))->count();
        $volumeTerdokumen = (float) (clone $batangs)->whereHas('pohon', fn (Builder $q) => $q->whereNotNull('dokumen_angkutan_id'))->sum('volume');
        $batangSkshhkTerdokumen = (clone $batangs)->whereNotNull('skshhk_id')
            ->whereHas('pohon', fn (Builder $q) => $q->whereNotNull('dokumen_angkutan_id'));
        $lhps = Lhp::query()->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId))
            ->when($days !== 'all', fn (Builder $q) => $q->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()]));
        $pnbpPaid = Pnbp::query()->whereNotNull('tanggal_bayar')->whereNotNull('ntpn')
            ->when($kelompokId, fn (Builder $q) => $q->whereHas('lhp', fn (Builder $lhp) => $lhp->where('kelompok_id', $kelompokId)))
            ->when($days !== 'all', fn (Builder $q) => $q->whereBetween('tanggal_bayar', [$start->toDateString(), $end->toDateString()]));

        $trendRows = (clone $pohons)
            ->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('tanggal, COUNT(*) as total')
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');
        $trendBatangRows = Batang::query()
            ->join('pohons', 'pohons.id', '=', 'batangs.pohon_id')
            ->when($kelompokId, fn (Builder $q) => $q->where('pohons.kelompok_id', $kelompokId))
            ->when($days !== 'all', fn (Builder $q) => $q->whereBetween('pohons.tanggal', [$start->toDateString(), $end->toDateString()]))
            ->whereBetween('pohons.tanggal', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('pohons.tanggal, COUNT(*) as total, COALESCE(SUM(batangs.volume), 0) as volume_total')
            ->groupBy('pohons.tanggal')
            ->get()->keyBy('tanggal');

        $trend = [];
        if ($days === 'all') {
            for ($month = $start->startOfMonth(); $month->lte($end); $month = $month->addMonth()) {
                $key = $month->format('Y-m');
                $trend[] = [
                    'tanggal' => $month->toDateString(),
                    'pohon' => (int) $trendRows->filter(fn ($value, $date) => str_starts_with($date, $key))->sum(),
                    'batang' => (int) $trendBatangRows->filter(fn ($row, $date) => str_starts_with($date, $key))->sum('total'),
                    'volume' => (float) $trendBatangRows->filter(fn ($row, $date) => str_starts_with($date, $key))->sum('volume_total'),
                ];
            }
        } else {
            for ($date = $start; $date->lte($end); $date = $date->addDay()) {
                $trend[] = [
                    'tanggal' => $date->toDateString(),
                    'pohon' => (int) ($trendRows[$date->toDateString()] ?? 0),
                    'batang' => (int) ($trendBatangRows[$date->toDateString()]?->total ?? 0),
                    'volume' => (float) ($trendBatangRows[$date->toDateString()]?->volume_total ?? 0),
                ];
            }
        }

        $kelompokRows = Kelompok::query()
            ->when($kelompokId, fn (Builder $q) => $q->whereKey($kelompokId))
            ->withCount([
                'pohons' => fn (Builder $q) => $q->when($days !== 'all', fn (Builder $q) => $q->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])),
                'pohons as pohon_angkutan_count' => fn (Builder $q) => $q->whereNotNull('dokumen_angkutan_id')
                    ->when($days !== 'all', fn (Builder $q) => $q->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])),
            ])
            ->get(['id', 'nama_kelompok']);
        $batangByKelompok = Batang::query()
            ->join('pohons', 'pohons.id', '=', 'batangs.pohon_id')
            ->when($kelompokId, fn (Builder $q) => $q->where('pohons.kelompok_id', $kelompokId))
            ->when($days !== 'all', fn (Builder $q) => $q->whereBetween('pohons.tanggal', [$start->toDateString(), $end->toDateString()]))
            ->selectRaw('pohons.kelompok_id, COUNT(*) as batang_total')
            ->selectRaw('COALESCE(SUM(batangs.volume), 0) as volume_total')
            ->selectRaw('SUM(CASE WHEN pohons.dokumen_angkutan_id IS NOT NULL THEN 1 ELSE 0 END) as batang_angkutan')
            ->selectRaw('COALESCE(SUM(CASE WHEN pohons.dokumen_angkutan_id IS NOT NULL THEN batangs.volume ELSE 0 END), 0) as volume_angkutan')
            ->selectRaw('SUM(CASE WHEN pohons.dokumen_angkutan_id IS NOT NULL AND batangs.skshhk_id IS NOT NULL THEN 1 ELSE 0 END) as batang_skshhk')
            ->selectRaw('COUNT(DISTINCT CASE WHEN pohons.dokumen_angkutan_id IS NOT NULL AND batangs.skshhk_id IS NOT NULL THEN pohons.id END) as pohon_skshhk')
            ->selectRaw('COALESCE(SUM(CASE WHEN pohons.dokumen_angkutan_id IS NOT NULL AND batangs.skshhk_id IS NOT NULL THEN batangs.volume ELSE 0 END), 0) as volume_skshhk')
            ->groupBy('pohons.kelompok_id')
            ->get()->keyBy('kelompok_id');
        $psdhByKelompok = Lhp::query()
            ->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId))
            ->whereNotNull('kelompok_id')
            ->when($days !== 'all', fn (Builder $q) => $q->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()]))
            ->selectRaw('kelompok_id, COALESCE(SUM(psdh), 0) as total_psdh')
            ->groupBy('kelompok_id')
            ->pluck('total_psdh', 'kelompok_id');
        $pnbpByKelompok = Pnbp::query()
            ->join('lhps', 'lhps.id', '=', 'pnbps.lhp_id')
            ->whereNotNull('pnbps.tanggal_bayar')->whereNotNull('pnbps.ntpn')
            ->whereNotNull('lhps.kelompok_id')
            ->when($kelompokId, fn (Builder $q) => $q->where('lhps.kelompok_id', $kelompokId))
            ->when($days !== 'all', fn (Builder $q) => $q->whereBetween('pnbps.tanggal_bayar', [$start->toDateString(), $end->toDateString()]))
            ->selectRaw('lhps.kelompok_id, COALESCE(SUM(pnbps.jumlah), 0) as total_dibayar')
            ->groupBy('lhps.kelompok_id')
            ->pluck('total_dibayar', 'lhps.kelompok_id');

        return [
            'updatedAt' => now()->toIso8601String(),
            'periode' => ['days' => $days, 'granularity' => $days === 'all' ? 'month' : 'day', 'from' => $start->toDateString(), 'to' => $end->toDateString(), 'latestDate' => $latestDate],
            'summary' => [
                'pohon' => $pohonTotal,
                'batang' => $batangTotal,
                'volume' => $volumeTotal,
                'pohonTerdokumen' => $pohonTerdokumen,
                'batangTerdokumen' => $batangTerdokumen,
                'volumeTerdokumen' => $volumeTerdokumen,
                'dokumenAngkutan' => (clone $pohons)->whereNotNull('dokumen_angkutan_id')->distinct()->count('dokumen_angkutan_id'),
                'skshhk' => (clone $batangSkshhkTerdokumen)->distinct()->count('skshhk_id'),
                'batangSkshhkTerdokumen' => (clone $batangSkshhkTerdokumen)->count(),
                'volumeSkshhkTerdokumen' => (float) (clone $batangSkshhkTerdokumen)->sum('volume'),
                'totalPsdh' => (float) (clone $lhps)->sum('psdh'),
                'totalPnbpDibayar' => (float) (clone $pnbpPaid)->sum('jumlah'),
                'pnbpDibayarCount' => (clone $pnbpPaid)->count(),
                'psdhTanpaKelompok' => $kelompokId ? 0 : (float) Lhp::query()->whereNull('kelompok_id')
                    ->when($days !== 'all', fn (Builder $q) => $q->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()]))->sum('psdh'),
                'pnbpTanpaKelompok' => $kelompokId ? 0 : (float) (clone $pnbpPaid)
                    ->whereHas('lhp', fn (Builder $lhp) => $lhp->whereNull('kelompok_id'))->sum('jumlah'),
                'pohonPeriode' => (int) $trendRows->sum(),
                'batangPeriode' => (int) $trendBatangRows->sum('total'),
                'volumePeriode' => (float) $trendBatangRows->sum('volume_total'),
            ],
            'trend' => $trend,
            'kelompok' => $kelompokRows->map(fn ($row) => [
                'id' => $row->id,
                'nama' => $row->nama_kelompok,
                'pohon' => $row->pohons_count,
                'batang' => (int) ($batangByKelompok[$row->id]?->batang_total ?? 0),
                'volume' => (float) ($batangByKelompok[$row->id]?->volume_total ?? 0),
                'pohonTerdokumen' => $row->pohon_angkutan_count,
                'batangTerdokumen' => (int) ($batangByKelompok[$row->id]?->batang_angkutan ?? 0),
                'volumeTerdokumen' => (float) ($batangByKelompok[$row->id]?->volume_angkutan ?? 0),
                'pohonSkshhkTerdokumen' => (int) ($batangByKelompok[$row->id]?->pohon_skshhk ?? 0),
                'batangSkshhkTerdokumen' => (int) ($batangByKelompok[$row->id]?->batang_skshhk ?? 0),
                'volumeSkshhkTerdokumen' => (float) ($batangByKelompok[$row->id]?->volume_skshhk ?? 0),
                'totalPsdh' => (float) ($psdhByKelompok[$row->id] ?? 0),
                'totalPnbpDibayar' => (float) ($pnbpByKelompok[$row->id] ?? 0),
            ])->all(),
        ];
    }
}
