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
        Schema::table('pohons', function (Blueprint $table) {
            $table->foreignId('dokumen_angkutan_id')->nullable()->constrained('dokumen_angkutans')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pohons', function (Blueprint $table) {
            $table->dropForeign(['dokumen_angkutan_id']);
            $table->dropColumn('dokumen_angkutan_id');
        });
    }
};
