<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        return match ($request->user()->role) {
            'requester' => app(RequesterController::class)->dashboard($request),
            'staff_purchasing' => app(StaffPurchasingController::class)->dashboard($request),
            'staff_accounting' => app(StaffAccountingController::class)->dashboard($request),
            'manager_accounting' => app(ManagerAccountingController::class)->dashboard($request),
            default => Inertia::render('Dashboard'),
        };
    }
}
