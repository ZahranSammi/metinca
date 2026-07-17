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
        Schema::create('fund_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('damage_report_id')->constrained('damage_reports')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->text('description');
            $table->string('status')->default('Menunggu Persetujuan'); // Menunggu Persetujuan, Disetujui, Ditolak
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade'); // staff_accounting
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null'); // manager_accounting
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fund_requests');
    }
};
