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
        Schema::create('purchase_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fund_proposal_id')->constrained('fund_proposals')->cascadeOnDelete();
            $table->foreignId('staff_purchasing_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('staff_accounting_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('item_name');
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
            $table->string('document_path')->nullable();
            $table->string('status')->default('Diajukan');
            $table->text('revision_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_documents');
    }
};
