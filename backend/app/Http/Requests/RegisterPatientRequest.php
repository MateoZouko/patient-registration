<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterPatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name'    => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\'\-]+$/u'],
            'email'        => ['required', 'string', 'regex:/^[a-zA-Z0-9._%+\-]+@gmail\.com$/'],
            'phone_code'   => ['required', 'string', 'regex:/^\+\d{1,4}$/'],
            'phone_number' => ['required', 'string', 'regex:/^\d{4,15}$/'],
            'photo'        => ['required', 'file', 'max:5120', 'mimes:jpg,jpeg'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required'    => 'Full name is required.',
            'full_name.max'         => 'Full name must not exceed 255 characters.',
            'full_name.regex'       => 'Full name may only contain letters, spaces, hyphens and apostrophes.',
            'email.required'        => 'Email is required.',
            'email.regex'           => 'Email must be a valid @gmail.com address.',
            'phone_code.required'   => 'Country code is required.',
            'phone_code.regex'      => 'Country code must be in the format +1 to +9999.',
            'phone_number.required' => 'Phone number is required.',
            'phone_number.regex'    => 'Phone number must be 4 to 15 digits.',
            'photo.required'        => 'A document photo is required.',
            'photo.max'             => 'File is too large. Maximum allowed size is 5 MB.',
            'photo.mimes'           => 'Only JPG/JPEG images are accepted.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        $errors = [];
        foreach ($validator->errors()->toArray() as $field => $messages) {
            $errors[$field] = $messages[0];
        }

        throw new HttpResponseException(
            response()->json(['errors' => $errors], 422)
        );
    }
}
