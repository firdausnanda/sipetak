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
        Schema::table('dokumen_angkutans', function (Blueprint $table) {
            $table->foreignId('penerbit_id')->nullable()->constrained('penerbits')->onDelete('set null');
            $table->foreignId('tujuan_bongkar_id')->nullable()->constrained('tujuan_bongkars')->onDelete('set null');
            $table->string('jenis_angkutan')->nullable();
            $table->string('nopol_angkutan')->nullable();
            $table->integer('masa_berlaku_hari')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dokumen_angkutans', function (Blueprint $table) {
            $table->dropForeign(['penerbit_id']);
            $table->dropForeign(['tujuan_bongkar_id']);
            $table->dropColumn(['penerbit_id', 'tujuan_bongkar_id', 'jenis_angkutan', 'nopol_angkutan', 'masa_berlaku_hari']);
        });
    }
};
