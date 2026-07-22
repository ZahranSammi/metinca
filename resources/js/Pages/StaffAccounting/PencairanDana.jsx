import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { Wallet } from 'lucide-react';

export default function PencairanDana({ requests = [] }) {
    const handleCatat = (id) => {
        if (confirm('Catat pencairan dana ini dan teruskan ke Staff Purchasing?')) {
            router.put(route('staff.pencairan-dana.catat', id));
        }
    };

    return (
        <AuthenticatedLayout header="Pencairan Dana">
            <Head title="Pencairan Dana - Staff Accounting" />

            <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900">Dana Sudah Dicairkan Manager Accounting</h3>
                <p className="text-blue-700 mt-1">Catat dana yang keluar lalu teruskan ke Staff Purchasing untuk pembelian barang.</p>
            </div>

            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        Tidak ada dana yang menunggu dicatat saat ini.
                    </div>
                ) : (
                    requests.map((fp) => (
                        <div key={fp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                        PD-{String(fp.id).padStart(4, '0')}
                                    </span>
                                    <Badge status={fp.status} />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{fp.purchase_request?.item_name}</h4>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Nominal Dicairkan</p>
                                        <p className="text-lg font-bold text-gray-900">Rp {Number(fp.amount).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Staff Purchasing</p>
                                        <p className="text-sm font-medium text-gray-900">{fp.staff_purchasing?.name}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCatat(fp.id)}
                                className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Catat & Teruskan
                            </button>
                        </div>
                    ))
                )}
            </div>
        </AuthenticatedLayout>
    );
}
