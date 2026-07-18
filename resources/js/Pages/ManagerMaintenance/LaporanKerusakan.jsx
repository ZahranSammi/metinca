import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { Search, Plus, Eye, UploadCloud, X, Wrench, CheckSquare } from 'lucide-react';
import { useState } from 'react';

export default function LaporanKerusakan({ reports = [], machines = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const currentUserId = usePage().props.auth.user.id;

    const { data, setData, post, processing, errors, reset } = useForm({
        machine_id: '',
        description: '',
        photo: null
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('laporan-kerusakan.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                alert('Laporan kerusakan berhasil dikirim!');
            },
        });
    };

    const handleMulaiPerbaikan = (report) => {
        if (confirm('Dana perbaikan sudah diterima. Mulai proses perbaikan mesin ini?')) {
            router.put(route('laporan-kerusakan.mulai-perbaikan', report.id));
        }
    };

    const handleSelesaiPerbaikan = (report) => {
        if (confirm('Tandai perbaikan mesin ini selesai secara fisik? Staff Accounting akan diminta membuat laporan pertanggungjawaban.')) {
            router.put(route('laporan-kerusakan.selesai-perbaikan', report.id));
        }
    };

    const handleViewDetail = (report) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    return (
        <AuthenticatedLayout header="Laporan Kerusakan">
            <Head title="Laporan Kerusakan" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 text-gray-900"
                            placeholder="Cari laporan..."
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Buat Laporan Kerusakan
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Mesin</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pelapor</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Belum ada laporan kerusakan yang diajukan.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(report.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {report.machine ? report.machine.name : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {report.user ? report.user.name : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge status={report.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleViewDetail(report)}
                                                    className="text-blue-600 hover:text-blue-900 mx-2 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {report.status === 'Dalam Perbaikan' && report.user_id === currentUserId && (
                                                    <button
                                                        onClick={() => handleMulaiPerbaikan(report)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Wrench className="w-3.5 h-3.5 mr-1" />
                                                        Mulai Perbaikan
                                                    </button>
                                                )}
                                                {report.status === 'Perbaikan Berjalan' && report.user_id === currentUserId && (
                                                    <button
                                                        onClick={() => handleSelesaiPerbaikan(report)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                                    >
                                                        <CheckSquare className="w-3.5 h-3.5 mr-1" />
                                                        Tandai Selesai
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Buat Laporan Kerusakan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <form onSubmit={submit} encType="multipart/form-data">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                Buat Laporan Kerusakan
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Lengkapi form di bawah ini untuk melaporkan kerusakan mesin ke Staff Accounting.
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Mesin yang Rusak</label>
                                            <select 
                                                value={data.machine_id}
                                                onChange={e => setData('machine_id', e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl"
                                                required
                                            >
                                                <option value="" disabled>-- Pilih Mesin --</option>
                                                {machines.map(m => (
                                                    <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                                                ))}
                                            </select>
                                            {errors.machine_id && <div className="text-red-500 text-xs mt-1">{errors.machine_id}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Kerusakan</label>
                                            <textarea 
                                                rows="4" 
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl" 
                                                placeholder="Jelaskan secara detail kerusakan yang terjadi..."
                                                required
                                            ></textarea>
                                            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Lampiran Laporan (Wajib)</label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors">
                                                <div className="space-y-1 text-center">
                                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600 justify-center">
                                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                            <span>Pilih File Laporan</span>
                                                            <input 
                                                                id="file-upload" 
                                                                name="file-upload" 
                                                                type="file" 
                                                                className="sr-only" 
                                                                onChange={e => setData('photo', e.target.files[0])}
                                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {data.photo ? data.photo.name : 'PDF, JPG, PNG, WORD maks. 5MB'}
                                                    </p>
                                                </div>
                                            </div>
                                            {errors.photo && <div className="text-red-500 text-xs mt-1">{errors.photo}</div>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-blue-600 text-base font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Mengirim...' : 'Kirim ke Staff Accounting'}
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

            {/* Modal Detail Laporan */}
            {isDetailModalOpen && selectedReport && (
                <div className="fixed inset-0 z-[999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDetailModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                            Detail Laporan Kerusakan
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            LPR-{String(selectedReport.id).padStart(4, '0')}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Nama Mesin</p>
                                        <p className="mt-1 text-base font-medium text-gray-900">
                                            {selectedReport.machine?.code} - {selectedReport.machine?.name}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tanggal Laporan</p>
                                        <p className="mt-1 text-base text-gray-900">
                                            {new Date(selectedReport.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Deskripsi Kerusakan</p>
                                        <div className="mt-1 p-4 bg-gray-50 rounded-xl text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                                            {selectedReport.description}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Lampiran</p>
                                        <div className="mt-1">
                                            {selectedReport.photo_path ? (
                                                <a 
                                                    href={`/storage/${selectedReport.photo_path}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4 mr-2 text-gray-500" />
                                                    Lihat Lampiran File
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-500 italic">Tidak ada lampiran disertakan.</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Status Saat Ini</p>
                                        <Badge status={selectedReport.status} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-4 sm:px-8 sm:flex sm:flex-row-reverse rounded-b-2xl">
                                <button 
                                    onClick={() => setIsDetailModalOpen(false)} 
                                    type="button" 
                                    className="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
