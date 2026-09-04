<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;

use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Batang extends Model
{
    use Userstamps, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
    protected $guarded = [];

    public function setPanjangAttribute($value)
    {
        $this->attributes['panjang'] = str_replace(',', '.', $value);
    }

    public function setDiameterPangkalAttribute($value)
    {
        $this->attributes['diameter_pangkal'] = str_replace(',', '.', $value);
    }

    public function setDiameterUjungAttribute($value)
    {
        $this->attributes['diameter_ujung'] = str_replace(',', '.', $value);
    }

    public function pohon()
    {
        return $this->belongsTo(Pohon::class);
    }

    public function skshhk()
    {
        return $this->belongsTo(Skshhk::class);
    }

    public function calculateVolume()
    {
        if (!$this->pohon) {
            return null;
        }

        $avgDiameter = floor(($this->diameter_pangkal + $this->diameter_ujung) / 2);
        
        $tabelVolume = TabelVolume::where('kelompok_id', $this->pohon->kelompok_id)
            ->where('jenis_pohon_id', $this->pohon->jenis_pohon_id)
            ->where('diameter', '<=', $avgDiameter)
            ->where('panjang', '<=', $this->panjang)
            ->orderBy('diameter', 'desc')
            ->orderBy('panjang', 'desc')
            ->first();

        if ($tabelVolume) {
            $this->volume = $tabelVolume->volume;
            return $this->volume;
        }

        return null;
    }
}
