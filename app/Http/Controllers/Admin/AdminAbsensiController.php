<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAbsensiController extends Controller
{
    public function index(Request $request): Response
    {
        $today = now()->toDateString();
        $dateQuery = $request->query('date', $today);
        $searchQuery = $request->query('search', '');

        // Student Logs
        $studentLogs = Absensi::with(['user', 'verifier'])
            ->whereHas('user', function ($query) use ($searchQuery) {
                $query->where('role', 'student');
                if (!empty($searchQuery)) {
                    $query->where('name', 'like', "%{$searchQuery}%")
                        ->orWhere('username', 'like', "%{$searchQuery}%");
                }
            })
            ->where('tanggal', $dateQuery)
            ->orderByDesc('waktu_masuk')
            ->get()
            ->map(fn ($abs) => [
                'id' => $abs->id,
                'name' => $abs->user->name ?? $abs->user->username,
                'username' => $abs->user->username,
                'waktu_masuk' => $abs->waktu_masuk,
                'status' => $abs->status,
                'kegiatan' => $abs->kegiatan,
                'keterangan' => $abs->keterangan,
                'verified' => $abs->verified_by !== null,
                'verifier_name' => $abs->verifier ? ($abs->verifier->name ?? $abs->verifier->username) : null,
            ]);

        // Teacher Logs
        $teacherLogs = Absensi::with(['user'])
            ->whereHas('user', function ($query) use ($searchQuery) {
                $query->where('role', 'guru');
                if (!empty($searchQuery)) {
                    $query->where('name', 'like', "%{$searchQuery}%")
                        ->orWhere('username', 'like', "%{$searchQuery}%");
                }
            })
            ->where('tanggal', $dateQuery)
            ->orderByDesc('waktu_masuk')
            ->get()
            ->map(fn ($abs) => [
                'id' => $abs->id,
                'name' => $abs->user->name ?? $abs->user->username,
                'username' => $abs->user->username,
                'waktu_masuk' => $abs->waktu_masuk,
                'status' => $abs->status,
                'kegiatan' => $abs->kegiatan,
            ]);

        // Overview Stats for today
        $totalStudents = User::where('role', 'student')->count();
        $totalTeachers = User::where('role', 'guru')->count();

        $studentsPresentToday = Absensi::where('tanggal', $dateQuery)
            ->whereHas('user', fn ($q) => $q->where('role', 'student'))
            ->where('status', 'hadir')
            ->count();

        $teachersPresentToday = Absensi::where('tanggal', $dateQuery)
            ->whereHas('user', fn ($q) => $q->where('role', 'guru'))
            ->where('status', 'hadir')
            ->count();

        return Inertia::render('Admin/Absensi', [
            'studentLogs' => $studentLogs,
            'teacherLogs' => $teacherLogs,
            'stats' => [
                'totalStudents' => $totalStudents,
                'totalTeachers' => $totalTeachers,
                'studentsPresent' => $studentsPresentToday,
                'teachersPresent' => $teachersPresentToday,
            ],
            'filters' => [
                'date' => $dateQuery,
                'search' => $searchQuery,
            ],
        ]);
    }
}
