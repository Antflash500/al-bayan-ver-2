import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    BadgeCheck,
    BookOpen,
    CalendarDays,
    CheckCircle,
    Clock,
    Megaphone,
    Sparkles,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';
import { cn } from '@/lib/utils';

interface Stats {
    students: number;
    programs: number;
    attendanceToday: number;
    pendingVerifications: number;
}

interface Breakdown {
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    total: number;
}

interface RecentAbsensi {
    id: number;
    name: string;
    role: string;
    tanggal: string;
    waktu: string | null;
    status: string;
    kegiatan: string | null;
}

interface PendingLog {
    id: number;
    name: string;
    username: string;
    tanggal: string;
    waktu: string | null;
    status: string;
    kegiatan: string | null;
    keterangan: string | null;
}

interface Announcement {
    id: number;
    judul: string;
    isi: string;
    tanggal: string;
}

interface Enrollment {
    id: number;
    student: string;
    program: string;
    tanggal: string;
}

const STATUS_BADGE: Record<string, string> = {
    hadir: 'bg-emerald-50 text-emerald-700',
    sakit: 'bg-amber-50 text-amber-700',
    izin: 'bg-blue-50 text-blue-700',
    alpha: 'bg-red-50 text-red-700',
};

const STATUS_BAR: Record<string, string> = {
    hadir: 'bg-emerald-500',
    sakit: 'bg-amber-400',
    izin: 'bg-blue-500',
    alpha: 'bg-red-500',
};

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                'rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft',
                className
            )}
        >
            {children}
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    href,
    tone,
}: {
    icon: typeof Users;
    label: string;
    value: number;
    href: string;
    tone: string;
}) {
    return (
        <Link
            href={href}
            className="group block rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-soft transition hover:shadow-soft-hover"
        >
            <div className="flex items-center justify-between">
                <span className={cn('grid size-11 place-items-center rounded-xl', tone)}>
                    <Icon className="size-5" />
                </span>
                <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-sm font-medium text-slate-500">{label}</p>
        </Link>
    );
}

function RateRing({ value }: { value: number }) {
    const r = 34;
    const circumference = 2 * Math.PI * r;

    return (
        <div className="relative size-24 shrink-0">
            <svg viewBox="0 0 80 80" className="size-full -rotate-90">
                <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-slate-200" />
                <circle
                    cx="40"
                    cy="40"
                    r={r}
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="stroke-indigo-600"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - value / 100)}
                />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-xl font-bold text-slate-800">{value}%</span>
            </div>
        </div>
    );
}

