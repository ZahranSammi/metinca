<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Item;
use App\Models\ItemLoan;
use App\Models\ItemLocation;
use App\Models\Role;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PeminjamanAntarCabangTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $staff;

    private Branch $branchJaktim;

    private Branch $branchTambun;

    private Room $roomJaktimProduksi;

    private Room $roomTambunProduksi;

    private Item $itemBangku;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create([
            'name' => 'karyawan',
            'display_name' => 'Karyawan Accounting',
        ]);

        $this->user = User::factory()->create([
            'role' => 'karyawan',
            'role_id' => $role->id,
            'name' => 'Budi Santoso',
            'email' => 'karyawan@metinca.co.id',
        ]);

        $roleStaff = Role::create([
            'name' => 'staff_gudang',
            'display_name' => 'Staff Gudang',
        ]);

        $this->staff = User::factory()->create([
            'role' => 'staff_gudang',
            'role_id' => $roleStaff->id,
            'name' => 'Agus Setiawan',
            'email' => 'gudang@metinca.co.id',
        ]);

        $this->branchJaktim = Branch::create([
            'nama_cabang' => 'Cabang Jakarta Timur',
            'kode_cabang' => 'JKT',
            'alamat' => 'Pulogadung',
        ]);

        $this->branchTambun = Branch::create([
            'nama_cabang' => 'Cabang Tambun',
            'kode_cabang' => 'TMB',
            'alamat' => 'Tambun Selatan',
        ]);

        $this->roomJaktimProduksi = Room::create([
            'branch_id' => $this->branchJaktim->id,
            'nama_ruangan' => 'Ruangan Produksi',
            'kode_ruangan' => 'JKT-PRD',
        ]);

        $this->roomTambunProduksi = Room::create([
            'branch_id' => $this->branchTambun->id,
            'nama_ruangan' => 'Ruangan Produksi',
            'kode_ruangan' => 'TMB-PRD',
        ]);

        $this->itemBangku = Item::create([
            'kode_barang' => 'BRG-FRN-001',
            'nama_barang' => 'Bangku Putar Produksi Heavy Duty',
            'kategori' => 'Furniture & Perabot',
            'satuan' => 'Buah',
            'stok' => 50,
            'min_stok' => 10,
        ]);

        ItemLocation::create([
            'item_id' => $this->itemBangku->id,
            'branch_id' => $this->branchJaktim->id,
            'room_id' => $this->roomJaktimProduksi->id,
            'jumlah' => 45,
            'kondisi' => 'Baik',
        ]);
    }

    public function test_halaman_peminjaman_dapat_diakses(): void
    {
        $response = $this->actingAs($this->user)->get('/peminjaman');
        $response->assertOk();
    }

    public function test_karyawan_dapat_mengajukan_peminjaman_antar_cabang(): void
    {
        $response = $this->actingAs($this->user)->post('/peminjaman', $this->loanPayload(10));

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('item_loans', [
            'item_id' => $this->itemBangku->id,
            'jumlah' => 10,
            'from_branch_id' => $this->branchJaktim->id,
            'to_branch_id' => $this->branchTambun->id,
            'borrower_id' => $this->user->id,
            'status' => 'DIAJUKAN',
        ]);

        // Stok belum berpindah sebelum disetujui Staff
        $this->assertDatabaseHas('item_locations', [
            'item_id' => $this->itemBangku->id,
            'room_id' => $this->roomJaktimProduksi->id,
            'jumlah' => 45,
        ]);
    }

    public function test_staff_tidak_dapat_mengajukan_peminjaman(): void
    {
        $this->actingAs($this->staff)->post('/peminjaman', $this->loanPayload(10))->assertForbidden();

        $this->assertDatabaseCount('item_loans', 0);
    }

    public function test_staff_menyetujui_peminjaman_dan_stok_berpindah(): void
    {
        $loan = $this->createLoan('DIAJUKAN', 10);

        $response = $this->actingAs($this->staff)->post("/peminjaman/{$loan->id}/setujui");

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('item_loans', [
            'id' => $loan->id,
            'status' => 'DIPINJAM',
            'reviewed_by' => $this->staff->id,
        ]);

        $this->assertDatabaseHas('item_locations', [
            'item_id' => $this->itemBangku->id,
            'room_id' => $this->roomJaktimProduksi->id,
            'jumlah' => 35,
        ]);

        $this->assertDatabaseHas('item_locations', [
            'item_id' => $this->itemBangku->id,
            'room_id' => $this->roomTambunProduksi->id,
            'jumlah' => 10,
        ]);
    }

    public function test_peminjaman_otomatis_ditolak_jika_stok_tidak_tersedia(): void
    {
        $loan = $this->createLoan('DIAJUKAN', 100);

        $response = $this->actingAs($this->staff)->post("/peminjaman/{$loan->id}/setujui");

        $response->assertSessionHas('error');

        $this->assertDatabaseHas('item_loans', [
            'id' => $loan->id,
            'status' => 'DITOLAK',
        ]);

        $this->assertDatabaseHas('item_locations', [
            'item_id' => $this->itemBangku->id,
            'room_id' => $this->roomJaktimProduksi->id,
            'jumlah' => 45,
        ]);
    }

    public function test_staff_dapat_menolak_pengajuan_dengan_alasan(): void
    {
        $loan = $this->createLoan('DIAJUKAN', 5);

        $this->actingAs($this->staff)
            ->post("/peminjaman/{$loan->id}/tolak", [])
            ->assertSessionHasErrors('catatan_review');

        $this->actingAs($this->staff)
            ->post("/peminjaman/{$loan->id}/tolak", ['catatan_review' => 'Dibutuhkan untuk produksi'])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('item_loans', [
            'id' => $loan->id,
            'status' => 'DITOLAK',
            'catatan_review' => 'Dibutuhkan untuk produksi',
        ]);
    }

    public function test_karyawan_tidak_dapat_menyetujui_peminjaman(): void
    {
        $loan = $this->createLoan('DIAJUKAN', 5);

        $this->actingAs($this->user)->post("/peminjaman/{$loan->id}/setujui")->assertForbidden();

        $this->assertDatabaseHas('item_loans', ['id' => $loan->id, 'status' => 'DIAJUKAN']);
    }

    public function test_barang_pinjaman_dapat_dikembalikan_oleh_staff(): void
    {
        $loan = $this->createLoan('DIPINJAM', 10);

        $response = $this->actingAs($this->staff)->post("/peminjaman/{$loan->id}/kembalikan");

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('item_loans', [
            'id' => $loan->id,
            'status' => 'SELESAI',
        ]);
    }

    public function test_pengajuan_belum_disetujui_tidak_dapat_dikembalikan(): void
    {
        $loan = $this->createLoan('DIAJUKAN', 10);

        $this->actingAs($this->staff)->post("/peminjaman/{$loan->id}/kembalikan")->assertSessionHas('error');

        $this->assertDatabaseHas('item_loans', ['id' => $loan->id, 'status' => 'DIAJUKAN']);
    }

    /**
     * @return array<string, mixed>
     */
    private function loanPayload(int $jumlah): array
    {
        return [
            'item_id' => $this->itemBangku->id,
            'jumlah' => $jumlah,
            'from_branch_id' => $this->branchJaktim->id,
            'from_room_id' => $this->roomJaktimProduksi->id,
            'to_branch_id' => $this->branchTambun->id,
            'to_room_id' => $this->roomTambunProduksi->id,
            'tanggal_pinjam' => now()->format('Y-m-d'),
            'tenggat_kembali' => now()->addDays(14)->format('Y-m-d'),
            'keterangan' => 'Peminjaman bangku dari Jaktim ke Tambun',
        ];
    }

    private function createLoan(string $status, int $jumlah): ItemLoan
    {
        return ItemLoan::create([
            'nomor_peminjaman' => 'LOAN-2026-0001',
            'item_id' => $this->itemBangku->id,
            'jumlah' => $jumlah,
            'from_branch_id' => $this->branchJaktim->id,
            'from_room_id' => $this->roomJaktimProduksi->id,
            'to_branch_id' => $this->branchTambun->id,
            'to_room_id' => $this->roomTambunProduksi->id,
            'borrower_id' => $this->user->id,
            'borrower_name' => $this->user->name,
            'tanggal_pinjam' => now()->subDays(5)->format('Y-m-d'),
            'status' => $status,
        ]);
    }

    public function test_halaman_pendataan_ruangan_dapat_diakses(): void
    {
        $response = $this->actingAs($this->user)->get('/barang/pendataan-ruangan');
        $response->assertOk();
    }

    public function test_halaman_tracking_barang_dapat_diakses(): void
    {
        $response = $this->actingAs($this->user)->get('/barang/tracking');
        $response->assertOk();
    }
}
