<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\LogAktivitas;
use App\Models\Pengumuman;
use App\Models\ProgramKursus;
use App\Models\Sertifikat;
use App\Models\SiswaProgram;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuruController extends Controller
{
    public function home(): Response
    {
        $today = now()->toDateString();
        $thirtyDaysAgo = now()->subDays(30)->toDateString();

        // Core statistics
        $totalStudents = User::where('role', User::ROLE_STUDENT)->count();
        $totalPrograms = ProgramKursus::count();
        $hadirToday = Absensi::where('tanggal', $today)->where('status', 'hadir')->count();
        $pendingVerifications = Absensi::whereNull('verified_by')
            ->whereHas('user', fn ($q) => $q->where('role', User::ROLE_STUDENT))
            ->count();

        // Today's attendance breakdown (students only)
        $todayLogs = Absensi::where('tanggal', $today)
            ->whereHas('user', fn ($q) => $q->where('role', User::ROLE_STUDENT))
            ->get();

        $breakdown = [
            'hadir' => $todayLogs->where('status', 'hadir')->count(),
            'sakit' => $todayLogs->where('status', 'sakit')->count(),
            'izin' => $todayLogs->where('status', 'izin')->count(),
            'alpha' => $todayLogs->where('status', 'alpha')->count(),
            'total' => $todayLogs->count(),
        ];

        // 30-day attendance rate (students)
        $monthLogs = Absensi::where('tanggal', '>=', $thirtyDaysAgo)
            ->whereHas('user', fn ($q) => $q->where('role', User::ROLE_STUDENT))
            ->get();

        $attendanceRate = $monthLogs->isNotEmpty()
            ? (int) round($monthLogs->where('status', 'hadir')->count() / $monthLogs->count() * 100)
            : 0;

        // Recent activity: student and teacher check-ins
        $recentAbsensi = Absensi::with('user')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($abs) => [
                'id' => $abs->id,
                'name' => $abs->user->name ?? $abs->user->username,
                'role' => $abs->user->role === 'student' ? 'siswa' : $abs->user->role,
                'tanggal' => $abs->tanggal->format('Y-m-d'),
                'waktu' => $abs->waktu_masuk,
                'status' => $abs->status,
                'kegiatan' => $abs->kegiatan,
            ]);

        // Attendance waiting for verification
        $pendingList = Absensi::with('user')
            ->whereNull('verified_by')
            ->whereHas('user', fn ($q) => $q->where('role', User::ROLE_STUDENT))
            ->orderByDesc('tanggal')
            ->orderByDesc('created_at')
            ->limit(6)
            ->get()
            ->map(fn ($abs) => [
                'id' => $abs->id,
                'name' => $abs->user->name ?? $abs->user->username,
                'username' => $abs->user->username,
                'tanggal' => $abs->tanggal->format('Y-m-d'),
                'waktu' => $abs->waktu_masuk,
                'status' => $abs->status,
                'kegiatan' => $abs->kegiatan,
                'keterangan' => $abs->keterangan,
            ]);

        // Latest announcements
        $announcements = Pengumuman::aktif()
            ->orderByDesc('tanggal_publish')
            ->limit(3)
            ->get()
            ->map(fn ($pengumuman) => [
                'id' => $pengumuman->id,
                'judul' => $pengumuman->judul,
                'isi' => $pengumuman->isi,
                'tanggal' => $pengumuman->tanggal_publish->format('d M Y'),
            ]);

        // Recent program enrollments
        $recentEnrollments = SiswaProgram::with(['user.profile', 'program'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($enrollment) => [
                'id' => $enrollment->id,
                'student' => $enrollment->user?->profile?->full_name
                    ?? $enrollment->user?->name
                    ?? 'Siswa',
                'program' => $enrollment->program?->nama_program ?? 'Program',
                'tanggal' => $enrollment->created_at?->format('Y-m-d'),
            ]);

        return Inertia::render('Guru/Home', [
            'stats' => [
                'students' => $totalStudents,
                'programs' => $totalPrograms,
                'attendanceToday' => $hadirToday,
                'pendingVerifications' => $pendingVerifications,
            ],
            'breakdown' => $breakdown,
            'attendanceRate' => $attendanceRate,
            'recentAbsensi' => $recentAbsensi,
            'pendingList' => $pendingList,
            'announcements' => $announcements,
            'recentEnrollments' => $recentEnrollments,
        ]);
    }

    public function students(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $students = User::where('role', User::ROLE_STUDENT)
            ->with('profile')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhereHas('profile', function ($p) use ($search) {
                            $p->where('full_name', 'like', "%{$search}%")
                                ->orWhere('nim', 'like', "%{$search}%");
                        });
                });
            })
            ->withCount([
                'absensi as total_hadir' => fn ($q) => $q->where('status', 'hadir'),
                'siswaPrograms as program_count',
            ])
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $students->getCollection()->transform(fn ($user) => [
            'id' => $user->id,
            'name' => $user->profile?->full_name ?? $user->name ?? $user->username,
            'username' => $user->username,
            'nim' => $user->profile?->nim,
            'gender' => $user->profile?->gender,
            'phone' => $user->profile?->phone,
            'status' => $user->status,
            'programs' => $user->program_count,
            'totalHadir' => $user->total_hadir,
            'created_at' => $user->created_at?->format('d M Y'),
        ]);

        return Inertia::render('Guru/Siswa', [
            'students' => $students,
            'filters' => ['search' => $search],
        ]);
    }

    public function pengumuman(): Response
    {
        $announcements = Pengumuman::aktif()
            ->orderByDesc('tanggal_publish')
            ->get()
            ->map(fn ($pengumuman) => [
                'id' => $pengumuman->id,
                'judul' => $pengumuman->judul,
                'isi' => $pengumuman->isi,
                'gambar' => $pengumuman->gambar,
                'tanggal' => $pengumuman->tanggal_publish?->format('d M Y'),
            ]);

        return Inertia::render('Guru/Pengumuman', ['announcements' => $announcements]);
    }

    public function laporan(Request $request): Response
    {
        $from = $request->query('from', now()->subDays(29)->toDateString());
        $to = $request->query('to', now()->toDateString());

        $from = strtotime($from) ? date('Y-m-d', strtotime($from)) : now()->subDays(29)->toDateString();
        $to = strtotime($to) ? date('Y-m-d', strtotime($to)) : now()->toDateString();

        $logs = Absensi::with('user')
            ->whereHas('user', fn ($q) => $q->where('role', User::ROLE_STUDENT))
            ->whereBetween('tanggal', [$from, $to])
            ->orderByDesc('tanggal')
            ->get();

        $count = fn (string $status) => $logs->where('status', $status)->count();

        $summary = [
            'hadir' => $count('hadir'),
            'sakit' => $count('sakit'),
            'izin' => $count('izin'),
            'alpha' => $count('alpha'),
            'total' => $logs->count(),
        ];

        $rate = $logs->isNotEmpty() && $summary['total'] > 0
            ? (int) round($summary['hadir'] / $summary['total'] * 100)
            : 0;

        $perStudent = $logs->groupBy('user_id')
            ->map(fn ($items) => [
                'id' => $items->first()->id,
                'name' => $items->first()->user->name ?? $items->first()->user->username,
                'username' => $items->first()->user->username,
                'hadir' => $items->where('status', 'hadir')->count(),
                'sakit' => $items->where('status', 'sakit')->count(),
                'izin' => $items->where('status', 'izin')->count(),
                'alpha' => $items->where('status', 'alpha')->count(),
                'total' => $items->count(),
            ])
            ->values();

        $daily = $logs->groupBy('tanggal')
            ->map(fn ($items) => [
                'tanggal' => $items->first()->tanggal->format('Y-m-d'),
                'hadir' => $items->where('status', 'hadir')->count(),
                'sakit' => $items->where('status', 'sakit')->count(),
                'izin' => $items->where('status', 'izin')->count(),
                'alpha' => $items->where('status', 'alpha')->count(),
                'total' => $items->count(),
            ])
            ->sortByDesc('tanggal')
            ->values();

        return Inertia::render('Guru/Laporan', [
            'summary' => $summary,
            'rate' => $rate,
            'perStudent' => $perStudent,
            'daily' => $daily,
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }

    public function profil(): Response
    {
        $user = auth()->user();

        return Inertia::render('Guru/Profil', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'jabatan' => $user->jabatan,
                'phone' => $user->phone,
                'nik' => $user->nik,
                'address' => $user->address,
                'birth_date' => $user->birth_date?->format('Y-m-d'),
                'role' => $user->role,
                'last_activity_at' => $user->last_activity_at?->format('d M Y H:i'),
                'created_at' => $user->created_at?->format('d M Y'),
            ],
        ]);
    }

    public function updateProfil(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'jabatan' => ['nullable', 'string', 'max:64'],
            'phone' => ['nullable', 'string', 'max:32'],
            'nik' => ['nullable', 'string', 'max:32'],
            'address' => ['nullable', 'string', 'max:500'],
            'birth_date' => ['nullable', 'date'],
        ]);

        $user->update($data);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function sertifikat(): Response
    {
        $certificates = Sertifikat::with(['user', 'program'])
            ->orderByDesc('tanggal_terbit')
            ->limit(50)
            ->get()
            ->map(fn ($sertifikat) => [
                'id' => $sertifikat->id,
                'student' => $sertifikat->user?->name ?? $sertifikat->user?->username ?? 'Siswa',
                'program' => $sertifikat->program?->nama_program ?? 'Program',
                'nomor' => $sertifikat->nomor_sertifikat,
                'tanggal' => $sertifikat->tanggal_terbit?->format('d M Y'),
                'status' => $sertifikat->status,
            ]);

        return Inertia::render('Guru/Sertifikat', ['certificates' => $certificates]);
    }

    public function galeri(): Response
    {
        return Inertia::render('Guru/Galeri');
    }

    public function aktivitas(): Response
    {
        $logs = LogAktivitas::with('user')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'name' => $log->user?->name ?? $log->user?->username ?? 'Sistem',
                'role' => $log->user?->role ?? 'system',
                'aktivitas' => $log->aktivitas,
                'ip_address' => $log->ip_address,
                'browser' => $log->browser,
                'tanggal' => $log->created_at?->format('d M Y'),
                'jam' => $log->created_at?->format('H:i'),
            ]);

        return Inertia::render('Guru/Aktivitas', ['logs' => $logs]);
    }
}
