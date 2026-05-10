<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Laravel') }}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg: #faf9f6;
            --card: #ffffff;
            --ink: #1a1917;
            --ink2: #6b6860;
            --ink3: #a09d95;
            --line: #e8e5de;
            --accent: #c05621;
            --green: #2d7a4f;
            --sans: 'DM Sans', system-ui, sans-serif;
            --mono: 'DM Mono', ui-monospace, monospace;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg: #111110;
                --card: #1a1a18;
                --ink: #eeece6;
                --ink2: #9b9890;
                --ink3: #5e5c56;
                --line: #2a2925;
                --accent: #e8793b;
                --green: #4ade80;
            }
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background: var(--bg);
            color: var(--ink);
            font-family: var(--sans);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            -webkit-font-smoothing: antialiased;
        }

        .welcome {
            width: 100%;
            max-width: 520px;
            text-align: center;
            animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes rise {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .logo {
            width: 56px;
            height: 56px;
            margin: 0 auto 32px;
            background: var(--ink);
            color: var(--bg);
            border-radius: 14px;
            display: grid;
            place-items: center;
            font-weight: 600;
            font-size: 24px;
            font-style: italic;
        }

        h1 {
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.02em;
            margin-bottom: 8px;
        }

        .subtitle {
            color: var(--ink2);
            font-size: 15px;
            margin-bottom: 36px;
        }

        .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 100px;
            padding: 8px 18px 8px 14px;
            font-size: 13px;
            color: var(--ink2);
            margin-bottom: 36px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: var(--green);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }

        .card {
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 12px;
            overflow: hidden;
            text-align: left;
            margin-bottom: 32px;
        }

        .card-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 20px;
            font-size: 13.5px;
            border-bottom: 1px solid var(--line);
        }
        .card-row:last-child { border-bottom: 0; }

        .card-label { color: var(--ink2); }

        .card-value {
            font-family: var(--mono);
            font-size: 12.5px;
        }

        .actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.15s ease;
            border: 1px solid transparent;
            font-family: var(--sans);
            cursor: pointer;
        }

        .btn-primary {
            background: var(--ink);
            color: var(--bg);
        }
        .btn-primary:hover { opacity: 0.85; }

        .btn-secondary {
            background: var(--card);
            color: var(--ink);
            border-color: var(--line);
        }
        .btn-secondary:hover { border-color: var(--ink3); }

        .btn svg { width: 15px; height: 15px; }

        .footer {
            margin-top: 40px;
            font-family: var(--mono);
            font-size: 11px;
            color: var(--ink3);
        }
    </style>
</head>
<body>

    <div class="welcome">

        <div class="logo">{{ substr(config('app.name', 'L'), 0, 1) }}</div>

        <h1>{{ config('app.name', 'Laravel') }}</h1>
        <p class="subtitle">Console d'administration</p>

        <div class="status">
            <span class="status-dot"></span>
            Tous les services sont opérationnels
        </div>

        <div class="card">
            <div class="card-row">
                <span class="card-label">Environnement</span>
                <span class="card-value">{{ config('app.env') }}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Laravel</span>
                <span class="card-value">v{{ Illuminate\Foundation\Application::VERSION }}</span>
            </div>
            <div class="card-row">
                <span class="card-label">PHP</span>
                <span class="card-value">{{ phpversion() }}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Fuseau horaire</span>
                <span class="card-value">{{ config('app.timezone') }}</span>
            </div>
        </div>

        <div class="actions">
            @auth
                <a href="#" class="btn btn-primary">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Tableau de bord
                </a>
           
            @endauth
        </div>

        <div class="footer">
            Laravel v{{ Illuminate\Foundation\Application::VERSION }} · PHP {{ phpversion() }}
        </div>

    </div>

</body>
</html>