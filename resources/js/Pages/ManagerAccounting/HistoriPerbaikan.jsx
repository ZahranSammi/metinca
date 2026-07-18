import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { Search, Download } from 'lucide-react';

export default function HistoriPerbaikan({ requests = [] }) {
    return (
        <AuthenticatedLayout header="Histori Perbaikan">
            <Head title="Histori Perbaikan - Manager Accounting" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-purple-600">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Catatan Histori Perbaikan</h3>
                    <p className="text-gray-500 mt-1">Daftar pengajuan dana yang telah disetujui dan proses perbaikannya.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Cetak PDF
                    </button>
                    <button className="flex items-center px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 font-medium rounded-lg hover:bg-purple-100 transition-colors shadow-sm text-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Cari histori..."
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Approve</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mesin</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Biaya Final</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Mesin</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada histori perbaikan yang disetujui.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(req.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {req.damage_report?.machine?.name || 'Unknown'}
                                            <div className="text-xs text-purple-600 mt-1">LPR-2024-{String(req.damage_report_id).padStart(3, '0')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">Rp {Number(req.amount).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge status={req.damage_report?.status || 'Unknown'} />
                                        </td>
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
