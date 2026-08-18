<?php

namespace App\Console\Commands;

use App\Models\SecurityLog;
use App\Support\SecurityGuard;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SecuritySweepCommand extends Command
{
    protected $signature = 'security:sweep';

    protected $description = 'Buang log keamanan lama dan sesi basi secara rutin (Log & Session Sweeper).';

    public function handle(): int
    {
        $logCutoff = now()->subDays((int) config('firewall.log_retention_days', 30));
        $sessionCutoff = now()->subHours((int) config('firewall.session_retention_hours', 48))->getTimestamp();

        $deletedLogs = SecurityLog::query()
            ->where('created_at', '<', $logCutoff)
            ->delete();

        $deletedSessions = DB::table('sessions')
            ->where('last_activity', '<', $sessionCutoff)
            ->delete();

        $keterangan = "Pembersihan rutin: {$deletedLogs} log lama dan {$deletedSessions} sesi basi dibuang.";

        SecurityGuard::recordEndpoint(SecurityLog::TIPE_PEMBERSIHAN, null, [
            'keterangan' => $keterangan,
            'path' => '/system/sweep',
        ]);

        $this->info($keterangan);

        return self::SUCCESS;
    }
}
