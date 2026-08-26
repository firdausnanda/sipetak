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
        Schema::create('wage_rates', function (Blueprint $table) {
            $table->id();
            $table->string('jenis_pekerjaan');
            $table->decimal('tarif', 15, 2);
            $table->string('satuan_perhitungan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wage_rates');
    }
};
