import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Wrench,
    FileText,
    Settings,
    LogOut,
    Bell,
    ChevronDown,
    Menu,
    X,
    CheckSquare,
    BarChart2,
    History,
    Wallet
} from 'lucide-react';
import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Default title if not provided via header
    const pageTitle = header || "Dashboard";

    const navLinks = [
        ...(user.role === 'manager_maintenance' ? [
            {
                name: 'Dashboard',
                href: route('dashboard'),
                icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
                active: route().current('dashboard')
            },
            {
                name: 'Data Mesin',
                href: route('master-mesin'),
                icon: <Wrench className="w-5 h-5 mr-3" />,
                active: route().current('master-mesin')
            },
            {
                name: 'Laporan Kerusakan',
                href: route('laporan-kerusakan'),
                icon: <FileText className="w-5 h-5 mr-3" />,
                active: route().current('laporan-kerusakan')
            }
        ] : []),
        ...((user.role === 'staff_accounting') ? [
            {
                name: 'Dashboard',
                href: route('staff.dashboard'),
                icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
                active: route().current('staff.dashboard')
            },
            {
                name: 'Verifikasi Laporan',
                href: route('staff.verifikasi-laporan'),
                icon: <CheckSquare className="w-5 h-5 mr-3" />,
                active: route().current('staff.verifikasi-laporan')
            },
            {
                name: 'Buat Laporan',
                href: route('staff.buat-laporan'),
                icon: <FileText className="w-5 h-5 mr-3" />,
                active: route().current('staff.buat-laporan')
            },
            {
                name: 'Laporan Perbaikan',
                href: route('staff.laporan-perbaikan'),
                icon: <BarChart2 className="w-5 h-5 mr-3" />,
                active: route().current('staff.laporan-perbaikan')
            }
        ] : []),
        ...(user.role === 'manager_accounting' ? [
            {
                name: 'Dashboard',
                href: route('dashboard'), // Tetap ke default dashboard (kalau ada) atau ubah nanti
                icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
                active: route().current('dashboard')
            },
            {
                name: 'Approval Dana',
                href: route('manager-acc.approval-dana'),
                icon: <CheckSquare className="w-5 h-5 mr-3" />,
                active: route().current('manager-acc.approval-dana')
            },
            {
                name: 'Periksa Laporan',
                href: route('manager-acc.periksa-laporan'),
                icon: <BarChart2 className="w-5 h-5 mr-3" />,
                active: route().current('manager-acc.periksa-laporan')
            },
            {
                name: 'Histori Perbaikan',
                href: route('manager-acc.histori-perbaikan'),
                icon: <History className="w-5 h-5 mr-3" />,
                active: route().current('manager-acc.histori-perbaikan')
            },
            {
                name: 'Kelola Anggaran',
                href: route('manager-acc.kelola-anggaran'),
                icon: <Wallet className="w-5 h-5 mr-3" />,
                active: route().current('manager-acc.kelola-anggaran')
            }
        ] : [])
    ];

    const sysLinks = [
        {
            name: 'Pengaturan',
            href: route('profile.edit'),
            icon: <Settings className="w-5 h-5 mr-3" />
        }
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="flex items-center justify-center h-20 border-b border-gray-100 px-6">
                    <div className="flex items-center">
                        <div className="bg-blue-600 rounded-lg p-2 mr-3 text-white">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">SIPERBAIK</h1>
                            <p className="text-xs text-gray-500">Inventaris Perbaikan Mesin</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="mb-6 px-2">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                <p className="text-xs text-blue-600">{
                                    user.role === 'manager_maintenance' ? 'Manager Maintenance' :
                                    user.role === 'staff_accounting' ? 'Staff Accounting' :
                                    user.role === 'manager_accounting' ? 'Manager Accounting' : user.role
                                }</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-2">
                        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">MENU UTAMA</p>
                        <nav className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        link.active 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                    {link.active && <ChevronDown className="w-4 h-4 ml-auto transform -rotate-90" />}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-8">
                        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">SISTEM</p>
                        <nav className="space-y-1">
                            {sysLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6 lg:px-8 z-10 shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{pageTitle}</h2>
                            <p className="text-sm text-gray-500">SIPERBAIK &middot; {
                                user.role === 'manager_maintenance' ? 'Manager Maintenance' :
                                user.role === 'staff_accounting' ? 'Staff Accounting' :
                                user.role === 'manager_accounting' ? 'Manager Accounting' : user.role
                            }</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button"
                            className="hidden sm:flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Ganti Peran
                        </Link>
                        
                        <button className="relative p-2 text-gray-400 hover:text-gray-500">
                            <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            <Bell className="w-6 h-6" />
                        </button>

                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:bg-blue-700 transition-colors">
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-[#F4F7FE] p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
