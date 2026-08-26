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
            $table->foreignId('skshhk_id')->nullable()->constrained('skshhks')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pohons', function (Blueprint $table) {
            $table->dropForeign(['skshhk_id']);
            $table->dropColumn('skshhk_id');
        });
    }
};
