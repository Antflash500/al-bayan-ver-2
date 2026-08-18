import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Activity,
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Sparkles,
} from 'lucide-react';
import StudentPortalLayout from '@/layouts/StudentPortalLayout';
import { cn } from '@/lib/utils';

interface HistoryItem {
    id: number;
    tanggal: string;
    waktu_masuk: string | null;
    status: string;
    kegiatan: string | null;
    keterangan: string | null;
    verified: boolean;
    verifier_name: string | null;
}

interface TodayLog {
    id: number;
    tanggal: string;
    waktu_masuk: string | null;
    status: string;
    kegiatan: string | null;
    keterangan: string | null;
    verified_by: number | null;
}

const MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const CELL_STYLE: Record<string, string> = {
    hadir: 'bg-emerald-500 text-white',
    sakit: 'bg-amber-400 text-white',
    izin: 'bg-blue-500 text-white',
    alpha: 'bg-red-500 text-white',
};

const BADGE_STYLE: Record<string, string> = {
    hadir: 'bg-emerald-50 text-emerald-700',
    sakit: 'bg-amber-50 text-amber-700',
    izin: 'bg-blue-50 text-blue-700',
    alpha: 'bg-red-50 text-red-700',
};

const fmtTime = (t?: string | null) => (t ? t.slice(0, 5) : '-');

