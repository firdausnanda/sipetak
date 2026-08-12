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
        Schema::create('batangs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pohon_id')->constrained('pohons')->onDelete('cascade');
            
            $table->integer('no_batang');
            $table->decimal('panjang', 8, 2);
            $table->decimal('diameter_pangkal', 8, 2);
            $table->decimal('diameter_ujung', 8, 2);
            $table->enum('mutu', ['P', 'D', 'T', 'M']); 
            
            $table->timestamps();
            $table->userstamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batangs');
    }
};
