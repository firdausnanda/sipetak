<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Lhp extends Model
{
    use HasFactory, Userstamps, LogsActivity;

    protected $fillable = [
        'kelompok_id',
        'no_lhp',
        'tanggal',
        'jenis_pohon_id',
        'sortimen',
        'volume',
        'tarif',
        'psdh',
    ];

    protected $casts = [
        'sortimen' => \App\Enums\SortimenEnum::class,
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    public function kelompok()
    {
        return $this->belongsTo(Kelompok::class);
    }

    public function jenisPohon()
    {
        return $this->belongsTo(JenisPohon::class, 'jenis_pohon_id');
    }
}
