<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Penyimpanan unggahan yang aman.
 *
 * Laravel `$file->store()` mempertahankan ekstensi dari NAMA KLIEN. Penyerang
 * bisa mem-upload `shell.php` yang diawali byte gambar (polyglot) sehingga lolos
 * pemeriksaan MIME, lalu tersimpan sebagai `.php` dan dieksekusi server
 * (RCE). Kelas ini memaksa ekstensi aman yang diturunkan dari MIME NYATA
 * (finfo), bukan dari nama file klien.
 */
class UploadSanitizer
{
    private const ALLOWED = [
        'image' => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        'pdf' => ['pdf'],
        'video' => ['mp4', 'webm', 'ogg'],
    ];

    private const DANGEROUS = [
        'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'pht',
        'phar', 'shtml', 'cgi', 'pl', 'py', 'sh',
        'asp', 'aspx', 'asa', 'cer', 'jsp', 'jspx', 'cfm', 'war',
        'exe', 'dll', 'bat', 'cmd', 'htaccess', 'htpasswd',
    ];

    /**
     * Simpan berkas dengan ekstensi aman.
     *
     * @throws RuntimeException bila berkas tidak memenuhi whitelist.
     */
    public static function store(UploadedFile $file, string $dir, string $context = 'image'): string
    {
        $allowed = self::ALLOWED[$context] ?? self::ALLOWED['image'];

        $clientExt = strtolower((string) $file->getClientOriginalExtension());
        $realExt = strtolower((string) $file->guessExtension());

        // Tolak sejak awal bila nama klien membawa ekstensi berbahaya.
        if (in_array($clientExt, self::DANGEROUS, true)) {
            throw new RuntimeException('Jenis berkas tidak diizinkan.');
        }

        // Prioritas 1: ekstensi dari MIME nyata (finfo) yang ada di whitelist.
        $safeExt = in_array($realExt, $allowed, true) ? $realExt : null;

        // Prioritas 2: ekstensi klien jika masih dalam whitelist (mis. finfo
        // tidak mengenali varian kecil gambar).
        if ($safeExt === null && in_array($clientExt, $allowed, true)) {
            $safeExt = $clientExt;
        }

        if ($safeExt === null) {
            throw new RuntimeException('Jenis berkas tidak diizinkan.');
        }

        // Nama acak + ekstensi aman; nama klien tidak pernah dipakai.
        return $file->storeAs($dir, Str::random(40).'.'.$safeExt, 'public');
    }
}