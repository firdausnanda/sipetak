<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyOperationDetail extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function dailyOperation()
    {
        return $this->belongsTo(DailyOperation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
