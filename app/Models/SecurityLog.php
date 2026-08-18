<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityLog extends Model
{
    use HasFactory;

    public const TIPE_LOGIN_SUKSES = 'login_sukses';

    public const TIPE_LOGIN_GAGAL = 'login_gagal';

    public const TIPE_DIBLOKIR = 'diblokir';

    public const TIPE_BANNED = 'banned';

    public const TIPE_UNBANNED = 'unbanned';

    public const TIPE_PORT_SCAN = 'port_scan';

    public const TIPE_ANALISIS = 'analisis';

    public const TIPE_INTEGRITAS = 'integritas';

    public const TIPE_PEMANTAUAN = 'pemantauan';

    public const TIPE_PEMBERSIHAN = 'pembersihan';

    public const TIPE_PINDAI = 'pindai';

    public const TIPE_PERINGATAN = 'peringatan';

    public const TIPES = [
        self::TIPE_LOGIN_SUKSES => 'Login Sukses',
        self::TIPE_LOGIN_GAGAL => 'Login Gagal',
        self::TIPE_DIBLOKIR => 'Diblokir',
        self::TIPE_BANNED => 'Diban',
        self::TIPE_UNBANNED => 'Di-unban',
        self::TIPE_PORT_SCAN => 'Port Scan',
        self::TIPE_ANALISIS => 'Analisis IDS',
        self::TIPE_INTEGRITAS => 'Cek Integritas',
        self::TIPE_PEMANTAUAN => 'Pemantauan',
        self::TIPE_PEMBERSIHAN => 'Pembersihan',
        self::TIPE_PINDAI => 'Pindai Malware',
        self::TIPE_PERINGATAN => 'Peringatan',
    ];

    /** Tipe yang mewakili ancaman nyata (dipakai untuk grafik ancaman). */
    public const THREAT_TIPES = [
        self::TIPE_LOGIN_SUKSES,
        self::TIPE_LOGIN_GAGAL,
        self::TIPE_DIBLOKIR,
        self::TIPE_BANNED,
        self::TIPE_UNBANNED,
        self::TIPE_PORT_SCAN,
    ];

    protected $table = 'security_logs';

    protected $fillable = [
        'tipe',
        'user_id',
        'ip_address',
        'browser',
        'sistem_operasi',
        'path',
        'keterangan',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
