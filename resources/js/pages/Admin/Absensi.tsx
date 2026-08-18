import { Head, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle,
    ClipboardCheck,
    Search,
    User,
    UserCheck,
    Users,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface StudentLog {
    id: number;
    name: string;
    username: string;
    waktu_masuk: string | null;
    status: string;
    kegiatan: string | null;
    keterangan: string | null;
    verified: boolean;
    verifier_name: string | null;
}

interface TeacherLog {
    id: number;
    name: string;
    username: string;
    waktu_masuk: string | null;
    status: string;
    kegiatan: string | null;
}

interface Stats {
    totalStudents: number;
    totalTeachers: number;
    studentsPresent: number;
    teachersPresent: number;
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

const fmtTime = (t?: string | null) => (t ? t.slice(0, 5) : '-');

export default function AdminAbsensi() {
    const { studentLogs, teacherLogs, stats, filters } = usePage<{
        studentLogs: StudentLog[];
        teacherLogs: TeacherLog[];
        stats: Stats;
        filters: Filters;
    }>().props;

    const { data, setData, get, processing, errors } = useForm({
        date: filters?.date ?? '',
        search: filters?.search ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/absensi', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const inputCls = (invalid?: string) =>
        cn(
            'w-full rounded-[var(--radius-input)] border border-border bg-white px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
            invalid && 'border-danger'
        );

    const statCards = [
        { icon: Users, label: 'Total Siswa', value: stats?.totalStudents ?? 0, tone: 'bg-primary text-white' },
        { icon: User, label: 'Total Guru', value: stats?.totalTeachers ?? 0, tone: 'bg-secondary text-secondary-foreground' },
        { icon: UserCheck, label: 'Siswa Hadir Hari Ini', value: stats?.studentsPresent ?? 0, tone: 'bg-accent text-accent-foreground' },
        { icon: ClipboardCheck, label: 'Guru Hadir Hari Ini', value: stats?.teachersPresent ?? 0, tone: 'bg-info/10 text-info' },
    ];

    return (
        <AdminLayout>
            <Head title="Admin | Absensi" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-2xl text-foreground sm:text-3xl">Absensi</h1>
                    <p className="mt-1 text-sm text-muted">Audit kehadiran siswa dan guru di Al Bayan Education.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                    <CalendarDays className="size-3.5" /> {filters?.date ?? 'Hari ini'}
                </span>
            </div>

            {/* Filters */}
            <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="date" className="text-sm font-medium text-foreground">
                        Tanggal
                    </label>
                    <input
                        id="date"
                        type="date"
                        value={data.date}
                        onChange={(e) => setData('date', e.target.value)}
                        className={inputCls(errors.date)}
                    />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                    <label htmlFor="search" className="text-sm font-medium text-foreground">
                        Cari Nama / Username
                    </label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                        <input
                            id="search"
                            type="text"
                            placeholder="Nama atau username"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className={cn(inputCls(errors.search), 'pl-10')}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                    {processing ? 'Menyaring...' : 'Terapkan'}
                </button>
            </form>

            {/* Overview stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ icon: Icon, label, value, tone }) => (
                    <div
                        key={label}
                        className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-soft"
                    >
                        <span className={cn('grid size-11 place-items-center rounded-xl', tone)}>
                            <Icon className="size-5" />
                        </span>
                        <p className="mt-4 font-display text-3xl text-foreground">{value}</p>
                        <p className="text-sm text-muted">{label}</p>
                    </div>
                ))}
            </div>

            {/* Student Logs */}
            <section className="mt-8 rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="flex items-center gap-2 font-semibold text-foreground">
                        <Users className="size-4 text-secondary" /> Log Absensi Siswa
                    </h2>
                    <span className="text-xs text-muted">{studentLogs.length} catatan</span>
                </header>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Nama</th>
                                <th className="px-5 py-3 font-semibold">Username</th>
                                <th className="px-5 py-3 font-semibold">Waktu Masuk</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 font-semibold">Kegiatan / Keterangan</th>
                                <th className="px-5 py-3 font-semibold">Verifikasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentLogs.length > 0 ? (
                                studentLogs.map((log) => (
                                    <tr key={log.id} className="border-t border-border">
                                        <td className="px-5 py-3.5 text-sm font-medium text-foreground">{log.name}</td>
                                        <td className="px-5 py-3.5 text-sm text-muted">{log.username}</td>
                                        <td className="px-5 py-3.5 text-sm text-muted">{fmtTime(log.waktu_masuk)}</td>
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
                                        <td className="max-w-md px-5 py-3.5 text-sm text-muted">
                                            {log.status === 'hadir' ? (log.kegiatan ?? '-') : (log.keterangan ?? '-')}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {log.verified ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                                    <CheckCircle className="size-4" /> {log.verifier_name ?? 'Terverifikasi'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
                                                    <AlertCircle className="size-4" /> Menunggu
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted">
                                        Tidak ada catatan absensi siswa pada tanggal ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Teacher Logs */}
            <section className="mt-8 rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="flex items-center gap-2 font-semibold text-foreground">
                        <UserCheck className="size-4 text-secondary" /> Log Absensi Guru
                    </h2>
                    <span className="text-xs text-muted">{teacherLogs.length} catatan</span>
                </header>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Nama</th>
                                <th className="px-5 py-3 font-semibold">Username</th>
                                <th className="px-5 py-3 font-semibold">Waktu Masuk</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 font-semibold">Kegiatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teacherLogs.length > 0 ? (
                                teacherLogs.map((log) => (
                                    <tr key={log.id} className="border-t border-border">
                                        <td className="px-5 py-3.5 text-sm font-medium text-foreground">{log.name}</td>
                                        <td className="px-5 py-3.5 text-sm text-muted">{log.username}</td>
                                        <td className="px-5 py-3.5 text-sm text-muted">{fmtTime(log.waktu_masuk)}</td>
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
                                        <td className="max-w-md px-5 py-3.5 text-sm text-muted">{log.kegiatan ?? '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted">
                                        Tidak ada catatan absensi guru pada tanggal ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </AdminLayout>
    );
}