import EnterpriseLayout from '@/layouts/EnterpriseLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Search, 
    FileDown, 
    Eye, 
    ChevronLeft, 
    ChevronRight,
    SlidersHorizontal
} from 'lucide-react';

// Mock inventory data
const initialInventory = [
    { code: 'OFF-001', name: 'Printer Paper A4 (Ream)', category: 'Office Supplies', unit: 'Ream', stock: 150, min: 50, status: 'Normal', location: 'Gudang A-1', price: 'Rp 55.000', updated: 'May 28, 2025' },
    { code: 'OFF-002', name: 'Ballpoint Pen (Box)', category: 'Office Supplies', unit: 'Box', stock: 8, min: 28, status: 'Low Stock', location: 'Gudang A-1', price: 'Rp 28.000', updated: 'May 27, 2025' },
    { code: 'OFF-003', name: 'Stapler Standard', category: 'Office Supplies', unit: 'Unit', stock: 0, min: 5, status: 'Out of Stock', location: 'Gudang A-2', price: 'Rp 45.000', updated: 'May 25, 2025' },
    { code: 'OFF-004', name: 'Whiteboard Marker (Set)', category: 'Office Supplies', unit: 'Set', stock: 35, min: 10, status: 'Normal', location: 'Gudang A-1', price: 'Rp 52.000', updated: 'May 26, 2025' },
    { code: 'ELE-001', name: 'Mouse Wireless Logitech', category: 'Electronics', unit: 'Unit', stock: 45, min: 10, status: 'Normal', location: 'Gudang B-1', price: 'Rp 185.000', updated: 'May 28, 2025' },
    { code: 'ELE-002', name: 'Keyboard USB Standard', category: 'Electronics', unit: 'Unit', stock: 12, min: 20, status: 'Low Stock', location: 'Gudang B-1', price: 'Rp 145.000', updated: 'May 27, 2025' },
    { code: 'ELE-003', name: 'USB Flash Drive 32GB', category: 'Electronics', unit: 'Unit', stock: 6, min: 15, status: 'Critical', location: 'Gudang B-2', price: 'Rp 75.000', updated: 'May 26, 2025' },
    { code: 'ELE-004', name: 'HDMI Cable 2m', category: 'Electronics', unit: 'Unit', stock: 28, min: 10, status: 'Normal', location: 'Gudang B-2', price: 'Rp 65.000', updated: 'May 24, 2025' },
    { code: 'SAF-001', name: 'Safety Helmet Yellow', category: 'Safety', unit: 'Unit', stock: 18, min: 10, status: 'Normal', location: 'Gudang C-1', price: 'Rp 120.000', updated: 'May 22, 2025' },
    { code: 'SAF-002', name: 'Safety Vest Orange', category: 'Safety', unit: 'Unit', stock: 4, min: 15, status: 'Low Stock', location: 'Gudang C-1', price: 'Rp 45.000', updated: 'May 21, 2025' },
    { code: 'IT-001', name: 'USB-C Hub Multiport', category: 'IT Equipment', unit: 'Unit', stock: 22, min: 5, status: 'Normal', location: 'Gudang B-1', price: 'Rp 350.000', updated: 'May 20, 2025' },
    { code: 'FUR-001', name: 'Office Chair Ergonomic', category: 'Furniture', unit: 'Unit', stock: 15, min: 5, status: 'Normal', location: 'Gudang D-1', price: 'Rp 1.250.000', updated: 'May 19, 2025' },
    { code: 'FUR-002', name: 'Filing Cabinet 3 Drawer', category: 'Furniture', unit: 'Unit', stock: 3, min: 8, status: 'Critical', location: 'Gudang D-2', price: 'Rp 850.000', updated: 'May 18, 2025' },
    { code: 'OFF-005', name: 'Scissors Medium', category: 'Office Supplies', unit: 'Unit', stock: 40, min: 15, status: 'Normal', location: 'Gudang A-2', price: 'Rp 15.000', updated: 'May 17, 2025' },
    { code: 'CLE-001', name: 'Hand Sanitizer Gel 500ml', category: 'Cleaning', unit: 'Bottle', stock: 50, min: 20, status: 'Normal', location: 'Gudang E-1', price: 'Rp 35.000', updated: 'May 16, 2025' },
    { code: 'CLE-002', name: 'Disinfectant Spray 300ml', category: 'Cleaning', unit: 'Can', stock: 2, min: 10, status: 'Low Stock', location: 'Gudang E-1', price: 'Rp 45.000', updated: 'May 15, 2025' },
    { code: 'ELE-005', name: 'AA Battery (Pack of 4)', category: 'Electronics', unit: 'Pack', stock: 120, min: 30, status: 'Normal', location: 'Gudang A-1', price: 'Rp 24.000', updated: 'May 14, 2025' },
    { code: 'IT-002', name: 'External SSD 1TB', category: 'IT Equipment', unit: 'Unit', stock: 9, min: 10, status: 'Low Stock', location: 'Gudang B-2', price: 'Rp 1.450.000', updated: 'May 13, 2025' },
    { code: 'SAF-003', name: 'First Aid Kit Type A', category: 'Safety', unit: 'Box', stock: 5, min: 5, status: 'Normal', location: 'Gudang C-2', price: 'Rp 220.000', updated: 'May 12, 2025' },
];

