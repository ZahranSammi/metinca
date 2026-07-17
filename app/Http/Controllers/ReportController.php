<?php

namespace App\Http\Controllers;

use App\Models\FundRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['staff_accounting', 'manager_accounting']), 403);

        $fundRequests = $this->filteredQuery($request)->get();

        return Inertia::render('Reports/Index', [
            'fundRequests' => $fundRequests,
            'filters' => $request->only(['start_date', 'end_date', 'status']),
            'summary' => [
                'total' => $fundRequests->count(),
                'total_diajukan' => $fundRequests->sum('amount'),
                'total_disetujui' => $fundRequests->where('status', 'Disetujui')->sum('amount'),
                'total_ditolak' => $fundRequests->where('status', 'Ditolak')->count(),
                'total_menunggu' => $fundRequests->where('status', 'Menunggu Persetujuan')->count(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['staff_accounting', 'manager_accounting']), 403);

        $fundRequests = $this->filteredQuery($request)->get();

        $filename = 'laporan-perbaikan-mesin-'.now()->format('Y-m-d-His').'.csv';

        return Response::streamDownload(function () use ($fundRequests) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Tanggal Pengajuan', 'Mesin', 'Deskripsi Kerusakan', 'Diajukan Oleh',
                'Nominal', 'Justifikasi', 'Status', 'Diproses Oleh', 'Tanggal Update',
            ]);

            foreach ($fundRequests as $fundRequest) {
                fputcsv($handle, [
                    $fundRequest->created_at->format('Y-m-d H:i'),
                    $fundRequest->damageReport?->machine_name,
                    $fundRequest->damageReport?->description,
                    $fundRequest->staff?->name,
                    $fundRequest->amount,
                    $fundRequest->description,
                    $fundRequest->status,
                    $fundRequest->manager?->name,
                    $fundRequest->updated_at->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function filteredQuery(Request $request)
    {
        $query = FundRequest::with(['damageReport', 'staff', 'manager'])->latest();

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
