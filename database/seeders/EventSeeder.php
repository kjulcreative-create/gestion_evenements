<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'title' => 'Conférence Tech Ouaga 2025',
                'description' => 'Rencontre annuelle des développeurs et startups du Burkina Faso. Talks, ateliers et networking.',
                'date' => '2025-12-15 09:00:00',
                'location' => 'Ouagadougou, Salle SIAO',
                'capacity' => 100,
            ],
            [
                'title' => 'Atelier Laravel Avancé',
                'description' => 'Workshop pratique sur les design patterns Laravel, queues, events et testing.',
                'date' => '2025-11-20 14:00:00',
                'location' => 'Ouagadougou, Hub Tech',
                'capacity' => 25,
            ],
            [
                'title' => 'Hackathon IA pour la Santé',
                'description' => 'Développer des solutions IA pour améliorer l\'accès aux soins en Afrique de l\'Ouest.',
                'date' => '2025-11-28 08:00:00',
                'location' => 'Bobo-Dioulasso, Université',
                'capacity' => 50,
            ],
            [
                'title' => 'Meetup UX/UI Design',
                'description' => 'Discussion sur les tendances UX 2025 et les bonnes pratiques d\'accessibilité.',
                'date' => '2025-12-05 17:30:00',
                'location' => 'Ouagadougou, Coworking Yam',
                'capacity' => 30,
            ],
            [
                'title' => 'Formation Git & DevOps',
                'description' => 'De zéro à CI/CD : maîtrisez Git, Docker et les pipelines de déploiement.',
                'date' => '2025-12-10 10:00:00',
                'location' => 'Koudougou, Centre de Formation',
                'capacity' => 20,
            ],
            [
                'title' => 'Concert Jazz au Parc Bangr-Weoogo',
                'description' => 'Soirée musicale en plein air avec des artistes locaux et internationaux.',
                'date' => '2025-12-20 19:00:00',
                'location' => 'Ouagadougou, Parc Bangr-Weoogo',
                'capacity' => 200,
            ],
            [
                'title' => 'Séminaire Entrepreneuriat Féminin',
                'description' => 'Inspirer et outiller les femmes entrepreneurs du Burkina.',
                'date' => '2025-11-25 09:00:00',
                'location' => 'Ouagadougou, Hôtel Laïco',
                'capacity' => 3,
            ],
            [
                'title' => 'Workshop Mobile Flutter',
                'description' => 'Construire une app mobile cross-platform en un week-end.',
                'date' => '2026-01-10 09:00:00',
                'location' => 'Ouagadougou, 2iE',
                'capacity' => 15,
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }

        $event7 = Event::find(7);
        if ($event7) {
            $event7->registrations()->createMany([
                ['first_name' => 'Fatou', 'last_name' => 'Traoré', 'email' => 'fatou@example.com', 'registered_at' => now()],
                ['first_name' => 'Aïcha', 'last_name' => 'Compaoré', 'email' => 'aicha@example.com', 'registered_at' => now()],
            ]);
        }
    }
}
