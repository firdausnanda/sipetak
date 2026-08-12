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
        Schema::create('petaks', function (Blueprint $table) {
            $table->id();
            // Mengikat master petak ke kelompok tertentu
            $table->foreignId('kelompok_id')->constrained('kelompoks')->onDelete('cascade');
            
            $table->string('no_petak');
            
            $table->userstamps(); // Melacak Admin Kelompok siapa yang membuat/mengubah
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('petaks');
    }
};
