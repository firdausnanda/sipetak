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
use App\Http\Controllers\DashboardMonitoringController;
use App\Http\Controllers\DailyOperationController;


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

Route::get('/api/rencana-tebang/check-barcode', [App\Http\Controllers\Admin\RencanaTebangController::class, 'checkBarcode'])
    ->middleware(['auth', 'verified'])
    ->name('api.rencana_tebang.check_barcode');

Route::get('/api/pohon/check', [PohonController::class, 'checkPohon'])
    ->middleware(['auth', 'verified'])
    ->name('api.pohon.check');

Route::get('/api/volume/calculate', [PohonController::class, 'calculateVolumeApi'])
    ->middleware(['auth', 'verified'])
    ->name('api.volume.calculate');

Route::get('/history', [HistoryController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('history');

Route::get('/history/{id}', [HistoryController::class, 'show'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('history.show');

Route::middleware(['auth', 'verified', 'role:admin_cdk|admin_kelompok|ganis'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/export', [AdminDashboardController::class, 'export'])->name('dashboard.export');
    Route::put('/dashboard/batangs/{id}', [AdminDashboardController::class, 'updateBatang'])->name('dashboard.batang.update');
    
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
    
    // Rencana Tebang
    Route::get('rencana-tebangs', [App\Http\Controllers\Admin\RencanaTebangController::class, 'index'])->name('rencana_tebangs.index');
    Route::get('rencana-tebangs/template', [App\Http\Controllers\Admin\RencanaTebangController::class, 'template'])->name('rencana_tebangs.template');
    Route::post('rencana-tebangs/import', [App\Http\Controllers\Admin\RencanaTebangController::class, 'import'])->name('rencana_tebangs.import');
    Route::delete('rencana-tebangs/{id}', [App\Http\Controllers\Admin\RencanaTebangController::class, 'destroy'])->name('rencana_tebangs.destroy');

    // Tabel Volume
    Route::get('tabel-volumes', [App\Http\Controllers\Admin\TabelVolumeController::class, 'index'])->name('tabel_volumes.index');
    Route::get('tabel-volumes/template', [App\Http\Controllers\Admin\TabelVolumeController::class, 'template'])->name('tabel_volumes.template');
    Route::post('tabel-volumes/import', [App\Http\Controllers\Admin\TabelVolumeController::class, 'import'])->name('tabel_volumes.import');
    Route::get('tabel-volumes/generate-volume', [App\Http\Controllers\Admin\TabelVolumeController::class, 'generateVolume'])->name('tabel_volumes.generate_volume');
    Route::delete('tabel-volumes/{id}', [App\Http\Controllers\Admin\TabelVolumeController::class, 'destroy'])->name('tabel_volumes.destroy');
});

Route::middleware(['auth', 'verified', 'role:admin_cdk|ganis'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dokumen-angkutans/{id}/pdf', [DokumenAngkutanController::class, 'exportPdf'])->name('dokumen_angkutans.pdf');
    Route::resource('dokumen_angkutans', DokumenAngkutanController::class)->except(['destroy']);
});

Route::middleware(['auth', 'verified', 'role:admin_cdk|ganis|admin_kelompok'])->prefix('admin')->name('admin.')->group(function () {
    // Lampiran SKSHHK
    Route::get('/lampiran-skshhk', [App\Http\Controllers\Admin\LampiranSkshhkController::class, 'index'])->name('lampiran_skshhk.index');
    Route::get('/lampiran-skshhk/create', [App\Http\Controllers\Admin\LampiranSkshhkController::class, 'create'])->name('lampiran_skshhk.create');
    Route::post('/lampiran-skshhk', [App\Http\Controllers\Admin\LampiranSkshhkController::class, 'store'])->name('lampiran_skshhk.store');
    Route::get('/lampiran-skshhk/{id}/edit', [App\Http\Controllers\Admin\LampiranSkshhkController::class, 'edit'])->name('lampiran_skshhk.edit');
    Route::put('/lampiran-skshhk/{id}', [App\Http\Controllers\Admin\LampiranSkshhkController::class, 'update'])->name('lampiran_skshhk.update');
    Route::delete('/lampiran-skshhk/{id}', [App\Http\Controllers\Admin\LampiranSkshhkController::class, 'destroy'])->name('lampiran_skshhk.destroy');
    Route::get('/lampiran-skshhk/{id}/export-pdf', [App\Http\Controllers\Admin\LampiranSkshhkController::class, 'exportPdf'])->name('lampiran_skshhk.export_pdf');
    Route::get('/api/lampiran-skshhk/available-trees', [App\Http\Controllers\Admin\LampiranSkshhkController::class, 'getAvailableTrees'])->name('lampiran_skshhk.available_trees');
});

Route::middleware(['auth', 'verified', 'role:admin_cdk'])->prefix('admin')->name('admin.')->group(function () {
    // Log
    Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Mobile-first Monitoring Dashboard
    Route::get('/mobile/dashboard', [DashboardMonitoringController::class, 'index'])
        ->name('mobile.dashboard')
        ->middleware('can:view_felling_progress');
    
    // Daily Operations
    Route::get('/operations', [App\Http\Controllers\DailyOperationController::class, 'index'])->name('operations.index');
    Route::put('/operations/{date}/{user_id}/mark-paid', [App\Http\Controllers\DailyOperationController::class, 'markAsPaid'])->name('operations.mark_paid');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
