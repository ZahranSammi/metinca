<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Machine;

class MachineController extends Controller
{
    public function index()
    {
        $machines = Machine::all();
        return Inertia::render('ManagerMaintenance/MasterMesin', [
            'machines' => $machines
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:machines',
            'name' => 'required|string',
            'model_name' => 'required|string',
            'category' => 'required|string',
            'pic' => 'required|string',
        ]);

        Machine::create($validated);

        return redirect()->back()->with('success', 'Data mesin berhasil disimpan!');
    }

    public function update(Request $request, Machine $machine)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:machines,code,' . $machine->id,
            'name' => 'required|string',
            'model_name' => 'required|string',
            'category' => 'required|string',
            'pic' => 'required|string',
        ]);

        $machine->update($validated);

        return redirect()->back()->with('success', 'Data mesin berhasil diubah!');
    }

    public function destroy(Machine $machine)
    {
        $machine->delete();
        return redirect()->back()->with('success', 'Data mesin berhasil dihapus!');
    }
}
