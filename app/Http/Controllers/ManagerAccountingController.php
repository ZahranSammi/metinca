<?php

namespace App\Http\Controllers;

use App\Models\FundProposal;
use App\Models\PurchaseRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManagerAccountingController extends Controller
{
    public function dashboard(Request $request)
    {
        $menungguApprovalDana = FundProposal::where('status', 'Menunggu Persetujuan Manager')->count();
        $menungguPeriksaLaporan = PurchaseRecord::where('status', 'Diajukan')->count();
        $totalDicairkan = FundProposal::whereNotNull('disbursed_at')->count();
        $totalDiarsipkan = PurchaseRecord::where('status', 'Diarsipkan')->count();

        $currentYear = date('Y');
        $disbursed = FundProposal::whereYear('disbursed_at', $currentYear)->whereNotNull('disbursed_at')->get();

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $lineData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthTotal = $disbursed->filter(fn ($fp) => $fp->disbursed_at->month === $i)->sum('amount');
            $lineData[] = [
                'name' => $months[$i - 1],
                'value' => round($monthTotal / 1000000, 2),
            ];
        }

        return Inertia::render('ManagerAccounting/Dashboard', [
            'stats' => compact('menungguApprovalDana', 'menungguPeriksaLaporan', 'totalDicairkan', 'totalDiarsipkan'),
            'lineData' => $lineData,
        ]);
    }

    public function approvalDana()
    {
        $requests = FundProposal::with('purchaseRequest', 'staffPurchasing')
            ->where('status', 'Menunggu Persetujuan Manager')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('ManagerAccounting/ApprovalDana', [
            'requests' => $requests,
        ]);
    }

    public function approvalDanaSetuju(Request $request, FundProposal $fundProposal)
    {
        abort_unless($fundProposal->status === 'Menunggu Persetujuan Manager', 422);

        $fundProposal->transitionTo('Dana Cair', null, null, $request->user()->id);

        return redirect()->back()->with('success', 'Dana pembelian disetujui dan dicairkan ke Staff Accounting.');
    }

    public function approvalDanaRevisi(Request $request, FundProposal $fundProposal)
    {
        abort_unless($fundProposal->status === 'Menunggu Persetujuan Manager', 422);

        $validated = $request->validate(['catatan' => 'required|string']);

        $fundProposal->transitionTo('Direvisi Manager', $validated['catatan'], null, $request->user()->id);

        return redirect()->back()->with('success', 'Pengajuan dana dikirim kembali untuk direvisi.');
    }

    public function periksaLaporan()
    {
        $records = PurchaseRecord::with('purchaseDocument.fundProposal.purchaseRequest', 'staffAccounting')
            ->where('status', 'Diajukan')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('ManagerAccounting/PeriksaLaporan', [
            'records' => $records,
        ]);
    }

    public function periksaLaporanSetuju(Request $request, PurchaseRecord $purchaseRecord)
    {
        abort_unless($purchaseRecord->status === 'Diajukan', 422);

        $purchaseRecord->transitionTo('Diarsipkan', null, $request->user()->id);
        $purchaseRecord->load('purchaseDocument.fundProposal.purchaseRequest');
        $purchaseRecord->purchaseDocument?->fundProposal?->purchaseRequest?->transitionTo('Selesai');

        return redirect()->back()->with('success', 'Pencatatan laporan disetujui dan diarsipkan. Siklus pembelian ditutup.');
    }

    public function periksaLaporanRevisi(Request $request, PurchaseRecord $purchaseRecord)
    {
        abort_unless($purchaseRecord->status === 'Diajukan', 422);

        $validated = $request->validate(['catatan' => 'required|string']);

        $purchaseRecord->transitionTo('Direvisi', $validated['catatan'], $request->user()->id);

        return redirect()->back()->with('success', 'Pencatatan laporan dikirim kembali ke Staff Accounting untuk direvisi.');
    }

    public function historiPembelian()
    {
        $records = PurchaseRecord::with('purchaseDocument.fundProposal.purchaseRequest.requester', 'staffAccounting')
            ->where('status', 'Diarsipkan')
            ->orderBy('archived_at', 'desc')
            ->get();

        return Inertia::render('ManagerAccounting/HistoriPembelian', [
            'records' => $records,
        ]);
    }
}
