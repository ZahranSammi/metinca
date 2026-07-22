import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { Wallet, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export default function PengajuanDana({ availableRequests = [], fundProposals = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        purchase_request_id: '',
        amount: '',
        description: '',
    });

    const openCreateModal = () => {
        setIsEdit(false);
        setEditId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openReviseModal = (proposal) => {
        setIsEdit(true);
        setEditId(proposal.id);
        setData({
            purchase_request_id: proposal.purchase_request_id,
            amount: proposal.amount,
            description: proposal.description,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('purchasing.pengajuan-dana.revisi', editId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    alert('Pengajuan dana yang direvisi berhasil dikirim ulang!');
                },
            });
        } else {
            post(route('purchasing.pengajuan-dana.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    alert('Pengajuan dana berhasil dibuat!');
                },
            });
        }
    };

    const handleSelesai = (id) => {
        if (confirm('Tandai pembelian barang operasional ini sudah dilakukan?')) {
            router.put(route('purchasing.pengajuan-dana.selesai', id));
        }
    };

    return (
        <AuthenticatedLayout header="Pengajuan Dana">
            <Head title="Pengajuan Dana - Staff Purchasing" />

            <div className="bg-blue-50 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-100">
                <div>
                    <h3 className="text-lg font-bold text-blue-900">Laporan Pengajuan Dana Pembelian Barang</h3>
                    <p className="text-blue-700 mt-1">Ajukan dana untuk barang yang sudah masuk daftar pembelian.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    disabled={availableRequests.length === 0}
                    className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <Wallet className="w-5 h-5 mr-2" />
                    Ajukan Dana
                </button>
            </div>

            <div className="space-y-4">
                {fundProposals.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        Belum ada pengajuan dana yang dibuat.
                    </div>
                ) : (
                    fundProposals.map((fp) => (
                        <div key={fp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                        PD-{String(fp.id).padStart(4, '0')}
                                    </span>
                                    <Badge status={fp.status} />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{fp.purchase_request?.item_name}</h4>
                                <p className="text-sm text-gray-600 mb-2">{fp.description}</p>
                                <p className="text-lg font-bold text-gray-900">Rp {Number(fp.amount).toLocaleString('id-ID')}</p>
                                {fp.revision_note && (
                                    <p className="text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2 mt-2">Catatan revisi: {fp.revision_note}</p>
                                )}
                            </div>
                            <div className="flex flex-row md:flex-col gap-3">
                                {(fp.status === 'Direvisi Staff Accounting' || fp.status === 'Direvisi Manager') && (
                                    <button
                                        onClick={() => openReviseModal(fp)}
                                        className="flex items-center justify-center px-6 py-2.5 bg-white text-amber-700 text-sm font-bold border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
                                    >
                                        Revisi & Kirim Ulang
                                    </button>
                                )}
                                {fp.status === 'Dana Diterima Purchasing' && (
                                    <button
                                        onClick={() => handleSelesai(fp.id)}
                                        className="flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Selesaikan Pembelian
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
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
                                                {isEdit ? 'Revisi Pengajuan Dana' : 'Buat Pengajuan Dana'}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {isEdit ? 'Perbaiki nominal atau deskripsi lalu kirim ulang.' : 'Pilih barang dari daftar pembelian dan masukkan estimasi biaya.'}
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        {!isEdit && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Barang</label>
                                                <select
                                                    value={data.purchase_request_id}
                                                    onChange={e => setData('purchase_request_id', e.target.value)}
                                                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl"
                                                    required
                                                >
                                                    <option value="" disabled>-- Daftar Pembelian Barang --</option>
                                                    {availableRequests.map(req => (
                                                        <option key={req.id} value={req.id}>
                                                            {req.item_name} &times; {req.quantity}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.purchase_request_id && <div className="text-red-500 text-xs mt-1">{errors.purchase_request_id}</div>}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal Pengajuan (Rp)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.amount}
                                                onChange={e => setData('amount', e.target.value)}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3"
                                                placeholder="Contoh: 1500000"
                                                required
                                            />
                                            {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi / Justifikasi</label>
                                            <textarea
                                                rows="3"
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl"
                                                placeholder="Rincian biaya pembelian barang..."
                                                required
                                            ></textarea>
                                            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-blue-600 text-base font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Mengirim...' : isEdit ? 'Kirim Ulang' : 'Ajukan Dana'}
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
