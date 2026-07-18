<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Machine extends Model
{
    protected $fillable = [
        'code',
        'name',
        'model_name',
        'category',
        'pic',
        'status',
        'budget',
    ];
}
