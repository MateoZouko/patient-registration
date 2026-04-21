<?php

namespace Tests\Feature;

use App\Jobs\SendPatientNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class PatientTest extends TestCase
{
    use RefreshDatabase;

    // Helpers

    private function makeJpeg(string $name = 'photo.jpg'): UploadedFile
    {
        $image = imagecreatetruecolor(10, 10);
        imagefilledrectangle($image, 0, 0, 9, 9, imagecolorallocate($image, 255, 0, 0));
        ob_start();
        imagejpeg($image);
        $content = ob_get_clean();
        imagedestroy($image);

        $tmp = tempnam(sys_get_temp_dir(), 'jpeg_');
        file_put_contents($tmp, $content);
        return new UploadedFile($tmp, $name, 'image/jpeg', null, true);
    }

    private function makePng(string $name = 'photo.png'): UploadedFile
    {
        $image = imagecreatetruecolor(10, 10);
        ob_start();
        imagepng($image);
        $content = ob_get_clean();
        imagedestroy($image);

        $tmp = tempnam(sys_get_temp_dir(), 'png_');
        file_put_contents($tmp, $content);
        return new UploadedFile($tmp, $name, 'image/png', null, true);
    }

    private function validForm(array $overrides = []): array
    {
        return array_merge([
            'full_name'    => 'Jane Doe',
            'email'        => 'patient@gmail.com',
            'phone_code'   => '+598',
            'phone_number' => '99123456',
        ], $overrides);
    }

    // Health

    public function test_health_endpoint(): void
    {
        $this->getJson('/api/health')
            ->assertStatus(200)
            ->assertJson(['status' => 'ok']);
    }

    // GET /api/patients

    public function test_list_patients_returns_empty_array(): void
    {
        $this->getJson('/api/patients')
            ->assertStatus(200)
            ->assertJson([]);
    }

    public function test_list_patients_returns_records(): void
    {
        Queue::fake();
        $this->post('/api/patients', $this->validForm(), [])
             ->assertStatus(422); // no photo

        $this->postMultipart($this->validForm(), $this->makeJpeg())
             ->assertStatus(201);

        $response = $this->getJson('/api/patients')->assertStatus(200);
        $this->assertCount(1, $response->json());
        $this->assertEquals('patient@gmail.com', $response->json()[0]['email']);
    }

    // POST /api/patients — validation failures

    public function test_create_patient_missing_all_fields(): void
    {
        $response = $this->postJson('/api/patients', []);
        $response->assertStatus(422);
        $errors = $response->json('errors');
        $this->assertArrayHasKey('full_name', $errors);
        $this->assertArrayHasKey('email', $errors);
        $this->assertArrayHasKey('phone_code', $errors);
        $this->assertArrayHasKey('phone_number', $errors);
        $this->assertArrayHasKey('photo', $errors);
    }

    public function test_create_patient_invalid_name(): void
    {
        $this->postMultipart($this->validForm(['full_name' => 'John2 Doe']), $this->makeJpeg())
            ->assertStatus(422)
            ->assertJsonPath('errors.full_name', fn($v) => !empty($v));
    }

    public function test_create_patient_invalid_email(): void
    {
        $this->postMultipart($this->validForm(['email' => 'user@yahoo.com']), $this->makeJpeg())
            ->assertStatus(422)
            ->assertJsonPath('errors.email', fn($v) => !empty($v));
    }

    public function test_create_patient_invalid_phone_code_no_plus(): void
    {
        $this->postMultipart($this->validForm(['phone_code' => '598']), $this->makeJpeg())
            ->assertStatus(422)
            ->assertJsonPath('errors.phone_code', fn($v) => !empty($v));
    }

    public function test_create_patient_invalid_phone_number_too_short(): void
    {
        $this->postMultipart($this->validForm(['phone_number' => '123']), $this->makeJpeg())
            ->assertStatus(422)
            ->assertJsonPath('errors.phone_number', fn($v) => !empty($v));
    }

    public function test_create_patient_png_rejected(): void
    {
        $this->postMultipart($this->validForm(), $this->makePng('doc.png'))
            ->assertStatus(422)
            ->assertJsonPath('errors.photo', fn($v) => !empty($v));
    }

    public function test_create_patient_fake_jpg_rejected(): void
    {
        // PNG bytes renamed to .jpg must fail the MIME check
        $this->postMultipart($this->validForm(), $this->makePng('doc.jpg'))
            ->assertStatus(422)
            ->assertJsonPath('errors.photo', fn($v) => !empty($v));
    }

    // POST /api/patients — success

    public function test_create_patient_success(): void
    {
        Queue::fake();

        $response = $this->postMultipart($this->validForm(), $this->makeJpeg());
        $response->assertStatus(201);

        $body = $response->json();
        $this->assertEquals('patient@gmail.com', $body['email']);
        $this->assertArrayHasKey('id', $body);
        $this->assertStringStartsWith('/api/uploads/', $body['photo_path']);
    }

    public function test_create_patient_dispatches_notification_job(): void
    {
        Queue::fake();

        $this->postMultipart($this->validForm(), $this->makeJpeg())
            ->assertStatus(201);

        Queue::assertPushed(SendPatientNotification::class, function ($job) {
            return $job->email === 'patient@gmail.com';
        });
    }

    // POST /api/patients — duplicate email

    public function test_create_patient_duplicate_email_returns_409(): void
    {
        Queue::fake();

        $this->postMultipart($this->validForm(), $this->makeJpeg())
            ->assertStatus(201);

        $this->postMultipart($this->validForm(), $this->makeJpeg('photo2.jpg'))
            ->assertStatus(409)
            ->assertJsonPath('errors.email', fn($v) => !empty($v));
    }

    // Private helper

    private function postMultipart(array $data, UploadedFile $photo): \Illuminate\Testing\TestResponse
    {
        return $this->call(
            'POST',
            '/api/patients',
            $data,
            [],
            ['photo' => $photo],
            ['CONTENT_TYPE' => 'multipart/form-data']
        );
    }
}
