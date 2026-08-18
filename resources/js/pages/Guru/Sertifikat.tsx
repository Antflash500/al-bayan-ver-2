import { Head } from '@inertiajs/react';
import { Award, CalendarDays, CheckCircle2 } from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';
import { cn } from '@/lib/utils';

interface Certificate {
    id: number;
    student: string;
    program: string;
    nomor: string | null;
    tanggal: string | null;
    status: string;
}

const STATUS_BADGE: Record<string, string> = {
    terbit: 'bg-emerald-50 text-emerald-700',
    diterbitkan: 'bg-emerald-50 text-emerald-700',
    aktif: 'bg-emerald-50 text-emerald-700',
    draft: 'bg-amber-50 text-amber-700',
    nonaktif: 'bg-red-50 text-red-700',
};

export default function GuruSertifikat({ certificates }: { certificates: Certificate[] }) {
    return (
        <GuruLayout>
            <Head title="Guru | Sertifikat Siswa" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-800">Sertifikat Siswa</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Daftar sertifikat kelulusan yang diterbitkan untuk siswa.
                    </p>
                </div>

                <div className="overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3.5 font-semibold">Siswa</th>
                                    <th className="px-5 py-3.5 font-semibold">Program</th>
                                    <th className="px-5 py-3.5 font-semibold">No. Sertifikat</th>
                                    <th className="px-5 py-3.5 font-semibold">Tanggal Terbit</th>
                                    <th className="px-5 py-3.5 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {certificates.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                                            Belum ada sertifikat yang diterbitkan.
                                        </td>
                                    </tr>
                                ) : (
                                    certificates.map((cert) => (
                                        <tr key={cert.id} className="transition hover:bg-slate-50/60">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
                                                        <Award className="size-4" />
                                                    </span>
                                                    <span className="font-semibold text-slate-800">{cert.student}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600">{cert.program}</td>
                                            <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{cert.nomor ?? '-'}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="flex items-center gap-1.5 text-slate-600">
                                                    <CalendarDays className="size-3.5 text-slate-400" /> {cert.tanggal ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                                        STATUS_BADGE[cert.status] ?? 'bg-slate-100 text-slate-600'
                                                    )}
                                                >
                                                    <CheckCircle2 className="size-3" /> {cert.status}
                                                </span>
                                            </td>
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