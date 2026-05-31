import { Head, useForm } from '@inertiajs/react';
import { 
    Eye, 
    EyeOff, 
    ArrowRight, 
    Shield, 
    BarChart3, 
    Layers, 
    Package
} from 'lucide-react';
import type { FormEventHandler} from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(store.url(), {
            onFinish: () => reset('password'),
        });
    };

    const handleQuickAccess = (email: string) => {
        setData((prev) => ({
            ...prev,
            email: email,
            password: 'password', // Demo password
        }));
    };

    return (
        <div className="flex min-h-screen font-sans bg-slate-50 w-full">
            <Head title="Login - InvenTrack" />

            {/* Left Side: Banner (Visible on Desktop/Large Screens) */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-5/12 bg-gradient-to-b from-[#0b2149] via-[#0d2857] to-[#0f346e] flex-col justify-between p-12 text-white relative overflow-hidden select-none">
                {/* Header / Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-wide">InvenTrack</h1>
                        <p className="text-[10px] text-blue-300 font-medium tracking-wider uppercase">Enterprise IMS v2.5</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="my-auto space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
                            Streamline Your<br />Inventory Operations
                        </h2>
                        <p className="text-slate-300 text-sm xl:text-base leading-relaxed max-w-md">
                            Real-time monitoring, automated tracking, and intelligent reporting for modern manufacturing and corporate environments.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-white/5 rounded-xl border border-white/10 text-blue-400">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-slate-200">
                                Real-time stock monitoring & analytics dashboard
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-white/5 rounded-xl border border-white/10 text-blue-400">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-slate-200">
                                Role-based access control & full audit trail
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-white/5 rounded-xl border border-white/10 text-blue-400">
                                <Layers className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-slate-200">
                                End-to-end inventory workflow automation
                            </span>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 grid grid-cols-3 gap-4 backdrop-blur-sm">
                        <div className="text-center border-r border-white/10 last:border-0 pr-4">
                            <div className="text-2xl font-bold text-white">247</div>
                            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">SKU Items</div>
                        </div>
                        <div className="text-center border-r border-white/10 last:border-0 px-4">
                            <div className="text-2xl font-bold text-white">12</div>
                            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Departments</div>
                        </div>
                        <div className="text-center last:border-0 pl-4">
                            <div className="text-2xl font-bold text-white">99.4%</div>
                            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Accuracy</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-slate-400 text-xs">
                    © 2025 PT. Maju Bersama Teknologi · All rights reserved
                </div>
            </div>

            {/* Right Side: Form Container */}
            <div className="w-full lg:w-7/12 xl:w-7/12 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#f0f4f8] relative min-h-screen">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="lg:hidden flex items-center gap-3 absolute top-6 left-6">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                        <Package className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-slate-900 tracking-wide text-sm">InvenTrack</span>
                </div>

                <div className="w-full max-w-[460px] space-y-6">
                    {/* Welcome status alert if present */}
                    {status && (
                        <div className="p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-200">
                            {status}
                        </div>
                    )}

                    {/* Login Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <div className="space-y-1 mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl px-4 py-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-xl pl-4 pr-12 py-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 text-sm cursor-pointer shadow-md shadow-blue-600/10"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    {/* Quick Access Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-500 mb-4 tracking-wider uppercase">
                            Quick access — demo accounts:
                        </h3>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => handleQuickAccess('hrd@ptmbt.co.id')}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 active:bg-blue-50/40 text-left transition-all duration-200 group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-xs select-none">
                                        AF
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
                                            Ahmad Fauzi
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            HRD Staff · <span className="text-slate-400">hrd@ptmbt.co.id</span>
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickAccess('accounting@ptmbt.co.id')}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 active:bg-blue-50/40 text-left transition-all duration-200 group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold text-xs select-none">
                                        SR
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
                                            Siti Rahayu
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Accounting Staff · <span className="text-slate-400">accounting@ptmbt.co.id</span>
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickAccess('manager@ptmbt.co.id')}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 active:bg-blue-50/40 text-left transition-all duration-200 group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs select-none">
                                        BS
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
                                            Budi Santoso
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Manager · <span className="text-slate-400">manager@ptmbt.co.id</span>
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Help Button */}
                <button
                    type="button"
                    className="absolute bottom-6 right-6 flex items-center justify-center w-10 h-10 bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    title="Help"
                >
                    <span className="font-semibold text-sm">?</span>
                </button>
            </div>
        </div>
    );
}
