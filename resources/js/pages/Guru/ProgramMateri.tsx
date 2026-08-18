import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    ChevronDown,
    ChevronRight,
    Clock,
    FileText,
    Film,
    Image as ImageIcon,
    Link2,
    Pencil,
    Plus,
    Trash2,
    X,
    Award,
    HelpCircle,
    Check,
    AlertCircle,
} from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';
import type { Materi, MateriKonten, Quiz, SoalQuiz, PilihanJawaban } from '@/types/models';

const inputCls =
    'w-full rounded-[var(--radius-input)] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';
const labelCls = 'mb-1.5 block text-xs font-semibold text-slate-500';

function formatBytes(bytes: number | null | undefined): string {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n.toFixed(i === 0 || n >= 10 ? 0 : 1)} ${units[i]}`;
}

function youtubeEmbed(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

const tipeLabels: Record<MateriKonten['tipe'], string> = {
    teks: 'Teks',
    pdf: 'PDF',
    video: 'Video',
    gambar: 'Gambar',
    video_link: 'Video Link',
};

const tipeIcons: Record<MateriKonten['tipe'], typeof FileText> = {
    teks: FileText,
    pdf: FileText,
    video: Film,
    gambar: ImageIcon,
    video_link: Link2,
};

function Modal({
    title,
    onClose,
    children,
    wide,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    wide?: boolean;
}) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <button
                type="button"
                aria-label="Tutup"
                className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={`relative max-h-[90vh] w-full overflow-y-auto rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 shadow-xl ${
                    wide ? 'max-w-3xl' : 'max-w-lg'
                }`}
            >
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl text-slate-800 font-bold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                <div className="mt-5">{children}</div>
            </div>
        </div>
    );
}

const emptyBab = {
    judul: '',
    deskripsi: '',
    estimasi_menit: '30',
    status: 'aktif',
    gambar: null as File | null,
    pdf: null as File | null,
    video: null as File | null,
    remove_gambar: false,
    remove_pdf: false,
    remove_video: false,
};

const attachLabels = {
    gambar: { label: 'Upload Gambar', accept: 'image/*', hint: 'JPG, PNG, WebP. Maks 10 MB.' },
    pdf: { label: 'Upload PDF', accept: 'application/pdf', hint: 'File PDF. Maks 50 MB.' },
    video: { label: 'Upload Video', accept: 'video/*', hint: 'MP4, WebM, OGG. Maks 200 MB.' },
} as const;

function AttachmentField({
    field,
    onChange,
    existing,
    removing,
    onRemove,
}: {
    field: 'gambar' | 'pdf' | 'video';
    onChange: (file: File | null) => void;
    existing: { name?: string | null; url?: string | null; size?: number | null };
    removing: boolean;
    onRemove: () => void;
}) {
    const meta = attachLabels[field];
    return (
        <div>
            <label className={labelCls} htmlFor={`pb-${field}`}>
                {meta.label}
            </label>
            <input
                id={`pb-${field}`}
                type="file"
                accept={meta.accept}
                disabled={removing}
                className={inputCls}
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-slate-400">{meta.hint}</p>
            {removing && (
                <p className="mt-1 text-xs text-red-500">File ini akan dihapus saat disimpan.</p>
            )}
            {!removing && existing.url && (
                <div className="mt-2 flex items-center gap-2">
                    {field === 'gambar' ? (
                        <img src={existing.url} alt="" className="h-14 w-14 rounded-lg border border-slate-200 object-cover" />
                    ) : (
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-650">
                            {field === 'pdf' ? <FileText className="size-5" /> : <Film className="size-5" />}
                        </span>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">{existing.name}</p>
                        <p className="text-xs text-slate-400">{formatBytes(existing.size)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-red-500 transition hover:bg-red-50"
                        aria-label="Hapus file"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

type KontenForm = {
    tipe: MateriKonten['tipe'];
    judul: string;
    konten: string;
    url: string;
    file: File | null;
};

const emptyKonten: KontenForm = { tipe: 'teks', judul: '', konten: '', url: '', file: null };

type QuizForm = {
    judul: string;
    deskripsi: string;
    nilai_minimum: string;
    durasi_menit: string;
    acak_soal: boolean;
    status: string;
};

const emptyQuiz: QuizForm = {
    judul: '',
    deskripsi: '',
    nilai_minimum: '75',
    durasi_menit: '15',
    acak_soal: false,
    status: 'aktif',
};

type SoalForm = {
    pertanyaan: string;
    poin: string;
    pilihan: { pilihan: string; benar: boolean }[];
};

const emptySoal: SoalForm = {
    pertanyaan: '',
    poin: '10',
    pilihan: [
        { pilihan: '', benar: true },
        { pilihan: '', benar: false },
        { pilihan: '', benar: false },
        { pilihan: '', benar: false },
    ],
};

export default function ProgramMateri({
    program,
    materis,
    flash,
}: {
    program: { id: number; nama_program: string; slug: string };
    materis: any[]; // Extended type from controller mapping
    flash?: { success?: string };
}) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [editingBab, setEditingBab] = useState<Materi | null>(null);
    const [creatingBab, setCreatingBab] = useState(false);
    const [babForm, setBabForm] = useState(emptyBab);
    const [editingKonten, setEditingKonten] = useState<MateriKonten | null>(null);
    const [creatingKonten, setCreatingKonten] = useState<Materi | null>(null);
    const [kontenForm, setKontenForm] = useState<KontenForm>(emptyKonten);

    // Quiz states
    const [creatingQuiz, setCreatingQuiz] = useState<Materi | null>(null);
    const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
    const [quizForm, setQuizForm] = useState<QuizForm>(emptyQuiz);

    // Soal states
    const [managingQuiz, setManagingQuiz] = useState<any | null>(null);
    const [creatingSoal, setCreatingSoal] = useState(false);
    const [editingSoal, setEditingSoal] = useState<any | null>(null);
    const [soalForm, setSoalForm] = useState<SoalForm>(emptySoal);

    const base = `/guru/programs/${program.id}/materi`;

    const toggle = (id: number) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    // Bab logic
    const openCreateBab = () => {
        setBabForm(emptyBab);
        setCreatingBab(true);
        setEditingBab(null);
    };

    const openEditBab = (m: Materi) => {
        setBabForm({
            judul: m.judul,
            deskripsi: m.deskripsi ?? '',
            estimasi_menit: String(m.estimasi_menit ?? 0),
            status: m.status,
            gambar: null,
            pdf: null,
            video: null,
            remove_gambar: false,
            remove_pdf: false,
            remove_video: false,
        });
        setEditingBab(m);
        setCreatingBab(false);
    };

    const submitBab = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingBab ? `${base}/${editingBab.id}` : base;
        const data = new FormData();
        data.append('judul', babForm.judul);
        data.append('deskripsi', babForm.deskripsi);
        data.append('estimasi_menit', String(Number(babForm.estimasi_menit) || 0));
        data.append('status', babForm.status);
        if (babForm.gambar) data.append('gambar', babForm.gambar);
        if (babForm.pdf) data.append('pdf', babForm.pdf);
        if (babForm.video) data.append('video', babForm.video);
        if (babForm.remove_gambar) data.append('remove_gambar', '1');
        if (babForm.remove_pdf) data.append('remove_pdf', '1');
        if (babForm.remove_video) data.append('remove_video', '1');

        const onSuccess = () => {
            setCreatingBab(false);
            setEditingBab(null);
        };
        if (editingBab) router.patch(url, data, { forceFormData: true, onSuccess });
        else router.post(url, data, { forceFormData: true, onSuccess });
    };

    const destroyBab = (m: Materi) => {
        if (window.confirm(`Hapus bab "${m.judul}" beserta semua konten dan kuisnya?`)) {
            router.delete(`${base}/${m.id}`);
        }
    };

    // Lesson Content logic
    const openCreateKonten = (m: Materi) => {
        setKontenForm(emptyKonten);
        setCreatingKonten(m);
        setEditingKonten(null);
    };

    const openEditKonten = (k: MateriKonten) => {
        setKontenForm({
            tipe: k.tipe,
            judul: k.judul ?? '',
            konten: k.konten ?? '',
            url: k.url ?? '',
            file: null,
        });
        setEditingKonten(k);
        setCreatingKonten(null);
    };

    const submitKonten = (e: React.FormEvent) => {
        e.preventDefault();
        const targetMateri = creatingKonten ?? materis.find((m) => m.kontens.some((k: any) => k.id === editingKonten?.id));
        if (!targetMateri) return;

        const data = new FormData();
        data.append('tipe', kontenForm.tipe);
        data.append('judul', kontenForm.judul);
        data.append('konten', kontenForm.konten);
        data.append('url', kontenForm.url);
        if (kontenForm.file) data.append('file', kontenForm.file);

        const url = editingKonten
            ? `${base}/${targetMateri.id}/konten/${editingKonten.id}`
            : `${base}/${targetMateri.id}/konten`;
        const onSuccess = () => {
            setCreatingKonten(null);
            setEditingKonten(null);
            setExpanded((prev) => new Set(prev).add(targetMateri.id));
        };

        if (editingKonten) router.patch(url, data, { forceFormData: true, onSuccess });
        else router.post(url, data, { forceFormData: true, onSuccess });
    };

    const destroyKonten = (m: any, k: MateriKonten) => {
        if (window.confirm(`Hapus konten "${k.judul ?? tipeLabels[k.tipe]}"?`)) {
            router.delete(`${base}/${m.id}/konten/${k.id}`);
        }
    };

    // Quiz logic
    const openCreateQuiz = (m: Materi) => {
        setQuizForm(emptyQuiz);
        setCreatingQuiz(m);
        setEditingQuiz(null);
    };

    const openEditQuiz = (q: any) => {
        setQuizForm({
            judul: q.judul,
            deskripsi: q.deskripsi ?? '',
            nilai_minimum: String(q.nilai_minimum ?? 75),
            durasi_menit: String(q.durasi_menit ?? 15),
            acak_soal: Boolean(q.acak_soal),
            status: q.status,
        });
        setEditingQuiz(q);
        setCreatingQuiz(null);
    };

    const submitQuiz = (e: React.FormEvent) => {
        e.preventDefault();
        const targetMateri = creatingQuiz ?? materis.find((m) => m.quizes.some((q: any) => q.id === editingQuiz?.id));
        if (!targetMateri) return;

        const url = editingQuiz
            ? `${base}/${targetMateri.id}/quizzes/${editingQuiz.id}`
            : `${base}/${targetMateri.id}/quizzes`;

        const onSuccess = () => {
            setCreatingQuiz(null);
            setEditingQuiz(null);
            setExpanded((prev) => new Set(prev).add(targetMateri.id));
        };

        if (editingQuiz) {
            router.patch(url, quizForm, { onSuccess });
        } else {
            router.post(url, quizForm, { onSuccess });
        }
    };

    const destroyQuiz = (m: any, q: any) => {
        if (window.confirm(`Hapus kuis "${q.judul}" beserta semua pertanyaannya?`)) {
            router.delete(`${base}/${m.id}/quizzes/${q.id}`);
        }
    };

    // Questions logic
    const openManageQuestions = (q: any) => {
        setManagingQuiz(q);
        setCreatingSoal(false);
        setEditingSoal(null);
    };

    const openCreateSoal = () => {
        setSoalForm(emptySoal);
        setCreatingSoal(true);
        setEditingSoal(null);
    };

    const openEditSoal = (s: any) => {
        setSoalForm({
            pertanyaan: s.pertanyaan,
            poin: String(s.poin),
            pilihan: s.pilihan.map((p: any) => ({ pilihan: p.pilihan, benar: p.benar })),
        });
        setEditingSoal(s);
        setCreatingSoal(false);
    };

    const handleChoiceChange = (index: number, text: string) => {
        setSoalForm((prev) => {
            const nextPilihan = [...prev.pilihan];
            nextPilihan[index] = { ...nextPilihan[index], pilihan: text };
            return { ...prev, pilihan: nextPilihan };
        });
    };

    const handleSelectCorrect = (index: number) => {
        setSoalForm((prev) => {
            const nextPilihan = prev.pilihan.map((p, i) => ({
                ...p,
                benar: i === index,
            }));
            return { ...prev, pilihan: nextPilihan };
        });
    };

    const submitSoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!managingQuiz) return;
        const targetMateri = materis.find((m) => m.quizes.some((q: any) => q.id === managingQuiz.id));
        if (!targetMateri) return;

        const url = editingSoal
            ? `${base}/${targetMateri.id}/quizzes/${managingQuiz.id}/soal/${editingSoal.id}`
            : `${base}/${targetMateri.id}/quizzes/${managingQuiz.id}/soal`;

        const onSuccess = () => {
            setCreatingSoal(false);
            setEditingSoal(null);
            // Refresh managingQuiz with updated question list
            // Find updated quiz from props
            const updatedMateri = materis.find((m) => m.id === targetMateri.id);
            const updatedQuiz = updatedMateri?.quizes.find((q: any) => q.id === managingQuiz.id);
            if (updatedQuiz) setManagingQuiz(updatedQuiz);
        };

        if (editingSoal) {
            router.patch(url, soalForm, { onSuccess });
        } else {
            router.post(url, soalForm, { onSuccess });
        }
    };

    const destroySoal = (s: any) => {
        if (!managingQuiz) return;
        const targetMateri = materis.find((m) => m.quizes.some((q: any) => q.id === managingQuiz.id));
        if (!targetMateri) return;

        if (window.confirm('Hapus pertanyaan ini?')) {
            router.delete(`${base}/${targetMateri.id}/quizzes/${managingQuiz.id}/soal/${s.id}`, {
                onSuccess: () => {
                    const updatedMateri = materis.find((m) => m.id === targetMateri.id);
                    const updatedQuiz = updatedMateri?.quizes.find((q: any) => q.id === managingQuiz.id);
                    if (updatedQuiz) setManagingQuiz(updatedQuiz);
                },
            });
        }
    };

    const fieldForTipe = (tipe: MateriKonten['tipe']) => {
        switch (tipe) {
            case 'teks':
                return (
                    <div>
                        <label className={labelCls} htmlFor="pk-konten">
                            Isi Materi (Teks Lengkap)
                        </label>
                        <textarea
                            id="pk-konten"
                            rows={6}
                            required
                            className={inputCls}
                            value={kontenForm.konten}
                            onChange={(e) => setKontenForm((d) => ({ ...d, konten: e.target.value }))}
                            placeholder="Tulis materi pembelajaran di sini…"
                        />
                    </div>
                );
            case 'video_link':
                return (
                    <div>
                        <label className={labelCls} htmlFor="pk-url">
                            Tautan Video (YouTube/Embed)
                        </label>
                        <input
                            id="pk-url"
                            className={inputCls}
                            required
                            value={kontenForm.url}
                            onChange={(e) => setKontenForm((d) => ({ ...d, url: e.target.value }))}
                            placeholder="https://www.youtube.com/watch?v=…"
                        />
                    </div>
                );
            case 'pdf':
            case 'video':
            case 'gambar':
                return (
                    <div>
                        <label className={labelCls} htmlFor="pk-file">
                            {tipe === 'pdf' ? 'File PDF Materi' : tipe === 'video' ? 'File Video Pembelajaran' : 'Gambar Ilustrasi'}
                        </label>
                        <input
                            id="pk-file"
                            type="file"
                            accept={
                                tipe === 'pdf'
                                    ? 'application/pdf'
                                    : tipe === 'video'
                                      ? 'video/*'
                                      : 'image/*'
                            }
                            required={!editingKonten?.file_path}
                            className={inputCls}
                            onChange={(e) => setKontenForm((d) => ({ ...d, file: e.target.files?.[0] ?? null }))}
                        />
                        {editingKonten?.file_path && !kontenForm.file && (
                            <p className="mt-1 text-xs text-slate-400">
                                File lama akan dipertahankan jika tidak mengunggah file baru.
                            </p>
                        )}
                    </div>
                );
        }
    };

    return (
        <GuruLayout>
            <Head title={`Guru | Materi ${program.nama_program}`} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link
                        href="/guru/programs"
                        aria-label="Kembali ke Program"
                        className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-400 bg-white transition hover:bg-slate-50 hover:text-slate-700"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div>
                        <h1 className="font-display text-2xl text-slate-800 sm:text-3xl font-bold">Materi & Kuis</h1>
                        <p className="mt-1 text-sm text-slate-500">{program.nama_program}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={openCreateBab}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-950 px-4 text-sm font-semibold text-white transition hover:bg-indigo-900 cursor-pointer"
                >
                    <Plus className="size-4" /> Tambah Bab Baru
                </button>
            </div>

            {flash?.success && (
                <p role="status" className="mt-4 rounded-xl border border-emerald-250 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {flash.success}
                </p>
            )}

            <div className="mt-6 space-y-4">
                {materis.length === 0 && (
                    <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-12 text-center shadow-soft">
                        <p className="text-sm text-slate-500 font-medium">
                            Belum ada bab materi pada program ini. Klik <span className="font-bold text-slate-850">Tambah Bab Baru</span> di atas.
                        </p>
                    </div>
                )}

                {materis.map((m, i) => {
                    const open = expanded.has(m.id);
                    const Icon = open ? ChevronDown : ChevronRight;
                    return (
                        <div
                            key={m.id}
                            className="rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft overflow-hidden"
                        >
                            <div className="flex items-center gap-3 p-4 bg-slate-50/50">
                                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-750 text-indigo-700">
                                    {i + 1}
                                </span>
                                <button type="button" onClick={() => toggle(m.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                                    <Icon className="size-4 shrink-0 text-slate-400" />
                                    <span className="truncate font-semibold text-slate-800">{m.judul}</span>
                                </button>
                                <span
                                    className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline ${
                                        m.status === 'aktif'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {m.status}
                                </span>
                                <span className="hidden items-center gap-1 text-xs font-medium text-slate-400 md:flex">
                                    <Clock className="size-3.5" /> {m.estimasi_menit} mnt
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        disabled={i === 0}
                                        onClick={() => router.post(`${base}/${m.id}/move/up`)}
                                        aria-label="Naikkan urutan"
                                        className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ArrowUp className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={i === materis.length - 1}
                                        onClick={() => router.post(`${base}/${m.id}/move/down`)}
                                        aria-label="Turunkan urutan"
                                        className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ArrowDown className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openEditBab(m)}
                                        aria-label="Edit bab"
                                        className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => destroyBab(m)}
                                        aria-label="Hapus bab"
                                        className="grid size-8 place-items-center rounded-lg text-red-500 transition hover:bg-red-50"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>

                            {open && (
                                <div className="border-t border-slate-150 p-5 space-y-6">
                                    {m.deskripsi && (
                                        <p className="whitespace-pre-wrap text-sm text-slate-500 font-medium">{m.deskripsi}</p>
                                    )}

                                    {/* Section 1: Lesson Contents */}
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Konten Pembelajaran</h3>
                                        {m.kontens.length === 0 && (
                                            <p className="text-xs text-slate-400 italic">Belum ada konten (teks/video/file) pada bab ini.</p>
                                        )}
                                        <div className="space-y-3">
                                            {m.kontens.map((k: any, ki: number) => {
                                                const KIcon = tipeIcons[k.tipe];
                                                const kUp = ki === 0;
                                                const kDown = ki === m.kontens.length - 1;
                                                return (
                                                    <div
                                                        key={k.id}
                                                        className="rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                                                    >
                                                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
                                                            <span className="grid size-7 place-items-center rounded-lg bg-white text-indigo-600 border border-slate-200">
                                                                <KIcon className="size-3.5" />
                                                            </span>
                                                            <span className="text-xs font-semibold text-slate-800">
                                                                {tipeLabels[k.tipe]}
                                                                {k.judul ? ` · ${k.judul}` : ''}
                                                            </span>
                                                            <span className="ml-auto flex items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    disabled={kUp}
                                                                    onClick={() => router.post(`${base}/${m.id}/konten/${k.id}/move/up`)}
                                                                    aria-label="Naikkan urutan konten"
                                                                    className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                                                                >
                                                                    <ArrowUp className="size-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={kDown}
                                                                    onClick={() => router.post(`${base}/${m.id}/konten/${k.id}/move/down`)}
                                                                    aria-label="Turunkan urutan konten"
                                                                    className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                                                                >
                                                                    <ArrowDown className="size-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditKonten(k)}
                                                                    aria-label="Edit konten"
                                                                    className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white"
                                                                >
                                                                    <Pencil className="size-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => destroyKonten(m, k)}
                                                                    aria-label="Hapus konten"
                                                                    className="grid size-7 place-items-center rounded-lg text-red-500 transition hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            </span>
                                                        </div>
                                                        <div className="p-3">
                                                            {k.tipe === 'teks' && (
                                                                <p className="whitespace-pre-wrap text-sm text-slate-700 font-medium">{k.konten}</p>
                                                            )}
                                                            {k.tipe === 'pdf' && k.media_url && (
                                                                <a
                                                                    href={k.media_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                                >
                                                                    <FileText className="size-4 text-red-500" />
                                                                    <span className="font-semibold">{k.file_name ?? 'Lihat PDF'}</span>
                                                                    <span className="text-[10px] text-slate-400">{formatBytes(k.file_size)}</span>
                                                                </a>
                                                            )}
                                                            {k.tipe === 'gambar' && k.media_url && (
                                                                <img
                                                                    src={k.media_url}
                                                                    alt={k.judul ?? 'Gambar'}
                                                                    className="max-h-60 rounded-lg border border-slate-200 object-contain"
                                                                    loading="lazy"
                                                                />
                                                            )}
                                                            {k.tipe === 'video' && k.media_url && (
                                                                <video
                                                                    src={k.media_url}
                                                                    controls
                                                                    preload="metadata"
                                                                    className="max-h-60 w-full rounded-lg border border-slate-200 bg-black"
                                                                />
                                                            )}
                                                            {k.tipe === 'video_link' && k.url && (
                                                                youtubeEmbed(k.url) ? (
                                                                    <iframe
                                                                        src={youtubeEmbed(k.url)!}
                                                                        title={k.judul ?? 'Video'}
                                                                        className="aspect-video max-w-lg w-full rounded-lg border border-slate-200"
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                        allowFullScreen
                                                                    />
                                                                ) : (
                                                                    <a
                                                                        href={k.url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-650 hover:underline"
                                                                    >
                                                                        <Link2 className="size-4" /> {k.judul ?? 'Buka Tautan Video'}
                                                                    </a>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openCreateKonten(m)}
                                            className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-dashed border-slate-250 px-3 text-xs font-semibold text-slate-500 transition hover:border-indigo-500 hover:text-indigo-600 cursor-pointer"
                                        >
                                            <Plus className="size-3.5" /> Tambah Konten Materi
                                        </button>
                                    </div>

                                    {/* Section 2: Quizzes */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Latihan / Kuis Bab</h3>
                                        {m.quizes.length === 0 ? (
                                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                                                <p className="text-xs text-slate-500 mb-2 font-medium">Belum ada kuis untuk bab ini.</p>
                                                <button
                                                    type="button"
                                                    onClick={() => openCreateQuiz(m)}
                                                    className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 cursor-pointer"
                                                >
                                                    <Plus className="size-3" /> Buat Kuis Bab
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {m.quizes.map((q: any) => (
                                                    <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                                    <Award className="size-4 text-amber-500" /> {q.judul}
                                                                </h4>
                                                                {q.deskripsi && <p className="text-xs text-slate-500 mt-1 font-medium">{q.deskripsi}</p>}
                                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-medium text-slate-400">
                                                                    <span>Nilai Min: <strong className="text-slate-650 text-slate-700">{q.nilai_minimum}</strong></span>
                                                                    <span>Durasi: <strong className="text-slate-650 text-slate-700">{q.durasi_menit} menit</strong></span>
                                                                    <span>Acak Soal: <strong className="text-slate-650 text-slate-700">{q.acak_soal ? 'Ya' : 'Tidak'}</strong></span>
                                                                    <span className="capitalize">Status: <strong className={q.status === 'aktif' ? 'text-emerald-600' : 'text-slate-500'}>{q.status}</strong></span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openManageQuestions(q)}
                                                                    className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                                                                >
                                                                    <HelpCircle className="size-3.5" /> Soal ({q.soal_list?.length ?? 0})
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditQuiz(q)}
                                                                    className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                                                                    aria-label="Edit Kuis"
                                                                >
                                                                    <Pencil className="size-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => destroyQuiz(m, q)}
                                                                    className="grid size-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                                                                    aria-label="Hapus Kuis"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal: Bab Editor */}
            {(creatingBab || editingBab) && (
                <Modal
                    title={editingBab ? 'Edit Bab Materi' : 'Tambah Bab Materi'}
                    onClose={() => {
                        setCreatingBab(false);
                        setEditingBab(null);
                    }}
                >
                    <form onSubmit={submitBab} className="space-y-4">
                        <div>
                            <label className={labelCls} htmlFor="pb-judul">
                                Judul Bab
                            </label>
                            <input
                                id="pb-judul"
                                className={inputCls}
                                required
                                value={babForm.judul}
                                onChange={(e) => setBabForm((d) => ({ ...d, judul: e.target.value }))}
                                placeholder="Contoh: Pengenalan Huruf Hijaiyah"
                            />
                        </div>
                        <div>
                            <label className={labelCls} htmlFor="pb-deskripsi">
                                Ringkasan/Deskripsi Bab
                            </label>
                            <textarea
                                id="pb-deskripsi"
                                rows={3}
                                className={inputCls}
                                value={babForm.deskripsi}
                                onChange={(e) => setBabForm((d) => ({ ...d, deskripsi: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls} htmlFor="pb-menit">
                                    Estimasi Waktu Belajar (menit)
                                </label>
                                <input
                                    id="pb-menit"
                                    type="number"
                                    min={0}
                                    className={inputCls}
                                    value={babForm.estimasi_menit}
                                    onChange={(e) => setBabForm((d) => ({ ...d, ...d, estimasi_menit: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="pb-status">
                                    Status Publish
                                </label>
                                <select
                                    id="pb-status"
                                    className={inputCls}
                                    value={babForm.status}
                                    onChange={(e) => setBabForm((d) => ({ ...d, status: e.target.value }))}
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="draft">Draft</option>
                                    <option value="arsip">Arsip</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <AttachmentField
                                field="gambar"
                                onChange={(file) => setBabForm((d) => ({ ...d, gambar: file, remove_gambar: false }))}
                                existing={{
                                    name: editingBab?.gambar_name,
                                    url: editingBab?.gambar_url,
                                    size: editingBab?.gambar_size,
                                }}
                                removing={babForm.remove_gambar}
                                onRemove={() => setBabForm((d) => ({ ...d, remove_gambar: true, gambar: null }))}
                            />
                            <AttachmentField
                                field="pdf"
                                onChange={(file) => setBabForm((d) => ({ ...d, pdf: file, remove_pdf: false }))}
                                existing={{
                                    name: editingBab?.pdf_name,
                                    url: editingBab?.pdf_url,
                                    size: editingBab?.pdf_size,
                                }}
                                removing={babForm.remove_pdf}
                                onRemove={() => setBabForm((d) => ({ ...d, remove_pdf: true, pdf: null }))}
                            />
                            <AttachmentField
                                field="video"
                                onChange={(file) => setBabForm((d) => ({ ...d, video: file, remove_video: false }))}
                                existing={{
                                    name: editingBab?.video_name,
                                    url: editingBab?.video_url,
                                    size: editingBab?.video_size,
                                }}
                                removing={babForm.remove_video}
                                onRemove={() => setBabForm((d) => ({ ...d, remove_video: true, video: null }))}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setCreatingBab(false);
                                    setEditingBab(null);
                                }}
                                className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="inline-flex min-h-10 items-center rounded-xl bg-indigo-950 px-4 text-sm font-semibold text-white transition hover:bg-indigo-900"
                            >
                                {editingBab ? 'Simpan Perubahan' : 'Simpan Bab'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal: Lesson Content Editor */}
            {(creatingKonten || editingKonten) && (
                <Modal
                    title={editingKonten ? 'Edit Konten Bab' : 'Tambah Konten Bab'}
                    onClose={() => {
                        setCreatingKonten(null);
                        setEditingKonten(null);
                    }}
                >
                    <form onSubmit={submitKonten} className="space-y-4">
                        <div>
                            <label className={labelCls}>Tipe Konten</label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {(Object.keys(tipeLabels) as MateriKonten['tipe'][]).map((tipe) => {
                                    const active = kontenForm.tipe === tipe;
                                    const TIcon = tipeIcons[tipe];
                                    return (
                                        <button
                                            key={tipe}
                                            type="button"
                                            onClick={() => setKontenForm((d) => ({ ...d, tipe }))}
                                            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${
                                                active
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-250 text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <TIcon className="size-3.5" /> {tipeLabels[tipe]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {kontenForm.tipe !== 'teks' && (
                            <div>
                                <label className={labelCls} htmlFor="pk-judul">
                                    Judul Konten (opsional)
                                </label>
                                <input
                                    id="pk-judul"
                                    className={inputCls}
                                    value={kontenForm.judul}
                                    onChange={(e) => setKontenForm((d) => ({ ...d, judul: e.target.value }))}
                                />
                            </div>
                        )}
                        {fieldForTipe(kontenForm.tipe)}
                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-650">
                                {errors.error ?? Object.values(errors)[0]}
                            </div>
                        )}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setCreatingKonten(null);
                                    setEditingKonten(null);
                                }}
                                className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="inline-flex min-h-10 items-center rounded-xl bg-indigo-950 px-4 text-sm font-semibold text-white transition hover:bg-indigo-900"
                            >
                                {editingKonten ? 'Simpan Perubahan' : 'Simpan Konten'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal: Quiz Editor */}
            {(creatingQuiz || editingQuiz) && (
                <Modal
                    title={editingQuiz ? 'Edit Kuis Bab' : 'Tambah Kuis Bab'}
                    onClose={() => {
                        setCreatingQuiz(null);
                        setEditingQuiz(null);
                    }}
                >
                    <form onSubmit={submitQuiz} className="space-y-4">
                        <div>
                            <label className={labelCls} htmlFor="q-judul">
                                Judul Kuis
                            </label>
                            <input
                                id="q-judul"
                                className={inputCls}
                                required
                                value={quizForm.judul}
                                onChange={(e) => setQuizForm((d) => ({ ...d, judul: e.target.value }))}
                                placeholder="Contoh: Latihan Nahwu Bab 1"
                            />
                        </div>
                        <div>
                            <label className={labelCls} htmlFor="q-desc">
                                Deskripsi Kuis (Instruksi)
                            </label>
                            <textarea
                                id="q-desc"
                                rows={2}
                                className={inputCls}
                                value={quizForm.deskripsi}
                                onChange={(e) => setQuizForm((d) => ({ ...d, deskripsi: e.target.value }))}
                                placeholder="Petunjuk pengerjaan kuis..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls} htmlFor="q-nilai">
                                    Nilai Minimum Kelulusan (0-100)
                                </label>
                                <input
                                    id="q-nilai"
                                    type="number"
                                    min={0}
                                    max={100}
                                    required
                                    className={inputCls}
                                    value={quizForm.nilai_minimum}
                                    onChange={(e) => setQuizForm((d) => ({ ...d, nilai_minimum: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="q-durasi">
                                    Durasi Pengerjaan (menit)
                                </label>
                                <input
                                    id="q-durasi"
                                    type="number"
                                    min={0}
                                    required
                                    className={inputCls}
                                    value={quizForm.durasi_menit}
                                    onChange={(e) => setQuizForm((d) => ({ ...d, durasi_menit: e.target.value }))}
                                    placeholder="Masukkan 0 jika tidak ada batas"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls} htmlFor="q-acak">
                                    Acak Soal
                                </label>
                                <select
                                    id="q-acak"
                                    className={inputCls}
                                    value={quizForm.acak_soal ? '1' : '0'}
                                    onChange={(e) => setQuizForm((d) => ({ ...d, acak_soal: e.target.value === '1' }))}
                                >
                                    <option value="0">Tidak</option>
                                    <option value="1">Ya (Acak Pertanyaan)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="q-status">
                                    Status
                                </label>
                                <select
                                    id="q-status"
                                    className={inputCls}
                                    value={quizForm.status}
                                    onChange={(e) => setQuizForm((d) => ({ ...d, status: e.target.value }))}
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setCreatingQuiz(null);
                                    setEditingQuiz(null);
                                }}
                                className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="inline-flex min-h-10 items-center rounded-xl bg-indigo-950 px-4 text-sm font-semibold text-white transition hover:bg-indigo-900"
                            >
                                {editingQuiz ? 'Simpan Kuis' : 'Buat Kuis'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal: Questions (Soal) Management */}
            {managingQuiz && (
                <Modal
                    title={`Kelola Soal: ${managingQuiz.judul}`}
                    onClose={() => setManagingQuiz(null)}
                    wide
                >
                    <div className="space-y-6">
                        {!creatingSoal && !editingSoal ? (
                            <div>
                                <div className="flex items-center justify-between mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-250 border-slate-100">
                                    <span className="text-xs font-semibold text-slate-500">
                                        Total Soal: {managingQuiz.soal_list?.length ?? 0} &middot; Total Poin: {
                                            managingQuiz.soal_list?.reduce((acc: number, curr: any) => acc + curr.poin, 0) ?? 0
                                        }
                                    </span>
                                    <button
                                        type="button"
                                        onClick={openCreateSoal}
                                        className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-indigo-950 px-3 text-xs font-semibold text-white transition hover:bg-indigo-900 cursor-pointer"
                                    >
                                        <Plus className="size-3" /> Tambah Pertanyaan
                                    </button>
                                </div>

                                {managingQuiz.soal_list?.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-6">Kuis ini belum memiliki pertanyaan.</p>
                                ) : (
                                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                                        {managingQuiz.soal_list?.map((s: any, idx: number) => (
                                            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {idx + 1}. {s.pertanyaan}
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2 mt-3 pl-4">
                                                            {s.pilihan.map((p: any) => (
                                                                <div key={p.id} className="flex items-center gap-2 text-xs font-medium">
                                                                    {p.benar ? (
                                                                        <Check className="size-4 shrink-0 text-emerald-500" />
                                                                    ) : (
                                                                        <span className="size-1.5 rounded-full bg-slate-300 ml-1.5 mr-1" />
                                                                    )}
                                                                    <span className={p.benar ? 'font-bold text-slate-800' : 'text-slate-500'}>
                                                                        {p.pilihan}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">
                                                            Poin: {s.poin}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditSoal(s)}
                                                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"
                                                            aria-label="Edit Soal"
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => destroySoal(s)}
                                                            className="grid size-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                                                            aria-label="Hapus Soal"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={submitSoal} className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-650">
                                    {editingSoal ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}
                                </h3>
                                <div>
                                    <label className={labelCls} htmlFor="s-tanya">
                                        Teks Pertanyaan
                                    </label>
                                    <textarea
                                        id="s-tanya"
                                        rows={3}
                                        required
                                        className={inputCls}
                                        value={soalForm.pertanyaan}
                                        onChange={(e) => setSoalForm((d) => ({ ...d, pertanyaan: e.target.value }))}
                                        placeholder="Tulis pertanyaan di sini..."
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className={labelCls} htmlFor="s-poin">
                                        Bobot Poin
                                    </label>
                                    <input
                                        id="s-poin"
                                        type="number"
                                        min={1}
                                        required
                                        className={inputCls}
                                        value={soalForm.poin}
                                        onChange={(e) => setSoalForm((d) => ({ ...d, poin: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className={labelCls}>Pilihan Jawaban (Pilih satu yang benar)</label>
                                    {soalForm.pilihan.map((p, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="correct-choice"
                                                checked={p.benar}
                                                onChange={() => handleSelectCorrect(idx)}
                                                className="size-4 shrink-0 accent-indigo-600 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                required
                                                value={p.pilihan}
                                                onChange={(e) => handleChoiceChange(idx, e.target.value)}
                                                placeholder={`Pilihan ${idx + 1}`}
                                                className={inputCls}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {errors.pilihan && (
                                    <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-650">
                                        <AlertCircle className="size-4 shrink-0" /> {errors.pilihan}
                                    </div>
                                )}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCreatingSoal(false);
                                            setEditingSoal(null);
                                        }}
                                        className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex min-h-10 items-center rounded-xl bg-indigo-950 px-4 text-sm font-semibold text-white transition hover:bg-indigo-900 cursor-pointer"
                                    >
                                        {editingSoal ? 'Simpan Soal' : 'Tambahkan Soal'}
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="flex justify-end border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setManagingQuiz(null)}
                                className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                                Tutup Kelola Soal
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </GuruLayout>
    );
}
