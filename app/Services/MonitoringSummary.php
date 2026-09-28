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
    public function forScope(?int $kelompokId, int|string $days, ?MonitoringPeriod $period = null): array
    {
        $period ??= MonitoringPeriod::forDays($days);
        $end = $period->to;

        $pohons = $this->inPeriod(Pohon::query()
            ->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId)), 'tanggal', $period);
        $firstDate = $period->from ? null : (clone $pohons)->min('tanggal');
        $start = $period->from ?? ($firstDate ? CarbonImmutable::parse($firstDate) : $end);
        $batangs = Batang::query()->whereHas('pohon', fn (Builder $q) => $this->inPeriod(
            $q->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId)),
            'tanggal', $period
        ));

        $pohonTotal = (clone $pohons)->count();
        $batangTotal = (clone $batangs)->count();
        $volumeTotal = (float) (clone $batangs)->sum('volume');
        $transportPohons = $this->inPeriod(Pohon::query()
            ->join('dokumen_angkutans', 'dokumen_angkutans.id', '=', 'pohons.dokumen_angkutan_id')
            ->when($kelompokId, fn (Builder $q) => $q->where('pohons.kelompok_id', $kelompokId)),
            'dokumen_angkutans.tanggal', $period);
        $transportBatangs = $this->inPeriod(Batang::query()
            ->join('pohons', 'pohons.id', '=', 'batangs.pohon_id')
            ->join('dokumen_angkutans', 'dokumen_angkutans.id', '=', 'pohons.dokumen_angkutan_id')
            ->when($kelompokId, fn (Builder $q) => $q->where('pohons.kelompok_id', $kelompokId)),
            'dokumen_angkutans.tanggal', $period);
        $shipmentBatangs = $this->inPeriod(Batang::query()
            ->join('pohons', 'pohons.id', '=', 'batangs.pohon_id')
            ->join('skshhks', 'skshhks.id', '=', 'batangs.skshhk_id')
            ->whereNotNull('pohons.dokumen_angkutan_id')
            ->when($kelompokId, fn (Builder $q) => $q->where('pohons.kelompok_id', $kelompokId)),
            'skshhks.tanggal', $period);
        $pohonTerdokumen = (clone $transportPohons)->distinct()->count('pohons.id');
        $batangTerdokumen = (clone $transportBatangs)->count();
        $volumeTerdokumen = (float) (clone $transportBatangs)->sum('batangs.volume');
        $lhps = $this->inPeriod(Lhp::query()
            ->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId)), 'tanggal', $period);
        $pnbpPaid = $this->inPeriod(Pnbp::query()->whereNotNull('tanggal_bayar')->whereNotNull('ntpn')
            ->when($kelompokId, fn (Builder $q) => $q->whereHas('lhp', fn (Builder $lhp) => $lhp->where('kelompok_id', $kelompokId))), 'tanggal_bayar', $period);

        $trendRows = (clone $pohons)
            ->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('tanggal, COUNT(*) as total')
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');
        $trendBatangRows = $this->inPeriod(Batang::query()
            ->join('pohons', 'pohons.id', '=', 'batangs.pohon_id')
            ->when($kelompokId, fn (Builder $q) => $q->where('pohons.kelompok_id', $kelompokId)), 'pohons.tanggal', $period)
            ->selectRaw('pohons.tanggal, COUNT(*) as total, COALESCE(SUM(batangs.volume), 0) as volume_total')
            ->groupBy('pohons.tanggal')
            ->get()->keyBy('tanggal');

        $trend = [];
        if ($period->granularity() === 'month') {
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
                'pohons' => fn (Builder $q) => $this->inPeriod($q, 'tanggal', $period),
            ])
            ->get(['id', 'nama_kelompok']);
        $batangByKelompok = $this->inPeriod(Batang::query()
            ->join('pohons', 'pohons.id', '=', 'batangs.pohon_id')
            ->when($kelompokId, fn (Builder $q) => $q->where('pohons.kelompok_id', $kelompokId)), 'pohons.tanggal', $period)
            ->selectRaw('pohons.kelompok_id, COUNT(*) as batang_total')
            ->selectRaw('COALESCE(SUM(batangs.volume), 0) as volume_total')
            ->groupBy('pohons.kelompok_id')
            ->get()->keyBy('kelompok_id');
        $pohonTransportByKelompok = (clone $transportPohons)
            ->selectRaw('pohons.kelompok_id, COUNT(*) as total')
            ->groupBy('pohons.kelompok_id')->get()->keyBy('kelompok_id');
        $transportByKelompok = (clone $transportBatangs)
            ->selectRaw('pohons.kelompok_id, COUNT(*) as batang_total, COALESCE(SUM(batangs.volume), 0) as volume_total')
            ->groupBy('pohons.kelompok_id')->get()->keyBy('kelompok_id');
        $shipmentByKelompok = (clone $shipmentBatangs)
            ->selectRaw('pohons.kelompok_id, COUNT(DISTINCT pohons.id) as pohon_total, COUNT(*) as batang_total, COALESCE(SUM(batangs.volume), 0) as volume_total')
            ->groupBy('pohons.kelompok_id')->get()->keyBy('kelompok_id');
        $psdhByKelompok = $this->inPeriod(Lhp::query()
            ->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId))
            ->whereNotNull('kelompok_id'), 'tanggal', $period)
            ->selectRaw('kelompok_id, COALESCE(SUM(psdh), 0) as total_psdh')
            ->groupBy('kelompok_id')
            ->pluck('total_psdh', 'kelompok_id');
        $pnbpByKelompok = $this->inPeriod(Pnbp::query()
            ->join('lhps', 'lhps.id', '=', 'pnbps.lhp_id')
            ->whereNotNull('pnbps.tanggal_bayar')->whereNotNull('pnbps.ntpn')
            ->whereNotNull('lhps.kelompok_id')
            ->when($kelompokId, fn (Builder $q) => $q->where('lhps.kelompok_id', $kelompokId)), 'pnbps.tanggal_bayar', $period)
            ->selectRaw('lhps.kelompok_id, COALESCE(SUM(pnbps.jumlah), 0) as total_dibayar')
            ->groupBy('lhps.kelompok_id')
            ->pluck('total_dibayar', 'lhps.kelompok_id');

        return [
            'updatedAt' => now()->toIso8601String(),
            'periode' => ['days' => $days, 'granularity' => $period->granularity(), 'from' => $start->toDateString(), 'to' => $end->toDateString()],
            'summary' => [
                'pohon' => $pohonTotal,
                'batang' => $batangTotal,
                'volume' => $volumeTotal,
                'pohonTerdokumen' => $pohonTerdokumen,
                'batangTerdokumen' => $batangTerdokumen,
                'volumeTerdokumen' => $volumeTerdokumen,
                'dokumenAngkutan' => (clone $transportPohons)->distinct()->count('dokumen_angkutans.id'),
                'skshhk' => (clone $shipmentBatangs)->distinct()->count('skshhks.id'),
                'batangSkshhkTerdokumen' => (clone $shipmentBatangs)->count(),
                'volumeSkshhkTerdokumen' => (float) (clone $shipmentBatangs)->sum('batangs.volume'),
                'totalPsdh' => (int) ceil((float) (clone $lhps)->sum('psdh')),
                'totalPnbpDibayar' => (int) ceil((float) (clone $pnbpPaid)->sum('jumlah')),
                'pnbpDibayarCount' => (clone $pnbpPaid)->count(),
                'psdhTanpaKelompok' => $kelompokId ? 0 : (int) ceil((float) $this->inPeriod(Lhp::query()->whereNull('kelompok_id'), 'tanggal', $period)->sum('psdh')),
                'pnbpTanpaKelompok' => $kelompokId ? 0 : (int) ceil((float) (clone $pnbpPaid)
                    ->whereHas('lhp', fn (Builder $lhp) => $lhp->whereNull('kelompok_id'))->sum('jumlah')),
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
                'pohonTerdokumen' => (int) ($pohonTransportByKelompok[$row->id]?->total ?? 0),
                'batangTerdokumen' => (int) ($transportByKelompok[$row->id]?->batang_total ?? 0),
                'volumeTerdokumen' => (float) ($transportByKelompok[$row->id]?->volume_total ?? 0),
                'pohonSkshhkTerdokumen' => (int) ($shipmentByKelompok[$row->id]?->pohon_total ?? 0),
                'batangSkshhkTerdokumen' => (int) ($shipmentByKelompok[$row->id]?->batang_total ?? 0),
                'volumeSkshhkTerdokumen' => (float) ($shipmentByKelompok[$row->id]?->volume_total ?? 0),
                'totalPsdh' => (int) ceil((float) ($psdhByKelompok[$row->id] ?? 0)),
                'totalPnbpDibayar' => (int) ceil((float) ($pnbpByKelompok[$row->id] ?? 0)),
            ])->all(),
        ];
    }

    private function inPeriod(Builder $query, string $column, MonitoringPeriod $period): Builder
    {
        return $period->from
            ? $query->whereBetween($column, [$period->from->toDateString(), $period->to->toDateString()])
            : $query->where($column, '<=', $period->to->toDateString());
    }
}
