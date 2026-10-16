<?php

namespace Tests\Feature;

use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseRequestStateMachineTest extends TestCase
{
    use RefreshDatabase;

    protected User $karyawan;

    protected User $staffGudang;

    protected User $inventarisir;

    protected User $managerGudang;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->karyawan = User::where('role', 'karyawan')->first();
        $this->staffGudang = User::where('role', 'staff_gudang')->first();
        $this->inventarisir = User::where('role', 'inventarisir')->first();
        $this->managerGudang = User::where('role', 'manager_gudang')->first();
    }

    public function test_karyawan_can_create_and_submit_purchase_request(): void
    {
        $response = $this->actingAs($this->karyawan)->post(route('pengajuan.store'), [
            'catatan' => 'Pengajuan Kertas A4',
            'status' => 'SUBMITTED',
            'items' => [
                [
                    'nama_barang' => 'Kertas A4 80gr',
                    'jumlah' => 5,
                    'satuan' => 'Rim',
                    'alasan_kebutuhan' => 'Stok habis',
                    'estimasi_harga' => 50000,
                ],
            ],
        ]);

        $response->assertRedirect(route('pengajuan.index'));
        $this->assertDatabaseHas('purchase_requests', [
            'status' => 'SUBMITTED',
            'user_id' => $this->karyawan->id,
        ]);
    }

    public function test_staff_gudang_can_approve_submitted_purchase_request(): void
    {
        $pr = PurchaseRequest::create([
            'nomor_pengajuan' => 'PR-TEST-001',
            'user_id' => $this->karyawan->id,
            'catatan' => 'Test Request',
            'status' => 'SUBMITTED',
        ]);

        $response = $this->actingAs($this->staffGudang)->post(route('pengajuan.verifikasi', $pr->id), [
            'action' => 'approve',
            'catatan' => 'Disetujui untuk dibeli',
        ]);

        $response->assertRedirect(route('pengajuan.index'));
        $this->assertEquals('APPROVED', $pr->fresh()->status);
    }

    public function test_staff_gudang_cannot_reject_without_catatan(): void
    {
        $pr = PurchaseRequest::create([
            'nomor_pengajuan' => 'PR-TEST-002',
            'user_id' => $this->karyawan->id,
            'catatan' => 'Test Request',
            'status' => 'SUBMITTED',
        ]);

        $response = $this->actingAs($this->staffGudang)->post(route('pengajuan.verifikasi', $pr->id), [
            'action' => 'reject',
            'catatan' => '', // Empty note must fail
        ]);

        $response->assertSessionHasErrors('catatan');
        $this->assertEquals('SUBMITTED', $pr->fresh()->status);
    }

    public function test_staff_gudang_can_reject_with_mandatory_catatan(): void
    {
        $pr = PurchaseRequest::create([
            'nomor_pengajuan' => 'PR-TEST-003',
            'user_id' => $this->karyawan->id,
            'catatan' => 'Test Request',
            'status' => 'SUBMITTED',
        ]);

        $response = $this->actingAs($this->staffGudang)->post(route('pengajuan.verifikasi', $pr->id), [
            'action' => 'reject',
            'catatan' => 'Spesifikasi barang tidak jelas, harap perbaiki Qty',
        ]);

        $response->assertRedirect(route('pengajuan.index'));
        $this->assertEquals('REJECTED', $pr->fresh()->status);

        $this->assertDatabaseHas('review_histories', [
            'reviewable_id' => $pr->id,
            'reviewer_id' => $this->staffGudang->id,
            'action' => 'reject',
            'catatan' => 'Spesifikasi barang tidak jelas, harap perbaiki Qty',
        ]);
    }

    public function test_unauthorized_role_inventarisir_cannot_approve_purchase_request(): void
    {
        $pr = PurchaseRequest::create([
            'nomor_pengajuan' => 'PR-TEST-004',
            'user_id' => $this->karyawan->id,
            'catatan' => 'Test Request',
            'status' => 'SUBMITTED',
        ]);

        $response = $this->actingAs($this->inventarisir)->post(route('pengajuan.verifikasi', $pr->id), [
            'action' => 'approve',
            'catatan' => 'Approved by wrong role',
        ]);

        $response->assertSessionHasErrors('role');
        $this->assertEquals('SUBMITTED', $pr->fresh()->status);
    }
}
