<?php

namespace App\Services;

use App\Models\Lhp;
use App\Models\Pohon;
use App\Models\TargetTebang;
use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class AnnualMonitoringKpis
{
    public function forScope(?int $kelompokId): array
    {
        $today = CarbonImmutable::today();
        $from = $today->startOfYear()->toDateString();
        $through = $today->toDateString();
        $year = $today->year;

        $harvestTrees = Pohon::query()
            ->when($kelompokId, fn ($query) => $query->where('kelompok_id', $kelompokId))
            ->whereBetween('tanggal', [$from, $through])->count();
        $harvestLogs = $this->totals(
            $this->logs($kelompokId)->whereBetween('pohons.tanggal', [$from, $through])
        );

        $targets = TargetTebang::query()->where('tahun', $year)
            ->when($kelompokId, fn ($query) => $query->where('kelompok_id', $kelompokId))
            ->get(['kelompok_id', 'jumlah_pohon', 'volume_taksasi']);
        $targetIds = $targets->pluck('kelompok_id')->all();
        $targetedTrees = $targetIds
            ? Pohon::query()->whereIn('kelompok_id', $targetIds)->whereBetween('tanggal', [$from, $through])->count()
            : 0;
        $targetedVolume = $targetIds
            ? (float) $this->logs($kelompokId)->whereIn('pohons.kelompok_id', $targetIds)
                ->whereBetween('pohons.tanggal', [$from, $through])->sum('batangs.volume')
            : 0.0;
        $targetTrees = $targets->isEmpty() ? null : (int) $targets->sum('jumlah_pohon');
        $targetVolume = $targets->isEmpty() ? null : round((float) $targets->sum('volume_taksasi'), 3);

        $tpkIn = $this->totals(
            $this->logs($kelompokId)
                ->join('dokumen_angkutans', 'dokumen_angkutans.id', '=', 'pohons.dokumen_angkutan_id')
                ->whereBetween('dokumen_angkutans.tanggal', [$from, $through])
        );
        $buyerOut = $this->totals(
            $this->logs($kelompokId)
                ->whereNotNull('pohons.dokumen_angkutan_id')
                ->join('skshhks', 'skshhks.id', '=', 'batangs.skshhk_id')
                ->whereBetween('skshhks.tanggal', [$from, $through])
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
        $lhpVolume = (float) Lhp::query()
            ->when($kelompokId, fn ($query) => $query->where('kelompok_id', $kelompokId))
            ->whereBetween('tanggal', [$from, $through])->sum('volume');

        $qualityRows = $this->logs($kelompokId)
            ->whereBetween('pohons.tanggal', [$from, $through])
            ->selectRaw('batangs.mutu as code, COUNT(*) as logs, COALESCE(SUM(batangs.volume), 0) as volume')
            ->groupBy('batangs.mutu')->get()->keyBy('code');
        $quality = array_map(fn (string $code) => [
            'code' => $code,
            'logs' => (int) ($qualityRows[$code]->logs ?? 0),
            'volume' => (float) ($qualityRows[$code]->volume ?? 0),
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
                'volumePercent' => $this->percent($lhpVolume, $stock['volume']),
            ],
            'buyerOut' => [
                ...$buyerOut,
                'logPercent' => $this->percent($buyerOut['logs'], $stock['logs']),
                'volumePercent' => $this->percent($buyerOut['volume'], $stock['volume']),
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
