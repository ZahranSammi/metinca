<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\DamageReport;

class DamageReportController extends Controller
{
    public function store(Request $request)
    {
        abort_unless($request->user()->role === 'manager_maintenance', 403);

        $request->validate([
            'machine_name' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        DamageReport::create([
            'user_id' => $request->user()->id,
            'machine_name' => $request->machine_name,
            'description' => $request->description,
            'status' => 'Dilaporkan',
        ]);

        return redirect()->route('dashboard')->with('success', 'Laporan kerusakan berhasil dikirim.');
    }
}
