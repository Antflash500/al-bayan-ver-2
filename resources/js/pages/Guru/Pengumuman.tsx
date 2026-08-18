import { Head } from '@inertiajs/react';
import { CalendarDays, Megaphone } from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';

interface Announcement {
    id: number;
    judul: string;
    isi: string;
    gambar: string | null;
    tanggal: string;
}

export default function GuruPengumuman({ announcements }: { announcements: Announcement[] }) {
    return (
        <GuruLayout>
            <Head title="Guru | Pengumuman" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-800">Pengumuman</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Informasi resmi dari pihak Al Bayan untuk seluruh pengajar.
                    </p>
                </div>

                {announcements.length === 0 ? (
                    <div className="grid place-items-center rounded-[var(--radius-card)] border border-slate-200 bg-white px-6 py-20 text-center shadow-soft">
                        <div className="grid size-14 place-items-center rounded-full bg-slate-100">
                            <Megaphone className="size-6 text-slate-400" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-600">Belum ada pengumuman</p>
                        <p className="mt-1 text-xs text-slate-400">Pengumuman baru akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {announcements.map((a) => (
                            <article
                                key={a.id}
                                className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft transition hover:shadow-soft-hover"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                                    <span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                                        <Megaphone className="size-4" />
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <CalendarDays className="size-3.5" /> {a.tanggal}
                                    </span>
                                </div>
                                <div className="flex-1 px-5 py-5">
                                    <h2 className="font-display text-base font-bold text-slate-800">{a.judul}</h2>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                                        {a.isi}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </GuruLayout>
    );
}