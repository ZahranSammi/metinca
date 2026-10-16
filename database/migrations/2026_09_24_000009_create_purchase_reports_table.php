<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_reports', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_laporan')->unique();
            $table->foreignId('purchase_document_id')->nullable()->constrained('purchase_documents')->onDelete('set null');
            $table->string('judul_laporan');
            $table->date('periode_mulai');
            $table->date('periode_selesai');
            $table->integer('total_transaksi')->default(0);
            $table->decimal('total_pengeluaran', 15, 2)->default(0);
            $table->text('catatan')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ARCHIVED'])->default('DRAFT');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_reports');
    }
};
