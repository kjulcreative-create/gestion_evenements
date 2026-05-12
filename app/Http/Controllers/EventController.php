<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        $validated = $request->validated();

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('events', 'public');
            $validated['cover_image'] = url('storage/' . $path);
        }

        $event = Event::create($validated);
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
        $validated = $request->validated();

        if ($request->hasFile('cover_image')) {
            $this->deleteLocalImage($event->cover_image);
            $path = $request->file('cover_image')->store('events', 'public');
            $validated['cover_image'] = url('storage/' . $path);
        } elseif ($request->input('remove_cover_image') === '1') {
            $this->deleteLocalImage($event->cover_image);
            $validated['cover_image'] = null;
        }

        $event->update($validated);
        $event->loadCount('registrations');

        return response()->json($this->formatEvent($event), 200);
    }

    private function deleteLocalImage(?string $url): void
    {
        if (!$url) return;
        $path = parse_url($url, PHP_URL_PATH);
        if ($path && str_starts_with($path, '/storage/')) {
            Storage::disk('public')->delete(substr($path, strlen('/storage/')));
        }
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
