import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { CheckCircle, RefreshCcw } from 'lucide-react';

export default function VerifikasiDataBarang({ menunggu = [], disetujui = [] }) {
    const handleSetuju = (id) => {
        if (confirm('Setujui laporan dokumen pembelian barang ini?')) {
            router.put(route('staff.verifikasi-data-barang.setuju', id));
        }
    };

    const handleRevisi = (id) => {
        const catatan = window.prompt('Catatan revisi untuk Staff Purchasing:');
        if (!catatan) return;
        router.put(route('staff.verifikasi-data-barang.revisi', id), { catatan });
    };

    return (
        <AuthenticatedLayout header="Verifikasi Data Barang">
            <Head title="Verifikasi Data Barang - Staff Accounting" />

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Menunggu Verifikasi</h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{menunggu.length}</span>
            </div>

            <div className="space-y-4 mb-10">
                {menunggu.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        Tidak ada laporan dokumen pembelian yang menunggu verifikasi.
                    </div>
                ) : (
                    menunggu.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                        DB-{String(doc.id).padStart(4, '0')}
                                    </span>
                                    <Badge status={doc.status} />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{doc.item_name} &times; {doc.quantity}</h4>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Harga</p>
                                        <p className="text-lg font-bold text-gray-900">Rp {Number(doc.total_price).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Staff Purchasing</p>
                                        <p className="text-sm font-medium text-gray-900">{doc.staff_purchasing?.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row md:flex-col gap-3">
                                <button
                                    onClick={() => handleSetuju(doc.id)}
                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Setujui
                                </button>
                                <button
                                    onClick={() => handleRevisi(doc.id)}
                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-white text-amber-700 text-sm font-bold border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    Minta Revisi
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Sudah Disetujui</h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{disetujui.length}</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Barang</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Harga</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {disetujui.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada laporan yang disetujui.
                                    </td>
                                </tr>
                            ) : (
                                disetujui.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.item_name} &times; {doc.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {Number(doc.total_price).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><Badge status={doc.status} /></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
