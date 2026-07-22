<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseRecord extends Model
{
    protected $fillable = [
        'purchase_document_id', 'staff_accounting_id', 'manager_id', 'notes', 'status', 'revision_note', 'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
        ];
    }

    public function purchaseDocument()
    {
        return $this->belongsTo(PurchaseDocument::class);
    }

    public function staffAccounting()
    {
        return $this->belongsTo(User::class, 'staff_accounting_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function transitionTo(string $newStatus, ?string $note = null, ?int $managerId = null)
    {
        $validTransitions = [
            'Diajukan' => ['Diarsipkan', 'Direvisi'],
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
        if ($managerId !== null) {
            $this->manager_id = $managerId;
        }
        if ($newStatus === 'Diarsipkan' && !$this->archived_at) {
            $this->archived_at = now();
        }
        $this->save();
    }
}
