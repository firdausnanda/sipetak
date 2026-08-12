<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;

class Batang extends Model
{
    use Userstamps;
    protected $guarded = [];

    public function pohon()
    {
        return $this->belongsTo(Pohon::class);
    }
}
