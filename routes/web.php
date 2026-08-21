<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PohonController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HistoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PohonController as AdminPohonController;
use App\Http\Controllers\Admin\PetakController as AdminPetakController;
use App\Http\Controllers\Admin\PenerbitController as AdminPenerbitController;
use App\Http\Controllers\Admin\TujuanBongkarController as AdminTujuanBongkarController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\DokumenAngkutanController;

Route::get('/', [HomeController::class, 'index']);

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('dashboard');

Route::get('/barcode', [PohonController::class, 'createBarcode'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('barcode');

Route::post('/barcode', [PohonController::class, 'storeBarcode'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('barcode.store');

Route::get('/manual', [PohonController::class, 'createManual'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('manual');

Route::post('/manual', [PohonController::class, 'storeManual'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('manual.store');

Route::get('/history', [HistoryController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('history');

Route::get('/history/{id}', [HistoryController::class, 'show'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('history.show');

Route::middleware(['auth', 'verified', 'role:admin_cdk|admin_kelompok|ganis'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/export', [AdminDashboardController::class, 'export'])->name('dashboard.export');
    
    // User Management
    Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    
    // Master Pohon
    Route::resource('pohons', AdminPohonController::class)->except(['create', 'show', 'edit']);
    
    // Master Petak
    Route::resource('petaks', AdminPetakController::class)->except(['create', 'show', 'edit']);
    
    // Master Penerbit
    Route::resource('penerbits', AdminPenerbitController::class)->except(['create', 'show', 'edit']);
    
    // Master Tujuan Bongkar
    Route::resource('tujuan_bongkars', AdminTujuanBongkarController::class)->except(['create', 'show', 'edit']);
});

Route::middleware(['auth', 'verified', 'role:admin_cdk|ganis'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dokumen-angkutans/{id}/pdf', [DokumenAngkutanController::class, 'exportPdf'])->name('dokumen_angkutans.pdf');
    Route::resource('dokumen_angkutans', DokumenAngkutanController::class)->except(['destroy']);
});

Route::middleware(['auth', 'verified', 'role:admin_cdk'])->prefix('admin')->name('admin.')->group(function () {
    // Log
    Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
