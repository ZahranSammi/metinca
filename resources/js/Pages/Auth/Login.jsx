import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none"></div>

            <Head title="Masuk - PT Metinca Prima Industrial Works" />

            {/* Main Login Card */}
            <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12">
                {/* Left Side: Corporate Branding & Information */}
                <div className="md:col-span-6 p-8 sm:p-10 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
                    <div>
                        {/* Company Logo & Name */}
                        <div className="flex items-center gap-3.5 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
                                MP
                            </div>
                            <div>
                                <h1 className="font-extrabold tracking-tight text-white text-lg sm:text-xl">
                                    PT METINCA PRIMA
                                </h1>
                                <p className="text-xs text-indigo-300 font-semibold tracking-wider uppercase">
                                    Industrial Works
                                </p>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Portal Inventarisasi & Aset
                        </div>

                        <h2 className="text-2xl font-black text-white leading-tight tracking-tight mb-3">
                            Sistem Manajemen Inventaris Operasional
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                            Aplikasi terpadu untuk pencatatan barang operasional, pelacakan fisik aset per ruangan, dan pengawasan alur peminjaman antar cabang.
                        </p>

                        <div className="space-y-3 text-xs text-slate-300">
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                                <span>Terintegrasi 3 Cabang: <strong>Jakarta Timur, Tambun & Salatiga</strong></span>
                            </div>
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                                <span>Pendataan & Pelacakan Fisik Barang per Ruangan</span>
                            </div>
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                                <span>Manajemen Peminjaman & Kontrol Stok Otomatis</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500">
                        Pastikan menggunakan akun resmi perusahaan yang telah terdaftar.
                    </div>
                </div>

                {/* Right Side: Real Account Login Form */}
                <div className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-center bg-slate-900/60">
                    <div className="mb-6">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                            Masuk ke Akun
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            Silakan masukkan email perusahaan dan kata sandi Anda.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Alamat Email Perusahaan"
                                className="text-slate-300 text-xs font-bold"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="nama@metinca.co.id"
                                className="mt-1.5 block w-full bg-slate-950 border-slate-800 text-slate-100 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 placeholder:text-slate-600"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-1 text-xs" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel
                                    htmlFor="password"
                                    value="Kata Sandi (Password)"
                                    className="text-slate-300 text-xs font-bold"
                                />
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                                    >
                                        Lupa kata sandi?
                                    </Link>
                                )}
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="••••••••"
                                className="mt-1.5 block w-full bg-slate-950 border-slate-800 text-slate-100 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 placeholder:text-slate-600"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-1 text-xs" />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded bg-slate-950 border-slate-800 text-indigo-600"
                                />
                                <span className="ms-2 text-xs text-slate-400">Ingat sesi login saya</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <span>Memverifikasi Akun...</span>
                            ) : (
                                <>
                                    <span>Masuk ke Sistem</span>
                                    <span>&rarr;</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500 z-10 font-medium">
                &copy; 2026 PT Metinca Prima Industrial Works Jakarta. All rights reserved.
            </div>
        </div>
    );
}
