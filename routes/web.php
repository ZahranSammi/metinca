<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RequesterController;
use App\Http\Controllers\StaffPurchasingController;
use App\Http\Controllers\StaffAccountingController;
use App\Http\Controllers\ManagerAccountingController;
use App\Http\Controllers\ReportController;

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Requester
    Route::middleware('role:requester')->group(function () {
        Route::get('/requester/pengajuan-barang', [RequesterController::class, 'index'])->name('requester.pengajuan-barang');
        Route::post('/requester/pengajuan-barang', [RequesterController::class, 'store'])->name('requester.pengajuan-barang.store');
    });

    // Staff Purchasing
    Route::middleware('role:staff_purchasing')->group(function () {
        Route::get('/purchasing/daftar-pembelian', [StaffPurchasingController::class, 'daftarPembelian'])->name('purchasing.daftar-pembelian');
        Route::put('/purchasing/daftar-pembelian/{purchaseRequest}/terima', [StaffPurchasingController::class, 'terimaPengajuan'])->name('purchasing.daftar-pembelian.terima');

        Route::get('/purchasing/pengajuan-dana', [StaffPurchasingController::class, 'pengajuanDana'])->name('purchasing.pengajuan-dana');
        Route::post('/purchasing/pengajuan-dana', [StaffPurchasingController::class, 'storeFundProposal'])->name('purchasing.pengajuan-dana.store');
        Route::put('/purchasing/pengajuan-dana/{fundProposal}', [StaffPurchasingController::class, 'reviseFundProposal'])->name('purchasing.pengajuan-dana.revisi');
        Route::put('/purchasing/pengajuan-dana/{fundProposal}/selesai', [StaffPurchasingController::class, 'selesaikanPembelian'])->name('purchasing.pengajuan-dana.selesai');

        Route::get('/purchasing/data-barang', [StaffPurchasingController::class, 'dataBarang'])->name('purchasing.data-barang');
        Route::post('/purchasing/data-barang', [StaffPurchasingController::class, 'storePurchaseDocument'])->name('purchasing.data-barang.store');
        Route::put('/purchasing/data-barang/{purchaseDocument}', [StaffPurchasingController::class, 'revisePurchaseDocument'])->name('purchasing.data-barang.revisi');
    });

    // Staff Accounting
    Route::middleware('role:staff_accounting')->group(function () {
        Route::get('/staff/dashboard', [StaffAccountingController::class, 'dashboard'])->name('staff.dashboard');

        Route::get('/staff/verifikasi-pengajuan-dana', [StaffAccountingController::class, 'verifikasiPengajuanDana'])->name('staff.verifikasi-pengajuan-dana');
        Route::put('/staff/verifikasi-pengajuan-dana/{fundProposal}/setuju', [StaffAccountingController::class, 'verifikasiPengajuanDanaSetuju'])->name('staff.verifikasi-pengajuan-dana.setuju');
        Route::put('/staff/verifikasi-pengajuan-dana/{fundProposal}/revisi', [StaffAccountingController::class, 'verifikasiPengajuanDanaRevisi'])->name('staff.verifikasi-pengajuan-dana.revisi');

        Route::get('/staff/pencairan-dana', [StaffAccountingController::class, 'pencairanDana'])->name('staff.pencairan-dana');
        Route::put('/staff/pencairan-dana/{fundProposal}/catat', [StaffAccountingController::class, 'catatPencairan'])->name('staff.pencairan-dana.catat');

        Route::get('/staff/verifikasi-data-barang', [StaffAccountingController::class, 'verifikasiDataBarang'])->name('staff.verifikasi-data-barang');
        Route::put('/staff/verifikasi-data-barang/{purchaseDocument}/setuju', [StaffAccountingController::class, 'verifikasiDataBarangSetuju'])->name('staff.verifikasi-data-barang.setuju');
        Route::put('/staff/verifikasi-data-barang/{purchaseDocument}/revisi', [StaffAccountingController::class, 'verifikasiDataBarangRevisi'])->name('staff.verifikasi-data-barang.revisi');

        Route::get('/staff/buat-laporan', [StaffAccountingController::class, 'buatLaporan'])->name('staff.buat-laporan');
        Route::post('/staff/buat-laporan', [StaffAccountingController::class, 'storePurchaseRecord'])->name('staff.buat-laporan.store');
        Route::put('/staff/buat-laporan/{purchaseRecord}', [StaffAccountingController::class, 'revisePurchaseRecord'])->name('staff.buat-laporan.revisi');
    });

    // Manager Accounting
    Route::middleware('role:manager_accounting')->group(function () {
        Route::get('/manager-acc/approval-dana', [ManagerAccountingController::class, 'approvalDana'])->name('manager-acc.approval-dana');
        Route::put('/manager-acc/approval-dana/{fundProposal}/setuju', [ManagerAccountingController::class, 'approvalDanaSetuju'])->name('manager-acc.approval-dana.setuju');
        Route::put('/manager-acc/approval-dana/{fundProposal}/revisi', [ManagerAccountingController::class, 'approvalDanaRevisi'])->name('manager-acc.approval-dana.revisi');

        Route::get('/manager-acc/periksa-laporan', [ManagerAccountingController::class, 'periksaLaporan'])->name('manager-acc.periksa-laporan');
        Route::put('/manager-acc/periksa-laporan/{purchaseRecord}/setuju', [ManagerAccountingController::class, 'periksaLaporanSetuju'])->name('manager-acc.periksa-laporan.setuju');
        Route::put('/manager-acc/periksa-laporan/{purchaseRecord}/revisi', [ManagerAccountingController::class, 'periksaLaporanRevisi'])->name('manager-acc.periksa-laporan.revisi');

        Route::get('/manager-acc/histori-pembelian', [ManagerAccountingController::class, 'historiPembelian'])->name('manager-acc.histori-pembelian');
    });

    // Staff Accounting & Manager Accounting bersama
    Route::middleware('role:staff_accounting,manager_accounting')->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    });
});

require __DIR__.'/auth.php';
