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
        Schema::create('lhps', function (Blueprint $table) {
            $table->id();
            $table->string('no_lhp')->unique();
            $table->date('tanggal');
            $table->string('jenis_kayu');
            $table->string('sortimen');
            $table->decimal('volume', 10, 4);
            $table->decimal('tarif', 15, 2);
            $table->decimal('psdh', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lhps');
    }
};
