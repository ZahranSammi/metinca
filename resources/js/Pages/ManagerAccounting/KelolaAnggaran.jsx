import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Search, Wallet, X } from 'lucide-react';
import { useState } from 'react';

export default function KelolaAnggaran({ machines = [] }) {
    const [editingMachine, setEditingMachine] = useState(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        budget: '',
    });

    const openEdit = (machine) => {
        setEditingMachine(machine);
        setData('budget', machine.budget);
    };

    const closeEdit = () => {
        setEditingMachine(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('manager-acc.kelola-anggaran.update', editingMachine.id), {
            onSuccess: () => closeEdit(),
        });
    };

    return (
        <AuthenticatedLayout header="Kelola Anggaran">
            <Head title="Kelola Anggaran - Manager Accounting" />

            <div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-100">
                <h3 className="text-lg font-bold text-purple-900">Anggaran Perbaikan per Mesin</h3>
                <p className="text-purple-700 mt-1">Atur batas anggaran perbaikan tiap mesin di sini. Nominal akan otomatis berkurang setiap kali dana perbaikan dicairkan.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                            placeholder="Cari mesin..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Mesin</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sisa Anggaran</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {machines.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada data mesin. Tambahkan mesin lewat menu Manager Maintenance terlebih dahulu.
                                    </td>
                                </tr>
                            ) : (
                                machines.map((machine) => (
                                    <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{machine.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{machine.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">Rp {Number(machine.budget).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => openEdit(machine)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                                            >
                                                <Wallet className="w-3.5 h-3.5 mr-1" />
                                                Atur Anggaran
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Atur Anggaran */}
            {editingMachine && (
                <div className="fixed inset-0 z-[999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeEdit}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                            <form onSubmit={submit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                Atur Anggaran Mesin
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">{editingMachine.name}</p>
                                        </div>
                                        <button type="button" onClick={closeEdit} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Anggaran Perbaikan (Rp)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.budget}
                                            onChange={e => setData('budget', e.target.value)}
                                            className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3"
                                            required
                                            autoFocus
                                        />
                                        {errors.budget && <div className="text-red-500 text-xs mt-1">{errors.budget}</div>}
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-purple-600 text-base font-bold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                    <button
                                        onClick={closeEdit}
                                        type="button"
                                        disabled={processing}
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
