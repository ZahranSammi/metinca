import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import Badge from '@/Components/Badge';
import { ClipboardList, Clock, Loader, CheckCircle } from 'lucide-react';

export default function Dashboard({ requests = [], stats = {} }) {
    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard - Requester" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<ClipboardList className="w-6 h-6" />}
                        iconBgColor="bg-blue-50"
                        iconColor="text-blue-500"
                        value={stats.totalPengajuan || 0}
                        label="Total Pengajuan"
                    />
                    <StatCard
                        icon={<Clock className="w-6 h-6" />}
                        iconBgColor="bg-amber-50"
                        iconColor="text-amber-500"
                        value={stats.diajukan || 0}
                        label="Menunggu Diterima"
                    />
                    <StatCard
                        icon={<Loader className="w-6 h-6" />}
                        iconBgColor="bg-purple-50"
                        iconColor="text-purple-500"
                        value={stats.dalamProses || 0}
                        label="Dalam Proses"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-6 h-6" />}
                        iconBgColor="bg-emerald-50"
                        iconColor="text-emerald-500"
                        value={stats.selesai || 0}
                        label="Selesai"
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Pengajuan Terbaru</h3>
                        <Link href={route('requester.pengajuan-barang')} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Barang</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-gray-500 text-sm">
                                            Belum ada pengajuan barang.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.item_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><Badge status={req.status} /></td>
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
