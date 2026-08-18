import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    BookOpen,
    Clock,
    FileText,
    Layers,
    Pencil,
    X,
} from 'lucide-react';
import GuruLayout from '@/layouts/GuruLayout';
import { cropSquare, mediaUrl } from '@/lib/image';
import type { ProgramKursus } from '@/types/models';

const inputCls =
    'w-full rounded-[var(--radius-input)] border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';
const labelCls = 'mb-1.5 block text-xs font-semibold text-slate-500';

function Modal({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
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
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 shadow-xl">
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

const emptyForm = {
    nama_program: '',
    deskripsi: '',
    instruktur: '',
    tingkat: 'pemula',
    durasi_jam: '',
    harga: '',
    requires_dorm: false,
    status: 'aktif',
    thumbnail: null as Blob | null,
};

export default function Programs({
    programs,
    stats,
    flash,
}: {
    programs: ProgramKursus[];
    stats: { total: number; aktif: number; materi: number };
    flash?: { success?: string };
}) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [editing, setEditing] = useState<ProgramKursus | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [preview, setPreview] = useState<string>('');
    const [cropping, setCropping] = useState(false);

    const openEdit = (p: ProgramKursus) => {
        setForm({
            nama_program: p.nama_program,
            deskripsi: p.deskripsi ?? '',
            instruktur: p.instruktur ?? '',
            tingkat: String(p.tingkat ?? 'pemula').toLowerCase(),
            durasi_jam: String(p.durasi_jam ?? ''),
            harga: p.harga !== undefined && p.harga !== null ? String(p.harga) : '',
            requires_dorm: Boolean(p.requires_dorm ?? false),
            status: p.status,
            thumbnail: null,
        });
        setPreview(mediaUrl(p.thumbnail));
        setEditing(p);
    };

    const pickThumbnail = async (file?: File) => {
        if (!file) {
            setForm((d) => ({ ...d, thumbnail: null }));
            setPreview('');
            return;
        }
        setCropping(true);
        try {
            const blob = await cropSquare(file);
            if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
            setForm((d) => ({ ...d, thumbnail: blob }));
            setPreview(URL.createObjectURL(blob));
        } catch {
            setForm((d) => ({ ...d, thumbnail: null }));
        } finally {
            setCropping(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        const data = new FormData();
        data.append('nama_program', form.nama_program);
        data.append('deskripsi', form.deskripsi);
        data.append('instruktur', form.instruktur);
        data.append('tingkat', form.tingkat);
        data.append('durasi_jam', String(form.durasi_jam));
        data.append('harga', String(form.harga === '' ? 0 : form.harga));
        data.append('requires_dorm', form.requires_dorm ? '1' : '0');
        data.append('status', form.status);
        if (form.thumbnail) data.append('thumbnail', form.thumbnail, 'thumbnail.jpg');

        router.patch(`/guru/programs/${editing.id}`, data, {
            forceFormData: true,
            onSuccess: () => {
                setEditing(null);
                setForm(emptyForm);
                setPreview('');
            },
        });
    };

    return (
        <GuruLayout>
            <Head title="Guru | Program & Materi" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-2xl text-slate-800 sm:text-3xl font-bold">Daftar Program</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Pilih program di bawah ini untuk mengedit bab, konten pembelajaran, dan kelola kuis/latihan.
                    </p>
                </div>
            </div>

            {flash?.success && (
                <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {flash.success}
                </p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { label: 'Total Program', value: stats.total, icon: Layers, color: 'bg-indigo-50 text-indigo-650' },
                    { label: 'Program Aktif', value: stats.aktif, icon: BookOpen, color: 'bg-violet-50 text-violet-650' },
                    { label: 'Total Materi Bab', value: stats.materi, icon: FileText, color: 'bg-emerald-50 text-emerald-650' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="flex items-center gap-4 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-soft"
                    >
                        <span className={`grid size-11 place-items-center rounded-xl ${color}`}>
                            <Icon className="size-5" />
                        </span>
                        <div>
                            <p className="font-display text-2xl text-slate-800 font-bold">{value}</p>
                            <p className="text-sm text-slate-500 font-medium">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {programs.map((p) => (
                    <div
                        key={p.id}
                        className="flex flex-col rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 shadow-soft hover:shadow-soft-hover transition duration-200"
                    >
                        <div className="relative mb-4 -mt-2 aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                            {p.thumbnail ? (
                                <img
                                    src={mediaUrl(p.thumbnail)}
                                    alt={p.nama_program}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="grid h-full w-full place-items-center text-xs font-semibold text-slate-400">
                                    Tidak ada gambar
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                {p.kategori?.nama_kategori ?? 'Umum'}
                            </span>
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    p.status === 'aktif'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {p.status}
                            </span>
                        </div>
                        <h2 className="mt-3 font-display text-lg leading-snug text-slate-850 font-bold text-slate-800">
                            {p.nama_program}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400 font-medium">{p.instruktur ?? 'Tim Pengajar Al Bayan'}</p>
                        
                        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <BookOpen className="size-3.5" /> {p.materi_list_count ?? 0} bab
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="size-3.5" /> {p.durasi_jam} jam
                            </span>
                            <span className="ml-auto capitalize bg-slate-50 px-2 py-0.5 rounded">{p.tingkat}</span>
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => router.get(`/guru/programs/${p.id}/materi`)}
                                className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                            >
                                <BookOpen className="size-3.5" /> Kelola Bab & Kuis
                            </button>
                            <button
                                type="button"
                                onClick={() => openEdit(p)}
                                className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                            >
                                <Pencil className="size-3.5" /> Edit Detail
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {editing && (
                <Modal title="Edit Detail Program" onClose={() => setEditing(null)}>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className={labelCls} htmlFor="np-thumb">
                                Gambar Program (1:1 Aspect Ratio)
                            </label>
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="mb-3 aspect-square w-32 rounded-xl border border-slate-250 object-cover"
                                />
                            )}
                            <input
                                id="np-thumb"
                                type="file"
                                accept="image/*"
                                className={inputCls}
                                onChange={(e) => pickThumbnail(e.target.files?.[0])}
                            />
                            <p className="mt-1 text-xs text-slate-400">
                                {cropping
                                    ? 'Memotong gambar ke ukuran 1:1…'
                                    : 'Pilih gambar pengganti jika ingin memperbarui thumbnail.'}
                            </p>
                        </div>
                        <div>
                            <label className={labelCls} htmlFor="np-name">
                                Nama Program
                            </label>
                            <input
                                id="np-name"
                                className={inputCls}
                                required
                                value={form.nama_program}
                                onChange={(e) => setForm((d) => ({ ...d, nama_program: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className={labelCls} htmlFor="np-desc">
                                Deskripsi Program
                            </label>
                            <textarea
                                id="np-desc"
                                rows={3}
                                className={inputCls}
                                value={form.deskripsi}
                                onChange={(e) => setForm((d) => ({ ...d, deskripsi: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className={labelCls} htmlFor="np-instruktur">
                                Nama Ustadz / Instruktur
                            </label>
                            <input
                                id="np-instruktur"
                                className={inputCls}
                                value={form.instruktur}
                                onChange={(e) => setForm((d) => ({ ...d, instruktur: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls} htmlFor="np-tingkat">
                                    Tingkat Kesulitan
                                </label>
                                <select
                                    id="np-tingkat"
                                    className={inputCls}
                                    value={form.tingkat}
                                    onChange={(e) => setForm((d) => ({ ...d, tingkat: e.target.value }))}
                                >
                                    <option value="pemula">Pemula</option>
                                    <option value="menengah">Menengah</option>
                                    <option value="lanjutan">Lanjutan</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="np-durasi">
                                    Durasi (jam)
                                </label>
                                <input
                                    id="np-durasi"
                                    type="number"
                                    min={1}
                                    className={inputCls}
                                    required
                                    value={form.durasi_jam}
                                    onChange={(e) => setForm((d) => ({ ...d, durasi_jam: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="inline-flex min-h-10 items-center rounded-xl bg-indigo-950 px-4 text-sm font-semibold text-white transition hover:bg-indigo-900"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </GuruLayout>
    );
}
