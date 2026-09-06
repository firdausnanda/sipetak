<?php

namespace App\Enums;

enum SortimenEnum: string
{
    case AI = 'AI';
    case AII = 'AII';
    case AIII = 'AIII';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
