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
        Schema::create('daily_operations', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('regu_id')->constrained('regus')->onDelete('cascade');
            $table->integer('jumlah_pohon')->default(0);
            $table->integer('jumlah_batang')->default(0);
            $table->decimal('total_upah_regu', 15, 2)->default(0);
            $table->string('status')->default('completed');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_operations');
    }
};
