<?php

namespace Tests\Unit;

use App\Http\Requests\RegisterPatientRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class ValidatorTest extends TestCase
{
    private function makeJpegFile(string $name): \Illuminate\Http\UploadedFile
    {
        $image   = imagecreatetruecolor(10, 10);
        ob_start();
        imagejpeg($image);
        $content = ob_get_clean();
        imagedestroy($image);
        $tmp = tempnam(sys_get_temp_dir(), 'photo_');
        file_put_contents($tmp, $content);
        return new \Illuminate\Http\UploadedFile($tmp, $name, 'image/jpeg', null, true);
    }

    private function makePngFile(string $name): \Illuminate\Http\UploadedFile
    {
        $image   = imagecreatetruecolor(10, 10);
        ob_start();
        imagepng($image);
        $content = ob_get_clean();
        imagedestroy($image);
        $tmp = tempnam(sys_get_temp_dir(), 'photo_');
        file_put_contents($tmp, $content);
        return new \Illuminate\Http\UploadedFile($tmp, $name, 'image/png', null, true);
    }

    private function validate(array $data, ?string $photoName = 'photo.jpg'): array
    {
        $file = null;
        if ($photoName !== null) {
            $file = $this->makeJpegFile($photoName);
        }

        $input = array_merge($data, $file ? ['photo' => $file] : []);
        $request = new RegisterPatientRequest();
        $validator = Validator::make($input, $request->rules(), $request->messages());
        return $validator->errors()->toArray();
    }

    // -----------------------------------------------------------------------
    // full_name
    // -----------------------------------------------------------------------

    public function test_valid_full_name(): void
    {
        $this->assertArrayNotHasKey('full_name', $this->validate($this->validData()));
    }

    public function test_full_name_missing(): void
    {
        $this->assertArrayHasKey('full_name', $this->validate($this->validData(['full_name' => ''])));
    }

    public function test_full_name_with_digits(): void
    {
        $this->assertArrayHasKey('full_name', $this->validate($this->validData(['full_name' => 'John2 Doe'])));
    }

    public function test_full_name_accented_letters_allowed(): void
    {
        $this->assertArrayNotHasKey('full_name', $this->validate($this->validData(['full_name' => 'José García'])));
    }

    public function test_full_name_hyphen_allowed(): void
    {
        $this->assertArrayNotHasKey('full_name', $this->validate($this->validData(['full_name' => 'Mary-Jane'])));
    }

    public function test_full_name_apostrophe_allowed(): void
    {
        $this->assertArrayNotHasKey('full_name', $this->validate($this->validData(['full_name' => "O'Brien"])));
    }

    public function test_full_name_too_long(): void
    {
        $this->assertArrayHasKey('full_name', $this->validate($this->validData(['full_name' => str_repeat('A', 256)])));
    }

    // -----------------------------------------------------------------------
    // email
    // -----------------------------------------------------------------------

    public function test_valid_email(): void
    {
        $this->assertArrayNotHasKey('email', $this->validate($this->validData()));
    }

    public function test_email_missing(): void
    {
        $this->assertArrayHasKey('email', $this->validate($this->validData(['email' => ''])));
    }

    public function test_email_not_gmail(): void
    {
        $this->assertArrayHasKey('email', $this->validate($this->validData(['email' => 'user@yahoo.com'])));
    }

    public function test_email_no_at_sign(): void
    {
        $this->assertArrayHasKey('email', $this->validate($this->validData(['email' => 'usergmail.com'])));
    }

    public function test_email_subdomain_rejected(): void
    {
        $this->assertArrayHasKey('email', $this->validate($this->validData(['email' => 'user@mail.gmail.com'])));
    }

    // -----------------------------------------------------------------------
    // phone_code
    // -----------------------------------------------------------------------

    public function test_valid_phone_code(): void
    {
        $this->assertArrayNotHasKey('phone_code', $this->validate($this->validData()));
    }

    public function test_phone_code_missing(): void
    {
        $this->assertArrayHasKey('phone_code', $this->validate($this->validData(['phone_code' => ''])));
    }

    public function test_phone_code_no_plus(): void
    {
        $this->assertArrayHasKey('phone_code', $this->validate($this->validData(['phone_code' => '598'])));
    }

    public function test_phone_code_letters_rejected(): void
    {
        $this->assertArrayHasKey('phone_code', $this->validate($this->validData(['phone_code' => '+ABC'])));
    }

    public function test_phone_code_max_four_digits_accepted(): void
    {
        $this->assertArrayNotHasKey('phone_code', $this->validate($this->validData(['phone_code' => '+1234'])));
    }

    public function test_phone_code_five_digits_rejected(): void
    {
        $this->assertArrayHasKey('phone_code', $this->validate($this->validData(['phone_code' => '+12345'])));
    }

    // -----------------------------------------------------------------------
    // phone_number
    // -----------------------------------------------------------------------

    public function test_valid_phone_number(): void
    {
        $this->assertArrayNotHasKey('phone_number', $this->validate($this->validData()));
    }

    public function test_phone_number_missing(): void
    {
        $this->assertArrayHasKey('phone_number', $this->validate($this->validData(['phone_number' => ''])));
    }

    public function test_phone_number_too_short(): void
    {
        $this->assertArrayHasKey('phone_number', $this->validate($this->validData(['phone_number' => '123'])));
    }

    public function test_phone_number_letters_rejected(): void
    {
        $this->assertArrayHasKey('phone_number', $this->validate($this->validData(['phone_number' => '9912abcd'])));
    }

    public function test_phone_number_max_fifteen_digits_accepted(): void
    {
        $this->assertArrayNotHasKey('phone_number', $this->validate($this->validData(['phone_number' => str_repeat('1', 15)])));
    }

    public function test_phone_number_sixteen_digits_rejected(): void
    {
        $this->assertArrayHasKey('phone_number', $this->validate($this->validData(['phone_number' => str_repeat('1', 16)])));
    }

    // -----------------------------------------------------------------------
    // photo
    // -----------------------------------------------------------------------

    public function test_photo_missing(): void
    {
        $errors = $this->validate($this->validData(), null);
        $this->assertArrayHasKey('photo', $errors);
    }

    public function test_photo_jpg_accepted(): void
    {
        $this->assertArrayNotHasKey('photo', $this->validate($this->validData(), 'document.jpg'));
    }

    public function test_photo_jpeg_accepted(): void
    {
        $this->assertArrayNotHasKey('photo', $this->validate($this->validData(), 'document.jpeg'));
    }

    public function test_photo_uppercase_jpg_accepted(): void
    {
        $this->assertArrayNotHasKey('photo', $this->validate($this->validData(), 'DOCUMENT.JPG'));
    }

    public function test_photo_png_rejected(): void
    {
        $file  = $this->makePngFile('doc.png');
        $input = array_merge($this->validData(), ['photo' => $file]);

        $request = new RegisterPatientRequest();
        $errors  = Validator::make($input, $request->rules(), $request->messages())->errors()->toArray();
        $this->assertArrayHasKey('photo', $errors);
    }

    public function test_photo_pdf_rejected(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'photo_');
        file_put_contents($tmp, '%PDF-1.4');
        $file  = new \Illuminate\Http\UploadedFile($tmp, 'doc.pdf', 'application/pdf', null, true);
        $input = array_merge($this->validData(), ['photo' => $file]);

        $request = new RegisterPatientRequest();
        $errors  = Validator::make($input, $request->rules(), $request->messages())->errors()->toArray();
        $this->assertArrayHasKey('photo', $errors);
    }

    public function test_multiple_errors_returned_at_once(): void
    {
        $errors = $this->validate(['full_name' => '', 'email' => '', 'phone_code' => '', 'phone_number' => ''], null);
        $this->assertCount(5, $errors);
    }

    public function test_no_errors_on_valid_data(): void
    {
        $this->assertEmpty($this->validate($this->validData()));
    }

    // -----------------------------------------------------------------------
    // Private helper
    // -----------------------------------------------------------------------

    private function validData(array $overrides = []): array
    {
        return array_merge([
            'full_name'    => 'Jane Doe',
            'email'        => 'patient@gmail.com',
            'phone_code'   => '+598',
            'phone_number' => '99123456',
        ], $overrides);
    }
}
