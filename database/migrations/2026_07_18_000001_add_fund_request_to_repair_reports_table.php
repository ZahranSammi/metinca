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
        Schema::table('repair_reports', function (Blueprint $table) {
            $table->foreignId('fund_request_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->decimal('actual_amount', 15, 2)->nullable()->after('summary');
            $table->string('proof_path')->nullable()->after('actual_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('repair_reports', function (Blueprint $table) {
            $table->dropForeign(['fund_request_id']);
            $table->dropColumn(['fund_request_id', 'actual_amount', 'proof_path']);
        });
    }
};