export default function SiswaAbsensi() {
    const { todayLog, history } = usePage<{
        todayLog: TodayLog | null;
        history: HistoryItem[];
    }>().props;

    const now = new Date();
    const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

    const { data, setData, post, processing, errors, reset } = useForm({
        status: '',
        kegiatan: '',
        keterangan: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/siswa/absensi', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const pad = (n: number) => String(n).padStart(2, '0');
    const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const statusByDate = new Map(history.map((h) => [h.tanggal, h.status]));
    const firstWeekday = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const monthCount = history.filter((h) =>
        h.tanggal.startsWith(`${view.year}-${pad(view.month + 1)}`)
    ).length;

    const shiftMonth = (dir: -1 | 1) =>
        setView((v) => {
            const d = new Date(v.year, v.month + dir, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        });

    const generalError = (errors as unknown as { error?: string }).error;

    return (
        <StudentPortalLayout title="Absensi Saya">
            <Head title="Siswa | Absensi" />

            <div className="mx-auto max-w-6xl space-y-8">
                {/* Heading */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                            Absensi Hari Ini
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            Catat kehadiran, isi laporan aktivitas, dan pantau riwayat bulanan Anda.
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5" />
                        {todayLog ? 'Sudah tercatat' : 'Belum absen'}
                    </span>
                </div>

                {/* Check-in widget */}
                {todayLog ? (
                    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 className="size-6" />
                                </span>
                                <div>
                                    <h2 className="font-display text-lg font-bold text-foreground">
                                        Sudah Absensi Hari Ini
                                    </h2>
                                    <p className="text-xs text-muted">
                                        {todayLog.tanggal.slice(0, 10)} &middot; Masuk {fmtTime(todayLog.waktu_masuk)}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={cn(
                                    'self-start rounded-full px-3 py-1 text-xs font-semibold capitalize sm:self-auto',
                                    BADGE_STYLE[todayLog.status] ?? 'bg-slate-100 text-slate-600'
                                )}
                            >
                                {todayLog.status}
                            </span>
                        </div>

                        {(todayLog.kegiatan || todayLog.keterangan) && (
                            <div className="mt-4 rounded-xl bg-surface/60 p-4">
                                <p className="text-xs font-medium text-muted">
                                    {todayLog.status === 'hadir' ? 'Kegiatan' : 'Keterangan'}
                                </p>
                                <p className="mt-1 text-sm text-foreground">
                                    {todayLog.status === 'hadir' ? todayLog.kegiatan : todayLog.keterangan}
                                </p>
                            </div>
                        )}

                        <p className="mt-4 text-xs font-medium">
                            {todayLog.verified_by ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-600">
                                    <CheckCircle2 className="size-4" /> Terverifikasi
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-amber-600">
                                    <AlertCircle className="size-4" /> Menunggu verifikasi ustadz
                                </span>
                            )}
                        </p>
                    </div>
                ) : (
                    <form
                        onSubmit={submit}
                        className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                                <Clock className="size-6" />
                            </span>
                            <div>
                                <h2 className="font-display text-lg font-bold text-foreground">Absen Sekarang</h2>
                                <p className="text-xs text-muted">Pilih status kehadiran Anda hari ini.</p>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="status" className="block text-sm font-medium text-foreground">
                                    Status Kehadiran
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className={cn(
                                        'w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
                                        errors.status && 'border-danger'
                                    )}
                                >
                                    <option value="">Pilih status...</option>
                                    <option value="hadir">Hadir</option>
                                    <option value="sakit">Sakit</option>
                                    <option value="izin">Izin</option>
                                </select>
                                {errors.status && <p className="text-xs text-danger">{errors.status}</p>}
                            </div>

                            {data.status === 'hadir' && (
                                <div className="space-y-2 sm:col-span-2">
                                    <label htmlFor="kegiatan" className="block text-sm font-medium text-foreground">
                                        Kegiatan Hari Ini
                                    </label>
                                    <textarea
                                        id="kegiatan"
                                        rows={3}
                                        value={data.kegiatan}
                                        onChange={(e) => setData('kegiatan', e.target.value)}
                                        placeholder="Deskripsikan kegiatan hari ini (materi, halaqah, tugas, dan lain-lain)..."
                                        className={cn(
                                            'w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
                                            errors.kegiatan && 'border-danger'
                                        )}
                                    />
                                    {errors.kegiatan && <p className="text-xs text-danger">{errors.kegiatan}</p>}
                                </div>
                            )}

                            {(data.status === 'sakit' || data.status === 'izin') && (
                                <div className="space-y-2 sm:col-span-2">
                                    <label htmlFor="keterangan" className="block text-sm font-medium text-foreground">
                                        Keterangan / Alasan
                                    </label>
                                    <textarea
                                        id="keterangan"
                                        rows={2}
                                        value={data.keterangan}
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                        placeholder="Jelaskan alasan sakit atau izin..."
                                        className={cn(
                                            'w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
                                            errors.keterangan && 'border-danger'
                                        )}
                                    />
                                    {errors.keterangan && <p className="text-xs text-danger">{errors.keterangan}</p>}
                                </div>
                            )}
                        </div>

                        {generalError && <p className="text-xs font-medium text-danger">{generalError}</p>}

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Kirim Absensi'}
                        </button>
                    </form>
                )}

                {/* Monthly calendar */}
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                                <Calendar className="size-5 text-primary" /> Kalender Kehadiran
                            </h3>
                            <p className="text-xs text-muted">
                                {monthCount > 0 ? `${monthCount} catatan bulan ini` : 'Belum ada catatan bulan ini'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => shiftMonth(-1)}
                                aria-label="Bulan sebelumnya"
                                className="grid size-9 place-items-center rounded-lg border border-border text-muted transition hover:bg-surface hover:text-foreground"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <span className="w-36 text-center font-display text-sm font-semibold text-foreground">
                                {MONTHS[view.month]} {view.year}
                            </span>
                            <button
                                type="button"
                                onClick={() => shiftMonth(1)}
                                aria-label="Bulan berikutnya"
                                className="grid size-9 place-items-center rounded-lg border border-border text-muted transition hover:bg-surface hover:text-foreground"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-7 gap-1.5">
                        {DAY_LABELS.map((d) => (
                            <span
                                key={d}
                                className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted"
                            >
                                {d}
                            </span>
                        ))}
                        {Array.from({ length: firstWeekday }).map((_, i) => (
                            <span key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const key = `${view.year}-${pad(view.month + 1)}-${pad(day)}`;
                            const status = statusByDate.get(key);
                            const isToday = key === todayKey;
                            return (
                                <span
                                    key={key}
                                    title={status ? `${key} &middot; ${status}` : key}
                                    className={cn(
                                        'grid h-10 place-items-center rounded-lg text-sm font-semibold',
                                        status
                                            ? (CELL_STYLE[status] ?? 'bg-slate-100 text-slate-600')
                                            : 'bg-surface/50 text-muted',
                                        isToday && 'ring-2 ring-primary/60'
                                    )}
                                >
                                    {day}
                                </span>
                            );
                        })}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4">
                        {[
                            ['hadir', 'Hadir'],
                            ['sakit', 'Sakit'],
                            ['izin', 'Izin'],
                            ['alpha', 'Alpha'],
                        ].map(([key, label]) => (
                            <span key={key} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                                <span className={cn('size-3 rounded', CELL_STYLE[key])} />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Activity reports */}
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                        <Activity className="size-5 text-primary" /> Laporan Aktivitas
                    </h3>
                    <p className="text-xs text-muted">Riwayat 30 kehadiran terakhir Anda.</p>

                    <div className="mt-5 space-y-3">
                        {history.length > 0 ? (
                            history.map((h) => (
                                <div
                                    key={h.id}
                                    className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                'grid size-9 shrink-0 place-items-center rounded-lg',
                                                CELL_STYLE[h.status] ?? 'bg-slate-100 text-slate-600'
                                            )}
                                        >
                                            <Calendar className="size-4" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold capitalize text-foreground">
                                                {h.status}
                                            </p>
                                            <p className="text-[11px] text-muted">
                                                {h.tanggal} &middot; {fmtTime(h.waktu_masuk)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="min-w-0 flex-1 text-xs text-foreground/80 sm:px-4">
                                        {h.status === 'hadir' ? (h.kegiatan ?? '-') : (h.keterangan ?? '-')}
                                    </p>
                                    {h.verified ? (
                                        <span className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-emerald-600 sm:self-auto">
                                            <CheckCircle2 className="size-4" /> {h.verifier_name ?? 'Terverifikasi'}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-amber-600 sm:self-auto">
                                            <AlertCircle className="size-4" /> Menunggu
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-border py-12 text-center">
                                <Activity className="mx-auto size-10 text-muted/60" />
                                <p className="mt-3 text-sm font-medium text-foreground">Belum ada riwayat absensi</p>
                                <p className="mt-1 text-xs text-muted">Setelah absen, riwayat Anda akan muncul di sini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentPortalLayout>
    );
}