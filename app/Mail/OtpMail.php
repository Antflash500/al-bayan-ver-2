<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly string $code,
        public readonly string $purpose = 'reset',
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->purpose === 'verify'
            ? 'Kode Verifikasi Email - Al Bayan'
            : 'Kode Reset Password - Al Bayan';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'code' => $this->code,
                'purpose' => $this->purpose,
            ],
        );
    }
}