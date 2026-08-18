import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Briefcase,
    CalendarDays,
    CircleUserRound,
    Clock,
    Hash,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';

interface GuruProfile {
    id: number;
    name: string;
    username: string;
    email: string | null;
    jabatan: string | null;
    phone: string | null;
    nik: string | null;
    address: string | null;
    birth_date: string | null;
    role: string;
    last_activity_at: string | null;
    created_at: string;
}

export default function GuruProfil() {
    const { user, flash } = usePage<{
        user: GuruProfile;
        flash?: { success?: string; error?: string };
    }>().props;

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name ?? '',
        email: user.email ?? '',
        jabatan: user.jabatan ?? '',
        phone: user.phone ?? '',
        nik: user.nik ?? '',
        address: user.address ?? '',
        birth_date: user.birth_date ?? '',
    });

    const infoRows = [
        { icon: UserRound, label: 'Nama Lengkap', value: user.name },
        { icon: Mail, label: 'Email', value: user.email ?? '-' },
        { icon: Briefcase, label: 'Jabatan', value: user.jabatan ?? 'Guru Pengajar' },
        { icon: Phone, label: 'Nomor HP', value: user.phone ?? '-' },
        { icon: Hash, label: 'NIK', value: user.nik ?? '-' },
        { icon: MapPin, label: 'Alamat Tinggal', value: user.address ?? '-' },
        { icon: CalendarDays, label: 'Tanggal Lahir', value: user.birth_date ?? '-' },
        { icon: Clock, label: 'Terakhir Aktif', value: user.last_activity_at ?? '-' },
    ];

    return (
        <GuruLayout>
            <Head title="Guru | Profil" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-800">Profil</h1>
                    <p className="mt-1 text-sm text-slate-500">Kelola informasi pribadi dan akun pengajar Anda.</p>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {flash.error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    {/* Kartu profil */}
                    <div className="h-fit rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft">
                        <div className="rounded-t-[var(--radius-card)] bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 px-6 pb-16 pt-10 text-center">
                            <span className="grid size-20 place-items-center rounded-full bg-white text-3xl font-bold text-indigo-800 ring-4 ring-white/20">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="-mt-12 px-6 pb-6">
                            <div className="text-center">
                                <h2 className="font-display text-lg font-bold text-slate-800">{user.name}</h2>
                                <p className="text-sm text-slate-500">@{user.username}</p>
                                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    <ShieldCheck className="size-3.5" /> {user.jabatan ?? 'Guru Pengajar'}
                                </span>
                            </div>
                            <dl className="mt-6 space-y-3 text-sm">
                                {infoRows.map((row) => (
                                    <div key={row.label} className="flex items-start gap-3">
                                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                                            <row.icon className="size-4" />
                                        </span>
                                        <div className="min-w-0">
                                            <dt className="text-xs text-slate-400">{row.label}</dt>
                                            <dd className="break-words font-medium text-slate-700">{row.value}</dd>
                                        </div>
                                    </div>
                                ))}
                            </dl>
                            <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                                Anggota sejak {user.created_at}
                            </p>
                        </div>
                    </div>

                    {/* Form edit */}
                    <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft xl:col-span-2">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                                <CircleUserRound className="size-4 text-indigo-600" /> Edit Informasi Pribadi
                            </h2>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                patch('/guru/profil', { preserveScroll: true });
                            }}
                            className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2"
                        >
                            <div>
                                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="jabatan" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Jabatan / Struktur
                                </label>
                                <input
                                    id="jabatan"
                                    type="text"
                                    value={data.jabatan}
                                    onChange={(e) => setData('jabatan', e.target.value)}
                                    placeholder="cth: Guru Tahfidz, Wali Kelas..."
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.jabatan && <p className="mt-1.5 text-xs text-red-600">{errors.jabatan}</p>}
                            </div>
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email ?? ''}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                            </div>
                            <div>
                                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Nomor HP
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="cth: 0812xxxxxxx"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
                            </div>
                            <div>
                                <label htmlFor="nik" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    NIK
                                </label>
                                <input
                                    id="nik"
                                    type="text"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    placeholder="Nomor Induk Kependudukan"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.nik && <p className="mt-1.5 text-xs text-red-600">{errors.nik}</p>}
                            </div>
                            <div>
                                <label htmlFor="birth_date" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Tanggal Lahir
                                </label>
                                <input
                                    id="birth_date"
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.birth_date && <p className="mt-1.5 text-xs text-red-600">{errors.birth_date}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Alamat Tinggal
                                </label>
                                <textarea
                                    id="address"
                                    rows={3}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Alamat lengkap tempat tinggal"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.address && <p className="mt-1.5 text-xs text-red-600">{errors.address}</p>}
                            </div>
                            <div>
                                <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={user.username}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400"
                                />
                                <p className="mt-1.5 text-xs text-slate-400">Username tidak dapat diubah.</p>
                            </div>
                            <div className="flex items-end justify-end sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:opacity-50"
                                >
                                    <Save className="size-4" /> {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuruLayout>
    );
}