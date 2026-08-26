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
        Schema::table('batangs', function (Blueprint $table) {
            $table->decimal('volume', 10, 4)->nullable()->after('diameter_ujung');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batangs', function (Blueprint $table) {
            $table->dropColumn('volume');
        });
    }
};
