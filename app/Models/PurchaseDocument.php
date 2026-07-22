<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseDocument extends Model
{
    protected $fillable = [
        'fund_proposal_id', 'staff_purchasing_id', 'staff_accounting_id',
        'item_name', 'quantity', 'unit_price', 'total_price', 'document_path', 'status', 'revision_note',
    ];

    public function fundProposal()
    {
        return $this->belongsTo(FundProposal::class);
    }

    public function staffPurchasing()
    {
        return $this->belongsTo(User::class, 'staff_purchasing_id');
    }

    public function staffAccounting()
    {
        return $this->belongsTo(User::class, 'staff_accounting_id');
    }

    public function purchaseRecord()
    {
        return $this->hasOne(PurchaseRecord::class);
    }

    public function transitionTo(string $newStatus, ?string $note = null, ?int $staffAccountingId = null)
    {
        $validTransitions = [
            'Diajukan' => ['Disetujui', 'Direvisi'],
            'Direvisi' => ['Diajukan'],
        ];

        if (!isset($validTransitions[$this->status]) || !in_array($newStatus, $validTransitions[$this->status])) {
            abort(422, "Transisi status tidak valid dari {$this->status} ke {$newStatus}");
        }

        $this->status = $newStatus;
        if ($note !== null) {
            $this->revision_note = $note;
        } elseif ($newStatus !== 'Direvisi') {
            $this->revision_note = null;
        }
        if ($staffAccountingId !== null) {
            $this->staff_accounting_id = $staffAccountingId;
        }
        $this->save();
    }
}
