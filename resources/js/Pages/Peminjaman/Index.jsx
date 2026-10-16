import {
    AlertTriangleIcon,
    ArrowRightIcon,
    ArrowsRightLeftIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ClockIcon,
    FilterIcon,
    PackageIcon,
    PlusIcon,
    SearchIcon,
    XMarkIcon,
} from '@/Components/Icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function PeminjamanIndex({
    loans,
    branches,
    items,
    metrics,
    filters = {},
}) {
    const user = usePage().props.auth.user;
    const isKaryawan = user?.role === 'karyawan';
    const isReviewer = ['staff_gudang', 'manager_gudang'].includes(user?.role);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'ALL');
    const [selectedBranch, setSelectedBranch] = useState(filters.branch_id || 'ALL');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Form Pengajuan Pinjam
    const form = useForm({
        item_id: items[0]?.id || '',
        jumlah: 1,
        from_branch_id: branches[0]?.id || '',
        from_room_id: branches[0]?.rooms?.[0]?.id || '',
        to_branch_id: branches[1]?.id || '',
        to_room_id: branches[1]?.rooms?.[0]?.id || '',
        borrower_name: user?.name || '',
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        tenggat_kembali: '',
        keterangan: '',
    });

    // Rooms for origin branch
    const originRooms = useMemo(() => {
        if (!form.data.from_branch_id) return [];
        const b = branches.find((br) => br.id === parseInt(form.data.from_branch_id));
        return b?.rooms || [];
    }, [branches, form.data.from_branch_id]);

    // Rooms for destination branch
    const destinationRooms = useMemo(() => {
        if (!form.data.to_branch_id) return [];
        const b = branches.find((br) => br.id === parseInt(form.data.to_branch_id));
        return b?.rooms || [];
    }, [branches, form.data.to_branch_id]);

    const handleFilterChange = (newStatus, newBranch, newSearch) => {
        router.get(
            route('peminjaman.index'),
            {
                status: newStatus !== 'ALL' ? newStatus : undefined,
                branch_id: newBranch !== 'ALL' ? newBranch : undefined,
                search: newSearch || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleOpenCreate = () => {
        form.setData({
            item_id: items[0]?.id || '',
            jumlah: 1,
            from_branch_id: branches[0]?.id || '',
            from_room_id: branches[0]?.rooms?.[0]?.id || '',
            to_branch_id: branches[1]?.id || branches[0]?.id || '',
            to_room_id: branches[1]?.rooms?.[0]?.id || '',
            tanggal_pinjam: new Date().toISOString().split('T')[0],
            tenggat_kembali: '',
            keterangan: '',
        });
        setIsCreateOpen(true);
    };

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        form.post(route('peminjaman.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            },
        });
    };

    const handleReturn = (loanId, loanNo) => {
        if (
            confirm(
                `Konfirmasi pengembalian barang untuk nomor peminjaman ${loanNo}? Stok akan dikembalikan ke cabang dan ruangan semula.`
            )
        ) {
            router.post(route('peminjaman.kembalikan', loanId));
        }
    };

    const handleApprove = (loanId, loanNo) => {
        if (
            confirm(
                `Setujui peminjaman ${loanNo}? Sistem akan memeriksa stok di lokasi asal. Jika stok tidak cukup, pengajuan otomatis ditolak.`
            )
        ) {
            router.post(route('peminjaman.setujui', loanId), {}, { preserveScroll: true });
        }
    };

    const handleReject = (loanId, loanNo) => {
        const alasan = window.prompt(`Alasan menolak peminjaman ${loanNo}:`);
        if (alasan && alasan.trim() !== '') {
            router.post(
                route('peminjaman.tolak', loanId),
                { catatan_review: alasan.trim() },
                { preserveScroll: true }
            );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                                Antar Cabang
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                Jakarta Timur &bull; Tambun &bull; Salatiga
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                            Peminjaman Barang Antar Cabang
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola alur peminjaman peralatan antar cabang perusahaan dengan sistem pelacakan status fisik real-time.
                        </p>
                    </div>

                    {isKaryawan && (
                        <button
                            onClick={handleOpenCreate}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition transform hover:-translate-y-0.5"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Ajukan Peminjaman Barang</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Peminjaman Barang Antar Cabang" />

            <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Total Transaksi Pinjam</div>
                        <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                            {metrics.total_loans}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Seluruh riwayat antar cabang</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-sky-200/80 bg-gradient-to-br from-white to-sky-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-sky-800">Menunggu Pemeriksaan</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-sky-900 mt-2">
                            {metrics.pending_loans}
                        </div>
                        <div className="text-xs text-sky-700 mt-1 font-medium">
                            Pengajuan menunggu cek stok Staff
                        </div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-amber-800">Sedang Dipinjam (Aktif)</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-amber-900 mt-2">
                            {metrics.active_loans}
                        </div>
                        <div className="text-xs text-amber-700 mt-1 font-medium">
                            Barang berada di cabang peminjam
                        </div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-emerald-800">Selesai Dikembalikan</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-900 mt-2">
                            {metrics.returned_loans}
                        </div>
                        <div className="text-xs text-emerald-700 mt-1 font-medium">
                            Unit telah kembali ke cabang asal
                        </div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Total Unit Dipinjam</div>
                        <div className="text-3xl sm:text-4xl font-black text-indigo-700 mt-2">
                            {metrics.total_items_loaned}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Total kuantitas barang fisik</div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Status:
                            </span>
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedStatus(val);
                                    handleFilterChange(val, selectedBranch, searchQuery);
                                }}
                                className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="DIAJUKAN">Menunggu Pemeriksaan</option>
                                <option value="DIPINJAM">Sedang Dipinjam</option>
                                <option value="SELESAI">Selesai Dikembalikan</option>
                                <option value="DITOLAK">Ditolak</option>
                            </select>
                        </div>

                        {/* Branch Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Cabang Terkait:
                            </span>
                            <select
                                value={selectedBranch}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedBranch(val);
                                    handleFilterChange(selectedStatus, val, searchQuery);
                                }}
                                className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="ALL">Semua Cabang</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nama_cabang} ({b.kode_cabang})
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
                            placeholder="Cari no. pinjam, barang, peminjam..."
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                handleFilterChange(selectedStatus, selectedBranch, val);
                            }}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                {/* Table Loans */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-extrabold text-slate-900 text-base">
                                Daftar Riwayat & Tracking Peminjaman Antar Cabang
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Menampilkan {loans.data?.length || 0} transaksi peminjaman aset
                            </p>
                        </div>
                    </div>

                    {(!loans.data || loans.data.length === 0) ? (
                        <div className="py-16 text-center text-slate-400 text-sm">
                            Belum ada catatan peminjaman barang antar cabang.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="py-3.5 px-4 sm:px-6">No. Peminjaman</th>
                                        <th className="py-3.5 px-4 sm:px-6">Barang & Kuantitas</th>
                                        <th className="py-3.5 px-4 sm:px-6">Alur Cabang (Asal ➔ Tujuan)</th>
                                        <th className="py-3.5 px-4 sm:px-6">Peminjam</th>
                                        <th className="py-3.5 px-4 sm:px-6">Periode Pinjam</th>
                                        <th className="py-3.5 px-4 sm:px-6 text-center">Status Tracking</th>
                                        <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {loans.data.map((loan) => (
                                        <tr key={loan.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">
                                                    {loan.nomor_peminjaman}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <div className="font-bold text-slate-900">
                                                    {loan.item?.nama_barang}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                    Jumlah: <strong className="text-indigo-600 font-bold">{loan.jumlah} {loan.item?.satuan || 'Unit'}</strong> &bull; {loan.item?.kategori}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 text-xs">
                                                        {loan.from_branch?.nama_cabang}
                                                    </span>
                                                    <span className="text-slate-400 font-bold">➔</span>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-xs">
                                                        {loan.to_branch?.nama_cabang}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-1">
                                                    Lokasi Asal: {loan.from_room?.nama_ruangan} &bull; Tujuan: {loan.to_room?.nama_ruangan || 'Area Operasional'}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6">
                                                <div className="font-bold text-slate-900">
                                                    {loan.borrower_name}
                                                </div>
                                                {loan.borrower?.jabatan && (
                                                    <div className="text-[11px] text-slate-400">
                                                        {loan.borrower.jabatan}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6 text-xs">
                                                <div>Pinjam: <strong className="text-slate-800">{loan.tanggal_pinjam}</strong></div>
                                                {loan.tenggat_kembali && (
                                                    <div className="text-slate-500 text-[11px] mt-0.5">
                                                        Target: {loan.tenggat_kembali}
                                                    </div>
                                                )}
                                                {loan.tanggal_kembali && (
                                                    <div className="text-emerald-700 font-semibold text-[11px] mt-0.5">
                                                        Kembali: {loan.tanggal_kembali}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6 text-center">
                                                {loan.status === 'DIAJUKAN' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-300">
                                                        <ClockIcon className="w-3.5 h-3.5" />
                                                        Menunggu Pemeriksaan Stok
                                                    </span>
                                                )}
                                                {loan.status === 'DIPINJAM' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                                        Dipinjam di {loan.to_branch?.kode_cabang}
                                                    </span>
                                                )}
                                                {loan.status === 'SELESAI' && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                                        Selesai Dikembalikan
                                                    </span>
                                                )}
                                                {loan.status === 'DITOLAK' && (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            <XMarkIcon className="w-3.5 h-3.5" />
                                                            Ditolak
                                                        </span>
                                                        {loan.catatan_review && (
                                                            <div className="text-[11px] text-rose-600 mt-1 max-w-[220px] mx-auto">
                                                                {loan.catatan_review}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 sm:px-6 text-right">
                                                {loan.status === 'DIAJUKAN' && isReviewer && (
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(loan.id, loan.nomor_peminjaman)
                                                            }
                                                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleReject(loan.id, loan.nomor_peminjaman)
                                                            }
                                                            className="px-3.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}
                                                {loan.status === 'DIAJUKAN' && !isReviewer && (
                                                    <span className="text-xs text-slate-400 italic">
                                                        Menunggu Staff
                                                    </span>
                                                )}
                                                {loan.status === 'DIPINJAM' && isReviewer && (
                                                    <button
                                                        onClick={() =>
                                                            handleReturn(loan.id, loan.nomor_peminjaman)
                                                        }
                                                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                                    >
                                                        Terima Pengembalian
                                                    </button>
                                                )}
                                                {loan.status === 'DIPINJAM' && !isReviewer && (
                                                    <span className="text-xs text-slate-400 italic">
                                                        Sedang dipinjam
                                                    </span>
                                                )}
                                                {(loan.status === 'SELESAI' || loan.status === 'DITOLAK') && (
                                                    <span className="text-xs text-slate-400 italic">
                                                        Arsip
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Buat Peminjaman Antar Cabang */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                    Formulir Peminjaman Barang Antar Cabang
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Peminjaman aset operasional antar cabang Salatiga, Tambun, dan Jakarta Timur
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCreate} className="p-5 sm:p-6 space-y-4">
                            {/* Pilih Barang */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Pilih Barang Operasional
                                    </label>
                                    <select
                                        value={form.data.item_id}
                                        onChange={(e) => form.setData('item_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 text-xs py-2.5 px-3 bg-slate-50"
                                        required
                                    >
                                        {items.map((it) => (
                                            <option key={it.id} value={it.id}>
                                                {it.nama_barang} ({it.kode_barang}) - Total Stok: {it.stok}{' '}
                                                {it.satuan}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Jumlah Pinjam
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.data.jumlah}
                                        onChange={(e) => form.setData('jumlah', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 text-xs py-2.5 px-3"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Cabang Asal */}
                            <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                                    <span>📍</span>
                                    <span>Cabang & Ruangan Asal (Barang Keluar)</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Cabang Asal
                                        </label>
                                        <select
                                            value={form.data.from_branch_id}
                                            onChange={(e) => {
                                                const bId = e.target.value;
                                                const b = branches.find((br) => br.id === parseInt(bId));
                                                form.setData({
                                                    ...form.data,
                                                    from_branch_id: bId,
                                                    from_room_id: b?.rooms?.[0]?.id || '',
                                                });
                                            }}
                                            className="w-full rounded-xl border border-slate-200 text-xs py-2 px-3 bg-white"
                                            required
                                        >
                                            {branches.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.nama_cabang} ({b.kode_cabang})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Ruangan Asal
                                        </label>
                                        <select
                                            value={form.data.from_room_id}
                                            onChange={(e) =>
                                                form.setData('from_room_id', e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 text-xs py-2 px-3 bg-white"
                                            required
                                        >
                                            {originRooms.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.nama_ruangan} ({r.kode_ruangan || '-'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Cabang Tujuan */}
                            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                                <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                    <span>🎯</span>
                                    <span>Cabang & Ruangan Tujuan (Barang Diterima)</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Cabang Tujuan
                                        </label>
                                        <select
                                            value={form.data.to_branch_id}
                                            onChange={(e) => {
                                                const bId = e.target.value;
                                                const b = branches.find((br) => br.id === parseInt(bId));
                                                form.setData({
                                                    ...form.data,
                                                    to_branch_id: bId,
                                                    to_room_id: b?.rooms?.[0]?.id || '',
                                                });
                                            }}
                                            className="w-full rounded-xl border border-slate-200 text-xs py-2 px-3 bg-white"
                                            required
                                        >
                                            {branches.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.nama_cabang} ({b.kode_cabang})
                                                </option>
                                            ))}
                                        </select>
                                        {form.errors.to_branch_id && (
                                            <p className="text-[11px] text-rose-600 mt-1">
                                                {form.errors.to_branch_id}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Ruangan Tujuan
                                        </label>
                                        <select
                                            value={form.data.to_room_id}
                                            onChange={(e) => form.setData('to_room_id', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 text-xs py-2 px-3 bg-white"
                                        >
                                            <option value="">-- Area Operasional Cabang --</option>
                                            {destinationRooms.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.nama_ruangan} ({r.kode_ruangan || '-'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Peminjam & Tanggal */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Karyawan Peminjam
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.name || ''}
                                        readOnly
                                        className="w-full rounded-xl border border-slate-200 text-xs py-2 px-3 bg-slate-100 text-slate-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Tanggal Pinjam
                                    </label>
                                    <input
                                        type="date"
                                        value={form.data.tanggal_pinjam}
                                        onChange={(e) =>
                                            form.setData('tanggal_pinjam', e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 text-xs py-2 px-3"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Target Pengembalian
                                    </label>
                                    <input
                                        type="date"
                                        value={form.data.tenggat_kembali}
                                        onChange={(e) =>
                                            form.setData('tenggat_kembali', e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 text-xs py-2 px-3"
                                    />
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Alasan & Keterangan Peminjaman
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Contoh: Karyawan cabang Jaktim meminjam 10 bangku ke cabang Tambun untuk penambahan kapasitas line shift 2"
                                    value={form.data.keterangan}
                                    onChange={(e) => form.setData('keterangan', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 text-xs py-2 px-3"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Ajukan Peminjaman Antar Cabang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
