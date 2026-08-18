<?php

namespace App\Console\Commands;

use App\Models\SecurityLog;
use App\Support\SecurityGuard;
use FilesystemIterator;
use Illuminate\Console\Command;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class SecurityIntegrityCommand extends Command
{
    protected $signature = 'security:integrity {--rebuild : Bangun ulang baseline dari kondisi berkas saat ini}';

    protected $description = 'Hash berkas inti aplikasi lalu bandingkan dengan baseline untuk mendeteksi perubahan (Integrity Guard).';

    private const BASELINE_FILE = 'app/security/integrity-baseline.json';

    public function handle(): int
    {
        $storage = storage_path(self::BASELINE_FILE);
        $dir = dirname($storage);

        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $current = $this->hashProject();

        if ($this->option('rebuild') || ! file_exists($storage)) {
            file_put_contents($storage, json_encode($current, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            SecurityGuard::recordEndpoint(SecurityLog::TIPE_INTEGRITAS, null, [
                'keterangan' => 'Baseline integritas dibuat: '.count($current).' berkas di-hash.',
                'path' => '/system/integrity',
            ]);

            $this->info('Baseline integritas dibuat ('.count($current).' berkas).');

            return self::SUCCESS;
        }

        $baseline = json_decode((string) file_get_contents($storage), true);

        if (! is_array($baseline)) {
            $this->error('Baseline rusak. Jalankan dengan --rebuild untuk membuat ulang.');

            return self::FAILURE;
        }

        $added = array_values(array_diff(array_keys($current), array_keys($baseline)));
        $removed = array_values(array_diff(array_keys($baseline), array_keys($current)));
        $modified = [];

        foreach ($baseline as $file => $hash) {
            if (isset($current[$file]) && $current[$file] !== $hash) {
                $modified[] = $file;
            }
        }

        if ($added === [] && $removed === [] && $modified === []) {
            SecurityGuard::recordEndpoint(SecurityLog::TIPE_INTEGRITAS, null, [
                'keterangan' => 'Cek integritas: aman, '.count($current).' berkas sesuai baseline.',
                'path' => '/system/integrity',
            ]);

            $this->info('Aman — semua berkas sesuai baseline ('.count($current).').');

            return self::SUCCESS;
        }

        $changed = array_merge($added, $removed, $modified);
        $sample = implode(', ', array_map(fn ($file) => basename($file), array_slice($changed, 0, 5)));

        SecurityGuard::recordEndpoint(SecurityLog::TIPE_PERINGATAN, null, [
            'keterangan' => 'Perubahan berkas terdeteksi: '.count($added).' baru, '.count($removed).' hilang, '.count($modified).' dimodifikasi. Contoh: '.$sample.(count($changed) > 5 ? ' ...' : ''),
            'path' => '/system/integrity',
        ]);

        SecurityGuard::recordEndpoint(SecurityLog::TIPE_INTEGRITAS, null, [
            'keterangan' => 'Hasil cek integritas: '.count($added).' berkas baru, '.count($removed).' hilang, '.count($modified).' berubah.',
            'path' => '/system/integrity',
        ]);

        $this->warn('Perubahan terdeteksi pada '.count($changed).' berkas.');

        return self::FAILURE;
    }

    /**
     * Hash berkas inti proyek (tanpa vendor/node_modules/storage).
     *
     * @return array<string, string>
     */
    private function hashProject(): array
    {
        $hits = [];

        foreach ([
            base_path('.env'),
            base_path('artisan'),
            base_path('composer.json'),
            base_path('composer.lock'),
        ] as $file) {
            if (is_file($file)) {
                $hits[$this->relative($file)] = (string) md5_file($file);
            }
        }

        foreach ([
            base_path('app'),
            base_path('bootstrap'),
            base_path('config'),
            base_path('routes'),
            base_path('public'),
        ] as $root) {
            if (! is_dir($root)) {
                continue;
            }

            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if (! $file->isFile()) {
                    continue;
                }

                $path = $file->getPathname();

                if ($this->shouldSkip($path)) {
                    continue;
                }

                $extension = strtolower($file->getExtension());

                if (in_array($extension, ['php', 'env'], true) || basename($path) === '.htaccess') {
                    $hits[$this->relative($path)] = (string) md5_file($path);
                }
            }
        }

        ksort($hits);

        return $hits;
    }

    private function shouldSkip(string $path): bool
    {
        foreach (['vendor', 'node_modules', 'storage'] as $segment) {
            if (str_contains($path, DIRECTORY_SEPARATOR.$segment.DIRECTORY_SEPARATOR)) {
                return true;
            }
        }

        return false;
    }

    private function relative(string $path): string
    {
        $root = base_path();

        return str_starts_with($path, $root)
            ? ltrim(substr($path, strlen($root)), DIRECTORY_SEPARATOR)
            : $path;
    }
}
