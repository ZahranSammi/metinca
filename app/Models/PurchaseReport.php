<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PurchaseReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_laporan',
        'purchase_document_id',
        'judul_laporan',
        'periode_mulai',
        'periode_selesai',
        'total_transaksi',
        'total_pengeluaran',
        'catatan',
        'created_by',
        'status',
    ];

    public function purchaseDocument(): BelongsTo
    {
        return $this->belongsTo(PurchaseDocument::class, 'purchase_document_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewHistories(): MorphMany
    {
        return $this->morphMany(ReviewHistory::class, 'reviewable');
    }
}
