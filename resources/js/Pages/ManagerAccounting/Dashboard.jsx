import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import { CheckSquare, FileText, Wallet, Archive } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ stats = {}, lineData = [] }) {
    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard - Manager Accounting" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<CheckSquare className="w-6 h-6" />}
                        iconBgColor="bg-purple-50"
                        iconColor="text-purple-500"
                        value={stats.menungguApprovalDana || 0}
                        label="Menunggu Approval Dana"
                    />
                    <StatCard
                        icon={<FileText className="w-6 h-6" />}
                        iconBgColor="bg-amber-50"
                        iconColor="text-amber-500"
                        value={stats.menungguPeriksaLaporan || 0}
                        label="Menunggu Periksa Laporan"
                    />
                    <StatCard
                        icon={<Wallet className="w-6 h-6" />}
                        iconBgColor="bg-blue-50"
                        iconColor="text-blue-500"
                        value={stats.totalDicairkan || 0}
                        label="Total Dana Dicairkan"
                    />
                    <StatCard
                        icon={<Archive className="w-6 h-6" />}
                        iconBgColor="bg-emerald-50"
                        iconColor="text-emerald-500"
                        value={stats.totalDiarsipkan || 0}
                        label="Total Diarsipkan"
                    />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Dana Dicairkan per Bulan (Rp Juta)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                <Tooltip
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                />
                                <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
