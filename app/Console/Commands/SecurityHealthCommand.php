<?php

namespace App\Console\Commands;

use App\Models\SecurityLog;
use App\Support\SecurityGuard;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SecurityHealthCommand extends Command
{
    protected $signature = 'security:health';

    protected $description = 'Pemeriksaan kesehatan rutin: debug mode, disk, database, dan mode pemeliharaan (Health Sentinel).';

    public function handle(): int
    {
        $problems = [];

        if (config('app.debug') && app()->environment('production')) {
            $problems[] = 'APP_DEBUG menyala pada environment production (risiko tinggi).';
        } elseif (config('app.debug')) {
            $problems[] = 'APP_DEBUG menyala (kurangi jika aplikasi sudah diluncurkan).';
        }

        $diskTotal = @disk_total_space(base_path());
        $diskFree = @disk_free_space(base_path());

        if ($diskTotal && $diskFree) {
            $percent = (int) round((($diskTotal - $diskFree) / $diskTotal) * 100);

            if ($percent >= 85) {
                $problems[] = "Penggunaan disk mencapai {$percent}%.";
            }
        }

        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $problems[] = 'Koneksi database gagal: '.$e->getMessage();
        }

        if (app()->isDownForMaintenance()) {
            $problems[] = 'Mode pemeliharaan (maintenance) sedang aktif.';
        }

        if ($problems === []) {
            SecurityGuard::recordEndpoint(SecurityLog::TIPE_PEMANTAUAN, null, [
                'keterangan' => 'Pemantauan rutin: seluruh sistem sehat.',
                'path' => '/system/health',
            ]);

            $this->info('Seluruh sistem sehat.');

            return self::SUCCESS;
        }

        foreach ($problems as $problem) {
            SecurityGuard::recordEndpoint(SecurityLog::TIPE_PERINGATAN, null, [
                'keterangan' => $problem,
                'path' => '/system/health',
            ]);

            $this->warn($problem);
        }

        return self::FAILURE;
    }
}
