/**
 * script.js — Pheaga Mabote Portfolio
 *
 * Modules (self-contained IIFEs / init functions):
 *  1.  Theme Toggle       — dark / light mode with localStorage persistence
 *  2.  Navbar             — scroll-shadow, active-link highlighting, hamburger
 *  3.  Typing Animation   — typewriter effect in the hero section
 *  4.  AOS-Lite           — IntersectionObserver scroll-reveal animations
 *  5.  Skill Bars         — animated progress bars on scroll
 *  6.  Stats Counter      — animated counting numbers
 *  7.  Project Filter     — filter cards by category
 *  8.  Contact Form       — client-side validation + success toast
 *  9.  Back-to-Top        — show/hide + smooth scroll
 * 10.  Hero Particles     — lightweight canvas particle background
 * 11.  Footer Year        — auto-update copyright year
 */

'use strict';

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Shorthand querySelector
 * @param {string} sel
 * @param {Document|Element} ctx
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Shorthand querySelectorAll
 * @param {string} sel
 * @param {Document|Element} ctx
 */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Add multiple events to an element.
 * @param {EventTarget} el
 * @param {string[]} events
 * @param {Function} handler
 */
const onEvents = (el, events, handler) =>
  events.forEach(e => el.addEventListener(e, handler));

/* ============================================================
   1. THEME TOGGLE
   ============================================================ */
(function initTheme() {
  const html        = document.documentElement;
  const toggleBtn   = $('#theme-toggle');
  const icon        = $('#theme-icon');
  const STORAGE_KEY = 'portfolio-theme';

  /** Apply the given theme and update the icon */
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    // Moon = dark mode available; Sun = switch back to light
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    toggleBtn.setAttribute(
      'title',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  // Restore saved preference, or honour OS preference
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ?? (prefersDark ? 'dark' : 'light'));

  toggleBtn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });
})();

/* ============================================================
   2. NAVBAR
   ============================================================ */
