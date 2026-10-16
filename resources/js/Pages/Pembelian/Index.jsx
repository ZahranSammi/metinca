import {
    ArrowRightIcon,
    CheckCircleIcon,
    ClipboardIcon,
    ClockIcon,
    DownloadIcon,
    EyeIcon,
    FileTextIcon,
    PackageIcon,
    PlusIcon,
    SearchIcon,
    ShoppingCartIcon,
    XMarkIcon,
} from '@/Components/Icons';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function PembelianIndex({ purchases, approvedRequests, documents, masterItems }) {
    const user = usePage().props.auth.user;

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [verifyingDocument, setVerifyingDocument] = useState(null);
    const [activeTab, setActiveTab] = useState('documents'); // 'documents' or 'ready'
    const [searchQuery, setSearchQuery] = useState('');

    // Form for Recording Purchase
    const purchaseForm = useForm({
        purchase_request_id: '',
        supplier: '',
        tanggal_pembelian: new Date().toISOString().split('T')[0],
        nomor_nota: '',
        total_harga: 0,
        file_bukti: null,
        items: [],
    });

    // Form for Inventarisir Document Verification
    const verifyDocForm = useForm({
        action: 'approve',
        catatan: '',
    });

    const handleSelectApprovedRequest = (req) => {
        setSelectedRequest(req);

        let total = 0;
        const items = req.items
            ? req.items.map((i) => {
                  const subtotal = (i.jumlah || 1) * (i.estimasi_harga || 0);
                  total += subtotal;
                  return {
                      item_id: i.item_id || '',
                      nama_barang: i.nama_barang,
                      jumlah: i.jumlah,
                      harga_satuan: i.estimasi_harga || 0,
                      subtotal: subtotal,
                  };
              })
            : [];

        purchaseForm.setData({
            purchase_request_id: req.id,
            supplier: 'PT Supplier Utama Metinca',
            tanggal_pembelian: new Date().toISOString().split('T')[0],
            nomor_nota: 'NOTA-' + Math.floor(100000 + Math.random() * 900000),
            total_harga: total,
            file_bukti: null,
            items: items,
        });
    };

    const handlePurchaseSubmit = (e) => {
        e.preventDefault();
        purchaseForm.post(route('pembelian.store'), {
            onSuccess: () => {
                setSelectedRequest(null);
                purchaseForm.reset();
            },
        });
    };

    const handleSubmitToInventarisir = (docId) => {
        if (confirm('Serahkan dokumen ini ke petugas inventarisir untuk verifikasi stok?')) {
            useForm().post(route('pembelian.submit', docId));
        }
    };

    const handleVerifyDocSubmit = (e) => {
        e.preventDefault();
        verifyDocForm.post(route('pembelian.verifikasi-dokumen', verifyingDocument.id), {
            onSuccess: () => {
                setVerifyingDocument(null);
                verifyDocForm.reset();
            },
        });
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    // Filter documents
    const filteredDocuments = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return documents;

        return documents.filter((doc) => {
            const matchesDoc = doc.nomor_dokumen?.toLowerCase().includes(q);
            const matchesSupplier = doc.purchase?.supplier?.toLowerCase().includes(q);
            const matchesNota = doc.purchase?.nomor_nota?.toLowerCase().includes(q);
            const matchesCreator = doc.creator?.name?.toLowerCase().includes(q);
            return matchesDoc || matchesSupplier || matchesNota || matchesCreator;
        });
    }, [documents, searchQuery]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Pengadaan & Realisasi Pembelian
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Pencatatan faktur belanja supplier, nota pembelian, dan verifikasi fisik stok inventaris.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Pengadaan & Pembelian" />

            <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Antrean Siap Beli</div>
                        <div className="text-3xl sm:text-4xl font-black text-amber-600 mt-2">
                            {approvedRequests.length}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Pengajuan telah disetujui</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="text-sm font-semibold text-slate-500">Total Berkas Dokumen</div>
                        <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{documents.length}</div>
                        <div className="text-xs text-slate-400 mt-1">Seluruh arsip transaksi</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-amber-800">Menunggu Cek Stok</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-amber-900 mt-2">
                            {documents.filter((d) => d.status === 'SUBMITTED').length}
                        </div>
                        <div className="text-xs text-amber-700 mt-1 font-medium">Perlu verifikasi inventarisir</div>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-emerald-800">Stok Terverifikasi</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-900 mt-2">
                            {documents.filter((d) => d.status === 'APPROVED').length}
                        </div>
                        <div className="text-xs text-emerald-700 mt-1 font-medium">Stok master telah diperbarui</div>
                    </div>
                </div>

                {/* Section Navigation Tabs & Search */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl text-sm font-semibold">
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`px-5 py-2.5 rounded-lg transition whitespace-nowrap ${
                                activeTab === 'documents'
                                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Dokumen Pembelian ({documents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('ready')}
                            className={`px-5 py-2.5 rounded-lg transition whitespace-nowrap ${
                                activeTab === 'ready'
                                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Antrean Siap Beli ({approvedRequests.length})
                        </button>
                    </div>

                    {activeTab === 'documents' && (
                        <div className="relative w-full md:w-80">
                            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari dokumen, supplier, nota..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                    )}
                </div>

                {/* Tab Content: Ready to Purchase Queue */}
                {activeTab === 'ready' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                Pengajuan Disetujui (Siap Direalisasikan Belanja)
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Pengajuan yang telah lolos verifikasi kebutuhan dan siap dibeli oleh Staff Gudang.
                            </p>
                        </div>

                        {approvedRequests.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 text-sm">
                                Saat ini tidak ada antrean pengajuan yang menunggu realisasi pembelian.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {approvedRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="p-5 sm:p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition flex flex-col justify-between"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md text-xs border border-slate-200">
                                                    {req.nomor_pengajuan}
                                                </span>
                                                <StatusBadge status="APPROVED" size="sm" />
                                            </div>

                                            <div className="text-sm">
                                                <div className="font-bold text-slate-900">{req.user?.name}</div>
                                                <div className="text-slate-400 text-xs mt-0.5">
                                                    {req.user?.jabatan || 'Divisi Accounting'}
                                                </div>
                                            </div>

                                            <div className="bg-white p-3 rounded-xl border border-slate-200/60 text-sm space-y-1.5">
                                                <div className="font-bold text-slate-800">
                                                    {req.items?.length || 0} Item Barang
                                                </div>
                                                <div className="text-slate-500 text-xs line-clamp-2">
                                                    {req.items?.map((i) => i.nama_barang).join(', ')}
                                                </div>
                                            </div>
                                        </div>

                                        {(user.role === 'staff_gudang' || user.role === 'manager_gudang') && (
                                            <button
                                                onClick={() => handleSelectApprovedRequest(req)}
                                                className="w-full mt-5 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-xs transition flex items-center justify-center gap-2"
                                            >
                                                <ShoppingCartIcon className="w-4 h-4" />
                                                <span>Input Nota & Pembelian</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: Purchase Documents Table */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                        <th className="py-4 px-5">No. Dokumen & Tanggal</th>
                                        <th className="py-4 px-5">Data Transaksi & Supplier</th>
                                        <th className="py-4 px-5">Nomor Nota</th>
                                        <th className="py-4 px-5">Total Biaya</th>
                                        <th className="py-4 px-5">Petugas Gudang</th>
                                        <th className="py-4 px-5">Status Dokumen</th>
                                        <th className="py-4 px-5 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredDocuments.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-16 text-center text-slate-400 text-sm">
                                                Tidak ada berkas dokumen pembelian yang sesuai kriteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDocuments.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-4 px-5 align-top">
                                                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                                                        {doc.nomor_dokumen}
                                                    </span>
                                                    <div className="text-slate-400 text-xs mt-1.5 font-medium">
                                                        {new Date(doc.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>

                                                <td className="py-4 px-5 align-top">
                                                    {doc.purchase ? (
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-sm">
                                                                {doc.purchase.supplier}
                                                            </div>
                                                            <div className="text-slate-400 text-xs font-mono mt-0.5">
                                                                PO: {doc.purchase.nomor_pembelian}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>

                                                <td className="py-4 px-5 align-top">
                                                    <span className="font-mono font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-xs">
                                                        {doc.purchase?.nomor_nota || '-'}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-5 align-top">
                                                    <span className="font-mono font-bold text-slate-900 text-sm">
                                                        {formatCurrency(doc.purchase?.total_harga)}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-5 align-top">
                                                    <span className="font-semibold text-slate-800 text-sm">
                                                        {doc.creator?.name || 'Staff Gudang'}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-5 align-top">
                                                    <StatusBadge status={doc.status} />
                                                </td>

                                                <td className="py-4 px-5 text-right align-top space-x-2">
                                                    {/* Submit to inventarisir */}
                                                    {(user.role === 'staff_gudang' ||
                                                        user.role === 'manager_gudang') &&
                                                        (doc.status === 'DRAFT' || doc.status === 'REJECTED') && (
                                                            <button
                                                                onClick={() => handleSubmitToInventarisir(doc.id)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition"
                                                            >
                                                                <span>Kirim ke Inventarisir</span>
                                                            </button>
                                                        )}

                                                    {/* Inventarisir verification */}
                                                    {(user.role === 'inventarisir' ||
                                                        user.role === 'manager_gudang') &&
                                                        doc.status === 'SUBMITTED' && (
                                                            <button
                                                                onClick={() => setVerifyingDocument(doc)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition"
                                                            >
                                                                <CheckCircleIcon className="w-4 h-4" />
                                                                <span>Verifikasi Stok</span>
                                                            </button>
                                                        )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Input Purchase Transaction */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg">
                                    Catat Transaksi Pembelian ({selectedRequest.nomor_pengajuan})
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Masukkan rincian toko supplier, nomor nota fisik, dan total belanja.
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handlePurchaseSubmit} className="space-y-5 text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Nama Toko / Supplier *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        placeholder="Contoh: CV Prima Stationery / Gramedia"
                                        value={purchaseForm.data.supplier}
                                        onChange={(e) => purchaseForm.setData('supplier', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Tanggal Pembelian *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        value={purchaseForm.data.tanggal_pembelian}
                                        onChange={(e) =>
                                            purchaseForm.setData('tanggal_pembelian', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Nomor Nota / Kwitansi *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        placeholder="Contoh: NOTA-2026-881"
                                        value={purchaseForm.data.nomor_nota}
                                        onChange={(e) => purchaseForm.setData('nomor_nota', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Total Pembayaran Riil (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 font-bold bg-white text-slate-900"
                                        value={purchaseForm.data.total_harga}
                                        onChange={(e) =>
                                            purchaseForm.setData('total_harga', parseFloat(e.target.value) || 0)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Upload Bukti Nota / Struk Fisik (PDF / Gambar)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={(e) => purchaseForm.setData('file_bukti', e.target.files[0])}
                                />
                            </div>

                            <div className="space-y-3 border-t border-slate-100 pt-4">
                                <label className="font-bold text-slate-800 text-sm">Rincian Barang yang Dibeli</label>
                                {purchaseForm.data.items.map((it, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center"
                                    >
                                        <div className="col-span-1">
                                            <span className="font-bold text-slate-900 text-sm">{it.nama_barang}</span>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 font-medium mb-1">
                                                Qty Dibeli
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full rounded-lg border-slate-200 text-sm py-2 px-3 bg-white"
                                                value={it.jumlah}
                                                onChange={(e) => {
                                                    const newItems = [...purchaseForm.data.items];
                                                    newItems[idx].jumlah = parseInt(e.target.value) || 1;
                                                    newItems[idx].subtotal =
                                                        newItems[idx].jumlah * newItems[idx].harga_satuan;
                                                    purchaseForm.setData('items', newItems);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 font-medium mb-1">
                                                Harga Satuan (Rp)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full rounded-lg border-slate-200 text-sm py-2 px-3 bg-white"
                                                value={it.harga_satuan}
                                                onChange={(e) => {
                                                    const newItems = [...purchaseForm.data.items];
                                                    newItems[idx].harga_satuan =
                                                        parseFloat(e.target.value) || 0;
                                                    newItems[idx].subtotal =
                                                        newItems[idx].jumlah * newItems[idx].harga_satuan;
                                                    purchaseForm.setData('items', newItems);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={purchaseForm.processing}
                                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs transition"
                                >
                                    Simpan Transaksi & Buat Dokumen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Inventarisir Verification */}
            {verifyingDocument && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                Pemeriksaan & Penerimaan Fisik Barang
                            </h3>
                            <button
                                onClick={() => setVerifyingDocument(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                            <div>
                                <span className="font-semibold text-slate-500">Nomor Dokumen:</span>{' '}
                                <span className="font-mono font-bold text-slate-900">
                                    {verifyingDocument.nomor_dokumen}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-500">Supplier:</span>{' '}
                                <span className="font-bold text-slate-900">
                                    {verifyingDocument.purchase?.supplier}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-500">Total Biaya:</span>{' '}
                                <span className="font-mono font-bold text-slate-900">
                                    {formatCurrency(verifyingDocument.purchase?.total_harga)}
                                </span>
                            </div>
                            <div className="text-emerald-700 font-semibold text-xs sm:text-sm pt-1">
                                Penerimaan barang yang disetujui akan otomatis menambah kuantitas stok di sistem.
                            </div>
                        </div>

                        <form onSubmit={handleVerifyDocSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Keputusan Pemeriksaan
                                </label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5 bg-white"
                                    value={verifyDocForm.data.action}
                                    onChange={(e) => verifyDocForm.setData('action', e.target.value)}
                                >
                                    <option value="approve">Barang Sesuai &rarr; Setujui & Tambah Stok (APPROVED)</option>
                                    <option value="reject">Tidak Sesuai &rarr; Tolak & Kembalikan (REJECTED)</option>
                                </select>
                            </div>

                            {verifyDocForm.data.action === 'reject' ? (
                                <div>
                                    <label className="block font-bold text-rose-700 mb-1.5">
                                        Catatan Alasan Penolakan *
                                    </label>
                                    <textarea
                                        rows="3"
                                        required
                                        className="w-full rounded-xl border border-rose-300 text-sm p-3.5 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                        placeholder="Tuliskan alasan fisik barang atau nota tidak sesuai..."
                                        value={verifyDocForm.data.catatan}
                                        onChange={(e) => verifyDocForm.setData('catatan', e.target.value)}
                                    ></textarea>
                                </div>
                            ) : (
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Catatan Penerimaan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5"
                                        placeholder="Kondisi barang baik dan sesuai nota..."
                                        value={verifyDocForm.data.catatan}
                                        onChange={(e) => verifyDocForm.setData('catatan', e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setVerifyingDocument(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={verifyDocForm.processing}
                                    className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-xs transition ${
                                        verifyDocForm.data.action === 'approve'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-rose-600 hover:bg-rose-700'
                                    }`}
                                >
                                    Simpan Hasil Pemeriksaan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
