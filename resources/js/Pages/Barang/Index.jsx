import {
    AlertTriangleIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ClockIcon,
    EditIcon,
    PackageIcon,
    PlusIcon,
    SearchIcon,
    TrashIcon,
    XMarkIcon,
} from '@/Components/Icons';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function BarangIndex({ items, categories, stockMovements }) {
    const user = usePage().props.auth.user;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [adjustingItem, setAdjustingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('master'); // 'master' or 'mutasi'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [onlyLowStock, setOnlyLowStock] = useState(false);

    const itemList = useMemo(() => {
        return items.data ? items.data : items;
    }, [items]);

    // Metrics calculation
    const metrics = useMemo(() => {
        const totalItems = itemList.length;
        const totalUnits = itemList.reduce((sum, i) => sum + (parseInt(i.stok) || 0), 0);
        const lowStockCount = itemList.filter((i) => i.stok <= i.min_stok).length;
        const totalMovements = stockMovements.length;
        return { totalItems, totalUnits, lowStockCount, totalMovements };
    }, [itemList, stockMovements]);

    // Filtered items
    const filteredItems = useMemo(() => {
        return itemList.filter((item) => {
            const matchesCat =
                selectedCategory === 'ALL' || item.kategori === selectedCategory;
            const matchesLow = !onlyLowStock || item.stok <= item.min_stok;

            const q = searchQuery.toLowerCase().trim();
            if (!q) return matchesCat && matchesLow;

            const matchesKode = item.kode_barang?.toLowerCase().includes(q);
            const matchesNama = item.nama_barang?.toLowerCase().includes(q);
            const matchesDeskripsi = item.deskripsi?.toLowerCase().includes(q);

            return matchesCat && matchesLow && (matchesKode || matchesNama || matchesDeskripsi);
        });
    }, [itemList, searchQuery, selectedCategory, onlyLowStock]);

    // Form Create / Edit
    const itemForm = useForm({
        kode_barang: '',
        nama_barang: '',
        kategori: 'Alat Tulis Kantor',
        satuan: 'Pcs',
        stok: 0,
        min_stok: 5,
        deskripsi: '',
    });

    // Form Adjust Stock
    const adjustForm = useForm({
        type: 'IN',
        jumlah: 1,
        catatan: '',
    });

    const handleCreateOpen = () => {
        itemForm.setData({
            kode_barang: 'BRG-' + Math.floor(100 + Math.random() * 900),
            nama_barang: '',
            kategori: 'Alat Tulis Kantor',
            satuan: 'Pcs',
            stok: 0,
            min_stok: 5,
            deskripsi: '',
        });
        setIsCreateOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        itemForm.post(route('barang.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                itemForm.reset();
            },
        });
    };

    const handleEditOpen = (item) => {
        setEditingItem(item);
        itemForm.setData({
            kode_barang: item.kode_barang,
            nama_barang: item.nama_barang,
            kategori: item.kategori,
            satuan: item.satuan,
            min_stok: item.min_stok,
            deskripsi: item.deskripsi || '',
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        itemForm.put(route('barang.update', editingItem.id), {
            onSuccess: () => {
                setEditingItem(null);
            },
        });
    };

    const handleAdjustSubmit = (e) => {
        e.preventDefault();
        adjustForm.post(route('barang.adjust-stock', adjustingItem.id), {
            onSuccess: () => {
                setAdjustingItem(null);
                adjustForm.reset();
            },
        });
    };

    const handleDelete = (item) => {
        if (confirm(`Hapus master barang ${item.nama_barang}?`)) {
            useForm().delete(route('barang.destroy', item.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Data Barang Operasional & Master Stok
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola data barang operasional kantor, pemantauan batas stok minimum, dan audit mutasi fisik.
                        </p>
                    </div>
                    {(user.role === 'staff_gudang' ||
                        user.role === 'inventarisir' ||
                        user.role === 'manager_gudang') && (
                        <button
                            onClick={handleCreateOpen}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs transition transform hover:-translate-y-0.5"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Tambah Master Barang</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Data Barang Operasional" />

            <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Jenis Barang Terdaftar</div>
                        <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{metrics.totalItems}</div>
                        <div className="text-xs text-slate-400 mt-1">Seluruh SKU operasional</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Total Kuantitas Fisik</div>
                        <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{metrics.totalUnits}</div>
                        <div className="text-xs text-slate-400 mt-1">Unit dalam gudang</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white to-rose-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-rose-800">Peringatan Stok Kritis</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-rose-900 mt-2">{metrics.lowStockCount}</div>
                        <div className="text-xs text-rose-700 mt-1 font-medium">Kuantitas di bawah batas min.</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Riwayat Mutasi Stok</div>
                        <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{metrics.totalMovements}</div>
                        <div className="text-xs text-slate-400 mt-1">Catatan keluar & masuk</div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl text-sm font-semibold">
                        <button
                            onClick={() => setActiveTab('master')}
                            className={`px-5 py-2.5 rounded-lg transition whitespace-nowrap ${
                                activeTab === 'master'
                                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Data Master Barang ({metrics.totalItems})
                        </button>
                        <button
                            onClick={() => setActiveTab('mutasi')}
                            className={`px-5 py-2.5 rounded-lg transition whitespace-nowrap ${
                                activeTab === 'mutasi'
                                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Riwayat Mutasi Stok ({metrics.totalMovements})
                        </button>
                    </div>

                    {activeTab === 'master' && (
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setOnlyLowStock(!onlyLowStock)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition flex items-center gap-2 ${
                                    onlyLowStock
                                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <AlertTriangleIcon className="w-4 h-4" />
                                <span>Stok Kritis Saja</span>
                            </button>

                            <div className="relative w-full sm:w-72">
                                <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari kode atau nama barang..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Master Items Tab */}
                {activeTab === 'master' ? (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse min-w-[850px]">
                                <thead>
                                    <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                        <th className="py-4 px-5">Kode Barang</th>
                                        <th className="py-4 px-5">Nama Barang & Deskripsi</th>
                                        <th className="py-4 px-5">Kategori</th>
                                        <th className="py-4 px-5">Stok Gudang</th>
                                        <th className="py-4 px-5">Batas Min.</th>
                                        <th className="py-4 px-5 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-16 text-center text-slate-400 text-sm">
                                                Tidak ada data barang yang sesuai kriteria pencarian.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredItems.map((item) => {
                                            const isLow = item.stok <= item.min_stok;

                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-4 px-5 align-top">
                                                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                                                            {item.kode_barang}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 align-top">
                                                        <div className="font-bold text-slate-900 text-sm">
                                                            {item.nama_barang}
                                                        </div>
                                                        {item.deskripsi && (
                                                            <div className="text-slate-400 text-xs mt-1">
                                                                {item.deskripsi}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-5 align-top">
                                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-semibold border border-slate-200">
                                                            {item.kategori}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 align-top">
                                                        <span
                                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs sm:text-sm ${
                                                                isLow
                                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${
                                                                    isLow ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                                                                }`}
                                                            ></span>
                                                            <span>
                                                                {item.stok} {item.satuan}
                                                            </span>
                                                        </span>
                                                        {isLow && (
                                                            <div className="text-xs text-rose-600 font-bold mt-1">
                                                                Batas Kritis!
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-5 align-top text-slate-700 font-semibold text-sm">
                                                        {item.min_stok} {item.satuan}
                                                    </td>
                                                    <td className="py-4 px-5 text-right align-top space-x-2">
                                                        <button
                                                            onClick={() => setAdjustingItem(item)}
                                                            className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-xs sm:text-sm border border-blue-200 transition"
                                                        >
                                                            Sesuaikan Stok
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditOpen(item)}
                                                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        {(user.role === 'manager_gudang' ||
                                                            user.role === 'staff_gudang') && (
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs sm:text-sm border border-rose-200 transition"
                                                            >
                                                                Hapus
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Stock Movement Log Table */
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse min-w-[850px]">
                                <thead>
                                    <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                        <th className="py-4 px-5">Waktu & Pengguna</th>
                                        <th className="py-4 px-5">Nama Barang</th>
                                        <th className="py-4 px-5">Jenis Mutasi</th>
                                        <th className="py-4 px-5">Jumlah Perubahan</th>
                                        <th className="py-4 px-5">Perubahan Stok (Sebelum &rarr; Sesudah)</th>
                                        <th className="py-4 px-5">Catatan Mutasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stockMovements.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-16 text-center text-slate-400 text-sm">
                                                Belum ada catatan mutasi atau penyesuaian stok.
                                            </td>
                                        </tr>
                                    ) : (
                                        stockMovements.map((sm) => (
                                            <tr key={sm.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-4 px-5 align-top">
                                                    <div className="font-bold text-slate-900 text-sm">{sm.user?.name}</div>
                                                    <div className="text-slate-400 text-xs mt-0.5">
                                                        {new Date(sm.created_at).toLocaleString('id-ID')}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 align-top font-bold text-slate-900 text-sm">
                                                    {sm.item?.nama_barang}
                                                </td>
                                                <td className="py-4 px-5 align-top">
                                                    <StatusBadge status={sm.type} />
                                                </td>
                                                <td className="py-4 px-5 align-top font-mono font-bold text-slate-900 text-sm">
                                                    {sm.type === 'IN' ? `+${sm.jumlah}` : `-${sm.jumlah}`}{' '}
                                                    {sm.item?.satuan}
                                                </td>
                                                <td className="py-4 px-5 align-top font-mono text-slate-700 text-sm">
                                                    {sm.stok_sebelum} &rarr;{' '}
                                                    <span className="font-bold text-slate-900">
                                                        {sm.stok_sesudah}
                                                    </span>{' '}
                                                    {sm.item?.satuan}
                                                </td>
                                                <td className="py-4 px-5 align-top text-slate-600 italic text-sm">
                                                    {sm.catatan || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Create Master Item */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="font-extrabold text-slate-900 text-lg">
                                Tambah Master Barang Operasional
                            </h3>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-5 text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Kode Barang *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white font-mono"
                                        value={itemForm.data.kode_barang}
                                        onChange={(e) => itemForm.setData('kode_barang', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Kategori *</label>
                                    <select
                                        className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5 bg-white"
                                        value={itemForm.data.kategori}
                                        onChange={(e) => itemForm.setData('kategori', e.target.value)}
                                    >
                                        <option value="Alat Tulis Kantor">Alat Tulis Kantor (ATK)</option>
                                        <option value="Peralatan Komputer">Peralatan Komputer</option>
                                        <option value="Perlengkapan Kebersihan">Perlengkapan Kebersihan</option>
                                        <option value="Perlengkapan Umum">Perlengkapan Umum</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Nama Barang Operasional *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                    placeholder="Contoh: Kertas HVS A4 80gr Sinar Dunia"
                                    value={itemForm.data.nama_barang}
                                    onChange={(e) => itemForm.setData('nama_barang', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Satuan *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        placeholder="Rim / Pcs / Box"
                                        value={itemForm.data.satuan}
                                        onChange={(e) => itemForm.setData('satuan', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Stok Awal</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        value={itemForm.data.stok}
                                        onChange={(e) =>
                                            itemForm.setData('stok', parseInt(e.target.value) || 0)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Min. Stok *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        value={itemForm.data.min_stok}
                                        onChange={(e) =>
                                            itemForm.setData('min_stok', parseInt(e.target.value) || 1)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Deskripsi / Spesifikasi Barang
                                </label>
                                <textarea
                                    rows="3"
                                    className="w-full rounded-xl border border-slate-200 text-sm p-4 bg-white"
                                    placeholder="Keterangan spesifikasi barang operasional..."
                                    value={itemForm.data.deskripsi}
                                    onChange={(e) => itemForm.setData('deskripsi', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={itemForm.processing}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                                >
                                    Simpan Master Barang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Master Item */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="font-extrabold text-slate-900 text-lg">
                                Edit Master Barang ({editingItem.kode_barang})
                            </h3>
                            <button
                                onClick={() => setEditingItem(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Nama Barang *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                    value={itemForm.data.nama_barang}
                                    onChange={(e) => itemForm.setData('nama_barang', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Satuan *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        value={itemForm.data.satuan}
                                        onChange={(e) => itemForm.setData('satuan', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Min. Stok *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        value={itemForm.data.min_stok}
                                        onChange={(e) =>
                                            itemForm.setData('min_stok', parseInt(e.target.value) || 1)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Deskripsi</label>
                                <textarea
                                    rows="3"
                                    className="w-full rounded-xl border border-slate-200 text-sm p-4 bg-white"
                                    value={itemForm.data.deskripsi}
                                    onChange={(e) => itemForm.setData('deskripsi', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={itemForm.processing}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Adjust Stock */}
            {adjustingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                Penyesuaian Stok Fisik
                            </h3>
                            <button
                                onClick={() => setAdjustingItem(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-1.5">
                            <div>
                                <span className="font-semibold text-slate-500">Nama Barang:</span>{' '}
                                <span className="font-bold text-slate-900">
                                    {adjustingItem.nama_barang}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-500">Stok Saat Ini:</span>{' '}
                                <span className="font-mono font-bold text-slate-900">
                                    {adjustingItem.stok} {adjustingItem.satuan}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Jenis Penyesuaian
                                    </label>
                                    <select
                                        className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3 bg-white"
                                        value={adjustForm.data.type}
                                        onChange={(e) => adjustForm.setData('type', e.target.value)}
                                    >
                                        <option value="IN">Stok Masuk (+)</option>
                                        <option value="OUT">Stok Keluar / Terpakai (-)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Jumlah Penyesuaian *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        value={adjustForm.data.jumlah}
                                        onChange={(e) =>
                                            adjustForm.setData('jumlah', parseInt(e.target.value) || 1)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Catatan / Alasan Penyesuaian *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                    placeholder="Contoh: Pemakaian rutin divisi accounting / audit fisik"
                                    value={adjustForm.data.catatan}
                                    onChange={(e) => adjustForm.setData('catatan', e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setAdjustingItem(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={adjustForm.processing}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
                                >
                                    Terapkan Penyesuaian
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
