import { Head } from '@inertiajs/react';
import { GALLERY } from '@/lib/constants';
import GuruLayout from '@/layouts/GuruLayout';

export default function GuruGaleri() {
    return (
        <GuruLayout>
            <Head title="Guru | Galeri" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-800">Galeri</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Dokumentasi fasilitas dan lingkungan Al Bayan Education.
                    </p>
                </div>

                <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
                    {GALLERY.map((photo) => (
                        <figure
                            key={photo.title}
                            className="group relative block overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-soft-hover"
                        >
                            <img
                                src={photo.image}
                                alt={photo.title}
                                loading="lazy"
                                className="block h-auto w-full object-cover transition duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/images/logo.png';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-5 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                <p className="font-semibold text-white">{photo.title}</p>
                                <p className="text-xs text-white/75">{photo.description}</p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </GuruLayout>
    );
}