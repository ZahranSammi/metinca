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
        Schema::create('item_loans', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_peminjaman')->unique();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->integer('jumlah')->default(1);
            $table->foreignId('from_branch_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('from_room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignId('to_branch_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('to_room_id')->nullable()->constrained('rooms')->onDelete('set null');
            $table->foreignId('borrower_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('borrower_name')->nullable();
            $table->date('tanggal_pinjam');
            $table->date('tenggat_kembali')->nullable();
            $table->date('tanggal_kembali')->nullable();
            $table->string('status')->default('DIPINJAM'); // DIPINJAM, SELESAI, DIBATALKAN
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_loans');
    }
};
