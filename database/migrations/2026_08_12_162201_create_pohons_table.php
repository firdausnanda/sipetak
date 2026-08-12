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
        Schema::create('pohons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelompok_id')->constrained('kelompoks')->onDelete('cascade');

            // Perubahan: Menggunakan Foreign Key ke tabel master
            $table->foreignId('petak_id')->constrained('petaks')->onDelete('restrict');
            $table->foreignId('jenis_pohon_id')->constrained('jenis_pohons')->onDelete('restrict');

            $table->date('tanggal');

            $table->enum('tipe', ['barcode', 'non_barcode']);
            $table->string('no_barcode')->nullable();

            $table->timestamps();
            $table->userstamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pohons');
    }
};
