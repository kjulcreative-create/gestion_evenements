<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::withCount('registrations');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        $events = $query->orderBy('date', 'asc')->get();

        return response()->json($events->map(fn ($event) => $this->formatEvent($event)), 200);
    }

    public function store(StoreEventRequest $request)
    {
        $event = Event::create($request->validated());
        $event->loadCount('registrations');

        return response()->json($this->formatEvent($event), 201);
    }

    public function show(Event $event)
    {
        $event->loadCount('registrations');

        return response()->json($this->formatEvent($event), 200);
    }

    public function update(UpdateEventRequest $request, Event $event)
    {
        $event->update($request->validated());
        $event->loadCount('registrations');

        return response()->json($this->formatEvent($event), 200);
    }

    public function destroy(Event $event)
    {
        $event->delete();

        return response()->json(['message' => 'Événement supprimé.'], 200);
    }

    private function formatEvent(Event $event): array
    {
        $count = (int) ($event->registrations_count ?? 0);

        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'date' => $event->date->toIso8601String(),
            'location' => $event->location,
            'capacity' => $event->capacity,
            'coverImage' => $event->cover_image,
            'registrationsCount' => $count,
            'remainingSpots' => max(0, $event->capacity - $count),
            'isFull' => $count >= $event->capacity,
            'createdAt' => $event->created_at->toIso8601String(),
        ];
    }
}
