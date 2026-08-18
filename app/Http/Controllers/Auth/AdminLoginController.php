<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SecurityLog;
use App\Models\User;
use App\Support\SecurityGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminLoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Admin/Login');
    }

    public function store(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            // Honeypot anti-bot: field tersembunyi yang harus tetap kosong.
            'website' => ['prohibited'],
        ]);

        $user = User::where('username', $data['username'])
            ->orWhere('email', $data['username'])
            ->first();

        if (! $user
            || ! Hash::check($data['password'], $user->password)
            || ! $user->isAdmin()
            || $user->status !== User::STATUS_AKTIF) {
            SecurityGuard::recordLoginFailure((string) $request->ip());
            SecurityGuard::recordEndpoint(SecurityLog::TIPE_LOGIN_GAGAL, (string) $request->ip(), [
                'path' => '/admin/login',
                'keterangan' => 'Percobaan login admin gagal untuk username: '.$data['username'],
            ]);

            throw ValidationException::withMessages([
                'username' => 'Kredensial tidak valid, atau akun admin nonaktif.',
            ]);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        SecurityGuard::clearLoginFailures((string) $request->ip());
        SecurityGuard::recordEndpoint(SecurityLog::TIPE_LOGIN_SUKSES, (string) $request->ip(), [
            'path' => '/admin/login',
            'browser' => substr((string) $request->userAgent(), 0, 190),
            'keterangan' => 'Login admin berhasil.',
        ], $user->id);

        return redirect()->route('admin.home');
    }
}
