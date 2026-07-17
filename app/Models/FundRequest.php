<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FundRequest extends Model
{
    protected $fillable = ['damage_report_id', 'amount', 'description', 'status', 'staff_id', 'manager_id'];

    public function damageReport()
    {
        return $this->belongsTo(DamageReport::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }
}
