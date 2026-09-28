<?php

namespace App\Services;

use App\Models\Kelompok;
use App\Models\Pohon;
use App\Models\TargetTebang;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class AnnualFellingProgress
{
    public function forScope(?int $kelompokId, int $year): array
    {
        $from = sprintf('%04d-01-01', $year);
        $to = sprintf('%04d-12-31', $year);
        $groups = Kelompok::query()->when($kelompokId, fn (Builder $q) => $q->whereKey($kelompokId))
            ->orderBy('nama_kelompok')->get(['id', 'nama_kelompok']);
        $targets = TargetTebang::query()->where('tahun', $year)
            ->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId))
            ->get()->keyBy('kelompok_id');
        $trees = Pohon::query()->whereBetween('tanggal', [$from, $to])
            ->when($kelompokId, fn (Builder $q) => $q->where('kelompok_id', $kelompokId))
            ->selectRaw('kelompok_id, COUNT(*) as total')->groupBy('kelompok_id')->pluck('total', 'kelompok_id');
        $volumes = DB::table('batangs')->join('pohons', 'pohons.id', '=', 'batangs.pohon_id')
            ->whereBetween('pohons.tanggal', [$from, $to])
            ->when($kelompokId, fn ($q) => $q->where('pohons.kelompok_id', $kelompokId))
            ->selectRaw('pohons.kelompok_id, COALESCE(SUM(batangs.volume), 0) as total')
            ->groupBy('pohons.kelompok_id')->pluck('total', 'pohons.kelompok_id');

        $rows = $groups->map(function (Kelompok $group) use ($targets, $trees, $volumes) {
            $target = $targets->get($group->id);
            $actual = ['trees' => (int) ($trees[$group->id] ?? 0), 'volume' => round((float) ($volumes[$group->id] ?? 0), 3)];

            return [
                'id' => $group->id,
                'name' => $group->nama_kelompok,
                'target' => $target ? ['trees' => (int) $target->jumlah_pohon, 'volume' => (float) $target->volume_taksasi] : null,
                'actual' => $actual,
                'percent' => $target ? [
                    'trees' => round($actual['trees'] / $target->jumlah_pohon * 100, 1),
                    'volume' => round($actual['volume'] / $target->volume_taksasi * 100, 1),
                ] : null,
            ];
        })->all();

        $targeted = array_values(array_filter($rows, fn ($row) => $row['target'] !== null));
        $total = ['targetedGroups' => count($targeted), 'target' => null, 'actual' => ['trees' => 0, 'volume' => 0], 'percent' => null];
        if ($targeted) {
            $total['target'] = [
                'trees' => array_sum(array_column(array_column($targeted, 'target'), 'trees')),
                'volume' => round(array_sum(array_column(array_column($targeted, 'target'), 'volume')), 3),
            ];
            $total['actual'] = [
                'trees' => array_sum(array_column(array_column($targeted, 'actual'), 'trees')),
                'volume' => round(array_sum(array_column(array_column($targeted, 'actual'), 'volume')), 3),
            ];
            $total['percent'] = [
                'trees' => round($total['actual']['trees'] / $total['target']['trees'] * 100, 1),
                'volume' => round($total['actual']['volume'] / $total['target']['volume'] * 100, 1),
            ];
        }

        return ['year' => $year, 'groups' => $rows, 'total' => $total];
    }
}
