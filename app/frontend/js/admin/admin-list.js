(function () {
  const tbody = document.getElementById('events-tbody');
  const countBadge = document.getElementById('dash-event-count');
  const searchInput = document.getElementById('dash-search');
  const filterTabs = document.getElementById('dash-filter-tabs');

  let _allEvents = [];
  let _currentFilter = 'all';

  /* ── Stats ── */
  function renderStats(events) {
    const totalReg = events.reduce((s, e) => s + e.registrationsCount, 0);
    const full = events.filter(e => e.isFull).length;
    const spots = events.reduce((s, e) => s + e.remainingSpots, 0);
    document.getElementById('stat-events').textContent = events.length;
    document.getElementById('stat-registrations').textContent = totalReg;
    document.getElementById('stat-full').textContent = full;
    document.getElementById('stat-spots').textContent = spots;
  }

  /* ── Skeleton loader ── */
  function skeletonRows(n = 5) {
    const cell = `<td><div style="height:14px;background:linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.04) 100%);background-size:400px 100%;animation:shimmer 1.6s ease-in-out infinite;border-radius:6px"></div></td>`;
    return Array.from({ length: n }, () => `<tr>${cell.repeat(5)}</tr>`).join('');
  }

  /* ── Table rows ── */
  function renderTable(events) {
    if (!events.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:56px;color:var(--text-muted)">Aucun événement. <a href="create.html" style="color:var(--accent)">Créez-en un !</a></td></tr>`;
      if (countBadge) countBadge.textContent = '0';
      return;
    }
    if (countBadge) countBadge.textContent = events.length;
    tbody.innerHTML = events.map(ev => {
      const filledPct = ev.capacity > 0 ? Math.min(100, (ev.registrationsCount / ev.capacity) * 100) : 0;
      const cls = progressClass(ev.remainingSpots, ev.capacity);
      const statusBadge = ev.isFull
        ? `<span class="badge badge-full badge-inline">Complet</span>`
        : `<span class="badge badge-spots badge-inline">${ev.remainingSpots} places</span>`;
      return `
        <tr data-full="${ev.isFull ? '1' : '0'}">
          <td data-label="Événement">
            <div style="font-weight:600">${escapeHtml(ev.title)}</div>
            <div style="color:var(--text-muted);font-size:0.78rem;margin-top:2px">${escapeHtml(ev.location)}</div>
          </td>
          <td data-label="Date" style="color:var(--text-secondary);font-size:0.85rem;white-space:nowrap">${escapeHtml(formatDate(ev.date))}</td>
          <td data-label="Remplissage">
            <div class="progress-bar" style="width:110px;margin-bottom:5px">
              <div class="progress-fill ${cls}" style="width:${filledPct}%"></div>
            </div>
            <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted)">${ev.registrationsCount}/${ev.capacity}</span>
          </td>
          <td data-label="Statut">${statusBadge}</td>
          <td data-label="Actions">
            <div class="actions-wrap">
              <a href="edit.html?id=${ev.id}" class="btn-edit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" style="margin-right:5px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Modifier
              </a>
              <button class="btn-danger" data-delete="${ev.id}" data-title="${escapeHtml(ev.title)}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" style="margin-right:5px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Supprimer
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete');
        const title = btn.getAttribute('data-title');
        if (!confirm(`Supprimer "${title}" et toutes ses inscriptions ?`)) return;
        btn.disabled = true;
        btn.textContent = '…';
        try {
          await api.deleteEvent(id);
          showToast('Événement supprimé.', 'success');
          load();
        } catch (err) {
          showToast(err.message || 'Erreur.', 'error');
          btn.disabled = false;
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" style="margin-right:5px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Supprimer`;
        }
      });
    });

    applyFilters();
  }

  /* ── Filter + Search ── */
  function applyFilters() {
    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const rows = tbody.querySelectorAll('tr[data-full]');
    let visible = 0;
    rows.forEach(row => {
      const isFull = row.dataset.full === '1';
      const text = row.textContent.toLowerCase();
      const matchFilter =
        _currentFilter === 'all' ||
        (_currentFilter === 'full' && isFull) ||
        (_currentFilter === 'available' && !isFull);
      const matchSearch = !q || text.includes(q);
      if (matchFilter && matchSearch) {
        row.classList.remove('dash-hidden');
        visible++;
      } else {
        row.classList.add('dash-hidden');
      }
    });
    if (countBadge) countBadge.textContent = visible;
  }

  /* ── Wire filter tabs ── */
  if (filterTabs) {
    filterTabs.addEventListener('click', e => {
      const tab = e.target.closest('.dash-filter-tab');
      if (!tab) return;
      filterTabs.querySelectorAll('.dash-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      _currentFilter = tab.dataset.filter;
      applyFilters();
    });
  }

  /* ── Wire search ── */
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  /* ── Load ── */
  async function load() {
    tbody.innerHTML = skeletonRows();
    if (countBadge) countBadge.textContent = '…';
    try {
      const events = await api.getEvents();
      _allEvents = events;
      renderStats(events);
      renderTable(events);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:48px;color:var(--error)">${escapeHtml(err.message)}</td></tr>`;
      showToast(err.message || 'Erreur.', 'error');
    }
  }

  const p = new URLSearchParams(window.location.search);
  if (p.get('created') === '1') { showToast('Événement créé !', 'success'); history.replaceState({}, '', 'index.html'); }
  if (p.get('updated') === '1') { showToast('Événement mis à jour.', 'success'); history.replaceState({}, '', 'index.html'); }
  if (p.get('deleted') === '1') { showToast('Événement supprimé.', 'success'); history.replaceState({}, '', 'index.html'); }

  load();
})();

