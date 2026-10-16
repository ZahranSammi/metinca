<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseRequestRequest;
use App\Http\Requests\TransitionDocumentRequest;
use App\Models\Item;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestItem;
use App\Services\AuditLogService;
use App\Services\GenericStateMachine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PengajuanController extends Controller
{
    public function __construct(
        protected GenericStateMachine $stateMachine
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = PurchaseRequest::with(['user', 'items.item', 'reviewHistories.reviewer'])
            ->latest();

        // Scope by user if Karyawan
        if ($user->hasRole('karyawan')) {
            $query->where('user_id', $user->id);
        }

        if ($request->has('status') && ! empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_pengajuan', 'like', "%{$search}%")
                    ->orWhere('catatan', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $pengajuans = $query->paginate(15)->withQueryString();
        $masterItems = Item::orderBy('nama_barang')->get();

        return Inertia::render('Pengajuan/Index', [
            'pengajuans' => $pengajuans,
            'masterItems' => $masterItems,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function store(StorePurchaseRequestRequest $request): RedirectResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($request, $user) {
            $count = PurchaseRequest::count() + 1;
            $nomorPengajuan = 'PR-'.date('Ym').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);

            $pengajuan = PurchaseRequest::create([
                'nomor_pengajuan' => $nomorPengajuan,
                'user_id' => $user->id,
                'catatan' => $request->catatan,
                'status' => 'DRAFT',
            ]);

            foreach ($request->items as $item) {
                PurchaseRequestItem::create([
                    'purchase_request_id' => $pengajuan->id,
                    'item_id' => $item['item_id'] ?? null,
                    'nama_barang' => $item['nama_barang'],
                    'jumlah' => $item['jumlah'],
                    'satuan' => $item['satuan'],
                    'alasan_kebutuhan' => $item['alasan_kebutuhan'],
                    'estimasi_harga' => $item['estimasi_harga'] ?? 0,
                ]);
            }

            AuditLogService::log(
                $user,
                'CREATE_PURCHASE_REQUEST',
                PurchaseRequest::class,
                $pengajuan->id,
                null,
                $pengajuan->toArray()
            );

            if ($request->status === 'SUBMITTED') {
                $this->stateMachine->transition($pengajuan, $user, 'submit', 'Pengajuan baru diserahkan');
            }
        });

        return redirect()->route('pengajuan.index')
            ->with('success', 'Pengajuan barang operasional berhasil disimpan.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $pengajuan = PurchaseRequest::with('items')->findOrFail($id);

        if ($pengajuan->user_id !== $user->id && ! $user->hasRole(['manager_gudang', 'staff_gudang'])) {
            abort(403, 'Anda tidak berhak mengubah pengajuan ini.');
        }

        if (! in_array($pengajuan->status, ['DRAFT', 'REJECTED'])) {
            return redirect()->back()->with('error', 'Hanya pengajuan berstatus DRAFT atau REJECTED yang dapat diubah.');
        }

        $request->validate([
            'catatan' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.nama_barang' => 'required|string|max:255',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.satuan' => 'required|string|max:50',
            'items.*.alasan_kebutuhan' => 'required|string|max:1000',
        ]);

        DB::transaction(function () use ($pengajuan, $request, $user) {
            $oldValues = $pengajuan->toArray();

            $pengajuan->update([
                'catatan' => $request->catatan,
            ]);

            $pengajuan->items()->delete();
            foreach ($request->items as $item) {
                PurchaseRequestItem::create([
                    'purchase_request_id' => $pengajuan->id,
                    'item_id' => $item['item_id'] ?? null,
                    'nama_barang' => $item['nama_barang'],
                    'jumlah' => $item['jumlah'],
                    'satuan' => $item['satuan'],
                    'alasan_kebutuhan' => $item['alasan_kebutuhan'],
                    'estimasi_harga' => $item['estimasi_harga'] ?? 0,
                ]);
            }

            AuditLogService::log(
                $user,
                'UPDATE_PURCHASE_REQUEST',
                PurchaseRequest::class,
                $pengajuan->id,
                $oldValues,
                $pengajuan->fresh()->toArray()
            );

            // If it was REJECTED and resubmitted
            if ($request->input('resubmit', false)) {
                $this->stateMachine->transition($pengajuan, $user, 'revise', 'Pengajuan telah diperbaiki dan diserahkan ulang');
            }
        });

        return redirect()->route('pengajuan.index')
            ->with('success', 'Pengajuan barang operasional berhasil diperbarui.');
    }

    public function verifikasi(TransitionDocumentRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $pengajuan = PurchaseRequest::findOrFail($id);

        $this->stateMachine->transition(
            $pengajuan,
            $user,
            $request->action,
            $request->catatan
        );

        $actionText = match ($request->action) {
            'approve' => 'disetujui',
            'reject' => 'ditolak dengan catatan',
            'submit' => 'diserahkan',
            'revise' => 'diperbaiki dan diserahkan ulang',
            default => 'diproses'
        };

        return redirect()->route('pengajuan.index')
            ->with('success', "Pengajuan {$pengajuan->nomor_pengajuan} berhasil {$actionText}.");
    }
}
