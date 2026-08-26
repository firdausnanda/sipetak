<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Input Hasil Kerja') }}
        </h2>
    </x-slot>

    <!-- Mobile-First Container -->
    <div class="max-w-md mx-auto py-6 px-4">
        @if(session('success'))
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span class="block sm:inline">{{ session('success') }}</span>
            </div>
        @endif

        <div class="bg-white shadow-sm rounded-lg p-5">
            <form action="{{ route('operations.store') }}" method="POST">
                @csrf
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Tanggal</label>
                    <input type="date" name="tanggal" value="{{ date('Y-m-d') }}" class="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg" required>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Regu</label>
                    <select name="regu_id" class="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg" required>
                        <option value="">-- Pilih Regu --</option>
                        @foreach($regus as $regu)
                            <option value="{{ $regu->id }}">{{ $regu->nama_regu }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Pohon Ditebang (Pcs)</label>
                    <input type="number" name="jumlah_pohon" inputmode="numeric" pattern="[0-9]*" class="shadow appearance-none border rounded w-full py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-2xl text-center font-bold" required>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Batang Dihasilkan (Pcs)</label>
                    <input type="number" name="jumlah_batang" inputmode="numeric" pattern="[0-9]*" class="shadow appearance-none border rounded w-full py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-2xl text-center font-bold" required>
                </div>

                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Tarif Upah</label>
                    <select name="wage_rate_id" class="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg" required>
                        <option value="">-- Pilih Tarif --</option>
                        @foreach($wageRates as $rate)
                            <option value="{{ $rate->id }}">{{ $rate->jenis_pekerjaan }} (Rp {{ number_format($rate->tarif, 0) }} / {{ $rate->satuan_perhitungan }})</option>
                        @endforeach
                    </select>
                </div>

                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded w-full text-xl shadow-lg">
                    Simpan Hasil Kerja
                </button>
            </form>
        </div>
    </div>
</x-app-layout>
