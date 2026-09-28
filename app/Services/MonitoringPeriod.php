<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use InvalidArgumentException;

class MonitoringPeriod
{
    public function __construct(
        public readonly int|string $days,
        public readonly ?CarbonImmutable $from,
        public readonly CarbonImmutable $to,
    ) {}

    public static function forDays(int|string $days): self
    {
        $today = CarbonImmutable::today();

        if ($days === 'all') {
            return new self($days, null, $today);
        }

        if ($days === 'year') {
            return new self($days, $today->startOfYear(), $today);
        }

        if (! in_array($days, [7, 30, 90], true)) {
            throw new InvalidArgumentException('Periode monitoring tidak valid.');
        }

        return new self($days, $today->subDays($days - 1), $today);
    }

    public function granularity(): string
    {
        return in_array($this->days, ['year', 'all'], true) ? 'month' : 'day';
    }
}