export default function Inventory() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Derived statistics from initial dataset
    const stats = useMemo(() => {
        const total = initialInventory.length;
        const normal = initialInventory.filter(item => item.status === 'Normal').length;
        const lowOrCritical = initialInventory.filter(item => item.status === 'Low Stock' || item.status === 'Critical').length;
        const outOfStock = initialInventory.filter(item => item.status === 'Out of Stock').length;
        return { total, normal, lowOrCritical, outOfStock };
    }, []);

    // Filtered items
    const filteredInventory = useMemo(() => {
        return initialInventory.filter((item) => {
            const matchesSearch = 
                item.name.toLowerCase().includes(search.toLowerCase()) || 
                item.code.toLowerCase().includes(search.toLowerCase());
            
            const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
            
            const matchesStatus = statusFilter === 'All' || 
                (statusFilter === 'Low / Critical' ? (item.status === 'Low Stock' || item.status === 'Critical') : item.status === statusFilter);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [search, categoryFilter, statusFilter]);

    // Paginated items
    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
    const paginatedInventory = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredInventory, currentPage]);

    // Handle dropdown transitions resetting page
    const handleCategoryChange = (val: string) => {
        setCategoryFilter(val);
        setCurrentPage(1);
    };

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setCurrentPage(1);
    };

    // Get unique categories for dropdown
    const categories = ['All', 'Office Supplies', 'Electronics', 'Safety', 'IT Equipment', 'Furniture', 'Cleaning'];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Normal':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
            case 'Low Stock':
                return 'bg-amber-50 text-amber-700 border border-amber-100';
            case 'Critical':
                return 'bg-orange-50 text-orange-700 border border-orange-100';
            case 'Out of Stock':
                return 'bg-rose-50 text-rose-700 border border-rose-100';
            default:
                return 'bg-slate-50 text-slate-700 border border-slate-100';
        }
    };

    const header = (
        <div>
            <h2 className="text-xl font-bold leading-tight text-slate-800">
                Inventory Management
            </h2>
            <p className="text-xs text-slate-500 font-medium">Sunday, May 31, 2026</p>
        </div>
    );

    return (
        <>
            <Head title="Inventory - InvenTrack" />

            <div className="space-y-6">
                {/* Stats Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Stat Card: Total */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="text-3xl font-extrabold text-slate-800">{stats.total}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Items</div>
                    </div>
                    {/* Stat Card: Normal */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="text-3xl font-extrabold text-emerald-600">{stats.normal}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Normal</div>
                    </div>
                    {/* Stat Card: Low / Critical */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="text-3xl font-extrabold text-amber-500">{stats.lowOrCritical}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Low / Critical</div>
                    </div>
                    {/* Stat Card: Out of Stock */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="text-3xl font-extrabold text-rose-500">{stats.outOfStock}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Out of Stock</div>
                    </div>
                </div>

                {/* Filter and Control Bar */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search by name or code..."
                                className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900"
                            />
                        </div>

                        {/* Dropdowns & Export */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Category Filter */}
                            <select
                                value={categoryFilter}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="bg-[#f8fafc] border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                            >
                                <option value="All">All Categories</option>
                                {categories.slice(1).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="bg-[#f8fafc] border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                            >
                                <option value="All">All Status</option>
                                <option value="Normal">Normal</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Critical">Critical</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Low / Critical">Low / Critical</option>
                            </select>

                            {/* Export Button */}
                            <button
                                type="button"
                                className="flex items-center gap-2 bg-[#f8fafc] hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm transition cursor-pointer"
                            >
                                <FileDown className="w-4 h-4 text-slate-500" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto -mx-5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-5 py-4">Item Code</th>
                                    <th className="px-5 py-4">Item Name</th>
                                    <th className="px-5 py-4">Category</th>
                                    <th className="px-5 py-4">Unit</th>
                                    <th className="px-5 py-4">Stock</th>
                                    <th className="px-5 py-4">Min</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Location</th>
                                    <th className="px-5 py-4">Unit Price</th>
                                    <th className="px-5 py-4">Last Updated</th>
                                    <th className="px-5 py-4 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {paginatedInventory.length > 0 ? (
                                    paginatedInventory.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/40 transition-colors text-sm text-slate-600">
                                            <td className="px-5 py-4 font-bold text-blue-600 hover:underline cursor-pointer">
                                                {item.code}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-slate-800">
                                                {item.name}
                                            </td>
                                            <td className="px-5 py-4">{item.category}</td>
                                            <td className="px-5 py-4">{item.unit}</td>
                                            <td className={`px-5 py-4 font-bold ${item.stock === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                                {item.stock}
                                            </td>
                                            <td className="px-5 py-4 text-slate-400 font-medium">{item.min}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg ${getStatusStyle(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 font-medium">{item.location}</td>
                                            <td className="px-5 py-4 font-semibold text-slate-800">{item.price}</td>
                                            <td className="px-5 py-4 text-slate-400 font-medium">{item.updated}</td>
                                            <td className="px-5 py-4 text-center">
                                                <button className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="text-center py-10 text-slate-400 font-medium">
                                            No inventory items found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
                        <div className="text-xs font-semibold text-slate-400">
                            Showing {filteredInventory.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                            {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of {filteredInventory.length} items
                        </div>

                        <div className="flex items-center gap-1.5">
                            {/* Previous Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-200/80 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-600" />
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                                        currentPage === idx + 1
                                            ? 'bg-blue-600 border-blue-650 text-white shadow-md shadow-blue-600/10'
                                            : 'border-slate-200/80 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-200/80 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Inventory.layout = (page: any) => <EnterpriseLayout children={page} />;
