import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function PeriksaLaporan({ records = [] }) {
    const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);

    const { data: revisiData, setData: setRevisiData, put: putRevisi, processing: revisiProcessing, reset: resetRevisi, errors: revisiErrors } = useForm({
        id: '',
        catatan: '',
    });

    const handleSetuju = (id) => {
        if (confirm('Setujui pencatatan laporan ini? Siklus pembelian barang akan ditutup (diarsipkan).')) {
            router.put(route('manager-acc.periksa-laporan.setuju', id));
        }
    };

    const handleOpenRevisi = (id) => {
        setRevisiData('id', id);
        setIsRevisiModalOpen(true);
    };

    const submitRevisi = (e) => {
        e.preventDefault();
        putRevisi(route('manager-acc.periksa-laporan.revisi', revisiData.id), {
            onSuccess: () => {
                setIsRevisiModalOpen(false);
                resetRevisi();
                alert('Pencatatan dikembalikan untuk direvisi.');
            },
        });
    };

    return (
        <AuthenticatedLayout header="Periksa Laporan">
            <Head title="Periksa Laporan - Manager Accounting" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Pencatatan Laporan Pembelian Barang</h3>
                    <p className="text-sm text-gray-500 mt-1">Laporan dari Staff Accounting yang menunggu persetujuan akhir.</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {records.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Belum ada pencatatan laporan yang masuk.</div>
                    ) : (
                        records.map((record) => (
                            <div key={record.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-sm font-bold text-purple-700">
                                            PR-{String(record.id).padStart(4, '0')}
                                        </span>
                                        <Badge status={record.status} />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900">
                                        {record.purchase_document?.item_name} &times; {record.purchase_document?.quantity}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Total: <span className="font-medium text-gray-900">Rp {Number(record.purchase_document?.total_price || 0).toLocaleString('id-ID')}</span>
                                        {' '}&bull; Dicatat oleh {record.staff_accounting?.name}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleOpenRevisi(record.id)}
                                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Minta Revisi
                                    </button>
                                    <button
                                        onClick={() => handleSetuju(record.id)}
                                        className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Setujui & Arsipkan
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

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
                                                Minta Revisi Pencatatan Laporan
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Tuliskan alasan kenapa pencatatan ini harus direvisi.
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
                                            value={revisiData.catatan}
                                            onChange={e => setRevisiData('catatan', e.target.value)}
                                            className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-xl"
                                            placeholder="Cth: Nominal pencatatan tidak sesuai dengan bukti pembelian..."
                                            required
                                        ></textarea>
                                        {revisiErrors.catatan && <div className="text-red-500 text-xs mt-1">{revisiErrors.catatan}</div>}
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
