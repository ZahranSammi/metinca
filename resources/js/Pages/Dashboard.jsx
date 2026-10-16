import {
    ArrowRightIcon,
    CheckCircleIcon,
    ClipboardIcon,
    ClockIcon,
    FileTextIcon,
    PackageIcon,
    PlusIcon,
    ShieldCheckIcon,
    ShoppingCartIcon,
    UsersIcon,
} from '@/Components/Icons';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ metrics, pendingTasks, notifications, recentAudits }) {
    const user = usePage().props.auth.user;

    const getRoleTitle = (role) => {
        switch (role) {
            case 'karyawan':
                return 'Karyawan Divisi Accounting';
            case 'staff_accounting':
                return 'Staff Divisi Accounting';
            case 'staff_gudang':
                return 'Staff Logistik & Gudang';
            case 'inventarisir':
                return 'Petugas Inventarisir Barang';
            case 'manager_accounting':
                return 'Manager Divisi Accounting';
            case 'manager_gudang':
                return 'Manager Gudang & Logistik';
            case 'direktur_sdm':
                return 'Direktur SDM & Umum';
            default:
                return role;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Selamat Datang, {user.name}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Akun Aktif:{' '}
                            <span className="font-semibold text-slate-800">{getRoleTitle(user.role)}</span> &bull; PT
                            Metinca Prima Industrial Works
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {user.role === 'karyawan' || user.role === 'manager_gudang' ? (
                            <Link
                                href={route('pengajuan.index')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-xs transition transform hover:-translate-y-0.5"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>Buat Pengajuan Baru</span>
                            </Link>
                        ) : null}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Inventaris" />

            <div className="space-y-6 sm:space-y-8">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Total Pengajuan */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">Pengajuan Barang</span>
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                <ClipboardIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-3xl sm:text-4xl font-black text-slate-900">{metrics.total_pengajuan}</span>
                            <Link
                                href={route('pengajuan.index')}
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                            >
                                <span>Detail</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Total Pembelian */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">Realisasi Pembelian</span>
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                                <ShoppingCartIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-3xl sm:text-4xl font-black text-slate-900">{metrics.total_pembelian}</span>
                            <Link
                                href={route('pembelian.index')}
                                className="text-sm font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5"
                            >
                                <span>Detail</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Master Stok */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">Data Master Barang</span>
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                                <PackageIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-3xl sm:text-4xl font-black text-slate-900">{metrics.total_barang}</span>
                            <Link
                                href={route('barang.index')}
                                className="text-sm font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5"
                            >
                                <span>Detail</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Laporan Pembelian */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">Arsip Laporan</span>
                            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                                <FileTextIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-3xl sm:text-4xl font-black text-slate-900">{metrics.total_laporan}</span>
                            <Link
                                href={route('laporan.index')}
                                className="text-sm font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
                            >
                                <span>Detail</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Enterprise Operational Cycle Cards */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                    <div className="mb-5">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">
                            Siklus Operasional Pengadaan & Inventaris
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Alur kerja terintegrasi antar divisi di PT Metinca Prima Industrial Works
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                        <Link
                            href={route('pengajuan.index')}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                        Modul 1
                                    </span>
                                    <ClipboardIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-indigo-600 transition">
                                    Pengajuan Pembelian
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                                    Pembuatan dan verifikasi permohonan pengadaan barang operasional kantor.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('pembelian.index')}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                        Modul 2
                                    </span>
                                    <ShoppingCartIcon className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-amber-700 transition">
                                    Realisasi Pembelian
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                                    Pencatatan faktur supplier, nomor nota belanja, dan upload bukti transaksi.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('barang.index')}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                        Modul 3
                                    </span>
                                    <PackageIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-emerald-700 transition">
                                    Verifikasi & Stok
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                                    Pemeriksaan fisik barang oleh inventarisir dan pembaharuan otomatis stok master.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('laporan.index')}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                                        Modul 4
                                    </span>
                                    <FileTextIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-purple-700 transition">
                                    Rekapitulasi & Arsip
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                                    Rekap berkas laporan pembelian, verifikasi pimpinan, dan pengarsipan digital.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Role Specific Tasks & System Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Antrean Tugas Berdasarkan Role */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h2 className="font-extrabold text-slate-900 text-base">
                                Antrean Tugas & Perlu Tindak Lanjut
                            </h2>
                            <span className="text-xs font-semibold text-slate-500">
                                Sesuai Hak Akses
                            </span>
                        </div>

                        {/* Staff Gudang Queues */}
                        {user.role === 'staff_gudang' && (
                            <div className="space-y-3.5">
                                <div className="text-sm font-bold text-slate-700 flex items-center justify-between">
                                    <span>Pengajuan Menunggu Verifikasi</span>
                                    <span className="font-mono bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs border border-amber-200 font-bold">
                                        {pendingTasks.pengajuan_pending_verifikasi?.length || 0} Berkas
                                    </span>
                                </div>
                                {pendingTasks.pengajuan_pending_verifikasi?.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {pendingTasks.pengajuan_pending_verifikasi.map((pr) => (
                                            <div
                                                key={pr.id}
                                                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-sm"
                                            >
                                                <div>
                                                    <div className="font-bold text-slate-900">
                                                        {pr.nomor_pengajuan} &bull; {pr.user?.name}
                                                    </div>
                                                    <div className="text-slate-500 text-xs mt-0.5">
                                                        {pr.items?.length || 0} item barang operasional
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('pengajuan.index')}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs"
                                                >
                                                    <span>Review</span>
                                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 py-4 text-center">
                                        Tidak ada pengajuan yang membutuhkan verifikasi saat ini.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Inventarisir Queues */}
                        {user.role === 'inventarisir' && (
                            <div className="space-y-3.5">
                                <div className="text-sm font-bold text-slate-700 flex items-center justify-between">
                                    <span>Dokumen Pembelian Menunggu Pemeriksaan Stok</span>
                                    <span className="font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs border border-emerald-200 font-bold">
                                        {pendingTasks.dokumen_pending_verifikasi?.length || 0} Berkas
                                    </span>
                                </div>
                                {pendingTasks.dokumen_pending_verifikasi?.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {pendingTasks.dokumen_pending_verifikasi.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-sm"
                                            >
                                                <div>
                                                    <div className="font-bold text-slate-900">
                                                        {doc.nomor_dokumen} &bull; {doc.creator?.name}
                                                    </div>
                                                    <div className="text-slate-500 text-xs mt-0.5">
                                                        Nota: {doc.purchase?.nomor_nota}
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('pembelian.index')}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                                                >
                                                    <span>Periksa</span>
                                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 py-4 text-center">
                                        Tidak ada berkas pembelian yang menunggu verifikasi stok.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Manager Gudang Queues */}
                        {user.role === 'manager_gudang' && (
                            <div className="space-y-3.5">
                                <div className="text-sm font-bold text-slate-700 flex items-center justify-between">
                                    <span>Laporan Menunggu Pengarsipan</span>
                                    <span className="font-mono bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs border border-purple-200 font-bold">
                                        {pendingTasks.laporan_pending_review?.length || 0} Berkas
                                    </span>
                                </div>
                                {pendingTasks.laporan_pending_review?.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {pendingTasks.laporan_pending_review.map((rep) => (
                                            <div
                                                key={rep.id}
                                                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-sm"
                                            >
                                                <div>
                                                    <div className="font-bold text-slate-900">
                                                        {rep.nomor_laporan} &bull; {rep.judul_laporan}
                                                    </div>
                                                    <div className="text-slate-500 text-xs mt-0.5">
                                                        Disusun oleh: {rep.creator?.name}
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('laporan.index')}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs"
                                                >
                                                    <span>Review</span>
                                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 py-4 text-center">
                                        Tidak ada laporan baru yang menunggu persetujuan akhir.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Karyawan Queues */}
                        {user.role === 'karyawan' && (
                            <div className="space-y-3.5">
                                <div className="text-sm font-bold text-slate-700 flex items-center justify-between">
                                    <span>Pengajuan Perlu Revisi</span>
                                    <span className="font-mono bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-xs border border-rose-200 font-bold">
                                        {pendingTasks.pengajuan_butuh_revisi?.length || 0} Berkas
                                    </span>
                                </div>
                                {pendingTasks.pengajuan_butuh_revisi?.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {pendingTasks.pengajuan_butuh_revisi.map((pr) => (
                                            <div
                                                key={pr.id}
                                                className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex items-center justify-between text-sm"
                                            >
                                                <div>
                                                    <div className="font-bold text-rose-900">
                                                        {pr.nomor_pengajuan}
                                                    </div>
                                                    <div className="text-rose-700 text-xs mt-0.5">
                                                        Ada catatan perbaikan dari petugas gudang
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('pengajuan.index')}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs"
                                                >
                                                    <span>Revisi Sekarang</span>
                                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 py-4 text-center">
                                        Tidak ada berkas pengajuan yang ditolak atau membutuhkan revisi.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* System Audit & Activity Logs */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                            <h2 className="font-extrabold text-slate-900 text-base">
                                Catatan Aktivitas Terbaru (Audit Trail)
                            </h2>
                            <Link
                                href={route('audit-logs.index')}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-bold"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                            {recentAudits && recentAudits.length > 0 ? (
                                recentAudits.map((log) => (
                                    <div
                                        key={log.id}
                                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-sm space-y-1"
                                    >
                                        <div className="flex items-center justify-between font-semibold text-slate-800">
                                            <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold">
                                                {log.action}
                                            </span>
                                            <span className="text-slate-400 font-normal text-xs">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="text-slate-600 text-xs sm:text-sm">
                                            Pengguna:{' '}
                                            <span className="font-bold text-slate-900">
                                                {log.user?.name || 'Sistem'}
                                            </span>{' '}
                                            &bull; Entitas:{' '}
                                            <span className="font-mono text-slate-700">
                                                {log.entity_type} #{log.entity_id}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic py-6 text-center">
                                    Belum ada catatan aktivitas terbaru.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
