<?php

namespace App\Support;

use App\Models\SecurityLog;
use Illuminate\Support\Facades\Cache;

class SecurityGuard
{
    public static function isBanned(string $ip): bool
    {
        return Cache::has(config('firewall.ban_cache_prefix').$ip);
    }

    public static function ban(string $ip, ?int $minutes = null, string $reason = 'melanggar batas keamanan'): void
    {
        $minutes ??= (int) config('firewall.ban_minutes', 60);

        Cache::put(config('firewall.ban_cache_prefix').$ip, now()->timestamp, now()->addMinutes($minutes));

        logger()->channel('security')->warning('IP diban sementara', [
            'ip' => $ip,
            'minutes' => $minutes,
            'reason' => $reason,
        ]);

        self::recordEndpoint('banned', $ip, [
            'keterangan' => $reason,
            'path' => null,
        ]);
    }

    public static function unban(string $ip): void
    {
        Cache::forget(config('firewall.ban_cache_prefix').$ip);

        self::recordEndpoint('unbanned', $ip, [
            'keterangan' => 'Pembatalan banned secara manual oleh admin.',
            'path' => null,
        ]);
    }

    /**
     * Daftar IP yang sedang diban aktif beserta sisa waktunya.
     * Sumber kebenaran adalah cache, namun daftar direkonstruksi dari
     * catatan database dengan memotong entri yang sudah kedaluwarsa.
     *
     * @return array<int, array{ip: string, reason: ?string, banned_at: string, remaining_minutes: int}>
     */
    public static function activeBans(): array
    {
        try {
            $entries = SecurityLog::query()
                ->where('tipe', SecurityLog::TIPE_BANNED)
                ->orderByDesc('created_at')
                ->get();
        } catch (\Throwable $e) {
            return [];
        }

        $latestByIp = [];

        foreach ($entries as $entry) {
            $ip = (string) $entry->ip_address;

            if ($ip === '' || isset($latestByIp[$ip])) {
                continue;
            }

            $latestByIp[$ip] = $entry;
        }

        $minutes = (int) config('firewall.ban_minutes', 60);
        $now = now();
        $result = [];

        foreach ($latestByIp as $ip => $entry) {
            $expiresAt = $entry->created_at->addMinutes($minutes);

            if ($expiresAt->isPast()) {
                continue;
            }

            if (! self::isBanned($ip)) {
                continue;
            }

            $result[] = [
                'ip' => $ip,
                'reason' => $entry->keterangan,
                'banned_at' => $entry->created_at->toIso8601String(),
                'remaining_minutes' => max(0, $now->diffInMinutes($expiresAt)),
            ];
        }

        return $result;
    }

