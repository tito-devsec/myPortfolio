/* ============================================================
   Titodevsec — per-page logic
   Each page registers an init that receives its Barba container.
   ============================================================ */
(function () {
  'use strict';

  const App = window.App;
  const { $, $$, render: R, fx, SITE } = App;
  const projects = () => SITE.projects || [];

  /* ---------- Home ---------- */
  App.pages.home = (container) => {
    const list = $('#home-projects', container);
    const recent = projects().slice(0, 4);
    if (list) {
      list.innerHTML = recent.map(R.projectRow).join('');
      const rows = $$('.project', list);
      fx.projectHover(list, rows, recent);
      fx.rowsIn(rows);
    }
    $$('[data-project-count]', container).forEach((el) => { el.textContent = projects().length; });

    const hero = $('#hero', container);
    if (hero) {
      App.cleanups.push(fx.marquee(hero));
      // Hero figure: only shown when a (transparent) cut-out is configured in js/data.js
      const wrap = $('[data-hero-img]', hero);
      const src = (SITE.profile && SITE.profile.heroImage) || '';
      if (wrap) {
        const img = wrap.querySelector('img');
        if (src && img) { img.src = src; wrap.hidden = false; } else { wrap.hidden = true; }
        if (src) gsap.to(wrap, { y: 120, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }
    }
  };

  /* ---------- Work (filters + list / grid) ---------- */
  App.pages.work = (container) => {
    const all = projects();
    let filter = 'all';
    let view = 'list';
    const filtersEl = $('#filters', container);
    const rowsEl = $('#work-rows', container);
    const gridEl = $('#work-grid', container);
    const listEl = $('#work-list', container);
    if (!filtersEl || !rowsEl || !gridEl || !listEl) return;

    filtersEl.innerHTML = R.filters(all);
    const current = () => (filter === 'all' ? all : all.filter((p) => p.category === filter));

    function draw() {
      const list = current();
      rowsEl.innerHTML = list.map(R.workRow).join('');
      gridEl.innerHTML = list.map(R.workCard).join('');
      const rows = $$('.work-row', rowsEl);
      const cards = $$('.work-card', gridEl);
      fx.projectHover(listEl, rows, list);
      fx.rowsIn(view === 'list' ? rows : cards);
      ScrollTrigger.refresh();
    }

    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter');
      if (!btn || btn.dataset.filter === filter) return;
      $$('.filter', filtersEl).forEach((b) => b.classList.toggle('is-active', b === btn));
      filter = btn.dataset.filter;
      App.modal.hide();
      const items = view === 'list' ? $$('.work-row', rowsEl) : $$('.work-card', gridEl);
      if (items.length) gsap.to(items, { opacity: 0, y: -20, duration: 0.3, stagger: 0.03, ease: 'power2.in', onComplete: draw });
      else draw();
    });

    $$('.view-btn', container).forEach((btn) => btn.addEventListener('click', () => {
      if (btn.dataset.view === view) return;
      view = btn.dataset.view;
      $$('.view-btn', container).forEach((b) => b.classList.toggle('is-active', b === btn));
      listEl.hidden = view !== 'list';
      gridEl.hidden = view !== 'grid';
      App.modal.hide();
      draw();
    }));

    // Magnetic + rounded for the filter buttons are applied by App.initPage after this init.
    draw();
  };

  /* ---------- Work detail (rendered from ?p=<slug>) ---------- */
  App.pages['work-detail'] = (container, url) => {
    const all = projects();
    const host = $('#case', container);
    if (!host) return;
    if (!all.length) { host.innerHTML = '<section class="case-head"><h1 class="case-title">No projects yet</h1></section>'; return; }
    const slug = url.searchParams.get('p');
    let i = all.findIndex((p) => p.slug === slug);
    if (i < 0) i = 0;
    const p = all[i];
    const next = all[(i + 1) % all.length];
    host.innerHTML = R.caseHTML(p, next, all.length);
    document.title = `${p.title} — ${(SITE.profile && SITE.profile.brand) || 'Titodevsec'}`;
  };

  /* ---------- About ---------- */
  App.pages.about = (container) => {
    const head = $('.about-head', container);
    const globe = $('#about-globe', container);
    if (head && globe) gsap.to(globe, { x: -160, ease: 'none', scrollTrigger: { trigger: head, start: 'top top', end: 'bottom top', scrub: true } });
  };

  /* ---------- Contact ---------- */
  App.pages.contact = (container) => {
    const form = $('#contact-form', container);
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const missing = [];
      if (!String(data.name || '').trim()) missing.push('name');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || '').trim())) missing.push('email');
      if (!String(data.message || '').trim()) missing.push('message');
      $$('.cform__field', form).forEach((f) => f.classList.remove('is-error'));
      if (missing.length) {
        missing.forEach((n) => { const el = form.querySelector(`[name="${n}"]`); if (el) el.closest('.cform__field').classList.add('is-error'); });
        App.toast('Please fill in your name, a valid email and a message.');
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        if (SITE.api) {
          const res = await fetch(`${SITE.api}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          App.toast('Message sent! I will get back to you soon.');
          form.reset();
        } else {
          const org = data.organization ? ` (${data.organization})` : '';
          const subject = encodeURIComponent(`Project inquiry from ${data.name}${org}`);
          const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\nOrganization: ${data.organization || '-'}\nServices: ${data.services || '-'}\n\n${data.message}`);
          window.location.href = `mailto:${SITE.profile.email}?subject=${subject}&body=${body}`;
          App.toast('Opening your email app…');
        }
      } catch (err) {
        App.toast('Could not send. Please email me directly.');
      } finally {
        btn.disabled = false;
      }
    });
  };

  App.start();
})();
