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
        Schema::create('dokumen_angkutan_petak', function (Blueprint $table) {
            $table->foreignId('dokumen_angkutan_id')->constrained('dokumen_angkutans')->onDelete('cascade');
            $table->foreignId('petak_id')->constrained('petaks')->onDelete('cascade');
            $table->primary(['dokumen_angkutan_id', 'petak_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen_angkutan_petak');
    }
};
