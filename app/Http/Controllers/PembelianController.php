<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseRequest;
use App\Http\Requests\TransitionDocumentRequest;
use App\Models\Item;
use App\Models\Purchase;
use App\Models\PurchaseDocument;
use App\Models\PurchaseItem;
use App\Models\PurchaseRequest as PurchaseRequestModel;
use App\Services\AuditLogService;
use App\Services\GenericStateMachine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PembelianController extends Controller
{
    public function __construct(
        protected GenericStateMachine $stateMachine
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. List Purchases
        $purchasesQuery = Purchase::with(['purchaseRequest.user', 'creator', 'items.item', 'documents.reviewHistories.reviewer'])
            ->latest();

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $purchasesQuery->where(function ($q) use ($search) {
                $q->where('nomor_pembelian', 'like', "%{$search}%")
                    ->orWhere('supplier', 'like', "%{$search}%")
                    ->orWhere('nomor_nota', 'like', "%{$search}%");
            });
        }

        $purchases = $purchasesQuery->paginate(10)->withQueryString();

        // 2. Approved Purchase Requests waiting for purchase (Alur 2)
        $approvedRequests = PurchaseRequestModel::with(['user', 'items.item'])
            ->where('status', 'APPROVED')
            ->latest()
            ->get();

        // 3. Purchase Documents for Inventarisir (Alur 3)
        $documents = PurchaseDocument::with(['purchase.items', 'creator', 'reviewHistories.reviewer'])
            ->latest()
            ->get();

        $masterItems = Item::orderBy('nama_barang')->get();

        return Inertia::render('Pembelian/Index', [
            'purchases' => $purchases,
            'approvedRequests' => $approvedRequests,
            'documents' => $documents,
            'masterItems' => $masterItems,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        $user = $request->user();

        $purchaseRequestModel = PurchaseRequestModel::findOrFail($request->purchase_request_id);
        if ($purchaseRequestModel->status !== 'APPROVED') {
            return redirect()->back()->with('error', 'Hanya pengajuan berstatus APPROVED yang dapat dilakukan pembelian.');
        }

        DB::transaction(function () use ($request, $user, $purchaseRequestModel) {
            $fileBuktiPath = null;
            if ($request->hasFile('file_bukti')) {
                $fileBuktiPath = $request->file('file_bukti')->store('bukti_pembelian', 'public');
            }

            $count = Purchase::count() + 1;
            $nomorPembelian = 'PO-'.date('Ym').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);

            $purchase = Purchase::create([
                'nomor_pembelian' => $nomorPembelian,
                'purchase_request_id' => $purchaseRequestModel->id,
                'created_by' => $user->id,
                'supplier' => $request->supplier,
                'tanggal_pembelian' => $request->tanggal_pembelian,
                'nomor_nota' => $request->nomor_nota,
                'total_harga' => $request->total_harga,
                'file_bukti' => $fileBuktiPath,
                'status' => 'PURCHASED',
            ]);

            foreach ($request->items as $pItem) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'item_id' => $pItem['item_id'] ?? null,
                    'nama_barang' => $pItem['nama_barang'],
                    'jumlah' => $pItem['jumlah'],
                    'harga_satuan' => $pItem['harga_satuan'],
                    'subtotal' => $pItem['subtotal'],
                ]);
            }

            // Create initial PurchaseDocument in DRAFT
            $docCount = PurchaseDocument::count() + 1;
            $nomorDokumen = 'DOC-'.date('Ym').'-'.str_pad($docCount, 4, '0', STR_PAD_LEFT);

            PurchaseDocument::create([
                'nomor_dokumen' => $nomorDokumen,
                'purchase_id' => $purchase->id,
                'created_by' => $user->id,
                'catatan' => 'Dokumen transaksi pembelian dibuat oleh '.$user->name,
                'status' => 'DRAFT',
            ]);

            AuditLogService::log(
                $user,
                'CREATE_PURCHASE',
                Purchase::class,
                $purchase->id,
                null,
                $purchase->toArray()
            );
        });

        return redirect()->route('pembelian.index')
            ->with('success', 'Transaksi pembelian berhasil dicatat. Silakan serahkan dokumen ke Inventarisir.');
    }

    public function submitToInventarisir(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $document = PurchaseDocument::findOrFail($id);

        $this->stateMachine->transition(
            $document,
            $user,
            in_array($document->status, ['REJECTED']) ? 'revise' : 'submit',
            $request->input('catatan', 'Dokumen pembelian diserahkan ke Inventarisir')
        );

        return redirect()->route('pembelian.index')
            ->with('success', "Dokumen pembelian {$document->nomor_dokumen} berhasil diserahkan ke Inventarisir.");
    }

    public function verifikasiDokumen(TransitionDocumentRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $document = PurchaseDocument::findOrFail($id);

        $this->stateMachine->transition(
            $document,
            $user,
            $request->action,
            $request->catatan
        );

        $msg = match ($request->action) {
            'approve' => 'disetujui dan stok master barang telah ter-update otomatis.',
            'reject' => 'ditolak dan dikembalikan ke Staff Gudang.',
            default => 'diproses.'
        };

        return redirect()->route('pembelian.index')
            ->with('success', "Verifikasi dokumen {$document->nomor_dokumen} berhasil {$msg}");
    }
}
