import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import Badge from '@/Components/Badge';
import { FileText, CheckCircle, RefreshCcw, XCircle, Edit3 } from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard({ stats, pieData, lineData, actionRequiredReports }) {
    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        icon={<FileText className="w-6 h-6" />}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                        value={stats?.totalLaporan || "0"}
                        label="Laporan Terkirim"
                    />
                    <StatCard 
                        icon={<CheckCircle className="w-6 h-6" />}
                        iconBgColor="bg-emerald-100"
                        iconColor="text-emerald-600"
                        value={stats?.disetujui || "0"}
                        label="Disetujui"
                    />
                    <StatCard 
                        icon={<RefreshCcw className="w-6 h-6" />}
                        iconBgColor="bg-purple-100"
                        iconColor="text-purple-600"
                        value={stats?.perluRevisi || "0"}
                        label="Perlu Revisi"
                    />
                    <StatCard 
                        icon={<XCircle className="w-6 h-6" />}
                        iconBgColor="bg-rose-100"
                        iconColor="text-rose-600"
                        value={stats?.ditolak || "0"}
                        label="Ditolak"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Pengeluaran per Bulan 2024</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `${value}Jt`} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Status Mesin</h3>
                        <div className="h-72 flex flex-col justify-center">
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
                                    <Tooltip />
                                    <Legend 
                                        layout="vertical" 
                                        verticalAlign="middle" 
                                        align="right"
                                        iconType="circle"
                                        formatter={(value, entry) => <span className="text-sm text-gray-600 font-medium ml-1">{value} <span className="text-gray-900 font-bold ml-2">{entry.payload.value}</span></span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Actions List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-2 h-6 bg-amber-400 rounded-full mr-3"></div>
                        <h3 className="text-lg font-bold text-gray-900">Laporan Perlu Tindakan</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {actionRequiredReports && actionRequiredReports.length > 0 ? (
                            actionRequiredReports.map((report) => (
                                <div key={report.id} className={`flex items-center justify-between p-4 rounded-xl border ${report.status === 'Ditolak' ? 'bg-rose-50 border-rose-100' : 'bg-purple-50 border-purple-100'}`}>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-sm font-bold text-gray-900">LPR-{new Date(report.created_at).getFullYear()}-{String(report.id).padStart(3, '0')}</span>
                                            <Badge status={report.status} />
                                        </div>
                                        <h4 className="text-base font-bold text-gray-900">{report.machine?.name || 'Mesin'}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{report.revision_note || 'Mohon periksa kembali laporan Anda.'}</p>
                                    </div>
                                    <Link href={route('laporan-kerusakan')} className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Revisi
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">Tidak ada laporan yang perlu tindakan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
