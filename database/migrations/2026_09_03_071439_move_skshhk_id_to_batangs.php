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
        DB::statement('UPDATE batangs SET skshhk_id = (SELECT skshhk_id FROM pohons WHERE pohons.id = batangs.pohon_id) WHERE pohon_id IN (SELECT id FROM pohons WHERE skshhk_id IS NOT NULL)');

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
        DB::statement('UPDATE pohons SET skshhk_id = (SELECT MAX(skshhk_id) FROM batangs WHERE batangs.pohon_id = pohons.id) WHERE id IN (SELECT pohon_id FROM batangs WHERE skshhk_id IS NOT NULL)');

        // 3. Hapus relasi dari batangs
        Schema::table('batangs', function (Blueprint $table) {
            $table->dropForeign(['skshhk_id']);
            $table->dropColumn('skshhk_id');
        });
    }
};
