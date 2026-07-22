import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { CheckCircle, RefreshCcw } from 'lucide-react';

export default function ApprovalDana({ requests = [] }) {
    const handleSetuju = (id) => {
        if (confirm('Setujui dan cairkan dana pembelian barang ini ke Staff Accounting?')) {
            router.put(route('manager-acc.approval-dana.setuju', id));
        }
    };

    const handleRevisi = (id) => {
        const catatan = window.prompt('Catatan revisi untuk Staff Accounting:');
        if (!catatan) return;
        router.put(route('manager-acc.approval-dana.revisi', id), { catatan });
    };

    return (
        <AuthenticatedLayout header="Approval Dana">
            <Head title="Approval Dana - Manager Accounting" />

            <div className="bg-purple-50 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-100">
                <div>
                    <h3 className="text-lg font-bold text-purple-900">Menunggu Keputusan Anda</h3>
                    <p className="text-purple-700 mt-1">Terdapat {requests.length} pengajuan dana pembelian barang yang memerlukan persetujuan.</p>
                </div>
            </div>

            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        Tidak ada pengajuan dana yang menunggu persetujuan saat ini.
                    </div>
                ) : (
                    requests.map((fp) => (
                        <div key={fp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                                        PD-{String(fp.id).padStart(4, '0')}
                                    </span>
                                    <Badge status={fp.status} />
                                    <span className="text-sm text-gray-400">&bull; {new Date(fp.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{fp.purchase_request?.item_name}</h4>
                                <p className="text-sm text-gray-600 mb-4">{fp.description}</p>

                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Pengajuan</p>
                                        <p className="text-lg font-bold text-gray-900">Rp {Number(fp.amount).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Diajukan Oleh</p>
                                        <p className="text-sm font-medium text-gray-900">{fp.staff_purchasing?.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col gap-3">
                                <button
                                    onClick={() => handleSetuju(fp.id)}
                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Setujui & Cairkan
                                </button>
                                <button
                                    onClick={() => handleRevisi(fp.id)}
                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-white text-amber-700 text-sm font-bold border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    Minta Revisi
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AuthenticatedLayout>
    );
}
