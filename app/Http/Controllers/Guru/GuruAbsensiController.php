<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuruAbsensiController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher = $request->user();
        $today = now()->toDateString();
        $dateQuery = $request->query('date', $today);
        $searchQuery = $request->query('search', '');

        // Teacher's own log for today
        $todayLog = Absensi::where('user_id', $teacher->id)
            ->where('tanggal', $today)
            ->first();

        // Teacher's own attendance history
        $teacherHistory = Absensi::where('user_id', $teacher->id)
            ->orderByDesc('tanggal')
            ->limit(10)
            ->get();

        // Student logs on selected date
        $studentLogsQuery = Absensi::with('user')
            ->whereHas('user', function ($query) use ($searchQuery) {
                $query->where('role', 'student');
                if (!empty($searchQuery)) {
                    $query->where('name', 'like', "%{$searchQuery}%")
                        ->orWhere('username', 'like', "%{$searchQuery}%");
                }
            })
            ->where('tanggal', $dateQuery)
            ->orderByDesc('waktu_masuk');

        $studentLogs = $studentLogsQuery->get()->map(fn ($abs) => [
            'id' => $abs->id,
            'name' => $abs->user->name ?? $abs->user->username,
            'username' => $abs->user->username,
            'waktu_masuk' => $abs->waktu_masuk,
            'status' => $abs->status,
            'kegiatan' => $abs->kegiatan,
            'keterangan' => $abs->keterangan,
            'verified' => $abs->verified_by !== null,
        ]);

        return Inertia::render('Guru/Absensi', [
            'todayLog' => $todayLog,
            'history' => $teacherHistory,
            'studentLogs' => $studentLogs,
            'filters' => [
                'date' => $dateQuery,
                'search' => $searchQuery,
            ],
        ]);
    }

    public function checkIn(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();

        $existing = Absensi::where('user_id', $user->id)
            ->where('tanggal', $today)
            ->first();

        if ($existing) {
            return back()->withErrors(['error' => 'Anda sudah melakukan absensi hari ini.']);
        }

        $data = $request->validate([
            'kegiatan' => ['required', 'string', 'max:1000'],
        ]);

        Absensi::create([
            'user_id' => $user->id,
            'tanggal' => $today,
            'waktu_masuk' => now()->toTimeString(),
            'status' => 'hadir',
            'kegiatan' => $data['kegiatan'],
            'verified_by' => $user->id, // auto-verified for teacher
        ]);

        return back()->with('success', 'Absensi kehadiran guru berhasil tercatat.');
    }

    public function verify(Request $request, Absensi $absensi)
    {
        $teacher = $request->user();

        $data = $request->validate([
            'status' => ['required', 'in:hadir,sakit,izin,alpha'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ]);

        $absensi->update([
            'status' => $data['status'],
            'keterangan' => $data['keterangan'] ?? $absensi->keterangan,
            'verified_by' => $teacher->id,
        ]);

        return back()->with('success', 'Absensi siswa berhasil diverifikasi.');
    }
}
