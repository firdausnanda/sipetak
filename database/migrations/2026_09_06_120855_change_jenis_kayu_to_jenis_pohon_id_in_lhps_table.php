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
        Schema::table('lhps', function (Blueprint $table) {
            $table->dropColumn('jenis_kayu');
            $table->foreignId('jenis_pohon_id')->nullable()->after('tanggal')->constrained('jenis_pohons')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lhps', function (Blueprint $table) {
            $table->dropForeign(['jenis_pohon_id']);
            $table->dropColumn('jenis_pohon_id');
            $table->string('jenis_kayu')->nullable();
        });
    }
};
