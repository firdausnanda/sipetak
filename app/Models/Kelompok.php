<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property string|null $logo_url
 */

class Kelompok extends Model
{
    use LogsActivity;
    protected $guarded = [];

    public function pohons()
    {
        return $this->hasMany(Pohon::class);
    }

    public function rencanaTebangs()
    {
        return $this->hasMany(RencanaTebang::class);
    }

    public function dokumenAngkutans()
    {
        return $this->hasMany(DokumenAngkutan::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
