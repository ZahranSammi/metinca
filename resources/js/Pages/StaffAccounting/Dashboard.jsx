import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import { ClipboardList, Clock, CheckCircle, Send } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard({ stats, barData = [], pieData = [] }) {
    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard - Staff Accounting" />

            <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        icon={<ClipboardList className="w-6 h-6" />}
                        iconBgColor="bg-emerald-50"
                        iconColor="text-emerald-500"
                        value={stats?.laporanMasuk || 0}
                        label="Laporan Masuk Baru"
                    />
                    <StatCard 
                        icon={<Clock className="w-6 h-6" />}
                        iconBgColor="bg-amber-50"
                        iconColor="text-amber-500"
                        value={stats?.sedangVerifikasi || 0}
                        label="Laporan Diverifikasi"
                    />
                    <StatCard 
                        icon={<Send className="w-6 h-6" />}
                        iconBgColor="bg-blue-50"
                        iconColor="text-blue-500"
                        value={stats?.menungguApproval || 0}
                        label="Menunggu Approval Dana"
                    />
                    <StatCard 
                        icon={<CheckCircle className="w-6 h-6" />}
                        iconBgColor="bg-purple-50"
                        iconColor="text-purple-500"
                        value={stats?.disetujui || 0}
                        label="Dana Disetujui"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Statistik Pengajuan Dana</h3>
                            <select className="text-sm border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50">
                                <option>Tahun 2024</option>
                                <option>Tahun 2023</option>
                            </select>
                        </div>
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
                                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Status Laporan Perbaikan</h3>
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
