import { Head, usePage } from '@inertiajs/react';
import { 
    Box, 
    AlertTriangle, 
    ClipboardList, 
    TrendingUp,
    TrendingDown,
    ArrowRight,
    ArrowUpRight
} from 'lucide-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import EnterpriseLayout from '@/layouts/EnterpriseLayout';

// Mock Data for Charts
const stockMovementData = [
    { name: 'Nov', incoming: 120, outgoing: 125 },
    { name: 'Dec', incoming: 150, outgoing: 155 },
    { name: 'Jan', incoming: 95, outgoing: 100 },
    { name: 'Feb', incoming: 180, outgoing: 185 },
    { name: 'Mar', incoming: 135, outgoing: 140 },
    { name: 'Apr', incoming: 215, outgoing: 220 },
    { name: 'May', incoming: 175, outgoing: 180 },
];

const stockStatusData = [
    { name: 'Normal', value: 156, color: '#10b981' },
    { name: 'Low Stock', value: 48, color: '#f59e0b' },
    { name: 'Critical', value: 28, color: '#f97316' },
    { name: 'Out of Stock', value: 15, color: '#ef4444' },
];

const categoryData = [
    { name: 'Electronics', value: 45 },
    { name: 'Cleaning', value: 32 },
    { name: 'Safety', value: 17 },
    { name: 'IT Equip.', value: 28 },
    { name: 'Furniture', value: 21 },
    { name: 'Office Supp.', value: 28 },
];

const recentRequests = [
    { id: 'REQ-2025-089', requester: 'Ahmad Fauzi', dept: 'HRD', items: 3, date: 'May 28, 2025', status: 'Pending', statusColor: 'bg-blue-100 text-blue-700' },
    { id: 'REQ-2025-088', requester: 'Dewi Lestari', dept: 'HRD', items: 1, date: 'May 27, 2025', status: 'Approved', statusColor: 'bg-green-100 text-green-700' },
    { id: 'REQ-2025-087', requester: 'Rudi Hartono', dept: 'Operations', items: 5, date: 'May 27, 2025', status: 'Issued', statusColor: 'bg-indigo-100 text-indigo-700' },
    { id: 'REQ-2025-086', requester: 'Maya Putri', dept: 'Finance', items: 2, date: 'May 26, 2025', status: 'Rejected', statusColor: 'bg-rose-100 text-rose-700' },
    { id: 'REQ-2025-085', requester: 'Eko Prasetyo', dept: 'IT', items: 4, date: 'May 25, 2025', status: 'Issued', statusColor: 'bg-indigo-100 text-indigo-700' },
];

const lowStockAlerts = [
    { name: 'USB Flash Drive 32GB', code: 'ELE-003', current: 6, min: 15, status: 'red' },
    { name: 'Filing Cabinet 3 Drawer', code: 'FUR-002', current: 3, min: 8, status: 'red' },
    { name: 'Ballpoint Pen (Box)', code: 'OFF-002', current: 8, min: 20, status: 'orange' },
    { name: 'Keyboard USB', code: 'ELE-002', current: 12, min: 20, status: 'orange' },
    { name: 'HDMI Cable 2m', code: 'IT-001', current: 8, min: 15, status: 'orange' },
];

export default function Dashboard() {
    const user = usePage().props.auth.user;


    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6">
                
                {/* Greeting */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        Good morning, {user.name.split(' ')[0]}! <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Here's what's happening with your inventory today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Box className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                <TrendingUp className="w-3 h-3" />
                                <span>+12 this month</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-extrabold text-slate-800">247</h3>
                            <p className="text-sm font-semibold text-slate-500 mt-1">Total SKU Items</p>
                            <p className="text-xs text-slate-400 mt-1">Across 6 categories</p>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-rose-50 text-rose-600 rounded-lg">
                                <TrendingDown className="w-3 h-3" />
                                <span>+8 from last week</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-extrabold text-slate-800">43</h3>
                            <p className="text-sm font-semibold text-slate-500 mt-1">Low / Critical Stock</p>
                            <p className="text-xs text-slate-400 mt-1">Requires immediate attention</p>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                <TrendingDown className="w-3 h-3" />
                                <span>-3 since yesterday</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-extrabold text-slate-800">12</h3>
                            <p className="text-sm font-semibold text-slate-500 mt-1">Pending Requests</p>
                            <p className="text-xs text-slate-400 mt-1">Awaiting processing</p>
                        </div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                <TrendingUp className="w-3 h-3" />
                                <span>+18% vs last month</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-extrabold text-slate-800">332</h3>
                            <p className="text-sm font-semibold text-slate-500 mt-1">Monthly Transactions</p>
                            <p className="text-xs text-slate-400 mt-1">In + Out this month</p>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Line Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-bold text-slate-800">Stock Movement Trend</h3>
                            <span className="text-xs font-medium text-slate-400">Last 7 months</span>
                        </div>
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stockMovementData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="incoming" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Incoming" />
                                    <Line type="monotone" dataKey="outgoing" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Outgoing" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                                <span className="text-xs font-medium text-slate-600">Incoming</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                                <span className="text-xs font-medium text-slate-600">Outgoing</span>
                            </div>
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                        <h3 className="text-base font-bold text-slate-800 mb-2">Stock Status</h3>
                        <div className="flex-1 min-h-[220px] w-full relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stockStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stockStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Custom Legend */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {stockStatusData.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{item.value}</div>
                                        <div className="text-[10px] text-slate-500 font-medium">{item.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-base font-bold text-slate-800">Inventory by Category</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                                View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Requests */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-bold text-slate-800">Recent Requests</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                                View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentRequests.map((req, idx) => (
                                <div key={idx} className="flex justify-between items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">{req.id}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${req.statusColor}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {req.requester} · {req.dept} · {req.items} items
                                        </p>
                                    </div>
                                    <div className="text-xs font-medium text-slate-400">
                                        {req.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-bold text-slate-800">Low Stock Alerts</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                                View All <ArrowUpRight className="w-3 h-3 group-hover:translate-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {lowStockAlerts.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'red' ? 'bg-rose-500' : 'bg-orange-500'}`}></div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-700">{item.name}</h4>
                                            <p className="text-[10px] font-medium text-slate-400">{item.code}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold">
                                            <span className={item.status === 'red' ? 'text-rose-600' : 'text-orange-500'}>{item.current}</span>
                                            <span className="text-slate-400"> / {item.min}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">current / min</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = (page: any) => <EnterpriseLayout children={page} />;
