<?php

namespace App\Http\Controllers;

use App\Models\FundProposal;
use App\Models\PurchaseDocument;
use App\Models\PurchaseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StaffPurchasingController extends Controller
{
    public function dashboard(Request $request)
    {
        $stats = [
            'menungguDiterima' => PurchaseRequest::where('status', 'Diajukan')->count(),
            'menungguPengajuanDana' => PurchaseRequest::where('status', 'Masuk Daftar Pembelian')
                ->whereDoesntHave('fundProposal')
                ->count(),
            'dalamProsesDana' => FundProposal::where('staff_purchasing_id', $request->user()->id)
                ->whereNotIn('status', ['Selesai Pembelian'])
                ->count(),
            'siapDilaporkan' => FundProposal::where('staff_purchasing_id', $request->user()->id)
                ->where('status', 'Selesai Pembelian')
                ->whereDoesntHave('purchaseDocument')
                ->count(),
        ];

        return Inertia::render('StaffPurchasing/Dashboard', [
            'stats' => $stats,
        ]);
    }

    public function daftarPembelian()
    {
        $menunggu = PurchaseRequest::with('requester')->where('status', 'Diajukan')->orderBy('created_at', 'desc')->get();
        $daftar = PurchaseRequest::with('requester')->where('status', 'Masuk Daftar Pembelian')->orderBy('created_at', 'desc')->get();

        return Inertia::render('StaffPurchasing/DaftarPembelian', [
            'menunggu' => $menunggu,
            'daftar' => $daftar,
        ]);
    }

    public function terimaPengajuan(PurchaseRequest $purchaseRequest)
    {
        abort_unless($purchaseRequest->status === 'Diajukan', 422);

        $purchaseRequest->transitionTo('Masuk Daftar Pembelian');

        return redirect()->back()->with('success', 'Pengajuan barang diterima dan dimasukkan ke daftar pembelian.');
    }

    public function pengajuanDana(Request $request)
    {
        $availableRequests = PurchaseRequest::where('status', 'Masuk Daftar Pembelian')
            ->whereDoesntHave('fundProposal')
            ->get();

        $fundProposals = FundProposal::with('purchaseRequest')
            ->where('staff_purchasing_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('StaffPurchasing/PengajuanDana', [
            'availableRequests' => $availableRequests,
            'fundProposals' => $fundProposals,
        ]);
    }

    public function storeFundProposal(Request $request)
    {
        $validated = $request->validate([
            'purchase_request_id' => 'required|exists:purchase_requests,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        $purchaseRequest = PurchaseRequest::findOrFail($validated['purchase_request_id']);
        abort_unless($purchaseRequest->status === 'Masuk Daftar Pembelian', 422);
        abort_if($purchaseRequest->fundProposal, 422);

        FundProposal::create([
            'purchase_request_id' => $purchaseRequest->id,
            'staff_purchasing_id' => $request->user()->id,
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'status' => 'Diajukan',
        ]);

        return redirect()->back()->with('success', 'Laporan pengajuan dana pembelian barang operasional berhasil dikirim ke Staff Accounting.');
    }

    public function reviseFundProposal(Request $request, FundProposal $fundProposal)
    {
        abort_unless($fundProposal->staff_purchasing_id === $request->user()->id, 403);
        abort_unless(in_array($fundProposal->status, ['Direvisi Staff Accounting', 'Direvisi Manager']), 422);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        $fundProposal->update($validated);
        $fundProposal->transitionTo('Diajukan');

        return redirect()->back()->with('success', 'Laporan pengajuan dana yang direvisi berhasil dikirim ulang.');
    }

    public function selesaikanPembelian(Request $request, FundProposal $fundProposal)
    {
        abort_unless($fundProposal->staff_purchasing_id === $request->user()->id, 403);
        abort_unless($fundProposal->status === 'Dana Diterima Purchasing', 422);

        $fundProposal->transitionTo('Selesai Pembelian');

        return redirect()->back()->with('success', 'Pembelian barang operasional telah dilakukan.');
    }

    public function dataBarang(Request $request)
    {
        $availableFundProposals = FundProposal::with('purchaseRequest')
            ->where('staff_purchasing_id', $request->user()->id)
            ->where('status', 'Selesai Pembelian')
            ->whereDoesntHave('purchaseDocument')
            ->get();

        $documents = PurchaseDocument::with('fundProposal.purchaseRequest')
            ->where('staff_purchasing_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('StaffPurchasing/DataBarang', [
            'availableFundProposals' => $availableFundProposals,
            'documents' => $documents,
        ]);
    }

    public function storePurchaseDocument(Request $request)
    {
        $validated = $request->validate([
            'fund_proposal_id' => 'required|exists:fund_proposals,id',
            'item_name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $fundProposal = FundProposal::findOrFail($validated['fund_proposal_id']);
        abort_unless($fundProposal->staff_purchasing_id === $request->user()->id, 403);
        abort_unless($fundProposal->status === 'Selesai Pembelian', 422);
        abort_if($fundProposal->purchaseDocument, 422);

        $documentPath = null;
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('purchase_documents', 'public');
        }

        PurchaseDocument::create([
            'fund_proposal_id' => $fundProposal->id,
            'staff_purchasing_id' => $request->user()->id,
            'item_name' => $validated['item_name'],
            'quantity' => $validated['quantity'],
            'unit_price' => $validated['unit_price'],
            'total_price' => $validated['quantity'] * $validated['unit_price'],
            'document_path' => $documentPath,
            'status' => 'Diajukan',
        ]);

        return redirect()->back()->with('success', 'Laporan dokumen pembelian barang berhasil dikirim ke Staff Accounting.');
    }

    public function revisePurchaseDocument(Request $request, PurchaseDocument $purchaseDocument)
    {
        abort_unless($purchaseDocument->staff_purchasing_id === $request->user()->id, 403);
        abort_unless($purchaseDocument->status === 'Direvisi', 422);

        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('document')) {
            $purchaseDocument->document_path = $request->file('document')->store('purchase_documents', 'public');
        }

        $purchaseDocument->item_name = $validated['item_name'];
        $purchaseDocument->quantity = $validated['quantity'];
        $purchaseDocument->unit_price = $validated['unit_price'];
        $purchaseDocument->total_price = $validated['quantity'] * $validated['unit_price'];
        $purchaseDocument->save();

        $purchaseDocument->transitionTo('Diajukan');

        return redirect()->back()->with('success', 'Laporan dokumen pembelian yang direvisi berhasil dikirim ulang.');
    }
}
