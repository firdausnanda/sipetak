<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Sedang Dalam Pemeliharaan</title>
    @vite(['resources/css/app.css'])
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
        }
    </style>
</head>
<body class="antialiased flex items-center justify-center min-h-screen bg-gray-100 p-4">
    <div class="w-full max-w-xl px-6 py-10 md:py-16 bg-white rounded-[2rem] shadow-lg mx-auto text-center border border-gray-100">
        <div class="mb-6 md:mb-8">
            <img src="/img/logo.webp" alt="SIPETAK Logo" class="mx-auto h-20 md:h-24 w-auto object-contain drop-shadow-sm">
        </div>
        
        <h1 class="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4 tracking-tight">Sistem Sedang Dipelihara</h1>
        
        <p class="text-base md:text-lg text-gray-600 mb-8 px-2 md:px-4 leading-relaxed">
            Mohon maaf atas ketidaknyamanan ini. Kami sedang melakukan pemeliharaan rutin untuk meningkatkan layanan. Silakan kembali beberapa saat lagi.
        </p>

        <div class="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 border border-amber-200 bg-amber-50 rounded-2xl px-5 py-4 sm:px-6 shadow-sm ring-1 ring-amber-500/20 transition-all hover:shadow-md w-full sm:w-auto">
            <div class="relative flex h-3 w-3 flex-shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </div>
            <div class="text-center sm:text-left">
                <p class="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-widest mb-0.5 sm:mb-1">Status Sistem</p>
                <p class="text-sm font-semibold text-gray-900">Maintenance Mode Aktif</p>
            </div>
        </div>
    </div>
</body>
</html>
