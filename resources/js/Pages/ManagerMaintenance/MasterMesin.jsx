import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useState } from 'react';

export default function MasterMesin({ machines = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        model_name: '',
        category: 'Mesin Produksi',
        pic: '',
    });

    const openAddModal = () => {
        setIsEdit(false);
        setEditId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (machine) => {
        setIsEdit(true);
        setEditId(machine.id);
        setData({
            code: machine.code,
            name: machine.name,
            model_name: machine.model_name,
            category: machine.category,
            pic: machine.pic,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleDelete = (machine) => {
        if (confirm(`Apakah Anda yakin ingin menghapus mesin ${machine.name}?`)) {
            router.delete(route('master-mesin.destroy', machine.id), {
                onSuccess: () => alert('Data mesin berhasil dihapus!'),
            });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('master-mesin.update', editId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    alert('Data mesin berhasil diubah!');
                },
            });
        } else {
            post(route('master-mesin.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    alert('Data mesin berhasil disimpan!');
                },
            });
        }
    };

    return (
        <AuthenticatedLayout header="Data Mesin">
            <Head title="Data Mesin" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            placeholder="Cari mesin..."
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={openAddModal}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Mesin
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Mesin</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Penanggung Jawab</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sisa Anggaran</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {machines.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada data mesin. Silakan tambah mesin baru.
                                    </td>
                                </tr>
                            ) : (
                                machines.map((machine) => (
                                    <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{machine.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{machine.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.model_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.pic}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {Number(machine.budget).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge status={machine.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button onClick={() => openEditModal(machine)} className="text-blue-600 hover:text-blue-900 mx-2 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(machine)} className="text-red-600 hover:text-red-900 mx-2 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah Mesin */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <form onSubmit={submit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                {isEdit ? 'Ubah Data Mesin' : 'Tambah Data Mesin'}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {isEdit ? 'Ubah informasi detail mesin.' : 'Masukkan informasi detail mesin baru ke dalam sistem.'}
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Mesin</label>
                                            <input 
                                                type="text" 
                                                value={data.code}
                                                onChange={e => setData('code', e.target.value)}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3" 
                                                placeholder="Contoh: MCH-007" 
                                                required
                                            />
                                            {errors.code && <div className="text-red-500 text-xs mt-1">{errors.code}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Mesin</label>
                                            <input 
                                                type="text" 
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3" 
                                                placeholder="Masukkan nama mesin..." 
                                                required
                                            />
                                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Model / Tipe</label>
                                                <input 
                                                    type="text" 
                                                    value={data.model_name}
                                                    onChange={e => setData('model_name', e.target.value)}
                                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3" 
                                                    placeholder="Contoh: RX-900" 
                                                    required
                                                />
                                                {errors.model_name && <div className="text-red-500 text-xs mt-1">{errors.model_name}</div>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                                                <select 
                                                    value={data.category}
                                                    onChange={e => setData('category', e.target.value)}
                                                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl"
                                                >
                                                    <option value="Mesin Produksi">Mesin Produksi</option>
                                                    <option value="Mesin Pengemas">Mesin Pengemas</option>
                                                    <option value="Conveyor">Conveyor</option>
                                                    <option value="Compressor">Compressor</option>
                                                </select>
                                                {errors.category && <div className="text-red-500 text-xs mt-1">{errors.category}</div>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Penanggung Jawab (PIC)</label>
                                            <input
                                                type="text"
                                                value={data.pic}
                                                onChange={e => setData('pic', e.target.value)}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3"
                                                placeholder="Nama PIC..."
                                                required
                                            />
                                            {errors.pic && <div className="text-red-500 text-xs mt-1">{errors.pic}</div>}
                                        </div>

                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-blue-600 text-base font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Mesin'}
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
