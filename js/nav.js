/* ─────────────────────────────────────────
   NAV — cru.vin
   Scroll behaviour, search overlay, mobile menu
   Fully defensive: all elements are optional.
───────────────────────────────────────── */

(function NavModule() {
  const { qs, on, debounce, throttle } = window.CruVin;

  const nav           = qs('#site-nav');
  const searchTrigger = qs('#search-trigger');
  const heroSearch    = qs('#hero-search-trigger');
  const searchOverlay = qs('#search-overlay');
  const searchClose   = qs('#search-close');
  const searchInput   = qs('#search-input');
  const navToggle     = qs('#nav-toggle');
  const navMobile     = qs('#nav-mobile');

  if (!nav) return; // no nav on this page (e.g. admin)

  /* ── Scroll: add .scrolled class ─── */
  // Pages like atlas/tasting are full-height apps — keep nav always scrolled
  const isAppPage = document.body.querySelector('.atlas-app, .tasting-app');

  let scrolled = !!isAppPage;
  nav.classList.toggle('scrolled', scrolled);

  if (!isAppPage) {
    function handleScroll() {
      const should = window.scrollY > 40;
      if (should !== scrolled) {
        scrolled = should;
        nav.classList.toggle('scrolled', scrolled);
      }
    }
    on(window, 'scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ── Search overlay ──────────────── */
  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput?.focus(), 100);
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  on(searchTrigger, 'click', openSearch);
  on(heroSearch,    'click', openSearch);
  on(searchClose,   'click', closeSearch);

  on(searchOverlay, 'click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });

  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });

  document.querySelectorAll('.search-tag').forEach((tag) => {
    on(tag, 'click', () => {
      if (searchInput) { searchInput.value = tag.textContent; searchInput.focus(); }
    });
  });

  /* ── Mobile menu ─────────────────── */
  if (navToggle && navMobile) {
    function toggleMobile() {
      const isOpen = navMobile.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    on(navToggle, 'click', toggleMobile);

    navMobile.querySelectorAll('a').forEach((link) => {
      on(link, 'click', () => {
        navMobile.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    on(window, 'resize', debounce(() => {
      if (window.innerWidth > 900) {
        navMobile.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
      }
    }, 200));
  }

  /* ── Active nav link on scroll ───── */
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0) {
    function updateActiveLink() {
      const scrollY = window.scrollY + 100;
      sections.forEach((section) => {
        const top  = section.offsetTop;
        const h    = section.offsetHeight;
        const id   = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + h) {
          document.querySelectorAll('.nav__link').forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }
    on(window, 'scroll', throttle(updateActiveLink, 100), { passive: true });
  }

})();
