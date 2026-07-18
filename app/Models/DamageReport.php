<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DamageReport extends Model
{
    protected $fillable = ['user_id', 'machine_id', 'photo_path', 'description', 'status', 'revision_note'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }

    public function fundRequest()
    {
        return $this->hasOne(FundRequest::class);
    }

    public function transitionTo(string $newStatus, ?string $note = null)
    {
        $validTransitions = [
            'Dilaporkan' => ['Diverifikasi', 'Direvisi', 'Ditolak'],
            'Direvisi' => ['Dilaporkan'],
            'Diverifikasi' => ['Pengajuan Dana'],
            'Pengajuan Dana' => ['Dalam Perbaikan', 'Diverifikasi'],
            'Dalam Perbaikan' => ['Perbaikan Berjalan'],
            'Perbaikan Berjalan' => ['Menunggu Laporan'],
            'Menunggu Laporan' => ['Menunggu Verifikasi Laporan'],
            'Menunggu Verifikasi Laporan' => ['Selesai'],
        ];

        if (!isset($validTransitions[$this->status]) || !in_array($newStatus, $validTransitions[$this->status])) {
            abort(422, "Transisi status tidak valid dari {$this->status} ke {$newStatus}");
        }

        $this->status = $newStatus;
        if ($note !== null) {
            $this->revision_note = $note;
        } elseif ($newStatus !== 'Direvisi' && $newStatus !== 'Ditolak') {
            $this->revision_note = null;
        }
        $this->save();
    }
}
