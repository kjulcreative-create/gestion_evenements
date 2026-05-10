(function () {
  const grid = document.getElementById('events-grid');
  const searchInput = document.getElementById('search-input');
  const dateInput = document.getElementById('date-input');
  const countBar = document.getElementById('count-bar');
  const countLabel = document.getElementById('count-label');
  const filterTags = document.querySelectorAll('.filter-tag');

  let debounceTimer = null;
  let allEvents = [];
  let activeFilter = 'all';

  /* ---- Filtrage local ---- */
  function applyFilter(events) {
    if (activeFilter === 'available') return events.filter(e => !e.isFull);
    if (activeFilter === 'full') return events.filter(e => e.isFull);
    return events;
  }

  /* ---- Count bar ---- */
  function updateCountBar(events) {
    if (!countBar || !countLabel) return;
    const filtered = applyFilter(events);
    countBar.style.display = 'flex';
    countLabel.innerHTML = `<strong>${filtered.length}</strong> événement${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`;
  }

  /* ---- Skeleton ---- */
  function renderSkeleton(count = 6) {
    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const sk = document.createElement('div');
      sk.className = 'skeleton-card';
      sk.style.cssText = 'padding:0;min-height:300px;gap:0;';
      sk.innerHTML = `
        <div class="skeleton-line" style="height:168px;border-radius:0;"></div>
        <div style="padding:18px 20px 16px;display:flex;flex-direction:column;gap:12px;flex:1">
          <div style="display:flex;justify-content:space-between;gap:8px">
            <div class="skeleton-line" style="width:30%;height:18px;border-radius:999px;"></div>
            <div class="skeleton-line" style="width:22%;height:18px;border-radius:999px;"></div>
          </div>
          <div class="skeleton-line" style="width:80%;height:20px;"></div>
          <div class="skeleton-line" style="width:60%;height:13px;"></div>
          <div class="skeleton-line" style="width:50%;height:13px;"></div>
          <div style="margin-top:auto;padding-top:12px;border-top:1px solid rgba(255,255,255,0.05)">
            <div class="skeleton-line" style="height:4px;width:100%;"></div>
            <div class="skeleton-line" style="margin-top:10px;width:30%;height:10px;border-radius:999px;"></div>
          </div>
        </div>
      `;
      grid.appendChild(sk);
    }
  }

  /* ---- Empty state ---- */
  function renderEmpty(isFiltered) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${isFiltered ? '🔍' : '📭'}</div>
        <h3>${isFiltered ? 'Aucun résultat' : 'Aucun événement'}</h3>
        <p>${isFiltered ? 'Essayez de modifier vos filtres ou votre recherche.' : 'Aucun événement programmé pour le moment.'}</p>
      </div>
    `;
  }

  /* ---- Extraction heure ---- */
  function extractTime(isoDate) {
    try {
      return new Date(isoDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  /* ---- Rendu cartes ---- */
  function renderEvents(events) {
    const filtered = applyFilter(events);
    updateCountBar(events);

    if (!filtered || filtered.length === 0) {
      renderEmpty(activeFilter !== 'all' || searchInput.value || dateInput.value);
      return;
    }

    grid.innerHTML = '';
    filtered.forEach((ev) => {
      const filledPct = ev.capacity > 0 ? Math.min(100, (ev.registrationsCount / ev.capacity) * 100) : 0;
      const cls = progressClass(ev.remainingSpots, ev.capacity);

      let badge = '';
      if (ev.isFull) {
        badge = `<span class="badge badge-full">Complet</span>`;
      } else if (ev.remainingSpots <= Math.max(1, Math.floor(ev.capacity * 0.2))) {
        badge = `<span class="badge badge-warning">${ev.remainingSpots} place${ev.remainingSpots > 1 ? 's' : ''}</span>`;
      } else {
        badge = `<span class="badge badge-spots">${ev.remainingSpots} places</span>`;
      }

      const time = extractTime(ev.date);

      const card = document.createElement('article');
      card.className = 'event-card' + (ev.isFull ? ' is-full' : '');

      const coverHtml = ev.coverImage
        ? `<img class="event-card-cover" src="${escapeHtml(ev.coverImage)}" alt="${escapeHtml(ev.title)}" loading="lazy">`
        : `<div class="event-card-cover-placeholder">🗓</div>`;

      card.innerHTML = `
        ${coverHtml}
        <div class="event-card-body">
          <div class="event-card-header">
            <span class="event-card-tag">Événement</span>
            ${badge}
          </div>
          <h3>${escapeHtml(ev.title)}</h3>
          <div class="event-meta">
            <div>${iconCalendar()}<span>${escapeHtml(formatDate(ev.date))}${time ? ' · ' + time : ''}</span></div>
            <div>${iconLocation()}<span>${escapeHtml(ev.location)}</span></div>
          </div>
          <div class="event-card-footer">
            <div class="progress-block">
              <div class="progress-bar"><div class="progress-fill ${cls}" style="width:${filledPct}%"></div></div>
              <div class="progress-meta">
                <span class="progress-count">${ev.registrationsCount}/${ev.capacity}</span>
              </div>
            </div>
            <span class="event-link-btn">Voir →</span>
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        window.location.href = `event.html?id=${ev.id}`;
      });
      grid.appendChild(card);
    });
  }

  /* ---- Chargement API ---- */
  async function load() {
    renderSkeleton();
    try {
      const events = await api.getEvents(searchInput.value.trim(), dateInput.value);
      allEvents = events;
      renderEvents(events);
    } catch (err) {
      grid.innerHTML = '';
      showToast(err.message || 'Erreur lors du chargement.', 'error');
    }
  }

  /* ---- Événements UI ---- */
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(load, 300);
  });

  dateInput.addEventListener('change', load);

  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      activeFilter = tag.dataset.filter;
      if (allEvents.length > 0) {
        renderEvents(allEvents);
      }
    });
  });

  load();
})();
