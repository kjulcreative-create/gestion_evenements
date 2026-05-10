<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRegistrationRequest;
use App\Models\Event;
use App\Models\Registration;

class RegistrationController extends Controller
{
    public function index(Event $event)
    {
        $registrations = $event->registrations()->orderBy('registered_at', 'desc')->get();

        return response()->json($registrations->map(fn ($reg) => $this->formatRegistration($reg)), 200);
    }

    public function store(StoreRegistrationRequest $request, Event $event)
    {
        $currentCount = $event->registrations()->count();
        if ($currentCount >= $event->capacity) {
            return response()->json([
                'error' => 'CAPACITY_REACHED',
                'message' => 'Cet évènement est complet.',
            ], 422);
        }

        $exists = $event->registrations()
            ->where('email', $request->email)
            ->exists();
        if ($exists) {
            return response()->json([
                'error' => 'DUPLICATE_EMAIL',
                'message' => 'Cette adresse email est déjà enregistrée pour cet évènement.',
            ], 409);
        }

        $registration = $event->registrations()->create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'registered_at' => now(),
        ]);

        return response()->json($this->formatRegistration($registration), 201);
    }

    public function destroy(Registration $registration)
    {
        $registration->delete();

        return response()->json(['message' => 'Inscription annulée.'], 200);
    }

    private function formatRegistration(Registration $reg): array
    {
        return [
            'id' => $reg->id,
            'eventId' => $reg->event_id,
            'firstName' => $reg->first_name,
            'lastName' => $reg->last_name,
            'email' => $reg->email,
            'registeredAt' => $reg->registered_at->toIso8601String(),
        ];
    }
}
