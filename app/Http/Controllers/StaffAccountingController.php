<?php

namespace App\Http\Controllers;

use App\Models\DamageReport;
use App\Models\FundRequest;
use App\Models\RepairReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffAccountingController extends Controller
{
    public function dashboard()
    {
        $laporanMasuk = DamageReport::where('status', 'Dilaporkan')->count();
        $sedangVerifikasi = DamageReport::where('status', 'Diverifikasi')->count();
        $menungguApproval = FundRequest::where('status', 'Menunggu Persetujuan')->count();
        $disetujui = FundRequest::where('status', 'Disetujui')->count();

        // Calculate Monthly Fund Requests for Bar Chart (Database agnostic grouping)
        $monthlyFundRequests = FundRequest::whereYear('created_at', date('Y'))
            ->get()
            ->groupBy(function ($item) {
                return $item->created_at->format('n');
            })
            ->map(function ($items) {
                return $items->count();
            });

        $barData = collect(range(1, 12))->map(function ($month) use ($monthlyFundRequests) {
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return [
                'name' => $months[$month - 1],
                'value' => $monthlyFundRequests[$month] ?? 0,
            ];
        })->toArray();

        // Calculate Repair Report Status for Pie Chart
        $repairReportsCount = RepairReport::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $totalReports = array_sum($repairReportsCount) ?: 1; // avoid division by zero

        $pieData = [
            [
                'name' => 'Selesai (Disetujui)',
                'value' => round((($repairReportsCount['Disetujui'] ?? 0) / $totalReports) * 100),
                'color' => '#10B981'
            ],
            [
                'name' => 'Proses',
                'value' => round(((($repairReportsCount['Dikirim'] ?? 0) + ($repairReportsCount['Diverifikasi'] ?? 0)) / $totalReports) * 100),
                'color' => '#3B82F6'
            ],
            [
                'name' => 'Revisi',
                'value' => round((($repairReportsCount['Direvisi'] ?? 0) / $totalReports) * 100),
                'color' => '#EF4444'
            ],
        ];

        return Inertia::render('StaffAccounting/Dashboard', [
            'stats' => compact('laporanMasuk', 'sedangVerifikasi', 'menungguApproval', 'disetujui'),
            'barData' => $barData,
            'pieData' => $pieData,
        ]);
    }

    public function verifikasiLaporan()
    {
        $menungguVerifikasi = DamageReport::with('machine', 'user')->where('status', 'Dilaporkan')->orderBy('created_at', 'desc')->get();
        $sudahDiverifikasi = DamageReport::with('machine', 'user')->where('status', 'Diverifikasi')->orderBy('created_at', 'desc')->get();

        return Inertia::render('StaffAccounting/VerifikasiLaporan', [
            'menunggu' => $menungguVerifikasi,
            'diverifikasi' => $sudahDiverifikasi
        ]);
    }

    public function verifikasiLaporanUpdate(Request $request, $id)
    {
        $report = DamageReport::findOrFail($id);
        $report->transitionTo('Diverifikasi');

        return redirect()->back()->with('success', 'Laporan berhasil diverifikasi.');
    }

    public function verifikasiLaporanRevisi(Request $request, $id)
    {
        $validated = $request->validate([
            'catatan' => 'required|string',
        ]);

        $report = DamageReport::findOrFail($id);
        $report->transitionTo('Direvisi', $validated['catatan']);

        return redirect()->back()->with('success', 'Laporan dikirim kembali ke Manager Maintenance untuk direvisi.');
    }

    public function verifikasiLaporanTolak(Request $request, $id)
    {
        $validated = $request->validate([
            'catatan' => 'required|string',
        ]);

        $report = DamageReport::findOrFail($id);
        $report->transitionTo('Ditolak', $validated['catatan']);

        return redirect()->back()->with('success', 'Laporan ditolak secara permanen.');
    }

    public function buatLaporan(Request $request)
    {
        $fundRequests = FundRequest::with('damageReport.machine')->orderBy('created_at', 'desc')->get();
        $availableReports = DamageReport::with('machine')->where('status', 'Diverifikasi')->get();
        $revisionRequests = FundRequest::with('damageReport.machine')
            ->where('status', 'Direvisi')
            ->where('staff_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('StaffAccounting/BuatLaporan', [
            'fundRequests' => $fundRequests,
            'availableReports' => $availableReports,
            'revisionRequests' => $revisionRequests,
        ]);
    }

    public function storeFundRequest(Request $request)
    {
        $validated = $request->validate([
            'damage_report_id' => 'required|exists:damage_reports,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        $report = DamageReport::findOrFail($validated['damage_report_id']);
        abort_unless($report->status === 'Diverifikasi', 422);

        FundRequest::create([
            'damage_report_id' => $validated['damage_report_id'],
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'status' => 'Menunggu Persetujuan',
            'staff_id' => $request->user()->id,
        ]);

        $report->transitionTo('Pengajuan Dana');

        return redirect()->back()->with('success', 'Pengajuan dana berhasil dibuat.');
    }

    public function reviseFundRequest(Request $request, FundRequest $fundRequest)
    {
        abort_unless($fundRequest->staff_id === $request->user()->id, 403);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        $fundRequest->update($validated);
        $fundRequest->transitionTo('Menunggu Persetujuan');

        return redirect()->back()->with('success', 'Pengajuan dana yang direvisi berhasil dikirim ulang.');
    }

    public function laporanPerbaikanIndex(Request $request)
    {
        $availableFundRequests = FundRequest::with('damageReport.machine')
            ->where('staff_id', $request->user()->id)
            ->where('status', 'Dana Cair')
            ->whereHas('damageReport', fn ($q) => $q->where('status', 'Menunggu Laporan'))
            ->orderBy('created_at', 'desc')
            ->get();

        $reports = RepairReport::with('fundRequest.damageReport.machine', 'manager')
            ->where('staff_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('StaffAccounting/LaporanPerbaikan', [
            'availableFundRequests' => $availableFundRequests,
            'reports' => $reports,
        ]);
    }

    public function laporanPerbaikanStore(Request $request)
    {
        $validated = $request->validate([
            'fund_request_id' => 'required|exists:fund_requests,id',
            'actual_amount' => 'required|numeric|min:0',
            'summary' => 'required|string',
            'proof' => 'nullable|image|max:5120',
        ]);

        $fundRequest = FundRequest::with('damageReport')->findOrFail($validated['fund_request_id']);
        abort_unless($fundRequest->staff_id === $request->user()->id, 403);
        abort_unless(
            $fundRequest->status === 'Dana Cair' && $fundRequest->damageReport->status === 'Menunggu Laporan',
            422
        );

        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('repair_reports', 'public');
        }

        RepairReport::create([
            'fund_request_id' => $fundRequest->id,
            'actual_amount' => $validated['actual_amount'],
            'summary' => $validated['summary'],
            'proof_path' => $proofPath,
            'staff_id' => $request->user()->id,
            'status' => 'Dikirim',
        ]);

        $fundRequest->damageReport->transitionTo('Menunggu Verifikasi Laporan');

        return redirect()->back()->with('success', 'Laporan hasil perbaikan berhasil dikirim ke Manager Accounting.');
    }

    public function laporanPerbaikanUpdate(Request $request, $id)
    {
        $report = RepairReport::findOrFail($id);
        abort_unless($report->staff_id === $request->user()->id, 403);
        abort_unless($report->status === 'Direvisi', 422);

        $validated = $request->validate([
            'actual_amount' => 'required|numeric|min:0',
            'summary' => 'required|string',
            'proof' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('proof')) {
            $report->proof_path = $request->file('proof')->store('repair_reports', 'public');
        }

        $report->actual_amount = $validated['actual_amount'];
        $report->summary = $validated['summary'];
        $report->save();

        $report->transitionTo('Dikirim');

        return redirect()->back()->with('success', 'Laporan hasil perbaikan yang direvisi berhasil dikirim ulang.');
    }
}
