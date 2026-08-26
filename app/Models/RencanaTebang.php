<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class RencanaTebang extends Model
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

    public function petak()
    {
        return $this->belongsTo(Petak::class);
    }

    public function jenisPohon()
    {
        return $this->belongsTo(JenisPohon::class);
    }
}
