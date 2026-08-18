<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kode OTP Al Bayan</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background-color:#0f766e;padding:24px 32px;text-align:center;">
                            <span style="color:#ffffff;font-size:20px;font-weight:bold;">Al Bayan</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <p style="margin:0 0 16px;color:#18181b;font-size:16px;">Assalamu'alaikum,</p>
                            <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">
                                Gunakan kode berikut untuk {{ $purpose === 'verify' ? 'memverifikasi email Anda' : 'mereset password Anda' }}.
                                Kode berlaku selama 5 menit dan hanya untuk satu kali pemakaian.
                            </p>
                            <div style="background-color:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:20px;text-align:center;">
                                <span style="font-size:28px;font-weight:bold;letter-spacing:8px;color:#0f766e;">{{ $code }}</span>
                            </div>
                            <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
                                Jika Anda tidak meminta kode ini, abaikan email ini. Jangan bagikan kode kepada siapa pun.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#fafafa;padding:16px 32px;text-align:center;">
                            <span style="color:#a1a1aa;font-size:12px;">&copy; {{ date('Y') }} Al Bayan Education. Semua hak dilindungi.</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>