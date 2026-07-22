import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import { ClipboardList, Wallet, Package, FileText } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard({ stats, barData = [], pieData = [] }) {
    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard - Staff Accounting" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<ClipboardList className="w-6 h-6" />}
                        iconBgColor="bg-amber-50"
                        iconColor="text-amber-500"
                        value={stats?.menungguVerifikasiDana || 0}
                        label="Menunggu Verifikasi Dana"
                    />
                    <StatCard
                        icon={<Wallet className="w-6 h-6" />}
                        iconBgColor="bg-blue-50"
                        iconColor="text-blue-500"
                        value={stats?.menungguPencairan || 0}
                        label="Menunggu Pencairan"
                    />
                    <StatCard
                        icon={<Package className="w-6 h-6" />}
                        iconBgColor="bg-purple-50"
                        iconColor="text-purple-500"
                        value={stats?.menungguVerifikasiBarang || 0}
                        label="Menunggu Verifikasi Barang"
                    />
                    <StatCard
                        icon={<FileText className="w-6 h-6" />}
                        iconBgColor="bg-emerald-50"
                        iconColor="text-emerald-500"
                        value={stats?.siapDilaporkan || 0}
                        label="Siap Dilaporkan"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Statistik Pengajuan Dana</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                    <Tooltip
                                        cursor={{fill: '#F3F4F6'}}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Status Pencatatan Laporan</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-3">
                            {pieData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
