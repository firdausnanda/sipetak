<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Mattiverse\Userstamps\Traits\Userstamps;
use Illuminate\Support\Str;

class Skshhk extends Model
{
    use Userstamps;

    protected $guarded = [];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->verification_token)) {
                $model->verification_token = (string) Str::uuid();
            }
        });
    }

    public function batangs()
    {
        return $this->hasMany(Batang::class);
    }
}
