<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Item;
use App\Models\ItemLoan;
use App\Models\ItemLocation;
use App\Models\Purchase;
use App\Models\PurchaseDocument;
use App\Models\PurchaseItem;
use App\Models\PurchaseReport;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestItem;
use App\Models\Role;
use App\Models\Room;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $roleKaryawan = Role::create([
            'name' => 'karyawan',
            'display_name' => 'Karyawan Divisi Accounting',
            'description' => 'Mengajukan Kebutuhan Barang Operasional',
        ]);

        $roleStaffGudang = Role::create([
            'name' => 'staff_gudang',
            'display_name' => 'Staff Gudang',
            'description' => 'Memverifikasi Pengajuan, Melakukan Pembelian, dan Membuat Dokumen Pembelian',
        ]);

        $roleInventarisir = Role::create([
            'name' => 'inventarisir',
            'display_name' => 'Inventarisir Barang',
            'description' => 'Verifikasi Dokumen Pembelian, Update Stok Master, dan Membuat Laporan Pembelian',
        ]);

        $roleManagerGudang = Role::create([
            'name' => 'manager_gudang',
            'display_name' => 'Manager Gudang',
            'description' => 'Mengajukan Barang, Memverifikasi & Mengarsipkan Laporan Pembelian',
        ]);

        $roleStaffAccounting = Role::create([
            'name' => 'staff_accounting',
            'display_name' => 'Staff Accounting',
            'description' => 'Verifikasi Peminjaman, Kelola Data Inventaris Barang Operasional',
        ]);

        $roleManagerAccounting = Role::create([
            'name' => 'manager_accounting',
            'display_name' => 'Manager Accounting',
            'description' => 'Pemeriksaan & Persetujuan Data Inventaris, Menyusun Laporan Barang Operasional',
        ]);

        $roleDirekturSdm = Role::create([
            'name' => 'direktur_sdm',
            'display_name' => 'Direktur SDM',
            'description' => 'Approval Akhir dan Pengarsipan Laporan Barang Operasional',
        ]);

        // 2. Users (Akun resmi untuk login manual)
        $password = Hash::make('password123');

        $userKaryawan = User::create([
            'name' => 'Ahmad Fauzi (Karyawan)',
            'email' => 'karyawan@metinca.co.id',
            'password' => $password,
            'role' => 'karyawan',
            'role_id' => $roleKaryawan->id,
            'nip' => 'EMP-001',
            'jabatan' => 'Karyawan Operasional Divisi Accounting',
        ]);

        $userStaffAccounting = User::create([
            'name' => 'Siti Nurhaliza (Staff Accounting)',
            'email' => 'staff.accounting@metinca.co.id',
            'password' => $password,
            'role' => 'staff_accounting',
            'role_id' => $roleStaffAccounting->id,
            'nip' => 'EMP-ACC-001',
            'jabatan' => 'Staff Divisi Accounting',
        ]);

        $userManagerAccounting = User::create([
            'name' => 'Budi Santoso, S.E. (Manager Accounting)',
            'email' => 'manager.accounting@metinca.co.id',
            'password' => $password,
            'role' => 'manager_accounting',
            'role_id' => $roleManagerAccounting->id,
            'nip' => 'MGR-ACC-001',
            'jabatan' => 'Manager Divisi Accounting',
        ]);

        $userDirekturSdm = User::create([
            'name' => 'Dra. Ratna Handayani, M.M. (Direktur SDM)',
            'email' => 'direktur.sdm@metinca.co.id',
            'password' => $password,
            'role' => 'direktur_sdm',
            'role_id' => $roleDirekturSdm->id,
            'nip' => 'DIR-001',
            'jabatan' => 'Direktur SDM & Umum',
        ]);

        $userStaffGudang = User::create([
            'name' => 'Agus Setiawan (Staff Gudang)',
            'email' => 'gudang@metinca.co.id',
            'password' => $password,
            'role' => 'staff_gudang',
            'role_id' => $roleStaffGudang->id,
            'nip' => 'EMP-002',
            'jabatan' => 'Staff Logistik & Gudang',
        ]);

        $userInventarisir = User::create([
            'name' => 'Citra Lestari (Inventarisir)',
            'email' => 'inventarisir@metinca.co.id',
            'password' => $password,
            'role' => 'inventarisir',
            'role_id' => $roleInventarisir->id,
            'nip' => 'EMP-003',
            'jabatan' => 'Staf Kontrol Inventaris',
        ]);

        $userManagerGudang = User::create([
            'name' => 'Dedy Pratama (Manager Gudang)',
            'email' => 'manager@metinca.co.id',
            'password' => $password,
            'role' => 'manager_gudang',
            'role_id' => $roleManagerGudang->id,
            'nip' => 'MGR-001',
            'jabatan' => 'Manager Logistik & Gudang',
        ]);

        // 3. Branches (3 Cabang: Jakarta Timur, Tambun, Salatiga)
        $branchJaktim = Branch::create([
            'nama_cabang' => 'Cabang Jakarta Timur',
            'kode_cabang' => 'JKT',
            'alamat' => 'Kawasan Industri Pulogadung, Jakarta Timur',
            'telepon' => '(021) 460-1234',
        ]);

        $branchTambun = Branch::create([
            'nama_cabang' => 'Cabang Tambun',
            'kode_cabang' => 'TMB',
            'alamat' => 'Jl. Raya Industri Tambun Selatan, Bekasi',
            'telepon' => '(021) 883-5678',
        ]);

        $branchSalatiga = Branch::create([
            'nama_cabang' => 'Cabang Salatiga',
            'kode_cabang' => 'SLT',
            'alamat' => 'Kawasan Industri Blotongan, Salatiga',
            'telepon' => '(0298) 321-999',
        ]);

        // 4. Rooms per Branch
        $roomJaktimAccounting = Room::create([
            'branch_id' => $branchJaktim->id,
            'nama_ruangan' => 'Ruangan Accounting',
            'kode_ruangan' => 'JKT-ACC',
            'lantai' => 'Lantai 2',
        ]);

        $roomJaktimProduksi = Room::create([
            'branch_id' => $branchJaktim->id,
            'nama_ruangan' => 'Ruangan Produksi',
            'kode_ruangan' => 'JKT-PRD',
            'lantai' => 'Lantai 1',
        ]);

        $roomJaktimGudang = Room::create([
            'branch_id' => $branchJaktim->id,
            'nama_ruangan' => 'Gudang Utama',
            'kode_ruangan' => 'JKT-GDG',
            'lantai' => 'Lantai 1',
        ]);

        $roomTambunProduksi = Room::create([
            'branch_id' => $branchTambun->id,
            'nama_ruangan' => 'Ruangan Produksi',
            'kode_ruangan' => 'TMB-PRD',
            'lantai' => 'Lantai 1',
        ]);

        $roomTambunAccounting = Room::create([
            'branch_id' => $branchTambun->id,
            'nama_ruangan' => 'Ruangan Accounting',
            'kode_ruangan' => 'TMB-ACC',
            'lantai' => 'Lantai 2',
        ]);

        $roomSalatigaAccounting = Room::create([
            'branch_id' => $branchSalatiga->id,
            'nama_ruangan' => 'Ruangan Accounting',
            'kode_ruangan' => 'SLT-ACC',
            'lantai' => 'Lantai 2',
        ]);

        $roomSalatigaProduksi = Room::create([
            'branch_id' => $branchSalatiga->id,
            'nama_ruangan' => 'Ruangan Produksi',
            'kode_ruangan' => 'SLT-PRD',
            'lantai' => 'Lantai 1',
        ]);

        // 5. Master Items (Barang Operasional: Printer, Bangku, Meja, ATK, Mesin Laminating, dll.)
        $item1 = Item::create([
            'kode_barang' => 'BRG-ATK-001',
            'nama_barang' => 'Kertas HVS A4 80gr Sidu',
            'kategori' => 'Alat Tulis Kantor',
            'satuan' => 'Rim',
            'stok' => 75,
            'min_stok' => 10,
            'deskripsi' => 'Kertas cetak laporan keuangan bulanan accounting',
        ]);

        $item2 = Item::create([
            'kode_barang' => 'BRG-ATK-002',
            'nama_barang' => 'Ballpoint Standard AE7 Hitam',
            'kategori' => 'Alat Tulis Kantor',
            'satuan' => 'Pack',
            'stok' => 35,
            'min_stok' => 5,
            'deskripsi' => 'Pulpen hitam untuk paraf dokumen fisik',
        ]);

        $item3 = Item::create([
            'kode_barang' => 'BRG-IT-001',
            'nama_barang' => 'Toner Printer HP LaserJet Pro M404',
            'kategori' => 'Perlengkapan IT',
            'satuan' => 'Unit',
            'stok' => 8,
            'min_stok' => 2,
            'deskripsi' => 'Toner printer utama meja accounting',
        ]);

        $item4 = Item::create([
            'kode_barang' => 'BRG-ARK-001',
            'nama_barang' => 'Map Ordner Bindex Folio',
            'kategori' => 'Arsip & Dokumen',
            'satuan' => 'Pcs',
            'stok' => 40,
            'min_stok' => 8,
            'deskripsi' => 'Map ordner arsip bukti pengeluaran & faktur pajak',
        ]);

        $item5 = Item::create([
            'kode_barang' => 'BRG-PRN-001',
            'nama_barang' => 'Printer Multifungsi HP LaserJet Pro M404',
            'kategori' => 'Perlengkapan IT',
            'satuan' => 'Unit',
            'stok' => 12,
            'min_stok' => 2,
            'deskripsi' => 'Printer operasional cetak invoice dan laporan harian',
        ]);

        $item6 = Item::create([
            'kode_barang' => 'BRG-FRN-001',
            'nama_barang' => 'Bangku Putar Produksi Heavy Duty',
            'kategori' => 'Furniture & Perabot',
            'satuan' => 'Buah',
            'stok' => 110,
            'min_stok' => 15,
            'deskripsi' => 'Bangku kerja hidrolik ergonomis untuk area operasional & produksi',
        ]);

        $item7 = Item::create([
            'kode_barang' => 'BRG-FRN-002',
            'nama_barang' => 'Meja Kerja Kantor Accounting 120cm',
            'kategori' => 'Furniture & Perabot',
            'satuan' => 'Unit',
            'stok' => 24,
            'min_stok' => 5,
            'deskripsi' => 'Meja kerja kayu lapis melamin lengkap laci berkas',
        ]);

        $item8 = Item::create([
            'kode_barang' => 'BRG-MSN-001',
            'nama_barang' => 'Mesin Laminating Joyko LM-01 A3',
            'kategori' => 'Peralatan Operasional',
            'satuan' => 'Unit',
            'stok' => 4,
            'min_stok' => 1,
            'deskripsi' => 'Mesin laminasi dokumen SOP, label instruksi, dan kartu kerja',
        ]);

        // 6. Penempatan Barang per Ruangan & Cabang (Item Locations)
        // Jakarta Timur - Ruang Accounting
        ItemLocation::create([
            'item_id' => $item7->id, // Meja
            'branch_id' => $branchJaktim->id,
            'room_id' => $roomJaktimAccounting->id,
            'jumlah' => 8,
            'kondisi' => 'Baik',
            'keterangan' => 'Meja kerja staf accounting',
        ]);
        ItemLocation::create([
            'item_id' => $item5->id, // Printer HP
            'branch_id' => $branchJaktim->id,
            'room_id' => $roomJaktimAccounting->id,
            'jumlah' => 2,
            'kondisi' => 'Baik',
            'keterangan' => 'Printer cetak faktur & kwitansi',
        ]);
        ItemLocation::create([
            'item_id' => $item8->id, // Mesin Laminating
            'branch_id' => $branchJaktim->id,
            'room_id' => $roomJaktimAccounting->id,
            'jumlah' => 1,
            'kondisi' => 'Baik',
            'keterangan' => 'Untuk laminasi form & kartu inventaris',
        ]);
        ItemLocation::create([
            'item_id' => $item1->id, // Kertas HVS
            'branch_id' => $branchJaktim->id,
            'room_id' => $roomJaktimAccounting->id,
            'jumlah' => 30,
            'kondisi' => 'Baik',
            'keterangan' => 'Stok kertas siap pakai',
        ]);

        // Jakarta Timur - Ruang Produksi
        ItemLocation::create([
            'item_id' => $item6->id, // Bangku Putar Produksi
            'branch_id' => $branchJaktim->id,
            'room_id' => $roomJaktimProduksi->id,
            'jumlah' => 45,
            'kondisi' => 'Baik',
            'keterangan' => 'Bangku line produksi shift 1 & 2',
        ]);
        ItemLocation::create([
            'item_id' => $item7->id, // Meja
            'branch_id' => $branchJaktim->id,
            'room_id' => $roomJaktimProduksi->id,
            'jumlah' => 6,
            'kondisi' => 'Baik',
            'keterangan' => 'Meja mandor & QC line',
        ]);

        // Cabang Tambun - Ruangan Produksi
        ItemLocation::create([
            'item_id' => $item6->id, // Bangku
            'branch_id' => $branchTambun->id,
            'room_id' => $roomTambunProduksi->id,
            'jumlah' => 30,
            'kondisi' => 'Baik',
            'keterangan' => 'Bangku kerja operator Tambun',
        ]);

        // Cabang Tambun - Ruangan Accounting
        ItemLocation::create([
            'item_id' => $item7->id, // Meja
            'branch_id' => $branchTambun->id,
            'room_id' => $roomTambunAccounting->id,
            'jumlah' => 4,
            'kondisi' => 'Baik',
            'keterangan' => 'Meja administrasi Tambun',
        ]);
        ItemLocation::create([
            'item_id' => $item5->id, // Printer
            'branch_id' => $branchTambun->id,
            'room_id' => $roomTambunAccounting->id,
            'jumlah' => 1,
            'kondisi' => 'Baik',
            'keterangan' => 'Printer admin Tambun',
        ]);

        // Cabang Salatiga - Ruangan Accounting
        ItemLocation::create([
            'item_id' => $item5->id, // Printer (Contoh Poin 7: "Cabang Salatiga ruangan Accounting ada berapa printer")
            'branch_id' => $branchSalatiga->id,
            'room_id' => $roomSalatigaAccounting->id,
            'jumlah' => 4,
            'kondisi' => 'Baik',
            'keterangan' => '4 Unit printer operasional kantor Salatiga',
        ]);
        ItemLocation::create([
            'item_id' => $item7->id, // Meja
            'branch_id' => $branchSalatiga->id,
            'room_id' => $roomSalatigaAccounting->id,
            'jumlah' => 6,
            'kondisi' => 'Baik',
            'keterangan' => 'Meja kantor staf Salatiga',
        ]);

        // Cabang Salatiga - Ruangan Produksi
        ItemLocation::create([
            'item_id' => $item6->id, // Bangku
            'branch_id' => $branchSalatiga->id,
            'room_id' => $roomSalatigaProduksi->id,
            'jumlah' => 20,
            'kondisi' => 'Baik',
            'keterangan' => 'Bangku produksi unit Salatiga',
        ]);

        // 7. Contoh Peminjaman Antar Cabang (Sesuai Poin 5 tulisan tangan: Karyawan Jaktim pinjam 10 bangku ke Tambun)
        ItemLoan::create([
            'nomor_peminjaman' => 'LOAN-2026-0001',
            'item_id' => $item6->id, // Bangku Putar Produksi
            'jumlah' => 10,
            'from_branch_id' => $branchJaktim->id,
            'from_room_id' => $roomJaktimProduksi->id,
            'to_branch_id' => $branchTambun->id,
            'to_room_id' => $roomTambunProduksi->id,
            'borrower_id' => $userKaryawan->id,
            'borrower_name' => $userKaryawan->name,
            'tanggal_pinjam' => now()->subDays(2)->format('Y-m-d'),
            'tenggat_kembali' => now()->addDays(12)->format('Y-m-d'),
            'tanggal_kembali' => null,
            'status' => 'DIPINJAM',
            'keterangan' => 'Peminjaman 10 buah bangku kerja dari Cabang Jaktim untuk kebutuhan penambahan line di Cabang Tambun.',
        ]);

        // Initial Stock Movements
        StockMovement::create([
            'item_id' => $item1->id,
            'user_id' => $userInventarisir->id,
            'type' => 'IN',
            'jumlah' => 45,
            'stok_sebelum' => 0,
            'stok_sesudah' => 45,
            'catatan' => 'Saldo awal inventarisasi',
        ]);

        StockMovement::create([
            'item_id' => $item2->id,
            'user_id' => $userInventarisir->id,
            'type' => 'IN',
            'jumlah' => 15,
            'stok_sebelum' => 0,
            'stok_sesudah' => 15,
            'catatan' => 'Saldo awal inventarisasi',
        ]);

        // 4. Sample Purchase Request (Alur 1) - SUBMITTED
        $pr1 = PurchaseRequest::create([
            'nomor_pengajuan' => 'PR-2026-001',
            'user_id' => $userKaryawan->id,
            'catatan' => 'Kebutuhan ATK rutin Divisi Accounting Q3',
            'status' => 'SUBMITTED',
        ]);

        PurchaseRequestItem::create([
            'purchase_request_id' => $pr1->id,
            'item_id' => $item1->id,
            'nama_barang' => $item1->nama_barang,
            'jumlah' => 10,
            'satuan' => 'Rim',
            'alasan_kebutuhan' => 'Stok kertas di ruang accounting menipis untuk cetak faktur',
            'estimasi_harga' => 55000,
        ]);

        PurchaseRequestItem::create([
            'purchase_request_id' => $pr1->id,
            'item_id' => $item2->id,
            'nama_barang' => $item2->nama_barang,
            'jumlah' => 5,
            'satuan' => 'Pack',
            'alasan_kebutuhan' => 'Persediaan pulpen staf pencatatan jurnal',
            'estimasi_harga' => 25000,
        ]);

        // 5. Sample Purchase Request - APPROVED (Ready for Purchase in Alur 2)
        $pr2 = PurchaseRequest::create([
            'nomor_pengajuan' => 'PR-2026-002',
            'user_id' => $userKaryawan->id,
            'catatan' => 'Kebutuhan Toner Printer Accounting Urgent',
            'status' => 'APPROVED',
        ]);

        PurchaseRequestItem::create([
            'purchase_request_id' => $pr2->id,
            'item_id' => $item3->id,
            'nama_barang' => $item3->nama_barang,
            'jumlah' => 2,
            'satuan' => 'Unit',
            'alasan_kebutuhan' => 'Printer accounting kehabisan toner',
            'estimasi_harga' => 1250000,
        ]);

        // 6. Sample Purchase (Alur 2) - PURCHASED
        $pur1 = Purchase::create([
            'nomor_pembelian' => 'PO-2026-001',
            'purchase_request_id' => $pr2->id,
            'created_by' => $userStaffGudang->id,
            'supplier' => 'PT Gramedia Asri Media',
            'tanggal_pembelian' => now()->subDays(2)->format('Y-m-d'),
            'nomor_nota' => 'INV-GRM-99812',
            'total_harga' => 2500000,
            'file_bukti' => null,
            'status' => 'PURCHASED',
        ]);

        PurchaseItem::create([
            'purchase_id' => $pur1->id,
            'item_id' => $item3->id,
            'nama_barang' => $item3->nama_barang,
            'jumlah' => 2,
            'harga_satuan' => 1250000,
            'subtotal' => 2500000,
        ]);

        // 7. Sample Purchase Document (Alur 3) - SUBMITTED to Inventarisir
        $doc1 = PurchaseDocument::create([
            'nomor_dokumen' => 'DOC-2026-001',
            'purchase_id' => $pur1->id,
            'created_by' => $userStaffGudang->id,
            'catatan' => 'Laporan fisik barang telah diterima di gudang utama.',
            'status' => 'SUBMITTED',
        ]);

        // 8. Sample Purchase Report (Alur 4) - SUBMITTED to Manager Gudang
        PurchaseReport::create([
            'nomor_laporan' => 'REP-2026-001',
            'purchase_document_id' => $doc1->id,
            'judul_laporan' => 'Laporan Rekapitulasi Pembelian Barang Operasional Accounting September 2026',
            'periode_mulai' => now()->startOfMonth()->format('Y-m-d'),
            'periode_selesai' => now()->endOfMonth()->format('Y-m-d'),
            'total_transaksi' => 1,
            'total_pengeluaran' => 2500000,
            'catatan' => 'Catatan laporan siap diperiksa oleh Manager Gudang.',
            'created_by' => $userInventarisir->id,
            'status' => 'SUBMITTED',
        ]);
    }
}
