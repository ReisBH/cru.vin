/* ─────────────────────────────────────────
   HERO — cru.vin
   Hero entrance animations + canvas particles
───────────────────────────────────────── */

(function HeroModule() {
  /* ── Entrance reveals ────────────── */
  const revealOrder = [
    '.hero__eyebrow',
    '.hero__title-line:nth-child(1)',
    '.hero__title-line:nth-child(2)',
    '.hero__subtitle',
    '.hero__search-wrap',
    '.hero__stats',
  ];

  function triggerHeroReveal() {
    revealOrder.forEach((selector, i) => {
      const el = document.querySelector(selector);
      if (!el) return;
      setTimeout(() => {
        el.classList.add('revealed');
      }, 200 + i * 140);
    });
  }

  // Trigger after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', triggerHeroReveal);
  } else {
    setTimeout(triggerHeroReveal, 50);
  }

  /* ── Particle canvas ─────────────── */
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Create a real canvas element
  const cvs = document.createElement('canvas');
  cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  canvas.appendChild(cvs);

  const ctx = cvs.getContext('2d');

  let width, height;
  let particles = [];
  let animFrame;

  const PARTICLE_COUNT = 60;

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedY = -(Math.random() * 0.3 + 0.08);
      this.speedX = (Math.random() - 0.5) * 0.15;
      this.opacity = 0;
      this.maxOpacity = Math.random() * 0.4 + 0.05;
      this.fadeIn = true;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;

      // Colors: gold, ivory, burgundy
      const colors = [
        `rgba(201, 168, 76, `,   // gold
        `rgba(244, 240, 232, `,  // ivory
        `rgba(140, 32, 53, `,    // burgundy mid
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;

      if (this.fadeIn) {
        this.opacity += this.maxOpacity / 60;
        if (this.opacity >= this.maxOpacity) {
          this.opacity = this.maxOpacity;
          this.fadeIn = false;
        }
      }

      if (this.life > this.maxLife * 0.7) {
        this.opacity -= this.maxOpacity / (this.maxLife * 0.3);
      }

      if (this.life >= this.maxLife || this.y < -10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.colorBase}${Math.max(0, this.opacity)})`;
      ctx.fill();
    }
  }

  function resize() {
    width  = cvs.width  = cvs.offsetWidth;
    height = cvs.height = cvs.offsetHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    animFrame = requestAnimationFrame(render);
  }

  function start() {
    init();
    render();
  }

  const resizeObserver = new ResizeObserver(window.CruVin.debounce(() => {
    resize();
  }, 200));

  resizeObserver.observe(canvas);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrame);
    } else {
      render();
    }
  });

})();
