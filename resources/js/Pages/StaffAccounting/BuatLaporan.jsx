import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { BarChart2, X } from 'lucide-react';
import { useState } from 'react';

export default function BuatLaporan({ fundRequests = [], availableReports = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        damage_report_id: '',
        amount: '',
        description: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('staff.buat-laporan.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                alert('Pengajuan dana berhasil dibuat!');
            },
        });
    };

    return (
        <AuthenticatedLayout header="Buat Laporan">
            <Head title="Buat Laporan - Staff Accounting" />

            <div className="bg-emerald-50 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-100">
                <div>
                    <h3 className="text-lg font-bold text-emerald-800">Laporan Pengajuan Dana</h3>
                    <p className="text-emerald-600 mt-1">Buat pengajuan dana untuk perbaikan mesin yang telah diverifikasi.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                    <BarChart2 className="w-5 h-5 mr-2" />
                    Buat Laporan
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mesin</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nominal</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Approval</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {fundRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada pengajuan dana yang dibuat.
                                    </td>
                                </tr>
                            ) : (
                                fundRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(request.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {request.damage_report?.machine?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            Rp {Number(request.amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge status={request.status} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Buat Laporan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                            <form onSubmit={submit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                Buat Laporan Pengajuan Dana
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Pilih laporan kerusakan yang sudah diverifikasi dan masukkan estimasi biaya.
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Laporan Kerusakan</label>
                                            <select 
                                                value={data.damage_report_id}
                                                onChange={e => setData('damage_report_id', e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl"
                                                required
                                            >
                                                <option value="" disabled>-- Laporan yang Diverifikasi --</option>
                                                {availableReports.map(report => (
                                                    <option key={report.id} value={report.id}>
                                                        LPR-2024-{String(report.id).padStart(3, '0')} | {report.machine?.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.damage_report_id && <div className="text-red-500 text-xs mt-1">{errors.damage_report_id}</div>}
                                            {availableReports.length === 0 && (
                                                <p className="text-xs text-amber-600 mt-2">Tidak ada laporan yang berstatus 'Diverifikasi'. Silakan verifikasi laporan terlebih dahulu.</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal Pengajuan (Rp)</label>
                                            <input 
                                                type="number"
                                                min="0"
                                                value={data.amount}
                                                onChange={e => setData('amount', e.target.value)}
                                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3" 
                                                placeholder="Contoh: 1500000"
                                                required
                                            />
                                            {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Tambahan</label>
                                            <textarea 
                                                rows="3" 
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-xl" 
                                                placeholder="Detail biaya penggantian part atau teknisi..."
                                                required
                                            ></textarea>
                                            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                    <button 
                                        type="submit" 
                                        disabled={processing || availableReports.length === 0}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Ajukan Dana'}
                                    </button>
                                    <button 
                                        onClick={() => setIsModalOpen(false)} 
                                        type="button" 
                                        disabled={processing}
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
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
