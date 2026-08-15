# Al Bayan Education

Sistem manajemen pendidikan pesantren **Al Bayan Education** — aplikasi web untuk mengelola data santri, program pendidikan, pembayaran, asrama, materi pembelajaran, dan keamanan sistem.

Dibangun dengan **Laravel 12** + **Inertia.js** + **React 19** + **TypeScript**, menggunakan **MySQL** sebagai basis data.

## Fitur Utama

### Portal Santri
- Login / registrasi santri (NIM atau email) dengan verifikasi email
- Reset kata sandi melalui kode OTP ke email
- Dashboard santri dengan pemantauan kehadiran (heartbeat)
- Pendaftaran & pilihan program pendidikan
- Akses materi pembelajaran beserta lampiran
- Profil & biodata dengan unduh PDF
- Pembayaran serta unduh kwitansi PDF
- Asrama: status kamar / ranjang & penempatan
- Sertifikat

### Panel Admin
- Dashboard ringkasan data
- Manajemen pengguna (santri & admin) dengan jabatan
- Manajemen program & materi
- Pendaftaran siswa
- Pembayaran & transaksi
- Asrama: rumah, kamar, ranjang, penempatan, riwayat, dan pencarian santri
- Pengumuman & galeri
- Log aktivitas

### Keamanan
- Login admin terpisah dari portal santri
- Firewall berbasis IP (allow/block list dan auto-ban)
- Security log & scan port
- Proteksi CSRF dan XSS (bawaan Laravel)

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Backend | PHP 8.2+, Laravel 12 |
| Frontend | Inertia.js 3, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Build | Vite 6 |
| Database | MySQL 8 |
| Realtime | Laravel Reverb + Laravel Echo |
| Lainnya | Zod, react-hook-form, jspdf, motion, Ziggy |

## Persyaratan

- PHP 8.2+ (ekstensi `pdo_mysql`, `mbstring`, `openssl`)
- Composer
- Node.js 20+
- MySQL 8
- Python 3 (opsional, untuk generator kwitansi & biodata)

## Instalasi

```bash
# 1. Install dependensi
composer install
npm install

# 2. Salin environment & buat kunci aplikasi
cp .env.example .env
php artisan key:generate

# 3. Konfigurasi database di .env
#    DB_CONNECTION=mysql
#    DB_HOST=127.0.0.1
#    DB_PORT=3306
#    DB_DATABASE=al_bayan
#    DB_USERNAME=root
#    DB_PASSWORD=...

# 4. Jalankan migrasi
php artisan migrate

# 5. Build asset frontend
npm run build
```

## Menjalankan (Development)

```bash
# Terminal 1 — Vite dev server
npm run dev

# Terminal 2 — Laravel server
php artisan serve --port=505
```

Alternatif mode terpadu (server, queue, log, dan Vite sekaligus):

```bash
composer dev
```

## Akun Default

- **Admin:** `fari` (Super Admin) dan `wiraganteng` (Administrator) — dikelola di tabel `users`
- **Santri:** akun yang didaftarkan melalui halaman register

## Catatan

- Server pengembangan biasanya dijalankan di latar belakang pada port `505`.
- Generator kwitansi/biodata memakai Python; biarkan `PYTHON_BINARY` dan `KWITANSI_PYTHON` kosong agar dideteksi otomatis.
- Database diimpor dari PostgreSQL lama ke MySQL (`al_bayan`); dump data siswa & admin tersedia di `images/data-siswa-admin.mysql`.

## Lisensi

Proyek ini berlisensi [MIT](https://opensource.org/licenses/MIT).
