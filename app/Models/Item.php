<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'kategori',
        'satuan',
        'stok',
        'min_stok',
        'deskripsi',
    ];

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'item_id');
    }

    public function locations(): HasMany
    {
        return $this->hasMany(ItemLocation::class, 'item_id');
    }

    public function loans(): HasMany
    {
        return $this->hasMany(ItemLoan::class, 'item_id');
    }
}
