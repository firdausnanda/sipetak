<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Pnbp extends Model
{
    use HasFactory, Userstamps, LogsActivity;

    protected $fillable = [
        'lhp_id',
        'kode_billing',
        'tanggal_kode_billing',
        'tanggal_bayar',
        'ntpn',
        'jumlah',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_kode_billing' => 'date',
        'tanggal_bayar' => 'date',
        'jumlah' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    public function lhp()
    {
        return $this->belongsTo(Lhp::class);
    }
}
