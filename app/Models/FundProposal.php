<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FundProposal extends Model
{
    protected $fillable = [
        'purchase_request_id', 'staff_purchasing_id', 'staff_accounting_id', 'manager_id',
        'amount', 'description', 'status', 'revision_note', 'disbursed_at',
    ];

    protected function casts(): array
    {
        return [
            'disbursed_at' => 'datetime',
        ];
    }

    public function purchaseRequest()
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function staffPurchasing()
    {
        return $this->belongsTo(User::class, 'staff_purchasing_id');
    }

    public function staffAccounting()
    {
        return $this->belongsTo(User::class, 'staff_accounting_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function purchaseDocument()
    {
        return $this->hasOne(PurchaseDocument::class);
    }

    public function transitionTo(string $newStatus, ?string $note = null, ?int $staffAccountingId = null, ?int $managerId = null)
    {
        $validTransitions = [
            'Diajukan' => ['Menunggu Persetujuan Manager', 'Direvisi Staff Accounting'],
            'Direvisi Staff Accounting' => ['Diajukan'],
            'Menunggu Persetujuan Manager' => ['Dana Cair', 'Direvisi Manager'],
            'Direvisi Manager' => ['Diajukan'],
            'Dana Cair' => ['Dana Diterima Purchasing'],
            'Dana Diterima Purchasing' => ['Selesai Pembelian'],
        ];

        if (!isset($validTransitions[$this->status]) || !in_array($newStatus, $validTransitions[$this->status])) {
            abort(422, "Transisi status tidak valid dari {$this->status} ke {$newStatus}");
        }

        $this->status = $newStatus;
        if ($note !== null) {
            $this->revision_note = $note;
        } elseif (!in_array($newStatus, ['Direvisi Staff Accounting', 'Direvisi Manager'])) {
            $this->revision_note = null;
        }
        if ($staffAccountingId !== null) {
            $this->staff_accounting_id = $staffAccountingId;
        }
        if ($managerId !== null) {
            $this->manager_id = $managerId;
        }
        if ($newStatus === 'Dana Cair' && !$this->disbursed_at) {
            $this->disbursed_at = now();
        }
        $this->save();
    }
}
