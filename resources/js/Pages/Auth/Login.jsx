import { Head, useForm } from '@inertiajs/react';
import { Wrench } from 'lucide-react';
import { useState } from 'react';

const ROLES = [
    {
        id: 'mm',
        name: 'Ahmad Maulana',
        role: 'Manager Maintenance',
        email: 'mm@example.com',
        initials: 'AM',
        color: 'bg-blue-600',
    },
    {
        id: 'sa',
        name: 'Siti Rahayu',
        role: 'Staff Accounting',
        email: 'sa@example.com',
        initials: 'SR',
        color: 'bg-emerald-500',
    },
    {
        id: 'ma',
        name: 'Budi Hartono',
        role: 'Manager Accounting',
        email: 'ma@example.com',
        initials: 'BH',
        color: 'bg-purple-500',
    }
];

export default function Login({ status }) {
    const [selectedRole, setSelectedRole] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: 'password', // Default password from seeder
        remember: true,
    });

    const handleSelectRole = (role) => {
        setSelectedRole(role.id);
        setData('email', role.email);
    };

    const submit = (e) => {
        e.preventDefault();
        if (selectedRole) {
            post(route('login'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <Head title="Masuk" />

            <div className="mb-10 flex items-center">
                <div className="bg-blue-600 rounded-2xl p-3 mr-4 text-white shadow-lg shadow-blue-200">
                    <Wrench className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SIPERBAIK</h1>
                    <p className="text-sm text-gray-500">Sistem Inventaris Perbaikan Mesin</p>
                </div>
            </div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Masuk ke Sistem</h2>
                    <p className="text-sm text-gray-500 mt-1">Pilih peran Anda untuk melanjutkan</p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600 text-center">
                        {status}
                    </div>
                )}
                {errors.email && (
                    <div className="mb-4 text-sm font-medium text-red-600 text-center">
                        {errors.email}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {ROLES.map((role) => (
                        <div 
                            key={role.id}
                            onClick={() => handleSelectRole(role)}
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                selectedRole === role.id 
                                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${role.color}`}>
                                {role.initials}
                            </div>
                            <div className="ml-4">
                                <h3 className="text-base font-bold text-gray-900 leading-none">{role.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{role.role}</p>
                            </div>
                        </div>
                    ))}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!selectedRole || processing}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 ${
                                selectedRole && !processing
                                ? 'bg-blue-400 hover:bg-blue-500 shadow-lg shadow-blue-200'
                                : 'bg-blue-200 cursor-not-allowed'
                            }`}
                        >
                            {processing ? 'Memproses...' : 'Masuk Sekarang'}
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="mt-10 text-center text-xs text-gray-400 font-medium">
                PT. Maju Bersama Industri &middot; SIPERBAIK v1.0
            </div>
        </div>
    );
}
