<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\PurchaseDocument;
use App\Models\PurchaseItem;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseDocumentStateMachineTest extends TestCase
{
    use RefreshDatabase;

    protected User $staffGudang;

    protected User $inventarisir;

    protected Item $itemMaster;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->staffGudang = User::where('role', 'staff_gudang')->first();
        $this->inventarisir = User::where('role', 'inventarisir')->first();
        $this->itemMaster = Item::first();
    }

    public function test_inventarisir_approval_updates_master_item_stock_and_creates_stock_movement(): void
    {
        $initialStock = $this->itemMaster->stok;

        $pr = PurchaseRequest::create([
            'nomor_pengajuan' => 'PR-DOC-001',
            'user_id' => $this->staffGudang->id,
            'status' => 'APPROVED',
        ]);

        $purchase = Purchase::create([
            'nomor_pembelian' => 'PO-DOC-001',
            'purchase_request_id' => $pr->id,
            'created_by' => $this->staffGudang->id,
            'supplier' => 'PT Suplier Test',
            'tanggal_pembelian' => now()->format('Y-m-d'),
            'nomor_nota' => 'INV-9901',
            'total_harga' => 500000,
            'status' => 'PURCHASED',
        ]);

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'item_id' => $this->itemMaster->id,
            'nama_barang' => $this->itemMaster->nama_barang,
            'jumlah' => 10,
            'harga_satuan' => 50000,
            'subtotal' => 500000,
        ]);

        $doc = PurchaseDocument::create([
            'nomor_dokumen' => 'DOC-TEST-001',
            'purchase_id' => $purchase->id,
            'created_by' => $this->staffGudang->id,
            'status' => 'SUBMITTED',
        ]);

        $response = $this->actingAs($this->inventarisir)->post(route('pembelian.verifikasi-dokumen', $doc->id), [
            'action' => 'approve',
            'catatan' => 'Fisik dan dokumen sesuai',
        ]);

        $response->assertRedirect(route('pembelian.index'));
        $this->assertEquals('APPROVED', $doc->fresh()->status);

        // Verify Stock updated!
        $this->assertEquals($initialStock + 10, $this->itemMaster->fresh()->stok);

        // Verify Stock Movement recorded!
        $this->assertDatabaseHas('stock_movements', [
            'item_id' => $this->itemMaster->id,
            'user_id' => $this->inventarisir->id,
            'type' => 'IN',
            'jumlah' => 10,
            'referensi_type' => PurchaseDocument::class,
            'referensi_id' => $doc->id,
        ]);
    }
}
