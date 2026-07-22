import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { useState } from 'react';

export default function Index({ fundProposals, filters, summary }) {
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
        <AuthenticatedLayout header="Laporan Pengajuan Dana">
            <Head title="Laporan" />

            <div className="space-y-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-4">Filter Laporan</h3>
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
                                <option value="Diajukan">Diajukan</option>
                                <option value="Menunggu Persetujuan Manager">Menunggu Persetujuan Manager</option>
                                <option value="Direvisi Staff Accounting">Direvisi Staff Accounting</option>
                                <option value="Direvisi Manager">Direvisi Manager</option>
                                <option value="Dana Cair">Dana Cair</option>
                                <option value="Dana Diterima Purchasing">Dana Diterima Purchasing</option>
                                <option value="Selesai Pembelian">Selesai Pembelian</option>
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
                        <div className="text-xs text-gray-500 uppercase">Total Dicairkan (Rp)</div>
                        <div className="text-2xl font-bold text-green-700">Rp {Number(summary.total_dicairkan).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-white shadow-sm rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase">Menunggu / Direvisi</div>
                        <div className="text-2xl font-bold text-gray-900">{summary.total_menunggu} / {summary.total_direvisi}</div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-4">Rincian Pengajuan Dana Pembelian Barang</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barang</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diajukan Oleh</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diproses Oleh</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fundProposals.map((fp) => (
                                    <tr key={fp.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(fp.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fp.purchase_request?.item_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fp.staff_purchasing?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {Number(fp.amount).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Badge status={fp.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fp.manager?.name || '-'}</td>
                                    </tr>
                                ))}
                                {fundProposals.length === 0 && (
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
