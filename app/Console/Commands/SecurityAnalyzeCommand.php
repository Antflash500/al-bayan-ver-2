<?php

namespace App\Console\Commands;

use App\Models\SecurityLog;
use App\Support\SecurityGuard;
use Illuminate\Console\Command;

class SecurityAnalyzeCommand extends Command
{
    protected $signature = 'security:analyze';

    protected $description = 'Analisis log keamanan 30 menit terakhir untuk mendeteksi anomali dan auto-ban IP mencurigakan (Intrusion Detection System).';

    public function handle(): int
    {
        $since = now()->subMinutes(30);

        $spikes = SecurityLog::query()
            ->whereIn('tipe', [
                SecurityLog::TIPE_LOGIN_GAGAL,
                SecurityLog::TIPE_DIBLOKIR,
                SecurityLog::TIPE_PORT_SCAN,
            ])
            ->where('created_at', '>=', $since)
            ->whereNotNull('ip_address')
            ->where('ip_address', '!=', '')
            ->selectRaw('ip_address, tipe, count(*) as total')
            ->groupBy('ip_address', 'tipe')
            ->orderByDesc('total')
            ->limit(100)
            ->get();

        $suspectedIps = 0;
        $autoBanned = [];

        foreach ($spikes as $row) {
            $ip = (string) $row->ip_address;

            if (SecurityGuard::isBanned($ip)) {
                continue;
            }

            $suspectedIps++;

            $threshold = match ($row->tipe) {
                SecurityLog::TIPE_PORT_SCAN => 15,
                default => (int) config('firewall.failed_login_threshold', 8),
            };

            if ((int) $row->total >= $threshold) {
                SecurityGuard::ban($ip, reason: 'deteksi otomatis IDS: '.$row->tipe.' '.$row->total.'x dalam 30 menit');
                $autoBanned[] = $ip;
            }
        }

        $keterangan = $autoBanned === []
            ? 'Analisis IDS: '.$suspectedIps.' IP mencurigakan, tidak ada yang perlu auto-ban.'
            : 'Analisis IDS: '.$suspectedIps.' IP mencurigakan, '.count($autoBanned).' auto-ban ('.implode(', ', $autoBanned).').';

        SecurityGuard::recordEndpoint(SecurityLog::TIPE_ANALISIS, null, [
            'keterangan' => $keterangan,
            'path' => '/system/analyze',
        ]);

        if ($autoBanned !== []) {
            $this->warn('Auto-ban: '.implode(', ', $autoBanned));

            return self::FAILURE;
        }

        $this->info('Tidak ada anomali yang membutuhkan auto-ban.');

        return self::SUCCESS;
    }
}