(function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#nav-links');
  const links     = $$('.nav-link');

  /* ---- Scroll shadow ---- */
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ---- Hamburger toggle ---- */
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---- Active link on scroll ---- */
  const sections = $$('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100; // offset for fixed navbar

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        links.forEach(l => l.classList.remove('active'));
        const active = $(`.nav-link[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();

/* ============================================================
   3. TYPING ANIMATION
   ============================================================ */
(function initTyping() {
  const el = $('#typed-text');
  if (!el) return;

  const phrases = [
    'BIS Student @ University of Pretoria',
    'Aspiring Web Developer',
    'Tech Enthusiast',
    'Problem Solver',
    'Continuous Learner',
  ];

  let phraseIndex  = 0;
  let charIndex    = 0;
  let isDeleting   = false;
  let isPaused     = false;

  const TYPE_SPEED   = 75;   // ms per character when typing
  const DELETE_SPEED = 40;   // ms per character when deleting
  const PAUSE_END    = 1800; // ms pause at end of phrase
  const PAUSE_START  = 300;  // ms pause before next phrase

  function tick() {
    const current = phrases[phraseIndex];

    if (!isDeleting) {
      // Type one character
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        // Finished typing — pause then start deleting
        isPaused = true;
        setTimeout(() => { isPaused = false; isDeleting = true; schedule(); }, PAUSE_END);
        return;
      }
    } else {
      // Delete one character
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        // Finished deleting — move to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(schedule, PAUSE_START);
        return;
      }
    }

    schedule();
  }

  function schedule() {
    if (isPaused) return;
    setTimeout(tick, isDeleting ? DELETE_SPEED : TYPE_SPEED);
  }

  schedule();
})();

/* ============================================================
   4. AOS-LITE  (scroll-reveal via IntersectionObserver)
   ============================================================ */
(function initAOS() {
  const elements = $$('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = el.dataset.aosDelay ? parseInt(el.dataset.aosDelay, 10) : 0;

          setTimeout(() => el.classList.add('aos-animate'), delay);
          observer.unobserve(el); // animate only once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. SKILL BARS
   ============================================================ */
(function initSkillBars() {
  const fills = $$('.skill-fill');
  if (!fills.length) return;

  let animated = false;

  const observer = new IntersectionObserver(
    entries => {
      if (entries.some(e => e.isIntersecting) && !animated) {
        animated = true;
        fills.forEach(fill => {
          const width = fill.dataset.width || '0';
          // Small delay so the CSS transition is visible
          requestAnimationFrame(() => {
            fill.style.width = `${width}%`;
          });
        });
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );

  // Observe the skills section
  const skillsSection = $('#skills');
  if (skillsSection) observer.observe(skillsSection);
})();

/* ============================================================
   6. STATS COUNTER
   ============================================================ */
(function initStats() {
  const numbers = $$('.stat-number');
  if (!numbers.length) return;

  let started = false;

  /**
   * Animate a single counter element from 0 → target.
   * @param {HTMLElement} el
   * @param {number} target
   * @param {number} duration  ms
   */
  function animateCount(el, target, duration = 1500) {
    const start     = performance.now();
    const startVal  = 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(startVal + eased * (target - startVal));

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    entries => {
      if (entries.some(e => e.isIntersecting) && !started) {
        started = true;
        numbers.forEach(el => {
          const target = parseInt(el.dataset.target, 10) || 0;
          animateCount(el, target);
        });
        observer.disconnect();
      }
    },
    { threshold: 0.5 }
  );

  const statsSection = $('.stats-section');
  if (statsSection) observer.observe(statsSection);
})();

/* ============================================================
   7. PROJECT FILTER
   ============================================================ */
(function initProjectFilter() {
  const filterBtns = $$('.filter-btn');
  const cards      = $$('.project-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;

        if (match) {
          card.classList.remove('hidden');
          // Re-trigger the hover-ready state
          card.style.animation = 'none';
          requestAnimationFrame(() => { card.style.animation = ''; });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ============================================================
   8. CONTACT FORM VALIDATION
   ============================================================ */
(function initContactForm() {
  const form    = $('#contact-form');
  const toast   = $('#form-toast');
  if (!form) return;

  /* ---- Validation rules ---- */
  const rules = {
    name: {
      required: true,
      minLength: 2,
      label: 'Full Name',
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      label: 'Email Address',
    },
    subject: {
      required: true,
      minLength: 3,
      label: 'Subject',
    },
    message: {
      required: true,
      minLength: 10,
      label: 'Message',
    },
  };

  /**
   * Validate a single field, return error string or ''.
   * @param {string} name  — field name
   * @param {string} value — trimmed value
   */
  function validateField(name, value) {
    const rule = rules[name];
    if (!rule) return '';

    if (rule.required && !value) {
      return `${rule.label} is required.`;
    }
    if (rule.minLength && value.length < rule.minLength) {
      return `${rule.label} must be at least ${rule.minLength} characters.`;
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      return `Please enter a valid ${rule.label.toLowerCase()}.`;
    }
    return '';
  }

  /**
   * Show or clear a field's inline error.
   * @param {string}  name    — field name
   * @param {string}  message — error text ('' = clear)
   */
  function setFieldError(name, message) {
    const errorEl = $(`#${name}-error`);
    const inputEl = form.elements[name];
    if (!errorEl || !inputEl) return;

    const wrap = inputEl.closest('.input-wrap');

    errorEl.textContent = message;

    if (message) {
      wrap?.classList.add('error');
    } else {
      wrap?.classList.remove('error');
    }
  }

  /* Real-time validation on blur */
  Object.keys(rules).forEach(name => {
    const field = form.elements[name];
    if (!field) return;

    onEvents(field, ['blur', 'input'], () => {
      const error = validateField(name, field.value.trim());
      setFieldError(name, error);
    });
  });

  /* ---- Submit ---- */
  form.addEventListener('submit', e => {
    e.preventDefault();

    let isValid = true;

    // Run all validations
    Object.keys(rules).forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      const error = validateField(name, field.value.trim());
      setFieldError(name, error);
      if (error) isValid = false;
    });

    if (!isValid) {
      // Focus first error field
      const firstError = $$('.input-wrap.error input, .input-wrap.error textarea')[0];
      firstError?.focus();
      return;
    }

    /* Simulate sending (replace with a real API call / EmailJS / Formspree) */
    const submitBtn = form.querySelector('[type="submit"]');
    const originalHTML = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = originalHTML;

      showToast(
        '✅ Your message has been sent! I\'ll get back to you soon.',
        'success'
      );

      form.reset();
      // Clear any lingering error states
      Object.keys(rules).forEach(name => setFieldError(name, ''));
    }, 1800);
  });

  /**
   * Show the toast notification.
   * @param {string} message
   * @param {'success'|'error'} type
   */
  function showToast(message, type) {
    if (!toast) return;
    toast.textContent  = message;
    toast.className    = `form-toast ${type}`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.className = 'form-toast';
    }, 5000);
  }
})();

/* ============================================================
   9. BACK-TO-TOP
   ============================================================ */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  function toggleVisibility() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   10. HERO PARTICLES  (lightweight canvas animation)
   ============================================================ */
(function initParticles() {
  const container = $('#particles');
  if (!container) return;

  const canvas  = document.createElement('canvas');
  const ctx     = canvas.getContext('2d');
  container.appendChild(canvas);

  // Style canvas to fill its parent
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

  const PARTICLE_COUNT = 55;
  const MAX_LINK_DIST  = 140; // px — max distance to draw a connecting line

  let W, H, particles;

  /* ---- Resize ---- */
  function resize() {
    W = canvas.width  = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  /* ---- Particle factory ---- */
  function createParticle() {
    return {
      x:   Math.random() * W,
      y:   Math.random() * H,
      vx:  (Math.random() - 0.5) * 0.4,
      vy:  (Math.random() - 0.5) * 0.4,
      r:   Math.random() * 2 + 1,
      // Opacity varies so particles feel subtle
      a:   Math.random() * 0.45 + 0.1,
    };
  }

  particles = Array.from({ length: PARTICLE_COUNT }, createParticle);

  /* ---- Draw loop ---- */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update & draw each particle
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    });

    // Draw connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_LINK_DIST) {
          const alpha = (1 - dist / MAX_LINK_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

/* ============================================================
   11. FOOTER YEAR
   ============================================================ */
(function initFooterYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();
