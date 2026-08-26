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
        Schema::create('regus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelompok_id')->constrained()->onDelete('cascade');
            $table->string('nama_regu');
            $table->string('jenis_pekerjaan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regus');
    }
};
