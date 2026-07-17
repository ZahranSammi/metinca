<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DamageReport extends Model
{
    protected $fillable = ['user_id', 'machine_name', 'description', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fundRequest()
    {
        return $this->hasOne(FundRequest::class);
    }
}
