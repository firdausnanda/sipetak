<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TabelVolume extends Model
{
    use HasFactory;

    protected $fillable = [
        'kelompok_id',
        'jenis_pohon_id',
        'diameter',
        'panjang',
        'volume',
    ];

    public function kelompok()
    {
        return $this->belongsTo(Kelompok::class);
    }

    public function jenisPohon()
    {
        return $this->belongsTo(JenisPohon::class);
    }
}
