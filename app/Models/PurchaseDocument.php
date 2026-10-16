<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PurchaseDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_dokumen',
        'purchase_id',
        'created_by',
        'catatan',
        'status',
    ];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(PurchaseReport::class, 'purchase_document_id');
    }

    public function reviewHistories(): MorphMany
    {
        return $this->morphMany(ReviewHistory::class, 'reviewable');
    }
}
