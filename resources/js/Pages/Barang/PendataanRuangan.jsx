import {
    AlertTriangleIcon,
    ArrowRightIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    EditIcon,
    FilterIcon,
    PackageIcon,
    PlusIcon,
    PrinterIcon,
    SearchIcon,
    XMarkIcon,
} from '@/Components/Icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function PendataanRuangan({
    locations,
    branches,
    items,
    metrics,
    filters = {},
}) {
    const user = usePage().props.auth.user;
    const canManage =
        user.role === 'staff_gudang' ||
        user.role === 'inventarisir' ||
        user.role === 'manager_gudang';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);

    const [selectedBranch, setSelectedBranch] = useState(filters.branch_id || 'ALL');
    const [selectedRoom, setSelectedRoom] = useState(filters.room_id || 'ALL');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Form allocate/adjust
    const form = useForm({
        item_id: '',
        branch_id: branches[0]?.id || '',
        room_id: branches[0]?.rooms?.[0]?.id || '',
        jumlah: 1,
        kondisi: 'Baik',
        keterangan: '',
    });

    const activeRooms = useMemo(() => {
        if (!form.data.branch_id) return [];
        const b = branches.find((br) => br.id === parseInt(form.data.branch_id));
        return b?.rooms || [];
    }, [branches, form.data.branch_id]);

    const filterRooms = useMemo(() => {
        if (selectedBranch === 'ALL') {
            return branches.flatMap((b) => b.rooms || []);
        }
        const b = branches.find((br) => br.id === parseInt(selectedBranch));
        return b?.rooms || [];
    }, [branches, selectedBranch]);

    const handleFilterChange = (newBranch, newRoom, newSearch) => {
        router.get(
            route('barang.pendataan-ruangan'),
            {
                branch_id: newBranch !== 'ALL' ? newBranch : undefined,
                room_id: newRoom !== 'ALL' ? newRoom : undefined,
                search: newSearch || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleOpenModal = (location = null) => {
        if (location) {
            setEditingLocation(location);
            form.setData({
                item_id: location.item_id,
                branch_id: location.branch_id,
                room_id: location.room_id,
                jumlah: location.jumlah,
                kondisi: location.kondisi || 'Baik',
                keterangan: location.keterangan || '',
            });
        } else {
            setEditingLocation(null);
            form.reset();
            if (branches[0]) {
                form.setData({
                    item_id: items[0]?.id || '',
                    branch_id: branches[0].id,
                    room_id: branches[0].rooms?.[0]?.id || '',
                    jumlah: 1,
                    kondisi: 'Baik',
                    keterangan: '',
                });
            }
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('barang.update-ruangan-stok'), {
            onSuccess: () => {
                setIsModalOpen(false);
                form.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                                Modul Penempatan
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                Cabang &bull; Ruangan &bull; Fisik
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                            Pendataan Barang Berdasarkan Ruangan & Cabang
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Monitoring ketersediaan aset operasional di setiap ruangan pada 3 cabang (Jakarta Timur, Tambun, Salatiga).
                        </p>
                    </div>
                    {canManage && (
                        <button
                            onClick={() => handleOpenModal(null)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition transform hover:-translate-y-0.5"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Alokasikan Barang ke Ruangan</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Pendataan Barang per Ruangan & Cabang" />

            <div className="space-y-6">
                {/* 3 Highlight Cards Sesuai Contoh Catatan Pengguna */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    {/* Highlight 1: Meja di Accounting */}
                    <div className="bg-gradient-to-br from-white to-blue-50/50 p-5 sm:p-6 rounded-2xl border border-blue-200 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-md">
                                    Ruangan Accounting
                                </span>
                                <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-sm font-bold text-slate-700 mt-3">
                                Total Meja di Ruangan Accounting
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-blue-900 mt-1">
                                {metrics.meja_accounting}{' '}
                                <span className="text-base font-semibold text-blue-600">Meja</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 border-t border-blue-100 pt-2.5">
                            Tersebar di Ruang Accounting Jaktim, Tambun & Salatiga
                        </p>
                    </div>

                    {/* Highlight 2: Bangku di Produksi Jaktim */}
                    <div className="bg-gradient-to-br from-white to-amber-50/50 p-5 sm:p-6 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-md">
                                    Cabang Jaktim &bull; Produksi
                                </span>
                                <span className="text-xl">🪑</span>
                            </div>
                            <div className="text-sm font-bold text-slate-700 mt-3">
                                Bangku di Ruang Produksi Jaktim
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-amber-900 mt-1">
                                {metrics.bangku_jaktim_produksi}{' '}
                                <span className="text-base font-semibold text-amber-700">Buah</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 border-t border-amber-100 pt-2.5">
                            Bangku putar operasional line perakitan
                        </p>
                    </div>

                    {/* Highlight 3: Printer di Accounting Salatiga */}
                    <div className="bg-gradient-to-br from-white to-emerald-50/50 p-5 sm:p-6 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                                    Cabang Salatiga &bull; Accounting
                                </span>
                                <PrinterIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="text-sm font-bold text-slate-700 mt-3">
                                Printer di Ruang Accounting Salatiga
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-emerald-900 mt-1">
                                {metrics.printer_salatiga_accounting}{' '}
                                <span className="text-base font-semibold text-emerald-700">Unit</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 border-t border-emerald-100 pt-2.5">
                            Printer multifungsi laser cetak berkas & nota
                        </p>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Filter Cabang */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Cabang:
                            </span>
                            <select
                                value={selectedBranch}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedBranch(val);
                                    setSelectedRoom('ALL');
                                    handleFilterChange(val, 'ALL', searchQuery);
                                }}
                                className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="ALL">Semua Cabang (3 Cabang)</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nama_cabang} ({b.kode_cabang})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Ruangan */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Ruangan:
                            </span>
                            <select
                                value={selectedRoom}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedRoom(val);
                                    handleFilterChange(selectedBranch, val, searchQuery);
                                }}
                                className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="ALL">Semua Ruangan</option>
                                {filterRooms.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.nama_ruangan} ({r.kode_ruangan || '-'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full lg:w-80">
                        <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari barang di ruangan..."
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                handleFilterChange(selectedBranch, selectedRoom, val);
                            }}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                {/* Table Data Penempatan */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-extrabold text-slate-900 text-base">
                                Rincian Alokasi Fisik Barang di Ruangan
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Menampilkan {locations.data?.length || 0} catatan penempatan barang
                            </p>
                        </div>
                    </div>

                    {(!locations.data || locations.data.length === 0) ? (
                        <div className="py-16 text-center text-slate-400 text-sm">
                            Tidak ada data penempatan barang yang sesuai dengan filter.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="py-3.5 px-4 sm:px-6">Cabang</th>
                                        <th className="py-3.5 px-4 sm:px-6">Ruangan</th>
                                        <th className="py-3.5 px-4 sm:px-6">Nama Barang Operasional</th>
                                        <th className="py-3.5 px-4 sm:px-6 text-center">Jumlah Unit</th>
                                        <th className="py-3.5 px-4 sm:px-6">Kondisi</th>
                                        <th className="py-3.5 px-4 sm:px-6">Keterangan</th>
                                        {canManage && (
                                            <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {locations.data.map((loc) => (
                                        <tr key={loc.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <div className="font-bold text-slate-900">
                                                    {loc.branch?.nama_cabang}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono">
                                                    Kode: {loc.branch?.kode_cabang}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-800 text-xs">
                                                    <BuildingOfficeIcon className="w-3.5 h-3.5 text-slate-500" />
                                                    {loc.room?.nama_ruangan}
                                                </span>
                                                {loc.room?.lantai && (
                                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                                        {loc.room.lantai}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <div className="font-bold text-slate-900">
                                                    {loc.item?.nama_barang}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono">
                                                    SKU: {loc.item?.kode_barang} &bull; {loc.item?.kategori}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6 text-center">
                                                <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl text-xs sm:text-sm">
                                                    {loc.jumlah} {loc.item?.satuan || 'Unit'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                                        loc.kondisi === 'Baik'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}
                                                >
                                                    {loc.kondisi}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-500">
                                                {loc.keterangan || '-'}
                                            </td>
                                            {canManage && (
                                                <td className="py-3.5 px-4 sm:px-6 text-right">
                                                    <button
                                                        onClick={() => handleOpenModal(loc)}
                                                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Sesuaikan Unit di Ruangan"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Alokasikan / Sesuaikan Barang di Ruangan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                {editingLocation
                                    ? 'Sesuaikan Barang di Ruangan'
                                    : 'Alokasikan Barang ke Ruangan'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Pilih Barang Operasional
                                </label>
                                <select
                                    disabled={!!editingLocation}
                                    value={form.data.item_id}
                                    onChange={(e) => form.setData('item_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 text-xs py-2.5 px-3 bg-slate-50"
                                    required
                                >
                                    <option value="">-- Pilih Barang --</option>
                                    {items.map((it) => (
                                        <option key={it.id} value={it.id}>
                                            {it.nama_barang} ({it.kode_barang}) - Total Stok: {it.stok}{' '}
                                            {it.satuan}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Cabang Lokasi
                                    </label>
                                    <select
                                        disabled={!!editingLocation}
                                        value={form.data.branch_id}
                                        onChange={(e) => {
                                            const bId = e.target.value;
                                            const b = branches.find((br) => br.id === parseInt(bId));
                                            form.setData({
                                                ...form.data,
                                                branch_id: bId,
                                                room_id: b?.rooms?.[0]?.id || '',
                                            });
                                        }}
                                        className="w-full rounded-xl border border-slate-200 text-xs py-2.5 px-3 bg-slate-50"
                                        required
                                    >
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.nama_cabang}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Ruangan Penempatan
                                    </label>
                                    <select
                                        disabled={!!editingLocation}
                                        value={form.data.room_id}
                                        onChange={(e) => form.setData('room_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 text-xs py-2.5 px-3 bg-slate-50"
                                        required
                                    >
                                        {activeRooms.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.nama_ruangan} ({r.kode_ruangan || '-'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Jumlah Unit di Ruangan
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.jumlah}
                                        onChange={(e) => form.setData('jumlah', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 text-xs py-2.5 px-3"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Kondisi Fisik
                                    </label>
                                    <select
                                        value={form.data.kondisi}
                                        onChange={(e) => form.setData('kondisi', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 text-xs py-2.5 px-3 bg-slate-50"
                                        required
                                    >
                                        <option value="Baik">Baik (Layak Pakai)</option>
                                        <option value="Rusak Ringan">Rusak Ringan</option>
                                        <option value="Dalam Pemeliharaan">Dalam Pemeliharaan</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Catatan / Fungsi Pemakaian
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Contoh: Meja kerja staf accounting atau printer administrasi"
                                    value={form.data.keterangan}
                                    onChange={(e) => form.setData('keterangan', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 text-xs py-2 px-3"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Simpan Data Ruangan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
