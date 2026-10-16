<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\BarangOperasionalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PembelianController;
use App\Http\Controllers\PeminjamanController;
use App\Http\Controllers\PengajuanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Alur 1: Pengajuan Pembelian Barang Operasional
    Route::get('/pengajuan', [PengajuanController::class, 'index'])->name('pengajuan.index');
    Route::post('/pengajuan', [PengajuanController::class, 'store'])->name('pengajuan.store');
    Route::put('/pengajuan/{id}', [PengajuanController::class, 'update'])->name('pengajuan.update');
    Route::post('/pengajuan/{id}/verifikasi', [PengajuanController::class, 'verifikasi'])->name('pengajuan.verifikasi');

    // Alur 2 & 3: Pembelian Barang Operasional & Verifikasi Dokumen
    Route::get('/pembelian', [PembelianController::class, 'index'])->name('pembelian.index');
    Route::post('/pembelian', [PembelianController::class, 'store'])->name('pembelian.store');
    Route::post('/pembelian/{id}/submit', [PembelianController::class, 'submitToInventarisir'])->name('pembelian.submit');
    Route::post('/pembelian-dokumen/{id}/verifikasi', [PembelianController::class, 'verifikasiDokumen'])->name('pembelian.verifikasi-dokumen');

    // Master Data Barang Operasional, Pendataan Ruangan & Tracking Lokasi
    Route::get('/barang', [BarangOperasionalController::class, 'index'])->name('barang.index');
    Route::post('/barang', [BarangOperasionalController::class, 'store'])->name('barang.store');
    Route::put('/barang/{id}', [BarangOperasionalController::class, 'update'])->name('barang.update');
    Route::delete('/barang/{id}', [BarangOperasionalController::class, 'destroy'])->name('barang.destroy');
    Route::post('/barang/{id}/adjust-stock', [BarangOperasionalController::class, 'adjustStock'])->name('barang.adjust-stock');
    Route::get('/barang/pendataan-ruangan', [BarangOperasionalController::class, 'pendataanRuangan'])->name('barang.pendataan-ruangan');
    Route::post('/barang/pendataan-ruangan', [BarangOperasionalController::class, 'updateRuanganStok'])->name('barang.update-ruangan-stok');
    Route::get('/barang/tracking', [BarangOperasionalController::class, 'tracking'])->name('barang.tracking');

    // Modul Peminjaman Barang Antar Cabang (Salatiga, Tambun, Jakarta Timur)
    Route::get('/peminjaman', [PeminjamanController::class, 'index'])->name('peminjaman.index');
    Route::post('/peminjaman', [PeminjamanController::class, 'store'])->name('peminjaman.store');
    Route::post('/peminjaman/{id}/setujui', [PeminjamanController::class, 'setujui'])->name('peminjaman.setujui');
    Route::post('/peminjaman/{id}/tolak', [PeminjamanController::class, 'tolak'])->name('peminjaman.tolak');
    Route::post('/peminjaman/{id}/kembalikan', [PeminjamanController::class, 'kembalikan'])->name('peminjaman.kembalikan');

    // Alur 4: Membuat Laporan & Arsip
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::post('/laporan', [LaporanController::class, 'store'])->name('laporan.store');
    Route::put('/laporan/{id}', [LaporanController::class, 'update'])->name('laporan.update');
    Route::post('/laporan/{id}/verifikasi', [LaporanController::class, 'verifikasi'])->name('laporan.verifikasi');
    Route::get('/laporan/{id}/export', [LaporanController::class, 'export'])->name('laporan.export');

    // Manajemen User & Assign Role
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{id}/role', [UserController::class, 'updateRole'])->name('users.update-role');

    // Audit Log & Notifications
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
