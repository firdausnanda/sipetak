<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('batang:update-volume')]
#[Description('Update volume field for existing Batang records based on TabelVolume')]
class UpdateBatangVolume extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai update volume batang...');
        
        $batangs = \App\Models\Batang::with('pohon')->get();
        $updatedCount = 0;
        $failedCount = 0;
        
        $bar = $this->output->createProgressBar(count($batangs));
        $bar->start();

        foreach ($batangs as $batang) {
            $volume = $batang->calculateVolume();
            
            if ($volume !== null) {
                // Gunakan query builder agar tidak mentrigger events/timestamps jika tidak perlu,
                // atau save() jika ingin mentrigger event. Kita gunakan save() di sini.
                $batang->save();
                $updatedCount++;
            } else {
                $failedCount++;
            }
            
            $bar->advance();
        }

        $bar->finish();
        
        $this->newLine(2);
        $this->info("Proses selesai!");
        $this->info("Berhasil diupdate: {$updatedCount}");
        $this->warn("Gagal/Tidak ditemukan di TabelVolume: {$failedCount}");
    }
}
