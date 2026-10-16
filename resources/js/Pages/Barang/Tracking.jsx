import {
    AlertTriangleIcon,
    ArrowRightIcon,
    ArrowsRightLeftIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ClockIcon,
    MapPinIcon,
    PackageIcon,
    SearchIcon,
} from '@/Components/Icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Tracking({ items, branches, activeLoans = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('barang.tracking'),
            { search: search || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const itemList = items.data || items;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                                Live Tracking
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                Posisi Fisik Ruangan & Cabang
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                            Tracking & Pelacakan Posisi Barang
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Lacak keberadaan fisik barang operasional di setiap cabang dan ruangan, serta monitoring peminjaman aktif.
                        </p>
                    </div>

                    <Link
                        href={route('peminjaman.index')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition"
                    >
                        <ArrowsRightLeftIcon className="w-5 h-5" />
                        <span>Peminjaman Antar Cabang</span>
                    </Link>
                </div>
            }
        >
            <Head title="Pelacakan & Tracking Posisi Barang" />

            <div className="space-y-6">
                {/* Active Loan Alert Banner if any */}
                {activeLoans.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 shadow-xs">
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
                                <ArrowsRightLeftIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-extrabold text-amber-950 text-sm sm:text-base">
                                        Ada {activeLoans.length} Transaksi Peminjaman Antar Cabang Sedang Berjalan
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                                        Perlu Tracking
                                    </span>
                                </div>
                                <div className="mt-2 space-y-1.5">
                                    {activeLoans.map((loan) => (
                                        <div
                                            key={loan.id}
                                            className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-2"
                                        >
                                            <div className="flex items-center gap-2 font-medium">
                                                <span className="font-mono font-bold text-slate-900">
                                                    {loan.nomor_peminjaman}
                                                </span>
                                                <span>&bull;</span>
                                                <strong className="text-slate-900">
                                                    {loan.jumlah} {loan.item?.satuan || 'Unit'}{' '}
                                                    {loan.item?.nama_barang}
                                                </strong>
                                                <span>dipinjam dari:</span>
                                                <span className="font-semibold text-blue-700">
                                                    {loan.from_branch?.nama_cabang} (
                                                    {loan.from_room?.nama_ruangan})
                                                </span>
                                                <span>➔ Ke:</span>
                                                <span className="font-semibold text-emerald-700">
                                                    {loan.to_branch?.nama_cabang}{' '}
                                                    {loan.to_room
                                                        ? `(${loan.to_room.nama_ruangan})`
                                                        : ''}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-medium">
                                                Peminjam: <strong>{loan.borrower_name}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                        <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari barang untuk melacak lokasi (Printer, Bangku, Meja...)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </form>
                    <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                        Menampilkan {itemList.length} data barang operasional
                    </div>
                </div>

                {/* Items Tracking Cards */}
                <div className="space-y-4">
                    {itemList.map((item) => {
                        const totalAllocated = (item.locations || []).reduce(
                            (sum, l) => sum + (parseInt(l.jumlah) || 0),
                            0
                        );
                        const loansForItem = item.loans || [];

                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4 hover:border-slate-300 transition"
                            >
                                {/* Header Item */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
                                            <PackageIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-extrabold text-slate-900 text-base">
                                                    {item.nama_barang}
                                                </h3>
                                                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                                                    {item.kode_barang}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Kategori: <strong className="text-slate-700">{item.kategori}</strong> &bull; Satuan: {item.satuan}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stok Master Summary */}
                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        <div className="text-right">
                                            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                                                Total Stok Master
                                            </div>
                                            <div className="text-xl sm:text-2xl font-black text-slate-900">
                                                {item.stok}{' '}
                                                <span className="text-xs font-semibold text-slate-500">
                                                    {item.satuan}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Loans for this item */}
                                {loansForItem.length > 0 && (
                                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                            <span>Status Peminjaman Antar Cabang Berjalan:</span>
                                        </div>
                                        {loansForItem.map((loan) => (
                                            <div
                                                key={loan.id}
                                                className="flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2 bg-white/70 p-2 rounded-lg border border-amber-200"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-amber-950">
                                                        {loan.jumlah} {item.satuan}
                                                    </span>
                                                    <span>sedang berada di:</span>
                                                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                                        {loan.to_branch?.nama_cabang} ({loan.to_room?.nama_ruangan || 'Area Operasional'})
                                                    </span>
                                                    <span>(Asal: {loan.from_branch?.nama_cabang} - {loan.from_room?.nama_ruangan})</span>
                                                </div>
                                                <div className="text-slate-500 font-mono text-[11px]">
                                                    Peminjam: {loan.borrower_name} &bull; Pinjam: {loan.tanggal_pinjam}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Location Distribution Grid */}
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                                        <MapPinIcon className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>Lokasi Fisik Barang di Ruangan & Cabang:</span>
                                    </div>

                                    {(!item.locations || item.locations.length === 0) ? (
                                        <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                                            Belum ada pencatatan alokasi ruangan khusus untuk barang ini.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {item.locations.map((loc) => (
                                                <div
                                                    key={loc.id}
                                                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                                                            <span className="text-indigo-700 font-semibold truncate">
                                                                {loc.branch?.nama_cabang}
                                                            </span>
                                                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-mono">
                                                                {loc.branch?.kode_cabang}
                                                            </span>
                                                        </div>
                                                        <div className="font-bold text-slate-900 text-sm mt-1">
                                                            {loc.room?.nama_ruangan}
                                                        </div>
                                                        {loc.room?.lantai && (
                                                            <div className="text-[11px] text-slate-400">
                                                                {loc.room.lantai}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-700">
                                                            Jumlah:
                                                        </span>
                                                        <span className="font-extrabold text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                                                            {loc.jumlah} {item.satuan}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
