<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\StudentProfile;
use App\Models\User;
use App\Repositories\StudentRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Throwable;

class AuthenticationService
{
    public const OTP_TTL_SECONDS = 300;

    public const OTP_RESEND_LOCK_SECONDS = 60;

    public const OTP_MAX_ATTEMPTS = 5;

    public function __construct(private readonly StudentRepository $studentRepository) {}

    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['full_name'],
                'username' => null,
                'email' => $data['email'] ?? null,
                'password' => null,
                'role' => User::ROLE_STUDENT,
                'status' => User::STATUS_PENDING,
            ]);

            $this->studentRepository->createProfile($user, [
                'full_name' => $data['full_name'],
                'nik' => $data['nik'],
                'phone' => $data['phone'] ?? null,
                'birth_date' => $data['birth_date'],
                'gender' => $data['gender'],
                'address' => $data['address'],
                'registration_status' => StudentProfile::STATUS_PENDING,
                'agreed_terms' => true,
            ]);

            return $user;
        });
    }

    public function login(string $username, string $password): ?User
    {
        $user = User::where('username', $username)
            ->orWhere('email', $username)
            ->first();

        if (! $user
            || ! Hash::check($password, $user->password)
            || $user->status !== User::STATUS_AKTIF) {
            return null;
        }

        return $user;
    }

    public function sendOtp(string $email, string $purpose = 'reset'): array
    {
        $limitKey = $this->otpLockKey($email, $purpose);

        if (Cache::has($limitKey.'_reset')) {
            $remaining = Cache::get($limitKey.'_reset');

            return ['sent' => false, 'retry_after' => $remaining];
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put($this->otpKey($email, $purpose), $code, now()->addSeconds(self::OTP_TTL_SECONDS));
        Cache::put($limitKey.'_reset', self::OTP_RESEND_LOCK_SECONDS, now()->addSeconds(self::OTP_RESEND_LOCK_SECONDS));

        $this->deliverOtp($email, $code, $purpose);

        return ['sent' => true, 'retry_after' => self::OTP_RESEND_LOCK_SECONDS];
    }

    public function verifyOtp(string $email, string $code, string $purpose = 'reset'): bool
    {
        $attemptKey = $this->otpAttemptsKey($email, $purpose);
        $attempts = (int) Cache::get($attemptKey, 0);

        if ($attempts >= self::OTP_MAX_ATTEMPTS) {
            Cache::forget($this->otpKey($email, $purpose));
            Cache::forget($attemptKey);

            return false;
        }

        $stored = Cache::get($this->otpKey($email, $purpose));

        if (! $stored || ! hash_equals((string) $stored, $code)) {
            Cache::increment($attemptKey);
            Cache::put($attemptKey, $attempts + 1, now()->addSeconds(self::OTP_TTL_SECONDS));

            return false;
        }

        Cache::forget($this->otpKey($email, $purpose));
        Cache::forget($attemptKey);
        Cache::forget($this->otpLockKey($email, $purpose));

        return true;
    }

    public function markEmailVerified(User $user): void
    {
        $user->forceFill(['email_verified_at' => now()])->save();
    }

    public function resetPassword(User $user, string $password): void
    {
        $user->forceFill(['password' => Hash::make($password)])->save();
    }

    private function otpKey(string $email, string $purpose): string
    {
        return "otp:{$purpose}:{$email}";
    }

    private function otpAttemptsKey(string $email, string $purpose): string
    {
        return "otp-attempts:{$purpose}:{$email}";
    }

    private function otpLockKey(string $email, string $purpose): string
    {
        return "otp-lock:{$purpose}:{$email}";
    }

    private function deliverOtp(string $email, string $code, string $purpose): void
    {
        $password = (string) config('mail.password', '');

        // Mail belum dikonfigurasi (password placeholder/kosong): cukup catat ke log agar alur tetap bisa diuji.
        if ($password === '' || str_contains($password, 'your_email_password')) {
            logger()->info("OTP untuk {$email} (mail belum dikonfigurasi): {$code}");

            return;
        }

        try {
            Mail::to($email)->send(new OtpMail($code, $purpose));
        } catch (Throwable $e) {
            logger()->warning("Gagal mengirim OTP ke {$email}: {$e->getMessage()}. Kode: {$code}");
        }
    }
}
