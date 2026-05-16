/* ─────────────────────────────────────────
   UTILS — cru.vin
   Shared utility functions
───────────────────────────────────────── */

/**
 * Debounce — delay function execution
 * @param {Function} fn
 * @param {number} delay
 */
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle — limit function call rate
 * @param {Function} fn
 * @param {number} limit
 */
function throttle(fn, limit = 100) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is in viewport
 * @param {Element} el
 * @param {number} threshold 0–1
 */
function isInViewport(el, threshold = 0.15) {
  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top <= windowHeight * (1 - threshold + 1) - (windowHeight * (1 - threshold));
}

/**
 * Animate a number from 0 to target
 * @param {Element} el
 * @param {number} target
 * @param {number} duration
 */
function animateCount(el, target, duration = 2000) {
  const start = performance.now();
  const isLarge = target > 999;

  function update(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    if (isLarge) {
      el.textContent = current.toLocaleString('pt-BR');
    } else {
      el.textContent = current;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = isLarge ? target.toLocaleString('pt-BR') : target;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Simple IntersectionObserver factory
 * @param {Function} callback
 * @param {object} options
 */
function createObserver(callback, options = {}) {
  return new IntersectionObserver(callback, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
    ...options,
  });
}

/**
 * Query helper
 * @param {string} selector
 * @param {Element} scope
 */
function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * Query all helper
 * @param {string} selector
 * @param {Element} scope
 */
function qsa(selector, scope = document) {
  return [...scope.querySelectorAll(selector)];
}

/**
 * Add event listener with cleanup
 */
function on(el, event, handler, options) {
  if (!el) return () => {};
  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
}

// Export to global scope (no module bundler)
window.CruVin = window.CruVin || {};
Object.assign(window.CruVin, {
  debounce,
  throttle,
  isInViewport,
  animateCount,
  createObserver,
  qs,
  qsa,
  on,
});
