import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { FileText, X } from 'lucide-react';
import React, { useState } from 'react';

export default function BuatLaporan({ availableDocuments = [], records = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        purchase_document_id: '',
        notes: '',
    });

    const openCreateModal = () => {
        setIsEdit(false);
        setEditId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openReviseModal = (record) => {
        setIsEdit(true);
        setEditId(record.id);
        setData({
            purchase_document_id: record.purchase_document_id,
            notes: record.notes,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('staff.buat-laporan.revisi', editId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    alert('Pencatatan laporan yang direvisi berhasil dikirim ulang!');
                },
            });
        } else {
            post(route('staff.buat-laporan.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    alert('Pencatatan laporan pembelian barang berhasil dikirim!');
                },
            });
        }
    };

    return (
        <AuthenticatedLayout header="Buat Laporan">
            <Head title="Buat Laporan - Staff Accounting" />

            <div className="bg-emerald-50 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-100">
                <div>
                    <h3 className="text-lg font-bold text-emerald-800">Pencatatan Laporan Pembelian Barang</h3>
                    <p className="text-emerald-600 mt-1">Buat pencatatan untuk barang yang laporan dokumennya sudah disetujui.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    disabled={availableDocuments.length === 0}
                    className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    <FileText className="w-5 h-5 mr-2" />
                    Buat Pencatatan
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Barang</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada pencatatan laporan yang dibuat.
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <React.Fragment key={record.id}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(record.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {record.purchase_document?.item_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><Badge status={record.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {record.status === 'Direvisi' && (
                                                    <button onClick={() => openReviseModal(record)} className="text-emerald-600 hover:text-emerald-900 text-sm font-medium">
                                                        Perbaiki Pencatatan
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {record.status === 'Direvisi' && record.revision_note && (
                                            <tr className="bg-red-50">
                                                <td colSpan="4" className="px-6 py-3 text-sm text-red-700">
                                                    <strong>Catatan Revisi dari Manager Accounting:</strong> {record.revision_note}
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

            {isModalOpen && (
                <div className="fixed inset-0 z-[999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                            <form onSubmit={submit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                {isEdit ? 'Perbaiki Pencatatan Laporan' : 'Buat Pencatatan Laporan Pembelian'}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Pilih laporan dokumen pembelian yang sudah disetujui, lalu buat catatannya.
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        {!isEdit && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Laporan Dokumen Pembelian</label>
                                                <select
                                                    value={data.purchase_document_id}
                                                    onChange={e => setData('purchase_document_id', e.target.value)}
                                                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl"
                                                    required
                                                >
                                                    <option value="" disabled>-- Laporan yang Disetujui --</option>
                                                    {availableDocuments.map(doc => (
                                                        <option key={doc.id} value={doc.id}>
                                                            {doc.item_name} &times; {doc.quantity}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.purchase_document_id && <div className="text-red-500 text-xs mt-1">{errors.purchase_document_id}</div>}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Pencatatan</label>
                                            <textarea
                                                rows="4"
                                                value={data.notes}
                                                onChange={e => setData('notes', e.target.value)}
                                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-xl"
                                                placeholder="Ringkasan pencatatan dana yang dikeluarkan untuk pembelian barang ini..."
                                                required
                                            ></textarea>
                                            {errors.notes && <div className="text-red-500 text-xs mt-1">{errors.notes}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Mengirim...' : isEdit ? 'Kirim Ulang' : 'Kirim ke Manager'}
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
