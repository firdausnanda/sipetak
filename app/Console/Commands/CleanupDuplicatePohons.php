<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pohon;
use Illuminate\Support\Facades\DB;

class CleanupDuplicatePohons extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pohon:cleanup-duplicates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Merge duplicate pohon records and reassign their batangs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Mencari data pohon yang redundan...');

        // Find duplicates based on kelompok_id, petak_id, no_pohon
        $duplicates = Pohon::select('kelompok_id', 'petak_id', 'no_pohon', DB::raw('count(*) as total'))
            ->groupBy('kelompok_id', 'petak_id', 'no_pohon')
            ->having('total', '>', 1)
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info('Tidak ada data redundan ditemukan.');
            return;
        }

        $this->info('Ditemukan ' . $duplicates->count() . ' kelompok data redundan. Memulai penggabungan (merge)...');

        DB::beginTransaction();
        try {
            foreach ($duplicates as $duplicate) {
                // Ambil semua record duplikat untuk pohon ini
                $pohonRecords = Pohon::where('kelompok_id', $duplicate->kelompok_id)
                    ->where('petak_id', $duplicate->petak_id)
                    ->where('no_pohon', $duplicate->no_pohon)
                    ->orderBy('id', 'asc') // yang paling pertama diinput jadi utama
                    ->get();

                // Cari record yang sudah diangkut (jika ada) untuk dijadikan record utama
                $primary = $pohonRecords->firstWhere(function ($p) {
                    return !is_null($p->dokumen_angkutan_id);
                });

                // Jika belum ada yang diangkut, gunakan record yang paling tua (pertama)
                if (!$primary) {
                    $primary = $pohonRecords->first();
                }

                foreach ($pohonRecords as $record) {
                    if ($record->id !== $primary->id) {
                        // Pindahkan batangs ke record utama
                        foreach ($record->batangs as $batang) {
                            $batang->pohon_id = $primary->id;
                            $batang->save();
                        }
                        
                        // Copy data penting jika primary kosong
                        if (is_null($primary->dokumen_angkutan_id) && !is_null($record->dokumen_angkutan_id)) {
                            $primary->dokumen_angkutan_id = $record->dokumen_angkutan_id;
                            $primary->save();
                        }

                        if (is_null($primary->skshhk_id) && !is_null($record->skshhk_id)) {
                            $primary->skshhk_id = $record->skshhk_id;
                            $primary->save();
                        }

                        // Hapus record duplikat
                        $record->delete();
                    }
                }
            }

            DB::commit();
            $this->info('Berhasil menggabungkan dan membersihkan data redundan.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
