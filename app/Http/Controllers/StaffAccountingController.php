<?php

namespace App\Http\Controllers;

use App\Models\FundProposal;
use App\Models\PurchaseDocument;
use App\Models\PurchaseRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffAccountingController extends Controller
{
    public function dashboard(Request $request)
    {
        $menungguVerifikasiDana = FundProposal::where('status', 'Diajukan')->count();
        $menungguPencairan = FundProposal::where('status', 'Dana Cair')->count();
        $menungguVerifikasiBarang = PurchaseDocument::where('status', 'Diajukan')->count();
        $siapDilaporkan = PurchaseDocument::where('status', 'Disetujui')->whereDoesntHave('purchaseRecord')->count();

        $monthlyFundProposals = FundProposal::whereYear('created_at', date('Y'))
            ->get()
            ->groupBy(fn ($item) => $item->created_at->format('n'))
            ->map(fn ($items) => $items->count());

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $barData = collect(range(1, 12))->map(fn ($month) => [
            'name' => $months[$month - 1],
            'value' => $monthlyFundProposals[$month] ?? 0,
        ])->toArray();

        $recordCounts = PurchaseRecord::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $totalRecords = array_sum($recordCounts) ?: 1;

        $pieData = [
            [
                'name' => 'Diarsipkan',
                'value' => round((($recordCounts['Diarsipkan'] ?? 0) / $totalRecords) * 100),
                'color' => '#10B981',
            ],
            [
                'name' => 'Diajukan',
                'value' => round((($recordCounts['Diajukan'] ?? 0) / $totalRecords) * 100),
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Direvisi',
                'value' => round((($recordCounts['Direvisi'] ?? 0) / $totalRecords) * 100),
                'color' => '#EF4444',
            ],
        ];

        return Inertia::render('StaffAccounting/Dashboard', [
            'stats' => compact('menungguVerifikasiDana', 'menungguPencairan', 'menungguVerifikasiBarang', 'siapDilaporkan'),
            'barData' => $barData,
            'pieData' => $pieData,
        ]);
    }

    public function verifikasiPengajuanDana()
    {
        $menunggu = FundProposal::with('purchaseRequest', 'staffPurchasing')->where('status', 'Diajukan')->orderBy('created_at', 'desc')->get();
        $diteruskan = FundProposal::with('purchaseRequest', 'staffPurchasing')->where('status', 'Menunggu Persetujuan Manager')->orderBy('created_at', 'desc')->get();

        return Inertia::render('StaffAccounting/VerifikasiPengajuanDana', [
            'menunggu' => $menunggu,
            'diteruskan' => $diteruskan,
        ]);
    }

    public function verifikasiPengajuanDanaSetuju(Request $request, FundProposal $fundProposal)
    {
        abort_unless($fundProposal->status === 'Diajukan', 422);

        $fundProposal->transitionTo('Menunggu Persetujuan Manager', null, $request->user()->id);

        return redirect()->back()->with('success', 'Laporan pengajuan dana diteruskan ke Manager Accounting.');
    }

    public function verifikasiPengajuanDanaRevisi(Request $request, FundProposal $fundProposal)
    {
        abort_unless($fundProposal->status === 'Diajukan', 422);

        $validated = $request->validate(['catatan' => 'required|string']);

        $fundProposal->transitionTo('Direvisi Staff Accounting', $validated['catatan'], $request->user()->id);

        return redirect()->back()->with('success', 'Laporan pengajuan dana dikirim kembali ke Staff Purchasing untuk direvisi.');
    }

    public function pencairanDana()
    {
        $requests = FundProposal::with('purchaseRequest', 'staffPurchasing')
            ->where('status', 'Dana Cair')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('StaffAccounting/PencairanDana', [
            'requests' => $requests,
        ]);
    }

    public function catatPencairan(FundProposal $fundProposal)
    {
        abort_unless($fundProposal->status === 'Dana Cair', 422);

        $fundProposal->transitionTo('Dana Diterima Purchasing');

        return redirect()->back()->with('success', 'Pencairan dana telah dicatat dan diteruskan ke Staff Purchasing.');
    }

    public function verifikasiDataBarang()
    {
        $menunggu = PurchaseDocument::with('fundProposal.purchaseRequest', 'staffPurchasing')->where('status', 'Diajukan')->orderBy('created_at', 'desc')->get();
        $disetujui = PurchaseDocument::with('fundProposal.purchaseRequest', 'staffPurchasing')->where('status', 'Disetujui')->orderBy('created_at', 'desc')->get();

        return Inertia::render('StaffAccounting/VerifikasiDataBarang', [
            'menunggu' => $menunggu,
            'disetujui' => $disetujui,
        ]);
    }

    public function verifikasiDataBarangSetuju(Request $request, PurchaseDocument $purchaseDocument)
    {
        abort_unless($purchaseDocument->status === 'Diajukan', 422);

        $purchaseDocument->transitionTo('Disetujui', null, $request->user()->id);

        return redirect()->back()->with('success', 'Laporan dokumen pembelian barang disetujui.');
    }

    public function verifikasiDataBarangRevisi(Request $request, PurchaseDocument $purchaseDocument)
    {
        abort_unless($purchaseDocument->status === 'Diajukan', 422);

        $validated = $request->validate(['catatan' => 'required|string']);

        $purchaseDocument->transitionTo('Direvisi', $validated['catatan'], $request->user()->id);

        return redirect()->back()->with('success', 'Laporan dokumen pembelian dikirim kembali ke Staff Purchasing untuk direvisi.');
    }

    public function buatLaporan(Request $request)
    {
        $availableDocuments = PurchaseDocument::with('fundProposal.purchaseRequest')
            ->where('status', 'Disetujui')
            ->whereDoesntHave('purchaseRecord')
            ->get();

        $records = PurchaseRecord::with('purchaseDocument.fundProposal.purchaseRequest', 'manager')
            ->where('staff_accounting_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('StaffAccounting/BuatLaporan', [
            'availableDocuments' => $availableDocuments,
            'records' => $records,
        ]);
    }

    public function storePurchaseRecord(Request $request)
    {
        $validated = $request->validate([
            'purchase_document_id' => 'required|exists:purchase_documents,id',
            'notes' => 'required|string',
        ]);

        $document = PurchaseDocument::findOrFail($validated['purchase_document_id']);
        abort_unless($document->status === 'Disetujui', 422);
        abort_if($document->purchaseRecord, 422);

        PurchaseRecord::create([
            'purchase_document_id' => $document->id,
            'staff_accounting_id' => $request->user()->id,
            'notes' => $validated['notes'],
            'status' => 'Diajukan',
        ]);

        return redirect()->back()->with('success', 'Pencatatan laporan pembelian barang berhasil dikirim ke Manager Accounting.');
    }

    public function revisePurchaseRecord(Request $request, PurchaseRecord $purchaseRecord)
    {
        abort_unless($purchaseRecord->staff_accounting_id === $request->user()->id, 403);
        abort_unless($purchaseRecord->status === 'Direvisi', 422);

        $validated = $request->validate(['notes' => 'required|string']);

        $purchaseRecord->notes = $validated['notes'];
        $purchaseRecord->save();

        $purchaseRecord->transitionTo('Diajukan');

        return redirect()->back()->with('success', 'Pencatatan laporan yang direvisi berhasil dikirim ulang.');
    }
}
