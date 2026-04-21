<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterPatientRequest;
use App\Jobs\SendPatientNotification;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PatientController extends Controller
{
    public function index(): JsonResponse
    {
        $patients = DB::select(
            'SELECT id, full_name, email, phone_code, phone_number, photo_path, created_at
             FROM patients
             ORDER BY created_at DESC'
        );

        return response()->json(array_map(fn($row) => (array) $row, $patients));
    }

    public function store(RegisterPatientRequest $request): JsonResponse
    {
        $photo = $request->file('photo');

        $imageInfo = @getimagesize($photo->getPathname());
        if ($imageInfo === false || $imageInfo[2] !== IMAGETYPE_JPEG) {
            return response()->json(
                ['errors' => ['photo' => 'The file must be a valid JPEG image.']],
                422
            );
        }

        $filename = Str::uuid() . '.jpg';
        $photo->storeAs('uploads', $filename, 'public');

        $photoPath = '/api/uploads/' . $filename;
        $email     = strtolower(trim($request->input('email')));

        try {
            $patient = DB::selectOne(
                'INSERT INTO patients (full_name, email, phone_code, phone_number, photo_path)
                 VALUES (?, ?, ?, ?, ?)
                 RETURNING id, full_name, email, phone_code, phone_number, photo_path, created_at',
                [
                    trim($request->input('full_name')),
                    $email,
                    trim($request->input('phone_code')),
                    trim($request->input('phone_number')),
                    $photoPath,
                ]
            );
        } catch (\Throwable $e) {
            if (str_contains(strtolower($e->getMessage()), 'unique') &&
                str_contains(strtolower($e->getMessage()), 'email')) {
                return response()->json(
                    ['errors' => ['email' => 'This email address is already registered.']],
                    409
                );
            }
            return response()->json(
                ['errors' => ['general' => 'An unexpected error occurred. Please try again.']],
                500
            );
        }

        SendPatientNotification::dispatch($email, $patient->full_name);

        return response()->json((array) $patient, 201);
    }

    public function serveUpload(string $filename): BinaryFileResponse
    {
        $path = storage_path('app/public/uploads/' . basename($filename));

        abort_if(!file_exists($path), 404);

        return response()->file($path);
    }
}
