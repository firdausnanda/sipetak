<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Monitoring Operasional') }}
        </h2>
    </x-slot>

    <!-- Mobile-First Container -->
    <div class="max-w-md mx-auto py-6 sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-4 text-gray-900">
                
                <h3 class="text-lg font-bold mb-4 text-center">Progres Hari Ini</h3>

                <!-- Metric Card 1 -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex flex-col items-center">
                    <span class="text-blue-600 text-sm font-semibold mb-1">Penebangan</span>
                    <span class="text-4xl font-black text-blue-800">{{ number_format($persentaseTebang, 1) }}%</span>
                    <div class="w-full bg-blue-200 rounded-full h-2.5 mt-3">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: {{ $persentaseTebang }}%"></div>
                    </div>
                </div>

                <!-- Metric Card 2 -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex flex-col items-center">
                    <span class="text-green-600 text-sm font-semibold mb-1">Pengangkutan</span>
                    <span class="text-4xl font-black text-green-800">{{ number_format($persentaseAngkut, 1) }}%</span>
                    <div class="w-full bg-green-200 rounded-full h-2.5 mt-3">
                        <div class="bg-green-600 h-2.5 rounded-full" style="width: {{ $persentaseAngkut }}%"></div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</x-app-layout>
