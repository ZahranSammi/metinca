<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'branch_id',
        'nama_ruangan',
        'kode_ruangan',
        'lantai',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function itemLocations()
    {
        return $this->hasMany(ItemLocation::class);
    }
}
