<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DailyOperation extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function regu()
    {
        return $this->belongsTo(Regu::class);
    }

    public function details()
    {
        return $this->hasMany(DailyOperationDetail::class);
    }
}
