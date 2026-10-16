export default function StatusBadge({ status, size = 'md' }) {
    const s = String(status || '').toUpperCase();

    const sizeClasses = size === 'sm' 
        ? 'px-2.5 py-1 text-xs' 
        : 'px-3 py-1.5 text-xs sm:text-sm';

    switch (s) {
        case 'DRAFT':
            return (
                <span className={`inline-flex items-center gap-2 font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-xs ${sizeClasses}`}>
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Draft
                </span>
            );
        case 'SUBMITTED':
            return (
                <span className={`inline-flex items-center gap-2 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-xs ${sizeClasses}`}>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Menunggu Verifikasi
                </span>
            );
        case 'APPROVED':
            return (
                <span className={`inline-flex items-center gap-2 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs ${sizeClasses}`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Disetujui
                </span>
            );
        case 'REJECTED':
            return (
                <span className={`inline-flex items-center gap-2 font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-200 shadow-xs ${sizeClasses}`}>
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Ditolak / Perlu Revisi
                </span>
            );
        case 'IN':
            return (
                <span className={`inline-flex items-center gap-2 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs ${sizeClasses}`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Masuk (IN)
                </span>
            );
        case 'OUT':
            return (
                <span className={`inline-flex items-center gap-2 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-xs ${sizeClasses}`}>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Keluar (OUT)
                </span>
            );
        case 'ADJUST':
            return (
                <span className={`inline-flex items-center gap-2 font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200 shadow-xs ${sizeClasses}`}>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Penyesuaian
                </span>
            );
        default:
            return (
                <span className={`inline-flex items-center gap-2 font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-xs ${sizeClasses}`}>
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    {status}
                </span>
            );
    }
}
