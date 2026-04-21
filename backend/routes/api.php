<?php

use App\Http\Controllers\PatientController;
use Illuminate\Support\Facades\Route;

Route::get('/patients', [PatientController::class, 'index']);
Route::post('/patients', [PatientController::class, 'store']);
Route::get('/uploads/{filename}', [PatientController::class, 'serveUpload']);
Route::get('/health', fn() => response()->json(['status' => 'ok']));
