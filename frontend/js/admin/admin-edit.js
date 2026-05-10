(function () {
  const eventId = new URLSearchParams(window.location.search).get('id');
  if (!eventId) { window.location.href = 'index.html'; return; }

  const form = document.getElementById('edit-form');
  const btn = document.getElementById('submit-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const titleCount = document.getElementById('title-count');

  function updateCount() { titleCount.textContent = `${form.title.value.length}/100`; }
  form.title.addEventListener('input', updateCount);

  function setError(name, msg) {
    const el = form.querySelector(`[data-error="${name}"]`);
    const input = form.querySelector(`[name="${name}"]`);
    if (el) el.textContent = msg || '';
    if (input) input.classList.toggle('invalid', !!msg);
  }

  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    form.querySelectorAll('input,textarea').forEach(i => i.classList.remove('invalid'));
  }

  function validate(data) {
    const errs = {};
    if (!data.title || !data.title.trim()) errs.title = 'Requis.';
    else if (data.title.length > 100) errs.title = 'Max 100 caractères.';
    if (!data.date) errs.date = 'Requis.';
    if (!data.location || !data.location.trim()) errs.location = 'Requis.';
    if (!data.capacity || isNaN(data.capacity) || Number(data.capacity) < 1) errs.capacity = 'Min. 1.';
    return errs;
  }

  function toIsoUtc(val) {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  function toDatetimeLocal(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function init() {
    try {
      const ev = await api.getEvent(eventId);
      document.getElementById('event-title-display').textContent = ev.title;
      form.title.value = ev.title;
      form.description.value = ev.description || '';
      form.date.value = toDatetimeLocal(ev.date);
      form.location.value = ev.location;
      form.capacity.value = ev.capacity;
      updateCount();
      document.getElementById('loading-state').style.display = 'none';
      document.getElementById('page-content').style.display = 'block';
      loadRegistrations();
    } catch (err) {
      document.getElementById('loading-state').innerHTML =
        `<div class="full-banner">Événement introuvable. <a href="index.html" style="color:var(--accent)">Retour</a></div>`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const raw = {
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      date: form.date.value,
      location: form.location.value.trim(),
      capacity: form.capacity.value,
    };
    const errs = validate(raw);
    if (Object.keys(errs).length) { Object.entries(errs).forEach(([k, v]) => setError(k, v)); return; }

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Enregistrement...`;
    try {
      await api.updateEvent(eventId, {
        title: raw.title,
        description: raw.description || null,
        date: toIsoUtc(raw.date),
        location: raw.location,
        capacity: parseInt(raw.capacity, 10),
      });
      window.location.href = 'index.html?updated=1';
    } catch (err) {
      if (err.status === 400 && err.data && err.data.details) {
        Object.entries(err.data.details).forEach(([k, v]) => setError(k, Array.isArray(v) ? v[0] : v));
        showToast('Corrigez les erreurs.', 'error');
      } else {
        showToast(err.message || 'Erreur.', 'error');
      }
      btn.disabled = false;
      btn.innerHTML = 'Enregistrer les modifications';
    }
  });

  deleteBtn.addEventListener('click', async () => {
    if (!confirm(`Supprimer "${form.title.value}" ? Action irréversible.`)) return;
    deleteBtn.disabled = true;
    deleteBtn.textContent = '…';
    try {
      await api.deleteEvent(eventId);
      window.location.href = 'index.html?deleted=1';
    } catch (err) {
      showToast(err.message || 'Erreur.', 'error');
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = "🗑 Supprimer l'événement";
    }
  });

  async function loadRegistrations() {
    const list = document.getElementById('reg-list');
    const counter = document.getElementById('reg-count');
    try {
      const regs = await api.getRegistrations(eventId);
      if (counter) counter.textContent = regs.length;
      if (regs.length === 0) {
        list.innerHTML = '<div class="reg-empty">Aucun inscrit pour le moment.</div>';
        return;
      }
      list.innerHTML = regs.map(r => `
        <div class="reg-item">
          <div class="reg-info">
            <span class="reg-name">${escapeHtml(r.firstName)} ${escapeHtml(r.lastName)}</span>
            <span class="reg-email">${escapeHtml(r.email)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;flex-shrink:0">
            <span class="reg-date">${escapeHtml(formatDateShort(r.registeredAt))}</span>
            <button class="btn-danger" style="padding:6px 12px;font-size:0.8rem" data-cancel="${r.id}">Annuler</button>
          </div>
        </div>
      `).join('');

      list.querySelectorAll('[data-cancel]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Annuler cette inscription ?')) return;
          btn.disabled = true;
          btn.textContent = '…';
          try {
            await api.cancelRegistration(btn.getAttribute('data-cancel'));
            showToast('Inscription annulée.', 'success');
            loadRegistrations();
          } catch (err) {
            showToast(err.message || 'Erreur.', 'error');
            btn.disabled = false;
            btn.textContent = 'Annuler';
          }
        });
      });
    } catch (_) {
      if (counter) counter.textContent = '0';
      list.innerHTML = '<div class="reg-empty">Impossible de charger les inscrits.</div>';
    }
  }

  init();
})();
