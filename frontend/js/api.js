const API_BASE = 'http://127.0.0.1:8000/api';

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const config = {
      headers: {
        'Accept': 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      ...options,
    };

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkErr) {
      const err = new Error('Erreur de connexion. Vérifiez que le serveur est lancé.');
      err.status = 0;
      throw err;
    }

    let data = null;
    const text = await response.text();
    if (text) {
      try { data = JSON.parse(text); } catch (_) { data = { message: text }; }
    }

    if (!response.ok) {
      const err = new Error((data && data.message) || 'Erreur serveur');
      err.status = response.status;
      err.data = data || {};
      throw err;
    }

    return data;
  },

  getEvents(search = '', date = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (date) params.append('date', date);
    const qs = params.toString();
    return this.request(`/events${qs ? '?' + qs : ''}`);
  },

  getEvent(id) {
    return this.request(`/events/${id}`);
  },

  createEvent(data) {
    const isForm = data instanceof FormData;
    return this.request('/events', {
      method: 'POST',
      body: isForm ? data : JSON.stringify(data),
    });
  },

  updateEvent(id, data) {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return this.request(`/events/${id}`, { method: 'POST', body: data });
    }
    return this.request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteEvent(id) {
    return this.request(`/events/${id}`, { method: 'DELETE' });
  },

  register(eventId, data) {
    return this.request(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRegistrations(eventId) {
    return this.request(`/events/${eventId}/registrations`);
  },

  cancelRegistration(id) {
    return this.request(`/registrations/${id}`, { method: 'DELETE' });
  },
};

window.api = api;
