<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SecurityLog;
use App\Services\AuthenticationService;
use App\Support\SecurityGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function __construct(private readonly AuthenticationService $authService) {}

    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
            // Honeypot anti-bot: field tersembunyi yang harus tetap kosong.
            'website' => ['prohibited'],
        ]);

        $user = $this->authService->login($data['username'], $data['password']);

        if (! $user) {
            SecurityGuard::recordLoginFailure((string) $request->ip());
            SecurityGuard::recordEndpoint(SecurityLog::TIPE_LOGIN_GAGAL, (string) $request->ip(), [
                'path' => '/login',
                'keterangan' => 'Percobaan login gagal untuk username: '.$data['username'],
            ]);

            return back()->withErrors([
                'username' => 'Username atau password salah, atau akun belum diaktifkan admin.',
            ]);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        SecurityGuard::clearLoginFailures((string) $request->ip());
        SecurityGuard::recordEndpoint(SecurityLog::TIPE_LOGIN_SUKSES, (string) $request->ip(), [
            'path' => '/login',
            'browser' => substr((string) $request->userAgent(), 0, 190),
            'keterangan' => 'Login berhasil melalui portal.',
        ], $user->id);

        if ($user->isAdmin()) {
            return redirect()->route('admin.home');
        } elseif ($user->isGuru()) {
            return redirect()->route('guru.home');
        } else {
            return redirect()->route('siswa.dashboard');
        }
    }
}
