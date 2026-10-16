import {
    EditIcon,
    PlusIcon,
    SearchIcon,
    ShieldCheckIcon,
    UsersIcon,
    XMarkIcon,
} from '@/Components/Icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function UsersIndex({ users, roles }) {
    const user = usePage().props.auth.user;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const userList = useMemo(() => {
        return users.data ? users.data : users;
    }, [users]);

    const filteredUsers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return userList;

        return userList.filter((u) => {
            const matchesName = u.name?.toLowerCase().includes(q);
            const matchesEmail = u.email?.toLowerCase().includes(q);
            const matchesJabatan = u.jabatan?.toLowerCase().includes(q);
            const matchesRole = u.role?.toLowerCase().includes(q);
            return matchesName || matchesEmail || matchesJabatan || matchesRole;
        });
    }, [userList, searchQuery]);

    const createUserForm = useForm({
        name: '',
        email: '',
        password: 'password123',
        role: 'karyawan',
        nip: '',
        jabatan: 'Divisi Accounting',
    });

    const editRoleForm = useForm({
        role: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createUserForm.post(route('users.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createUserForm.reset();
            },
        });
    };

    const handleEditRoleSubmit = (e) => {
        e.preventDefault();
        editRoleForm.put(route('users.update-role', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
            },
        });
    };

    const getRolePill = (role) => {
        switch (role) {
            case 'karyawan':
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Karyawan Accounting
                    </span>
                );
            case 'staff_gudang':
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        Staff Gudang
                    </span>
                );
            case 'inventarisir':
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Petugas Inventarisir
                    </span>
                );
            case 'manager_gudang':
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                        Manager Gudang
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {role}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Manajemen Pengguna & Hak Akses (RBAC)
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Kelola data akun pengguna, NIP, jabatan, dan penugasan peran hak akses operasional.
                        </p>
                    </div>
                    {user.role === 'manager_gudang' && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition transform hover:-translate-y-0.5"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Tambah Pengguna Baru</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Manajemen Pengguna" />

            <div className="space-y-6">
                {/* Search & Stats Bar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm font-bold text-slate-700">
                        Total Terdaftar:{' '}
                        <span className="text-indigo-600 font-black text-base">{userList.length} Pengguna</span>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, jabatan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Table of Users */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-[850px]">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                    <th className="py-4 px-5">Pengguna & NIP</th>
                                    <th className="py-4 px-5">Email</th>
                                    <th className="py-4 px-5">Jabatan & Divisi</th>
                                    <th className="py-4 px-5">Peran (Role Akses)</th>
                                    <th className="py-4 px-5 text-right">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                                        <td className="py-4 px-5 align-top">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                                                    <div className="text-slate-400 font-mono text-xs mt-0.5">
                                                        NIP: {u.nip || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 align-top font-medium text-slate-700 text-sm">
                                            {u.email}
                                        </td>
                                        <td className="py-4 px-5 align-top text-slate-700 font-medium text-sm">
                                            {u.jabatan || 'Divisi Accounting'}
                                        </td>
                                        <td className="py-4 px-5 align-top">
                                            {getRolePill(u.role)}
                                        </td>
                                        <td className="py-4 px-5 text-right align-top">
                                            {user.role === 'manager_gudang' && (
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(u);
                                                        editRoleForm.setData('role', u.role);
                                                    }}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs sm:text-sm transition"
                                                >
                                                    Ubah Role
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Create User */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="font-extrabold text-slate-900 text-lg">
                                Tambah Akun Pengguna Baru
                            </h3>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                    placeholder="Contoh: Budi Santoso"
                                    value={createUserForm.data.name}
                                    onChange={(e) => createUserForm.setData('name', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Alamat Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        placeholder="nama@metinca.co.id"
                                        value={createUserForm.data.email}
                                        onChange={(e) => createUserForm.setData('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Password Default *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        value={createUserForm.data.password}
                                        onChange={(e) =>
                                            createUserForm.setData('password', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        NIP Karyawan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white font-mono"
                                        placeholder="EMP-001"
                                        value={createUserForm.data.nip}
                                        onChange={(e) => createUserForm.setData('nip', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Jabatan Resmi
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-slate-200 text-sm px-4 py-2.5 bg-white"
                                        placeholder="Staff Accounting"
                                        value={createUserForm.data.jabatan}
                                        onChange={(e) =>
                                            createUserForm.setData('jabatan', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Pilih Peran Role Akses *
                                </label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5 bg-white"
                                    value={createUserForm.data.role}
                                    onChange={(e) => createUserForm.setData('role', e.target.value)}
                                >
                                    <option value="karyawan">Karyawan (Divisi Accounting)</option>
                                    <option value="staff_gudang">Staff Gudang</option>
                                    <option value="inventarisir">Petugas Inventarisir</option>
                                    <option value="manager_gudang">Manager Gudang</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createUserForm.processing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition"
                                >
                                    Simpan Pengguna
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Role */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-extrabold text-slate-900 text-lg">
                                Ubah Peran: {editingUser.name}
                            </h3>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditRoleSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Pilih Peran Baru
                                </label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 text-sm py-2.5 px-3.5 bg-white"
                                    value={editRoleForm.data.role}
                                    onChange={(e) => editRoleForm.setData('role', e.target.value)}
                                >
                                    <option value="karyawan">Karyawan (Divisi Accounting)</option>
                                    <option value="staff_gudang">Staff Gudang</option>
                                    <option value="inventarisir">Petugas Inventarisir</option>
                                    <option value="manager_gudang">Manager Gudang</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editRoleForm.processing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition"
                                >
                                    Simpan Peran
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
