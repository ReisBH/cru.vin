/* ─────────────────────────────────────────
   MAIN — cru.vin
   App initialization & global state
───────────────────────────────────────── */

(function MainModule() {
  /* ── App state ────────────────────── */
  const state = {
    theme: 'dark',
    scrollY: 0,
  };

  /* ── Theme toggle (future use) ────── */
  function setTheme(theme) {
    state.theme = theme;
    document.body.className = `theme-${theme}`;
    localStorage.setItem('cruvin-theme', theme);
  }

  function initTheme() {
    const saved = localStorage.getItem('cruvin-theme');
    if (saved) setTheme(saved);
  }

  /* ── Accessibility: focus ring ────── */
  function initFocusRing() {
    let usingMouse = false;

    document.addEventListener('mousedown', () => {
      usingMouse = true;
      document.body.classList.add('using-mouse');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        usingMouse = false;
        document.body.classList.remove('using-mouse');
      }
    });
  }

  /* ── Log platform info ────────────── */
  function logWelcome() {
    const styles = [
      'color: #c9a84c',
      'font-family: serif',
      'font-size: 14px',
      'padding: 4px 0',
    ].join(';');

    console.log('%cCru.Vin — Wine Intelligence Platform', styles);
    console.log('%cThe definitive OS for modern wine culture.', 'color: #7a7268; font-size: 11px;');
  }

  /* ── Initialize ───────────────────── */
  function init() {
    initTheme();
    initFocusRing();
    logWelcome();

    // Expose theme toggle globally
    window.CruVin.setTheme = setTheme;
    window.CruVin.state = state;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
