import EnterpriseLayout from '@/layouts/EnterpriseLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Eye, 
    Plus, 
    Trash2, 
    Check, 
    Send, 
    FileText,
    History
} from 'lucide-react';
import { toast } from 'sonner';

// Mock Inventory Items for Selection
const inventoryItems = [
    { code: 'OFF-001', name: 'Printer Paper A4 (Ream)', unit: 'Ream' },
    { code: 'OFF-002', name: 'Ballpoint Pen (Box)', unit: 'Box' },
    { code: 'OFF-003', name: 'Stapler Standard', unit: 'Unit' },
    { code: 'OFF-004', name: 'Whiteboard Marker (Set)', unit: 'Set' },
    { code: 'ELE-001', name: 'Mouse Wireless Logitech', unit: 'Unit' },
    { code: 'ELE-002', name: 'Keyboard USB Standard', unit: 'Unit' },
    { code: 'ELE-003', name: 'USB Flash Drive 32GB', unit: 'Unit' },
    { code: 'ELE-004', name: 'HDMI Cable 2m', unit: 'Unit' },
];

interface RequestItem {
    id: string;
    itemCode: string;
    qty: number;
    notes: string;
}

export default function Requests() {
    const user = usePage().props.auth.user;
    
    // Tab State: 'history' or 'new'
    const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
    
    // Pill Filter State
    const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Issued'>('All');

    // Request History Mock Data
    const [requestsList, setRequestsList] = useState([
        { id: 'REQ-2025-089', date: 'May 28, 2025', requester: 'Ahmad Fauzi', dept: 'HRD', items: 3, priority: 'Normal', status: 'Pending', notes: 'For new employee onboarding' },
        { id: 'REQ-2025-088', date: 'May 27, 2025', requester: 'Dewi Lestari', dept: 'HRD', items: 1, priority: 'Urgent', status: 'Approved', notes: 'Replacement for broken unit' },
        { id: 'REQ-2025-086', date: 'May 26, 2025', requester: 'Maya Putri', dept: 'Finance', items: 2, priority: 'Normal', status: 'Rejected', notes: 'Monthly supply restocking' },
        { id: 'REQ-2025-083', date: 'May 22, 2025', requester: 'Budi Hartono', dept: 'Operations', items: 5, priority: 'Critical', status: 'Issued', notes: 'Urgent safety equipment needed' },
        { id: 'REQ-2025-080', date: 'May 19, 2025', requester: 'Sari Dewi', dept: 'IT', items: 2, priority: 'Normal', status: 'Issued', notes: 'PC setup for new staff' }
    ]);

    // New Request Form State
    const [priority, setPriority] = useState('Normal');
    const [reason, setReason] = useState('');
    const [selectedItems, setSelectedItems] = useState<RequestItem[]>([
        { id: '1', itemCode: '', qty: 1, notes: '' }
    ]);

    // Derived filtered requests
    const filteredRequests = requestsList.filter(req => {
        if (statusFilter === 'All') return true;
        return req.status === statusFilter;
    });

    const getPriorityStyle = (p: string) => {
        switch (p) {
            case 'Normal':
                return 'bg-slate-50 text-slate-600 border border-slate-200/80';
            case 'Urgent':
                return 'bg-amber-50 text-amber-600 border border-amber-200';
            case 'Critical':
                return 'bg-rose-50 text-rose-600 border border-rose-200';
            default:
                return 'bg-slate-50 text-slate-500 border border-slate-100';
        }
    };

    const getStatusStyle = (s: string) => {
        switch (s) {
            case 'Pending':
                return 'bg-blue-50 text-blue-600 border border-blue-100';
            case 'Approved':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case 'Rejected':
                return 'bg-rose-50 text-rose-600 border border-rose-100';
            case 'Issued':
                return 'bg-purple-50 text-purple-600 border border-purple-100';
            default:
                return 'bg-slate-50 text-slate-500 border border-slate-100';
        }
    };

    // Add new item row to request form
    const addRequestItem = () => {
        setSelectedItems([
            ...selectedItems,
            { id: Date.now().toString(), itemCode: '', qty: 1, notes: '' }
        ]);
    };

    // Remove item row from request form
    const removeRequestItem = (id: string) => {
        if (selectedItems.length === 1) {
            toast.error('At least one item is required.');
            return;
        }
        setSelectedItems(selectedItems.filter(item => item.id !== id));
    };

    // Update item field in row
    const updateItemField = (id: string, field: keyof RequestItem, value: any) => {
        setSelectedItems(selectedItems.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    // Submit New Request
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const incomplete = selectedItems.some(item => !item.itemCode);
        if (incomplete) {
            toast.error('Please select an item for all rows.');
            return;
        }

        const newId = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
        const newReq = {
            id: newId,
            date: 'May 31, 2026',
            requester: user.name,
            dept: user.email.includes('hrd') ? 'HRD' : user.email.includes('accounting') ? 'Accounting' : 'Management',
            items: selectedItems.reduce((acc, curr) => acc + curr.qty, 0),
            priority,
            status: 'Pending',
            notes: reason || 'N/A'
        };

        setRequestsList([newReq, ...requestsList]);
        
        // Reset form
        setPriority('Normal');
        setReason('');
        setSelectedItems([{ id: '1', itemCode: '', qty: 1, notes: '' }]);
        
        toast.success(`Request ${newId} submitted successfully!`);
        setActiveTab('history');
    };

    const header = (
        <div>
            <h2 className="text-xl font-bold leading-tight text-slate-800">
                Item Requests
            </h2>
            <p className="text-xs text-slate-500 font-medium">Sunday, May 31, 2026</p>
        </div>
    );

    return (
        <>
            <Head title="Item Requests - InvenTrack" />

            <div className="space-y-6">
                {/* Custom Tab Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                            activeTab === 'history'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50/50'
                        }`}
                    >
                        <History className="w-4 h-4" />
                        <span>Request History</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                            activeTab === 'new'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50/50'
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                        <span>+ New Request</span>
                    </button>
                </div>

                {activeTab === 'history' ? (
                    /* Request History View */
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-slate-800">Item Requests</h3>

                            {/* Status Pills */}
                            <div className="flex flex-wrap gap-1.5 bg-slate-50/80 p-1 rounded-xl border border-slate-100 w-fit">
                                {['All', 'Pending', 'Approved', 'Rejected', 'Issued'].map((pill) => (
                                    <button
                                        key={pill}
                                        onClick={() => setStatusFilter(pill as any)}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            statusFilter === pill
                                                ? 'bg-blue-650 text-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {pill}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Requests Table */}
                        <div className="overflow-x-auto -mx-6">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Request No</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Requester</th>
                                        <th className="px-6 py-4">Dept</th>
                                        <th className="px-6 py-4 text-center">Items</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Notes</th>
                                        <th className="px-6 py-4 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/60">
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map((req, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/40 transition-colors text-sm text-slate-650">
                                                <td className="px-6 py-4 font-bold text-blue-605 hover:underline cursor-pointer">
                                                    {req.id}
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 font-medium">{req.date}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-805">{req.requester}</td>
                                                <td className="px-6 py-4">{req.dept}</td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-800">{req.items}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-md ${getPriorityStyle(req.priority)}`}>
                                                        {req.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-lg ${getStatusStyle(req.status)}`}>
                                                        <span className={`w-1 h-1 rounded-full ${
                                                            req.status === 'Pending' ? 'bg-blue-500' :
                                                            req.status === 'Approved' ? 'bg-emerald-500' :
                                                            req.status === 'Rejected' ? 'bg-rose-500' : 'bg-purple-500'
                                                        }`}></span>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 font-medium max-w-[200px] truncate" title={req.notes}>
                                                    {req.notes}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                                                No item requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Create New Request Form View */
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                        <h3 className="text-lg font-bold text-slate-800">New Item Request</h3>

                        {/* Request Header Info Box */}
                        <div className="bg-[#f8fafc] border border-slate-200/60 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requester</span>
                                <div className="text-sm font-bold text-slate-850 mt-1">{user.name}</div>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</span>
                                <div className="text-sm font-bold text-slate-850 mt-1">
                                    {user.email.includes('hrd') ? 'Human Resources' : user.email.includes('accounting') ? 'Accounting' : 'Operations / Management'}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Request Date</span>
                                <div className="text-sm font-bold text-slate-850 mt-1">May 31, 2026</div>
                            </div>
                        </div>

                        {/* Priority and Reasons Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-650 uppercase tracking-wider mb-2">
                                    Priority Level
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 cursor-pointer"
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-650 uppercase tracking-wider mb-2">
                                    Notes / Reason
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Brief description of purpose..."
                                    rows={1}
                                    className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 placeholder:text-slate-400 resize-y"
                                />
                            </div>
                        </div>

                        {/* Requested Items List */}
                        <div className="space-y-4 pt-4 border-t border-slate-100/60">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-slate-800">Requested Items</h4>
                                <button
                                    type="button"
                                    onClick={addRequestItem}
                                    className="flex items-center gap-1 bg-[#f8fafc] hover:bg-slate-100 text-blue-600 font-bold px-3 py-1.5 rounded-lg border border-slate-200/80 text-xs transition cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Item</span>
                                </button>
                            </div>

                            {/* Item Rows */}
                            <div className="space-y-3">
                                {selectedItems.map((item, index) => {
                                    const matchedItem = inventoryItems.find(i => i.code === item.itemCode);
                                    return (
                                        <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-slate-50/40 p-4 rounded-2xl border border-slate-100/80">
                                            {/* Row Index */}
                                            <span className="text-xs font-bold text-slate-400 md:w-6">{index + 1}</span>

                                            {/* Select Item */}
                                            <div className="flex-1 w-full md:max-w-xs">
                                                <select
                                                    value={item.itemCode}
                                                    onChange={(e) => updateItemField(item.id, 'itemCode', e.target.value)}
                                                    className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 cursor-pointer"
                                                >
                                                    <option value="">Select item...</option>
                                                    {inventoryItems.map(invItem => (
                                                        <option key={invItem.code} value={invItem.code}>
                                                            {invItem.name} ({invItem.code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Qty Input */}
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.qty}
                                                    onChange={(e) => updateItemField(item.id, 'qty', parseInt(e.target.value) || 1)}
                                                    className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                                                />
                                            </div>

                                            {/* Unit (Display only) */}
                                            <div className="w-16 text-center text-xs font-bold text-slate-400">
                                                {matchedItem ? matchedItem.unit : '—'}
                                            </div>

                                            {/* Notes Input */}
                                            <div className="flex-1 w-full">
                                                <input
                                                    type="text"
                                                    value={item.notes}
                                                    onChange={(e) => updateItemField(item.id, 'notes', e.target.value)}
                                                    placeholder="Optional note..."
                                                    className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>

                                            {/* Trash button to remove row */}
                                            <button
                                                type="button"
                                                onClick={() => removeRequestItem(item.id)}
                                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition cursor-pointer self-end md:self-auto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Form Submission Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100/60">
                            <button
                                type="button"
                                onClick={() => setActiveTab('history')}
                                className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-2.5 rounded-xl border border-slate-200/80 text-sm transition cursor-pointer"
                            >
                                Save as Draft
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-750 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-600/10 cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                <span>Submit Request</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

Requests.layout = (page: any) => <EnterpriseLayout children={page} />;
