<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\FundRequest;
use App\Models\DamageReport;

class FundRequestController extends Controller
{
    public function store(Request $request)
    {
        abort_unless($request->user()->role === 'staff_accounting', 403);

        $request->validate([
            'damage_report_id' => 'required|exists:damage_reports,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        FundRequest::create([
            'damage_report_id' => $request->damage_report_id,
            'amount' => $request->amount,
            'description' => $request->description,
            'status' => 'Menunggu Persetujuan',
            'staff_id' => $request->user()->id,
        ]);

        // Update damage report status to reflect fund request created
        DamageReport::where('id', $request->damage_report_id)->update(['status' => 'Dana Diajukan']);

        return redirect()->route('dashboard')->with('success', 'Pengajuan dana berhasil dibuat.');
    }

    public function update(Request $request, FundRequest $fundRequest)
    {
        abort_unless($request->user()->role === 'manager_accounting', 403);

        $request->validate([
            'status' => 'required|in:Disetujui,Ditolak',
        ]);

        $fundRequest->update([
            'status' => $request->status,
            'manager_id' => $request->user()->id,
        ]);

        // If approved, maybe update the damage report as well
        if ($request->status === 'Disetujui') {
            $fundRequest->damageReport()->update(['status' => 'Dana Diberikan']);
        }

        return redirect()->route('dashboard')->with('success', 'Status pengajuan dana diperbarui.');
    }
}
