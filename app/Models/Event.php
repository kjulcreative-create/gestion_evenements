<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = ['title', 'description', 'date', 'location', 'capacity', 'cover_image'];

    protected $casts = [
        'date' => 'datetime',
        'capacity' => 'integer',
    ];

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function getRegistrationsCountAttribute(): int
    {
        if (array_key_exists('registrations_count', $this->attributes)) {
            return (int) $this->attributes['registrations_count'];
        }
        return $this->registrations()->count();
    }

    public function getRemainingAttribute(): int
    {
        return max(0, $this->capacity - $this->registrations_count);
    }

    public function getIsFullAttribute(): bool
    {
        return $this->remaining === 0;
    }
}
