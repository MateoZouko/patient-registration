<?php

namespace App\Jobs;

use App\Mail\PatientRegistered;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPatientNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $email,
        public readonly string $fullName,
    ) {}

    public function handle(): void
    {
        try {
            Mail::to($this->email)->send(new PatientRegistered($this->fullName));
        } catch (\Throwable $e) {
            Log::warning('[notifier] Email delivery failed for ' . $this->email . ': ' . $e->getMessage());
        }
    }
}
