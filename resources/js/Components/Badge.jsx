export default function Badge({ status }) {
    let colorClass = 'bg-gray-100 text-gray-800';

    switch (status?.toLowerCase()) {
        case 'beroperasi':
        case 'selesai':
        case 'disetujui':
            colorClass = 'bg-emerald-100 text-emerald-700';
            break;
        case 'rusak':
        case 'ditolak':
            colorClass = 'bg-rose-100 text-rose-700';
            break;
        case 'perbaikan':
        case 'diverifikasi':
        case 'dalam perbaikan':
        case 'perbaikan berjalan':
        case 'pengajuan dana':
            colorClass = 'bg-blue-100 text-blue-700';
            break;
        case 'direvisi':
            colorClass = 'bg-purple-100 text-purple-700';
            break;
        case 'menunggu':
        case 'menunggu persetujuan':
        case 'dikirim':
        case 'dilaporkan':
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
