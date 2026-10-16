<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'nama_cabang',
        'kode_cabang',
        'alamat',
        'telepon',
    ];

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

    public function itemLocations()
    {
        return $this->hasMany(ItemLocation::class);
    }

    public function loansOut()
    {
        return $this->hasMany(ItemLoan::class, 'from_branch_id');
    }

    public function loansIn()
    {
        return $this->hasMany(ItemLoan::class, 'to_branch_id');
    }
}
