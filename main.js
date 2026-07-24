/* ==========================================================================
   ELEN'S COFFEE — main.js
   --------------------------------------------------------------------------
   Vanilla JS, no build step. Handles:
     1. Navigation scroll state + mobile toggle
     2. Scroll-reveal animations (IntersectionObserver)
     3. Swiper gallery (landing page only)
     4. Menu page active-tab tracking
     5. Footer year
   All features degrade gracefully if JS is blocked.
   ========================================================================== */

(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 1. Footer year ------------------------------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Navigation -------------------------------------------- */
  const nav = $('#nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const toggle = $('#navToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      $$('.nav__link', nav).forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ---------- 3. Scroll reveal ----------------------------------------- */
  const reveals = $$('[data-reveal]');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const parent = entry.target.parentElement;
          const siblings = parent
            ? Array.from(parent.querySelectorAll(':scope > [data-reveal]'))
            : [entry.target];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(Math.max(idx, 0) * 0.08, 0.4);
          entry.target.style.setProperty('--reveal-delay', `${delay}s`);
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('is-visible'));
    }
  }

  /* ---------- 4. Gallery (Swiper) -------------------------------------- */
  if (typeof window.Swiper !== 'undefined' && $('.gallery__swiper')) {
    const swiper = new window.Swiper('.gallery__swiper', {
      slidesPerView: 'auto',
      spaceBetween: 20,
      grabCursor: true,
      loop: true,
      speed: 700,
      loopAdditionalSlides: 4,
    });
    $('#galleryPrev')?.addEventListener('click', () => swiper.slidePrev());
    $('#galleryNext')?.addEventListener('click', () => swiper.slideNext());
  }

  /* ---------- 5. Menu page: tabs + active tracking --------------------- */
  const tabs = $$('.menu-tab');
  if (tabs.length) {
    const setActive = (id) => {
      tabs.forEach(t => {
        t.classList.toggle('is-active', t.getAttribute('href') === `#${id}`);
      });
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const id = tab.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActive(id);
      });
    });

    if ('IntersectionObserver' in window) {
      const sections = $$('.menu-section');
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-35% 0px -55% 0px' });
      sections.forEach(s => io.observe(s));
    }
  }
})();
