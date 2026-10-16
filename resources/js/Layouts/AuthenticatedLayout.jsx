import Dropdown from '@/Components/Dropdown';
import {
    ArrowsRightLeftIcon,
    BellIcon,
    BuildingOfficeIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ClipboardIcon,
    DashboardIcon,
    FileTextIcon,
    LogoutIcon,
    MapPinIcon,
    MenuIcon,
    PackageIcon,
    ShieldCheckIcon,
    ShoppingCartIcon,
    UsersIcon,
    XMarkIcon,
} from '@/Components/Icons';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const getRoleBadge = (role) => {
        switch (role) {
            case 'karyawan':
                return (
                    <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-blue-200">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Karyawan Accounting
                    </span>
                );
            case 'staff_accounting':
                return (
                    <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        Staff Accounting
                    </span>
                );
            case 'staff_gudang':
                return (
                    <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        Staff Gudang
                    </span>
                );
            case 'inventarisir':
                return (
                    <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Petugas Inventarisir
                    </span>
                );
            case 'manager_accounting':
                return (
                    <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-purple-200">
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                        Manager Accounting
                    </span>
                );
            case 'manager_gudang':
                return (
                    <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-purple-200">
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                        Manager Gudang
                    </span>
                );
            case 'direktur_sdm':
                return (
                    <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        Direktur SDM
                    </span>
                );
            default:
                return (
                    <span className="bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-slate-200">
                        {role}
                    </span>
                );
        }
    };

    const [openSubmenus, setOpenSubmenus] = useState({
        barang: true,
        peminjaman: true,
        pengadaan: false,
        laporan: false,
    });

    const toggleSubmenu = (key) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const navigationGroups = [
        {
            groupName: 'Menu Utama',
            items: [
                {
                    type: 'link',
                    name: 'Dashboard',
                    href: route('dashboard'),
                    active: route().current('dashboard'),
                    icon: DashboardIcon,
                },
                {
                    type: 'submenu',
                    id: 'barang',
                    name: 'Data Barang',
                    icon: PackageIcon,
                    active: route().current('barang.*'),
                    children: [
                        {
                            name: 'Master Data Barang',
                            href: route('barang.index'),
                            active: route().current('barang.index'),
                        },
                        {
                            name: 'Pendataan Ruangan & Cabang',
                            href: route('barang.pendataan-ruangan'),
                            active: route().current('barang.pendataan-ruangan'),
                            badge: 'Ruangan',
                        },
                        {
                            name: 'Tracking Posisi Barang',
                            href: route('barang.tracking'),
                            active: route().current('barang.tracking'),
                            badge: 'Tracking',
                        },
                    ],
                },
                {
                    type: 'submenu',
                    id: 'peminjaman',
                    name: 'Peminjaman Antar Cabang',
                    icon: ArrowsRightLeftIcon,
                    active: route().current('peminjaman.*'),
                    children: [
                        {
                            name: 'Monitoring & Pinjam Barang',
                            href: route('peminjaman.index'),
                            active: route().current('peminjaman.*'),
                            badge: '3 Cabang',
                        },
                    ],
                },
                {
                    type: 'submenu',
                    id: 'pengadaan',
                    name: 'Pengadaan & Pembelian',
                    icon: ShoppingCartIcon,
                    active: route().current('pengajuan.*') || route().current('pembelian.*'),
                    children: [
                        {
                            name: 'Pengajuan Pembelian',
                            href: route('pengajuan.index'),
                            active: route().current('pengajuan.*'),
                        },
                        {
                            name: 'Realisasi Pembelian',
                            href: route('pembelian.index'),
                            active: route().current('pembelian.*'),
                        },
                    ],
                },
                {
                    type: 'submenu',
                    id: 'laporan',
                    name: 'Laporan & Arsip',
                    icon: FileTextIcon,
                    active: route().current('laporan.*'),
                    children: [
                        {
                            name: 'Rekap Laporan Pembelian',
                            href: route('laporan.index'),
                            active: route().current('laporan.*'),
                        },
                    ],
                },
            ],
        },
        {
            groupName: 'Sistem & Audit',
            items: [
                ...(['manager_gudang', 'manager_accounting', 'direktur_sdm'].includes(user.role)
                    ? [
                          {
                              type: 'link',
                              name: 'Manajemen Pengguna',
                              href: route('users.index'),
                              active: route().current('users.index'),
                              icon: UsersIcon,
                          },
                      ]
                    : []),
                {
                    type: 'link',
                    name: 'Audit Trail',
                    href: route('audit-logs.index'),
                    active: route().current('audit-logs.index'),
                    icon: ShieldCheckIcon,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-600 selection:text-white">
            {/* Desktop & Mobile Main Shell */}
            <div className="flex flex-1 min-h-screen">
                {/* Mobile Backdrop */}
                {isSidebarOpen && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
                    />
                )}

                {/* Sidebar Navigation */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-slate-300 border-r border-slate-800 transition-all duration-300 lg:static ${
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}
                >
                    {/* Brand / Company Header */}
                    <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/80">
                        <Link href={route('dashboard')} className="flex items-center gap-3.5 overflow-hidden">
                            <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
                                MP
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="leading-tight truncate">
                                    <div className="font-extrabold text-white text-base tracking-tight truncate">
                                        METINCA PRIMA
                                    </div>
                                    <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase truncate mt-0.5">
                                        Inventory System
                                    </div>
                                </div>
                            )}
                        </Link>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Menu with Accordion Submenus */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                        {navigationGroups.map((group) => (
                            <div key={group.groupName}>
                                {!isSidebarCollapsed && (
                                    <div className="px-3 mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        {group.groupName}
                                    </div>
                                )}
                                <nav className="space-y-1.5">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        if (item.type === 'link') {
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    title={isSidebarCollapsed ? item.name : undefined}
                                                    className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                                                        item.active
                                                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                                                            : 'text-slate-300 hover:text-white hover:bg-slate-900'
                                                    } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                                                >
                                                    <Icon
                                                        className={`w-5 h-5 shrink-0 transition-transform ${
                                                            item.active
                                                                ? 'text-white'
                                                                : 'text-slate-400 group-hover:text-white'
                                                        }`}
                                                    />
                                                    {!isSidebarCollapsed && (
                                                        <span className="truncate">{item.name}</span>
                                                    )}
                                                </Link>
                                            );
                                        }

                                        // Submenu with accordion
                                        const isOpen = openSubmenus[item.id];
                                        return (
                                            <div key={item.id} className="space-y-1">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSubmenu(item.id)}
                                                    title={isSidebarCollapsed ? item.name : undefined}
                                                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                                                        item.active
                                                            ? 'bg-slate-900 text-white border border-slate-800 font-bold'
                                                            : 'text-slate-300 hover:text-white hover:bg-slate-900'
                                                    } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <Icon
                                                            className={`w-5 h-5 shrink-0 transition-transform ${
                                                                item.active
                                                                    ? 'text-indigo-400'
                                                                    : 'text-slate-400 group-hover:text-white'
                                                            }`}
                                                        />
                                                        {!isSidebarCollapsed && (
                                                            <span className="truncate">{item.name}</span>
                                                        )}
                                                    </div>
                                                    {!isSidebarCollapsed && (
                                                        <ChevronDownIcon
                                                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                                                isOpen ? 'rotate-180 text-white' : ''
                                                            }`}
                                                        />
                                                    )}
                                                </button>

                                                {isOpen && !isSidebarCollapsed && (
                                                    <div className="pl-3 py-1 space-y-1 ml-4 border-l border-slate-800/80">
                                                        {item.children.map((child) => (
                                                            <Link
                                                                key={child.name}
                                                                href={child.href}
                                                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                                                    child.active
                                                                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                                                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                                                }`}
                                                            >
                                                                <span className="truncate">{child.name}</span>
                                                                {child.badge && (
                                                                    <span
                                                                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                                                            child.active
                                                                                ? 'bg-white/20 text-white'
                                                                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                                                        }`}
                                                                    >
                                                                        {child.badge}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Footer User Card */}
                    <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
                        {!isSidebarCollapsed ? (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0 ring-1 ring-white/10 shadow-xs">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-white truncate">{user.name}</div>
                                        <div className="text-xs text-slate-400 truncate mt-0.5">
                                            {user.jabatan || user.role}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    title="Keluar dari akun"
                                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                >
                                    <LogoutIcon className="w-5 h-5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    title="Keluar"
                                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                >
                                    <LogoutIcon className="w-5 h-5" />
                                </Link>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                    {/* Top App Header */}
                    <header className="h-20 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-10">
                        <div className="flex items-center gap-4">
                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                                title="Buka menu navigasi"
                            >
                                <MenuIcon className="w-6 h-6" />
                            </button>

                            {/* Desktop Collapse Toggle */}
                            <button
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                title={isSidebarCollapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
                            >
                                <MenuIcon className="w-5 h-5" />
                            </button>

                            {/* Organization Breadcrumb */}
                            <div className="hidden sm:flex items-center gap-2.5 text-sm">
                                <span className="font-bold text-slate-800">PT Metinca Prima Industrial Works</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-500 font-medium">Divisi Accounting</span>
                            </div>
                        </div>

                        {/* Right Section: Role Badge & User Dropdown */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden md:block">{getRoleBadge(user.role)}</div>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2.5 p-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-sm font-semibold text-slate-700 focus:outline-hidden">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="hidden sm:block text-left leading-tight">
                                            <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                                            <div className="text-xs text-slate-500 font-normal mt-0.5">{user.email}</div>
                                        </div>
                                        <ChevronDownIcon className="w-4 h-4 text-slate-400 hidden sm:block ml-1" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                        <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                                        <div className="text-slate-500 text-xs truncate mt-0.5">{user.email}</div>
                                        <div className="mt-2">{getRoleBadge(user.role)}</div>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')} className="text-sm">Pengaturan Profil</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="text-sm">
                                        Keluar (Log Out)
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </header>

                    {/* Flash Success Notification */}
                    {flash && flash.success && (
                        <div className="bg-emerald-600 text-white px-5 py-3.5 shadow-sm border-b border-emerald-700 flex items-center justify-between text-sm font-semibold">
                            <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto w-full flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                                <span>{flash.success}</span>
                            </div>
                        </div>
                    )}

                    {/* Page Header (if provided) */}
                    {header && (
                        <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 py-6">
                            <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto">{header}</div>
                        </div>
                    )}

                    {/* Main Content Body */}
                    <main className="flex-1 max-w-7xl 2xl:max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
