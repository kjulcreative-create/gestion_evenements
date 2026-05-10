<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::prefix('events')->group(function () {
    Route::get('/', [EventController::class, 'index']);
    Route::post('/', [EventController::class, 'store']);
    Route::get('/{event}', [EventController::class, 'show']);
    Route::put('/{event}', [EventController::class, 'update']);
    Route::delete('/{event}', [EventController::class, 'destroy']);
    Route::post('/{event}/register', [RegistrationController::class, 'store']);
    Route::get('/{event}/registrations', [RegistrationController::class, 'index']);
});

Route::delete('/registrations/{registration}', [RegistrationController::class, 'destroy']);
