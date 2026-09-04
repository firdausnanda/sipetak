<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambahkan kolom ke batangs
        Schema::table('batangs', function (Blueprint $table) {
            $table->foreignId('skshhk_id')->nullable()->constrained('skshhks')->onDelete('set null');
        });

        // 2. Backfill data: Pindahkan relasi skshhk dari pohon ke seluruh batang-batangnya
        // Kita gunakan query builder biasa karena ini di dalam migrasi
        DB::statement('UPDATE batangs b JOIN pohons p ON b.pohon_id = p.id SET b.skshhk_id = p.skshhk_id WHERE p.skshhk_id IS NOT NULL');

        // 3. Hapus relasi dari pohons
        Schema::table('pohons', function (Blueprint $table) {
            $table->dropForeign(['skshhk_id']);
            $table->dropColumn('skshhk_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Tambahkan kolom ke pohons
        Schema::table('pohons', function (Blueprint $table) {
            $table->foreignId('skshhk_id')->nullable()->constrained('skshhks')->onDelete('set null');
        });

        // 2. Backfill: ambil skshhk_id dari salah satu batang-nya (karena down() tidak bisa 100% akurat jika batang beda-beda skshhk)
        // Set ke pohon dengan asumsi semua batang di pohon tersebut punya skshhk_id yang sama (perilaku lama)
        DB::statement('
            UPDATE pohons p 
            JOIN (
                SELECT pohon_id, MAX(skshhk_id) as skshhk_id FROM batangs WHERE skshhk_id IS NOT NULL GROUP BY pohon_id
            ) b_agg ON p.id = b_agg.pohon_id 
            SET p.skshhk_id = b_agg.skshhk_id
        ');

        // 3. Hapus relasi dari batangs
        Schema::table('batangs', function (Blueprint $table) {
            $table->dropForeign(['skshhk_id']);
            $table->dropColumn('skshhk_id');
        });
    }
};

