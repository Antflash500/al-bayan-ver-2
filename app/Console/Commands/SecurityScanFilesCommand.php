<?php

namespace App\Console\Commands;

use App\Models\SecurityLog;
use App\Support\SecurityGuard;
use FilesystemIterator;
use Illuminate\Console\Command;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class SecurityScanFilesCommand extends Command
{
    protected $signature = 'security:scan-files';

    protected $description = 'Pindai berkas aplikasi terhadap pola kode berbahaya (webshell, injeksi, backdoor).';

    public function handle(): int
    {
        $patterns = [
            'eval(base64)' => '/\beval\s*\(\s*base64_decode\s*\(/i',
            'eval(dinamis)' => '/\beval\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)/i',
            'shell-exec' => '/\b(?:system|exec|shell_exec|passthru|popen|proc_open)\s*\(\s*\$_(?:GET|POST|REQUEST)/i',
            'assert($_...)' => '/\bassert\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)/i',
            'create_function' => '/\bcreate_function\s*\(/i',
            'preg_replace /e' => '/preg_replace\s*\([^)]*["\']\/[^"\']*e["\']/i',
            'decode berlapis' => '/\b(?:gzinflate|gzuncompress|str_rot13|base64_decode)\s*\(\s*(?:gzinflate|gzuncompress|str_rot13|base64_decode)/i',
            'include remote' => '/\binclude(?:_once)?\s*\(\s*["\'](?:https?|ftp):\/\//i',
            'tulis file injeksi' => '/\bfile_put_contents\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE)/i',
            'upload temp injeksi' => '/\bmove_uploaded_file\s*\(\s*\$_(?:GET|POST|REQUEST)/i',
        ];

        $findings = [];

        foreach ($this->phpFiles() as $file) {
            $content = @file_get_contents($file);

            if ($content === false) {
                continue;
            }

            foreach ($patterns as $label => $regex) {
                if (preg_match($regex, $content)) {
                    $findings[] = ['file' => $file, 'pattern' => $label];
                }
            }
        }

        if ($findings === []) {
            SecurityGuard::recordEndpoint(SecurityLog::TIPE_PINDAI, null, [
                'keterangan' => 'Pindai malware: bersih, tidak ditemukan pola mencurigakan.',
                'path' => '/system/scan',
            ]);

            $this->info('Bersih — tidak ada tanda mencurigakan.');

            return self::SUCCESS;
        }

        $byFile = [];

        foreach ($findings as $finding) {
            $byFile[$finding['file']][] = $finding['pattern'];
        }

        $sample = '';

        foreach (array_slice($byFile, 0, 5, true) as $file => $labels) {
            $sample .= basename($file).' ['.implode(',', $labels).'] ';
        }

        SecurityGuard::recordEndpoint(SecurityLog::TIPE_PERINGATAN, null, [
            'keterangan' => 'Pindai malware: '.count($findings).' temuan pada '.count($byFile).' berkas. '.$sample,
            'path' => '/system/scan',
        ]);

        $this->warn('Ditemukan '.count($findings).' kecocokan pada '.count($byFile).' berkas.');

        return self::FAILURE;
    }

    /**
     * @return array<int, string> Daftar path berkas PHP/htaccess yang dipindai.
     */
    private function phpFiles(): array
    {
        $files = [];

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

                if (str_contains($path, DIRECTORY_SEPARATOR.'node_modules'.DIRECTORY_SEPARATOR)
                    || str_contains($path, DIRECTORY_SEPARATOR.'storage'.DIRECTORY_SEPARATOR)) {
                    continue;
                }

                if (in_array(strtolower($file->getExtension()), ['php', 'phtml', 'php3', 'php4', 'php5', 'php7'], true)
                    || basename($path) === '.htaccess') {
                    $files[] = $path;
                }
            }
        }

        return $files;
    }
}
