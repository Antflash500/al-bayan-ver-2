<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiswaAbsensiController extends Controller
{
    public function index(Request $request): Response
    {
        $student = $request->user();
        $today = now()->toDateString();

        // Student's own check-in log for today
        $todayLog = Absensi::where('user_id', $student->id)
            ->where('tanggal', $today)
            ->first();

        // Student's attendance history (limit to last 30 entries)
        $history = Absensi::with('verifier')
            ->where('user_id', $student->id)
            ->orderByDesc('tanggal')
            ->limit(30)
            ->get()
            ->map(fn ($abs) => [
                'id' => $abs->id,
                'tanggal' => $abs->tanggal->format('Y-m-d'),
                'waktu_masuk' => $abs->waktu_masuk,
                'status' => $abs->status,
                'kegiatan' => $abs->kegiatan,
                'keterangan' => $abs->keterangan,
                'verified' => $abs->verified_by !== null,
                'verifier_name' => $abs->verifier ? ($abs->verifier->name ?? $abs->verifier->username) : null,
            ]);

        return Inertia::render('Siswa/Absensi', [
            'todayLog' => $todayLog,
            'history' => $history,
        ]);
    }

    public function checkIn(Request $request)
    {
        $student = $request->user();
        $today = now()->toDateString();

        $existing = Absensi::where('user_id', $student->id)
            ->where('tanggal', $today)
            ->first();

        if ($existing) {
            return back()->withErrors(['error' => 'Anda sudah melakukan absensi hari ini.']);
        }

        $data = $request->validate([
            'status' => ['required', 'in:hadir,sakit,izin'],
            'kegiatan' => ['required_if:status,hadir', 'nullable', 'string', 'max:1000'],
            'keterangan' => ['required_if:status,sakit,status,izin', 'nullable', 'string', 'max:500'],
        ]);

        Absensi::create([
            'user_id' => $student->id,
            'tanggal' => $today,
            'waktu_masuk' => now()->toTimeString(),
            'status' => $data['status'],
            'kegiatan' => $data['status'] === 'hadir' ? $data['kegiatan'] : null,
            'keterangan' => $data['status'] !== 'hadir' ? $data['keterangan'] : null,
            'verified_by' => null, // Pending teacher/admin verification
        ]);

        return back()->with('success', 'Absensi berhasil dikirim. Menunggu verifikasi ustadz/admin.');
    }
}
