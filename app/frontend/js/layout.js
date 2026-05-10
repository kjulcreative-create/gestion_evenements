/**
 * layout.js — Composants partagés (navbar + toast)
 *
 * Les templates HTML sont dans /templates/ (chemins absolus serveur).
 *
 * Usage dans chaque page :
 *   Layout.initVisitor('events')   // pages/visiteur/
 *   Layout.initVisitor('detail')
 *   Layout.initAdmin('dashboard')  // pages/admin/
 *   Layout.initAdmin('create')
 *   Layout.initAdmin('edit')
 *   Layout.initLanding()           // pages/index.html
 */

// ── Applique le thème sauvegardé avant tout rendu pour éviter le flash ──
// Par défaut : mode clair, sauf si l'utilisateur a explicitement choisi le sombre.
;(() => {
  if (localStorage.getItem('eventhub_theme') !== 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

const Layout = (() => {

  /**
   * Charge un fichier HTML depuis /templates/{name}.html
   * @param {string} name
   * @returns {Promise<string>}
   */
  async function _loadTemplate(name) {
    const res = await fetch(`/templates/${name}.html`);
    if (!res.ok) throw new Error(`[Layout] Template "${name}.html" introuvable (${res.status})`);
    return res.text();
  }

  /**
   * Injecte le HTML dans <header id="app-header">
   */
  function _setHeader(className, html) {
    const header = document.getElementById('app-header');
    if (!header) return;
    header.className = className;
    header.innerHTML = html;
  }

  /**
   * Marque le lien [data-page="activePage"] comme actif
   */
  function _setActive(page) {
    if (!page) return;
    const link = document.querySelector(`[data-page="${page}"]`);
    if (link) link.classList.add('active');
  }

  /**
   * Crée #toast-container en haut du <body> s'il est absent
   */
  function _toast() {
    if (!document.getElementById('toast-container')) {
      const div = document.createElement('div');
      div.id = 'toast-container';
      document.body.appendChild(div);
    }
  }

  /**
   * Branche le bouton de bascule thème (.theme-toggle-btn)
   * injecté dans la navbar active.
   */
  function _wireThemeToggle() {
    const btn = document.querySelector('.theme-toggle-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const html = document.documentElement;
      const isLight = html.getAttribute('data-theme') === 'light';
      if (isLight) {
        // Passer en mode sombre
        html.removeAttribute('data-theme');
        localStorage.setItem('eventhub_theme', 'dark');
      } else {
        // Passer en mode clair
        html.setAttribute('data-theme', 'light');
        localStorage.removeItem('eventhub_theme');
      }
    });
  }

  /**
   * Injecte le footer dans <footer id="app-footer"> s'il existe
   */
  async function _injectFooter() {
    const el = document.getElementById('app-footer');
    if (!el) return;
    try {
      const html = await _loadTemplate('footer');
      el.className = 'site-footer';
      el.innerHTML = html;
    } catch (e) {
      console.warn('[Layout] Footer non chargé:', e.message);
    }
  }

  /* ---- VISITEUR ---- */
  async function initVisitor(activePage) {
    _toast();
    const html = await _loadTemplate('navbar-visitor');
    _setHeader('navbar', html);
    _setActive(activePage);
    _wireThemeToggle();
    _injectFooter(); // pas d'await — se charge en arrière-plan
  }

  /* ---- ADMIN ---- */
  async function initAdmin(activePage) {
    _toast();
    const html = await _loadTemplate('navbar-admin');
    _setHeader('navbar navbar-admin', html);
    _setActive(activePage);
    _wireThemeToggle();
  }

  /* ---- LANDING ---- */
  async function initLanding() {
    const html = await _loadTemplate('navbar-landing');
    _setHeader('navbar', html);
    _wireThemeToggle();
  }

  return { initVisitor, initAdmin, initLanding };
})();
