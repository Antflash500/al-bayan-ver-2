import { Head, router, usePage } from '@inertiajs/react';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';
import { cn } from '@/lib/utils';

interface Summary {
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    total: number;
}

interface PerStudent {
    id: number;
    name: string;
    username: string;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    total: number;
}

interface Daily {
    tanggal: string;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    total: number;
}

const STATUS_STYLE: Record<string, { text: string; bar: string }> = {
    hadir: { text: 'text-emerald-700', bar: 'bg-emerald-500' },
    sakit: { text: 'text-amber-700', bar: 'bg-amber-400' },
    izin: { text: 'text-blue-700', bar: 'bg-blue-500' },
    alpha: { text: 'text-red-700', bar: 'bg-red-500' },
};

const STATUS_LABEL: Record<string, string> = {
    hadir: 'Hadir',
    sakit: 'Sakit',
    izin: 'Izin',
    alpha: 'Alpha',
};

export default function GuruLaporan() {
    const { summary, rate, perStudent, daily, filters } = usePage<{
        summary: Summary;
        rate: number;
        perStudent: PerStudent[];
        daily: Daily[];
        filters: { from: string; to: string };
    }>().props;

    const applyFilter = (patch: Partial<{ from: string; to: string }>) => {
        router.get('/guru/laporan', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    };

    const total = Math.max(1, summary.total);
    const cards = ['hadir', 'sakit', 'izin', 'alpha'] as const;

    return (
        <GuruLayout>
            <Head title="Guru | Laporan Kehadiran" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-slate-800">Laporan Kehadiran</h1>
                        <p className="mt-1 text-sm text-slate-500">Rekap kehadiran siswa untuk periode tertentu.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="size-4 text-slate-400" />
                            <input
                                type="date"
                                value={filters.from}
                                onChange={(e) => applyFilter({ from: e.target.value })}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </label>
                        <span className="text-sm text-slate-400">sampai</span>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="size-4 text-slate-400" />
                            <input
                                type="date"
                                value={filters.to}
                                onChange={(e) => applyFilter({ to: e.target.value })}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </label>
                    </div>
                </div>

                {/* Ringkasan */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {cards.map((key) => {
                        const style = STATUS_STYLE[key];
                        const pct = Math.round((summary[key] / total) * 100);
                        return (
                            <div
                                key={key}
                                className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-soft"
                            >
                                <p className="text-sm font-medium text-slate-500">{STATUS_LABEL[key]}</p>
                                <p className={cn('mt-1 font-display text-3xl font-bold', style.text)}>{summary[key]}</p>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                    <div className={cn('h-full rounded-full', style.bar)} style={{ width: `${pct}%` }} />
                                </div>
                                <p className="mt-1.5 text-xs text-slate-400">{pct}% dari periode</p>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-slate-200 bg-gradient-to-r from-indigo-950 to-indigo-800 px-6 py-5 text-white shadow-soft">
                    <span className="grid size-11 place-items-center rounded-xl bg-white/10">
                        <TrendingUp className="size-5" />
                    </span>
                    <div>
                        <p className="text-sm text-indigo-200">Tingkat kehadiran periode ini</p>
                        <p className="font-display text-2xl font-bold">
                            {rate}%{' '}
                            <span className="text-sm font-medium text-indigo-200">dari {summary.total} catatan</span>
                        </p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold">
                        <BarChart3 className="size-3.5" /> {summary.hadir} hadir dari {summary.total}
                    </span>
                </div>

                {/* Per siswa */}
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                            <BarChart3 className="size-4 text-indigo-600" /> Rekap per Siswa
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3.5 font-semibold">Siswa</th>
                                    <th className="px-5 py-3.5 font-semibold">Hadir</th>
                                    <th className="px-5 py-3.5 font-semibold">Sakit</th>
                                    <th className="px-5 py-3.5 font-semibold">Izin</th>
                                    <th className="px-5 py-3.5 font-semibold">Alpha</th>
                                    <th className="px-5 py-3.5 font-semibold">Total</th>
                                    <th className="px-5 py-3.5 font-semibold">Kehadiran</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {perStudent.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                                            Tidak ada catatan kehadiran pada periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    perStudent.map((s) => {
                                        const pct = s.total ? Math.round((s.hadir / s.total) * 100) : 0;
                                        return (
                                            <tr key={s.id} className="transition hover:bg-slate-50/60">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                                            {s.name.charAt(0).toUpperCase()}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-slate-800">{s.name}</p>
                                                            <p className="text-xs text-slate-400">@{s.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-emerald-600">{s.hadir}</td>
                                                <td className="px-5 py-3.5 text-amber-600">{s.sakit}</td>
                                                <td className="px-5 py-3.5 text-blue-600">{s.izin}</td>
                                                <td className="px-5 py-3.5 text-red-600">{s.alpha}</td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-700">{s.total}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className={cn(
                                                                    'h-full rounded-full',
                                                                    pct >= 70
                                                                        ? 'bg-emerald-500'
                                                                        : pct >= 50
                                                                          ? 'bg-amber-400'
                                                                          : 'bg-red-500'
                                                                )}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-10 text-xs font-semibold text-slate-600">{pct}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Per hari */}
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                            <Calendar className="size-4 text-indigo-600" /> Rekap per Tanggal
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3.5 font-semibold">Tanggal</th>
                                    <th className="px-5 py-3.5 font-semibold">Hadir</th>
                                    <th className="px-5 py-3.5 font-semibold">Sakit</th>
                                    <th className="px-5 py-3.5 font-semibold">Izin</th>
                                    <th className="px-5 py-3.5 font-semibold">Alpha</th>
                                    <th className="px-5 py-3.5 font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {daily.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                                            Tidak ada catatan pada periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    daily.map((d) => (
                                        <tr key={d.tanggal} className="transition hover:bg-slate-50/60">
                                            <td className="px-5 py-3.5 font-medium text-slate-700">{d.tanggal}</td>
                                            <td className="px-5 py-3.5 text-emerald-600">{d.hadir}</td>
                                            <td className="px-5 py-3.5 text-amber-600">{d.sakit}</td>
                                            <td className="px-5 py-3.5 text-blue-600">{d.izin}</td>
                                            <td className="px-5 py-3.5 text-red-600">{d.alpha}</td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-700">{d.total}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </GuruLayout>
    );
}