    /**
     * Tulis satu entri ke tabel security_logs. Dipanggil dalam konteks
     * firewall sehingga kegagalan database tidak boleh menghentikan request.
     */
    public static function recordEndpoint(string $tipe, ?string $ip, array $data = [], ?int $userId = null): void
    {
        try {
            SecurityLog::create([
                'tipe' => $tipe,
                'user_id' => $userId,
                'ip_address' => $ip,
                'browser' => $data['browser'] ?? null,
                'sistem_operasi' => $data['sistem_operasi'] ?? null,
                'path' => $data['path'] ?? null,
                'keterangan' => $data['keterangan'] ?? null,
            ]);
        } catch (\Throwable $e) {
            logger()->channel('security')->warning('Gagal mencatat security_log', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Catat satu pelanggaran pola dari IP tersebut.
     * Mengembalikan true jika IP sudah melewati batas dan harus diban.
     */
    public static function registerBlocked(string $ip, string $reason): bool
    {
        $key = config('firewall.cache_prefix').'hits:'.$ip;
        $hits = (int) Cache::get($key, 0) + 1;

        Cache::put($key, $hits, now()->addMinutes(10));

        logger()->channel('security')->warning('Aktivitas mencurigakan diblokir', [
            'ip' => $ip,
            'reason' => $reason,
            'hits' => $hits,
        ]);

        self::recordEndpoint(SecurityLog::TIPE_DIBLOKIR, $ip, [
            'keterangan' => $reason,
        ]);

        $max = (int) config('firewall.max_blocked_hits', 5);

        if ($hits >= $max) {
            Cache::forget($key);
            self::ban($ip, reason: 'banyak pelanggaran: '.$reason);

            return true;
        }

        return false;
    }

    public static function recordLoginFailure(string $ip): void
    {
        $key = config('firewall.cache_prefix').'login:'.$ip;
        $count = (int) Cache::get($key, 0) + 1;

        Cache::put($key, $count, now()->addMinutes(15));

        if ($count >= (int) config('firewall.failed_login_threshold', 8)) {
            Cache::forget($key);
            self::ban($ip, reason: 'terlalu banyak percobaan login gagal');
            logger()->channel('security')->error('Terlalu banyak percobaan login gagal', [
                'ip' => $ip,
                'count' => $count,
            ]);
        }
    }

    public static function clearLoginFailures(string $ip): void
    {
        Cache::forget(config('firewall.cache_prefix').'login:'.$ip);
    }

    /**
     * Blokir satu perangkat (berdasarkan User-Agent). Berlaku sementara
     * dan dicatat sebagai aktivitas diblokir.
     */
    public static function blockDevice(string $userAgent, ?int $minutes = null): void
    {
        $hash = md5($userAgent);
        $minutes ??= (int) config('firewall.device_block_minutes', 1440);

        Cache::put(config('firewall.device_block_prefix').$hash, now()->timestamp, now()->addMinutes($minutes));

        self::recordEndpoint(SecurityLog::TIPE_DIBLOKIR, null, [
            'browser' => 'md5:'.$hash,
            'keterangan' => 'Perangkat diblokir: '.substr($userAgent, 0, 80).' ('.(int) $minutes.' menit).',
        ]);
    }

    /**
     * Cabut blokir perangkat berdasarkan hash User-Agent (md5).
     */
    public static function unblockDevice(string $hash): void
    {
        Cache::forget(config('firewall.device_block_prefix').$hash);

        self::recordEndpoint(SecurityLog::TIPE_UNBANNED, null, [
            'keterangan' => 'Blokir perangkat dicabut (hash '.substr($hash, 0, 12).'...).',
        ]);
    }

    public static function isDeviceBlocked(string $userAgent): bool
    {
        if ($userAgent === '') {
            return false;
        }

        if (self::matchesAny($userAgent, (array) config('firewall.blocked_agents'))) {
            return true;
        }

        return Cache::has(config('firewall.device_block_prefix').md5($userAgent));
    }

    /**
     * @return array<int, array{hash: string, label: string, blocked_at: string, remaining_minutes: int}>
     */
    public static function activeDeviceBlocks(): array
    {
        try {
            $entries = SecurityLog::query()
                ->where('tipe', SecurityLog::TIPE_DIBLOKIR)
                ->where('browser', 'like', 'md5:%')
                ->orderByDesc('created_at')
                ->get();
        } catch (\Throwable $e) {
            return [];
        }

        $latestByHash = [];

        foreach ($entries as $entry) {
            $hash = substr((string) $entry->browser, 4);

            if (isset($latestByHash[$hash])) {
                continue;
            }

            $latestByHash[$hash] = $entry;
        }

        $minutes = (int) config('firewall.device_block_minutes', 1440);
        $now = now();
        $result = [];

        foreach ($latestByHash as $hash => $entry) {
            if (! Cache::has(config('firewall.device_block_prefix').$hash)) {
                continue;
            }

            $expiresAt = $entry->created_at->addMinutes($minutes);
            $label = preg_replace('/^Perangkat diblokir: (.+?) \(\d+ menit\)\.$/', '$1', (string) $entry->keterangan) ?? $entry->keterangan;

            $result[] = [
                'hash' => $hash,
                'label' => $label,
                'blocked_at' => $entry->created_at->toIso8601String(),
                'remaining_minutes' => max(0, $now->diffInMinutes($expiresAt)),
            ];
        }

        return $result;
    }

    /**
     * Aktifkan mode lockdown (kunci gerbang): semua IP selain allowlist dan
     * IP admin saat ini ditolak aksesnya sampai waktu habis.
     */
    public static function lockdown(?int $minutes = null): void
    {
        $minutes ??= (int) config('firewall.lockdown_minutes', 30);

        Cache::put(config('firewall.lockdown_cache_prefix').'state', [
            'until' => now()->addMinutes($minutes)->timestamp,
            'safe_ip' => request()->ip(),
        ], now()->addMinutes($minutes));

        self::recordEndpoint(SecurityLog::TIPE_PERINGATAN, request()->ip(), [
            'keterangan' => "Mode lockdown diaktifkan selama {$minutes} menit.",
            'path' => '/admin/security/lockdown',
        ]);
    }

    public static function unlockdown(): void
    {
        Cache::forget(config('firewall.lockdown_cache_prefix').'state');

        self::recordEndpoint(SecurityLog::TIPE_UNBANNED, request()->ip(), [
            'keterangan' => 'Mode lockdown dinonaktifkan.',
            'path' => '/admin/security/lockdown',
        ]);
    }

    public static function isLockdownActive(): bool
    {
        return self::lockdownInfo() !== null;
    }

    /**
     * @return array{until: int, safe_ip: string}|null
     */
    public static function lockdownInfo(): ?array
    {
        $state = Cache::get(config('firewall.lockdown_cache_prefix').'state');

        if (! is_array($state) || (int) ($state['until'] ?? 0) <= now()->timestamp) {
            if (is_array($state)) {
                Cache::forget(config('firewall.lockdown_cache_prefix').'state');
            }

            return null;
        }

        return $state;
    }

    /**
     * Reputasi satu IP: riwayat 24 jam, status blokir, skor risiko, vonis.
     *
     * @return array{ip: string, verdict: string, risk: int, events_24h: int, login_gagal: int, diblokir: int, diban: int, banned_now: bool, in_allowlist: bool, in_blocklist: bool, last_seen: ?string, last_event: ?string}
     */
    public static function scanIp(string $ip): array
    {
        $since = now()->subHours(24);

        $counts = [];
        $lastSeen = null;
        $lastEvent = null;

        try {
            $logs = SecurityLog::where('ip_address', $ip)
                ->where('created_at', '>=', $since)
                ->orderByDesc('created_at')
                ->get(['tipe', 'created_at', 'keterangan']);

            foreach ($logs as $log) {
                $counts[$log->tipe] = ($counts[$log->tipe] ?? 0) + 1;
            }

            $first = $logs->first();

            if ($first) {
                $lastSeen = $first->created_at?->diffForHumans();
                $lastEvent = $first->keterangan;
            }
        } catch (\Throwable $e) {
            // DB offline — reputasi tetap bisa dihitung dari cache.
        }

        $fail = (int) ($counts[SecurityLog::TIPE_LOGIN_GAGAL] ?? 0);
        $blocked = (int) ($counts[SecurityLog::TIPE_DIBLOKIR] ?? 0);
        $bannedCount = (int) ($counts[SecurityLog::TIPE_BANNED] ?? 0);

        $risk = 0;

        if ($fail >= 8) {
            $risk += 45;
        } elseif ($fail >= 3) {
            $risk += 30;
        } elseif ($fail > 0) {
            $risk += 15;
        }

        $risk += min(25, $blocked * 8);

        if ($bannedCount > 0 || self::isBanned($ip)) {
            $risk += 30;
        }

        $risk = min(100, $risk);

        $verdict = match (true) {
            $risk >= 70 => 'Berbahaya',
            $risk >= 30 => 'Mencurigakan',
            default => 'Bersih',
        };

        $inAllowlist = self::ipInList($ip, (array) config('firewall.allowed_ips'))
            || self::ipInList($ip, (array) config('firewall.admin_allowed_ips'));

        $inBlocklist = self::ipInList($ip, (array) config('firewall.blocked_ips'));

        return [
            'ip' => $ip,
            'verdict' => $verdict,
            'risk' => $risk,
            'events_24h' => array_sum($counts),
            'login_gagal' => $fail,
            'diblokir' => $blocked,
            'diban' => $bannedCount,
            'banned_now' => self::isBanned($ip),
            'in_allowlist' => $inAllowlist,
            'in_blocklist' => $inBlocklist,
            'last_seen' => $lastSeen,
            'last_event' => $lastEvent,
        ];
    }

    /**
     * IP dengan aktivitas ancaman terbanyak dalam 24 jam.
     *
     * @return array<int, array{ip: string, total: int, login_gagal: int, diblokir: int, risk: int, verdict: string}>
     */
    public static function topThreatIps(int $limit = 8): array
    {
        try {
            $rows = SecurityLog::query()
                ->where('created_at', '>=', now()->subHours(24))
                ->whereIn('tipe', [
                    SecurityLog::TIPE_LOGIN_GAGAL,
                    SecurityLog::TIPE_DIBLOKIR,
                    SecurityLog::TIPE_PORT_SCAN,
                    SecurityLog::TIPE_BANNED,
                ])
                ->whereNotNull('ip_address')
                ->where('ip_address', '!=', '')
                ->selectRaw('ip_address, tipe, count(*) as total')
                ->groupBy('ip_address', 'tipe')
                ->orderByDesc('total')
                ->limit(60)
                ->get();
        } catch (\Throwable $e) {
            return [];
        }

        $agg = [];

        foreach ($rows as $row) {
            $ip = (string) $row->ip_address;

            if (! isset($agg[$ip])) {
                $agg[$ip] = ['ip' => $ip, 'total' => 0, 'login_gagal' => 0, 'diblokir' => 0];
            }

            $agg[$ip]['total'] += (int) $row->total;

            if ($row->tipe === SecurityLog::TIPE_LOGIN_GAGAL) {
                $agg[$ip]['login_gagal'] += (int) $row->total;
            } elseif ($row->tipe === SecurityLog::TIPE_DIBLOKIR) {
                $agg[$ip]['diblokir'] += (int) $row->total;
            }
        }

        $result = [];

        foreach ($agg as $ip => $data) {
            $risk = 0;

            if ($data['login_gagal'] >= 8) {
                $risk += 45;
            } elseif ($data['login_gagal'] > 0) {
                $risk += 25;
            }

            $risk += min(25, $data['diblokir'] * 6);

            if (self::isBanned($ip)) {
                $risk += 30;
            }

            $risk = min(100, $risk);

            $result[] = [
                'ip' => $ip,
                'total' => $data['total'],
                'login_gagal' => $data['login_gagal'],
                'diblokir' => $data['diblokir'],
                'risk' => $risk,
                'verdict' => $risk >= 70 ? 'Berbahaya' : ($risk >= 30 ? 'Mencurigakan' : 'Bersih'),
            ];
        }

        usort($result, fn ($a, $b) => $b['risk'] <=> $a['risk']);

        return array_slice($result, 0, $limit);
    }

    private static function matchesAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if ($needle !== '' && stripos($haystack, $needle) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Pindai satu string terhadap pola firewall.
     * Mengembalikan label pola yang cocok, atau null jika aman.
     */
    public static function scanString(string $value, bool $isUri): ?string
    {
        $length = strlen($value);

        if ($length === 0 || $length > (int) config('firewall.max_input_scan_length', 4096)) {
            return null;
        }

        $patterns = $isUri
            ? (array) config('firewall.uri_patterns')
            : (array) config('firewall.body_patterns');

        foreach ($patterns as $label => $pattern) {
            if (@preg_match($pattern, $value)) {
                return (string) $label;
            }
        }

        return null;
    }

    /**
     * Periksa apakah IP cocok dengan daftar (dukung CIDR & wildcard parsial).
     */
    public static function ipInList(string $ip, array $list): bool
    {
        foreach ($list as $entry) {
            $entry = trim($entry);

            if ($entry === '') {
                continue;
            }

            if (str_contains($entry, '/')) {
                if (self::ipMatchesCidr($ip, $entry)) {
                    return true;
                }

                continue;
            }

            if (str_contains($entry, '*')) {
                $pattern = '/^'.str_replace('\*', '[0-9]+', preg_quote($entry, '/')).'$/';

                if (preg_match($pattern, $ip)) {
                    return true;
                }

                continue;
            }

            if ($ip === $entry) {
                return true;
            }
        }

        return false;
    }

    private static function ipMatchesCidr(string $ip, string $cidr): bool
    {
        [$subnet, $bits] = array_pad(explode('/', $cidr, 2), 2, null);

        if ($bits === null || ! ctype_digit($bits)) {
            return $ip === $subnet;
        }

        $bits = (int) $bits;

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && filter_var($subnet, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $mask = (-1 << (32 - $bits)) & 0xFFFFFFFF;
            $ipLong = ip2long($ip);
            $subnetLong = ip2long($subnet);

            return $ipLong !== false && $subnetLong !== false
                && ($ipLong & $mask) === ($subnetLong & $mask);
        }

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) && filter_var($subnet, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)
            && $bits >= 0 && $bits <= 128) {
            $ipBin = inet_pton($ip);
            $subnetBin = inet_pton($subnet);
            $fullBytes = intdiv($bits, 8);
            $remainderBits = $bits % 8;

            if ($ipBin === false || $subnetBin === false) {
                return false;
            }

            for ($i = 0; $i < $fullBytes; $i++) {
                if ($ipBin[$i] !== $subnetBin[$i]) {
                    return false;
                }
            }

            if ($remainderBits > 0) {
                $mask = (0xFF << (8 - $remainderBits)) & 0xFF;

                return (ord($ipBin[$fullBytes]) & $mask) === (ord($subnetBin[$fullBytes]) & $mask);
            }

            return true;
        }

        return $ip === $subnet;
    }
}
