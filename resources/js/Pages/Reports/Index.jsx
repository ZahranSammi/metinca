import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, fundRequests, filters, summary }) {
    const [form, setForm] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        status: filters.status || '',
    });

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route('reports.index'), form, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Laporan Perbaikan Mesin</h2>}
        >
            <Head title="Laporan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Buat Laporan</h3>
                        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
                                <input
                                    type="date"
                                    value={form.start_date}
                                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    value={form.end_date}
                                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                                    <option value="Disetujui">Disetujui</option>
                                    <option value="Ditolak">Ditolak</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Tampilkan
                            </button>
                            <a
                                href={route('reports.export', form)}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                                Unduh Laporan (CSV)
                            </a>
                        </form>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <div className="text-xs text-gray-500 uppercase">Total Pengajuan</div>
                            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <div className="text-xs text-gray-500 uppercase">Total Nominal Diajukan</div>
                            <div className="text-2xl font-bold text-gray-900">Rp {Number(summary.total_diajukan).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <div className="text-xs text-gray-500 uppercase">Total Disetujui (Rp)</div>
                            <div className="text-2xl font-bold text-green-700">Rp {Number(summary.total_disetujui).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bg-white shadow-sm rounded-lg p-4">
                            <div className="text-xs text-gray-500 uppercase">Menunggu / Ditolak</div>
                            <div className="text-2xl font-bold text-gray-900">{summary.total_menunggu} / {summary.total_ditolak}</div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Rincian Pengajuan Dana Perbaikan</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesin</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diajukan Oleh</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diproses Oleh</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fundRequests.map((req) => (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.damage_report?.machine_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.staff?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {Number(req.amount).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                req.status === 'Disetujui' ? 'bg-green-100 text-green-800' :
                                                req.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.manager?.name || '-'}</td>
                                    </tr>
                                ))}
                                {fundRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data untuk filter ini.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
