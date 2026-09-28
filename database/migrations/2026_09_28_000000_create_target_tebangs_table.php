<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('target_tebangs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelompok_id')->constrained('kelompoks')->cascadeOnDelete();
            $table->unsignedSmallInteger('tahun');
            $table->unsignedInteger('jumlah_pohon');
            $table->decimal('volume_taksasi', 14, 3);
            $table->timestamps();
            $table->unique(['kelompok_id', 'tahun']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('target_tebangs');
    }
};
