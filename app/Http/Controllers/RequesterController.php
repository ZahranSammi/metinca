<?php

namespace App\Http\Controllers;

use App\Models\PurchaseRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequesterController extends Controller
{
    public function dashboard(Request $request)
    {
        $requests = PurchaseRequest::where('requester_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'totalPengajuan' => $requests->count(),
            'diajukan' => $requests->where('status', 'Diajukan')->count(),
            'dalamProses' => $requests->where('status', 'Masuk Daftar Pembelian')->count(),
            'selesai' => $requests->where('status', 'Selesai')->count(),
        ];

        return Inertia::render('Requester/Dashboard', [
            'requests' => $requests->take(5)->values(),
            'stats' => $stats,
        ]);
    }

    public function index(Request $request)
    {
        $requests = PurchaseRequest::where('requester_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Requester/PengajuanBarang', [
            'requests' => $requests,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'description' => 'required|string',
        ]);

        PurchaseRequest::create([
            'requester_id' => $request->user()->id,
            'item_name' => $validated['item_name'],
            'quantity' => $validated['quantity'],
            'description' => $validated['description'],
            'status' => 'Diajukan',
        ]);

        return redirect()->back()->with('success', 'Pengajuan pembelian barang operasional berhasil dikirim ke Staff Purchasing!');
    }
}
