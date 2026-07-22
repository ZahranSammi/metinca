<?php

namespace App\Http\Controllers;

use App\Models\FundProposal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['staff_accounting', 'manager_accounting']), 403);

        $fundProposals = $this->filteredQuery($request)->get();

        return Inertia::render('Reports/Index', [
            'fundProposals' => $fundProposals,
            'filters' => $request->only(['start_date', 'end_date', 'status']),
            'summary' => [
                'total' => $fundProposals->count(),
                'total_diajukan' => $fundProposals->sum('amount'),
                'total_dicairkan' => $fundProposals->whereNotNull('disbursed_at')->sum('amount'),
                'total_direvisi' => $fundProposals->whereIn('status', ['Direvisi Staff Accounting', 'Direvisi Manager'])->count(),
                'total_menunggu' => $fundProposals->whereIn('status', ['Diajukan', 'Menunggu Persetujuan Manager'])->count(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['staff_accounting', 'manager_accounting']), 403);

        $fundProposals = $this->filteredQuery($request)->get();

        $filename = 'laporan-pengajuan-dana-barang-'.now()->format('Y-m-d-His').'.csv';

        return Response::streamDownload(function () use ($fundProposals) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Tanggal Pengajuan', 'Barang', 'Deskripsi', 'Diajukan Oleh',
                'Nominal', 'Justifikasi', 'Status', 'Diproses Oleh', 'Tanggal Update',
            ]);

            foreach ($fundProposals as $fundProposal) {
                fputcsv($handle, [
                    $fundProposal->created_at->format('Y-m-d H:i'),
                    $fundProposal->purchaseRequest?->item_name,
                    $fundProposal->purchaseRequest?->description,
                    $fundProposal->staffPurchasing?->name,
                    $fundProposal->amount,
                    $fundProposal->description,
                    $fundProposal->status,
                    $fundProposal->manager?->name,
                    $fundProposal->updated_at->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function filteredQuery(Request $request)
    {
        $query = FundProposal::with(['purchaseRequest', 'staffPurchasing', 'manager'])->latest();

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query;
    }
}
