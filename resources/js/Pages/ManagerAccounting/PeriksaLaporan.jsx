import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { Search, Download, FileSpreadsheet, CheckCircle, ShieldCheck, XCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function PeriksaLaporan({ requests = [], repairReports = [] }) {
    const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);
    
    const { data: revisiData, setData: setRevisiData, put: putRevisi, processing: revisiProcessing, reset: resetRevisi, errors: revisiErrors } = useForm({
        id: '',
        revision_note: ''
    });
    // Menghitung statistik dari laporan yang sudah disetujui (closing selesai)
    const approvedReports = repairReports.filter(r => r.status === 'Disetujui');

    const totalDanaSelesai = approvedReports
        .reduce((sum, r) => sum + Number(r.actual_amount || 0), 0);

    const totalMesinDiperbaiki = approvedReports.length;

    const handleVerifikasi = (id) => {
        if (confirm('Verifikasi laporan hasil perbaikan ini?')) {
            router.put(route('manager-acc.laporan-perbaikan.verifikasi', id));
        }
    };

    const handleSetujui = (id) => {
        if (confirm('Setujui laporan ini? Siklus perbaikan mesin akan ditutup (closing).')) {
            router.put(route('manager-acc.laporan-perbaikan.setujui', id));
        }
    };

    const handleOpenRevisi = (id) => {
        setRevisiData('id', id);
        setIsRevisiModalOpen(true);
    };

    const submitRevisi = (e) => {
        e.preventDefault();
        putRevisi(route('manager-acc.laporan-perbaikan.revisi', revisiData.id), {
            onSuccess: () => {
                setIsRevisiModalOpen(false);
                resetRevisi();
                alert('Laporan dikembalikan untuk direvisi.');
            },
        });
    };

    return (
        <AuthenticatedLayout header="Periksa Laporan">
            <Head title="Periksa Laporan - Manager Accounting" />

            {/* Banner Laporan */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-sm font-semibold text-purple-200 tracking-wider uppercase mb-2">Use Case 4 — Review</h3>
                    <h2 className="text-3xl font-bold mb-4">Laporan Inventaris Kerusakan</h2>
                    <p className="text-purple-100 max-w-2xl mb-8 text-lg">
                        Rekapitulasi seluruh pengajuan dana perbaikan mesin yang telah diajukan dan diproses melalui sistem.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button className="flex items-center px-5 py-2.5 bg-white text-purple-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                            <Download className="w-5 h-5 mr-2" />
                            Cetak PDF
                        </button>
                        <button className="flex items-center px-5 py-2.5 bg-purple-600/30 text-white font-bold rounded-lg shadow-sm hover:bg-purple-600/50 backdrop-blur-sm transition-colors border border-purple-500/30">
                            <FileSpreadsheet className="w-5 h-5 mr-2" />
                            Export Excel
                        </button>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute right-1/4 bottom-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/2"></div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Dana Perbaikan Terserap</p>
                    <h3 className="text-3xl font-bold text-gray-900">Rp {totalDanaSelesai.toLocaleString('id-ID')}</h3>
                    <p className="text-sm text-green-600 mt-2 font-medium">Berdasarkan laporan yang telah disetujui</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Mesin Diperbaiki</p>
                    <h3 className="text-3xl font-bold text-gray-900">{totalMesinDiperbaiki} Unit</h3>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Telah kembali beroperasi normal</p>
                </div>
            </div>

            {/* Verifikasi Akhir / Closing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Verifikasi Akhir (Closing)</h3>
                    <p className="text-sm text-gray-500 mt-1">Laporan pertanggungjawaban dari Staff Accounting atas perbaikan mesin yang sudah selesai.</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {repairReports.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Belum ada laporan perbaikan yang masuk.</div>
                    ) : (
                        repairReports.map((report) => (
                            <div key={report.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-sm font-bold text-purple-700">
                                            LPR-2024-{String(report.fund_request?.damage_report_id).padStart(3, '0')}
                                        </span>
                                        <Badge status={report.status} />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900">{report.fund_request?.damage_report?.machine?.name || 'Unknown'}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{report.summary}</p>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Biaya aktual: <span className="font-medium text-gray-900">Rp {Number(report.actual_amount || 0).toLocaleString('id-ID')}</span>
                                        {' '}&bull; Dilaporkan oleh {report.staff?.name || 'Staff Accounting'}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {report.status === 'Dikirim' && (
                                        <>
                                            <button
                                                onClick={() => handleOpenRevisi(report.id)}
                                                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Minta Revisi
                                            </button>
                                            <button
                                                onClick={() => handleVerifikasi(report.id)}
                                                className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Verifikasi
                                            </button>
                                        </>
                                    )}
                                    {report.status === 'Diverifikasi' && (
                                        <button
                                            onClick={() => handleSetujui(report.id)}
                                            className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                        >
                                            <ShieldCheck className="w-4 h-4 mr-2" />
                                            Setujui & Tutup Siklus
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Tabel Data */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Rincian Pengajuan Dana</h3>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Cari berdasarkan mesin..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Pengajuan</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mesin</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nominal</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Mesin</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada data laporan inventaris.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">LPR-2024-{String(req.damage_report_id).padStart(3, '0')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(req.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.damage_report?.machine?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">Rp {Number(req.amount).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge status={req.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge status={req.damage_report?.status || 'Unknown'} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Minta Revisi */}
            {isRevisiModalOpen && (
                <div className="fixed inset-0 z-[999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsRevisiModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={submitRevisi}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                Minta Revisi Laporan Perbaikan
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Tuliskan alasan kenapa laporan hasil perbaikan ini harus direvisi.
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setIsRevisiModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Revisi</label>
                                        <textarea
                                            rows="4"
                                            value={revisiData.revision_note}
                                            onChange={e => setRevisiData('revision_note', e.target.value)}
                                            className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-xl"
                                            placeholder="Cth: Biaya tidak sesuai dengan tagihan, mohon lampirkan ulang bukti transfer..."
                                            required
                                        ></textarea>
                                        {revisiErrors.revision_note && <div className="text-red-500 text-xs mt-1">{revisiErrors.revision_note}</div>}
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                    <button
                                        type="submit"
                                        disabled={revisiProcessing}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-red-600 text-base font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        {revisiProcessing ? 'Memproses...' : 'Kirim Revisi'}
                                    </button>
                                    <button
                                        onClick={() => setIsRevisiModalOpen(false)}
                                        type="button"
                                        disabled={revisiProcessing}
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
