<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('inventory', 'inventory')->name('inventory');
    Route::inertia('requests', 'requests')->name('requests');
});

require __DIR__.'/settings.php';
