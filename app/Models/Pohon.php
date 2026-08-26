<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;

use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Pohon extends Model
{
    use Userstamps, LogsActivity;
    protected $guarded = [];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    public function batangs()
    {
        return $this->hasMany(Batang::class);
    }

    public function petak()
    {
        return $this->belongsTo(Petak::class);
    }

    public function jenisPohon()
    {
        return $this->belongsTo(JenisPohon::class);
    }

    public function kelompok()
    {
        return $this->belongsTo(Kelompok::class);
    }

    public function dokumenAngkutan()
    {
        return $this->belongsTo(DokumenAngkutan::class);
    }

    public function skshhk()
    {
        return $this->belongsTo(Skshhk::class);
    }
}
