import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function VerifikasiLaporan({ menunggu = [], diverifikasi = [] }) {
    const [actionModal, setActionModal] = useState({ isOpen: false, type: '', reportId: null });
    const [note, setNote] = useState('');

    const handleVerify = (id) => {
        if (confirm('Verifikasi laporan kerusakan ini?')) {
            router.put(route('staff.verifikasi-laporan.update', id));
        }
    };

    const openModal = (type, id) => {
        setActionModal({ isOpen: true, type, reportId: id });
        setNote('');
    };

    const closeModal = () => {
        setActionModal({ isOpen: false, type: '', reportId: null });
        setNote('');
    };

    const submitAction = (e) => {
        e.preventDefault();
        
        if (actionModal.type === 'revisi') {
            router.put(route('staff.verifikasi-laporan.revisi', actionModal.reportId), { catatan: note }, {
                onSuccess: () => closeModal(),
            });
        } else if (actionModal.type === 'tolak') {
            router.put(route('staff.verifikasi-laporan.tolak', actionModal.reportId), { catatan: note }, {
                onSuccess: () => closeModal(),
            });
        }
    };

    return (
        <AuthenticatedLayout header="Verifikasi Laporan">
            <Head title="Verifikasi Laporan - Staff Accounting" />

            <div className="space-y-8">
                {/* Menunggu Verifikasi */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Menunggu Verifikasi</h3>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{menunggu.length}</span>
                    </div>

                    <div className="space-y-4">
                        {menunggu.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500 text-sm">
                                Tidak ada laporan yang menunggu verifikasi.
                            </div>
                        ) : (
                            menunggu.map((report) => (
                                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-bold text-blue-600">LPR-2024-{String(report.id).padStart(3, '0')}</span>
                                            <Badge status="Menunggu" />
                                        </div>
                                        <h4 className="text-base font-bold text-gray-900">{report.machine ? report.machine.name : 'Unknown Machine'}</h4>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                            <span>{new Date(report.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span>&bull;</span>
                                            <span>{report.description}</span>
                                            <span>&bull;</span>
                                            <span className="font-medium text-gray-900">Pelapor: {report.user ? report.user.name : 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-2">
                                        <button 
                                            onClick={() => handleVerify(report.id)}
                                            className="flex items-center px-3 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Verifikasi
                                        </button>
                                        <button 
                                            onClick={() => openModal('revisi', report.id)}
                                            className="flex items-center px-3 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                                        >
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Revisi
                                        </button>
                                        <button 
                                            onClick={() => openModal('tolak', report.id)}
                                            className="flex items-center px-3 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Tolak
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sudah Diverifikasi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Sudah Diverifikasi / Siap Dibuat Laporan</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{diverifikasi.length}</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Laporan</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mesin</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pelapor</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {diverifikasi.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 text-sm">
                                            Belum ada laporan yang diverifikasi.
                                        </td>
                                    </tr>
                                ) : (
                                    diverifikasi.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">LPR-2024-{String(report.id).padStart(3, '0')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(report.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.machine ? report.machine.name : 'Unknown'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.user ? report.user.name : 'Unknown'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge status="Diverifikasi" />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={actionModal.isOpen} onClose={closeModal}>
                <form onSubmit={submitAction} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {actionModal.type === 'revisi' ? 'Kembalikan Laporan untuk Revisi' : 'Tolak Laporan'}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        {actionModal.type === 'revisi' 
                            ? 'Laporan ini akan dikembalikan ke Manager Maintenance. Silakan tuliskan catatan apa yang perlu direvisi (misal: foto kurang jelas, rincian biaya tidak masuk akal).'
                            : 'Laporan ini akan ditolak secara permanen dan tidak akan diproses lebih lanjut. Pastikan keputusan Anda sudah final.'}
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="catatan" value="Catatan / Alasan" />
                        <TextInput
                            id="catatan"
                            name="catatan"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="mt-1 block w-full"
                            required
                            placeholder={actionModal.type === 'revisi' ? "Contoh: Mohon lengkapi foto sparepart yang rusak..." : "Contoh: Mesin ini sudah tidak digunakan..."}
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>Batal</SecondaryButton>

                        {actionModal.type === 'revisi' ? (
                            <PrimaryButton type="submit" className="ms-3 bg-amber-600 hover:bg-amber-700" disabled={!note}>
                                Kirim Revisi
                            </PrimaryButton>
                        ) : (
                            <DangerButton type="submit" className="ms-3" disabled={!note}>
                                Tolak Laporan
                            </DangerButton>
                        )}
                    </div>
                </form>
            </Modal>

        </AuthenticatedLayout>
    );
}
