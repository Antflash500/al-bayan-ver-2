import { Head } from '@inertiajs/react';
import { History, Laptop, MapPin } from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';
import { cn } from '@/lib/utils';

interface ActivityLog {
    id: number;
    name: string;
    role: string;
    aktivitas: string;
    ip_address: string | null;
    browser: string | null;
    tanggal: string | null;
    jam: string | null;
}

const ROLE_STYLE: Record<string, string> = {
    admin: 'bg-slate-800',
    guru: 'bg-indigo-600',
    student: 'bg-emerald-600',
    system: 'bg-slate-400',
};

export default function GuruAktivitas({ logs }: { logs: ActivityLog[] }) {
    return (
        <GuruLayout>
            <Head title="Guru | Log Aktivitas" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-800">Log Aktivitas</h1>
                    <p className="mt-1 text-sm text-slate-500">Riwayat aktivitas terbaru di sistem Al Bayan.</p>
                </div>

                <div className="overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft">
                    {logs.length === 0 ? (
                        <div className="grid place-items-center px-6 py-20 text-center">
                            <div className="grid size-14 place-items-center rounded-full bg-slate-100">
                                <History className="size-6 text-slate-400" />
                            </div>
                            <p className="mt-4 text-sm font-semibold text-slate-600">Belum ada aktivitas</p>
                            <p className="mt-1 text-xs text-slate-400">Log aktivitas akan tampil di sini.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <li key={log.id} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50/60">
                                    <span
                                        className={cn(
                                            'mt-0.5 grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white',
                                            ROLE_STYLE[log.role] ?? 'bg-slate-400'
                                        )}
                                    >
                                        {log.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold text-slate-800">{log.name}</span> · {log.aktivitas}
                                        </p>
                                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                            <span className="capitalize">{log.role}</span>
                                            {log.tanggal && (
                                                <span>
                                                    {log.tanggal} pukul {log.jam}
                                                </span>
                                            )}
                                            {log.browser && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Laptop className="size-3" /> {log.browser}
                                                </span>
                                            )}
                                            {log.ip_address && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="size-3" /> {log.ip_address}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </GuruLayout>
    );
}