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
use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\DokumenAngkutanController;
use App\Http\Controllers\Admin\LampiranSkshhkController;
use App\Http\Controllers\Admin\RencanaTebangController;
use App\Http\Controllers\Admin\TabelVolumeController;
use App\Http\Controllers\DashboardMonitoringController;
use App\Http\Controllers\DailyOperationController;
use App\Http\Controllers\VerificationController;

Route::get('/verifikasi/{token}', [VerificationController::class, 'show'])->name('verifikasi.show');

Route::get('/', [HomeController::class, 'index']);

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('dashboard');

Route::get('/prestasi-kerja', [DashboardController::class, 'prestasiKerja'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('prestasi_kerja');

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

Route::get('/api/rencana-tebang/check-barcode', [RencanaTebangController::class, 'checkBarcode'])
    ->middleware(['auth', 'verified'])
    ->name('api.rencana_tebang.check_barcode');

Route::get('/api/pohon/check', [PohonController::class, 'checkPohon'])
    ->middleware(['auth', 'verified'])
    ->name('api.pohon.check');

Route::get('/api/volume/calculate', [PohonController::class, 'calculateVolumeApi'])
    ->middleware(['auth', 'verified'])
    ->name('api.volume.calculate');

// Route::get('/api/pohon/cleanup', [PohonController::class, 'cleanupDuplicates'])
//     ->middleware(['auth', 'verified'])
//     ->name('api.pohon.cleanup');

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
    Route::get('rencana-tebangs', [RencanaTebangController::class, 'index'])->name('rencana_tebangs.index');
    Route::get('rencana-tebangs/template', [RencanaTebangController::class, 'template'])->name('rencana_tebangs.template');
    Route::post('rencana-tebangs/import', [RencanaTebangController::class, 'import'])->name('rencana_tebangs.import');
    Route::delete('rencana-tebangs/{id}', [RencanaTebangController::class, 'destroy'])->name('rencana_tebangs.destroy');

    // Tabel Volume
    Route::get('tabel-volumes', [TabelVolumeController::class, 'index'])->name('tabel_volumes.index');
    Route::get('tabel-volumes/template', [TabelVolumeController::class, 'template'])->name('tabel_volumes.template');
    Route::post('tabel-volumes/import', [TabelVolumeController::class, 'import'])->name('tabel_volumes.import');
    Route::get('tabel-volumes/generate-volume', [TabelVolumeController::class, 'generateVolume'])->name('tabel_volumes.generate_volume');
    Route::delete('tabel-volumes/{id}', [TabelVolumeController::class, 'destroy'])->name('tabel_volumes.destroy');
});

Route::middleware(['auth', 'verified', 'role:admin_cdk|ganis'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dokumen-angkutans/{id}/pdf', [DokumenAngkutanController::class, 'exportPdf'])->name('dokumen_angkutans.pdf');
    Route::get('/dokumen-angkutans/{id}/excel', [DokumenAngkutanController::class, 'exportExcel'])->name('dokumen_angkutans.excel');
    Route::resource('dokumen_angkutans', DokumenAngkutanController::class)->except(['destroy']);
});

Route::middleware(['auth', 'verified', 'role:admin_cdk|ganis|admin_kelompok'])->prefix('admin')->name('admin.')->group(function () {
    // Lampiran SKSHHK
    Route::get('/lampiran-skshhk', [LampiranSkshhkController::class, 'index'])->name('lampiran_skshhk.index');
    Route::get('/lampiran-skshhk/create', [LampiranSkshhkController::class, 'create'])->name('lampiran_skshhk.create');
    Route::post('/lampiran-skshhk', [LampiranSkshhkController::class, 'store'])->name('lampiran_skshhk.store');
    Route::get('/lampiran-skshhk/{id}/edit', [LampiranSkshhkController::class, 'edit'])->name('lampiran_skshhk.edit');
    Route::put('/lampiran-skshhk/{id}', [LampiranSkshhkController::class, 'update'])->name('lampiran_skshhk.update');
    Route::delete('/lampiran-skshhk/{id}', [LampiranSkshhkController::class, 'destroy'])->name('lampiran_skshhk.destroy');
    Route::get('/lampiran-skshhk/{id}/export-pdf', [LampiranSkshhkController::class, 'exportPdf'])->name('lampiran_skshhk.export_pdf');
    Route::get('/lampiran-skshhk/{id}/export-excel', [LampiranSkshhkController::class, 'exportExcel'])->name('lampiran_skshhk.export_excel');
    Route::get('/api/lampiran-skshhk/available-trees', [LampiranSkshhkController::class, 'getAvailableTrees'])->name('lampiran_skshhk.available_trees');
});

Route::middleware(['auth', 'verified', 'role:admin_cdk'])->prefix('admin')->name('admin.')->group(function () {
    // Log
    Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    
    // Backup Database
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup', [BackupController::class, 'store'])->name('backup.store');
    Route::get('/backup/download', [BackupController::class, 'download'])->name('backup.download');
    Route::delete('/backup', [BackupController::class, 'destroy'])->name('backup.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Mobile-first Monitoring Dashboard
    Route::get('/mobile/dashboard', [DashboardMonitoringController::class, 'index'])
        ->name('mobile.dashboard')
        ->middleware('can:view_felling_progress');
    
    // Daily Operations
    Route::get('/operations', [DailyOperationController::class, 'index'])->name('operations.index');
    Route::put('/operations/{date}/{user_id}/mark-paid', [DailyOperationController::class, 'markAsPaid'])->name('operations.mark_paid');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// Maintenance Mode Routes
// Route::get('/maintenance/down', function () {
//     \Illuminate\Support\Facades\Artisan::call('down');
//     return "Aplikasi sekarang dalam mode maintenance (down).";
// });

// Route::get('/maintenance/up', function () {
//     \Illuminate\Support\Facades\Artisan::call('up');
//     return "Aplikasi sekarang sudah live kembali (up).";
// });
