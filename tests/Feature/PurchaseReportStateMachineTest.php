<?php

namespace Tests\Feature;

use App\Models\PurchaseReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseReportStateMachineTest extends TestCase
{
    use RefreshDatabase;

    protected User $inventarisir;

    protected User $managerGudang;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->inventarisir = User::where('role', 'inventarisir')->first();
        $this->managerGudang = User::where('role', 'manager_gudang')->first();
    }

    public function test_manager_gudang_approves_and_archives_purchase_report(): void
    {
        $report = PurchaseReport::create([
            'nomor_laporan' => 'REP-TEST-001',
            'judul_laporan' => 'Laporan Rekap Q3',
            'periode_mulai' => now()->startOfMonth()->format('Y-m-d'),
            'periode_selesai' => now()->endOfMonth()->format('Y-m-d'),
            'total_transaksi' => 1,
            'total_pengeluaran' => 1000000,
            'created_by' => $this->inventarisir->id,
            'status' => 'SUBMITTED',
        ]);

        $response = $this->actingAs($this->managerGudang)->post(route('laporan.verifikasi', $report->id), [
            'action' => 'approve',
            'catatan' => 'Sesuai dan diarsipkan',
        ]);

        $response->assertRedirect(route('laporan.index'));
        $this->assertEquals('ARCHIVED', $report->fresh()->status);
    }

    public function test_manager_gudang_rejection_requires_mandatory_catatan(): void
    {
        $report = PurchaseReport::create([
            'nomor_laporan' => 'REP-TEST-002',
            'judul_laporan' => 'Laporan Rekap Q3',
            'periode_mulai' => now()->startOfMonth()->format('Y-m-d'),
            'periode_selesai' => now()->endOfMonth()->format('Y-m-d'),
            'total_transaksi' => 1,
            'total_pengeluaran' => 1000000,
            'created_by' => $this->inventarisir->id,
            'status' => 'SUBMITTED',
        ]);

        $response = $this->actingAs($this->managerGudang)->post(route('laporan.verifikasi', $report->id), [
            'action' => 'reject',
            'catatan' => '', // Empty note must fail validation
        ]);

        $response->assertSessionHasErrors('catatan');
        $this->assertEquals('SUBMITTED', $report->fresh()->status);
    }
}
