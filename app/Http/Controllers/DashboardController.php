<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->user()->role;
        
        if ($role === 'manager_maintenance') {
            $reports = \App\Models\DamageReport::where('user_id', $request->user()->id)->get();
            return Inertia::render('ManagerMaintenance/Dashboard', ['reports' => $reports]);
        } elseif ($role === 'staff_accounting') {
            $reports = \App\Models\DamageReport::where('status', 'Dilaporkan')->get();
            $fundRequests = \App\Models\FundRequest::where('staff_id', $request->user()->id)->with('damageReport')->get();
            return Inertia::render('StaffAccounting/Dashboard', ['reports' => $reports, 'fundRequests' => $fundRequests]);
        } elseif ($role === 'manager_accounting') {
            $fundRequests = \App\Models\FundRequest::with('damageReport')->where('status', 'Menunggu Persetujuan')->get();
            $reports = \App\Models\DamageReport::all();
            return Inertia::render('ManagerAccounting/Dashboard', ['fundRequests' => $fundRequests, 'reports' => $reports]);
        }

        return Inertia::render('Dashboard');
    }
}
