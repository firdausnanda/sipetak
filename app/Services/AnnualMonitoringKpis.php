<?php

namespace App\Services;

use App\Models\Lhp;
use App\Models\Pohon;
use App\Models\TargetTebang;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class AnnualMonitoringKpis
{
    public function forScope(?int $kelompokId, ?MonitoringPeriod $period = null): array
    {
        $period ??= MonitoringPeriod::forDays('year');
        $through = $period->to->toDateString();
        $year = $period->to->year;
        $yearStart = $period->to->startOfYear();
        $targetFrom = $period->from && $period->from->greaterThan($yearStart)
            ? $period->from->toDateString()
            : $yearStart->toDateString();

        $harvestTrees = $this->inPeriod(Pohon::query()
            ->when($kelompokId, fn ($query) => $query->where('kelompok_id', $kelompokId)), 'tanggal', $period)->count();
        $harvestLogs = $this->totals(
            $this->inPeriod($this->logs($kelompokId), 'pohons.tanggal', $period)
        );

        $targets = TargetTebang::query()->where('tahun', $year)
            ->when($kelompokId, fn ($query) => $query->where('kelompok_id', $kelompokId))
            ->get(['kelompok_id', 'jumlah_pohon', 'volume_taksasi']);
        $targetIds = $targets->pluck('kelompok_id')->all();
        $targetedTrees = $targetIds
            ? Pohon::query()->whereIn('kelompok_id', $targetIds)->whereBetween('tanggal', [$targetFrom, $through])->count()
            : 0;
        $targetedVolume = $targetIds
            ? (float) $this->logs($kelompokId)->whereIn('pohons.kelompok_id', $targetIds)
                ->whereBetween('pohons.tanggal', [$targetFrom, $through])->sum('batangs.volume')
            : 0.0;
        $targetTrees = $targets->isEmpty() ? null : (int) $targets->sum('jumlah_pohon');
        $targetVolume = $targets->isEmpty() ? null : round((float) $targets->sum('volume_taksasi'), 3);

        $tpkIn = $this->totals(
            $this->inPeriod($this->logs($kelompokId)
                ->join('dokumen_angkutans', 'dokumen_angkutans.id', '=', 'pohons.dokumen_angkutan_id'),
                'dokumen_angkutans.tanggal', $period)
        );
        $buyerOut = $this->totals(
            $this->inPeriod($this->logs($kelompokId)
                ->whereNotNull('pohons.dokumen_angkutan_id')
                ->join('skshhks', 'skshhks.id', '=', 'batangs.skshhk_id'),
                'skshhks.tanggal', $period)
        );
        $stockIn = $this->totals(
            $this->logs($kelompokId)
                ->join('dokumen_angkutans', 'dokumen_angkutans.id', '=', 'pohons.dokumen_angkutan_id')
                ->whereDate('dokumen_angkutans.tanggal', '<=', $through)
        );
        $stockOut = $this->totals(
            $this->logs($kelompokId)
                ->join('dokumen_angkutans', 'dokumen_angkutans.id', '=', 'pohons.dokumen_angkutan_id')
                ->join('skshhks', 'skshhks.id', '=', 'batangs.skshhk_id')
                ->whereDate('dokumen_angkutans.tanggal', '<=', $through)
                ->whereDate('skshhks.tanggal', '<=', $through)
        );
        $stock = [
            'logs' => $stockIn['logs'] - $stockOut['logs'],
            'volume' => round($stockIn['volume'] - $stockOut['volume'], 4),
        ];
        $lhpVolume = (float) $this->inPeriod(Lhp::query()
            ->when($kelompokId, fn ($query) => $query->where('kelompok_id', $kelompokId)), 'tanggal', $period)->sum('volume');

        $qualityRows = $this->inPeriod($this->logs($kelompokId), 'pohons.tanggal', $period)
            ->selectRaw('batangs.mutu as code, COUNT(*) as logs, COALESCE(SUM(batangs.volume), 0) as volume')
            ->groupBy('batangs.mutu')->get()->keyBy('code');
        $quality = array_map(fn (string $code) => [
            'code' => $code,
            'logs' => (int) ($qualityRows[$code]->logs ?? 0),
            'volume' => (float) ($qualityRows[$code]->volume ?? 0),
            'volumePercent' => $this->percent((float) ($qualityRows[$code]->volume ?? 0), $harvestLogs['volume']),
        ], ['P', 'D', 'T', 'M']);

        return [
            'year' => $year,
            'through' => $through,
            'harvest' => [
                'trees' => $harvestTrees,
                'logs' => $harvestLogs['logs'],
                'volume' => $harvestLogs['volume'],
                'targetedGroups' => $targets->count(),
                'targetedActualTrees' => $targetedTrees,
                'targetedActualVolume' => $targetedVolume,
                'targetTrees' => $targetTrees,
                'targetVolume' => $targetVolume,
                'treePercent' => $this->percent($targetedTrees, $targetTrees),
                'volumePercent' => $this->percent($targetedVolume, $targetVolume),
            ],
            'tpkIn' => [
                ...$tpkIn,
                'logPercent' => $this->percent($tpkIn['logs'], $harvestLogs['logs']),
                'volumePercent' => $this->percent($tpkIn['volume'], $harvestLogs['volume']),
            ],
            'lhp' => [
                'volume' => $lhpVolume,
                'volumePercent' => $this->percent($lhpVolume, $tpkIn['volume']),
            ],
            'buyerOut' => [
                ...$buyerOut,
                'volumePercent' => $this->percent($buyerOut['volume'], $harvestLogs['volume']),
            ],
            'stock' => $stock,
            'quality' => $quality,
        ];
    }

    private function logs(?int $kelompokId): Builder
    {
        return DB::table('batangs')
            ->join('pohons', 'pohons.id', '=', 'batangs.pohon_id')
            ->when($kelompokId, fn (Builder $query) => $query->where('pohons.kelompok_id', $kelompokId));
    }

    private function inPeriod(EloquentBuilder|Builder $query, string $column, MonitoringPeriod $period): EloquentBuilder|Builder
    {
        return $period->from
            ? $query->whereBetween($column, [$period->from->toDateString(), $period->to->toDateString()])
            : $query->where($column, '<=', $period->to->toDateString());
    }

    private function totals(Builder $query): array
    {
        $row = $query->selectRaw('COUNT(*) as logs, COALESCE(SUM(batangs.volume), 0) as volume')->first();

        return ['logs' => (int) $row->logs, 'volume' => (float) $row->volume];
    }

    private function percent(int|float $actual, int|float|null $total): ?float
    {
        return $total > 0 ? round($actual / $total * 100, 1) : null;
    }
}
