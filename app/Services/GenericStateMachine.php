<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Notification;
use App\Models\PurchaseDocument;
use App\Models\PurchaseReport;
use App\Models\PurchaseRequest;
use App\Models\ReviewHistory;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class GenericStateMachine
{
    /**
     * Map allowed transitions and authorization per model class.
     */
    protected static array $config = [
        PurchaseRequest::class => [
            'creators' => ['karyawan', 'manager_gudang', 'manager_accounting'],
            'reviewers' => ['staff_gudang', 'staff_accounting', 'manager_gudang', 'manager_accounting'],
            'transitions' => [
                'submit' => ['from' => ['DRAFT', 'REJECTED'], 'to' => 'SUBMITTED', 'role' => 'creators'],
                'approve' => ['from' => ['SUBMITTED'], 'to' => 'APPROVED', 'role' => 'reviewers'],
                'reject' => ['from' => ['SUBMITTED'], 'to' => 'REJECTED', 'role' => 'reviewers', 'require_notes' => true],
                'revise' => ['from' => ['REJECTED'], 'to' => 'SUBMITTED', 'role' => 'creators'],
            ],
        ],
        PurchaseDocument::class => [
            'creators' => ['staff_gudang', 'staff_accounting', 'manager_gudang', 'manager_accounting'],
            'reviewers' => ['inventarisir', 'manager_accounting', 'manager_gudang'],
            'transitions' => [
                'submit' => ['from' => ['DRAFT', 'REJECTED'], 'to' => 'SUBMITTED', 'role' => 'creators'],
                'approve' => ['from' => ['SUBMITTED'], 'to' => 'APPROVED', 'role' => 'reviewers'],
                'reject' => ['from' => ['SUBMITTED'], 'to' => 'REJECTED', 'role' => 'reviewers', 'require_notes' => true],
                'revise' => ['from' => ['REJECTED'], 'to' => 'SUBMITTED', 'role' => 'creators'],
            ],
        ],
        PurchaseReport::class => [
            'creators' => ['inventarisir', 'manager_accounting', 'manager_gudang'],
            'reviewers' => ['direktur_sdm', 'manager_gudang', 'manager_accounting'],
            'transitions' => [
                'submit' => ['from' => ['DRAFT', 'REJECTED'], 'to' => 'SUBMITTED', 'role' => 'creators'],
                'approve' => ['from' => ['SUBMITTED'], 'to' => 'APPROVED', 'role' => 'reviewers'],
                'reject' => ['from' => ['SUBMITTED'], 'to' => 'REJECTED', 'role' => 'reviewers', 'require_notes' => true],
                'archive' => ['from' => ['APPROVED'], 'to' => 'ARCHIVED', 'role' => 'reviewers'],
                'revise' => ['from' => ['REJECTED'], 'to' => 'SUBMITTED', 'role' => 'creators'],
            ],
        ],
    ];

    /**
     * Transition a document to a new state with strict role & state validation.
     */
    public function transition(Model $model, User $user, string $action, ?string $catatan = null): Model
    {
        $class = get_class($model);
        if (! isset(self::$config[$class])) {
            throw ValidationException::withMessages([
                'workflow' => "Tipe dokumen {$class} tidak didukung oleh state machine generik.",
            ]);
        }

        $modelConfig = self::$config[$class];
        if (! isset($modelConfig['transitions'][$action])) {
            throw ValidationException::withMessages([
                'action' => "Aksi '{$action}' tidak dikenal untuk dokumen ini.",
            ]);
        }

        $transRule = $modelConfig['transitions'][$action];
        $fromStatus = $model->status;

        // 1. Check if current status allows this transition
        if (! in_array($fromStatus, $transRule['from'])) {
            throw ValidationException::withMessages([
                'status' => "Status dokumen saat ini ({$fromStatus}) tidak mengizinkan aksi '{$action}'.",
            ]);
        }

        // 2. Check role authorization
        $allowedRolesGroup = $transRule['role'];
        $allowedRoles = $modelConfig[$allowedRolesGroup] ?? [];
        if (! $user->hasRole($allowedRoles)) {
            throw ValidationException::withMessages([
                'role' => "Role anda ({$user->role}) tidak berhak melakukan aksi '{$action}' pada dokumen ini.",
            ]);
        }

        // 3. Check mandatory note on rejection
        if (! empty($transRule['require_notes']) && empty(trim($catatan ?? ''))) {
            throw ValidationException::withMessages([
                'catatan' => 'Catatan alasan penolakan wajib diisi saat menolak laporan.',
            ]);
        }

        $toStatus = $transRule['to'];
        $oldValues = $model->toArray();

        // 4. Perform state transition
        $model->status = $toStatus;
        $model->save();

        // 5. Record Review History
        ReviewHistory::create([
            'reviewable_type' => $class,
            'reviewable_id' => $model->id,
            'reviewer_id' => $user->id,
            'action' => $action,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'catatan' => $catatan,
        ]);

        // 6. Execute Side-Effects (Stock movement update on PurchaseDocument approval)
        $this->handleSideEffects($model, $user, $fromStatus, $toStatus);

        // 7. Audit Log
        AuditLogService::log(
            $user,
            'DOCUMENT_TRANSITION_'.strtoupper($action),
            $class,
            $model->id,
            ['status' => $fromStatus],
            ['status' => $toStatus, 'catatan' => $catatan]
        );

        // 8. Trigger Notifications
        $this->sendNotifications($model, $user, $action, $toStatus, $catatan);

        return $model;
    }

    /**
     * Side effects execution (e.g. stock movement when PurchaseDocument approved).
     */
    protected function handleSideEffects(Model $model, User $user, string $fromStatus, string $toStatus): void
    {
        if ($model instanceof PurchaseDocument && $toStatus === 'APPROVED') {
            $purchase = $model->purchase()->with('items')->first();
            if ($purchase) {
                foreach ($purchase->items as $pItem) {
                    $item = Item::find($pItem->item_id);
                    if (! $item && ! empty($pItem->nama_barang)) {
                        // Find or create item by name
                        $item = Item::where('nama_barang', $pItem->nama_barang)->first();
                    }

                    if ($item) {
                        $stokSebelum = $item->stok;
                        $stokSesudah = $stokSebelum + $pItem->jumlah;
                        $item->stok = $stokSesudah;
                        $item->save();

                        StockMovement::create([
                            'item_id' => $item->id,
                            'user_id' => $user->id,
                            'type' => 'IN',
                            'jumlah' => $pItem->jumlah,
                            'stok_sebelum' => $stokSebelum,
                            'stok_sesudah' => $stokSesudah,
                            'referensi_type' => PurchaseDocument::class,
                            'referensi_id' => $model->id,
                            'catatan' => "Verifikasi dokumen pembelian {$model->nomor_dokumen} disetujui",
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Send in-app notification to appropriate users/roles.
     */
    protected function sendNotifications(Model $model, User $actor, string $action, string $toStatus, ?string $catatan): void
    {
        $docName = match (true) {
            $model instanceof PurchaseRequest => "Pengajuan {$model->nomor_pengajuan}",
            $model instanceof PurchaseDocument => "Dokumen Pembelian {$model->nomor_dokumen}",
            $model instanceof PurchaseReport => "Laporan Pembelian {$model->nomor_laporan}",
            default => "Dokumen #{$model->id}"
        };

        $judul = "Update Status {$docName}";
        $pesan = "Status {$docName} diubah menjadi {$toStatus} oleh {$actor->name}.";
        if ($catatan) {
            $pesan .= " Catatan: {$catatan}";
        }

        // Notify document creator if actor is reviewer, or notify target reviewer role if submitted
        if (isset($model->user_id) && $model->user_id !== $actor->id) {
            Notification::create([
                'user_id' => $model->user_id,
                'judul' => $judul,
                'pesan' => $pesan,
                'type' => $action === 'reject' ? 'warning' : 'success',
            ]);
        } elseif (isset($model->created_by) && $model->created_by !== $actor->id) {
            Notification::create([
                'user_id' => $model->created_by,
                'judul' => $judul,
                'pesan' => $pesan,
                'type' => $action === 'reject' ? 'warning' : 'success',
            ]);
        }

        // Notify next role if document was submitted
        if ($toStatus === 'SUBMITTED') {
            $targetRole = match (true) {
                $model instanceof PurchaseRequest => 'staff_gudang',
                $model instanceof PurchaseDocument => 'inventarisir',
                $model instanceof PurchaseReport => 'manager_gudang',
                default => null
            };

            if ($targetRole) {
                Notification::create([
                    'role_target' => $targetRole,
                    'judul' => "Tugas Verifikasi Baru: {$docName}",
                    'pesan' => "{$docName} telah diserahkan oleh {$actor->name} dan menunggu verifikasi anda.",
                    'type' => 'info',
                ]);
            }
        }
    }
}
