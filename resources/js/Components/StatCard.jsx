export default function StatCard({ icon, iconBgColor, iconColor, value, label, trend, trendColor }) {
    return (
        <div className="flex flex-col bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border border-gray-100">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`text-sm font-medium flex items-center ${trendColor}`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        {trend}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
            </div>
        </div>
    );
}
