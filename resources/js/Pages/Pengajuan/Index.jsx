import {
    ArrowRightIcon,
    CheckCircleIcon,
    ClockIcon,
    EditIcon,
    EyeIcon,
    FilterIcon,
    PlusIcon,
    SearchIcon,
    TrashIcon,
    XCircleIcon,
    XMarkIcon,
} from '@/Components/Icons';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function PengajuanIndex({ pengajuans, masterItems }) {
    const user = usePage().props.auth.user;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [verifyingItem, setVerifyingItem] = useState(null);
    const [viewHistoryItem, setViewHistoryItem] = useState(null);

    // Search and Status Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const dataList = useMemo(() => {
        return pengajuans.data ? pengajuans.data : pengajuans;
    }, [pengajuans]);

    // Filtered data based on search and status
    const filteredList = useMemo(() => {
        return dataList.filter((item) => {
            const matchesStatus =
                statusFilter === 'ALL' || item.status === statusFilter;

            const q = searchQuery.toLowerCase().trim();
            if (!q) return matchesStatus;

            const matchesNumber = item.nomor_pengajuan?.toLowerCase().includes(q);
            const matchesUser = item.user?.name?.toLowerCase().includes(q);
            const matchesItems = item.items?.some((i) =>
                i.nama_barang?.toLowerCase().includes(q)
            );

            return matchesStatus && (matchesNumber || matchesUser || matchesItems);
        });
    }, [dataList, searchQuery, statusFilter]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const total = dataList.length;
        const pending = dataList.filter((i) => i.status === 'SUBMITTED').length;
        const approved = dataList.filter((i) => i.status === 'APPROVED').length;
        const rejected = dataList.filter((i) => i.status === 'REJECTED').length;
        return { total, pending, approved, rejected };
    }, [dataList]);

    // Form for Create
    const createForm = useForm({
        catatan: '',
        status: 'SUBMITTED',
        items: [
            { item_id: '', nama_barang: '', jumlah: 1, satuan: 'Pcs', alasan_kebutuhan: '', estimasi_harga: 0 },
        ],
    });

    // Form for Edit / Revise
    const editForm = useForm({
        catatan: '',
        resubmit: true,
        items: [],
    });

    // Form for Review / Verification
    const verifyForm = useForm({
        action: 'approve',
        catatan: '',
    });

    const addItemRow = (form) => {
        form.setData('items', [
            ...form.data.items,
            { item_id: '', nama_barang: '', jumlah: 1, satuan: 'Pcs', alasan_kebutuhan: '', estimasi_harga: 0 },
        ]);
    };

    const removeItemRow = (form, index) => {
        if (form.data.items.length <= 1) return;
        const newItems = [...form.data.items];
        newItems.splice(index, 1);
        form.setData('items', newItems);
    };

    const handleMasterItemSelect = (form, index, itemId) => {
        const selected = masterItems.find((i) => String(i.id) === String(itemId));
        const newItems = [...form.data.items];
        if (selected) {
            newItems[index] = {
                ...newItems[index],
                item_id: selected.id,
                nama_barang: selected.nama_barang,
                satuan: selected.satuan,
            };
        } else {
            newItems[index] = { ...newItems[index], item_id: '' };
        }
        form.setData('items', newItems);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('pengajuan.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditOpen = (item) => {
        setEditingItem(item);
        editForm.setData({
            catatan: item.catatan || '',
            resubmit: true,
            items: item.items
                ? item.items.map((i) => ({
                      item_id: i.item_id || '',
                      nama_barang: i.nama_barang,
                      jumlah: i.jumlah,
                      satuan: i.satuan,
                      alasan_kebutuhan: i.alasan_kebutuhan,
                      estimasi_harga: i.estimasi_harga,
                  }))
                : [],
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('pengajuan.update', editingItem.id), {
            onSuccess: () => {
                setEditingItem(null);
            },
        });
    };

    const handleVerifySubmit = (e) => {
        e.preventDefault();
        verifyForm.post(route('pengajuan.verifikasi', verifyingItem.id), {
            onSuccess: () => {
                setVerifyingItem(null);
                verifyForm.reset();
            },
        });
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Pengajuan Pembelian Barang
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola dan pantau permohonan pengadaan barang operasional kantor.
                        </p>
                    </div>
                    {user.role === 'karyawan' || user.role === 'manager_gudang' ? (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Buat Pengajuan Baru</span>
                        </button>
                    ) : null}
                </div>
            }
        >
            <Head title="Pengajuan Pembelian Barang" />

            <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Total Pengajuan</div>
                        <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{metrics.total}</div>
                        <div className="text-xs text-slate-400 mt-1">Seluruh berkas terdaftar</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-amber-800">Menunggu Verifikasi</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-amber-900 mt-2">{metrics.pending}</div>
                        <div className="text-xs text-amber-700 mt-1 font-medium">Perlu tindak lanjut gudang</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-emerald-800">Disetujui (Approved)</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-900 mt-2">{metrics.approved}</div>
                        <div className="text-xs text-emerald-700 mt-1 font-medium">Siap realisasi pembelian</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white to-rose-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-rose-800">Ditolak / Perlu Revisi</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-rose-900 mt-2">{metrics.rejected}</div>
                        <div className="text-xs text-rose-700 mt-1 font-medium">Membutuhkan perbaikan</div>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl overflow-x-auto text-sm font-semibold">
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                                statusFilter === 'ALL'
                                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Semua ({metrics.total})
                        </button>
                        <button
                            onClick={() => setStatusFilter('SUBMITTED')}
                            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                                statusFilter === 'SUBMITTED'
                                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Menunggu Verifikasi ({metrics.pending})
                        </button>
                        <button
                            onClick={() => setStatusFilter('APPROVED')}
                            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                                statusFilter === 'APPROVED'
                                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Disetujui ({metrics.approved})
                        </button>
                        <button
                            onClick={() => setStatusFilter('REJECTED')}
                            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                                statusFilter === 'REJECTED'
                                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Ditolak ({metrics.rejected})
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari no. pengajuan, barang, pemohon..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-[850px]">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                    <th className="py-4 px-5">No. Pengajuan & Tanggal</th>
                                    <th className="py-4 px-5">Pemohon</th>
                                    <th className="py-4 px-5">Item Permintaan Barang</th>
                                    <th className="py-4 px-5">Total Estimasi</th>
                                    <th className="py-4 px-5">Status Verifikasi</th>
                                    <th className="py-4 px-5 text-right">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-16 text-center text-slate-400 text-sm">
                                            Tidak ada data pengajuan pembelian yang sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((item) => {
                                        const totalEst = item.items?.reduce(
                                            (acc, i) => acc + (i.jumlah || 1) * (i.estimasi_harga || 0),
                                            0
                                        );

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                                {/* Nomor & Tanggal */}
                                                <td className="py-4 px-5 align-top">
                                                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                                                        {item.nomor_pengajuan}
                                                    </span>
                                                    <div className="text-slate-400 text-xs mt-1.5 font-medium">
                                                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>

                                                {/* Pemohon */}
                                                <td className="py-4 px-5 align-top">
                                                    <div className="font-bold text-slate-900 text-sm">{item.user?.name}</div>
                                                    <div className="text-slate-400 text-xs mt-0.5">
                                                        {item.user?.jabatan || 'Divisi Accounting'}
                                                    </div>
                                                </td>

                                                {/* Daftar Barang */}
                                                <td className="py-4 px-5 align-top">
                                                    <div className="space-y-2 max-w-md">
                                                        {item.items &&
                                                            item.items.map((i, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="bg-slate-50/90 p-3 rounded-xl border border-slate-200/80"
                                                                >
                                                                    <div className="font-bold text-slate-900 text-sm">
                                                                        {i.nama_barang}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                                        <span className="font-semibold text-slate-800">
                                                                            {i.jumlah} {i.satuan}
                                                                        </span>
                                                                        <span>&bull;</span>
                                                                        <span>Est. {formatCurrency(i.estimasi_harga)}</span>
                                                                    </div>
                                                                    {i.alasan_kebutuhan && (
                                                                        <div className="text-slate-600 italic text-xs mt-1.5 bg-white p-2 rounded-lg border border-slate-100">
                                                                            "{i.alasan_kebutuhan}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                    {item.catatan && (
                                                        <div className="text-slate-600 text-xs mt-2">
                                                            <span className="font-semibold text-slate-800">Catatan:</span>{' '}
                                                            {item.catatan}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Total Estimasi */}
                                                <td className="py-4 px-5 align-top">
                                                    <span className="font-mono font-bold text-slate-900 text-sm">
                                                        {formatCurrency(totalEst)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-5 align-top">
                                                    <StatusBadge status={item.status} />
                                                    {item.review_histories && item.review_histories.length > 0 && (
                                                        <div className="mt-2">
                                                            <button
                                                                onClick={() => setViewHistoryItem(item)}
                                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                                                            >
                                                                Riwayat Verifikasi ({item.review_histories.length})
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Tindakan */}
                                                <td className="py-4 px-5 text-right align-top space-y-1.5">
                                                    {/* Review button for Staff Gudang / Manager */}
                                                    {(user.role === 'staff_gudang' || user.role === 'manager_gudang') &&
                                                        item.status === 'SUBMITTED' && (
                                                            <button
                                                                onClick={() => setVerifyingItem(item)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
                                                            >
                                                                <CheckCircleIcon className="w-4 h-4" />
                                                                <span>Review Kebutuhan</span>
                                                            </button>
                                                        )}

                                                    {/* Revision button for Karyawan / Manager */}
                                                    {(user.role === 'karyawan' || user.role === 'manager_gudang') &&
                                                        item.status === 'REJECTED' && (
                                                            <button
                                                                onClick={() => handleEditOpen(item)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
                                                            >
                                                                <EditIcon className="w-4 h-4" />
                                                                <span>Perbaiki & Kirim Ulang</span>
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
            </div>

            {/* Modal Create Pengajuan */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg">
                                    Formulir Pengajuan Pembelian Barang
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Isi rincian barang operasional kantor yang dibutuhkan.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-5 text-sm">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Catatan / Perihal Kebutuhan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="Contoh: Pengadaan ATK & Perlengkapan Operasional Kantor Bulan Berjalan"
                                    value={createForm.data.catatan}
                                    onChange={(e) => createForm.setData('catatan', e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-slate-800 text-sm">
                                        Rincian Barang Operasional
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => addItemRow(createForm)}
                                        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-bold hover:text-indigo-800"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        <span>Tambah Baris Barang</span>
                                    </button>
                                </div>

                                {createForm.data.items.map((row, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3.5 relative"
                                    >
                                        {createForm.data.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(createForm, idx)}
                                                className="absolute top-3.5 right-3.5 text-rose-500 hover:text-rose-700 text-xs font-bold inline-flex items-center gap-1"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                <span>Hapus</span>
                                            </button>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block font-semibold text-slate-700 mb-1.5">
                                                    Pilih dari Data Barang
                                                </label>
                                                <select
                                                    className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3 bg-white"
                                                    value={row.item_id || ''}
                                                    onChange={(e) =>
                                                        handleMasterItemSelect(createForm, idx, e.target.value)
                                                    }
                                                >
                                                    <option value="">-- Ketik Nama Barang Manual --</option>
                                                    {masterItems &&
                                                        masterItems.map((m) => (
                                                            <option key={m.id} value={m.id}>
                                                                {m.kode_barang} &bull; {m.nama_barang} (Stok: {m.stok}{' '}
                                                                {m.satuan})
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block font-semibold text-slate-700 mb-1.5">
                                                    Nama Barang Operasional *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                                    placeholder="Nama barang yang dibutuhkan..."
                                                    value={row.nama_barang}
                                                    onChange={(e) => {
                                                        const newItems = [...createForm.data.items];
                                                        newItems[idx].nama_barang = e.target.value;
                                                        createForm.setData('items', newItems);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                            <div>
                                                <label className="block font-semibold text-slate-700 mb-1.5">
                                                    Jumlah (Qty) *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                                    value={row.jumlah}
                                                    onChange={(e) => {
                                                        const newItems = [...createForm.data.items];
                                                        newItems[idx].jumlah = parseInt(e.target.value) || 1;
                                                        createForm.setData('items', newItems);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold text-slate-700 mb-1.5">
                                                    Satuan *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                                    placeholder="Rim / Pcs / Box"
                                                    value={row.satuan}
                                                    onChange={(e) => {
                                                        const newItems = [...createForm.data.items];
                                                        newItems[idx].satuan = e.target.value;
                                                        createForm.setData('items', newItems);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold text-slate-700 mb-1.5">
                                                    Estimasi Harga (Rp)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                                    value={row.estimasi_harga}
                                                    onChange={(e) => {
                                                        const newItems = [...createForm.data.items];
                                                        newItems[idx].estimasi_harga =
                                                            parseFloat(e.target.value) || 0;
                                                        createForm.setData('items', newItems);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">
                                                Alasan & Urgensi Kebutuhan *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                                placeholder="Contoh: Stok kertas habis untuk keperluan cetak laporan bulanan"
                                                value={row.alasan_kebutuhan}
                                                onChange={(e) => {
                                                    const newItems = [...createForm.data.items];
                                                    newItems[idx].alasan_kebutuhan = e.target.value;
                                                    createForm.setData('items', newItems);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
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
                                    disabled={createForm.processing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition"
                                >
                                    Kirim Pengajuan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Review / Verification */}
            {verifyingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                Verifikasi Pengajuan Pembelian
                            </h3>
                            <button
                                onClick={() => setVerifyingItem(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                            <div>
                                <span className="font-semibold text-slate-500">Nomor Berkas:</span>{' '}
                                <span className="font-mono font-bold text-slate-900">
                                    {verifyingItem.nomor_pengajuan}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-500">Pemohon:</span>{' '}
                                <span className="font-bold text-slate-900">{verifyingItem.user?.name}</span>
                            </div>
                            <div className="pt-1 font-semibold text-slate-700">Daftar Item:</div>
                            <ul className="list-disc list-inside pl-1 space-y-1 text-slate-600 text-xs sm:text-sm">
                                {verifyingItem.items &&
                                    verifyingItem.items.map((it, i) => (
                                        <li key={i}>
                                            <span className="font-bold text-slate-800">{it.nama_barang}</span> ({it.jumlah}{' '}
                                            {it.satuan}) — <em>"{it.alasan_kebutuhan}"</em>
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        <form onSubmit={handleVerifySubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Keputusan Verifikasi</label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5 bg-white"
                                    value={verifyForm.data.action}
                                    onChange={(e) => verifyForm.setData('action', e.target.value)}
                                >
                                    <option value="approve">Setujui Pengajuan (APPROVED)</option>
                                    <option value="reject">Tolak & Minta Perbaikan (REJECTED)</option>
                                </select>
                            </div>

                            {verifyForm.data.action === 'reject' ? (
                                <div>
                                    <label className="block font-bold text-rose-700 mb-1.5">
                                        Alasan Penolakan & Instruksi Perbaikan (Wajib Diisi) *
                                    </label>
                                    <textarea
                                        rows="3"
                                        required
                                        className="w-full rounded-xl border border-rose-300 text-sm p-3.5 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                        placeholder="Jelaskan alasan penolakan dan instruksi perbaikan untuk pemohon..."
                                        value={verifyForm.data.catatan}
                                        onChange={(e) => verifyForm.setData('catatan', e.target.value)}
                                    ></textarea>
                                </div>
                            ) : (
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Catatan Persetujuan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5"
                                        placeholder="Catatan tambahan untuk proses pembelian..."
                                        value={verifyForm.data.catatan}
                                        onChange={(e) => verifyForm.setData('catatan', e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setVerifyingItem(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={verifyForm.processing}
                                    className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-xs transition ${
                                        verifyForm.data.action === 'approve'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-rose-600 hover:bg-rose-700'
                                    }`}
                                >
                                    Simpan Keputusan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Review History */}
            {viewHistoryItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                Riwayat Verifikasi ({viewHistoryItem.nomor_pengajuan})
                            </h3>
                            <button
                                onClick={() => setViewHistoryItem(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {viewHistoryItem.review_histories.map((rh, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-2"
                                >
                                    <div className="flex items-center justify-between font-bold">
                                        <span className="text-slate-900">
                                            {rh.reviewer?.name} ({rh.reviewer?.role})
                                        </span>
                                        <span className="text-slate-400 text-xs">
                                            {new Date(rh.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="text-slate-600 flex items-center gap-2">
                                        <span>Status:</span>
                                        <StatusBadge status={rh.to_status} size="sm" />
                                    </div>
                                    {rh.catatan && (
                                        <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm italic">
                                            "{rh.catatan}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-3 border-t border-slate-100">
                            <button
                                onClick={() => setViewHistoryItem(null)}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Revise Pengajuan */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                Perbaiki Berkas Pengajuan ({editingItem.nomor_pengajuan})
                            </h3>
                            <button
                                onClick={() => setEditingItem(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Catatan Revisi / Keterangan Perbaikan
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5"
                                    placeholder="Jelaskan perbaikan yang telah dilakukan..."
                                    value={editForm.data.catatan}
                                    onChange={(e) => editForm.setData('catatan', e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                {editForm.data.items.map((row, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block font-semibold text-slate-700 mb-1.5">
                                                    Nama Barang *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                                    value={row.nama_barang}
                                                    onChange={(e) => {
                                                        const newItems = [...editForm.data.items];
                                                        newItems[idx].nama_barang = e.target.value;
                                                        editForm.setData('items', newItems);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold text-slate-700 mb-1.5">
                                                    Jumlah *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                                    value={row.jumlah}
                                                    onChange={(e) => {
                                                        const newItems = [...editForm.data.items];
                                                        newItems[idx].jumlah = parseInt(e.target.value) || 1;
                                                        editForm.setData('items', newItems);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition"
                                >
                                    Kirim Ulang Berkas
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
