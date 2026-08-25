/* =====================================================================
   MAGIA FIT ALMERÍA — interacciones
   ===================================================================== */
(function () {
  'use strict';
  const CFG = window.MAGIAFIT || {};
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Enlaces de WhatsApp ─────────────────────────────────── */
  const waLink = (msg) =>
    'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(msg || 'Hola 👋');
  window.MF_waLink = waLink;

  $$('[data-wa]').forEach(el => {
    el.setAttribute('href', waLink(el.dataset.wa));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* ── Datos dinámicos desde config.js ─────────────────────── */
  const tel = $('#napTel'), faqTel = $('#faqTel');
  [tel, faqTel].forEach(a => {
    if (!a) return;
    a.href = waLink('Hola, quiero información sobre Magia Fit Almería');
    a.target = '_blank'; a.rel = 'noopener';
    a.textContent = CFG.telefonoBonito;
  });
  if ($('#napDireccion')) $('#napDireccion').textContent = CFG.direccion;
  if ($('#napHorario'))   $('#napHorario').textContent   = CFG.horario.texto;
  if ($('#year'))         $('#year').textContent         = new Date().getFullYear();

  const zonas = $('#zonas');
  if (zonas) zonas.innerHTML = (CFG.zonas || []).map(z => `<li>${z}</li>`).join('');

  const fs = $('#footerServicios');
  if (fs) fs.innerHTML = (CFG.servicios || []).map(s => `<li>${s}</li>`).join('');

  const nap = $('#footerNap');
  if (nap) nap.innerHTML =
    `${CFG.direccion}<br><a href="${waLink('Hola 👋')}" target="_blank" rel="noopener">${CFG.telefonoBonito}</a><br>` +
    `<a href="mailto:${CFG.email}">${CFG.email}</a><br><span style="font-size:.82rem">${CFG.horario.texto}</span>`;

  /* ── Preloader ───────────────────────────────────────────── */
  window.addEventListener('load', () => {
    const p = $('#preloader');
    if (p) setTimeout(() => p.classList.add('is-done'), 420);
  });
  setTimeout(() => { const p = $('#preloader'); if (p) p.classList.add('is-done'); }, 3500);

  /* ── Header + progreso de scroll + nav activa ────────────── */
  const header = $('#header'), bar = $('#scrollProgress');
  const secs = $$('main section[id]');
  const navLinks = $$('.nav a[href^="#"]');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 40);
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    let cur = '';
    secs.forEach(s => { if (y >= s.offsetTop - 140) cur = s.id; });
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur));
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ── Menú móvil ──────────────────────────────────────────── */
  const burger = $('#burger'), nav = $('#nav');
  if (burger && nav) {
    const close = () => {
      nav.classList.remove('is-open'); burger.classList.remove('is-on');
      burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('is-locked');
    };
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-on', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    });
    $$('a', nav).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ── Reveal al hacer scroll ──────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
  const observeReveals = () => $$('.reveal:not(.is-in)').forEach(el => io.observe(el));
  observeReveals();
  window.MF_observeReveals = observeReveals;

  /* ── Contadores ──────────────────────────────────────────── */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, to = parseFloat(el.dataset.to), sfx = el.dataset.suffix || '';
      const dur = 1500, t0 = performance.now();
      (function step(t) {
        const k = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + sfx;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('.count').forEach(el => cio.observe(el));

  /* ── Máquina de escribir del hero ────────────────────────── */
  const tw = $('#typewriter');
  if (tw) {
    const words = ['entrena.', 'suda.', 'mide.', 'repite.', 'nota.'];
    let w = 0, i = 0, del = false;
    (function tick() {
      const word = words[w];
      tw.textContent = del ? word.slice(0, --i) : word.slice(0, ++i);
      let wait = del ? 45 : 95;
      if (!del && i === word.length) { wait = 1700; del = true; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 260; }
      setTimeout(tick, wait);
    })();
  }

  /* ── Halo que sigue al cursor + botones magnéticos ───────── */
  const glow = $('#cursorGlow');
  if (glow && !reduce && matchMedia('(hover:hover)').matches) {
    window.addEventListener('pointermove', e => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });

    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform =
          `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .28}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ── Fondo animado del hero (partículas + red) ───────────── */
  const oscuro = window.matchMedia('(prefers-color-scheme: dark)');
  const cv = $('#heroCanvas');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d');
    let w, h, dots = [], raf = null, tinta;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    // Las partículas se oscurecen en tema claro para que se vean sobre el crema
    const PALETAS = {
      oscuro: { colores: ['232,196,106', '124,58,237', '34,211,238'], punto: .75, linea: .16 },
      claro:  { colores: ['184,134,47', '109,40,217', '14,116,144'],  punto: .55, linea: .13 }
    };

    function size() {
      tinta = oscuro.matches ? PALETAS.oscuro : PALETAS.claro;
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * DPR; cv.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.min(Math.round((w * h) / 15000), 110);
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
        r: Math.random() * 1.6 + .5,
        c: tinta.colores[Math.random() > .72 ? 0 : (Math.random() > .5 ? 1 : 2)]
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${d.c},${tinta.punto})`;
        ctx.fill();
        for (let j = i + 1; j < dots.length; j++) {
          const o = dots[j], dx = d.x - o.x, dy = d.y - o.y, dist = dx * dx + dy * dy;
          if (dist < 18000) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = `rgba(${d.c},${tinta.linea * (1 - dist / 18000)})`;
            ctx.lineWidth = .7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }

    const repintar = () => { cancelAnimationFrame(raf); size(); draw(); };
    size(); draw();
    window.addEventListener('resize', repintar);
    oscuro.addEventListener('change', repintar);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { cancelAnimationFrame(raf); draw(); }
    });
  }

  /* ── Tarifas dinámicas ───────────────────────────────────── */
  const plansEl = $('#plans');
  const periodos = {
    mensual:    { div: 1,  etiqueta: '/mes',  meta: p => 'Pago mensual · sin permanencia' },
    trimestral: { div: 3,  etiqueta: '/mes',  meta: p => `Un pago de ${eur(p.trimestral)} cada 3 meses` },
    anual:      { div: 12, etiqueta: '/mes',  meta: p => `Un pago de ${eur(p.anual)} al año · ahorras ${eur(p.mensual * 12 - p.anual)}` }
  };
  const eur = n => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: (n % 1 ? 2 : 0) });

  function renderPlans(period) {
    if (!plansEl) return;
    const cfgP = periodos[period];
    plansEl.innerHTML = (CFG.tarifas || []).map(p => {
      const precio = p[period] / cfgP.div;
      return `<article class="plan glass reveal${p.destacado ? ' plan--top' : ''}">
        <h3 class="plan__name">${p.nombre}</h3>
        <p class="plan__res">${p.resumen}</p>
        <p class="plan__price"><b data-plan="${p.id}">${eur(Math.round(precio * 100) / 100)}</b><i>${cfgP.etiqueta}</i></p>
        <p class="plan__meta">${cfgP.meta(p)}</p>
        <ul>${p.incluye.map(i => `<li>${i}</li>`).join('')}</ul>
        <a class="btn ${p.destacado ? 'btn--gold' : 'btn--ghost'} btn--full magnetic" target="_blank" rel="noopener"
           href="${waLink(`Hola, me interesa el plan ${p.nombre} (${period}) de Magia Fit Almería. ¿Me contáis más?`)}">Lo quiero</a>
      </article>`;
    }).join('');
    observeReveals();
    // pequeño retardo para que la animación de entrada se aprecie
    requestAnimationFrame(() => $$('.plan', plansEl).forEach(el => el.classList.add('is-in')));
  }
  renderPlans('mensual');

  $$('.switch__b').forEach(b => {
    b.addEventListener('click', () => {
      $$('.switch__b').forEach(x => { x.classList.remove('is-on'); x.setAttribute('aria-selected', 'false'); });
      b.classList.add('is-on'); b.setAttribute('aria-selected', 'true');
      renderPlans(b.dataset.period);
    });
  });

  /* ── Formulario multipaso → WhatsApp ─────────────────────── */
  const form = $('#booking');
  if (form) {
    const steps = $$('.bstep', form), dots = $$('.booking__steps span', form), err = $('#formErr');
    let cur = 0;

    const show = n => {
      cur = n;
      steps.forEach((s, i) => s.classList.toggle('is-on', i === n));
      dots.forEach((d, i) => d.classList.toggle('is-on', i <= n));
      const y = form.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    };

    const valid = n => {
      const step = steps[n];
      if (n < 2) {
        const name = $('input[type=radio]', step).name;
        if (!$(`input[name="${name}"]:checked`, step)) { flash('Elige una opción para continuar.'); return false; }
        return true;
      }
      let ok = true;
      $$('input[required], textarea[required]', step).forEach(f => {
        const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim();
        f.classList.toggle('is-bad', bad);
        if (bad) ok = false;
      });
      const t = $('input[name=telefono]', step);
      if (t && t.value.trim() && t.value.replace(/\D/g, '').length < 9) { t.classList.add('is-bad'); ok = false; }
      if (!ok) flash('Revisa los campos marcados: nombre, teléfono válido y aceptar la privacidad.');
      return ok;
    };

    function flash(m) {
      if (!err) return;
      err.textContent = m; err.hidden = false;
      clearTimeout(flash.t); flash.t = setTimeout(() => { err.hidden = true; }, 5000);
    }

    $$('.nextStep', form).forEach(b => b.addEventListener('click', () => { if (valid(cur)) show(cur + 1); }));
    $$('.prevStep', form).forEach(b => b.addEventListener('click', () => show(Math.max(cur - 1, 0))));
    $$('input, textarea', form).forEach(f => f.addEventListener('input', () => f.classList.remove('is-bad')));

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!valid(2)) return;
      const d = new FormData(form);
      const msg =
        '¡Hola Magia Fit Almería! Quiero agendar mi llamada gratuita 📞\n\n' +
        '• Nombre: ' + d.get('nombre') + '\n' +
        '• Teléfono: ' + d.get('telefono') + '\n' +
        '• Objetivo: ' + d.get('objetivo') + '\n' +
        '• Mejor franja: ' + d.get('franja') + '\n' +
        (d.get('mensaje') ? '• Nota: ' + d.get('mensaje') + '\n' : '') +
        '\n(Enviado desde la web)';
      window.open(waLink(msg), '_blank', 'noopener');
      form.innerHTML =
        '<div class="center" style="padding:1.6rem 0">' +
        '<p style="font-size:2.4rem;margin:0">✅</p>' +
        '<h3 style="margin:.6rem 0">¡Solicitud lista, ' + String(d.get('nombre')).split(' ')[0] + '!</h3>' +
        '<p style="color:var(--muted)">Se ha abierto WhatsApp con tu solicitud. Pulsa <b>enviar</b> y te confirmamos la hora de la llamada en minutos.</p>' +
        '<a class="btn btn--gold" target="_blank" rel="noopener" href="' + waLink(msg) + '">Abrir WhatsApp de nuevo</a></div>';
    });
  }
})();
