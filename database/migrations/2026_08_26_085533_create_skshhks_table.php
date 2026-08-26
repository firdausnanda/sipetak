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
        Schema::create('skshhks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dokumen_angkutan_id')->constrained('dokumen_angkutans')->onDelete('cascade');
            $table->string('no_skshhk');
            $table->date('tanggal');
            $table->timestamps();
            $table->userstamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skshhks');
    }
};
