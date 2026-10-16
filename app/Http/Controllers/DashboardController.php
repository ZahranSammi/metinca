<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Item;
use App\Models\Notification;
use App\Models\Purchase;
use App\Models\PurchaseDocument;
use App\Models\PurchaseReport;
use App\Models\PurchaseRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Common Metrics
        $metrics = [
            'total_pengajuan' => PurchaseRequest::count(),
            'total_pembelian' => Purchase::count(),
            'total_barang' => Item::count(),
            'total_laporan' => PurchaseReport::count(),
        ];

        // 2. Role specific task queues
        $pendingTasks = [
            'pengajuan_pending_verifikasi' => [],
            'pengajuan_ready_pembelian' => [],
            'dokumen_pending_verifikasi' => [],
            'laporan_pending_review' => [],
            'pengajuan_butuh_revisi' => [],
            'low_stock_items' => [],
        ];

        if ($user->hasRole(['staff_gudang', 'manager_gudang'])) {
            $pendingTasks['pengajuan_pending_verifikasi'] = PurchaseRequest::with(['user', 'items'])
                ->where('status', 'SUBMITTED')
                ->latest()
                ->take(5)
                ->get();

            $pendingTasks['pengajuan_ready_pembelian'] = PurchaseRequest::with(['user', 'items'])
                ->where('status', 'APPROVED')
                ->latest()
                ->take(5)
                ->get();
        }

        if ($user->hasRole(['inventarisir', 'manager_gudang'])) {
            $pendingTasks['dokumen_pending_verifikasi'] = PurchaseDocument::with(['purchase.items', 'creator'])
                ->where('status', 'SUBMITTED')
                ->latest()
                ->take(5)
                ->get();

            $pendingTasks['low_stock_items'] = Item::whereColumn('stok', '<=', 'min_stok')->get();
        }

        if ($user->hasRole(['manager_gudang', 'inventarisir'])) {
            $pendingTasks['laporan_pending_review'] = PurchaseReport::with(['creator', 'purchaseDocument'])
                ->where('status', 'SUBMITTED')
                ->latest()
                ->take(5)
                ->get();
        }

        if ($user->hasRole('karyawan')) {
            $pendingTasks['pengajuan_butuh_revisi'] = PurchaseRequest::with(['items', 'reviewHistories.reviewer'])
                ->where('user_id', $user->id)
                ->where('status', 'REJECTED')
                ->latest()
                ->get();
        }

        // 3. In-App Notifications
        $notifications = Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('role_target', $user->role);
        })
            ->latest()
            ->take(10)
            ->get();

        // 4. Audit Log
        $recentAudits = AuditLog::with('user')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Dashboard', [
            'auth' => ['user' => $user],
            'metrics' => $metrics,
            'pendingTasks' => $pendingTasks,
            'notifications' => $notifications,
            'recentAudits' => $recentAudits,
        ]);
    }
}
