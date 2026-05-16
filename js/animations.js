/* ─────────────────────────────────────────
   ANIMATIONS — cru.vin
   IntersectionObserver scroll reveals
───────────────────────────────────────── */

(function AnimationsModule() {
  const { createObserver, animateCount } = window.CruVin;

  /* ── Scroll reveal ─────────────────── */
  const revealObserver = createObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    revealObserver.observe(el);
  });

  /* ── Number counters ─────────────── */
  const counterObserver = createObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) {
          animateCount(el, target, 1800);
          counterObserver.unobserve(el);
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach((el) => {
    counterObserver.observe(el);
  });

  /* ── Progress bars (academy) ─────── */
  const pathObserver = createObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.path-item__bar');
        bars.forEach((bar, i) => {
          setTimeout(() => {
            // Demo progress values
            const values = ['34%', '0%', '0%', '0%'];
            bar.style.transition = `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 150}ms`;
            bar.style.width = values[i] || '0%';
          }, 300);
        });
        pathObserver.unobserve(entry.target);
      }
    });
  });

  const pathList = document.querySelector('.path-list');
  if (pathList) pathObserver.observe(pathList);

  /* ── Stagger editorial cards ──────── */
  const editorialObserver = createObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.editorial-card, .editorial-feature');
        cards.forEach((card, i) => {
          card.style.transitionDelay = `${i * 100}ms`;
          card.classList.add('revealed');
        });
        editorialObserver.unobserve(entry.target);
      }
    });
  });

  const editorialGrid = document.querySelector('.editorial-grid');
  if (editorialGrid) editorialObserver.observe(editorialGrid);

  /* ── Academy feature cards stagger ── */
  const academyObserver = createObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.academy-feature-card');
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.animation = `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.animation = `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
            }, 10);
          }, i * 100);
        });
        academyObserver.unobserve(entry.target);
      }
    });
  });

  const academyFeatures = document.querySelector('.academy-features');
  if (academyFeatures) academyObserver.observe(academyFeatures);

  /* ── Smooth scroll for anchor links ─ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Page entrance ────────────────── */
  document.body.classList.add('page-enter');

})();
