/* ============================================================
   Titodevsec — core
   GSAP + ScrollTrigger (animation), Lenis (smooth scroll),
   Barba (page transitions). Everything shared between pages.
   ============================================================ */
(function () {
  'use strict';

  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const SITE = window.SITE || {};
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobile = () => window.innerWidth <= 900;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const App = (window.App = {
    SITE, $, $$, esc, hasHover, isMobile,
    lenis: null,
    pages: {},
    fx: {},
    visible: false,      // true once the current page is revealed (preloader / curtain lifted)
    pending: [],         // callbacks waiting for the page to become visible
    cleanups: [],        // per-page teardown callbacks
    current: { container: null, ns: '' },
  });

  const ICON = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20M3.6 7h16.8M3.6 17h16.8"/></svg>',
    arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 8v10H8"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M13 5l7 7-7 7"/></svg>',
    arrowUpRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em"><path d="M7 17L17 7M8 7h9v9"/></svg>',
  };
  App.ICON = ICON;

  /* ---------- Smooth scroll ---------- */
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    App.lenis = lenis;
  }
  const scrollLock = (lock) => { if (App.lenis) lock ? App.lenis.stop() : App.lenis.start(); };
  const scrollTop = () => {
    if (App.lenis) App.lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  };
  App.scrollLock = scrollLock;

  /* ---------- Visibility gate ---------- */
  App.onVisible = (fn) => { App.visible ? fn() : App.pending.push(fn); };
  App.flushVisible = () => {
    App.visible = true;
    App.pending.splice(0).forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
  };

  /* ---------- Helpers ---------- */
  function labelFor(x) {
    const file = String(x || '').split('/').pop().toLowerCase();
    if (file.startsWith('contact')) return 'Contact';
    if (file.startsWith('about')) return 'About';
    if (file.startsWith('work')) return 'Work';
    return 'Home';
  }
  App.labelFor = labelFor;

  // Wrap every word in a masked span so it can slide up into view.
  function splitWords(el) {
    const frag = document.createDocumentFragment();
    const walk = (node, target) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { target.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.className = 'w__in'; inner.textContent = part;
            w.appendChild(inner); target.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          if (n.tagName === 'BR') { target.appendChild(document.createElement('br')); return; }
          const clone = n.cloneNode(false); walk(n, clone); target.appendChild(clone);
        }
      });
    };
    walk(el, frag);
    el.innerHTML = '';
    el.appendChild(frag);
    return $$('.w__in', el);
  }

  App.toast = (msg) => {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(App._toastT);
    App._toastT = setTimeout(() => t.classList.remove('is-on'), 3200);
  };

  /* ---------- Effects ---------- */

  // Magnetic: element (and optional .magnetic__inner) drifts toward the cursor.
  App.fx.magnetic = (el) => {
    if (!hasHover || el.dataset.magnetic) return;
    el.dataset.magnetic = '1';
    const strength = parseFloat(el.dataset.strength || '0.35');
    const ease = 'elastic.out(1, 0.3)';
    const xTo = gsap.quickTo(el, 'x', { duration: 1, ease });
    const yTo = gsap.quickTo(el, 'y', { duration: 1, ease });
    const inner = el.querySelector('.magnetic__inner');
    const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 1, ease }) : null;
    const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 1, ease }) : null;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength); yTo(dy * strength);
      if (inner) { ixTo(dx * strength * 0.5); iyTo(dy * strength * 0.5); }
    });
    el.addEventListener('mouseleave', () => { xTo(0); yTo(0); if (inner) { ixTo(0); iyTo(0); } });
  };

  // Rounded: a circle rises from the bottom of the button on hover and leaves through the top.
  App.fx.rounded = (btn) => {
    const fill = btn.querySelector('.btn__fill');
    if (!fill || !hasHover || btn.dataset.rounded) return;
    btn.dataset.rounded = '1';
    const tl = gsap.timeline({ paused: true });
    tl.to(fill, { top: '-25%', width: '150%', duration: 0.4, ease: 'power3.in' }, 'enter')
      .to(fill, { top: '-150%', width: '125%', duration: 0.25 }, 'exit');
    let timer = 0;
    btn.addEventListener('mouseenter', () => { clearTimeout(timer); tl.tweenFromTo('enter', 'exit'); });
    btn.addEventListener('mouseleave', () => { timer = setTimeout(() => tl.play(), 300); });
  };

  // Scroll reveals: words slide up out of masks; fades rise in.
  function setupReveals(container) {
    $$('[data-reveal="words"]', container).forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = '1';
      const words = splitWords(el);
      gsap.set(words, { yPercent: 110 });
      App.onVisible(() => {
        gsap.to(words, {
          yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.025,
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
      });
    });
    const fades = $$('[data-reveal="fade"]', container).filter((el) => !el.dataset.fade);
    if (fades.length) {
      fades.forEach((el) => { el.dataset.fade = '1'; });
      gsap.set(fades, { y: 40, opacity: 0 });
      App.onVisible(() => {
        ScrollTrigger.batch(fades, {
          start: 'top 92%', once: true,
          onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity' }),
        });
      });
    }
  }

  // Staggered entrance for lists (project rows, cards).
  App.fx.rowsIn = (els) => {
    if (!els.length) return;
    gsap.set(els, { y: 50, opacity: 0 });
    App.onVisible(() => {
      ScrollTrigger.batch(els, {
        start: 'top 95%', once: true,
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity' }),
      });
    });
  };

  // Image parallax inside an overflow-hidden box (image is 120% tall).
  App.fx.parallax = (el) => {
    const img = el.querySelector('img') || el;
    gsap.fromTo(img, { yPercent: 0 }, {
      yPercent: -16, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  };

  // 3D laptop: the device lifts and tilts toward the viewer while the lid opens, driven by scroll.
  // The video plays only while the section is on screen.
  App.fx.device = (scene) => {
    const laptop = $('.laptop', scene);
    const lid = $('.laptop__lid', scene);
    const video = $('video', scene);
    if (!laptop || !lid) return;
    const small = window.innerWidth < 768;
    gsap.set(laptop, { rotationX: small ? 40 : 55, y: small ? 40 : 120, scale: small ? 0.92 : 0.85, transformOrigin: '50% 100%' });
    gsap.set(lid, { rotationX: -75 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top 90%', end: 'center 45%', scrub: 0.6 } });
    tl.to(laptop, { rotationX: small ? 8 : 12, y: 0, scale: 1, ease: 'none' }, 0)
      .to(lid, { rotationX: 0, ease: 'none' }, 0);
    if (video) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { video.play().catch(() => {}); } else { video.pause(); } });
      }, { threshold: 0.2 });
      io.observe(scene);
      App.cleanups.push(() => io.disconnect());
    }
  };

  // Hero marquee: endless loop whose speed and direction follow the scroll velocity.
  App.fx.marquee = (hero) => {
    const slider = $('.hero__slider', hero);
    if (!slider) return () => {};
    const [a, b] = slider.children;
    const BASE = 0.06;   // idle speed (% of one copy per frame)
    const MAX = 0.8;     // cap while scrolling fast
    let x = 0, dir = -1, speed = BASE, raf = 0, lastY = window.scrollY;
    gsap.to(slider, {
      x: -400, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.25 },
    });
    const tick = () => {
      const y = window.scrollY;
      const delta = y - lastY;           // px scrolled since the last frame = velocity
      lastY = y;
      if (Math.abs(delta) > 0.5) dir = delta > 0 ? -1 : 1;             // down: run left, up: run right
      const target = Math.min(MAX, BASE + Math.abs(delta) * 0.012);   // faster scroll, faster marquee
      speed += (target - speed) * (target > speed ? 0.3 : 0.05);      // quick to accelerate, slow to settle
      if (x <= -100) x = 0;
      if (x > 0) x = -100;
      gsap.set(a, { xPercent: x });
      if (b) gsap.set(b, { xPercent: x });
      x += speed * dir;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  };

  /* ---------- Project preview modal (follows the cursor over project rows) ---------- */
  const modal = { el: $('#modal'), slider: $('#modal-slider'), cursor: $('#modal-cursor'), label: $('#modal-label'), active: false };
  if (modal.el && hasHover) {
    const targets = [modal.el, modal.cursor, modal.label];
    gsap.set(targets, { xPercent: -50, yPercent: -50, scale: 0 });
    const mx = gsap.quickTo(modal.el, 'left', { duration: 0.8, ease: 'power3' });
    const my = gsap.quickTo(modal.el, 'top', { duration: 0.8, ease: 'power3' });
    const cx = gsap.quickTo(modal.cursor, 'left', { duration: 0.5, ease: 'power3' });
    const cy = gsap.quickTo(modal.cursor, 'top', { duration: 0.5, ease: 'power3' });
    const lx = gsap.quickTo(modal.label, 'left', { duration: 0.45, ease: 'power3' });
    const ly = gsap.quickTo(modal.label, 'top', { duration: 0.45, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { mx(e.clientX); my(e.clientY); cx(e.clientX); cy(e.clientY); lx(e.clientX); ly(e.clientY); });
  }
  App.modal = {
    setProjects(projects) {
      if (!modal.slider) return;
      modal.slider.innerHTML = projects.map((p) => `<div class="modal__item" style="background:${esc(p.color)}"><img src="${esc(p.cover)}" alt=""${p.placeholder ? ` data-fallback="${esc(p.placeholder)}"` : ''} /></div>`).join('');
      modal.slider.style.top = '0%';
    },
    show(i) {
      if (!hasHover || !modal.el) return;
      modal.slider.style.top = `${-i * 100}%`;
      if (modal.active) return;
      modal.active = true;
      const targets = [modal.el, modal.cursor, modal.label];
      gsap.killTweensOf(targets, 'scale');
      gsap.to(targets, { scale: 1, duration: 0.4, ease: 'power3.out' });
    },
    hide() {
      if (!modal.active) return;
      modal.active = false;
      const targets = [modal.el, modal.cursor, modal.label];
      gsap.killTweensOf(targets, 'scale');
      gsap.to(targets, { scale: 0, duration: 0.4, ease: 'power3.in' });
    },
  };
  App.fx.projectHover = (listEl, rows, projects) => {
    if (!hasHover || !listEl) return;
    App.modal.setProjects(projects);
    rows.forEach((row, i) => row.addEventListener('mouseenter', () => App.modal.show(i)));
    listEl.addEventListener('mouseleave', () => App.modal.hide());
  };

  /* ---------- Templates ---------- */
  const R = (App.render = {
    // Case URL carries the slug twice on purpose: the query is the primary source, the hash
    // survives redirects that strip query strings (e.g. cached "clean URL" redirects).
    caseUrl(slug) { return `work-detail.html?p=${esc(slug)}#${esc(slug)}`; },
    socials(cls) {
      return (SITE.socials || []).map((s) => s.url
        ? `<a class="${cls}" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`
        : `<a class="${cls} is-empty" href="#" data-barba-prevent>${esc(s.label)}</a>`).join('');
    },
    footer() {
      return `<footer class="footer">
        <div class="footer__group">
          <div class="footer__item"><p class="label">Version</p><p><span data-year>${new Date().getFullYear()}</span> © Edition</p></div>
          <div class="footer__item"><p class="label">Local time</p><p data-local-time>--:--</p></div>
        </div>
        <div class="footer__item"><p class="label">Socials</p><div class="footer__socials">${R.socials('social')}</div></div>
      </footer>`;
    },
    cta(curve) {
      const p = SITE.profile || {};
      return `<section class="cta" style="--curve-from:${esc(curve || '#ffffff')}">
        <div class="rounded-wrap"><div class="rounded"></div></div>
        <div class="cta__inner">
          <div class="cta__title">
            <div class="cta__avatar"><img src="${esc(p.avatar)}" alt="${esc(p.name)}" /></div>
            <h2 data-reveal="words">Let's work together</h2>
          </div>
          <div class="cta__line">
            <div class="cta__btn-wrap"><a class="btn-circle btn-circle--blue magnetic" href="contact.html"><span class="magnetic__inner">Get in touch</span><span class="btn__fill"></span></a></div>
          </div>
          <div class="cta__pills">
            <a class="btn-round btn-round--ghost magnetic" href="mailto:${esc(p.email)}"><span class="magnetic__inner">${esc(p.email)}</span><span class="btn__fill"></span></a>
            ${p.discord ? `<button type="button" class="btn-round btn-round--ghost magnetic" data-copy="${esc(p.discord)}"><span class="magnetic__inner">Discord: ${esc(p.discord)}</span><span class="btn__fill"></span></button>` : ''}
          </div>
        </div>
        ${R.footer()}
      </section>`;
    },
    projectRow(p, i) {
      // The image only shows on small screens, where the row turns into a card (no hover preview on touch).
      return `<a class="project" href="${R.caseUrl(p.slug)}" data-index="${i}">
        <div class="project__img" style="background:${esc(p.color)}"><img src="${esc(p.cover)}" alt="" loading="lazy"${p.placeholder ? ` data-fallback="${esc(p.placeholder)}"` : ''} /></div>
        <div class="project__text"><h2>${esc(p.title)}</h2><p>${esc(p.services)}</p></div>
      </a>`;
    },
    workRow(p, i) {
      return `<a class="work-row" href="${R.caseUrl(p.slug)}" data-index="${i}"><h2>${esc(p.title)}</h2><p>${esc(p.location)}</p><p>${esc(p.services)}</p><p>${esc(p.year)}</p></a>`;
    },
    workCard(p) {
      return `<a class="work-card" href="${R.caseUrl(p.slug)}">
        <div class="work-card__img" style="background:${esc(p.color)}"><img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy"${p.placeholder ? ` data-fallback="${esc(p.placeholder)}"` : ''} /></div>
        <h2>${esc(p.title)}</h2>
        <div class="work-card__meta"><span>${esc(p.services)}</span><span>${esc(p.year)}</span></div>
      </a>`;
    },
    filters(projects) {
      const cats = (SITE.workFilters || []).filter((c) => projects.some((p) => p.category === c));
      const btn = (key, label, count) => `<button class="filter magnetic${key === 'all' ? ' is-active' : ''}" type="button" data-filter="${esc(key)}"><span class="magnetic__inner">${esc(label)}${count != null ? `<sup>${count}</sup>` : ''}</span><span class="btn__fill"></span></button>`;
      return btn('all', 'All') + cats.map((c) => btn(c, c, projects.filter((p) => p.category === c).length)).join('');
    },
    services() {
      return (SITE.services || []).map((s, i) => `<div class="service" data-reveal="fade">
        <p class="service__num">${String(i + 1).padStart(2, '0')}</p>
        <h3>${s.star ? '<span class="star">✦</span>' : ''}${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </div>`).join('');
    },
    stack() {
      return (SITE.stack || []).map((g) => `<div class="stack__item" data-reveal="fade"><p class="label">${esc(g.label)}</p><ul>${(g.items || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');
    },
    contactAside() {
      const p = SITE.profile || {};
      return `<div class="contact__avatar"><img src="${esc(p.avatar)}" alt="${esc(p.name)}" /></div>
        <div class="contact__arrow">${ICON.arrowDown}</div>
        <div class="contact__block" data-reveal="fade"><p class="label">Contact details</p>
          <a href="mailto:${esc(p.email)}">${esc(p.email)}</a>
          ${p.discord ? `<button type="button" class="linklike" data-copy="${esc(p.discord)}">Discord: ${esc(p.discord)}</button>` : ''}
        </div>
        <div class="contact__block" data-reveal="fade"><p class="label">Location</p><p>${esc(p.city)}</p><p>${esc(p.availability)}</p></div>
        <div class="contact__block" data-reveal="fade"><p class="label">Socials</p><div class="contact__socials">${R.socials('contact__social')}</div></div>`;
    },
    // One gallery item: { src, alt?, caption?, type?: 'image' | 'video', poster? }
    caseFigure(it, size) {
      const isVideo = it.type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(it.src || '');
      const media = isVideo
        ? `<video src="${esc(it.src)}"${it.poster ? ` poster="${esc(it.poster)}"` : ''} autoplay muted loop playsinline preload="metadata"></video>`
        : `<img src="${esc(it.src)}" alt="${esc(it.alt || '')}" loading="lazy"${it.fallback ? ` data-fallback="${esc(it.fallback)}"` : ''} />`;
      return `<figure class="case-fig case-fig--${size}" data-reveal="fade">
        <div class="case-fig__media"${isVideo ? '' : ' data-parallax'}>${media}</div>
        ${it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : ''}
      </figure>`;
    },
    // 3D laptop that opens as the visitor scrolls, playing the project video on its screen.
    caseDevice(p) {
      const v = p.video;
      return `<section class="case-device" style="background:${esc(p.color)}">
        <div class="device-scene">
          <div class="laptop">
            <div class="laptop__lid">
              <span class="laptop__camera"></span>
              <div class="laptop__screen">
                <video src="${esc(v.src)}"${v.poster ? ` poster="${esc(v.poster)}"` : ''} muted loop playsinline preload="metadata"></video>
              </div>
            </div>
            <div class="laptop__base">
              <span class="laptop__keys"></span>
              <span class="laptop__pad"></span>
              <span class="laptop__shadow"></span>
            </div>
          </div>
        </div>
      </section>`;
    },
    // Gallery layout: one full-width item, then a pair side by side, and so on.
    caseGallery(p) {
      const items = (p.images || []).filter((it) => it && it.src);
      if (!items.length) return '';
      let html = '', i = 0, full = true;
      while (i < items.length) {
        const take = full ? 1 : Math.min(2, items.length - i);
        html += items.slice(i, i + take).map((it) => R.caseFigure(it, take === 1 ? 'full' : 'half')).join('');
        i += take;
        full = !full;
      }
      return `<section class="case-gallery">${html}</section>`;
    },
    caseHTML(p, next, total) {
      const link = p.live || p.github;
      const action = link ? `<div class="case-actions"><a class="btn-circle btn-circle--blue magnetic" href="${esc(link)}" target="_blank" rel="noopener"><span class="magnetic__inner">${p.live ? 'Live site' : 'GitHub'} ${ICON.arrowUpRight}</span><span class="btn__fill"></span></a></div>` : '';
      const tech = p.tech || [];
      return `
      <section class="case-head">
        <h1 class="case-title" data-reveal="words">${esc(p.title)}</h1>
        <div class="case-meta">
          <div class="case-meta__col" data-reveal="fade"><p class="label">Role / Services</p><p class="case-meta__val">${esc(p.services)}</p></div>
          <div class="case-meta__col" data-reveal="fade"><p class="label">Tech stack</p><p class="case-meta__val">${esc(tech.join(', '))}</p></div>
          <div class="case-meta__col" data-reveal="fade"><p class="label">Location &amp; Year</p><p class="case-meta__val">${esc(p.location)} © ${esc(p.year)}</p></div>
        </div>
        ${action}
      </section>
      <section class="case-hero"><div class="case-hero__img" data-parallax><img src="${esc(p.cover)}" alt="${esc(p.title)}"${p.placeholder ? ` data-fallback="${esc(p.placeholder)}"` : ''} /></div></section>
      <section class="case-text">
        <p class="label" data-reveal="fade">About the project</p>
        <div data-reveal="fade"><p>${esc(p.description)}</p>${tech.length ? `<ul class="case-tags">${tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>
      </section>
      ${p.video && p.video.src ? R.caseDevice(p) : `<section class="case-mock" style="background:${esc(p.color)}"><div class="case-mock__frame" data-reveal="fade"><img src="${esc(p.cover)}" alt="" loading="lazy"${p.placeholder ? ` data-fallback="${esc(p.placeholder)}"` : ''} /></div></section>`}
      ${R.caseGallery(p)}
      <section class="next-case" style="--curve-from:#ffffff">
        <div class="rounded-wrap"><div class="rounded"></div></div>
        <p class="next-case__label">Next case</p>
        <a class="next-case__link" href="${R.caseUrl(next.slug)}">
          <h2 class="next-case__title">${esc(next.title)}</h2>
          <div class="next-case__img" data-parallax><img src="${esc(next.cover)}" alt="${esc(next.title)}" loading="lazy"${next.placeholder ? ` data-fallback="${esc(next.placeholder)}"` : ''} /></div>
        </a>
        <div class="next-case__line"><a class="btn-circle btn-circle--blue magnetic" href="${R.caseUrl(next.slug)}"><span class="magnetic__inner">Next case</span><span class="btn__fill"></span></a></div>
        <div class="next-case__all"><a class="btn-round btn-round--ghost magnetic" href="work.html"><span class="magnetic__inner">All work<sup>${total}</sup></span><span class="btn__fill"></span></a></div>
        ${R.footer()}
      </section>`;
    },
  });

  /* ---------- Preloader ---------- */
  const preloader = {
    el: $('#preloader'), text: $('#preloader-text'), word: $('.preloader__word'), path: $('#preloader-path'),
    state: { b: 300 },
    draw() {
      if (!this.path) return;
      const w = window.innerWidth;
      this.path.setAttribute('d', `M0 0 L${w} 0 Q${w / 2} ${this.state.b} 0 0 Z`);
    },
    run(ns) {
      return new Promise((resolve) => {
        if (!this.el || !window.gsap) { if (this.el) this.el.style.display = 'none'; App.flushVisible(); App.entrance(); return resolve(); }
        const words = ns === 'home' ? (SITE.greetings || ['Hello']) : [labelFor(ns)];
        this.draw();
        gsap.set(this.word, { opacity: 0, y: 30 });
        const tl = gsap.timeline({ onComplete: () => { this.el.style.display = 'none'; resolve(); } });
        tl.to(this.word, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.1);
        words.forEach((w, i) => tl.call(() => { this.text.textContent = w; }, null, i === 0 ? 0 : 0.9 + (i - 1) * 0.16));
        const hold = words.length > 1 ? 0.9 + (words.length - 2) * 0.16 + 0.55 : 0.8;
        tl.to(this.el, { yPercent: -100, duration: 0.85, ease: 'power3.inOut' }, hold);
        tl.to(this.state, { b: 0, duration: 0.85, ease: 'power3.inOut', onUpdate: () => this.draw() }, hold);
        tl.call(() => { App.flushVisible(); App.entrance(); }, null, hold + 0.3);
      });
    },
  };

  /* ---------- Page transition curtain ---------- */
  const curtain = {
    el: $('#transition'), path: $('#transition-path'), text: $('#transition-text'), label: $('.transition__label'),
    s: { top: 0, ct: 0, bottom: 0, cb: 0 },
    draw() {
      if (!this.path) return;
      const w = window.innerWidth, { top, ct, bottom, cb } = this.s;
      this.path.setAttribute('d', `M0 ${top} Q${w / 2} ${top - ct} ${w} ${top} L${w} ${bottom} Q${w / 2} ${bottom + cb} 0 ${bottom} Z`);
    },
    cover(label) {
      return new Promise((resolve) => {
        const H = window.innerHeight + 600;
        Object.assign(this.s, { top: H, ct: 0, bottom: H, cb: 0 });
        this.draw();
        this.text.textContent = label;
        this.el.classList.add('is-active');
        gsap.set(this.label, { opacity: 0, y: 20 });
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(this.s, { top: 0, duration: 0.8, ease: 'power3.inOut', onUpdate: () => this.draw() }, 0)
          .to(this.s, { ct: 260, duration: 0.4, ease: 'power2.out', onUpdate: () => this.draw() }, 0)
          .to(this.s, { ct: 0, duration: 0.4, ease: 'power2.in', onUpdate: () => this.draw() }, 0.4)
          .to(this.label, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.35);
      });
    },
    reveal() {
      return new Promise((resolve) => {
        const tl = gsap.timeline({ onComplete: () => { this.el.classList.remove('is-active'); resolve(); } });
        tl.to(this.label, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' }, 0)
          .to(this.s, { bottom: 0, duration: 0.8, ease: 'power3.inOut', onUpdate: () => this.draw() }, 0.1)
          .to(this.s, { cb: 260, duration: 0.4, ease: 'power2.out', onUpdate: () => this.draw() }, 0.1)
          .to(this.s, { cb: 0, duration: 0.4, ease: 'power2.in', onUpdate: () => this.draw() }, 0.5);
      });
    },
  };

  /* ---------- Header, floating button, slide-in menu ---------- */
  const header = $('#header');
  const navBtn = $('#nav-btn');
  const panel = $('#panel');
  const panelPath = $('#panel-path');
  const backdrop = $('#panel-backdrop');
  const panelState = { b: 100, open: false };

  function drawPanel() {
    if (!panelPath) return;
    const h = window.innerHeight;
    panelPath.setAttribute('d', `M100 0 L200 0 L200 ${h} L100 ${h} Q${100 - panelState.b * 2} ${h / 2} 100 0 Z`);
  }
  if (panel) { gsap.set(panel, { xPercent: 100, x: 200 }); drawPanel(); }
  window.addEventListener('resize', drawPanel);

  function openPanel() {
    if (panelState.open || !panel) return;
    panelState.open = true;
    panel.setAttribute('aria-hidden', 'false');
    navBtn.setAttribute('aria-expanded', 'true');
    navBtn.classList.add('is-open');
    backdrop.classList.add('is-open');
    scrollLock(true);
    gsap.killTweensOf([panel, panelState]);
    gsap.to(panel, { xPercent: 0, x: 0, duration: 0.8, ease: 'power3.inOut' });
    gsap.to(panelState, { b: 0, duration: 0.9, ease: 'power3.inOut', onUpdate: drawPanel });
    gsap.fromTo($$('.panel__link'), { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out', delay: 0.25, overwrite: true });
    gsap.fromTo($$('.panel__label, .panel__socials'), { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.4, overwrite: true });
  }
  function closePanel(immediate) {
    if (!panelState.open || !panel) return;
    panelState.open = false;
    panel.setAttribute('aria-hidden', 'true');
    navBtn.setAttribute('aria-expanded', 'false');
    navBtn.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    scrollLock(false);
    gsap.killTweensOf([panel, panelState]);
    if (immediate) { gsap.set(panel, { xPercent: 100, x: 200 }); panelState.b = 100; drawPanel(); return; }
    gsap.to(panel, { xPercent: 100, x: 200, duration: 0.8, ease: 'power3.inOut' });
    gsap.to(panelState, { b: 100, duration: 0.8, ease: 'power3.inOut', onUpdate: drawPanel });
  }
  App.openPanel = openPanel;
  App.closePanel = closePanel;

  if (navBtn) navBtn.addEventListener('click', () => (panelState.open ? closePanel() : openPanel()));
  if (backdrop) backdrop.addEventListener('click', () => closePanel());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
  $$('.panel__link').forEach((a) => a.addEventListener('click', (e) => {
    if (a.dataset.ns === App.current.ns) { e.preventDefault(); closePanel(); }
  }));
  document.addEventListener('click', (e) => { const a = e.target.closest('a.is-empty'); if (a) e.preventDefault(); });
  // Any image with data-fallback swaps to its local fallback if the remote file fails to load.
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img && img.tagName === 'IMG' && img.dataset.fallback && !img.dataset.fellBack) {
      img.dataset.fellBack = '1';
      img.src = img.dataset.fallback;
    }
  }, true);

  function setHeaderTheme(theme) { if (header) header.dataset.theme = theme || 'dark'; }
  function setActive(ns) {
    const key = ns === 'work-detail' ? 'work' : ns;
    $$('.nav__link').forEach((a) => a.classList.toggle('is-active', a.dataset.ns === key));
    $$('.panel__link').forEach((a) => a.classList.toggle('is-active', a.dataset.ns === key));
  }

  // Floating round button appears once the header has scrolled away (always visible on small screens).
  function setupNavBtn() {
    if (!navBtn) return;
    if (isMobile()) { gsap.set(navBtn, { scale: 1 }); return; }
    gsap.set(navBtn, { scale: 0 });
    ScrollTrigger.create({
      trigger: document.body, start: 'top -120px', end: 'bottom top',
      onEnter: () => gsap.to(navBtn, { scale: 1, duration: 0.3, ease: 'power1.out' }),
      onLeaveBack: () => { if (!panelState.open) gsap.to(navBtn, { scale: 0, duration: 0.3, ease: 'power1.in' }); },
    });
  }

  /* ---------- Clock / year / copy-to-clipboard ---------- */
  function tickTime() {
    const p = SITE.profile || {};
    let t;
    try { t = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: p.timezone || 'Africa/Dar_es_Salaam' }).format(new Date()); }
    catch (e) { t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
    const label = `${t} ${p.gmt || ''}`.trim();
    $$('[data-local-time]').forEach((el) => { el.textContent = label; });
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }
  setInterval(tickTime, 10000);

  function bindCopy(root) {
    $$('[data-copy]', root).forEach((el) => el.addEventListener('click', async (e) => {
      e.preventDefault();
      const v = el.dataset.copy;
      try { await navigator.clipboard.writeText(v); App.toast(`Copied "${v}"`); } catch (err) { App.toast(v); }
    }));
  }

  /* ---------- Page init / entrance ---------- */
  App.initPage = (container, href) => {
    const ns = container.dataset.barbaNamespace || 'home';
    App.current = { container, ns };
    App.visible = false;
    App.pending = [];
    setHeaderTheme(container.dataset.header);
    setActive(ns);

    // Shared blocks rendered from data
    $$('[data-contact-cta]', container).forEach((el) => { el.outerHTML = R.cta(el.dataset.curve); });
    $$('[data-footer]', container).forEach((el) => { el.outerHTML = R.footer(); });
    $$('[data-contact-aside]', container).forEach((el) => { el.innerHTML = R.contactAside(); });
    $$('[data-services]', container).forEach((el) => { el.innerHTML = R.services(); });
    $$('[data-stack]', container).forEach((el) => { el.innerHTML = R.stack(); });
    $$('[data-globe]', container).forEach((el) => { el.innerHTML = ICON.globe; });
    $$('[data-arrow]', container).forEach((el) => { el.innerHTML = ICON[el.dataset.arrow] || ICON.arrowDown; });

    // Page-specific
    const url = new URL(href || location.href, location.href);
    try { if (App.pages[ns]) App.pages[ns](container, url); } catch (e) { console.error(e); }

    // Shared effects
    $$('.magnetic', container).forEach(App.fx.magnetic);
    $$('.btn-round, .btn-circle, .filter, .view-btn', container).forEach(App.fx.rounded);
    $$('[data-parallax]', container).forEach((el) => App.fx.parallax(el));
    $$('.device-scene', container).forEach((el) => App.fx.device(el));
    $$('.cta', container).forEach((sec) => {
      const wrap = $('.cta__btn-wrap', sec);
      if (wrap && !isMobile()) gsap.fromTo(wrap, { x: 220 }, { x: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 20%', scrub: true } });
    });
    setupReveals(container);
    setupNavBtn();
    tickTime();
    bindCopy(container);
  };

  App.entrance = () => {
    const { container, ns } = App.current;
    if (!container || !window.gsap) return;
    if (header) gsap.fromTo(header, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2, clearProps: 'transform,opacity' });
    if (ns === 'home') {
      const tl = gsap.timeline({ delay: 0.1 });
      const img = $('.hero__img img', container), loc = $('#hero-location', container), tag = $('#hero-tagline', container), slider = $('#hero-slider', container);
      if (img) tl.fromTo(img, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, 0);
      if (loc) tl.fromTo(loc, { xPercent: -100 }, { xPercent: 0, duration: 1, ease: 'power3.out' }, 0.2);
      if (tag) tl.fromTo(tag, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0.3);
      if (slider) tl.fromTo(slider, { yPercent: 100 }, { yPercent: 0, duration: 1, ease: 'power3.out' }, 0.35);
    }
  };

  /* ---------- Start (called from pages.js once page inits are registered) ---------- */
  App.start = () => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    scrollTop();
    scrollLock(true);

    // Persistent UI (outside the Barba container)
    $$('.magnetic').filter((el) => !el.closest('[data-barba="container"]')).forEach(App.fx.magnetic);
    $$('[data-socials]').forEach((el) => { el.innerHTML = R.socials('panel__social'); });

    const first = (container, href) => {
      App.initPage(container, href);
      preloader.run(App.current.ns).then(() => { scrollLock(false); ScrollTrigger.refresh(); });
    };

    const useBarba = !!window.barba && location.protocol !== 'file:';
    if (useBarba) {
      barba.init({
        preventRunning: true,
        timeout: 8000,
        prevent: ({ el, href }) => !href
          || (el && el.hasAttribute && el.hasAttribute('data-barba-prevent'))
          || /^(mailto|tel|javascript):/.test(href)
          || (el && el.getAttribute && el.getAttribute('target') === '_blank')
          || /\/admin\//.test(href),
        transitions: [{
          name: 'curtain',
          sync: false,
          once({ next }) { first(next.container, next.url.href); },
          async leave({ current, next }) {
            closePanel(true);
            App.modal.hide();
            scrollLock(true);
            const label = next && next.url ? labelFor(next.url.path) : 'Home';
            await curtain.cover(label);
            App.cleanups.splice(0).forEach((fn) => { try { fn(); } catch (e) { /* noop */ } });
            ScrollTrigger.getAll().forEach((t) => t.kill());
            current.container.style.display = 'none';
          },
          beforeEnter({ next }) {
            scrollTop();
            const m = next.html && next.html.match(/<title>([^<]*)<\/title>/i);
            if (m) document.title = m[1];
            if (!isMobile()) gsap.set(navBtn, { scale: 0 });
            App.initPage(next.container, next.url.href);
          },
          async enter() {
            ScrollTrigger.refresh();
            setTimeout(() => { App.flushVisible(); App.entrance(); }, 450);
            await curtain.reveal();
            scrollLock(false);
          },
        }],
      });
    } else {
      const c = $('[data-barba="container"]');
      if (c) first(c, location.href);
    }

    // Safety net: never leave the preloader stuck (e.g. a CDN script failed to load)
    setTimeout(() => {
      const p = $('#preloader');
      if (p && p.style.display !== 'none' && !App.visible) { p.style.display = 'none'; App.flushVisible(); scrollLock(false); }
    }, 9000);
  };
})();
