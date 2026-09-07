<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Menjadwalkan backup database setiap jam 2 pagi
Schedule::command('backup:run --only-db')->dailyAt('02:00');

// TASK TESTING CRON JOB (Bisa dihapus jika sudah berhasil)
Schedule::call(function () {
    \Illuminate\Support\Facades\Log::info('Test Cron Job Berhasil! Waktu: ' . now());
})->everyMinute();
