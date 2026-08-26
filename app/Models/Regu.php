<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Regu extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function kelompok()
    {
        return $this->belongsTo(Kelompok::class);
    }

    public function members()
    {
        return $this->hasMany(ReguMember::class);
    }

    public function dailyOperations()
    {
        return $this->hasMany(DailyOperation::class);
    }
}
