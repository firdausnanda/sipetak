<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;

class Pohon extends Model
{
    use Userstamps;
    protected $guarded = [];

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
}