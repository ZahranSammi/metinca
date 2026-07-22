import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { Package, X } from 'lucide-react';
import React, { useState } from 'react';

export default function DataBarang({ availableFundProposals = [], documents = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        fund_proposal_id: '',
        item_name: '',
        quantity: 1,
        unit_price: '',
        document: null,
    });

    const openCreateModal = () => {
        setIsEdit(false);
        setEditId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openReviseModal = (doc) => {
        setIsEdit(true);
        setEditId(doc.id);
        setData({
            fund_proposal_id: doc.fund_proposal_id,
            item_name: doc.item_name,
            quantity: doc.quantity,
            unit_price: doc.unit_price,
            document: null,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('purchasing.data-barang.revisi', editId), {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    alert('Laporan dokumen pembelian yang direvisi berhasil dikirim ulang!');
                },
            });
        } else {
            post(route('purchasing.data-barang.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    alert('Laporan dokumen pembelian barang berhasil dikirim!');
                },
            });
        }
    };

    return (
        <AuthenticatedLayout header="Data Barang">
            <Head title="Data Barang - Staff Purchasing" />

            <div className="bg-blue-50 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-100">
                <div>
                    <h3 className="text-lg font-bold text-blue-900">Laporan Dokumen Pembelian Barang</h3>
                    <p className="text-blue-700 mt-1">Laporkan barang yang sudah dibeli untuk barang yang dananya sudah dicairkan.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    disabled={availableFundProposals.length === 0}
                    className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <Package className="w-5 h-5 mr-2" />
                    Laporkan Barang
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Barang</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Harga</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {documents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada laporan dokumen pembelian yang dikirim.
                                    </td>
                                </tr>
                            ) : (
                                documents.map((doc) => (
                                    <React.Fragment key={doc.id}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.item_name} &times; {doc.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {Number(doc.total_price).toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><Badge status={doc.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {doc.status === 'Direvisi' && (
                                                    <button onClick={() => openReviseModal(doc)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                                        Perbaiki Laporan
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {doc.status === 'Direvisi' && doc.revision_note && (
                                            <tr className="bg-red-50">
                                                <td colSpan="4" className="px-6 py-3 text-sm text-red-700">
                                                    <strong>Catatan Revisi dari Staff Accounting:</strong> {doc.revision_note}
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
                            <form onSubmit={submit} encType="multipart/form-data">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                {isEdit ? 'Perbaiki Laporan Dokumen Pembelian' : 'Laporkan Dokumen Pembelian Barang'}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Masukkan detail barang yang telah dibeli beserta bukti pembelian.
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        {!isEdit && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Pengajuan Dana</label>
                                                <select
                                                    value={data.fund_proposal_id}
                                                    onChange={e => setData('fund_proposal_id', e.target.value)}
                                                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl"
                                                    required
                                                >
                                                    <option value="" disabled>-- Pilih Pengajuan Dana --</option>
                                                    {availableFundProposals.map(fp => (
                                                        <option key={fp.id} value={fp.id}>
                                                            {fp.purchase_request?.item_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.fund_proposal_id && <div className="text-red-500 text-xs mt-1">{errors.fund_proposal_id}</div>}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Barang</label>
                                            <input
                                                type="text"
                                                value={data.item_name}
                                                onChange={e => setData('item_name', e.target.value)}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3"
                                                required
                                            />
                                            {errors.item_name && <div className="text-red-500 text-xs mt-1">{errors.item_name}</div>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={data.quantity}
                                                    onChange={e => setData('quantity', e.target.value)}
                                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3"
                                                    required
                                                />
                                                {errors.quantity && <div className="text-red-500 text-xs mt-1">{errors.quantity}</div>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Satuan (Rp)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={data.unit_price}
                                                    onChange={e => setData('unit_price', e.target.value)}
                                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3"
                                                    required
                                                />
                                                {errors.unit_price && <div className="text-red-500 text-xs mt-1">{errors.unit_price}</div>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Bukti Pembelian (Opsional)</label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={e => setData('document', e.target.files[0])}
                                                className="mt-1 block w-full text-sm text-gray-600"
                                            />
                                            {errors.document && <div className="text-red-500 text-xs mt-1">{errors.document}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-blue-600 text-base font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Mengirim...' : isEdit ? 'Kirim Ulang' : 'Kirim Laporan'}
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        type="button"
                                        disabled={processing}
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
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
