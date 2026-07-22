import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { CheckCircle } from 'lucide-react';

export default function DaftarPembelian({ menunggu = [], daftar = [] }) {
    const handleTerima = (id) => {
        if (confirm('Terima pengajuan ini dan masukkan ke daftar pembelian?')) {
            router.put(route('purchasing.daftar-pembelian.terima', id));
        }
    };

    return (
        <AuthenticatedLayout header="Daftar Pembelian">
            <Head title="Daftar Pembelian - Staff Purchasing" />

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Pengajuan Barang Menunggu Diterima</h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{menunggu.length}</span>
            </div>

            <div className="space-y-4 mb-10">
                {menunggu.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        Tidak ada pengajuan barang baru saat ini.
                    </div>
                ) : (
                    menunggu.map((req) => (
                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                        PB-{String(req.id).padStart(4, '0')}
                                    </span>
                                    <Badge status={req.status} />
                                    <span className="text-sm text-gray-400">&bull; {new Date(req.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{req.item_name} &times; {req.quantity}</h4>
                                <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                                <p className="text-xs text-gray-500">Diajukan oleh {req.requester?.name}</p>
                            </div>
                            <button
                                onClick={() => handleTerima(req.id)}
                                className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Terima
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Daftar Pembelian Barang Operasional</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{daftar.length}</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Barang</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requester</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {daftar.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada barang dalam daftar pembelian.
                                    </td>
                                </tr>
                            ) : (
                                daftar.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.item_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.requester?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><Badge status={req.status} /></td>
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
