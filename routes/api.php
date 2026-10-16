<?php

use App\Http\Controllers\BarangOperasionalController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\PembelianController;
use App\Http\Controllers\PengajuanController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

// Public Auth API
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['Kredensial email atau password tidak cocok.'],
        ]);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user,
    ]);
});

// Protected REST API
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());

    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil logout']);
    });

    // Purchase Requests
    Route::get('/purchase-requests', [PengajuanController::class, 'index']);
    Route::post('/purchase-requests', [PengajuanController::class, 'store']);
    Route::put('/purchase-requests/{id}', [PengajuanController::class, 'update']);
    Route::post('/purchase-requests/{id}/verifikasi', [PengajuanController::class, 'verifikasi']);

    // Purchases & Documents
    Route::get('/purchases', [PembelianController::class, 'index']);
    Route::post('/purchases', [PembelianController::class, 'store']);
    Route::post('/purchases/{id}/submit', [PembelianController::class, 'submitToInventarisir']);
    Route::post('/purchase-documents/{id}/verifikasi', [PembelianController::class, 'verifikasiDokumen']);

    // Master Items
    Route::get('/items', [BarangOperasionalController::class, 'index']);
    Route::post('/items', [BarangOperasionalController::class, 'store']);
    Route::put('/items/{id}', [BarangOperasionalController::class, 'update']);
    Route::delete('/items/{id}', [BarangOperasionalController::class, 'destroy']);
    Route::post('/items/{id}/adjust-stock', [BarangOperasionalController::class, 'adjustStock']);

    // Purchase Reports
    Route::get('/purchase-reports', [LaporanController::class, 'index']);
    Route::post('/purchase-reports', [LaporanController::class, 'store']);
    Route::put('/purchase-reports/{id}', [LaporanController::class, 'update']);
    Route::post('/purchase-reports/{id}/verifikasi', [LaporanController::class, 'verifikasi']);
});
