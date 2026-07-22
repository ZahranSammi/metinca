import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import { ClipboardList, Wallet, Loader, Package } from 'lucide-react';

export default function Dashboard({ stats = {} }) {
    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard - Staff Purchasing" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href={route('purchasing.daftar-pembelian')}>
                    <StatCard
                        icon={<ClipboardList className="w-6 h-6" />}
                        iconBgColor="bg-amber-50"
                        iconColor="text-amber-500"
                        value={stats.menungguDiterima || 0}
                        label="Pengajuan Barang Baru"
                    />
                </Link>
                <Link href={route('purchasing.pengajuan-dana')}>
                    <StatCard
                        icon={<Wallet className="w-6 h-6" />}
                        iconBgColor="bg-blue-50"
                        iconColor="text-blue-500"
                        value={stats.menungguPengajuanDana || 0}
                        label="Siap Diajukan Dana"
                    />
                </Link>
                <Link href={route('purchasing.pengajuan-dana')}>
                    <StatCard
                        icon={<Loader className="w-6 h-6" />}
                        iconBgColor="bg-purple-50"
                        iconColor="text-purple-500"
                        value={stats.dalamProsesDana || 0}
                        label="Dana Dalam Proses"
                    />
                </Link>
                <Link href={route('purchasing.data-barang')}>
                    <StatCard
                        icon={<Package className="w-6 h-6" />}
                        iconBgColor="bg-emerald-50"
                        iconColor="text-emerald-500"
                        value={stats.siapDilaporkan || 0}
                        label="Siap Dilaporkan"
                    />
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}
