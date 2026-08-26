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
        Schema::table('daily_operations', function (Blueprint $table) {
            $table->decimal('total_volume', 10, 4)->default(0)->after('jumlah_batang');
            $table->timestamp('tanggal_pembayaran')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_operations', function (Blueprint $table) {
            $table->dropColumn(['total_volume', 'tanggal_pembayaran']);
        });
    }
};
