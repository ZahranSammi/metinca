import { Link, usePage } from '@inertiajs/react';
import { 
    Package, 
    LayoutDashboard, 
    Box, 
    FileText, 
    ChevronLeft, 
    Search, 
    Bell,
    LogOut,
    ChevronDown,
    HelpCircle
} from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';

export default function EnterpriseLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { props, url } = usePage();
    const user = props.auth.user as any;
    
    // Fallback if logout needs direct path
    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (csrfToken) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_token';
            input.value = csrfToken;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="flex h-screen w-full bg-[#f4f7fb] overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="hidden w-64 bg-[#0d2141] flex-col justify-between text-slate-300 md:flex flex-shrink-0 z-20">
                <div>
                    {/* Brand */}
                    <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
                        <div className="flex items-center gap-3 cursor-pointer select-none">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold tracking-wide leading-tight">InvenTrack</span>
                                <span className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold">Enterprise IMS</span>
                            </div>
                        </div>
                        <button className="text-slate-400 hover:text-white transition-colors focus:outline-none">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-4 space-y-1.5 mt-2">
                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm ${
                                url.startsWith('/dashboard')
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>
                        
                        <Link
                            href="/inventory"
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm ${
                                url.startsWith('/inventory')
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Box className="w-5 h-5" />
                                <span>Inventory</span>
                            </div>
                        </Link>
                        
                        <Link
                            href="/requests"
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm ${
                                url.startsWith('/requests')
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5" />
                                <span>Item Requests</span>
                            </div>
                            <span className={`flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] h-5 transition-colors ${
                                url.startsWith('/requests')
                                    ? 'bg-white text-blue-600'
                                    : 'bg-blue-600 text-white'
                            }`}>
                                5
                            </span>
                        </Link>
                    </nav>
                </div>

                {/* Bottom User Profile */}
                <div className="p-4 border-t border-white/5 bg-[#0a1a33]">
                    <div className="flex items-center justify-between p-2 rounded-xl group hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs uppercase shadow-inner">
                                {user.name.substring(0, 2)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-semibold leading-tight">{user.name}</span>
                                <span className="text-xs text-slate-500 font-medium">HRD Staff</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10 sticky top-0">
                    <div className="flex-1 flex items-center max-w-2xl">
                        {header && <div className="hidden lg:block w-1/3 min-w-[200px]">{header}</div>}
                        
                        {/* Search Bar */}
                        <div className="relative w-full max-w-md ml-auto lg:ml-8 group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                className="bg-[#f8fafc] border border-slate-200/80 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 transition-all outline-none shadow-sm"
                                placeholder="Quick search..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5 ml-4">
                        {/* Notification Bell */}
                        <button className="relative text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100 focus:outline-none">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                        </button>

                        {/* Topbar User Profile */}
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm uppercase shadow-sm">
                                {user.name.substring(0, 2)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-800 text-sm font-bold leading-tight">{user.name}</span>
                                <span className="text-xs text-slate-500 font-medium">HRD Staff</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc] p-6 lg:p-8 custom-scrollbar">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
                
                {/* Floating Help Button */}
                <button
                    type="button"
                    className="absolute bottom-6 right-6 flex items-center justify-center w-12 h-12 bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer z-50"
                    title="Help"
                >
                    <HelpCircle className="w-6 h-6" />
                </button>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}
