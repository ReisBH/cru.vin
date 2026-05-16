/* ─────────────────────────────────────────
   TASTING — cru.vin
   Radar chart + bar animations
───────────────────────────────────────── */

(function TastingModule() {
  const { createObserver } = window.CruVin;

  const radarCanvas = document.getElementById('radar-canvas');
  const tastingCard = document.querySelector('.tasting-card');

  let hasAnimated = false;

  /* ── Radar Chart ─────────────────── */
  function drawRadar(canvas, data, animated = true) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx  = canvas.width / 2;
    const cy  = canvas.height / 2;
    const R   = Math.min(cx, cy) - 20;
    const N   = data.labels.length;
    const angle = (Math.PI * 2) / N;

    function getPoint(i, value) {
      const a = angle * i - Math.PI / 2;
      return {
        x: cx + Math.cos(a) * R * value,
        y: cy + Math.sin(a) * R * value,
      };
    }

    let progress = animated ? 0 : 1;
    let rafId;

    function draw(p) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Grid rings ──
      const rings = 5;
      for (let r = 1; r <= rings; r++) {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const pt = getPoint(i, r / rings);
          i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── Axes ──
      for (let i = 0; i < N; i++) {
        const outer = getPoint(i, 1);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(outer.x, outer.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── Labels ──
      ctx.font = '10px "DM Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(184,176,160,0.7)';
      data.labels.forEach((label, i) => {
        const pt = getPoint(i, 1.18);
        ctx.fillText(label, pt.x, pt.y);
      });

      // ── Data shape (animated) ──
      ctx.beginPath();
      data.values.forEach((val, i) => {
        const pt = getPoint(i, val * p);
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();

      // Fill
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      grad.addColorStop(0, 'rgba(201,168,76,0.25)');
      grad.addColorStop(1, 'rgba(107,21,37,0.15)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke
      ctx.strokeStyle = 'rgba(201,168,76,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Data points ──
      data.values.forEach((val, i) => {
        const pt = getPoint(i, val * p);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,168,76,0.9)';
        ctx.fill();
      });
    }

    if (!animated) {
      draw(1);
      return;
    }

    function animate(timestamp) {
      progress = Math.min(progress + 0.025, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      draw(eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }

  /* ── Bar animations ──────────────── */
  function animateBars() {
    const fills = document.querySelectorAll('.tasting-note-row__fill');
    fills.forEach((fill) => {
      const targetVal = fill.style.getPropertyValue('--val');
      fill.style.width = '0';
      setTimeout(() => {
        fill.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        fill.style.width = targetVal;
      }, 200);
    });
  }

  /* ── IntersectionObserver trigger ── */
  const radarData = {
    labels: ['Acidez', 'Tanino', 'Corpo', 'Álcool', 'Fruta', 'Terroir'],
    values: [0.85, 0.90, 0.80, 0.72, 0.75, 0.88],
  };

  if (tastingCard) {
    const observer = createObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          drawRadar(radarCanvas, radarData, true);
          animateBars();
          observer.disconnect();
        }
      });
    });

    observer.observe(tastingCard);
  } else {
    // Fallback: draw immediately
    drawRadar(radarCanvas, radarData, false);
  }

})();
