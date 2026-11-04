<?php

namespace App\Providers;

use Illuminate\Cache\FileStore;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // File cache with its own unserialize allow-list (used by the Excel cell cache).
        Cache::extend('excel_file', function ($app, array $config) {
            return Cache::repository(new FileStore(
                $app['files'],
                $config['path'],
                null,
                $config['serializable_classes'] ?? false,
            ));
        });

        \Illuminate\Support\Facades\Event::listen(function (\Illuminate\Auth\Events\Login $event) {
            activity()
                ->causedBy($event->user)
                ->event('login')
                ->log('Pengguna berhasil login');
        });

        \Illuminate\Support\Facades\Event::listen(function (\Illuminate\Auth\Events\Logout $event) {
            if ($event->user) {
                activity()
                    ->causedBy($event->user)
                    ->event('logout')
                    ->log('Pengguna berhasil logout');
            }
        });
    }
}
