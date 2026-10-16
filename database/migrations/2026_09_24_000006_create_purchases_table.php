<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pembelian')->unique();
            $table->foreignId('purchase_request_id')->constrained('purchase_requests')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('supplier');
            $table->date('tanggal_pembelian');
            $table->string('nomor_nota');
            $table->decimal('total_harga', 15, 2);
            $table->string('file_bukti')->nullable();
            $table->enum('status', ['PURCHASED'])->default('PURCHASED');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
