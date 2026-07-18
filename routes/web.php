<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DamageReportController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\StaffAccountingController;
use App\Http\Controllers\ManagerAccountingController;
use App\Http\Controllers\ReportController;

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Manager Maintenance
    Route::middleware('role:manager_maintenance')->group(function () {
        Route::get('/master-mesin', [MachineController::class, 'index'])->name('master-mesin');
        Route::post('/master-mesin', [MachineController::class, 'store'])->name('master-mesin.store');
        Route::put('/master-mesin/{machine}', [MachineController::class, 'update'])->name('master-mesin.update');
        Route::delete('/master-mesin/{machine}', [MachineController::class, 'destroy'])->name('master-mesin.destroy');

        Route::get('/laporan-kerusakan', [DamageReportController::class, 'index'])->name('laporan-kerusakan');
        Route::post('/laporan-kerusakan', [DamageReportController::class, 'store'])->name('laporan-kerusakan.store');
        Route::put('/laporan-kerusakan/{damageReport}', [DamageReportController::class, 'update'])->name('laporan-kerusakan.update');
        Route::put('/laporan-kerusakan/{damageReport}/mulai-perbaikan', [DamageReportController::class, 'mulaiPerbaikan'])->name('laporan-kerusakan.mulai-perbaikan');
        Route::put('/laporan-kerusakan/{damageReport}/selesai-perbaikan', [DamageReportController::class, 'selesaiPerbaikan'])->name('laporan-kerusakan.selesai-perbaikan');
    });

    // Staff Accounting
    Route::middleware('role:staff_accounting')->group(function () {
        Route::get('/staff/dashboard', [StaffAccountingController::class, 'dashboard'])->name('staff.dashboard');

        Route::get('/staff/verifikasi-laporan', [StaffAccountingController::class, 'verifikasiLaporan'])->name('staff.verifikasi-laporan');
        Route::put('/staff/verifikasi-laporan/{id}', [StaffAccountingController::class, 'verifikasiLaporanUpdate'])->name('staff.verifikasi-laporan.update');
        Route::put('/staff/verifikasi-laporan/{id}/revisi', [StaffAccountingController::class, 'verifikasiLaporanRevisi'])->name('staff.verifikasi-laporan.revisi');
        Route::put('/staff/verifikasi-laporan/{id}/tolak', [StaffAccountingController::class, 'verifikasiLaporanTolak'])->name('staff.verifikasi-laporan.tolak');

        Route::get('/staff/buat-laporan', [StaffAccountingController::class, 'buatLaporan'])->name('staff.buat-laporan');
        Route::post('/staff/buat-laporan', [StaffAccountingController::class, 'storeFundRequest'])->name('staff.buat-laporan.store');
        Route::put('/staff/buat-laporan/{fundRequest}', [StaffAccountingController::class, 'reviseFundRequest'])->name('staff.buat-laporan.revisi');

        Route::get('/staff/laporan-perbaikan', [StaffAccountingController::class, 'laporanPerbaikanIndex'])->name('staff.laporan-perbaikan');
        Route::post('/staff/laporan-perbaikan', [StaffAccountingController::class, 'laporanPerbaikanStore'])->name('staff.laporan-perbaikan.store');
        Route::put('/staff/laporan-perbaikan/{id}', [StaffAccountingController::class, 'laporanPerbaikanUpdate'])->name('staff.laporan-perbaikan.update');
    });

    // Manager Accounting
    Route::middleware('role:manager_accounting')->group(function () {
        Route::get('/manager-acc/approval-dana', [ManagerAccountingController::class, 'approvalDana'])->name('manager-acc.approval-dana');
        Route::put('/manager-acc/approval-dana/{id}', [ManagerAccountingController::class, 'approvalDanaUpdate'])->name('manager-acc.approval-dana.update');
        Route::put('/manager-acc/approval-dana/{id}/cairkan', [ManagerAccountingController::class, 'cairkanDana'])->name('manager-acc.approval-dana.cairkan');

        Route::get('/manager-acc/periksa-laporan', [ManagerAccountingController::class, 'periksaLaporan'])->name('manager-acc.periksa-laporan');
        Route::put('/manager-acc/periksa-laporan/{id}/verifikasi', [ManagerAccountingController::class, 'verifikasiLaporanPerbaikan'])->name('manager-acc.laporan-perbaikan.verifikasi');
        Route::put('/manager-acc/periksa-laporan/{id}/revisi', [ManagerAccountingController::class, 'revisiLaporanPerbaikan'])->name('manager-acc.laporan-perbaikan.revisi');
        Route::put('/manager-acc/periksa-laporan/{id}/setujui', [ManagerAccountingController::class, 'setujuiLaporanPerbaikan'])->name('manager-acc.laporan-perbaikan.setujui');

        Route::get('/manager-acc/histori-perbaikan', [ManagerAccountingController::class, 'historiPerbaikan'])->name('manager-acc.histori-perbaikan');

        Route::get('/manager-acc/kelola-anggaran', [ManagerAccountingController::class, 'kelolaAnggaran'])->name('manager-acc.kelola-anggaran');
        Route::put('/manager-acc/kelola-anggaran/{machine}', [ManagerAccountingController::class, 'kelolaAnggaranUpdate'])->name('manager-acc.kelola-anggaran.update');
    });

    // Staff Accounting & Manager Accounting bersama
    Route::middleware('role:staff_accounting,manager_accounting')->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    });
});

require __DIR__.'/auth.php';