export default function Home({
    stats,
    breakdown,
    attendanceRate,
    recentAbsensi,
    pendingList,
    announcements,
    recentEnrollments,
}: {
    stats: Stats;
    breakdown: Breakdown;
    attendanceRate: number;
    recentAbsensi: RecentAbsensi[];
    pendingList: PendingLog[];
    announcements: Announcement[];
    recentEnrollments: Enrollment[];
}) {
    const { auth } = usePage<{ auth?: { user?: { name?: string; username?: string } } }>().props;
    const guruName = auth?.user?.name ?? auth?.user?.username ?? 'Ustadz';

    const hour = new Date().getHours();
    const greeting =
        hour < 10 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
    const todayLabel = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const total = Math.max(1, breakdown.total);
    const bars = [
        { key: 'hadir', label: 'Hadir', value: breakdown.hadir },
        { key: 'sakit', label: 'Sakit', value: breakdown.sakit },
        { key: 'izin', label: 'Izin', value: breakdown.izin },
        { key: 'alpha', label: 'Alpha', value: breakdown.alpha },
    ];

    return (
        <GuruLayout>
            <Head title="Guru | Beranda" />

            <div className="space-y-6">
                {/* Welcome banner */}
                <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 p-6 text-white shadow-soft sm:p-8">
                    <div className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full bg-white/5 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-1/3 size-56 rounded-full bg-violet-500/10 blur-3xl" />
                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-indigo-100 backdrop-blur-md">
                                <Sparkles className="size-3.5 text-amber-300" /> Portal Guru Al Bayan
                            </div>
                            <h2 className="font-display text-2xl font-bold sm:text-3xl">
                                {greeting}, {guruName}
                            </h2>
                            <p className="mt-1 text-sm text-indigo-100">{todayLabel}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2.5">
                            <Link
                                href="/guru/absensi"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-950 transition hover:bg-indigo-50"
                            >
                                <CheckCircle className="size-3.5" /> Catat Kehadiran
                            </Link>
                            <Link
                                href="/guru/programs"
                                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                            >
                                <BookOpen className="size-3.5" /> Kelola Program
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={Users} label="Total Siswa Aktif" value={stats.students} href="/guru/siswa" tone="bg-indigo-600 text-white" />
                    <StatCard icon={BookOpen} label="Jumlah Program" value={stats.programs} href="/guru/programs" tone="bg-violet-600 text-white" />
                    <StatCard icon={CheckCircle} label="Hadir Hari Ini" value={stats.attendanceToday} href="/guru/absensi" tone="bg-emerald-600 text-white" />
                    <StatCard icon={BadgeCheck} label="Menunggu Verifikasi" value={stats.pendingVerifications} href="/guru/absensi" tone="bg-amber-500 text-white" />
                </div>

                {/* Ringkasan kehadiran + Aktivitas */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <SectionCard>
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                                <TrendingUp className="size-4 text-indigo-600" /> Kehadiran Hari Ini
                            </h2>
                            <Link href="/guru/laporan" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                Laporan
                            </Link>
                        </div>
                        <div className="space-y-4 px-5 py-5">
                            <div className="flex items-center gap-4">
                                <RateRing value={attendanceRate} />
                                <div className="text-xs text-slate-500">
                                    <p className="font-semibold text-slate-800">Kehadiran 30 hari</p>
                                    <p className="mt-1">
                                        {breakdown.total} siswa tercatat hari ini, {breakdown.hadir} di antaranya hadir.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {bars.map((bar) => {
                                    const pct = Math.round((bar.value / total) * 100);
                                    return (
                                        <div key={bar.key} className="flex items-center gap-3">
                                            <span className="w-12 text-xs font-medium text-slate-500 capitalize">{bar.label}</span>
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={cn('h-full rounded-full', STATUS_BAR[bar.key] ?? 'bg-slate-400')}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="w-6 text-right text-sm font-semibold text-slate-700">{bar.value}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard className="lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                                <Activity className="size-4 text-indigo-600" /> Aktivitas Siswa Terbaru
                            </h2>
                            <Link href="/guru/absensi" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                Lihat Semua
                            </Link>
                        </div>
                        {recentAbsensi.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">Belum ada aktivitas kehadiran.</div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {recentAbsensi.map((abs) => (
                                    <li
                                        key={abs.id}
                                        className="flex flex-col gap-2 px-5 py-4 hover:bg-slate-50/60 sm:flex-row sm:items-center"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span
                                                className={cn(
                                                    'grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white',
                                                    abs.role === 'guru' ? 'bg-indigo-600' : 'bg-emerald-600'
                                                )}
                                            >
                                                {abs.name.charAt(0).toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-800">{abs.name}</p>
                                                <p className="text-xs text-slate-400 capitalize">
                                                    {abs.role} &middot; {abs.tanggal} &middot; Jam {abs.waktu?.slice(0, 5) ?? '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1 sm:px-4">
                                            {abs.kegiatan ? (
                                                <p className="truncate rounded-lg bg-slate-50 px-3 py-1.5 text-xs italic text-slate-600">
                                                    "{abs.kegiatan}"
                                                </p>
                                            ) : (
                                                <span className="text-xs text-slate-400">Tidak ada deskripsi kegiatan</span>
                                            )}
                                        </div>
                                        <span
                                            className={cn(
                                                'shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-medium capitalize sm:self-auto',
                                                STATUS_BADGE[abs.status] ?? 'bg-slate-100 text-slate-600'
                                            )}
                                        >
                                            {abs.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SectionCard>
                </div>

                {/* Verifikasi + Pengumuman */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <SectionCard className="lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                                <BadgeCheck className="size-4 text-indigo-600" /> Menunggu Verifikasi
                            </h2>
                            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                {pendingList.length} antrean
                            </span>
                        </div>
                        {pendingList.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 p-8 text-center text-sm text-slate-500">
                                <CheckCircle className="size-4 text-emerald-500" /> Semua kehadiran siswa telah terverifikasi.
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {pendingList.map((log) => (
                                    <li
                                        key={log.id}
                                        className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-800">{log.name}</p>
                                            <p className="text-xs text-slate-400">
                                                @{log.username} &middot; {log.tanggal} &middot; {log.waktu?.slice(0, 5) ?? '-'}
                                            </p>
                                            {(log.kegiatan || log.keterangan) && (
                                                <p className="mt-1 truncate text-xs italic text-slate-500">
                                                    "{log.kegiatan ?? log.keterangan}"
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            className={cn(
                                                'shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-medium capitalize sm:self-auto',
                                                STATUS_BADGE[log.status] ?? 'bg-slate-100 text-slate-600'
                                            )}
                                        >
                                            {log.status}
                                        </span>
                                        <Link
                                            href="/guru/absensi"
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-900"
                                        >
                                            <BadgeCheck className="size-3.5" /> Verifikasi
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SectionCard>

                    <SectionCard>
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                                <Megaphone className="size-4 text-indigo-600" /> Pengumuman
                            </h2>
                            <Link href="/guru/pengumuman" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                Semua
                            </Link>
                        </div>
                        {announcements.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">Belum ada pengumuman.</div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {announcements.map((a) => (
                                    <li key={a.id} className="px-5 py-4">
                                        <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <CalendarDays className="size-3" /> {a.tanggal}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-800">{a.judul}</p>
                                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{a.isi}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SectionCard>
                </div>

                {/* Enrollmen terbaru */}
                <SectionCard>
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                            <UserPlus className="size-4 text-indigo-600" /> Pendaftaran Program Terbaru
                        </h2>
                        <Link href="/guru/programs" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            Kelola Program
                        </Link>
                    </div>
                    {recentEnrollments.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">Belum ada pendaftaran program terbaru.</div>
                    ) : (
                        <ul className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
                            {recentEnrollments.map((enrollment) => (
                                <li
                                    key={enrollment.id}
                                    className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/60 md:odd:border-r md:odd:border-slate-100"
                                >
                                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
                                        <UserPlus className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-800">{enrollment.student}</p>
                                        <p className="truncate text-xs text-slate-400">{enrollment.program}</p>
                                    </div>
                                    <span className="shrink-0 text-xs text-slate-400">
                                        <Clock className="mr-1 inline size-3" />
                                        {enrollment.tanggal}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
            </div>
        </GuruLayout>
    );
}