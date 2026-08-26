/* =====================================================================
   MAGI — asistente virtual de Magia Fit Almería
   Bot 100 % local (sin servidor): entiende por palabras clave, responde
   dudas frecuentes (tarifas, horarios, prueba, ubicación…) y siempre
   empuja hacia agendar la llamada o abrir WhatsApp.
   ===================================================================== */
(function () {
  'use strict';
  const CFG = window.MAGIAFIT || {};
  const $ = s => document.querySelector(s);
  const wa = m => (window.MF_waLink ? window.MF_waLink(m)
    : 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(m));

  const bot   = $('#bot');
  const fab   = $('#botFab');
  const panel = $('#botPanel');
  const log   = $('#botLog');
  const quick = $('#botQuick');
  const form  = $('#botForm');
  const input = $('#botInput');
  const badge = $('#botBadge');
  const minBt = $('#botMin');
  if (!bot || !panel) return;

  const eur = n => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: (n % 1 ? 2 : 0) });
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u00bf?\u00a1!.,;:]/g, ' ');

  const waBtn = (txt, msg) =>
    `<a href="${wa(msg)}" target="_blank" rel="noopener">${txt}</a>`;

  /* ── Respuestas ──────────────────────────────────────────── */
  const tarifasTexto = () => (CFG.tarifas || []).map(p =>
    `<li><b>${p.nombre}</b> · ${eur(p.mensual)}/mes — ${p.resumen}</li>`).join('');

  const INTENTS = [
    {
      id: 'saludo',
      keys: ['hola', 'buenas', 'hey', 'saludos', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal'],
      reply: () => `¡Hola! 👋 Soy <b>MAGI</b>, el asistente de Magia Fit Almería.<br>Puedo resolverte dudas de <b>tarifas, horarios, entrenador personal, lesiones o clase de prueba</b>. ¿Qué te cuento?`
    },
    {
      id: 'precio',
      keys: ['precio', 'precios', 'tarifa', 'tarifas', 'cuota', 'cuanto cuesta', 'cuanto vale', 'coste', 'cuesta', 'vale', 'pagar', 'mensualidad', 'euros', 'barato', 'caro', 'presupuesto'],
      reply: () => `Estas son nuestras tarifas mensuales 💳<ul>${tarifasTexto()}</ul>
        Con <b>trimestral</b> o <b>anual</b> sale bastante más económico (el anual te ahorra unos 2 meses).<br>
        ${CFG.extras.matricula} ${CFG.extras.permanencia}<br><br>
        👉 <a href="#tarifas">Ver el detalle de los planes</a> · ${waBtn('Preguntar por WhatsApp', 'Hola, quiero información detallada de las tarifas de Magia Fit 💪')}`
    },
    {
      id: 'plan-elite',
      keys: ['entrenador personal', 'personal trainer', 'entrenamiento personal', 'elite', '1 a 1', 'uno a uno', 'coach'],
      reply: () => {
        const e = (CFG.tarifas || []).find(p => p.id === 'elite') || {};
        return `El plan <b>ÉLITE</b> es entrenamiento personal 1 a 1 (${eur(e.mensual || 0)}/mes) e incluye:<ul>${(e.incluye || []).map(i => `<li>${i}</li>`).join('')}</ul>
        Es el plan con el que más rápido se ven cambios. ¿Te reservo una llamada para valorarlo? <a href="#agenda">Agendar llamada</a>`;
      }
    },
    {
      id: 'horario',
      keys: ['horario', 'horarios', 'abris', 'abren', 'abierto', 'cierran', 'cierre', 'hora', 'domingo', 'sabado', 'festivo'],
      reply: () => `Nuestro horario es:<br>🕖 <b>${CFG.horario.texto}</b><br><br>Si necesitas entrenar fuera de esa franja, dínoslo y buscamos hueco: ${waBtn('escríbenos', 'Hola, quiero entrenar fuera del horario habitual, ¿es posible?')}`
    },
    {
      id: 'ubicacion',
      keys: ['donde', 'direccion', 'ubicacion', 'sitio', 'localizacion', 'mapa', 'como llego', 'zona', 'calle', 'almeria', 'aparcar', 'parking'],
      reply: () => `Estamos en <b>${CFG.ciudad}</b> 📍 y entrenan con nosotros socios de ${CFG.zonas.slice(0, 4).join(', ')} y alrededores.<br>
        <a href="${CFG.mapaUrl}" target="_blank" rel="noopener">Abrir en Google Maps</a><br><br>
        ¿Quieres que te pasemos la dirección exacta y te enseñemos las instalaciones? ${waBtn('Sí, mándamela', 'Hola, ¿me pasáis la dirección exacta del gimnasio en Almería?')}`
    },
    {
      id: 'prueba',
      keys: ['prueba', 'probar', 'gratis', 'gratuita', 'primera clase', 'visita', 'conocer', 'ver el gimnasio', 'sin compromiso'],
      reply: () => `Sí 🎁 <b>${CFG.extras.prueba}</b><br>Analizamos tu punto de partida, te enseñamos las instalaciones y te contamos cómo sería tu plan. Sin compromiso.<br><br>
        👉 <a href="#agenda">Reservar mi sesión gratuita</a> o ${waBtn('reservarla por WhatsApp', 'Hola, quiero reservar la sesión de valoración gratuita 🎁')}`
    },
    {
      id: 'permanencia',
      keys: ['permanencia', 'matricula', 'darme de baja', 'baja', 'contrato', 'cancelar', 'compromiso', 'letra pequena'],
      reply: () => `Tranquilo: <b>${CFG.extras.permanencia}</b> ${CFG.extras.matricula}<br>Puedes darte de baja avisando antes de la siguiente renovación, sin penalizaciones.`
    },
    {
      id: 'pago',
      keys: ['pago', 'pagar con', 'tarjeta', 'bizum', 'efectivo', 'domiciliacion', 'transferencia', 'financiar'],
      reply: () => `${CFG.extras.pago} 💳 Si necesitas fraccionar el plan anual, coméntanoslo y lo vemos: ${waBtn('hablar de formas de pago', 'Hola, tengo una duda sobre las formas de pago')}`
    },
    {
      id: 'adelgazar',
      keys: ['adelgazar', 'perder peso', 'perder grasa', 'bajar peso', 'definir', 'definicion', 'barriga', 'michelines', 'kilos'],
      reply: () => `Es nuestro objetivo más trabajado 🔥 Entrenamiento de fuerza, trabajo cardiovascular y un plan que se ajusta cada mes.<br>
        La mayoría de socios nota cambios de energía en 3-4 semanas y cambios visibles entre la semana 8 y la 12.<br><br>
        Mira las <a href="#transformaciones">transformaciones reales</a> y ${waBtn('cuéntanos tu caso', 'Hola, mi objetivo es perder grasa. ¿Cómo empezamos?')}`
    },
    {
      id: 'musculo',
      keys: ['masa muscular', 'ganar musculo', 'volumen', 'hipertrofia', 'fuerza', 'musculacion', 'engordar'],
      reply: () => `Para <b>ganar masa muscular</b> trabajamos progresión de cargas y técnica corregida sesión a sesión, midiendo el avance cada mes 💪<br>
        El plan <b>MAGIA</b> suele ser el ideal para esto. <a href="#tarifas">Ver planes</a>`
    },
    {
      id: 'principiante',
      keys: ['principiante', 'nunca he', 'empezar de cero', 'no se por donde', 'vergüenza', 'verguenza', 'novato', 'primera vez'],
      reply: () => `Empezar de cero es lo más normal del mundo 🙌 De hecho, es cuando más rápido se progresa.<br>
        Empezamos por técnica y cargas suaves, con un coach al lado corrigiendo cada movimiento. Aquí nadie mira a nadie.<br><br>
        ¿Damos el primer paso? <a href="#agenda">Agendar llamada gratuita</a>`
    },
    {
      id: 'lesion',
      keys: ['lesion', 'lesionado', 'rodilla', 'espalda', 'hombro', 'hernia', 'dolor', 'operado', 'rehabilitacion'],
      reply: () => `Trabajamos con adaptaciones para lesiones y molestias, siempre respetando lo que te haya indicado tu médico o fisio 🩺<br>
        Cuéntale tu caso a un coach y te dirá exactamente qué podemos hacer: ${waBtn('explicar mi caso', 'Hola, tengo una lesión y quiero saber si puedo entrenar con vosotros')}`
    },
    {
      id: 'online',
      keys: ['online', 'a distancia', 'fuera de almeria', 'desde casa', 'viajo', 'remoto'],
      reply: () => `Sí ✅ Tenemos <b>entrenamiento online</b>: plan personalizado, revisión de técnica por vídeo y seguimiento periódico. Ideal si vives fuera de Almería o viajas mucho.<br><br>
        ${waBtn('Quiero info del plan online', 'Hola, me interesa el entrenamiento online de Magia Fit')}`
    },
    {
      id: 'clases',
      keys: ['clases', 'clase dirigida', 'dirigidas', 'hiit', 'grupo', 'colectivas', 'spinning', 'funcional'],
      reply: () => `Tenemos <b>clases dirigidas</b> de fuerza, HIIT, movilidad y core en grupos reducidos (para no perder la técnica) ⚡<br>
        Están incluidas de forma ilimitada en los planes MAGIA y ÉLITE. <a href="#tarifas">Ver planes</a>`
    },
    {
      id: 'resenas',
      keys: ['resenas', 'resena', 'opiniones', 'opinion', 'valoracion', 'valoraciones', 'estrellas', 'google', 'fiable', 'confianza', 'referencias'],
      reply: () => `Tenemos <b>${CFG.google.nota} estrellas</b> de media con <b>${CFG.google.resenas} reseñas</b> en Google ⭐<br>
        Son de socios reales, puedes leerlas todas antes de decidirte.<br><br>
        ¿Quieres ser el siguiente? <a href="#agenda">Agendar llamada gratuita</a>`
    },
    {
      id: 'transformaciones',
      keys: ['transformacion', 'transformaciones', 'resultados', 'antes y despues', 'fotos', 'testimonios', 'funciona'],
      reply: () => `Puedes ver transformaciones reales de socios en la <a href="#transformaciones">sección de transformaciones</a> y en nuestro Instagram <a href="${CFG.instagramUrl}" target="_blank" rel="noopener">@${CFG.instagram}</a> 📸<br><br>
        La siguiente puede ser la tuya: <a href="#agenda">agendar llamada</a>`
    },
    {
      id: 'instagram',
      keys: ['instagram', 'insta', 'redes', 'facebook', 'tiktok', 'perfil'],
      reply: () => `Súbenos el ánimo por aquí 👉 <a href="${CFG.instagramUrl}" target="_blank" rel="noopener">@${CFG.instagram}</a> — publicamos entrenos, motivación diaria y transformaciones reales.`
    },
    {
      id: 'contacto',
      keys: ['telefono', 'llamar', 'whatsapp', 'contacto', 'hablar con', 'persona', 'humano', 'asesor', 'email', 'correo'],
      reply: () => `Claro, te paso con el equipo 📞<br>WhatsApp / teléfono: <b>${CFG.telefonoBonito}</b><br>Email: <a href="mailto:${CFG.email}">${CFG.email}</a><br><br>
        ${waBtn('Abrir WhatsApp ahora', 'Hola, quiero hablar con una persona del equipo de Magia Fit 🙋')}`
    },
    {
      id: 'cita',
      keys: ['cita', 'agendar', 'reservar', 'llamada', 'apuntarme', 'inscribirme', 'quiero empezar', 'me apunto', 'alta'],
      reply: () => `¡Vamos allá! 🚀 Puedes reservar tu <b>llamada gratuita de 15 minutos</b> en dos clics:<br><br>
        👉 <a href="#agenda">Rellenar el formulario de agenda</a><br>
        👉 ${waBtn('O escribirnos directamente por WhatsApp', 'Hola, quiero agendar una llamada con Magia Fit Almería 📞')}`
    },
    {
      id: 'edad',
      keys: ['edad', 'anos', 'mayor', 'menor', 'adolescente', 'jubilado', 'mujer', 'hombre'],
      reply: () => `Entrenamos con gente de todas las edades y niveles. Adaptamos cargas y ejercicios a cada persona.<br>Cuéntanos tu caso concreto y te decimos cómo lo enfocaríamos: <a href="#agenda">agendar llamada</a>`
    },
    {
      id: 'gracias',
      keys: ['gracias', 'genial', 'perfecto', 'vale', 'ok', 'estupendo'],
      reply: () => `¡A ti! 🙌 Si quieres dar el paso, lo más rápido es <a href="#agenda">agendar tu llamada gratuita</a> o ${waBtn('escribirnos por WhatsApp', 'Hola, quiero empezar en Magia Fit 💪')}.`
    },
    {
      id: 'despedida',
      keys: ['adios', 'hasta luego', 'chao', 'nos vemos'],
      reply: () => `¡Nos vemos en el gimnasio! 💪 Recuerda: <i>el mejor momento para empezar era ayer; el segundo mejor es hoy.</i>`
    }
  ];

  const FALLBACK = () => `Esa no me la sé todavía 🤔 pero el equipo te la resuelve en un minuto.<br><br>
    ${waBtn('Preguntar por WhatsApp', 'Hola, tengo una duda sobre Magia Fit Almería')} · <a href="#agenda">Agendar llamada</a><br><br>
    También puedo ayudarte con: <b>tarifas</b>, <b>horarios</b>, <b>clase de prueba</b>, <b>entrenador personal</b>, <b>lesiones</b> o <b>ubicación</b>.`;

  function match(text) {
    const t = ' ' + norm(text) + ' ';
    let best = null, bestScore = 0;
    INTENTS.forEach(it => {
      let score = 0;
      it.keys.forEach(k => { if (t.includes(' ' + norm(k)) || t.includes(norm(k) + ' ')) score += norm(k).split(' ').length; });
      if (score > bestScore) { bestScore = score; best = it; }
    });
    return bestScore > 0 ? best : null;
  }

  /* ── Interfaz ────────────────────────────────────────────── */
  function bubble(html, who) {
    const d = document.createElement('div');
    d.className = 'msg msg--' + who;
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function typing() {
    const d = document.createElement('div');
    d.className = 'typing';
    d.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function botSay(html, delay) {
    const t = typing();
    setTimeout(() => { t.remove(); bubble(html, 'bot'); }, delay || (500 + Math.min(html.length * 4, 900)));
  }

  const QUICKS = [
    { t: '💳 Tarifas',        q: '¿Cuáles son las tarifas?' },
    { t: '🎁 Clase de prueba', q: '¿Puedo probar gratis?' },
    { t: '🕖 Horarios',        q: '¿Qué horario tenéis?' },
    { t: '🔥 Perder grasa',    q: 'Quiero perder grasa' },
    { t: '💪 Entrenador personal', q: 'Info del entrenador personal' },
    { t: '⭐ Reseñas',          q: '¿Qué valoración tenéis?' },
    { t: '📍 Dónde estáis',    q: '¿Dónde estáis?' },
    { t: '📞 Agendar llamada', q: 'Quiero agendar una llamada' }
  ];

  function renderQuicks() {
    quick.innerHTML = QUICKS.map(q => `<button type="button" data-q="${q.q}">${q.t}</button>`).join('') +
      `<button type="button" class="is-wa" data-open-wa="1">💬 WhatsApp</button>`;
  }

  quick.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.openWa) {
      window.open(wa('Hola, vengo del chat de la web de Magia Fit 💪'), '_blank', 'noopener');
      return;
    }
    send(b.dataset.q);
  });

  let turnos = 0;
  function send(text) {
    if (!text || !text.trim()) return;
    bubble(text.replace(/</g, '&lt;'), 'me');
    input.value = '';
    turnos++;
    const it = match(text);
    botSay(it ? it.reply() : FALLBACK());
    // Empujón al objetivo: tras varias preguntas, recordamos el CTA
    if (turnos === 3) {
      setTimeout(() => botSay(`Por cierto, la forma más rápida de resolverlo todo es una <b>llamada de 15 minutos</b> 📞<br><a href="#agenda">Agendar ahora</a> · ${waBtn('o WhatsApp', 'Hola, quiero agendar mi llamada gratuita 📞')}`), 2200);
    }
  }

  form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });

  /* ── Apertura / cierre ───────────────────────────────────── */
  let started = false;
  function open() {
    bot.classList.add('is-open');
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    if (badge) badge.hidden = true;
    if (!started) {
      started = true;
      renderQuicks();
      botSay(`¡Hola! 👋 Soy <b>MAGI</b>, el asistente de <b>Magia Fit Almería</b>.<br>Resuelvo dudas de tarifas, horarios, clase de prueba, lesiones… y te ayudo a agendar tu llamada gratuita.`, 500);
      setTimeout(() => { if (!turnos) botSay('¿Por dónde empezamos? Puedes tocar una de las opciones de abajo 👇', 500); }, 1500);
    }
    setTimeout(() => input.focus(), 300);
  }
  function close() {
    bot.classList.remove('is-open');
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
  }
  fab.addEventListener('click', () => (bot.classList.contains('is-open') ? close() : open()));
  minBt.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && bot.classList.contains('is-open')) close(); });

  // Enlaces internos dentro del chat: cierran el panel y navegan
  log.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a) close();
  });

  // Invitación automática la primera vez (una por sesión)
  try {
    if (!sessionStorage.getItem('magi_seen')) {
      setTimeout(() => {
        if (!bot.classList.contains('is-open') && badge) badge.hidden = false;
        sessionStorage.setItem('magi_seen', '1');
      }, 6000);
    } else if (badge) { badge.hidden = true; }
  } catch (_) { /* sessionStorage bloqueado: sin problema */ }
})();
