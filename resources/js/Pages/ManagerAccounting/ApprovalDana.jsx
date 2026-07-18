import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { CheckCircle, XCircle, RefreshCcw, Wallet } from 'lucide-react';

export default function ApprovalDana({ requests = [], disbursements = [] }) {
    const handleApproval = (id, status) => {
        if (status === 'Direvisi') {
            const catatan = window.prompt('Catatan revisi untuk Staff Accounting:');
            if (!catatan) return;
            router.put(route('manager-acc.approval-dana.update', id), { status, catatan });
            return;
        }

        if (confirm(`Apakah Anda yakin ingin ${status === 'Disetujui' ? 'menyetujui' : 'menolak'} pengajuan dana ini?`)) {
            router.put(route('manager-acc.approval-dana.update', id), { status });
        }
    };

    const handleCairkan = (id) => {
        if (confirm('Cairkan dana perbaikan untuk pengajuan ini? Anggaran mesin akan dipotong sesuai nominal.')) {
            router.put(route('manager-acc.approval-dana.cairkan', id));
        }
    };

    return (
        <AuthenticatedLayout header="Approval Dana">
            <Head title="Approval Dana - Manager Accounting" />

            <div className="bg-purple-50 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-100">
                <div>
                    <h3 className="text-lg font-bold text-purple-900">Menunggu Keputusan Anda</h3>
                    <p className="text-purple-700 mt-1">Terdapat {requests.length} pengajuan dana perbaikan mesin yang memerlukan persetujuan.</p>
                </div>
            </div>

            <div className="space-y-4 mb-10">
                {requests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        Tidak ada pengajuan dana yang menunggu persetujuan saat ini.
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                                        LPR-2024-{String(req.damage_report_id).padStart(3, '0')}
                                    </span>
                                    <Badge status="Menunggu" />
                                    <span className="text-sm text-gray-400">&bull; {new Date(req.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{req.damage_report?.machine?.name || 'Unknown'}</h4>
                                <p className="text-sm text-gray-600 mb-4">{req.description}</p>

                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Pengajuan</p>
                                        <p className="text-lg font-bold text-gray-900">Rp {Number(req.amount).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Diajukan Oleh</p>
                                        <p className="text-sm font-medium text-gray-900">{req.staff?.name || 'Staff Accounting'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col gap-3">
                                <button
                                    onClick={() => handleApproval(req.id, 'Disetujui')}
                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Setujui Dana
                                </button>
                                <button
                                    onClick={() => handleApproval(req.id, 'Direvisi')}
                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-white text-amber-700 text-sm font-bold border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    Minta Revisi
                                </button>
                                <button
                                    onClick={() => handleApproval(req.id, 'Ditolak')}
                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-white text-gray-700 text-sm font-bold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Tolak Pengajuan
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Cairkan Dana: pengajuan sudah di-ACC, tinggal dicek anggaran & dicairkan */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Menunggu Pencairan Dana</h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{disbursements.length}</span>
            </div>

            <div className="space-y-4">
                {disbursements.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        Tidak ada pengajuan yang menunggu pencairan dana.
                    </div>
                ) : (
                    disbursements.map((req) => (
                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                                        LPR-2024-{String(req.damage_report_id).padStart(3, '0')}
                                    </span>
                                    <Badge status="Disetujui" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{req.damage_report?.machine?.name || 'Unknown'}</h4>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Nominal Disetujui</p>
                                        <p className="text-lg font-bold text-gray-900">Rp {Number(req.amount).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Sisa Anggaran Mesin</p>
                                        <p className="text-sm font-medium text-gray-900">Rp {Number(req.damage_report?.machine?.budget || 0).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleCairkan(req.id)}
                                className="flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Cairkan Dana
                            </button>
                        </div>
                    ))
                )}
            </div>
        </AuthenticatedLayout>
    );
}
