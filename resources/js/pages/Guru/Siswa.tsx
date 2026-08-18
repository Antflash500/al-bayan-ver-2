import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';
import { cn } from '@/lib/utils';

interface SiswaItem {
    id: number;
    name: string;
    username: string;
    nim: string | null;
    gender: string | null;
    phone: string | null;
    status: string;
    programs: number;
    totalHadir: number;
    created_at: string;
}

interface StudentsPage {
    data: SiswaItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

const STATUS_BADGE: Record<string, string> = {
    aktif: 'bg-emerald-50 text-emerald-700',
    nonaktif: 'bg-red-50 text-red-700',
    pending: 'bg-amber-50 text-amber-700',
};

const fmtGender = (g?: string | null) => {
    if (!g) return '-';
    const v = g.toLowerCase();
    if (v === 'l' || v === 'male' || v === 'laki-laki') return 'Laki-laki';
    if (v === 'p' || v === 'female' || v === 'perempuan') return 'Perempuan';
    return g;
};

export default function GuruSiswa() {
    const { students, filters } = usePage<{
        students: StudentsPage;
        filters: { search: string };
    }>().props;

    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                router.get(
                    '/guru/siswa',
                    { search },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <GuruLayout>
            <Head title="Guru | Daftar Siswa" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-slate-800">Daftar Siswa</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Pantau data dan kehadiran seluruh siswa Al Bayan.
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, username, atau NIM..."
                            aria-label="Cari siswa"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-soft focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:w-80"
                        />
                    </div>
                </div>

                {/* Ringkasan */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-soft">
                        <span className="grid size-11 place-items-center rounded-xl bg-indigo-600 text-white">
                            <Users className="size-5" />
                        </span>
                        <p className="mt-4 font-display text-3xl font-bold text-slate-800">{students.total}</p>
                        <p className="text-sm font-medium text-slate-500">Total Siswa</p>
                    </div>
                    <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-soft">
                        <span className="grid size-11 place-items-center rounded-xl bg-violet-600 text-white">
                            <BookOpen className="size-5" />
                        </span>
                        <p className="mt-4 font-display text-3xl font-bold text-slate-800">
                            {students.data.reduce((acc, s) => acc + s.programs, 0)}
                        </p>
                        <p className="text-sm font-medium text-slate-500">Total Program Terdaftar</p>
                    </div>
                    <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-soft">
                        <span className="grid size-11 place-items-center rounded-xl bg-emerald-600 text-white">
                            <CheckCircle2 className="size-5" />
                        </span>
                        <p className="mt-4 font-display text-3xl font-bold text-slate-800">
                            {students.data.reduce((acc, s) => acc + s.totalHadir, 0)}
                        </p>
                        <p className="text-sm font-medium text-slate-500">Total Kehadiran (Halaman Ini)</p>
                    </div>
                </div>

                {/* Tabel siswa */}
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3.5 font-semibold">Siswa</th>
                                    <th className="px-5 py-3.5 font-semibold">NIM</th>
                                    <th className="px-5 py-3.5 font-semibold">Jenis Kelamin</th>
                                    <th className="px-5 py-3.5 font-semibold">Kontak</th>
                                    <th className="px-5 py-3.5 font-semibold">Program</th>
                                    <th className="px-5 py-3.5 font-semibold">Total Hadir</th>
                                    <th className="px-5 py-3.5 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                                            Tidak ada siswa ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((s) => (
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
                                            <td className="px-5 py-3.5 text-slate-600">{s.nim ?? '-'}</td>
                                            <td className="px-5 py-3.5 text-slate-600">{fmtGender(s.gender)}</td>
                                            <td className="px-5 py-3.5 text-slate-600">{s.phone ?? '-'}</td>
                                            <td className="px-5 py-3.5 text-slate-600">{s.programs} program</td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                                                    <CheckCircle2 className="size-4" /> {s.totalHadir}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                                        STATUS_BADGE[s.status] ?? 'bg-slate-100 text-slate-600'
                                                    )}
                                                >
                                                    {s.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                            Menampilkan {students.from ?? 0}–{students.to ?? 0} dari {students.total} siswa
                        </p>
                        <div className="flex items-center gap-2">
                            <Link
                                href={students.prev_page_url ?? '#'}
                                aria-disabled={!students.prev_page_url}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition',
                                    students.prev_page_url
                                        ? 'hover:border-indigo-300 hover:text-indigo-700'
                                        : 'pointer-events-none opacity-40'
                                )}
                            >
                                <ChevronLeft className="size-4" /> Sebelumnya
                            </Link>
                            <span className="text-xs font-medium text-slate-600">
                                Halaman {students.current_page}/{students.last_page}
                            </span>
                            <Link
                                href={students.next_page_url ?? '#'}
                                aria-disabled={!students.next_page_url}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition',
                                    students.next_page_url
                                        ? 'hover:border-indigo-300 hover:text-indigo-700'
                                        : 'pointer-events-none opacity-40'
                                )}
                            >
                                Berikutnya <ChevronRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </GuruLayout>
    );
}