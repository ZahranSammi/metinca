<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairReport extends Model
{
    protected $fillable = [
        'fund_request_id', 'staff_id', 'manager_id', 'period_start', 'period_end',
        'summary', 'actual_amount', 'proof_path', 'status', 'verified_at', 'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'verified_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function fundRequest()
    {
        return $this->belongsTo(FundRequest::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function transitionTo(string $newStatus, ?string $note = null, ?int $managerId = null)
    {
        $validTransitions = [
            'Dikirim' => ['Diverifikasi', 'Direvisi'],
            'Diverifikasi' => ['Disetujui', 'Direvisi'],
            'Direvisi' => ['Dikirim'],
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
        if ($newStatus === 'Diverifikasi' && !$this->verified_at) {
            $this->verified_at = now();
        }
        if ($newStatus === 'Disetujui' && !$this->approved_at) {
            $this->approved_at = now();
        }
        $this->save();
    }
}
