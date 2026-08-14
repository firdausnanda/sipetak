<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TujuanBongkar extends Model
{
    protected $guarded = [];

    public function kelompok()
    {
        return $this->belongsTo(Kelompok::class);
    }
}
