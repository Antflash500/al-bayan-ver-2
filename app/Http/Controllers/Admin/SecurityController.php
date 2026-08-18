<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityLog;
use App\Models\User;
use App\Support\SecurityGuard;
use App\Support\SecurityIntel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SecurityController extends Controller
{
    public function index(): Response
    {
        $since24h = now()->subHours(24);
        $sessionId = session()->getId();

        $count24h = fn (string $tipe) => SecurityLog::where('tipe', $tipe)
            ->where('created_at', '>=', $since24h)
            ->count();

        $summary = [
            'total_users' => User::count(),
            'total_guru' => User::where('role', User::ROLE_GURU)->count(),
            'total_siswa' => User::where('role', User::ROLE_STUDENT)->count(),
            'active_sessions' => DB::table('sessions')->whereNotNull('user_id')->count(),
            'banned_ips' => count(SecurityGuard::activeBans()),
            'login_sukses_24h' => $count24h(SecurityLog::TIPE_LOGIN_SUKSES),
            'login_gagal_24h' => $count24h(SecurityLog::TIPE_LOGIN_GAGAL),
            'diblokir_24h' => $count24h(SecurityLog::TIPE_DIBLOKIR),
            'banned_24h' => $count24h(SecurityLog::TIPE_BANNED),
            'peringatan_24h' => $count24h(SecurityLog::TIPE_PERINGATAN),
        ];

        $aiBlocks = SecurityLog::where('keterangan', 'like', '%ai-prompt-inject%')
            ->where('created_at', '>=', $since24h)
            ->count();

        $backdoors = SecurityIntel::scanBackdoors();

        $threats = collect(SecurityLog::THREAT_TIPES)
            ->map(fn (string $tipe) => [
                'tipe' => $tipe,
                'label' => SecurityLog::TIPES[$tipe],
                'count' => $count24h($tipe),
            ])
            ->values()
            ->all();

        $systems = $this->systemStatus();

        $cve = SecurityIntel::cveStatus();
        $cveRentan = count(array_filter($cve, fn ($item) => $item['check'] === 'rentan'));

        $passwordAudit = $this->passwordAudit();

        $fortress = [
            ['layer' => 1, 'name' => 'Dinding — WAF', 'desc' => count((array) config('firewall.uri_patterns')).' pola URI + '.count((array) config('firewall.body_patterns')).' pola payload aktif di setiap request', 'ok' => true],
            ['layer' => 2, 'name' => 'Gerbang — Login Guard', 'desc' => 'Auto-ban setelah '.((int) config('firewall.failed_login_threshold', 8)).'x gagal login dalam 15 menit', 'ok' => true],
            ['layer' => 3, 'name' => 'Menara — IDS', 'desc' => ($systems[0]['last_result'] ?? 'Belum berjalan'), 'ok' => true],
            ['layer' => 4, 'name' => 'Jembatan — Kontrol Sesi', 'desc' => 'Sesi database, '.DB::table('sessions')->whereNotNull('user_id')->count().' sesi aktif', 'ok' => config('session.driver') === 'database'],
            ['layer' => 5, 'name' => 'Gudang — Integrity & Password', 'desc' => count($passwordAudit).' akun dengan kata sandi lemah terdeteksi', 'ok' => count($passwordAudit) === 0],
            ['layer' => 6, 'name' => 'Pustaka — Intel CVE', 'desc' => $cveRentan.' kerentanan terindikasi dari '.count($cve).' CVE yang dipantau', 'ok' => $cveRentan === 0],
        ];

        $ipIntel = SecurityGuard::topThreatIps(8);

        $devices = DB::table('sessions')
            ->whereNotNull('user_agent')
            ->where('user_agent', '!=', '')
            ->selectRaw('user_agent, count(*) as total, MAX(last_activity) as last_activity, MAX(ip_address) as ip')
            ->groupBy('user_agent')
            ->orderByDesc('total')
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'user_agent' => $row->user_agent,
                'label' => $this->parseUserAgent((string) $row->user_agent),
                'total' => $row->total,
                'ip' => $row->ip,
                'last_activity' => Carbon::createFromTimestamp((int) $row->last_activity)->diffForHumans(),
                'blocked' => SecurityGuard::isDeviceBlocked((string) $row->user_agent),
                'hash' => md5((string) $row->user_agent),
            ])
            ->values();

        $blockedDevices = SecurityGuard::activeDeviceBlocks();

        $lockdown = SecurityGuard::lockdownInfo();

        $ticker = SecurityLog::with('user')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'tipe' => $log->tipe,
                'tipe_label' => SecurityLog::TIPES[$log->tipe] ?? ucfirst($log->tipe),
                'name' => $log->user?->name ?? $log->user?->username ?? '-',
                'ip' => $log->ip_address,
                'keterangan' => $log->keterangan,
                'time_ago' => $log->created_at?->diffForHumans(),
            ]);

        $bannedIps = SecurityGuard::activeBans();

        $sessions = DB::table('sessions')
            ->where('id', '!=', $sessionId)
            ->orderByDesc('last_activity')
            ->limit(20)
            ->get();

        $userIds = $sessions->pluck('user_id')->filter()->unique()->values();
        $usersById = User::whereIn('id', $userIds)->get()->keyBy('id');

        $sessions = $sessions->map(fn ($session) => [
            'id' => $session->id,
            'user_id' => $session->user_id,
            'name' => $session->user_id
                ? (($usersById[$session->user_id]->name ?? '')
                    ? $usersById[$session->user_id]->name
                    : ($usersById[$session->user_id]->username ?? 'Pengguna'))
                : 'Tamu',
            'ip' => $session->ip_address,
            'browser' => $this->parseUserAgent((string) $session->user_agent),
            'last_activity' => Carbon::createFromTimestamp((int) $session->last_activity)->diffForHumans(),
        ])->values();

        $logs = SecurityLog::with('user')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'tipe' => $log->tipe,
                'tipe_label' => SecurityLog::TIPES[$log->tipe] ?? ucfirst($log->tipe),
                'name' => $log->user?->name ?? $log->user?->username ?? '-',
                'ip' => $log->ip_address,
                'browser' => $log->browser,
                'path' => $log->path,
                'keterangan' => $log->keterangan,
                'created_at' => $log->created_at?->format('d M Y H:i'),
            ]);

        $diskTotal = @disk_total_space(base_path());
        $diskFree = @disk_free_space(base_path());
        $diskPercent = ($diskTotal && $diskFree)
            ? (int) round((($diskTotal - $diskFree) / $diskTotal) * 100)
            : null;

        $health = [
            ['label' => 'Versi PHP', 'value' => PHP_VERSION, 'ok' => version_compare(PHP_VERSION, '8.2', '>=')],
            ['label' => 'Laravel', 'value' => app()->version(), 'ok' => true],
            ['label' => 'Environment', 'value' => app()->environment(), 'ok' => ! app()->isDownForMaintenance()],
            ['label' => 'Database', 'value' => $this->dbOk() ? 'Terhubung' : 'Gagal', 'ok' => $this->dbOk()],
            ['label' => 'Disk', 'value' => $diskPercent === null ? 'Tidak tersedia' : "{$diskPercent}% terpakai", 'ok' => $diskPercent === null || $diskPercent < 85],
            ['label' => 'Cache Driver', 'value' => config('cache.default'), 'ok' => true],
            ['label' => 'Session Driver', 'value' => config('session.driver'), 'ok' => true],
            ['label' => 'Debug Mode', 'value' => config('app.debug') ? 'MENYALA (risiko)' : 'Mati', 'ok' => ! config('app.debug')],
        ];

        $firewall = [
            'ban_minutes' => (int) config('firewall.ban_minutes', 60),
            'max_blocked_hits' => (int) config('firewall.max_blocked_hits', 5),
            'failed_login_threshold' => (int) config('firewall.failed_login_threshold', 8),
            'blocked_ips_config' => $this->configIps('FIREWALL_BLOCKED_IPS'),
            'allowed_ips_config' => $this->configIps('FIREWALL_ALLOWED_IPS'),
            'admin_allowed_ips_config' => $this->configIps('FIREWALL_ADMIN_ALLOWED_IPS'),
        ];

        return Inertia::render('Admin/Security', [
            'summary' => $summary,
            'threats' => $threats,
            'systems' => $systems,
            'passwordAudit' => $passwordAudit,
            'fortress' => $fortress,
            'ipIntel' => $ipIntel,
            'devices' => $devices,
            'blockedDevices' => $blockedDevices,
            'cve' => $cve,
            'configChecks' => SecurityIntel::configChecks(),
            'gaps' => SecurityIntel::scanGaps(),
            'backdoors' => $backdoors,
            'aiBlocks' => $aiBlocks,
            'lockdown' => $lockdown,
            'ticker' => $ticker,
            'ipScan' => session('ip_scan_result'),
            'selfTest' => session('self_test'),
            'bannedIps' => $bannedIps,
            'sessions' => $sessions,
            'logs' => $logs,
            'health' => $health,
            'firewall' => $firewall,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function ban(Request $request)
    {
        $data = $request->validate([
            'ip' => ['required', 'ip'],
        ]);

        SecurityGuard::ban($data['ip'], reason: 'Diban manual oleh admin dari panel keamanan.');

        return back()->with('success', "IP {$data['ip']} berhasil diban sementara.");
    }

    public function unban(Request $request)
    {
        $data = $request->validate([
            'ip' => ['required', 'ip'],
        ]);

        SecurityGuard::unban($data['ip']);

        return back()->with('success', "IP {$data['ip']} telah dihapus dari daftar banned.");
    }

    public function terminateSession(Request $request)
    {
        $data = $request->validate([
            'session_id' => ['required', 'string', 'max:255'],
        ]);

        if ($data['session_id'] === (string) session()->getId()) {
            return back()->with('error', 'Tidak dapat mencabut sesi Anda sendiri dari daftar ini.');
        }

        $deleted = DB::table('sessions')->where('id', $data['session_id'])->delete();

        if (! $deleted) {
            return back()->with('error', 'Sesi tidak ditemukan.');
        }

        return back()->with('success', 'Sesi perangkat tersebut telah dicabut (force logout).');
    }

    public function terminateOtherSessions(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $count = DB::table('sessions')
            ->where('user_id', $data['user_id'])
            ->where('id', '!=', (string) session()->getId())
            ->delete();

        return back()->with('success', "{$count} sesi lain untuk pengguna tersebut telah dicabut.");
    }

    public function health()
    {
        $checks = [
            'database' => $this->dbOk(),
            'debug_mode' => ! config('app.debug'),
            'session_driver' => config('session.driver') === 'database',
            'cache' => true,
        ];

        $passed = count(array_filter($checks));

        return back()->with('success', "Health check selesai: {$passed} dari ".count($checks).' komponen sehat.');
    }

    public function runAnalyze()
    {
        $output = $this->runCommand('security:analyze');

        return back()->with('success', 'Analisis IDS dijalankan. '.$output);
    }

    public function runIntegrity()
    {
        $output = $this->runCommand('security:integrity');

        return back()->with('success', 'Cek integritas dijalankan. '.$output);
    }

    public function rebuildIntegrity()
    {
        $output = $this->runCommand('security:integrity', ['--rebuild' => true]);

        return back()->with('success', 'Baseline integritas diperbarui. '.$output);
    }

    public function runScan()
    {
        $output = $this->runCommand('security:scan-files');

        return back()->with('success', 'Pindai malware dijalankan. '.$output);
    }

    public function runSweep()
    {
        $output = $this->runCommand('security:sweep');

        return back()->with('success', 'Pembersihan rutin dijalankan. '.$output);
    }

    public function logoutAll(Request $request)
    {
        $count = DB::table('sessions')
            ->where('id', '!=', (string) session()->getId())
            ->delete();

        SecurityGuard::recordEndpoint(SecurityLog::TIPE_PERINGATAN, (string) $request->ip(), [
            'path' => '/admin/security/logout-all',
            'browser' => substr((string) $request->userAgent(), 0, 190),
            'keterangan' => "Force logout global: {$count} sesi dicabut secara manual oleh admin.",
        ]);

        return back()->with('success', "{$count} sesi dicabut. Seluruh pengguna harus masuk kembali.");
    }

    public function scanIp(Request $request)
    {
        $data = $request->validate([
            'ip' => ['required', 'ip'],
        ]);

        $result = SecurityGuard::scanIp($data['ip']);

        return back()->with('ip_scan_result', $result);
    }

    public function blockDevice(Request $request)
    {
        $data = $request->validate([
            'user_agent' => ['required', 'string', 'max:1000'],
        ]);

        SecurityGuard::blockDevice($data['user_agent']);

        return back()->with('success', 'Perangkat berhasil diblokir sementara.');
    }

    public function unblockDevice(Request $request)
    {
        $data = $request->validate([
            'hash' => ['required', 'string', 'max:64'],
        ]);

        SecurityGuard::unblockDevice($data['hash']);

        return back()->with('success', 'Blokir perangkat dicabut.');
    }

    public function selfTest()
    {
        $result = SecurityIntel::firewallSelfTest();

        return back()->with('self_test', $result)->with(
            'success',
            "Uji benteng: {$result['blocked']} dari {$result['total']} payload serangan berhasil diblokir."
        );
    }

    public function toggleLockdown(Request $request)
    {
        $data = $request->validate([
            'action' => ['required', 'in:on,off'],
        ]);

        if ($data['action'] === 'on') {
            SecurityGuard::lockdown();

            return back()->with(
                'success',
                'Mode lockdown AKTIF. Semua akses di luar IP terpercaya ditolak sementara.'
            );
        }

        SecurityGuard::unlockdown();

        return back()->with('success', 'Mode lockdown dimatikan. Akses kembali normal.');
    }

    public function respond(Request $request)
    {
        $since = now()->subHours(24);
        $currentIp = (string) $request->ip();
        $protected = array_merge(
            (array) config('firewall.allowed_ips'),
            (array) config('firewall.admin_allowed_ips'),
            [$currentIp]
        );

        $suspectIps = SecurityLog::query()
            ->where('created_at', '>=', $since)
            ->whereIn('tipe', [
                SecurityLog::TIPE_LOGIN_GAGAL,
                SecurityLog::TIPE_DIBLOKIR,
                SecurityLog::TIPE_PORT_SCAN,
            ])
            ->whereNotNull('ip_address')
            ->where('ip_address', '!=', '')
            ->distinct()
            ->pluck('ip_address');

        $banned = 0;

        foreach ($suspectIps as $ip) {
            if (! SecurityGuard::isBanned($ip) && ! SecurityGuard::ipInList($ip, $protected)) {
                SecurityGuard::ban($ip, reason: 'respon insiden — SIAGA BENTENG');
                $banned++;
            }
        }

        $sessionsCut = DB::table('sessions')
            ->where('id', '!=', (string) session()->getId())
            ->delete();

        SecurityGuard::recordEndpoint(SecurityLog::TIPE_PERINGATAN, (string) $request->ip(), [
            'path' => '/admin/security/respond',
            'keterangan' => "SIAGA BENTENG: {$banned} IP mencurigakan diban, {$sessionsCut} sesi dicabut.",
        ]);

        return back()->with(
            'success',
            "SIAGA BENTENG selesai: {$banned} IP mencurigakan diban, {$sessionsCut} sesi dicabut."
        );
    }

    public function scanGaps()
    {
        Cache::forget('security:intel:gaps');
        $gaps = SecurityIntel::scanGaps();

        return back()->with(
            'success',
            count($gaps) === 0
                ? 'Pemindai celah selesai: tidak ditemukan artefak sensitif di direktori publik.'
                : 'Pemindai celah selesai: '.count($gaps).' artefak sensitif ditemukan di direktori publik.'
        );
    }

    public function scanBackdoors()
    {
        Cache::forget('security:intel:backdoor');
        $backdoors = SecurityIntel::scanBackdoors();

        return back()->with(
            'success',
            $backdoors['total'] === 0
                ? 'Pemindai backdoor selesai: tidak ditemukan berkas mencurigakan di webroot & area unggahan.'
                : 'Pemindai backdoor selesai: '.$backdoors['total'].' berkas mencurigakan ditemukan.'
        );
    }

    public function exportJson(): StreamedResponse
    {
        $filename = 'fortress-'.now()->format('Y-m-d-Hi').'.json';

        return response()->streamDownload(function (): void {
            echo json_encode([
                'dihasilkan_pada' => now()->toIso8601String(),
                'laravel' => app()->version(),
                'php' => PHP_VERSION,
                'firewall' => config('firewall'),
                'lockdown' => SecurityGuard::lockdownInfo(),
                'banned_ips' => SecurityGuard::activeBans(),
                'blocked_devices' => SecurityGuard::activeDeviceBlocks(),
                'cve' => SecurityIntel::cveStatus(),
                'config_checks' => SecurityIntel::configChecks(),
                'gaps' => SecurityIntel::scanGaps(),
                'log_terakhir' => SecurityLog::orderByDesc('created_at')->limit(20)->get([
                    'tipe', 'ip_address', 'keterangan', 'created_at',
                ]),
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }, $filename, [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }

    public function exportCsv(): StreamedResponse
    {
        $filename = 'security-logs-'.now()->format('Y-m-d-Hi').'.csv';

        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Waktu', 'Tipe', 'Pengguna', 'IP', 'Browser', 'Path', 'Keterangan',
            ]);

            SecurityLog::with('user')
                ->orderByDesc('created_at')
                ->chunk(500, function ($logs) use ($handle): void {
                    foreach ($logs as $log) {
                        fputcsv($handle, [
                            $log->created_at?->toDateTimeString(),
                            SecurityLog::TIPES[$log->tipe] ?? $log->tipe,
                            $log->user?->name ?? $log->user?->username ?? '-',
                            $log->ip_address,
                            $log->browser,
                            $log->path,
                            $log->keterangan,
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function dbOk(): bool
    {
        try {
            DB::connection()->getPdo();

            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Status kelima sistem keamanan yang berjalan otomatis lewat scheduler.
     *
     * @return array<int, array{key: string, name: string, desc: string, schedule: string, tipe: string, last_run: string, last_result: string}>
     */
    private function systemStatus(): array
    {
        $definitions = [
            [
                'key' => 'analyze',
                'name' => 'Intrusion Detection (IDS)',
                'desc' => 'Memindai lonjakan login gagal, pemblokiran, dan port scan, lalu auto-ban IP mencurigakan.',
                'schedule' => 'Setiap 5 menit',
                'tipe' => SecurityLog::TIPE_ANALISIS,
            ],
            [
                'key' => 'health',
                'name' => 'Health Sentinel',
                'desc' => 'Memeriksa debug mode, penggunaan disk, database, dan mode pemeliharaan secara berkala.',
                'schedule' => 'Setiap 1 menit',
                'tipe' => SecurityLog::TIPE_PEMANTAUAN,
            ],
            [
                'key' => 'integrity',
                'name' => 'Integrity Guard',
                'desc' => 'Membandingkan hash berkas inti aplikasi terhadap baseline untuk mendeteksi perubahan.',
                'schedule' => 'Setiap 1 jam',
                'tipe' => SecurityLog::TIPE_INTEGRITAS,
            ],
            [
                'key' => 'sweep',
                'name' => 'Log & Session Sweeper',
                'desc' => 'Membuang log keamanan lama dan sesi basi agar sistem tetap ringan dan rapi.',
                'schedule' => 'Setiap 30 menit',
                'tipe' => SecurityLog::TIPE_PEMBERSIHAN,
            ],
            [
                'key' => 'scan',
                'name' => 'Malware Scanner',
                'desc' => 'Memindai berkas aplikasi terhadap pola kode berbahaya (webshell, injeksi, backdoor).',
                'schedule' => 'Setiap hari 03.00',
                'tipe' => SecurityLog::TIPE_PINDAI,
            ],
        ];

        $lastLogs = SecurityLog::query()
            ->whereIn('tipe', [
                SecurityLog::TIPE_ANALISIS,
                SecurityLog::TIPE_PEMANTAUAN,
                SecurityLog::TIPE_INTEGRITAS,
                SecurityLog::TIPE_PEMBERSIHAN,
                SecurityLog::TIPE_PINDAI,
            ])
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('tipe')
            ->map(fn ($group) => $group->first());

        return collect($definitions)
            ->map(function (array $system) use ($lastLogs) {
                $last = $lastLogs->get($system['tipe']);

                return [
                    'key' => $system['key'],
                    'name' => $system['name'],
                    'desc' => $system['desc'],
                    'schedule' => $system['schedule'],
                    'tipe' => $system['tipe'],
                    'last_run' => $last?->created_at?->format('d M Y H:i') ?? 'Belum pernah',
                    'last_result' => $last?->keterangan ?? 'Menunggu jadwal pertama berjalan.',
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Audit kata sandi tanpa memperlambat halaman:
     *  - bentuk hash diperiksa untuk semua akun (murah),
     *  - verifikasi bcrypt terhadap kata sandi umum hanya untuk akun
     *    berprivilege (admin/guru) dengan anggaran terbatas,
     *  - hasil di-cache 10 menit.
     *
     * @return array<int, array{id: int, name: string, username: string, role: string, reason: string}>
     */
    private function passwordAudit(): array
    {
        return \Illuminate\Support\Facades\Cache::remember('security:password-audit', now()->addMinutes(10), function () {
            $defaults = ['password', 'password123', '12345678', 'admin123'];
            $bcryptBudget = 30;

            $weak = [];

            foreach (User::all(['id', 'name', 'username', 'role', 'password']) as $user) {
                $hash = (string) $user->password;
                $reason = null;

                if (strlen($hash) < 20) {
                    $reason = 'Hash tidak standar (kemungkinan tersimpan sebagai teks biasa).';
                } elseif (preg_match('/^[a-f0-9]{32}$/i', $hash)) {
                    $reason = 'Menggunakan hash MD5 (tidak aman).';
                } elseif (preg_match('/^[a-f0-9]{40}$/i', $hash)) {
                    $reason = 'Menggunakan hash SHA1 (tidak aman).';
                } elseif (in_array($user->role, [User::ROLE_ADMIN, User::ROLE_GURU], true) && $bcryptBudget > 0) {
                    foreach ($defaults as $default) {
                        $bcryptBudget--;

                        if (Hash::check($default, $hash)) {
                            $reason = "Password lemah — cocok dengan kata sandi umum (\"{$default}\").";
                            break;
                        }
                    }
                }

                if ($reason !== null) {
                    $weak[] = [
                        'id' => (int) $user->id,
                        'name' => (string) $user->name,
                        'username' => (string) $user->username,
                        'role' => (string) $user->role,
                        'reason' => $reason,
                    ];
                }
            }

            return $weak;
        });
    }

    private function runCommand(string $command, array $parameters = []): string
    {
        try {
            Artisan::call($command, $parameters);

            return trim((string) Artisan::output());
        } catch (\Throwable $e) {
            report($e);

            return 'Gagal: '.$e->getMessage();
        }
    }

    private function configIps(string $envKey): array
    {
        return array_values(array_filter(array_map('trim', explode(',', (string) env($envKey, '')))));
    }

    private function parseUserAgent(string $ua): string
    {
        if ($ua === '') {
            return 'Tidak diketahui';
        }

        $os = 'Sistem lain';
        $browser = 'Browser lain';

        foreach ([
            'Windows NT' => 'Windows', 'Mac OS X' => 'macOS', 'Android' => 'Android',
            'iPhone' => 'iOS', 'iPad' => 'iOS', 'Linux' => 'Linux',
        ] as $needle => $label) {
            if (str_contains($ua, $needle)) {
                $os = $label;
                break;
            }
        }

        foreach ([
            'Edg/' => 'Edge', 'OPR/' => 'Opera', 'Chrome' => 'Chrome',
            'Firefox' => 'Firefox', 'Safari' => 'Safari',
        ] as $needle => $label) {
            if (str_contains($ua, $needle)) {
                $browser = $label;
                break;
            }
        }

        return "{$browser} · {$os}";
    }
}