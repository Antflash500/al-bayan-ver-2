import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    BadgeCheck,
    Calendar,
    CheckCircle,
    ClipboardCheck,
    Clock,
    Search,
    Users,
    X,
} from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';
import { cn } from '@/lib/utils';

interface TeacherLog {
    id: number;
    tanggal: string;
    waktu_masuk: string | null;
    status: string;
    kegiatan: string | null;
}

interface TodayLog extends TeacherLog {
    verified_by: number | null;
}

interface StudentLog {
    id: number;
    name: string;
    username: string;
    waktu_masuk: string | null;
    status: string;
    kegiatan: string | null;
    keterangan: string | null;
    verified: boolean;
}

interface Filters {
    date: string;
    search: string;
}

const BADGE_STYLE: Record<string, string> = {
    hadir: 'bg-emerald-50 text-emerald-700',
    sakit: 'bg-amber-50 text-amber-700',
    izin: 'bg-blue-50 text-blue-700',
    alpha: 'bg-red-50 text-red-700',
};

const shortDate = (t?: string | null) => (t ? t.slice(0, 10) : '-');
const fmtTime = (t?: string | null) => (t ? t.slice(0, 5) : '-');

function VerifyForm({ log, onClose }: { log: StudentLog; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        status: log.status,
        keterangan: '',
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                post(`/guru/absensi/${log.id}/verify`, {
                    preserveScroll: true,
                    onSuccess: onClose,
                });
            }}
            className="flex flex-col gap-2 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 sm:flex-row sm:items-center"
        >
            <select
                value={data.status}
                onChange={(e) => setData('status', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:w-32"
                aria-label="Status verifikasi"
            >
                <option value="hadir">Hadir</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
                <option value="alpha">Alpha</option>
            </select>
            <input
                type="text"
                placeholder="Catatan verifikasi (opsional)"
                value={data.keterangan}
                onChange={(e) => setData('keterangan', e.target.value)}
                className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            {errors.status && <p className="text-xs text-red-600">{errors.status}</p>}
            <div className="flex items-center gap-2">
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-900 disabled:opacity-50"
                >
                    <BadgeCheck className="size-4" /> {processing ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-white"
                    aria-label="Tutup"
                >
                    <X className="size-4" />
                </button>
            </div>
        </form>
    );
}

export default function GuruAbsensi() {
    const { todayLog, history, studentLogs, filters, flash } = usePage<{
        todayLog: TodayLog | null;
        history: TeacherLog[];
        studentLogs: StudentLog[];
        filters: Filters;
        flash?: { success?: string; error?: string };
    }>().props;

    const [verifyRow, setVerifyRow] = useState<number | null>(null);

    const {
        data: checkIn,
        setData: setCheckIn,
        post: postCheckIn,
        processing: processingCheckIn,
        errors: checkInErrors,
    } = useForm({
        kegiatan: '',
    });

    const {
        data: filter,
        setData: setFilter,
        get: filterGet,
        processing: filterProcessing,
    } = useForm({
        date: filters?.date ?? '',
        search: filters?.search ?? '',
    });

    const submitCheckIn = (e: React.FormEvent) => {
        e.preventDefault();
        postCheckIn('/guru/absensi', {
            preserveScroll: true,
            onSuccess: () => setCheckIn({ kegiatan: '' }),
        });
    };

    const submitFilter = (e: React.FormEvent) => {
        e.preventDefault();
        filterGet('/guru/absensi', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const inputCls = (invalid?: string) =>
        cn(
            'w-full rounded-[var(--radius-input)] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
            invalid && 'border-red-400'
        );

    return (
        <GuruLayout>
            <Head title="Guru | Absensi" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-slate-800 sm:text-3xl">Absensi</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Catat kehadiran Anda dan verifikasi kehadiran siswa.
                        </p>
                    </div>
                    {todayLog && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle className="size-3.5" /> Sudah absen &middot; {fmtTime(todayLog.waktu_masuk)}
                        </span>
                    )}
                </div>

                {flash?.success && (
                    <p
                        role="status"
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700"
                    >
                        {flash.success}
                    </p>
                )}
                {flash?.error && (
                    <p
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"
                    >
                        {flash.error}
                    </p>
                )}

                {/* Teacher check-in */}
                {todayLog ? (
                    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-soft">
                        <div className="flex items-center gap-3">
                            <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                                <CheckCircle className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-display text-lg font-bold text-slate-800">
                                    Kehadiran hari ini tercatat
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {shortDate(todayLog.tanggal)} &middot; Masuk {fmtTime(todayLog.waktu_masuk)} &middot;{' '}
                                    {todayLog.status}
                                </p>
                            </div>
                        </div>
                        {todayLog.kegiatan && (
                            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm italic text-slate-600">
                                &quot;{todayLog.kegiatan}&quot;
                            </p>
                        )}
                    </section>
                ) : (
                    <form
                        onSubmit={submitCheckIn}
                        className="grid grid-cols-1 gap-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-soft"
                    >
                        <div>
                            <label htmlFor="kegiatan" className="mb-1 block text-sm font-medium text-slate-700">
                                Kegiatan Mengajar Hari Ini
                            </label>
                            <textarea
                                id="kegiatan"
                                rows={3}
                                value={checkIn.kegiatan}
                                onChange={(e) => setCheckIn('kegiatan', e.target.value)}
                                placeholder="Contoh: Mengajar kelas 5A, menyiapkan materi, dan lain-lain..."
                                className={inputCls(checkInErrors.kegiatan)}
                            />
                            {checkInErrors.kegiatan && (
                                <p className="mt-1 text-xs text-red-600">{checkInErrors.kegiatan}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={processingCheckIn}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-950 px-4 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:opacity-50"
                        >
                            <ClipboardCheck className="size-4" />
                            {processingCheckIn ? 'Menyimpan...' : 'Simpan Absensi'}
                        </button>
                    </form>
                )}

                {/* Teacher history */}
                <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft">
                    <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <Calendar className="size-4 text-indigo-600" /> Riwayat Absensi Saya
                        </h2>
                    </header>
                    {history.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-slate-500">Belum ada riwayat kehadiran.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {history.map((a) => (
                                <li
                                    key={a.id}
                                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center"
                                >
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <Calendar className="size-3" /> {shortDate(a.tanggal)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <Clock className="size-3" /> {fmtTime(a.waktu_masuk)}
                                    </span>
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                            BADGE_STYLE[a.status] ?? 'bg-slate-100 text-slate-600'
                                        )}
                                    >
                                        {a.status}
                                    </span>
                                    {a.kegiatan && (
                                        <p className="min-w-0 max-w-xl flex-1 truncate text-xs italic text-slate-600 sm:ml-4">
                                            &quot;{a.kegiatan}&quot;
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Student logs */}
                <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft">
                    <header className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <Users className="size-4 text-indigo-600" /> Log Absensi Siswa
                        </h2>
                        <form onSubmit={submitFilter} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                                type="date"
                                value={filter.date}
                                onChange={(e) => setFilter('date', e.target.value)}
                                className={cn(inputCls(), 'sm:w-40')}
                                aria-label="Filter tanggal"
                            />
                            <div className="relative sm:w-56">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama / username"
                                    value={filter.search}
                                    onChange={(e) => setFilter('search', e.target.value)}
                                    className={cn(inputCls(), 'pl-9')}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={filterProcessing}
                                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-indigo-950 px-4 text-xs font-semibold text-white transition hover:bg-indigo-900 disabled:opacity-50"
                            >
                                {filterProcessing ? 'Menyaring...' : 'Terapkan'}
                            </button>
                        </form>
                    </header>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Nama</th>
                                    <th className="px-5 py-3 font-semibold">Username</th>
                                    <th className="px-5 py-3 font-semibold">Waktu</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Kegiatan / Keterangan</th>
                                    <th className="px-5 py-3 font-semibold">Verifikasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentLogs.length > 0 ? (
                                    studentLogs.map((log) => (
                                        <tr key={log.id} className="border-t border-slate-100 align-top">
                                            <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">
                                                {log.name}
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500">{log.username}</td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500">
                                                {fmtTime(log.waktu_masuk)}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                                        BADGE_STYLE[log.status] ?? 'bg-slate-100 text-slate-600'
                                                    )}
                                                >
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="max-w-md px-5 py-3.5 text-sm text-slate-600">
                                                {log.status === 'hadir' ? (log.kegiatan ?? '-') : (log.keterangan ?? '-')}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {log.verified ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                                        <BadgeCheck className="size-4" /> Terverifikasi
                                                    </span>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setVerifyRow(verifyRow === log.id ? null : log.id)
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                                        >
                                                            <BadgeCheck className="size-3.5" />
                                                            {verifyRow === log.id ? 'Tutup' : 'Verifikasi'}
                                                        </button>
                                                        {verifyRow === log.id && (
                                                            <VerifyForm log={log} onClose={() => setVerifyRow(null)} />
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                                            Tidak ada catatan absensi siswa untuk tanggal ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </GuruLayout>
    );
}