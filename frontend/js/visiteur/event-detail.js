(function () {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('id');
  const main = document.getElementById('detail-main');

  if (!eventId) {
    main.innerHTML = `<div class="container" style="padding:40px 24px"><div class="full-banner">Identifiant manquant. <a href="index.html" style="color:var(--accent)">Retour</a></div></div>`;
    return;
  }

  let currentEvent = null;

  /* ---- Cercle capacité ---- */
  function renderCapacityCircle(ev) {
    const radius = 72;
    const circumference = 2 * Math.PI * radius;
    const filled = ev.capacity > 0 ? (ev.registrationsCount / ev.capacity) : 0;
    const offset = circumference * (1 - filled);
    const cls = progressClass(ev.remainingSpots, ev.capacity);
    const pct = Math.round(filled * 100);

    return `
      <div class="capacity-card-v2">
        <div class="capacity-circle">
          <svg viewBox="0 0 200 200">
            <circle class="track" cx="100" cy="100" r="${radius}"/>
            <circle class="progress ${cls}" cx="100" cy="100" r="${radius}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"/>
          </svg>
          <div class="capacity-number-wrap">
            <div class="capacity-number">${pct}%</div>
            <div class="capacity-sub">rempli</div>
          </div>
        </div>
        <div class="capacity-stats-row">
          <div class="cap-stat">
            <div class="cap-stat-value">${ev.registrationsCount}</div>
            <div class="cap-stat-label">Inscrits</div>
          </div>
          <div class="cap-stat">
            <div class="cap-stat-value">${ev.remainingSpots}</div>
            <div class="cap-stat-label">Restantes</div>
          </div>
          <div class="cap-stat">
            <div class="cap-stat-value">${ev.capacity}</div>
            <div class="cap-stat-label">Capacité</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ---- Formulaire d'inscription ---- */
  function renderForm(ev) {
    if (ev.isFull) {
      return `
        <div class="form-card">
          <div class="full-banner">⚠ Cet événement est complet.</div>
        </div>
      `;
    }
    return `
      <div class="form-card">
        <h2>S'inscrire</h2>
        <p class="form-sub">Réservez votre place gratuitement.</p>
        <form id="register-form" novalidate>
          <div class="field">
            <label for="first_name">Prénom</label>
            <input type="text" id="first_name" name="first_name" autocomplete="given-name" placeholder="Jean"/>
            <span class="field-error" data-error="first_name"></span>
          </div>
          <div class="field">
            <label for="last_name">Nom</label>
            <input type="text" id="last_name" name="last_name" autocomplete="family-name" placeholder="Dupont"/>
            <span class="field-error" data-error="last_name"></span>
          </div>
          <div class="field">
            <label for="email">Adresse email</label>
            <input type="email" id="email" name="email" autocomplete="email" placeholder="jean@exemple.fr"/>
            <span class="field-error" data-error="email"></span>
          </div>
          <button type="submit" class="btn btn-block" id="submit-btn">Confirmer mon inscription</button>
        </form>
      </div>
    `;
  }

  /* ---- Rendu complet de la page ---- */
  function renderEvent(ev) {
    // Extraction de l'heure
    let timeStr = '';
    try {
      timeStr = new Date(ev.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {}

    const heroStyle = ev.coverImage
      ? `style="background-image:linear-gradient(180deg,rgba(7,9,14,0.80) 0%,rgba(7,9,14,0.94) 100%),url('${ev.coverImage}');background-size:cover;background-position:center;"`
      : '';

    main.innerHTML = `
      <!-- HERO pleine largeur -->
      <section class="detail-hero" ${heroStyle}>
        <div class="container detail-hero-inner">
          <a class="back-link" href="index.html">← Tous les événements</a>
          <div class="detail-hero-eyebrow">Événement</div>
          <h1>${escapeHtml(ev.title)}</h1>
          <div class="detail-hero-meta">
            <div>${iconCalendar()}<span>${escapeHtml(formatDate(ev.date))}${timeStr ? ' · ' + timeStr : ''}</span></div>
            <div>${iconLocation()}<span>${escapeHtml(ev.location)}</span></div>
            <div>${iconUsers()}<span>${ev.registrationsCount} / ${ev.capacity} inscrits</span></div>
          </div>
        </div>
      </section>

      <!-- BODY avec container -->
      <div class="container">
        <div class="detail-body">

          <!-- Colonne gauche : image + description + participants -->
          <div>
            ${ev.coverImage ? `
              <div class="content-section" style="padding:0;overflow:hidden">
                <img src="${ev.coverImage}" alt="${escapeHtml(ev.title)}" style="width:100%;height:260px;object-fit:cover;display:block" loading="lazy" />
              </div>
            ` : ''}

            ${ev.description ? `
              <div class="content-section">
                <h2 class="content-section-title">À propos de l'événement</h2>
                <div class="detail-description">${escapeHtml(ev.description)}</div>
              </div>
            ` : ''}

            <div class="content-section">
              <h2 class="content-section-title">
                Participants
                <span class="count-pill" id="reg-count">…</span>
              </h2>
              <div id="reg-list" class="reg-list"></div>
            </div>
          </div>

          <!-- Sidebar sticky : capacité + inscription -->
          <div class="detail-sidebar">
            <div id="capacity-wrap">${renderCapacityCircle(ev)}</div>
            <div id="form-wrap">${renderForm(ev)}</div>
          </div>

        </div>
      </div>
    `;

    if (!ev.isFull) bindForm();
    loadRegistrations();
  }

  /* ---- Gestion des erreurs de champ ---- */
  function setError(name, msg) {
    const el = main.querySelector(`[data-error="${name}"]`);
    const input = main.querySelector(`[name="${name}"]`);
    if (el) el.textContent = msg || '';
    if (input) input.classList.toggle('invalid', !!msg);
  }

  function clearErrors() {
    main.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    main.querySelectorAll('input').forEach(i => i.classList.remove('invalid'));
  }

  function validateForm(data) {
    const errs = {};
    if (!data.first_name || data.first_name.length < 2) errs.first_name = 'Au moins 2 caractères.';
    if (!data.last_name  || data.last_name.length  < 2) errs.last_name  = 'Au moins 2 caractères.';
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Email invalide.';
    return errs;
  }

  /* ---- Bind du formulaire ---- */
  function bindForm() {
    const form = document.getElementById('register-form');
    const btn  = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const data = {
        first_name: form.first_name.value.trim(),
        last_name:  form.last_name.value.trim(),
        email:      form.email.value.trim(),
      };

      const errs = validateForm(data);
      if (Object.keys(errs).length) {
        Object.entries(errs).forEach(([k, v]) => setError(k, v));
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> Inscription en cours...`;

      try {
        const reg = await api.register(currentEvent.id, data);
        showToast(`Inscription confirmée ! Bienvenue ${reg.firstName}.`, 'success');
        form.reset();

        const ev = await api.getEvent(eventId);
        currentEvent = ev;
        document.getElementById('capacity-wrap').innerHTML = renderCapacityCircle(ev);
        document.getElementById('form-wrap').innerHTML = renderForm(ev);
        if (!ev.isFull) bindForm();
        loadRegistrations();
      } catch (err) {
        if (err.status === 409) {
          showToast('Email déjà inscrit à cet événement.', 'warning');
          setError('email', 'Email déjà utilisé.');
        } else if (err.status === 422) {
          showToast('Cet événement est complet.', 'error');
        } else if (err.status === 400 && err.data && err.data.details) {
          Object.entries(err.data.details).forEach(([k, v]) => setError(k, Array.isArray(v) ? v[0] : v));
        } else {
          showToast(err.message || "Erreur lors de l'inscription.", 'error');
        }
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Confirmer mon inscription';
      }
    });
  }

  /* ---- Chargement des inscrits ---- */
  async function loadRegistrations() {
    const list    = document.getElementById('reg-list');
    const counter = document.getElementById('reg-count');
    if (!list) return;

    try {
      const regs = await api.getRegistrations(eventId);
      if (counter) counter.textContent = regs.length;

      if (regs.length === 0) {
        list.innerHTML = `<div class="reg-empty">Aucun inscrit pour l'instant. Soyez le premier !</div>`;
        return;
      }

      list.innerHTML = regs.map(r => `
        <div class="reg-item">
          <div class="reg-info">
            <span class="reg-name">${escapeHtml(r.firstName)} ${escapeHtml(r.lastName)}</span>
            <span class="reg-email">${escapeHtml(r.email)}</span>
          </div>
          <span class="reg-date">${escapeHtml(formatDateShort(r.registeredAt))}</span>
        </div>
      `).join('');
    } catch (_) {
      if (counter) counter.textContent = '0';
    }
  }

  /* ---- Init ---- */
  async function init() {
    main.innerHTML = `
      <div style="padding:140px 0;text-align:center;color:var(--text-muted)">
        <div style="width:36px;height:36px;border:3px solid rgba(167,139,250,0.15);border-top-color:var(--purple);border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 16px"></div>
        <span style="font-size:0.9rem">Chargement…</span>
      </div>`;
    try {
      const ev = await api.getEvent(eventId);
      currentEvent = ev;
      renderEvent(ev);
    } catch (err) {
      if (err.status === 404) {
        main.innerHTML = `
          <div class="container" style="padding:80px 24px;text-align:center">
            <div class="detail-hero-eyebrow" style="margin-bottom:16px">404</div>
            <h1 style="font-family:var(--font-display);font-size:2rem;margin-bottom:20px">Événement introuvable</h1>
            <a href="index.html" class="btn" style="display:inline-flex">← Retour aux événements</a>
          </div>`;
      } else {
        main.innerHTML = `<div class="container" style="padding:40px 24px"><div class="full-banner">${escapeHtml(err.message || 'Erreur.')}</div></div>`;
      }
    }
  }

  init();
})();
