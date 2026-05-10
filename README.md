# 🎫 EventHub — Gestion d'Événements

Application web complète de gestion d'événements avec inscriptions en ligne.

## Stack technique

- **Backend** : PHP 8.2+ / Laravel 11 (API REST uniquement)
- **Base de données** : SQLite (fichier `database/database.sqlite`)
- **Frontend** : HTML5 / CSS3 / JavaScript ES6+ vanilla (aucun framework, aucun bundler, aucun npm)

## Prérequis

- PHP 8.2+
- Composer
- Navigateur moderne (Chrome, Firefox, Edge, Safari récents)

---

## Installation

### Backend

Le projet Laravel est à la racine du dépôt.

```bash
# 1. Installer les dépendances
composer install

# 2. Copier l'environnement (déjà pré-configuré pour SQLite)
cp .env.example .env

# 3. Générer la clé applicative
php artisan key:generate

# 4. Créer le fichier SQLite
#    (Linux / macOS)
touch database/database.sqlite
#    (Windows PowerShell)
New-Item -ItemType File database/database.sqlite -Force

# 5. Lancer les migrations + seeder (8 événements de démo)
php artisan migrate:fresh --seed

# 6. Lancer le serveur Laravel
php artisan serve
# → API disponible sur http://localhost:8000/api
```

### Frontend

Le frontend se trouve dans le dossier `frontend/`. Il s'agit de fichiers statiques.

Trois options pour le servir :

```bash
# Option A — npx serve
npx serve frontend

# Option B — serveur PHP intégré
php -S localhost:3000 -t frontend

# Option C — ouvrir simplement frontend/index.html dans le navigateur
```

Par défaut, le frontend appelle l'API sur `http://localhost:8000/api`.
Pour changer l'URL, éditez la constante `API_BASE` en haut de `frontend/js/api.js`.

---

## Endpoints API

| Méthode | URL                                      | Rôle                              |
|---------|------------------------------------------|-----------------------------------|
| GET     | /api/events                              | Liste (filtres `search`, `date`)  |
| POST    | /api/events                              | Créer un événement                |
| GET     | /api/events/{id}                         | Détail                            |
| PUT     | /api/events/{id}                         | Mettre à jour                     |
| DELETE  | /api/events/{id}                         | Supprimer (cascade inscriptions)  |
| POST    | /api/events/{id}/register                | Inscription à un événement        |
| GET     | /api/events/{id}/registrations           | Liste des inscrits                |
| DELETE  | /api/registrations/{id}                  | Annuler une inscription           |

### Codes HTTP métier

- **400** — Données invalides (validation)
- **404** — Événement / inscription introuvable
- **409** — Email déjà inscrit pour cet événement
- **422** — Capacité atteinte

---

## Exemples cURL

```bash
# 1. Lister les événements
curl http://localhost:8000/api/events

# 2. Créer un événement
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workshop Vue.js",
    "description": "Apprenez Vue 3 en une journée",
    "date": "2026-02-10T09:00:00Z",
    "location": "Ouagadougou, Hub Tech",
    "capacity": 30
  }'

# 3. Voir le détail d'un événement
curl http://localhost:8000/api/events/1

# 4. S'inscrire à un événement
curl -X POST http://localhost:8000/api/events/1/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Awa",
    "last_name": "Sawadogo",
    "email": "awa@example.com"
  }'

# 5. Lister les inscrits
curl http://localhost:8000/api/events/1/registrations

# 6. Annuler une inscription
curl -X DELETE http://localhost:8000/api/registrations/1
```

---

## Choix techniques

- **SQLite** : pas de service externe à installer, portabilité maximale.
- **Pas de framework frontend** : démontre la maîtrise du DOM, des modules, du fetch et du CSS pur.
- **CORS ouvert** (`*`) : pour faciliter le développement local entre frontend et backend.
- **Dates en UTC ISO 8601** : sérialisation cohérente, le frontend reformate avec `toLocaleDateString('fr-FR')`.
- **Form Requests Laravel** : la validation renvoie HTTP 400 (au lieu du 422 par défaut) pour distinguer clairement validation et règles métier.
- **Règles métier explicites** : capacité (422), unicité email (409), validation (400), introuvable (404).
- **Module API centralisé** (`api.js`) : toutes les requêtes passent par un seul wrapper, gestion d'erreur uniforme.

## Architecture frontend

```
frontend/
├── index.html          Liste des événements + recherche debounced
├── event.html          Détail + formulaire d'inscription + liste inscrits
├── create.html         Création d'événement
├── css/style.css       Thème sombre premium (variables CSS)
└── js/
    ├── api.js          Wrapper fetch centralisé
    ├── utils.js        Format dates, toasts, icônes SVG
    ├── events-list.js  Logique liste
    ├── event-detail.js Logique détail + inscription
    └── event-create.js Logique création
```

## Direction artistique

Thème sombre premium inspiré des plateformes de billetterie haut de gamme :
- Police d'affichage : Playfair Display (serif)
- Police corps : DM Sans (sans-serif)
- Police mono : JetBrains Mono (compteurs)
- Couleur d'accent : or chaud (#E8A845)
- Animations subtiles : fadeInUp en cascade, shimmer skeleton, hover translateY, pulse badges complet

## Ce que j'aurais fait avec plus de temps

- **Tests** : suite PHPUnit (Feature) couvrant les 3 règles métier (capacité, unicité, validation).
- **Authentification** : Laravel Sanctum + JWT pour distinguer organisateurs et participants.
- **Docker Compose** : conteneurs PHP/Nginx + serveur statique frontend, reproductibilité totale.
- **Pagination** : `paginate(12)` sur la liste pour scaler au-delà de quelques dizaines d'événements.
- **Notifications email** : Mailable Laravel envoyé après inscription.
- **Version mobile Flutter** : réutilisation directe de l'API REST.
- **Accessibilité** : audit Lighthouse, attributs ARIA, gestion focus visible.
- **i18n** : extraction des chaînes via `lang/fr.json` côté front.
