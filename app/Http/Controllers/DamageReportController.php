<?php

namespace App\Http\Controllers;

use App\Models\DamageReport;
use App\Models\Machine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class DamageReportController extends Controller
{
    public function index()
    {
        $reports = DamageReport::with('machine', 'user')->orderBy('created_at', 'desc')->get();
        $machines = Machine::all();

        return Inertia::render('ManagerMaintenance/LaporanKerusakan', [
            'reports' => $reports,
            'machines' => $machines
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'machine_id' => 'required|exists:machines,id',
            'description' => 'required|string',
            'photo' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120'
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('damage_reports', 'public');
        }

        DamageReport::create([
            'user_id' => $request->user()->id,
            'machine_id' => $validated['machine_id'],
            'description' => $validated['description'],
            'photo_path' => $photoPath,
            'status' => 'Dilaporkan'
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil dikirim ke Staff Accounting!');
    }

    public function update(Request $request, DamageReport $damageReport)
    {
        abort_unless($damageReport->user_id === $request->user()->id, 403);
        abort_unless($damageReport->status === 'Direvisi', 422);

        $validated = $request->validate([
            'machine_id' => 'required|exists:machines,id',
            'description' => 'required|string',
            'photo' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120'
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('damage_reports', 'public');
        }

        $damageReport->update($validated);
        $damageReport->transitionTo('Dilaporkan');

        return redirect()->back()->with('success', 'Laporan perbaikan berhasil dikirim ulang ke Staff Accounting!');
    }

    public function mulaiPerbaikan(Request $request, DamageReport $damageReport)
    {
        abort_unless($damageReport->user_id === $request->user()->id, 403);
        abort_unless($damageReport->status === 'Dalam Perbaikan', 422);

        $damageReport->transitionTo('Perbaikan Berjalan');

        return redirect()->back()->with('success', 'Dana perbaikan diterima. Mesin sedang dalam proses perbaikan.');
    }

    public function selesaiPerbaikan(Request $request, DamageReport $damageReport)
    {
        abort_unless($damageReport->user_id === $request->user()->id, 403);
        abort_unless($damageReport->status === 'Perbaikan Berjalan', 422);

        $damageReport->transitionTo('Menunggu Laporan');

        return redirect()->back()->with('success', 'Perbaikan fisik selesai. Menunggu laporan pertanggungjawaban dari Staff Accounting.');
    }
}
