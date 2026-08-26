<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tabel_volumes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelompok_id')->constrained('kelompoks')->onDelete('cascade');
            $table->foreignId('jenis_pohon_id')->constrained('jenis_pohons')->onDelete('cascade');
            $table->integer('diameter');
            $table->decimal('panjang', 8, 2);
            $table->decimal('volume', 10, 4);
            $table->timestamps();
            
            // Unik per kelompok, jenis pohon, diameter, dan panjang
            $table->unique(['kelompok_id', 'jenis_pohon_id', 'diameter', 'panjang'], 'tabel_volumes_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_volumes');
    }
};
