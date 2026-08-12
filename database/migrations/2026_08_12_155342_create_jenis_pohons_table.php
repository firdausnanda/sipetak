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
        Schema::create('jenis_pohons', function (Blueprint $table) {
            $table->id();
            // Mengikat master jenis pohon ke kelompok tertentu
            $table->foreignId('kelompok_id')->constrained('kelompoks')->onDelete('cascade');

            $table->string('nama_jenis'); // contoh: Jati, Mahoni, dll.

            $table->timestamps();
            $table->userstamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jenis_pohons');
    }
};
