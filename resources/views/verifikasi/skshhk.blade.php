<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi SKSHHK</title>
    @vite(['resources/js/app.jsx'])
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
        <div class="bg-green-600 text-white text-center py-6 px-4">
            <svg class="w-16 h-16 mx-auto mb-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h1 class="text-2xl font-bold">Dokumen Valid</h1>
            <p class="text-green-100 mt-1">Surat Keterangan Sahnya Hasil Hutan Kayu</p>
        </div>
        
        <div class="p-6">
            <div class="space-y-4">
                <div>
                    <p class="text-sm text-gray-500 font-medium">Nomor SKSHHK</p>
                    <p class="text-lg text-gray-900 font-semibold">{{ $skshhk->no_skshhk }}</p>
                </div>
                
                <div class="border-t border-gray-100 pt-4">
                    <p class="text-sm text-gray-500 font-medium">Tanggal Dibuat</p>
                    <p class="text-gray-900">{{ $skshhk->created_at->translatedFormat('d F Y H:i') }} WIB</p>
                </div>

            </div>
            
            <div class="mt-8 text-center text-xs text-gray-400">
                <p>Terverifikasi oleh Sistem Sipetak</p>
                <p>&copy; {{ date('Y') }} Sipetak</p>
            </div>
        </div>
    </div>
</body>
</html>
