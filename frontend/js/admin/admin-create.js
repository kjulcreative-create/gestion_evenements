(function () {
  const form = document.getElementById('create-form');
  const btn = document.getElementById('submit-btn');
  const titleInput = form.title;
  const titleCount = document.getElementById('title-count');

  function updateCount() { titleCount.textContent = `${titleInput.value.length}/100`; }
  titleInput.addEventListener('input', updateCount);
  updateCount();

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
    if (!data.title || !data.title.trim()) errs.title = 'Le titre est requis.';
    else if (data.title.length > 100) errs.title = 'Max 100 caractères.';
    if (!data.date) errs.date = 'La date est requise.';
    if (!data.location || !data.location.trim()) errs.location = 'Le lieu est requis.';
    if (!data.capacity || isNaN(data.capacity) || Number(data.capacity) < 1) errs.capacity = 'Capacité min. 1.';
    return errs;
  }

  function toIsoUtc(val) {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
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
    btn.innerHTML = `<span class="spinner"></span> Création...`;
    try {
      await api.createEvent({
        title: raw.title,
        description: raw.description || null,
        date: toIsoUtc(raw.date),
        location: raw.location,
        capacity: parseInt(raw.capacity, 10),
      });
      window.location.href = 'index.html?created=1';
    } catch (err) {
      if (err.status === 400 && err.data && err.data.details) {
        Object.entries(err.data.details).forEach(([k, v]) => setError(k, Array.isArray(v) ? v[0] : v));
        showToast('Corrigez les erreurs.', 'error');
      } else {
        showToast(err.message || 'Erreur.', 'error');
      }
      btn.disabled = false;
      btn.innerHTML = "Créer l'événement";
    }
  });
})();
