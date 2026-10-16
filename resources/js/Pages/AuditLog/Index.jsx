import {
    SearchIcon,
    ShieldCheckIcon,
} from '@/Components/Icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function AuditLogIndex({ logs }) {
    const user = usePage().props.auth.user;
    const [searchQuery, setSearchQuery] = useState('');

    const logList = useMemo(() => {
        return logs.data ? logs.data : logs;
    }, [logs]);

    const filteredLogs = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return logList;

        return logList.filter((log) => {
            const matchesUser = log.user?.name?.toLowerCase().includes(q);
            const matchesAction = log.action?.toLowerCase().includes(q);
            const matchesEntity = log.entity_type?.toLowerCase().includes(q);
            const matchesIp = log.ip_address?.toLowerCase().includes(q);
            return matchesUser || matchesAction || matchesEntity || matchesIp;
        });
    }, [logList, searchQuery]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Audit Trail & Log Aktivitas Sistem
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Pencatatan kronologis otomatis untuk setiap perubahan status dokumen, transaksi, dan data inventaris.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Audit Trail" />

            <div className="space-y-6">
                {/* Search & Counter Toolbar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm font-bold text-slate-700">
                        Total Aktivitas Terdata:{' '}
                        <span className="text-indigo-600 font-black text-base">
                            {logs.total || logList.length} Catatan
                        </span>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari pengguna, aksi, entitas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Audit Log Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-[850px]">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                    <th className="py-4 px-5">Waktu Kejadian</th>
                                    <th className="py-4 px-5">Pengguna (Aktor)</th>
                                    <th className="py-4 px-5">Aksi Workflow</th>
                                    <th className="py-4 px-5">Entitas Terkait & ID</th>
                                    <th className="py-4 px-5">Alamat IP & Perangkat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center text-slate-400 text-sm">
                                            Tidak ada catatan aktivitas yang sesuai dengan kata kunci pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-4 px-5 align-top font-mono text-slate-500 text-xs">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-4 px-5 align-top">
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {log.user?.name || 'Sistem Otomatis'}
                                                </div>
                                                <div className="text-slate-400 text-xs mt-0.5">
                                                    {log.user?.jabatan || 'System Process'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 align-top">
                                                <span className="font-mono bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-xs font-bold border border-indigo-200/60">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 align-top font-mono text-slate-700 text-sm">
                                                <span className="font-semibold">{log.entity_type}</span>{' '}
                                                <span className="text-slate-400 font-normal">#{log.entity_id}</span>
                                            </td>
                                            <td className="py-4 px-5 align-top text-slate-400 text-xs font-mono">
                                                {log.ip_address || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
