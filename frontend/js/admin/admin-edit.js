(function () {
  const eventId = new URLSearchParams(window.location.search).get('id');
  if (!eventId) { window.location.href = 'index.html'; return; }

  const form = document.getElementById('edit-form');
  const btn = document.getElementById('submit-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const titleCount = document.getElementById('title-count');

  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('cover_image');
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const previewName = document.getElementById('preview-name');
  const removeImageBtn = document.getElementById('remove-image');
  const currentImageWrap = document.getElementById('current-image-wrap');
  const currentImg = document.getElementById('current-img');
  const removeCurrentBtn = document.getElementById('remove-current-image');
  const uploadHint = document.getElementById('upload-hint');

  let removeCoverImage = false;

  function updateCount() { titleCount.textContent = `${form.title.value.length}/100`; }
  form.title.addEventListener('input', updateCount);

  function showNewPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewName.textContent = file.name;
      uploadZone.style.display = 'none';
      imagePreview.style.display = 'block';
      removeCoverImage = false;
    };
    reader.readAsDataURL(file);
  }

  function clearNewPreview() {
    fileInput.value = '';
    previewImg.src = '';
    previewName.textContent = '';
    uploadZone.style.display = '';
    imagePreview.style.display = 'none';
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) showNewPreview(fileInput.files[0]);
  });

  removeImageBtn.addEventListener('click', clearNewPreview);

  removeCurrentBtn.addEventListener('click', () => {
    currentImageWrap.style.display = 'none';
    removeCoverImage = true;
    uploadHint.textContent = 'Cliquez pour choisir une image de remplacement';
  });

  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      showNewPreview(file);
    }
  });

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

      if (ev.coverImage) {
        currentImg.src = ev.coverImage;
        currentImageWrap.style.display = 'block';
        uploadHint.textContent = 'Remplacer l\'image';
      }

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
      const fd = new FormData();
      fd.append('title', raw.title);
      fd.append('description', raw.description || '');
      fd.append('date', toIsoUtc(raw.date));
      fd.append('location', raw.location);
      fd.append('capacity', parseInt(raw.capacity, 10));
      if (fileInput.files[0]) {
        fd.append('cover_image', fileInput.files[0]);
      } else if (removeCoverImage) {
        fd.append('remove_cover_image', '1');
      }

      await api.updateEvent(eventId, fd);
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
