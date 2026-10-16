<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemLocation extends Model
{
    protected $fillable = [
        'item_id',
        'branch_id',
        'room_id',
        'jumlah',
        'kondisi',
        'keterangan',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
