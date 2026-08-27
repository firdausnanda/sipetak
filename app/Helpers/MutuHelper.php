<?php

namespace App\Helpers;

class MutuHelper
{
    /**
     * Dapatkan sub-kategori mutu (AI, AII, AIII) berdasarkan ukuran diameter
     * 
     * @param int|float $diameter Ukuran diameter (bisa angka desimal)
     * @return string AI, AII, atau AIII
     */
    public static function getSubKategori($diameter)
    {
        if ($diameter < 20) {
            return 'AI';
        } elseif ($diameter >= 20 && $diameter < 30) {
            return 'AII';
        } else {
            return 'AIII';
        }
    }

    /**
     * Dapatkan kategori mutu secara lengkap (misal: P-A1)
     * 
     * @param string $kategoriUtama Kategori utama (P, D, T, M)
     * @param int|float $diameter Ukuran diameter
     * @return string Kategori lengkap dengan sub-kategorinya
     */
    public static function getFullKategori($kategoriUtama, $diameter)
    {
        return $kategoriUtama . '-' . self::getSubKategori($diameter);
    }
}
