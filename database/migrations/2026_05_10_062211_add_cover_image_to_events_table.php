<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('cover_image')->nullable()->after('location');
        });

        // Assigner les images Unsplash aux événements existants
        $images = [
            'Conférence Tech Ouaga 2025'        => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&h=300&fit=crop&auto=format',
            'Atelier Laravel Avancé'             => 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&h=300&fit=crop&auto=format',
            'Hackathon IA pour la Santé'         => 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&h=300&fit=crop&auto=format',
            'Meetup UX/UI Design'                => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=700&h=300&fit=crop&auto=format',
            'Formation Git & DevOps'             => 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=700&h=300&fit=crop&auto=format',
            'Concert Jazz au Parc Bangr-Weoogo'  => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&h=300&fit=crop&auto=format',
            'Séminaire Entrepreneuriat Féminin'  => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=300&fit=crop&auto=format',
            'Workshop Mobile Flutter'            => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&h=300&fit=crop&auto=format',
        ];

        foreach ($images as $title => $url) {
            DB::table('events')->where('title', $title)->update(['cover_image' => $url]);
        }
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('cover_image');
        });
    }
};
