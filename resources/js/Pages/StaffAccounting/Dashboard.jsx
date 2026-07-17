import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Dashboard({ auth, reports, fundRequests }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        damage_report_id: '',
        amount: '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('fund-requests.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Staff Accounting</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Laporan Mesin Rusak (Menunggu Pengajuan Dana)</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesin</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.machine_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{report.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button 
                                                onClick={() => {
                                                    setData('damage_report_id', report.id);
                                                    document.getElementById('pengajuan-form').scrollIntoView();
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Buat Pengajuan Dana
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada laporan baru.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div id="pengajuan-form" className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Form Pengajuan Dana Perbaikan</h3>
                        <form onSubmit={submit} className="space-y-4 max-w-xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID Laporan Kerusakan</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={data.damage_report_id}
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                                />
                                {errors.damage_report_id && <div className="text-red-500 text-sm">{errors.damage_report_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nominal Dana (Rp)</label>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deskripsi / Justifikasi Pengajuan</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows="3"
                                ></textarea>
                                {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing || !data.damage_report_id}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                                Ajukan Dana
                            </button>
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Riwayat Pengajuan Dana (Laporan)</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Pengajuan</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesin</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fundRequests.map((req) => (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.damage_report?.machine_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {Number(req.amount).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                req.status === 'Disetujui' ? 'bg-green-100 text-green-800' : 
                                                req.status === 'Ditolak' ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {fundRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Belum ada pengajuan dana.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
