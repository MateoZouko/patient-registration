<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class PatientRegistered extends Mailable
{
    public function __construct(public readonly string $fullName) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Patient Registration Confirmed');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.patient_registered');
    }
}
