<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;

class Skshhk extends Model
{
    use Userstamps;

    protected $guarded = [];

    public function pohons()
    {
        return $this->hasMany(Pohon::class);
    }
}
