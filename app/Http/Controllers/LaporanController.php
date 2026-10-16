<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseReportRequest;
use App\Http\Requests\TransitionDocumentRequest;
use App\Models\PurchaseDocument;
use App\Models\PurchaseReport;
use App\Services\AuditLogService;
use App\Services\GenericStateMachine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    public function __construct(
        protected GenericStateMachine $stateMachine
    ) {}

    public function index(Request $request): Response
    {
        $query = PurchaseReport::with(['creator', 'purchaseDocument.purchase.items', 'reviewHistories.reviewer'])
            ->latest();

        if ($request->has('status') && ! empty($request->status)) {
            $query->where('status', $request->status);
        }

        if ($request->has('periode_mulai') && ! empty($request->periode_mulai)) {
            $query->whereDate('periode_mulai', '>=', $request->periode_mulai);
        }

        if ($request->has('periode_selesai') && ! empty($request->periode_selesai)) {
            $query->whereDate('periode_selesai', '<=', $request->periode_selesai);
        }

        $laporans = $query->paginate(15)->withQueryString();

        // Approved Purchase Documents ready for report generation
        $approvedDocuments = PurchaseDocument::with(['purchase.items', 'creator'])
            ->where('status', 'APPROVED')
            ->latest()
            ->get();

        return Inertia::render('Laporan/Index', [
            'laporans' => $laporans,
            'approvedDocuments' => $approvedDocuments,
            'filters' => $request->only(['status', 'periode_mulai', 'periode_selesai']),
        ]);
    }

    public function store(StorePurchaseReportRequest $request): RedirectResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($request, $user) {
            $count = PurchaseReport::count() + 1;
            $nomorLaporan = 'REP-'.date('Ym').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);

            $document = null;
            $totalPengeluaran = 0;
            $totalTransaksi = 1;

            if ($request->purchase_document_id) {
                $document = PurchaseDocument::with('purchase')->find($request->purchase_document_id);
                if ($document && $document->purchase) {
                    $totalPengeluaran = $document->purchase->total_harga;
                }
            }

            $status = $request->input('status', 'SUBMITTED');

            $laporan = PurchaseReport::create([
                'nomor_laporan' => $nomorLaporan,
                'purchase_document_id' => $request->purchase_document_id,
                'judul_laporan' => $request->judul_laporan,
                'periode_mulai' => $request->periode_mulai,
                'periode_selesai' => $request->periode_selesai,
                'total_transaksi' => $totalTransaksi,
                'total_pengeluaran' => $totalPengeluaran,
                'catatan' => $request->catatan,
                'created_by' => $user->id,
                'status' => 'DRAFT',
            ]);

            AuditLogService::log(
                $user,
                'CREATE_PURCHASE_REPORT',
                PurchaseReport::class,
                $laporan->id,
                null,
                $laporan->toArray()
            );

            if ($status === 'SUBMITTED') {
                $this->stateMachine->transition($laporan, $user, 'submit', 'Laporan pembelian diserahkan ke Manager Gudang');
            }
        });

        return redirect()->route('laporan.index')
            ->with('success', 'Catatan laporan pembelian berhasil dibuat dan diserahkan.');
    }

    public function update(StorePurchaseReportRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $laporan = PurchaseReport::findOrFail($id);

        if (! in_array($laporan->status, ['DRAFT', 'REJECTED'])) {
            return redirect()->back()->with('error', 'Hanya laporan DRAFT atau REJECTED yang dapat diubah.');
        }

        DB::transaction(function () use ($laporan, $request, $user) {
            $oldValues = $laporan->toArray();

            $laporan->update([
                'judul_laporan' => $request->judul_laporan,
                'periode_mulai' => $request->periode_mulai,
                'periode_selesai' => $request->periode_selesai,
                'catatan' => $request->catatan,
            ]);

            AuditLogService::log(
                $user,
                'UPDATE_PURCHASE_REPORT',
                PurchaseReport::class,
                $laporan->id,
                $oldValues,
                $laporan->fresh()->toArray()
            );

            if ($request->input('resubmit', false)) {
                $this->stateMachine->transition($laporan, $user, 'revise', 'Laporan telah direvisi dan diserahkan ulang.');
            }
        });

        return redirect()->route('laporan.index')
            ->with('success', 'Catatan laporan pembelian berhasil diperbarui.');
    }

    public function verifikasi(TransitionDocumentRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $laporan = PurchaseReport::findOrFail($id);

        $action = $request->action;
        if ($action === 'approve') {
            // Manager Gudang approves and automatically archives the report
            $this->stateMachine->transition($laporan, $user, 'approve', $request->catatan);
            $this->stateMachine->transition($laporan, $user, 'archive', 'Laporan resmi diarsipkan.');
        } else {
            $this->stateMachine->transition($laporan, $user, $action, $request->catatan);
        }

        $msg = match ($action) {
            'approve' => 'disetujui dan diarsipkan.',
            'reject' => 'ditolak + catatan perbaikan diserahkan ke Inventarisir.',
            default => 'diproses.'
        };

        return redirect()->route('laporan.index')
            ->with('success', "Pemeriksaan laporan {$laporan->nomor_laporan} berhasil {$msg}");
    }

    public function export(Request $request, int $id)
    {
        $laporan = PurchaseReport::with([
            'creator',
            'purchaseDocument.purchase.items.item',
            'purchaseDocument.creator',
            'reviewHistories.reviewer',
        ])->findOrFail($id);

        $type = $request->query('type', 'html');

        if ($type === 'json') {
            return response()->json($laporan);
        }

        if ($type === 'csv') {
            $csvData = "Nomor Laporan,Judul Laporan,Periode,Total Transaksi,Total Pengeluaran,Status,Dibuat Oleh\n";
            $csvData .= "\"{$laporan->nomor_laporan}\",\"{$laporan->judul_laporan}\",\"{$laporan->periode_mulai} s.d {$laporan->periode_selesai}\",{$laporan->total_transaksi},{$laporan->total_pengeluaran},\"{$laporan->status}\",\"{$laporan->creator?->name}\"\n";

            return response($csvData)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="Laporan_'.$laporan->nomor_laporan.'.csv"');
        }

        // Printable HTML report
        return view('reports.print', compact('laporan'));
    }
}
