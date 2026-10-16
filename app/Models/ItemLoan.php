<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemLoan extends Model
{
    protected $fillable = [
        'nomor_peminjaman',
        'item_id',
        'jumlah',
        'from_branch_id',
        'from_room_id',
        'to_branch_id',
        'to_room_id',
        'borrower_id',
        'borrower_name',
        'reviewed_by',
        'reviewed_at',
        'catatan_review',
        'tanggal_pinjam',
        'tenggat_kembali',
        'tanggal_kembali',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_pinjam' => 'date',
        'tenggat_kembali' => 'date',
        'tanggal_kembali' => 'date',
        'reviewed_at' => 'datetime',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function fromBranch()
    {
        return $this->belongsTo(Branch::class, 'from_branch_id');
    }

    public function fromRoom()
    {
        return $this->belongsTo(Room::class, 'from_room_id');
    }

    public function toBranch()
    {
        return $this->belongsTo(Branch::class, 'to_branch_id');
    }

    public function toRoom()
    {
        return $this->belongsTo(Room::class, 'to_room_id');
    }

    public function borrower()
    {
        return $this->belongsTo(User::class, 'borrower_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
