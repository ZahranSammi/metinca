<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseRequest extends Model
{
    protected $fillable = ['requester_id', 'item_name', 'quantity', 'description', 'status'];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function fundProposal()
    {
        return $this->hasOne(FundProposal::class);
    }

    public function transitionTo(string $newStatus)
    {
        $validTransitions = [
            'Diajukan' => ['Masuk Daftar Pembelian'],
            'Masuk Daftar Pembelian' => ['Selesai'],
        ];

        if (!isset($validTransitions[$this->status]) || !in_array($newStatus, $validTransitions[$this->status])) {
            abort(422, "Transisi status tidak valid dari {$this->status} ke {$newStatus}");
        }

        $this->status = $newStatus;
        $this->save();
    }
}
