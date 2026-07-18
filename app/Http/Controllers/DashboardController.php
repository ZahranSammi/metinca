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
            $reports = \App\Models\DamageReport::with('machine')->where('user_id', $request->user()->id)->get();
            
            $stats = [
                'totalLaporan' => $reports->count(),
                'disetujui' => $reports->whereIn('status', ['Selesai', 'Dalam Perbaikan', 'Diverifikasi'])->count(),
                'perluRevisi' => $reports->where('status', 'Direvisi')->count(),
                'ditolak' => $reports->where('status', 'Ditolak')->count(),
            ];

            $machines = \App\Models\Machine::all();
            $pieColors = [
                'Mesin Produksi' => '#3B82F6',
                'Mesin Pengemas' => '#10B981',
                'Conveyor' => '#F59E0B',
                'Compressor' => '#8B5CF6',
                'Generator' => '#EF4444',
            ];
            
            $pieData = [];
            foreach ($machines->groupBy('category') as $category => $m) {
                $pieData[] = [
                    'name' => $category,
                    'value' => $m->count(),
                    'color' => $pieColors[$category] ?? '#94A3B8'
                ];
            }
            
            $currentYear = date('Y');
            $fundRequests = \App\Models\FundRequest::whereYear('created_at', $currentYear)
                ->where('status', 'Dana Cair')
                ->get();
                
            $lineData = [];
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            
            for ($i = 1; $i <= 12; $i++) {
                $monthFunds = $fundRequests->filter(function($fr) use ($i) {
                    return $fr->created_at->month == $i;
                })->sum('amount');
                
                $lineData[] = [
                    'name' => $months[$i - 1],
                    'value' => round($monthFunds / 1000000, 2)
                ];
            }

            $actionRequiredReports = $reports->whereIn('status', ['Direvisi', 'Ditolak'])->values();

            return Inertia::render('ManagerMaintenance/Dashboard', [
                'reports' => $reports,
                'stats' => $stats,
                'pieData' => $pieData,
                'lineData' => $lineData,
                'actionRequiredReports' => $actionRequiredReports
            ]);
        } elseif ($role === 'staff_accounting') {
            $reports = \App\Models\DamageReport::with('machine')->where('status', 'Dilaporkan')->get();
            $fundRequests = \App\Models\FundRequest::where('staff_id', $request->user()->id)->with('damageReport.machine')->get();
            return Inertia::render('StaffAccounting/Dashboard', ['reports' => $reports, 'fundRequests' => $fundRequests]);
        } elseif ($role === 'manager_accounting') {
            $fundRequests = \App\Models\FundRequest::with('damageReport.machine')->where('status', 'Menunggu Persetujuan')->get();
            $reports = \App\Models\DamageReport::with('machine')->get();
            return Inertia::render('ManagerAccounting/Dashboard', ['fundRequests' => $fundRequests, 'reports' => $reports]);
        }

        return Inertia::render('Dashboard');
    }
}
