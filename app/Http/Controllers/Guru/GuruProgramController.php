<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Materi;
use App\Models\MateriKonten;
use App\Models\ProgramKursus;
use App\Models\Quiz;
use App\Models\SoalQuiz;
use App\Models\PilihanJawaban;
use App\Support\UploadSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GuruProgramController extends Controller
{
    // List programs assigned/available
    public function index(): Response
    {
        $programs = ProgramKursus::with('kategori')
            ->withCount('materiList')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Guru/Programs', [
            'programs' => $programs,
            'stats' => [
                'total' => ProgramKursus::count(),
                'aktif' => ProgramKursus::aktif()->count(),
                'materi' => ProgramKursus::withCount('materiList')->get()->sum('materi_list_count'),
            ],
        ]);
    }

    // Edit program detail
    public function updateProgram(Request $request, ProgramKursus $program)
    {
        $request->merge(['tingkat' => strtolower((string) $request->input('tingkat'))]);

        $data = $request->validate([
            'nama_program' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string', 'max:2000'],
            'instruktur' => ['nullable', 'string', 'max:255'],
            'tingkat' => ['required', 'in:pemula,menengah,lanjutan'],
            'durasi_jam' => ['required', 'numeric', 'min:1'],
            'harga' => ['nullable', 'numeric', 'min:0'],
            'requires_dorm' => ['sometimes', 'boolean'],
            'status' => ['required', 'in:aktif,nonaktif,draft'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:8192'],
        ]);

        $program->fill($data);

        if ($request->hasFile('thumbnail')) {
            $program->thumbnail = $this->storeSafe($request->file('thumbnail'), 'programs', 'thumbnail');
        }

        $program->save();

        return back()->with('success', 'Program diperbarui oleh guru.');
    }

    // Detail materi inside program (chapter / bab & contents & quizzes)
    public function materi(ProgramKursus $program): Response
    {
        $materis = $program->materiList()
            ->with(['kontens', 'quizes.soalList.pilihan'])
            ->orderBy('urutan')
            ->get();

        return Inertia::render('Guru/ProgramMateri', [
            'program' => [
                'id' => $program->id,
                'nama_program' => $program->nama_program,
                'slug' => $program->slug,
            ],
            'materis' => $materis->map(fn (Materi $materi) => [
                'id' => $materi->id,
                'judul' => $materi->judul,
                'slug' => $materi->slug,
                'deskripsi' => $materi->deskripsi,
                'urutan' => $materi->urutan,
                'estimasi_menit' => $materi->estimasi_menit,
                'status' => $materi->status,
                'gambar_url' => $materi->gambar_url,
                'gambar_name' => $materi->gambar_name,
                'gambar_size' => $materi->gambar_size,
                'pdf_url' => $materi->pdf_url,
                'pdf_name' => $materi->pdf_name,
                'pdf_size' => $materi->pdf_size,
                'video_url' => $materi->video_url,
                'video_name' => $materi->video_name,
                'video_size' => $materi->video_size,
                'kontens' => $materi->kontens->map(fn (MateriKonten $konten) => [
                    'id' => $konten->id,
                    'tipe' => $konten->tipe,
                    'judul' => $konten->judul,
                    'konten' => $konten->konten,
                    'url' => $konten->url,
                    'file_path' => $konten->file_path,
                    'file_name' => $konten->file_name,
                    'file_size' => $konten->file_size,
                    'urutan' => $konten->urutan,
                    'media_url' => $konten->file_path ? url('/media/materi/'.basename($konten->file_path)) : null,
                ])->values(),
                'quizes' => $materi->quizes->map(fn (Quiz $q) => [
                    'id' => $q->id,
                    'judul' => $q->judul,
                    'deskripsi' => $q->deskripsi,
                    'nilai_minimum' => $q->nilai_minimum,
                    'durasi_menit' => $q->durasi_menit,
                    'acak_soal' => $q->acak_soal,
                    'status' => $q->status,
                    'soal_list' => $q->soalList->map(fn (SoalQuiz $s) => [
                        'id' => $s->id,
                        'pertanyaan' => $s->pertanyaan,
                        'jenis' => $s->jenis,
                        'poin' => $s->poin,
                        'urutan' => $s->urutan,
                        'pilihan' => $s->pilihan->map(fn (PilihanJawaban $p) => [
                            'id' => $p->id,
                            'pilihan' => $p->pilihan,
                            'benar' => $p->benar,
                        ])->values(),
                    ])->values(),
                ])->values(),
            ])->values(),
        ]);
    }

    // Chapters (Bab) CRUD
    public function storeMateri(Request $request, ProgramKursus $program)
    {
        $data = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string', 'max:5000'],
            'estimasi_menit' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'in:aktif,draft,arsip'],
            'gambar' => ['nullable', 'file', 'image', 'max:10240'],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'max:51200'],
            'video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/ogg', 'max:204800'],
        ]);

        $urutan = (int) $program->materiList()->max('urutan') + 1;

        Materi::create([
            'program_id' => $program->id,
            'judul' => $data['judul'],
            'slug' => Str::slug($data['judul']).'-'.Str::lower(Str::random(5)),
            'deskripsi' => $data['deskripsi'] ?? null,
            'urutan' => $urutan,
            'estimasi_menit' => $data['estimasi_menit'] ?? 0,
            'status' => $data['status'] ?? 'aktif',
        ] + $this->resolveBabFiles($request));

        $program->update(['jumlah_materi' => $program->materiList()->count()]);

        return back()->with('success', 'Bab materi berhasil ditambahkan.');
    }

    public function updateMateri(Request $request, ProgramKursus $program, Materi $materi)
    {
        $data = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string', 'max:5000'],
            'estimasi_menit' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'in:aktif,draft,arsip'],
            'gambar' => ['nullable', 'file', 'image', 'max:10240'],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'max:51200'],
            'video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/ogg', 'max:204800'],
        ]);

        $files = [];
        foreach (['gambar', 'pdf', 'video'] as $field) {
            $files = array_merge($files, $this->syncBabFile($request, $materi, $field));
        }

        $materi->update([
            'judul' => $data['judul'],
            'deskripsi' => $data['deskripsi'] ?? null,
            'estimasi_menit' => $data['estimasi_menit'] ?? 0,
            'status' => $data['status'] ?? 'aktif',
        ] + $files);

        return back()->with('success', 'Bab materi diperbarui.');
    }

    public function destroyMateri(ProgramKursus $program, Materi $materi)
    {
        $materi->delete();
        $program->update(['jumlah_materi' => $program->materiList()->count()]);

        return back()->with('success', 'Bab materi dihapus.');
    }

    public function moveMateri(ProgramKursus $program, Materi $materi, string $direction)
    {
        abort_unless(in_array($direction, ['up', 'down'], true), 422);
        $siblings = $program->materiList()->orderBy('urutan')->pluck('urutan', 'id')->toArray();
        $this->swapWithNeighbor($materi->id, $materi->urutan, $direction, $siblings, Materi::class, 'program_id', $program->id);
        return back()->with('success', 'Urutan bab materi disimpan.');
    }

    // Bab Contents CRUD
    public function storeKonten(Request $request, ProgramKursus $program, Materi $materi)
    {
        $data = $request->validate([
            'tipe' => ['required', 'string', 'in:teks,pdf,video,gambar,video_link'],
            'judul' => ['nullable', 'string', 'max:255'],
            'konten' => ['nullable', 'string', 'max:20000'],
            'url' => ['nullable', 'string', 'max:500'],
            'file' => ['nullable', 'file', 'max:204800'],
        ]);

        $tipe = $data['tipe'];
        if ($tipe === 'teks' && blank($data['konten'] ?? null)) {
            return back()->withErrors(['error' => 'Konten teks wajib diisi.']);
        }
        if ($tipe === 'video_link' && blank($data['url'] ?? null)) {
            return back()->withErrors(['error' => 'Link video wajib diisi.']);
        }
        if (in_array($tipe, ['pdf', 'video', 'gambar'], true) && ! $request->hasFile('file')) {
            return back()->withErrors(['error' => 'File wajib diunggah untuk tipe ini.']);
        }

        $fileData = $this->resolveUploadedFile($request, $tipe);
        $urutan = (int) MateriKonten::where('materi_id', $materi->id)->max('urutan') + 1;

        MateriKonten::create([
            'materi_id' => $materi->id,
            'tipe' => $tipe,
            'judul' => $data['judul'] ?? null,
            'konten' => $data['konten'] ?? null,
            'url' => $data['url'] ?? null,
            'urutan' => $urutan,
            'status' => 'aktif',
        ] + $fileData);

        return back()->with('success', 'Konten materi ditambahkan.');
    }

    public function updateKonten(Request $request, ProgramKursus $program, Materi $materi, MateriKonten $konten)
    {
        $data = $request->validate([
            'tipe' => ['nullable', 'string', 'in:teks,pdf,video,gambar,video_link'],
            'judul' => ['nullable', 'string', 'max:255'],
            'konten' => ['nullable', 'string', 'max:20000'],
            'url' => ['nullable', 'string', 'max:500'],
            'file' => ['nullable', 'file', 'max:204800'],
        ]);

        $tipe = $data['tipe'] ?? $konten->tipe;
        if ($tipe === 'teks' && blank($data['konten'] ?? null)) {
            return back()->withErrors(['error' => 'Konten teks wajib diisi.']);
        }

        $fileData = $this->resolveUploadedFile($request, $tipe);

        $konten->update([
            'tipe' => $tipe,
            'judul' => array_key_exists('judul', $data) ? ($data['judul'] ?? null) : $konten->judul,
            'konten' => array_key_exists('konten', $data) ? ($data['konten'] ?? null) : $konten->konten,
            'url' => array_key_exists('url', $data) ? ($data['url'] ?? null) : $konten->url,
        ] + $fileData);

        return back()->with('success', 'Konten materi diperbarui.');
    }

    public function destroyKonten(ProgramKursus $program, Materi $materi, MateriKonten $konten)
    {
        if ($konten->file_path) {
            Storage::disk('public')->delete($konten->file_path);
        }
        $konten->delete();
        return back()->with('success', 'Konten materi dihapus.');
    }

    public function moveKonten(ProgramKursus $program, Materi $materi, MateriKonten $konten, string $direction)
    {
        abort_unless(in_array($direction, ['up', 'down'], true), 422);
        $siblings = MateriKonten::where('materi_id', $materi->id)->orderBy('urutan')->pluck('urutan', 'id')->toArray();
        $this->swapWithNeighbor($konten->id, $konten->urutan, $direction, $siblings, MateriKonten::class, 'materi_id', $materi->id);
        return back()->with('success', 'Urutan konten disimpan.');
    }

    // Quizzes CRUD
    public function storeQuiz(Request $request, ProgramKursus $program, Materi $materi)
    {
        $data = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
            'nilai_minimum' => ['required', 'integer', 'min:0', 'max:100'],
            'durasi_menit' => ['required', 'integer', 'min:0'],
            'acak_soal' => ['required', 'boolean'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        Quiz::create([
            'materi_id' => $materi->id,
            'judul' => $data['judul'],
            'deskripsi' => $data['deskripsi'] ?? null,
            'nilai_minimum' => $data['nilai_minimum'],
            'durasi_menit' => $data['durasi_menit'],
            'acak_soal' => $data['acak_soal'],
            'status' => $data['status'],
        ]);

        return back()->with('success', 'Kuis berhasil dibuat.');
    }

    public function updateQuiz(Request $request, ProgramKursus $program, Materi $materi, Quiz $quiz)
    {
        $data = $request->validate([
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
            'nilai_minimum' => ['required', 'integer', 'min:0', 'max:100'],
            'durasi_menit' => ['required', 'integer', 'min:0'],
            'acak_soal' => ['required', 'boolean'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        $quiz->update($data);

        return back()->with('success', 'Kuis berhasil diperbarui.');
    }

    public function destroyQuiz(ProgramKursus $program, Materi $materi, Quiz $quiz)
    {
        $quiz->delete();
        return back()->with('success', 'Kuis berhasil dihapus.');
    }

    // Questions CRUD
    public function storeSoal(Request $request, ProgramKursus $program, Materi $materi, Quiz $quiz)
    {
        $data = $request->validate([
            'pertanyaan' => ['required', 'string'],
            'poin' => ['required', 'integer', 'min:1'],
            'pilihan' => ['required', 'array', 'min:2'],
            'pilihan.*.pilihan' => ['required', 'string'],
            'pilihan.*.benar' => ['required', 'boolean'],
        ]);

        // Validate that at least one option is correct
        $hasCorrect = collect($data['pilihan'])->contains('benar', true);
        if (! $hasCorrect) {
            return back()->withErrors(['pilihan' => 'Minimal satu pilihan jawaban harus benar.']);
        }

        $urutan = (int) SoalQuiz::where('quiz_id', $quiz->id)->max('urutan') + 1;

        $soal = SoalQuiz::create([
            'quiz_id' => $quiz->id,
            'pertanyaan' => $data['pertanyaan'],
            'jenis' => 'pilihan_ganda',
            'poin' => $data['poin'],
            'urutan' => $urutan,
        ]);

        foreach ($data['pilihan'] as $opt) {
            PilihanJawaban::create([
                'soal_id' => $soal->id,
                'pilihan' => $opt['pilihan'],
                'benar' => $opt['benar'],
            ]);
        }

        return back()->with('success', 'Pertanyaan kuis berhasil ditambahkan.');
    }

    public function updateSoal(Request $request, ProgramKursus $program, Materi $materi, Quiz $quiz, SoalQuiz $soal)
    {
        $data = $request->validate([
            'pertanyaan' => ['required', 'string'],
            'poin' => ['required', 'integer', 'min:1'],
            'pilihan' => ['required', 'array', 'min:2'],
            'pilihan.*.pilihan' => ['required', 'string'],
            'pilihan.*.benar' => ['required', 'boolean'],
        ]);

        $hasCorrect = collect($data['pilihan'])->contains('benar', true);
        if (! $hasCorrect) {
            return back()->withErrors(['pilihan' => 'Minimal satu pilihan jawaban harus benar.']);
        }

        $soal->update([
            'pertanyaan' => $data['pertanyaan'],
            'poin' => $data['poin'],
        ]);

        // Recreate choices
        $soal->pilihan()->delete();
        foreach ($data['pilihan'] as $opt) {
            PilihanJawaban::create([
                'soal_id' => $soal->id,
                'pilihan' => $opt['pilihan'],
                'benar' => $opt['benar'],
            ]);
        }

        return back()->with('success', 'Pertanyaan kuis berhasil diperbarui.');
    }

    public function destroySoal(ProgramKursus $program, Materi $materi, Quiz $quiz, SoalQuiz $soal)
    {
        $soal->delete();
        return back()->with('success', 'Pertanyaan kuis berhasil dihapus.');
    }

    // Helper functions for file management
    private function resolveBabFiles(Request $request): array
    {
        $files = [];
        foreach (['gambar', 'pdf', 'video'] as $field) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);
                $path = $this->storeSafe($file, 'materi', $field);
                $files[$field.'_path'] = $path;
                $files[$field.'_name'] = $file->getClientOriginalName();
                $files[$field.'_size'] = $file->getSize();
            }
        }
        return $files;
    }

    private function syncBabFile(Request $request, Materi $materi, string $field): array
    {
        $pathKey = $field.'_path';
        $nameKey = $field.'_name';
        $sizeKey = $field.'_size';
        $existing = $materi->{$pathKey};

        if ($request->boolean('remove_'.$field)) {
            if ($existing) {
                Storage::disk('public')->delete($existing);
            }
            return [$pathKey => null, $nameKey => null, $sizeKey => null];
        }

        if (! $request->hasFile($field)) {
            return [];
        }

        if ($existing) {
            Storage::disk('public')->delete($existing);
        }

        $file = $request->file($field);
        $path = $this->storeSafe($file, 'materi', $field);

        return [
            $pathKey => $path,
            $nameKey => $file->getClientOriginalName(),
            $sizeKey => $file->getSize(),
        ];
    }

    private function resolveUploadedFile(Request $request, string $tipe): array
    {
        $file = $request->file('file');
        if (! $file) {
            return [];
        }

        $mime = strtolower((string) $file->getMimeType());
        $allowed = match ($tipe) {
            'pdf' => $mime === 'application/pdf',
            'gambar' => str_starts_with($mime, 'image/'),
            'video' => str_starts_with($mime, 'video/'),
            default => false,
        };

        if (! $allowed) {
            abort(422, 'Jenis file tidak sesuai dengan tipe konten.');
        }

        $path = $this->storeSafe($file, 'materi', $tipe);
        return [
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
        ];
    }

    private function storeSafe($file, string $dir, string $field): string
    {
        $context = match ($field) {
            'pdf' => 'pdf',
            'video' => 'video',
            default => 'image',
        };

        try {
            return UploadSanitizer::store($file, $dir, $context);
        } catch (\Throwable $e) {
            abort(422, 'Jenis berkas tidak diizinkan untuk konten ini.');
        }
    }

    private function swapWithNeighbor(int $id, int $urutan, string $direction, array $siblings, string $model, string $parentKey, int $parentId): void
    {
        $ids = array_keys($siblings);
        $index = array_search($id, $ids, true);
        if ($index === false) {
            return;
        }

        $neighborIndex = $direction === 'up' ? $index - 1 : $index + 1;
        if ($neighborIndex < 0 || $neighborIndex >= count($ids)) {
            return;
        }

        $neighborId = $ids[$neighborIndex];
        $model::where('id', $id)->where($parentKey, $parentId)->update(['urutan' => $siblings[$neighborId]]);
        $model::where('id', $neighborId)->where($parentKey, $parentId)->update(['urutan' => $urutan]);
    }
}
