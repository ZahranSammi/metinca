<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItemRequest;
use App\Models\Branch;
use App\Models\Item;
use App\Models\ItemLoan;
use App\Models\ItemLocation;
use App\Models\StockMovement;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BarangOperasionalController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Item::withCount('stockMovements')->latest();

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_barang', 'like', "%{$search}%")
                    ->orWhere('nama_barang', 'like', "%{$search}%")
                    ->orWhere('kategori', 'like', "%{$search}%");
            });
        }

        if ($request->has('kategori') && ! empty($request->kategori)) {
            $query->where('kategori', $request->kategori);
        }

        $items = $query->paginate(15)->withQueryString();
        $categories = Item::distinct()->pluck('kategori')->filter();
        $stockMovements = StockMovement::with(['item', 'user'])
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Barang/Index', [
            'items' => $items,
            'categories' => $categories,
            'stockMovements' => $stockMovements,
            'filters' => $request->only(['search', 'kategori']),
        ]);
    }

    public function store(StoreItemRequest $request): RedirectResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($request, $user) {
            $item = Item::create([
                'kode_barang' => strtoupper($request->kode_barang),
                'nama_barang' => $request->nama_barang,
                'kategori' => $request->kategori,
                'satuan' => $request->satuan,
                'stok' => $request->stok,
                'min_stok' => $request->min_stok,
                'deskripsi' => $request->deskripsi,
            ]);

            if ($request->stok > 0) {
                StockMovement::create([
                    'item_id' => $item->id,
                    'user_id' => $user->id,
                    'type' => 'IN',
                    'jumlah' => $request->stok,
                    'stok_sebelum' => 0,
                    'stok_sesudah' => $request->stok,
                    'catatan' => 'Pencatatan stok awal barang master',
                ]);
            }

            AuditLogService::log(
                $user,
                'CREATE_ITEM',
                Item::class,
                $item->id,
                null,
                $item->toArray()
            );
        });

        return redirect()->route('barang.index')
            ->with('success', 'Master barang operasional berhasil ditambahkan.');
    }

    public function update(StoreItemRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $item = Item::findOrFail($id);

        $oldValues = $item->toArray();

        $item->update([
            'kode_barang' => strtoupper($request->kode_barang),
            'nama_barang' => $request->nama_barang,
            'kategori' => $request->kategori,
            'satuan' => $request->satuan,
            'min_stok' => $request->min_stok,
            'deskripsi' => $request->deskripsi,
        ]);

        AuditLogService::log(
            $user,
            'UPDATE_ITEM',
            Item::class,
            $item->id,
            $oldValues,
            $item->fresh()->toArray()
        );

        return redirect()->route('barang.index')
            ->with('success', 'Data master barang berhasil diperbarui.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasRole(['manager_gudang', 'staff_gudang'])) {
            abort(403, 'Anda tidak berhak menghapus data master barang.');
        }

        $item = Item::findOrFail($id);
        $oldValues = $item->toArray();
        $item->delete();

        AuditLogService::log(
            $user,
            'DELETE_ITEM',
            Item::class,
            $id,
            $oldValues,
            null
        );

        return redirect()->route('barang.index')
            ->with('success', 'Master barang berhasil dihapus.');
    }

    public function adjustStock(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasRole(['staff_gudang', 'inventarisir', 'manager_gudang'])) {
            abort(403, 'Anda tidak berhak menyesuaikan stok.');
        }

        $request->validate([
            'type' => 'required|in:IN,OUT,ADJUSTMENT',
            'jumlah' => 'required|integer|min:1',
            'catatan' => 'required|string|max:1000',
        ]);

        $item = Item::findOrFail($id);

        DB::transaction(function () use ($item, $request, $user) {
            $stokSebelum = $item->stok;
            $type = $request->type;
            $jumlah = $request->jumlah;

            if ($type === 'IN') {
                $stokSesudah = $stokSebelum + $jumlah;
            } elseif ($type === 'OUT') {
                $stokSesudah = max(0, $stokSebelum - $jumlah);
            } else {
                // Adjustment sets exact stock to $jumlah or changes it
                $stokSesudah = $jumlah;
            }

            $item->stok = $stokSesudah;
            $item->save();

            StockMovement::create([
                'item_id' => $item->id,
                'user_id' => $user->id,
                'type' => $type,
                'jumlah' => $jumlah,
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $stokSesudah,
                'catatan' => $request->catatan,
            ]);

            AuditLogService::log(
                $user,
                'ADJUST_ITEM_STOCK',
                Item::class,
                $item->id,
                ['stok' => $stokSebelum],
                ['stok' => $stokSesudah, 'catatan' => $request->catatan]
            );
        });

        return redirect()->route('barang.index')
            ->with('success', 'Penyesuaian stok barang berhasil disimpan.');
    }

    public function pendataanRuangan(Request $request): Response
    {
        $query = ItemLocation::with(['item', 'branch', 'room'])->latest();

        if ($request->filled('branch_id') && $request->branch_id !== 'ALL') {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('room_id') && $request->room_id !== 'ALL') {
            $query->where('room_id', $request->room_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('item', function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                    ->orWhere('kode_barang', 'like', "%{$search}%");
            });
        }

        $locations = $query->paginate(20)->withQueryString();
        $branches = Branch::with('rooms')->get();
        $items = Item::orderBy('nama_barang')->get();

        // Sample Metrics sesuai catatan tulisan tangan:
        // 1. Meja di Ruangan Accounting
        $mejaAccountingCount = ItemLocation::whereHas('item', function ($q) {
            $q->where('nama_barang', 'like', '%Meja%');
        })->whereHas('room', function ($q) {
            $q->where('nama_ruangan', 'like', '%Accounting%');
        })->sum('jumlah');

        // 2. Cabang Jaktim Ruangan Produksi ada berapa bangku
        $bangkuJaktimProduksiCount = ItemLocation::whereHas('item', function ($q) {
            $q->where('nama_barang', 'like', '%Bangku%');
        })->whereHas('branch', function ($q) {
            $q->where('nama_cabang', 'like', '%Jakarta Timur%');
        })->whereHas('room', function ($q) {
            $q->where('nama_ruangan', 'like', '%Produksi%');
        })->sum('jumlah');

        // 3. Cabang Salatiga Ruangan Accounting ada berapa printer
        $printerSalatigaAccountingCount = ItemLocation::whereHas('item', function ($q) {
            $q->where('nama_barang', 'like', '%Printer%');
        })->whereHas('branch', function ($q) {
            $q->where('nama_cabang', 'like', '%Salatiga%');
        })->whereHas('room', function ($q) {
            $q->where('nama_ruangan', 'like', '%Accounting%');
        })->sum('jumlah');

        $metrics = [
            'total_locations' => ItemLocation::count(),
            'total_units' => ItemLocation::sum('jumlah'),
            'meja_accounting' => $mejaAccountingCount,
            'bangku_jaktim_produksi' => $bangkuJaktimProduksiCount,
            'printer_salatiga_accounting' => $printerSalatigaAccountingCount,
        ];

        return Inertia::render('Barang/PendataanRuangan', [
            'locations' => $locations,
            'branches' => $branches,
            'items' => $items,
            'metrics' => $metrics,
            'filters' => $request->only(['branch_id', 'room_id', 'search']),
        ]);
    }

    public function updateRuanganStok(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'branch_id' => 'required|exists:branches,id',
            'room_id' => 'required|exists:rooms,id',
            'jumlah' => 'required|integer|min:0',
            'kondisi' => 'required|string',
            'keterangan' => 'nullable|string|max:500',
        ]);

        $location = ItemLocation::updateOrCreate(
            [
                'item_id' => $validated['item_id'],
                'room_id' => $validated['room_id'],
            ],
            [
                'branch_id' => $validated['branch_id'],
                'jumlah' => $validated['jumlah'],
                'kondisi' => $validated['kondisi'],
                'keterangan' => $validated['keterangan'] ?? null,
            ]
        );

        AuditLogService::log(
            $request->user(),
            'UPDATE_ROOM_INVENTORY',
            'ItemLocation',
            $location->id,
            null,
            $location->toArray()
        );

        return redirect()->back()->with('success', 'Data penempatan barang di ruangan berhasil disimpan.');
    }

    public function tracking(Request $request): Response
    {
        $query = Item::with([
            'locations.branch',
            'locations.room',
            'loans' => function ($q) {
                $q->where('status', 'DIPINJAM')
                    ->with(['fromBranch', 'fromRoom', 'toBranch', 'toRoom', 'borrower']);
            },
        ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                    ->orWhere('kode_barang', 'like', "%{$search}%")
                    ->orWhere('kategori', 'like', "%{$search}%");
            });
        }

        $items = $query->paginate(15)->withQueryString();
        $branches = Branch::with('rooms')->get();

        $activeLoans = ItemLoan::with(['item', 'fromBranch', 'fromRoom', 'toBranch', 'toRoom', 'borrower'])
            ->where('status', 'DIPINJAM')
            ->latest()
            ->get();

        return Inertia::render('Barang/Tracking', [
            'items' => $items,
            'branches' => $branches,
            'activeLoans' => $activeLoans,
            'filters' => $request->only(['search']),
        ]);
    }
}
