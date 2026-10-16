import {
    ArrowRightIcon,
    CheckCircleIcon,
    DownloadIcon,
    FileTextIcon,
    PlusIcon,
    PrinterIcon,
    SearchIcon,
    XMarkIcon,
} from '@/Components/Icons';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function LaporanIndex({ laporans, approvedDocuments, filters }) {
    const user = usePage().props.auth.user;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [verifyingReport, setVerifyingReport] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'ALL');

    const reportList = useMemo(() => {
        return laporans.data ? laporans.data : laporans;
    }, [laporans]);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const total = reportList.length;
        const pending = reportList.filter((r) => r.status === 'SUBMITTED').length;
        const archived = reportList.filter(
            (r) => r.status === 'ARCHIVED' || r.status === 'APPROVED'
        ).length;
        const totalSpend = reportList.reduce(
            (sum, r) => sum + (parseFloat(r.total_pengeluaran) || 0),
            0
        );
        return { total, pending, archived, totalSpend };
    }, [reportList]);

    // Filtered reports
    const filteredReports = useMemo(() => {
        return reportList.filter((item) => {
            const matchesStatus =
                statusFilter === 'ALL' || item.status === statusFilter;

            const q = searchQuery.toLowerCase().trim();
            if (!q) return matchesStatus;

            const matchesNomor = item.nomor_laporan?.toLowerCase().includes(q);
            const matchesJudul = item.judul_laporan?.toLowerCase().includes(q);
            const matchesCreator = item.creator?.name?.toLowerCase().includes(q);

            return matchesStatus && (matchesNomor || matchesJudul || matchesCreator);
        });
    }, [reportList, searchQuery, statusFilter]);

    // Form Create Laporan
    const createReportForm = useForm({
        judul_laporan:
            'Laporan Pembelian Barang Operasional ' +
            new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
        periode_mulai: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split('T')[0],
        periode_selesai: new Date().toISOString().split('T')[0],
        purchase_document_id: '',
        catatan: '',
        status: 'SUBMITTED',
    });

    // Form Manager Review
    const verifyReportForm = useForm({
        action: 'approve',
        catatan: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createReportForm.post(route('laporan.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createReportForm.reset();
            },
        });
    };

    const handleVerifySubmit = (e) => {
        e.preventDefault();
        verifyReportForm.post(route('laporan.verifikasi', verifyingReport.id), {
            onSuccess: () => {
                setVerifyingReport(null);
                verifyReportForm.reset();
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
                            Laporan & Rekapitulasi Pembelian
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Penyusunan berkas rekapitulasi belanja, validasi manajerial, dan pengarsipan digital berkas operasional.
                        </p>
                    </div>
                    {['inventarisir', 'manager_gudang', 'manager_accounting'].includes(user.role) && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-xs transition transform hover:-translate-y-0.5"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Buat Laporan Baru</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Laporan & Rekapitulasi Pembelian" />

            <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Total Berkas Laporan</div>
                        <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{metrics.total}</div>
                        <div className="text-xs text-slate-400 mt-1">Rekapitulasi terdaftar</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-amber-800">Menunggu Review</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-amber-900 mt-2">{metrics.pending}</div>
                        <div className="text-xs text-amber-700 mt-1 font-medium">Menanti persetujuan manager</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-purple-200/80 bg-gradient-to-br from-white to-purple-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-purple-800">Laporan Diarsipkan</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-purple-900 mt-2">{metrics.archived}</div>
                        <div className="text-xs text-purple-700 mt-1 font-medium">Telah sah & disimpan permanen</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Total Nilai Realisasi</div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
                            {formatCurrency(metrics.totalSpend)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Akumulasi seluruh laporan</div>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl text-sm font-semibold overflow-x-auto">
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-5 py-2.5 rounded-lg transition whitespace-nowrap ${
                                statusFilter === 'ALL'
                                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Semua ({metrics.total})
                        </button>
                        <button
                            onClick={() => setStatusFilter('SUBMITTED')}
                            className={`px-5 py-2.5 rounded-lg transition whitespace-nowrap ${
                                statusFilter === 'SUBMITTED'
                                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Menunggu Review ({metrics.pending})
                        </button>
                        <button
                            onClick={() => setStatusFilter('ARCHIVED')}
                            className={`px-5 py-2.5 rounded-lg transition whitespace-nowrap ${
                                statusFilter === 'ARCHIVED'
                                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Diarsipkan ({metrics.archived})
                        </button>
                    </div>

                    <div className="relative w-full md:w-80">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari no. laporan, judul, pembuat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>
                </div>

                {/* Table of Reports */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                    <th className="py-4 px-5">No. Laporan</th>
                                    <th className="py-4 px-5">Judul & Periode Rekap</th>
                                    <th className="py-4 px-5">Total Pengeluaran</th>
                                    <th className="py-4 px-5">Disusun Oleh</th>
                                    <th className="py-4 px-5">Status Laporan</th>
                                    <th className="py-4 px-5 text-right">Tindakan & Ekspor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-16 text-center text-slate-400 text-sm">
                                            Tidak ada data laporan yang sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-4 px-5 align-top">
                                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                                                    {item.nomor_laporan}
                                                </span>
                                                <div className="text-slate-400 text-xs mt-1.5 font-medium">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                            </td>

                                            <td className="py-4 px-5 align-top">
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {item.judul_laporan}
                                                </div>
                                                <div className="text-slate-500 text-xs mt-1">
                                                    Periode: {item.periode_mulai} s.d {item.periode_selesai}
                                                </div>
                                            </td>

                                            <td className="py-4 px-5 align-top">
                                                <span className="font-mono font-bold text-slate-900 text-sm">
                                                    {formatCurrency(item.total_pengeluaran)}
                                                </span>
                                            </td>

                                            <td className="py-4 px-5 align-top">
                                                <div className="font-semibold text-slate-800 text-sm">
                                                    {item.creator?.name}
                                                </div>
                                                <div className="text-slate-400 text-xs mt-0.5">
                                                    Petugas Inventarisir
                                                </div>
                                            </td>

                                            <td className="py-4 px-5 align-top">
                                                <StatusBadge status={item.status} />
                                            </td>

                                            <td className="py-4 px-5 text-right align-top space-x-2">
                                                {/* Manager / Direktur Review */}
                                                {['manager_gudang', 'manager_accounting', 'direktur_sdm'].includes(user.role) &&
                                                    item.status === 'SUBMITTED' && (
                                                        <button
                                                            onClick={() => setVerifyingReport(item)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
                                                        >
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            <span>Review & Arsipkan</span>
                                                        </button>
                                                    )}

                                                {/* Print HTML/PDF */}
                                                <a
                                                    href={route('laporan.export', {
                                                        id: item.id,
                                                        type: 'html',
                                                    })}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition"
                                                    title="Cetak Berkas PDF"
                                                >
                                                    <PrinterIcon className="w-4 h-4" />
                                                    <span>Cetak</span>
                                                </a>

                                                {/* Export CSV */}
                                                <a
                                                    href={route('laporan.export', {
                                                        id: item.id,
                                                        type: 'csv',
                                                    })}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs sm:text-sm transition"
                                                    title="Ekspor ke Excel CSV"
                                                >
                                                    <DownloadIcon className="w-4 h-4" />
                                                    <span>CSV</span>
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Create Laporan */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg">
                                    Susun Catatan Laporan Pembelian
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Rekapitulasi transaksi pembelian barang untuk diserahkan ke Manager Gudang.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-5 text-sm">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Judul Laporan *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                    value={createReportForm.data.judul_laporan}
                                    onChange={(e) =>
                                        createReportForm.setData('judul_laporan', e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Periode Mulai *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        value={createReportForm.data.periode_mulai}
                                        onChange={(e) =>
                                            createReportForm.setData('periode_mulai', e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Periode Selesai *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        value={createReportForm.data.periode_selesai}
                                        onChange={(e) =>
                                            createReportForm.setData('periode_selesai', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Pilih Dokumen Pembelian Terverifikasi (Opsional)
                                </label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5 bg-white"
                                    value={createReportForm.data.purchase_document_id}
                                    onChange={(e) =>
                                        createReportForm.setData('purchase_document_id', e.target.value)
                                    }
                                >
                                    <option value="">-- Rekap Seluruh Pembelian Pada Periode Ini --</option>
                                    {approvedDocuments.map((doc) => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.nomor_dokumen} &bull; {doc.purchase?.supplier} (
                                            {formatCurrency(doc.purchase?.total_harga)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Catatan / Ringkasan Eksekutif (Opsional)
                                </label>
                                <textarea
                                    rows="3"
                                    className="w-full rounded-xl border border-slate-200 text-sm p-4 bg-white"
                                    placeholder="Keterangan kondisi realisasi pengadaan barang selama periode ini..."
                                    value={createReportForm.data.catatan}
                                    onChange={(e) => createReportForm.setData('catatan', e.target.value)}
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
                                    disabled={createReportForm.processing}
                                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition"
                                >
                                    Serahkan Laporan ke Manager
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Manager Review Laporan */}
            {verifyingReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                Validasi & Pengarsipan Laporan Pembelian
                            </h3>
                            <button
                                onClick={() => setVerifyingReport(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                            <div>
                                <span className="font-semibold text-slate-500">Nomor Laporan:</span>{' '}
                                <span className="font-mono font-bold text-slate-900">
                                    {verifyingReport.nomor_laporan}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-500">Judul:</span>{' '}
                                <span className="font-bold text-slate-900">
                                    {verifyingReport.judul_laporan}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-500">Disusun oleh:</span>{' '}
                                <span className="font-semibold text-slate-800">
                                    {verifyingReport.creator?.name}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-500">Total Pengeluaran:</span>{' '}
                                <span className="font-mono font-bold text-slate-900">
                                    {formatCurrency(verifyingReport.total_pengeluaran)}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleVerifySubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Keputusan Manager Gudang
                                </label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5 bg-white"
                                    value={verifyReportForm.data.action}
                                    onChange={(e) => verifyReportForm.setData('action', e.target.value)}
                                >
                                    <option value="approve">Sesuai &rarr; Sahkan & Arsipkan Berkas (ARCHIVED)</option>
                                    <option value="reject">Tidak Sesuai &rarr; Kembalikan untuk Revisi (REJECTED)</option>
                                </select>
                            </div>

                            {verifyReportForm.data.action === 'reject' ? (
                                <div>
                                    <label className="block font-bold text-rose-700 mb-1.5">
                                        Catatan Alasan Penolakan / Perbaikan *
                                    </label>
                                    <textarea
                                        rows="3"
                                        required
                                        className="w-full rounded-xl border border-rose-300 text-sm p-3.5 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                        placeholder="Tuliskan catatan perbaikan untuk petugas inventarisir..."
                                        value={verifyReportForm.data.catatan}
                                        onChange={(e) => verifyReportForm.setData('catatan', e.target.value)}
                                    ></textarea>
                                </div>
                            ) : (
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Catatan Persetujuan / Pengarsipan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5"
                                        placeholder="Laporan telah diperiksa dan diarsipkan dalam sistem..."
                                        value={verifyReportForm.data.catatan}
                                        onChange={(e) => verifyReportForm.setData('catatan', e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setVerifyingReport(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={verifyReportForm.processing}
                                    className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-xs transition ${
                                        verifyReportForm.data.action === 'approve'
                                            ? 'bg-purple-600 hover:bg-purple-700'
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
        </AuthenticatedLayout>
    );
}
