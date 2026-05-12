(function () {
  const form = document.getElementById('create-form');
  const btn = document.getElementById('submit-btn');
  const titleInput = form.title;
  const titleCount = document.getElementById('title-count');
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('cover_image');
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const previewName = document.getElementById('preview-name');
  const removeImageBtn = document.getElementById('remove-image');

  function updateCount() { titleCount.textContent = `${titleInput.value.length}/100`; }
  titleInput.addEventListener('input', updateCount);
  updateCount();

  function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewName.textContent = file.name;
      uploadZone.style.display = 'none';
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  function clearPreview() {
    fileInput.value = '';
    previewImg.src = '';
    previewName.textContent = '';
    uploadZone.style.display = '';
    imagePreview.style.display = 'none';
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) showPreview(fileInput.files[0]);
  });

  removeImageBtn.addEventListener('click', clearPreview);

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
      showPreview(file);
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
      const fd = new FormData();
      fd.append('title', raw.title);
      if (raw.description) fd.append('description', raw.description);
      fd.append('date', toIsoUtc(raw.date));
      fd.append('location', raw.location);
      fd.append('capacity', parseInt(raw.capacity, 10));
      if (fileInput.files[0]) fd.append('cover_image', fileInput.files[0]);

      await api.createEvent(fd);
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
