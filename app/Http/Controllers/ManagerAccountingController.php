<?php

namespace App\Http\Controllers;

use App\Models\FundRequest;
use App\Models\DamageReport;
use App\Models\Machine;
use App\Models\RepairReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManagerAccountingController extends Controller
{
    public function approvalDana()
    {
        $requests = FundRequest::with('damageReport.machine', 'staff')
            ->where('status', 'Menunggu Persetujuan')
            ->orderBy('created_at', 'desc')
            ->get();

        $disbursements = FundRequest::with('damageReport.machine', 'staff')
            ->where('status', 'Disetujui')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('ManagerAccounting/ApprovalDana', [
            'requests' => $requests,
            'disbursements' => $disbursements,
        ]);
    }

    public function approvalDanaUpdate(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Disetujui,Ditolak,Direvisi',
            'catatan' => 'required_if:status,Direvisi|nullable|string',
        ]);

        $fundRequest = FundRequest::with('damageReport.machine')->findOrFail($id);
        abort_unless($fundRequest->status === 'Menunggu Persetujuan', 422);

        if ($validated['status'] === 'Direvisi') {
            $fundRequest->transitionTo('Direvisi', $validated['catatan'], $request->user()->id);
            return redirect()->back()->with('success', 'Pengajuan dana dikirim kembali ke Staff Accounting untuk direvisi.');
        }

        if ($validated['status'] === 'Ditolak') {
            $fundRequest->transitionTo('Ditolak', null, $request->user()->id);
            $fundRequest->damageReport->transitionTo('Diverifikasi');
            return redirect()->back()->with('success', 'Pengajuan dana ditolak.');
        }

        $fundRequest->transitionTo('Disetujui', null, $request->user()->id);

        return redirect()->back()->with('success', 'Pengajuan dana disetujui. Silakan lanjutkan ke pencairan dana.');
    }

    public function cairkanDana(Request $request, $id)
    {
        $fundRequest = FundRequest::with('damageReport.machine')->findOrFail($id);
        abort_unless($fundRequest->status === 'Disetujui', 422);

        $machine = $fundRequest->damageReport->machine;

        if ($machine && $fundRequest->amount > $machine->budget) {
            return redirect()->back()->withErrors([
                'amount' => 'Nominal pengajuan melebihi sisa anggaran perbaikan untuk mesin '.$machine->name.' (Rp '.number_format($machine->budget, 0, ',', '.').').',
            ]);
        }

        $fundRequest->transitionTo('Dana Cair', null, $request->user()->id);

        if ($machine) {
            $machine->decrement('budget', $fundRequest->amount);
        }

        $fundRequest->damageReport->transitionTo('Dalam Perbaikan');

        return redirect()->back()->with('success', 'Dana perbaikan telah dicairkan ke Manager Maintenance.');
    }

    public function periksaLaporan()
    {
        $requests = FundRequest::with('damageReport.machine', 'staff', 'damageReport.user')
            ->orderBy('created_at', 'desc')
            ->get();

        $repairReports = RepairReport::with('fundRequest.damageReport.machine', 'staff', 'manager')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('ManagerAccounting/PeriksaLaporan', [
            'requests' => $requests,
            'repairReports' => $repairReports,
        ]);
    }

    public function verifikasiLaporanPerbaikan(Request $request, $id)
    {
        $report = RepairReport::findOrFail($id);
        abort_unless($report->status === 'Dikirim', 422);

        $report->transitionTo('Diverifikasi', null, $request->user()->id);

        return redirect()->back()->with('success', 'Laporan perbaikan telah diverifikasi.');
    }

    public function revisiLaporanPerbaikan(Request $request, $id)
    {
        $report = RepairReport::findOrFail($id);
        abort_unless(in_array($report->status, ['Dikirim', 'Diverifikasi']), 422);

        $validated = $request->validate([
            'revision_note' => 'required|string',
        ]);

        $report->transitionTo('Direvisi', $validated['revision_note'], $request->user()->id);

        return redirect()->back()->with('success', 'Laporan perbaikan dikembalikan ke Staff Accounting untuk direvisi.');
    }

    public function setujuiLaporanPerbaikan(Request $request, $id)
    {
        $report = RepairReport::with('fundRequest.damageReport')->findOrFail($id);
        abort_unless($report->status === 'Diverifikasi', 422);

        $report->transitionTo('Disetujui', null, $request->user()->id);

        // Closing: laporan pertanggungjawaban disetujui, siklus perbaikan mesin ini selesai.
        $report->fundRequest?->damageReport->transitionTo('Selesai');

        return redirect()->back()->with('success', 'Laporan perbaikan telah disetujui. Siklus perbaikan mesin ditutup.');
    }

    public function historiPerbaikan()
    {
        // Histori seluruh dana yang sudah dicairkan (baik masih berjalan maupun sudah selesai)
        $requests = FundRequest::with('damageReport.machine', 'staff', 'damageReport.user')
            ->where('status', 'Dana Cair')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('ManagerAccounting/HistoriPerbaikan', [
            'requests' => $requests
        ]);
    }

    public function kelolaAnggaran()
    {
        $machines = Machine::orderBy('name')->get();

        return Inertia::render('ManagerAccounting/KelolaAnggaran', [
            'machines' => $machines,
        ]);
    }

    public function kelolaAnggaranUpdate(Request $request, Machine $machine)
    {
        $validated = $request->validate([
            'budget' => 'required|numeric|min:0',
        ]);

        $machine->update($validated);

        return redirect()->back()->with('success', 'Anggaran mesin berhasil diperbarui.');
    }
}
