<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;

class Petak extends Model
{
    use Userstamps;

    protected $guarded = [];

    public function kelompok()
    {
        return $this->belongsTo(Kelompok::class);
    }
}
