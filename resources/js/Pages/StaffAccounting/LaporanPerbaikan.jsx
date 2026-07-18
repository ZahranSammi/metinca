import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { BarChart2, X } from 'lucide-react';
import React, { useState } from 'react';

export default function LaporanPerbaikan({ availableFundRequests = [], reports = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        fund_request_id: '',
        actual_amount: '',
        summary: '',
        proof: null,
    });

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditMode) {
            // Need to use post with _method=PUT to support file uploads in Laravel Inertia
            post(route('staff.laporan-perbaikan.update', editId), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    setIsEditMode(false);
                    setEditId(null);
                    alert('Laporan hasil perbaikan yang direvisi berhasil dikirim ulang!');
                },
            });
        } else {
            post(route('staff.laporan-perbaikan.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    alert('Laporan hasil perbaikan berhasil dikirim!');
                },
            });
        }
    };

    const handleEdit = (report) => {
        setIsEditMode(true);
        setEditId(report.id);
        setData({
            fund_request_id: report.fund_request_id,
            actual_amount: report.actual_amount,
            summary: report.summary,
            proof: null,
        });
        setIsModalOpen(true);
    };

    const handleOpenNew = () => {
        setIsEditMode(false);
        setEditId(null);
        reset();
        setIsModalOpen(true);
    };

    return (
        <AuthenticatedLayout header="Laporan Perbaikan">
            <Head title="Laporan Perbaikan - Staff Accounting" />

            <div className="bg-emerald-50 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-100">
                <div>
                    <h3 className="text-lg font-bold text-emerald-800">Laporan Hasil Perbaikan</h3>
                    <p className="text-emerald-600 mt-1">Kirim bukti pengeluaran aktual untuk perbaikan mesin yang dananya sudah dicairkan dan selesai dikerjakan.</p>
                </div>
                <button
                    onClick={handleOpenNew}
                    disabled={availableFundRequests.length === 0}
                    className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    <BarChart2 className="w-5 h-5 mr-2" />
                    Buat Laporan
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Riwayat Laporan Perbaikan</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mesin</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Biaya Aktual</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada laporan perbaikan yang dikirim.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <React.Fragment key={report.id}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(report.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {report.fund_request?.damage_report?.machine?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                Rp {Number(report.actual_amount || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge status={report.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {report.status === 'Direvisi' && (
                                                    <button
                                                        onClick={() => handleEdit(report)}
                                                        className="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
                                                    >
                                                        Perbaiki Laporan
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {report.status === 'Direvisi' && report.revision_note && (
                                            <tr className="bg-red-50">
                                                <td colSpan="5" className="px-6 py-3 text-sm text-red-700">
                                                    <strong>Catatan Revisi dari Manager Accounting:</strong> {report.revision_note}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Buat Laporan Perbaikan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                            <form onSubmit={submit} encType="multipart/form-data">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                {isEditMode ? 'Perbaiki Laporan Hasil Perbaikan' : 'Buat Laporan Hasil Perbaikan'}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {isEditMode 
                                                    ? 'Perbaiki biaya aktual, ringkasan, atau bukti pengeluaran sesuai catatan revisi.'
                                                    : 'Pilih pengajuan dana yang mesinnya sudah selesai diperbaiki, lalu masukkan biaya aktual.'}
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Pengajuan Dana</label>
                                            <select
                                                value={data.fund_request_id}
                                                onChange={e => setData('fund_request_id', e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl bg-gray-100"
                                                required
                                                disabled={isEditMode}
                                            >
                                                <option value="" disabled>-- Mesin Selesai Diperbaiki --</option>
                                                {isEditMode && reports.find(r => r.id === editId) ? (
                                                    <option value={data.fund_request_id}>
                                                        {reports.find(r => r.id === editId)?.fund_request?.damage_report?.machine?.name}
                                                    </option>
                                                ) : (
                                                    availableFundRequests.map(fr => (
                                                        <option key={fr.id} value={fr.id}>
                                                            LPR-2024-{String(fr.damage_report_id).padStart(3, '0')} | {fr.damage_report?.machine?.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            {errors.fund_request_id && <div className="text-red-500 text-xs mt-1">{errors.fund_request_id}</div>}
                                            {availableFundRequests.length === 0 && (
                                                <p className="text-xs text-amber-600 mt-2">Belum ada mesin yang selesai diperbaiki dan menunggu laporan.</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Biaya Aktual (Rp)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.actual_amount}
                                                onChange={e => setData('actual_amount', e.target.value)}
                                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3"
                                                placeholder="Contoh: 1450000"
                                                required
                                            />
                                            {errors.actual_amount && <div className="text-red-500 text-xs mt-1">{errors.actual_amount}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Ringkasan Hasil Perbaikan</label>
                                            <textarea
                                                rows="3"
                                                value={data.summary}
                                                onChange={e => setData('summary', e.target.value)}
                                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-xl"
                                                placeholder="Rincian pekerjaan, sparepart yang diganti, dsb..."
                                                required
                                            ></textarea>
                                            {errors.summary && <div className="text-red-500 text-xs mt-1">{errors.summary}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Bukti Pengeluaran {isEditMode ? '(Opsional - Upload jika ada perubahan)' : '(Opsional)'}
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setData('proof', e.target.files[0])}
                                                className="mt-1 block w-full text-sm text-gray-600"
                                            />
                                            {errors.proof && <div className="text-red-500 text-xs mt-1">{errors.proof}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                    <button
                                        type="submit"
                                        disabled={processing || (!isEditMode && availableFundRequests.length === 0)}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Memproses...' : (isEditMode ? 'Kirim Ulang Laporan' : 'Kirim Laporan')}
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
