/* =====================================================================
   INDALODIVE — interacciones
   La página se construye leyendo config.js (enlaces, textos, contacto) y
   feed.js (fotos de Instagram). Para cambiar contenido no hace falta
   tocar este archivo.
   ===================================================================== */
(function () {
  'use strict';

  const CFG   = window.INDALO || {};
  const FEED  = window.INDALO_FEED || { publicaciones: [] };
  const $     = (s, c) => (c || document).querySelector(s);
  const $$    = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  const icono = (nombre) => `<svg aria-hidden="true"><use href="#i-${esc(nombre || 'burbuja')}"/></svg>`;
  const waLink = (msg) =>
    'https://wa.me/' + (CFG.whatsapp || '') + '?text=' + encodeURIComponent(msg || 'Hola 👋');

  /* Aviso opcional para analítica: si algún día añades Google Analytics o
     el píxel de Meta, cada clic en un enlace de producto llega solo. */
  const registrarClic = (id) => {
    if (window.dataLayer) window.dataLayer.push({ event: 'clic_enlace', enlace: id });
    if (typeof window.gtag === 'function') window.gtag('event', 'select_content', { content_id: id });
  };

  /* ── Textos de marca ─────────────────────────────────────────────── */
  const ig = CFG.instagram || {};
  const igUrl = ig.url || ('https://www.instagram.com/' + (ig.usuario || '') + '/');

  if (CFG.claim) {
    const p = CFG.claim.split(' ');
    const corte = Math.max(1, Math.ceil(p.length / 2));
    $('#heroTitulo').innerHTML =
      esc(p.slice(0, corte).join(' ')) + ' <span class="grad">' + esc(p.slice(corte).join(' ')) + '</span>';
  }
  if (CFG.subclaim) $('#heroSub').textContent = CFG.subclaim;
  if (ig.usuario) {
    $('#heroUsuario').innerHTML = icono('instagram') + '@' + esc(ig.usuario);
    $('#heroUsuario').href = igUrl;
    $('#heroInstagram').href = igUrl;
    $('#galeriaCta').href = igUrl;
    $('#galeriaEntradilla').textContent =
      'Cada salida, cada fondo y cada bicho que se deja ver, en @' + ig.usuario + '.';
  }
  $$('#brandUbicacion, #footerUbicacion').forEach(el => { el.textContent = CFG.ubicacion || 'Buceo'; });
  $('#anio').textContent = new Date().getFullYear();
  $('#footerAviso').textContent = CFG.aviso || '';

  $('#heroCifras').innerHTML = (CFG.cifras || [])
    .map(c => `<li class="hero__cifra"><strong>${esc(c.valor)}</strong><span>${esc(c.texto)}</span></li>`).join('');

  /* ── Enlaces de producto ─────────────────────────────────────────── */
  const lista = $('#listaEnlaces');
  const enlaces = CFG.enlaces || [];

  lista.innerHTML = enlaces.map(e => {
    const url = e.wa ? waLink(e.mensaje) : (e.url || '#');
    const externo = /^https?:/i.test(url);
    return `
    <a class="enlace${e.destacado ? ' enlace--destacado' : ''}" href="${esc(url)}"
       data-categoria="${esc(e.categoria || '')}" data-enlace="${esc(e.id || '')}"
       ${externo ? 'target="_blank" rel="noopener"' : ''}>
      <span class="enlace__icono">${icono(e.icono)}</span>
      <span class="enlace__cuerpo">
        <span class="enlace__titulo">${esc(e.titulo)}${e.etiqueta ? `<span class="etiqueta">${esc(e.etiqueta)}</span>` : ''}</span>
        <span class="enlace__texto">${esc(e.texto || '')}</span>
        ${e.precio ? `<span class="enlace__precio">${esc(e.precio)}</span>` : ''}
      </span>
      <span class="enlace__flecha">${icono('flecha')}</span>
    </a>`;
  }).join('');

  lista.addEventListener('click', (ev) => {
    const a = ev.target.closest('.enlace');
    if (a) registrarClic(a.dataset.enlace);
  });

  /* Brillo que sigue al puntero (solo con ratón) */
  if (window.matchMedia('(pointer: fine)').matches && !reduce) {
    lista.addEventListener('pointermove', (ev) => {
      const a = ev.target.closest('.enlace');
      if (!a) return;
      const r = a.getBoundingClientRect();
      a.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      a.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  }

  /* ── Filtros por categoría ───────────────────────────────────────── */
  const cajaFiltros = $('#filtros');
  const usadas = new Set(enlaces.map(e => e.categoria));
  const cats = (CFG.categorias || []).filter(c => c.id === 'todos' || usadas.has(c.id));

  cajaFiltros.innerHTML = cats.map((c, i) => {
    const n = c.id === 'todos' ? enlaces.length : enlaces.filter(e => e.categoria === c.id).length;
    return `<button class="chip${i === 0 ? ' is-activo' : ''}" role="tab" aria-selected="${i === 0}"
             data-filtro="${esc(c.id)}">${esc(c.nombre)} <span style="opacity:.55">${n}</span></button>`;
  }).join('');

  cajaFiltros.addEventListener('click', (ev) => {
    const chip = ev.target.closest('.chip');
    if (!chip) return;
    const filtro = chip.dataset.filtro;
    $$('.chip', cajaFiltros).forEach(c => {
      const activo = c === chip;
      c.classList.toggle('is-activo', activo);
      c.setAttribute('aria-selected', activo);
    });
    let visibles = 0;
    $$('.enlace', lista).forEach(card => {
      const mostrar = filtro === 'todos' || card.dataset.categoria === filtro;
      card.classList.toggle('is-oculto', !mostrar);
      if (mostrar) {
        visibles++;
        if (!reduce) {
          card.classList.remove('is-entrando');
          void card.offsetWidth;                       // reinicia la animación
          card.classList.add('is-entrando');
        }
      }
    });
    $('#sinResultados').hidden = visibles > 0;
  });

  /* ── Galería de Instagram ────────────────────────────────────────── */
  const galeria = $('#listaGaleria');
  let fotos = [];

  const normaliza = (datos) => {
    const arr = Array.isArray(datos) ? datos
      : (datos.publicaciones || datos.posts || datos.data || datos.media || []);
    return arr.map(p => ({
      img:   p.img || p.mediaUrl || p.media_url || p.thumbnailUrl || p.thumbnail_url || '',
      alt:   p.alt || 'Publicación de @' + (ig.usuario || 'indalodive'),
      texto: p.texto || p.caption || '',
      url:   p.url || p.permalink || igUrl
    })).filter(p => p.img);
  };

  const pintarGaleria = () => {
    galeria.innerHTML = fotos.map((f, i) => `
      <button class="foto" data-i="${i}" aria-label="Ampliar foto ${i + 1}">
        <img src="${esc(f.img)}" alt="${esc(f.alt)}" loading="lazy" decoding="async" width="900" height="1125">
        <span class="foto__capa"><span>${esc((f.texto || '').slice(0, 90))}</span></span>
      </button>`).join('');
  };

  const notaGaleria = () => {
    const nota = $('#galeriaNota');
    if (FEED.fuente === 'instagram' && FEED.actualizado) {
      nota.textContent = 'Actualizado el ' + FEED.actualizado;
    } else if (FEED.fuente !== 'instagram') {
      nota.textContent = 'Imágenes provisionales · pendiente de conectar el perfil';
    }
  };

  fotos = normaliza(FEED);
  pintarGaleria();
  notaGaleria();

  /* Si hay un servicio de feed configurado, se pide en vivo y sustituye
     a las fotos guardadas en feed.js. */
  if (ig.feedJson) {
    fetch(ig.feedJson, { mode: 'cors' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(datos => {
        const frescas = normaliza(datos);
        if (!frescas.length) return;
        fotos = frescas.slice(0, 12);
        pintarGaleria();
        $('#galeriaNota').textContent = 'Directo desde Instagram';
      })
      .catch(() => { /* si falla, se quedan las fotos guardadas */ });
  }

  /* ── Sobre ───────────────────────────────────────────────────────── */
  const sobre = CFG.sobre || {};
  if (sobre.titulo) $('#sobreTitulo').textContent = sobre.titulo;
  if (sobre.texto)  $('#sobreTexto').textContent  = sobre.texto;
  $('#sobrePuntos').innerHTML = (sobre.puntos || []).map(p => `<li>${esc(p)}</li>`).join('');

  /* ── Contacto y pie ──────────────────────────────────────────────── */
  $('#ctaWhatsapp').href = waLink('¡Hola ' + (CFG.marca || '') + '! Vengo de la web 🤿');
  const email = $('#ctaEmail');
  if (CFG.email) {
    email.href = 'mailto:' + CFG.email;
    $('#ctaEmailTexto').textContent = CFG.email;
  } else {
    email.hidden = true;
  }
  $('#datoUbicacion').textContent = CFG.ubicacion || '';
  const tel = $('#datoTelefono');
  if (CFG.telefonoBonito) {
    tel.textContent = CFG.telefonoBonito;
    tel.href = 'tel:' + (CFG.telefonoBonito || '').replace(/\s/g, '');
  } else { tel.hidden = true; }
  const mapa = $('#datoMapa');
  if (CFG.mapaUrl) mapa.href = CFG.mapaUrl; else mapa.hidden = true;

  $('#redes').innerHTML = [
    { url: igUrl, icono: 'instagram', nombre: 'Instagram' },
    { url: waLink('¡Hola! Vengo de la web 🤿'), icono: 'whatsapp', nombre: 'WhatsApp' },
    CFG.email ? { url: 'mailto:' + CFG.email, icono: 'correo', nombre: 'Correo' } : null
  ].filter(Boolean).map(r =>
    `<a href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="${esc(r.nombre)}">${icono(r.icono)}</a>`
  ).join('');

  /* ── Compartir la página ─────────────────────────────────────────── */
  const btnCompartir = $('#ctaCompartir');
  btnCompartir.addEventListener('click', async () => {
    const datos = { title: CFG.marca || document.title, text: CFG.claim || '', url: location.href };
    try {
      if (navigator.share) { await navigator.share(datos); return; }
      await navigator.clipboard.writeText(location.href);
    } catch (e) { return; }
    const original = btnCompartir.innerHTML;
    btnCompartir.innerHTML = '¡Enlace copiado!';
    setTimeout(() => { btnCompartir.innerHTML = original; }, 1800);
  });

  /* ── Menú móvil ──────────────────────────────────────────────────── */
  const toggle = $('#navToggle'), links = $('#navLinks');
  toggle.addEventListener('click', () => {
    const abierto = links.classList.toggle('is-abierto');
    toggle.setAttribute('aria-expanded', abierto);
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  links.addEventListener('click', (ev) => {
    if (ev.target.tagName !== 'A') return;
    links.classList.remove('is-abierto');
    toggle.setAttribute('aria-expanded', 'false');
  });

  /* ── Descenso: cabecera, profundidad y medidor ───────────────────── */
  const header = $('#header'), medidor = $('#medidor'), valor = $('#medidorValor');
  const maxProf = CFG.profundidadMax || 40;
  let ultimoY = 0, pendiente = false;

  const alScroll = () => {
    const y = window.scrollY;
    const alcance = document.documentElement.scrollHeight - window.innerHeight;
    const prof = alcance > 0 ? Math.min(1, Math.max(0, y / alcance)) : 0;

    document.documentElement.style.setProperty('--prof', prof.toFixed(4));
    valor.textContent = Math.round(prof * maxProf) + ' m';
    medidor.classList.toggle('is-visible', y > window.innerHeight * 0.5);

    header.classList.toggle('is-fija', y > 12);
    header.classList.toggle('is-oculta', y > 320 && y > ultimoY && !links.classList.contains('is-abierto'));
    ultimoY = y;
    pendiente = false;
  };

  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(alScroll);
  }, { passive: true });
  alScroll();

  /* ── Enlace activo del menú ──────────────────────────────────────── */
  const secciones = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const espia = new IntersectionObserver((entradas) => {
      entradas.forEach(e => {
        if (!e.isIntersecting) return;
        $$('#navLinks a').forEach(a =>
          a.classList.toggle('is-activo', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secciones.forEach(s => espia.observe(s));

    /* ── Revelado al entrar en pantalla ────────────────────────────── */
    const revelador = new IntersectionObserver((entradas, obs) => {
      entradas.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.revelar').forEach(el => revelador.observe(el));
  } else {
    $$('.revelar').forEach(el => el.classList.add('is-visible'));
  }

  /* ── Visor de fotos ──────────────────────────────────────────────── */
  const visor = $('#visor'), visorImg = $('#visorImg'), visorPie = $('#visorPie'),
        contador = $('#visorContador');
  let indice = 0, ultimoFoco = null;

  const mostrar = (i) => {
    indice = (i + fotos.length) % fotos.length;
    const f = fotos[indice];
    visorImg.src = f.img;
    visorImg.alt = f.alt;
    visorPie.innerHTML = (f.texto ? esc(f.texto) + ' · ' : '') +
      `<a href="${esc(f.url)}" target="_blank" rel="noopener" style="color:var(--aqua-claro)">ver en Instagram</a>`;
    contador.textContent = (indice + 1) + ' / ' + fotos.length;
  };

  const abrir = (i) => {
    ultimoFoco = document.activeElement;
    mostrar(i);
    visor.classList.add('is-abierto');
    document.body.classList.add('is-bloqueado');
    $('#visorCerrar').focus();
  };

  const cerrar = () => {
    visor.classList.remove('is-abierto');
    document.body.classList.remove('is-bloqueado');
    if (ultimoFoco) ultimoFoco.focus();
  };

  galeria.addEventListener('click', (ev) => {
    const f = ev.target.closest('.foto');
    if (f) abrir(Number(f.dataset.i));
  });
  $('#visorCerrar').addEventListener('click', cerrar);
  $('#visorPrev').addEventListener('click', () => mostrar(indice - 1));
  $('#visorSig').addEventListener('click', () => mostrar(indice + 1));
  visor.addEventListener('click', (ev) => { if (ev.target === visor) cerrar(); });
  document.addEventListener('keydown', (ev) => {
    if (!visor.classList.contains('is-abierto')) return;
    if (ev.key === 'Escape') cerrar();
    if (ev.key === 'ArrowLeft') mostrar(indice - 1);
    if (ev.key === 'ArrowRight') mostrar(indice + 1);
  });

  /* Deslizar con el dedo */
  let inicioX = null;
  visor.addEventListener('pointerdown', (ev) => { inicioX = ev.clientX; });
  visor.addEventListener('pointerup', (ev) => {
    if (inicioX === null) return;
    const d = ev.clientX - inicioX;
    if (Math.abs(d) > 45) mostrar(indice + (d < 0 ? 1 : -1));
    inicioX = null;
  });

  /* ── Burbujas de fondo ───────────────────────────────────────────── */
  const lienzo = $('#burbujas');
  if (lienzo && !reduce) {
    const ctx = lienzo.getContext('2d');
    let ancho = 0, alto = 0, burbujas = [], animando = true;

    const crear = () => {
      const cuantas = Math.round(Math.min(46, Math.max(14, ancho / 34)));
      burbujas = Array.from({ length: cuantas }, () => ({
        x: Math.random() * ancho,
        y: Math.random() * alto,
        r: 1 + Math.random() * 3.4,
        v: .18 + Math.random() * .55,
        vaiven: Math.random() * Math.PI * 2,
        alfa: .12 + Math.random() * .3
      }));
    };

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = window.innerWidth; alto = window.innerHeight;
      lienzo.width = ancho * dpr; lienzo.height = alto * dpr;
      lienzo.style.width = ancho + 'px'; lienzo.style.height = alto + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      crear();
    };

    const pintar = () => {
      if (!animando) return;
      ctx.clearRect(0, 0, ancho, alto);
      burbujas.forEach(b => {
        b.y -= b.v;
        b.vaiven += .012;
        const x = b.x + Math.sin(b.vaiven) * 12;
        if (b.y + b.r < 0) { b.y = alto + b.r; b.x = Math.random() * ancho; }
        ctx.beginPath();
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(210,250,255,' + b.alfa + ')';
        ctx.fill();
      });
      requestAnimationFrame(pintar);
    };

    let temporizador;
    window.addEventListener('resize', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(medir, 180);
    });
    document.addEventListener('visibilitychange', () => {
      animando = !document.hidden;
      if (animando) requestAnimationFrame(pintar);
    });
    medir();
    requestAnimationFrame(pintar);
  }

  /* ── Recordatorio de configuración (solo en pruebas locales) ─────── */
  const local = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const sinConfigurar = enlaces.filter(e => !e.wa && (!e.url || e.url === '#')).length;
  if (local && sinConfigurar) {
    const caja = document.createElement('div');
    caja.className = 'aviso-dev';
    caja.innerHTML = `<button aria-label="Cerrar aviso">✕</button>⚠️ ${sinConfigurar} enlace(s) todavía apuntan a «#».
      Ponlos en <code>assets/js/config.js</code> antes de publicar.`;
    caja.querySelector('button').addEventListener('click', () => caja.remove());
    document.body.appendChild(caja);
  }
})();
