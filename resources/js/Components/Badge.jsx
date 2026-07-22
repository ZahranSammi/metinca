export default function Badge({ status }) {
    let colorClass = 'bg-gray-100 text-gray-800';

    switch (status?.toLowerCase()) {
        case 'selesai':
        case 'selesai pembelian':
        case 'disetujui':
        case 'diarsipkan':
            colorClass = 'bg-emerald-100 text-emerald-700';
            break;
        case 'masuk daftar pembelian':
        case 'menunggu persetujuan manager':
        case 'dana cair':
        case 'dana diterima purchasing':
            colorClass = 'bg-blue-100 text-blue-700';
            break;
        case 'direvisi':
        case 'direvisi staff accounting':
        case 'direvisi manager':
            colorClass = 'bg-purple-100 text-purple-700';
            break;
        case 'menunggu':
        case 'diajukan':
            colorClass = 'bg-amber-100 text-amber-700';
            break;
        default:
            colorClass = 'bg-gray-100 text-gray-700';
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
        >
            {status}
        </span>
    );
}
