<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#012d1d">
        <meta name="description" content="Sipetak - Sistem Informasi Pengelolaan Kayu, Dokumen Angkutan, dan Verifikasi SKSHHK.">
        <meta name="author" content="Firdaus Nanda Christian">
        <meta name="keywords" content="sipetak, pengelolaan kayu, dokumen angkutan, skshhk, psdh, sistem informasi kayu, firdaus nanda christian">
        <meta name="robots" content="index, follow">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ config('app.name', 'Sipetak') }}">
        <meta property="og:description" content="Sipetak - Sistem Informasi Pengelolaan Kayu, Dokumen Angkutan, dan Verifikasi SKSHHK.">
        <meta property="og:site_name" content="{{ config('app.name', 'Sipetak') }}">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary">
        <meta name="twitter:title" content="{{ config('app.name', 'Sipetak') }}">
        <meta name="twitter:description" content="Sipetak - Sistem Informasi Pengelolaan Kayu, Dokumen Angkutan, dan Verifikasi SKSHHK.">
        <link rel="apple-touch-icon" sizes="180x180" href="/img/favicon/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon/favicon-16x16.png">
        <link rel="manifest" href="/manifest.json">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').then(registration => {
                        console.log('SW registered: ', registration);
                    }).catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
                });
            }
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
