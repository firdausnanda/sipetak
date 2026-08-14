<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class DokumenAngkutan extends Model
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

    public function kelompok()
    {
        return $this->belongsTo(Kelompok::class);
    }

    public function petaks()
    {
        return $this->belongsToMany(Petak::class, 'dokumen_angkutan_petak');
    }

    public function pohons()
    {
        return $this->hasMany(Pohon::class);
    }
}
