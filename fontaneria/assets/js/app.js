/* ==========================================================================
   Fontanería Macael · Interfaz
   ========================================================================== */
(function () {
  'use strict';

  var D = window.Datos;
  var d = D.cargar();
  var vista = 'panel';
  var editor = null;   // documento abierto en el editor

  /* ── utilidades de DOM ──────────────────────────────────────────────── */

  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var ICONOS = {
    panel: '<path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/>',
    presupuesto: '<path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm8 1.5V8h4.5M8 13h8M8 17h5"/>',
    factura: '<path d="M5 2h14v20l-3-2-3 2-3-2-3 2V2Zm3 6h8M8 12h8M8 16h5"/>',
    cliente: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0"/>',
    tarifa: '<path d="M3 7h18M3 12h18M3 17h18M7 3v18"/>',
    ajustes: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="m19.4 15-.6 1a2 2 0 0 1-2.4.9l-1-.4a7.7 7.7 0 0 1-1.7 1l-.2 1a2 2 0 0 1-2 1.6h-1.1a2 2 0 0 1-2-1.6l-.2-1a7.7 7.7 0 0 1-1.7-1l-1 .4a2 2 0 0 1-2.4-.9l-.6-1a2 2 0 0 1 .5-2.5l.8-.6a7.6 7.6 0 0 1 0-2l-.8-.6A2 2 0 0 1 4.6 8l.6-1a2 2 0 0 1 2.4-.9l1 .4a7.7 7.7 0 0 1 1.7-1l.2-1A2 2 0 0 1 12.5 3h1.1a2 2 0 0 1 2 1.6l.2 1c.6.2 1.2.6 1.7 1l1-.4a2 2 0 0 1 2.4.9l.6 1a2 2 0 0 1-.5 2.5l-.8.6a7.6 7.6 0 0 1 0 2l.8.6a2 2 0 0 1 .5 2.5Z"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    imprimir: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z"/>',
    llave: '<path d="M14.7 6.3a4 4 0 1 0 3 3l-6.1 6.1-1.9-.4-.4-1.9 6.1-6.1ZM9.3 14.7 3 21"/>',
    vacio: '<path d="M4 5h16v14H4z"/><path d="M4 9h16"/>'
  };

  function icono(n, cls) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (cls ? ' class="' + cls + '"' : '') + '>' + (ICONOS[n] || '') + '</svg>';
  }

  var brindisTimer = null;
  function brindis(msg) {
    var el = $('#brindis');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(brindisTimer);
    brindisTimer = setTimeout(function () { el.classList.remove('visible'); }, 2600);
  }

  function guardar() { D.guardar(); }

  /* ── modal ──────────────────────────────────────────────────────────── */

  function abrirModal(op) {
    var fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML =
      '<div class="modal' + (op.ancho ? ' modal--ancho' : '') + '" role="dialog" aria-modal="true">' +
        '<div class="modal__cab"><h2>' + esc(op.titulo) + '</h2>' +
          '<button class="btn btn--fantasma cerrar" data-cerrar type="button" aria-label="Cerrar">✕</button></div>' +
        '<div class="modal__cuerpo">' + op.cuerpo + '</div>' +
        (op.pie ? '<div class="modal__pie">' + op.pie + '</div>' : '') +
      '</div>';
    document.body.appendChild(fondo);
    document.body.classList.add('modal-abierto');
    fondo.addEventListener('mousedown', function (e) {
      if (e.target === fondo && op.cerrarFuera !== false) cerrarModal();
    });
    fondo.addEventListener('click', function (e) {
      if (e.target.closest('[data-cerrar]')) cerrarModal();
    });
    var primer = fondo.querySelector('input, select, textarea');
    if (primer && !op.sinFoco) setTimeout(function () { primer.focus(); }, 30);
    return fondo;
  }

  /* Cierra la ventana superior; las de debajo (por ejemplo el editor) siguen ahí. */
  function cerrarModal() {
    var todas = $$('.modal-fondo');
    if (todas.length) todas[todas.length - 1].remove();
    if (!$('.modal-fondo')) document.body.classList.remove('modal-abierto');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    cerrarModal();
    if (editor && !$('#editorCuerpo')) { editor = null; render(); }
  });

  function confirmar(texto, alAceptar, textoBoton) {
    var fondo = abrirModal({
      titulo: 'Confirmar',
      cuerpo: '<p>' + esc(texto) + '</p>',
      pie: '<button class="btn" data-cerrar type="button">Cancelar</button>' +
           '<button class="btn btn--peligro" id="btnConfirmar" type="button">' + esc(textoBoton || 'Eliminar') + '</button>'
    });
    fondo.querySelector('#btnConfirmar').addEventListener('click', function () { cerrarModal(); alAceptar(); });
  }

  /* ── datos auxiliares ───────────────────────────────────────────────── */

  function cliente(idc) {
    return d.clientes.filter(function (c) { return c.id === idc; })[0] || null;
  }
  function nombreCliente(idc) {
    var c = cliente(idc);
    return c ? c.nombre : 'Sin cliente';
  }
  function porFechaDesc(a, b) {
    return (b.fecha || '').localeCompare(a.fecha || '') || (b.numero || '').localeCompare(a.numero || '');
  }
  function opcionesClientes(sel) {
    return '<option value="">— Selecciona un cliente —</option>' +
      d.clientes.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); })
        .map(function (c) {
          return '<option value="' + c.id + '"' + (c.id === sel ? ' selected' : '') + '>' + esc(c.nombre) + '</option>';
        }).join('');
  }
  function opcionesUnidad(sel) {
    var us = ['ud', 'ml', 'm2', 'm3', 'h', 'jornada', 'kg', 'l', 'pa'];
    if (sel && us.indexOf(sel) === -1) us.push(sel);
    return us.map(function (u) {
      return '<option value="' + esc(u) + '"' + (u === sel ? ' selected' : '') + '>' + esc(u) + '</option>';
    }).join('');
  }
  function etiqueta(estado) {
    var textos = {
      borrador: 'Borrador', enviado: 'Enviado', aceptado: 'Aceptado', rechazado: 'Rechazado',
      facturado: 'Facturado', emitida: 'Emitida', cobrada: 'Cobrada', vencida: 'Vencida'
    };
    return '<span class="etiqueta et-' + esc(estado) + '">' + esc(textos[estado] || estado) + '</span>';
  }
  function anioActual() { return new Date().getFullYear(); }

  /* ── estructura general ─────────────────────────────────────────────── */

  var SECCIONES = [
    { id: 'panel', et: 'Panel', ic: 'panel' },
    { id: 'presupuestos', et: 'Presupuestos', ic: 'presupuesto' },
    { id: 'facturas', et: 'Facturas', ic: 'factura' },
    { id: 'clientes', et: 'Clientes', ic: 'cliente' },
    { id: 'tarifas', et: 'Tarifa de precios', ic: 'tarifa' },
    { id: 'ajustes', et: 'Ajustes', ic: 'ajustes' }
  ];

  function pintarMenu() {
    $('#menu').innerHTML = SECCIONES.map(function (s) {
      var n = s.id === 'presupuestos' ? d.presupuestos.length
            : s.id === 'facturas' ? d.facturas.length
            : s.id === 'clientes' ? d.clientes.length
            : s.id === 'tarifas' ? d.tarifas.length : null;
      return '<button type="button" data-vista="' + s.id + '"' +
        (vista === s.id ? ' aria-current="true"' : '') + '>' + icono(s.ic) +
        '<span>' + s.et + '</span>' + (n ? '<span class="contador">' + n + '</span>' : '') + '</button>';
    }).join('');
  }

  function ir(v) {
    vista = v;
    document.body.classList.remove('menu-abierto');
    if (location.hash.slice(1) !== v) location.hash = v;
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    pintarMenu();
    var f = {
      panel: vistaPanel, presupuestos: vistaPresupuestos, facturas: vistaFacturas,
      clientes: vistaClientes, tarifas: vistaTarifas, ajustes: vistaAjustes
    }[vista] || vistaPanel;
    $('#vista').innerHTML = f();
    if (typeof f.despues === 'function') f.despues();
  }

  function cabecera(titulo, sub, acciones) {
    return '<div class="cabecera"><div class="cabecera__txt"><h1>' + esc(titulo) + '</h1>' +
      (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' +
      (acciones ? '<div class="cabecera__acciones">' + acciones + '</div>' : '') + '</div>';
  }

  function sinDatos(texto, boton) {
    return '<div class="vacio">' + icono('vacio') + '<p>' + esc(texto) + '</p>' + (boton || '') + '</div>';
  }

  /* ── PANEL ──────────────────────────────────────────────────────────── */

  function vistaPanel() {
    var anio = anioActual();
    var facturasAnio = d.facturas.filter(function (f) {
      return f.estado !== 'borrador' && String(f.fecha).slice(0, 4) === String(anio);
    });
    var baseAnio = 0, ivaAnio = 0, pendiente = 0, vencido = 0, nVencidas = 0;
    facturasAnio.forEach(function (f) {
      var t = D.totales(f);
      baseAnio += t.base;
      ivaAnio += t.ivaTotal;
      if (t.pendiente > 0.009) {
        pendiente += t.pendiente;
        if (D.estadoFactura(f) === 'vencida') { vencido += t.pendiente; nVencidas++; }
      }
    });

    var abiertos = d.presupuestos.filter(function (p) { return p.estado === 'borrador' || p.estado === 'enviado'; });
    var importeAbiertos = abiertos.reduce(function (s, p) { return s + D.totales(p).total; }, 0);
    var aceptados = d.presupuestos.filter(function (p) { return p.estado === 'aceptado' && !p.facturaId; });

    var ultimas = d.facturas.slice().sort(porFechaDesc).slice(0, 6);
    var ultimosPres = d.presupuestos.slice().sort(porFechaDesc).slice(0, 6);

    var trimestre = Math.floor(new Date().getMonth() / 3) + 1;
    var ivaTrim = 0;
    facturasAnio.forEach(function (f) {
      var mes = parseInt(String(f.fecha).slice(5, 7), 10);
      if (Math.floor((mes - 1) / 3) + 1 === trimestre) ivaTrim += D.totales(f).ivaTotal;
    });

    var html = cabecera('Hola, ' + (d.empresa.nombre || 'Fontanería Macael'),
      'Resumen de ' + anio + '. Todo se guarda en este navegador; haz copia de seguridad de vez en cuando.',
      '<button class="btn btn--primario" data-accion="nuevo-presupuesto" type="button">' + icono('mas') + 'Nuevo presupuesto</button>' +
      '<button class="btn" data-accion="nueva-factura" type="button">' + icono('mas') + 'Nueva factura</button>');

    html += '<div class="rejilla">' +
      kpi('Facturado ' + anio + ' (base)', D.euros(baseAnio), facturasAnio.length + (facturasAnio.length === 1 ? ' factura emitida' : ' facturas emitidas')) +
      kpi('Pendiente de cobro', D.euros(pendiente), pendiente > 0 ? 'De facturas ya emitidas' : 'Todo al día', pendiente > 0 ? '' : 'kpi--ok') +
      kpi('Vencido', D.euros(vencido), nVencidas + (nVencidas === 1 ? ' factura fuera de plazo' : ' facturas fuera de plazo'), vencido > 0 ? 'kpi--alerta' : '') +
      kpi('Presupuestos abiertos', String(abiertos.length), D.euros(importeAbiertos) + ' en juego') +
      kpi('IVA repercutido ' + trimestre + 'T', D.euros(ivaTrim), 'Acumulado del año: ' + D.euros(ivaAnio)) +
      kpi('Aceptados sin facturar', String(aceptados.length), aceptados.length ? 'Conviértelos en factura' : 'Nada pendiente') +
    '</div>';

    html += '<div class="tarjeta"><div class="tarjeta__cab"><h2>Últimas facturas</h2>' +
      '<div class="der"><button class="btn btn--sm" data-vista="facturas" type="button">Ver todas</button></div></div>';
    html += ultimas.length ? tablaFacturas(ultimas) : sinDatos('Todavía no has emitido ninguna factura.',
      '<button class="btn btn--primario" data-accion="nueva-factura" type="button">Crear la primera</button>');
    html += '</div>';

    html += '<div class="tarjeta"><div class="tarjeta__cab"><h2>Últimos presupuestos</h2>' +
      '<div class="der"><button class="btn btn--sm" data-vista="presupuestos" type="button">Ver todos</button></div></div>';
    html += ultimosPres.length ? tablaPresupuestos(ultimosPres) : sinDatos('Aún no hay presupuestos. Pega tus mediciones y sale solo.',
      '<button class="btn btn--primario" data-accion="nuevo-presupuesto" type="button">Crear presupuesto</button>');
    html += '</div>';

    if (!d.empresa.nif) {
      html += '<div class="tarjeta"><div class="tarjeta__cuerpo"><div class="aviso">' +
        '<strong>Falta rellenar los datos fiscales.</strong> Una factura sin NIF, dirección y número de serie no es válida. ' +
        'Ve a <button class="btn btn--sm" data-vista="ajustes" type="button">Ajustes</button> y complétalos una sola vez.' +
        '</div></div></div>';
    }
    return html;
  }

  function kpi(et, val, pie, cls) {
    return '<div class="kpi ' + (cls || '') + '"><div class="kpi__et">' + esc(et) + '</div>' +
      '<div class="kpi__val">' + esc(val) + '</div>' +
      '<div class="kpi__pie">' + esc(pie || '') + '</div></div>';
  }

  /* ── LISTADOS ───────────────────────────────────────────────────────── */

  var filtroPres = { texto: '', estado: '' };
  var filtroFact = { texto: '', estado: '', anio: '' };

  function tablaPresupuestos(lista) {
    return '<div class="tabla-scroll"><table class="tabla"><thead><tr>' +
      '<th>Número</th><th>Fecha</th><th>Cliente</th><th>Obra</th><th>Estado</th>' +
      '<th class="num">Total</th><th></th></tr></thead><tbody>' +
      lista.map(function (p) {
        var t = D.totales(p);
        return '<tr class="pulsable" data-abrir-presupuesto="' + p.id + '">' +
          '<td class="mono">' + esc(p.numero) + '</td>' +
          '<td>' + D.fecha(p.fecha) + '</td>' +
          '<td>' + esc(nombreCliente(p.clienteId)) + '</td>' +
          '<td>' + esc(p.obra || '—') + '</td>' +
          '<td>' + etiqueta(p.facturaId ? 'facturado' : p.estado) + '</td>' +
          '<td class="num">' + D.euros(t.total) + '</td>' +
          '<td class="acciones"><button class="btn btn--fantasma btn--sm no-imprimir" type="button" ' +
            'data-imprimir-presupuesto="' + p.id + '" title="Ver e imprimir">' + icono('imprimir') + '</button></td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  function tablaFacturas(lista) {
    return '<div class="tabla-scroll"><table class="tabla"><thead><tr>' +
      '<th>Número</th><th>Fecha</th><th>Cliente</th><th>Vence</th><th>Estado</th>' +
      '<th class="num">Base</th><th class="num">Total</th><th class="num">Pendiente</th><th></th></tr></thead><tbody>' +
      lista.map(function (f) {
        var t = D.totales(f);
        var e = D.estadoFactura(f);
        return '<tr class="pulsable" data-abrir-factura="' + f.id + '">' +
          '<td class="mono">' + esc(f.numero || 'sin numerar') + '</td>' +
          '<td>' + D.fecha(f.fecha) + '</td>' +
          '<td>' + esc(nombreCliente(f.clienteId)) + '</td>' +
          '<td>' + (f.vencimiento ? D.fecha(f.vencimiento) : '—') + '</td>' +
          '<td>' + etiqueta(e) + '</td>' +
          '<td class="num">' + D.euros(t.base) + '</td>' +
          '<td class="num">' + D.euros(t.total) + '</td>' +
          '<td class="num">' + (t.pendiente > 0.009 ? D.euros(t.pendiente) : '—') + '</td>' +
          '<td class="acciones"><button class="btn btn--fantasma btn--sm no-imprimir" type="button" ' +
            'data-imprimir-factura="' + f.id + '" title="Ver e imprimir">' + icono('imprimir') + '</button></td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  function buscador(valor, ph) {
    return '<div class="busqueda">' + icono('buscar') +
      '<input type="search" id="buscador" value="' + esc(valor) + '" placeholder="' + esc(ph) + '" autocomplete="off"></div>';
  }

  function coincide(texto, filtro) {
    if (!filtro) return true;
    return String(texto || '').toLowerCase().indexOf(String(filtro).toLowerCase()) > -1;
  }

  function vistaPresupuestos() {
    var lista = d.presupuestos.slice().sort(porFechaDesc).filter(function (p) {
      var estado = p.facturaId ? 'facturado' : p.estado;
      if (filtroPres.estado && estado !== filtroPres.estado) return false;
      return coincide(p.numero, filtroPres.texto) || coincide(nombreCliente(p.clienteId), filtroPres.texto) ||
             coincide(p.obra, filtroPres.texto) ||
             (p.lineas || []).some(function (l) { return coincide(l.descripcion, filtroPres.texto); });
    });

    var html = cabecera('Presupuestos', 'Pega las mediciones, revisa los precios y envía.',
      '<button class="btn btn--primario" data-accion="nuevo-presupuesto" type="button">' + icono('mas') + 'Nuevo presupuesto</button>');

    html += '<div class="tarjeta"><div class="tarjeta__cab">' + buscador(filtroPres.texto, 'Buscar por número, cliente, obra o partida…') +
      '<div class="der filtros"><select id="filtroEstadoPres">' +
      ['', 'borrador', 'enviado', 'aceptado', 'rechazado', 'facturado'].map(function (e) {
        var t = { '': 'Todos los estados', borrador: 'Borrador', enviado: 'Enviado', aceptado: 'Aceptado', rechazado: 'Rechazado', facturado: 'Facturado' }[e];
        return '<option value="' + e + '"' + (filtroPres.estado === e ? ' selected' : '') + '>' + t + '</option>';
      }).join('') + '</select></div></div>';

    html += lista.length ? tablaPresupuestos(lista) :
      sinDatos(d.presupuestos.length ? 'Ningún presupuesto coincide con la búsqueda.' : 'Aquí aparecerán tus presupuestos.',
        '<button class="btn btn--primario" data-accion="nuevo-presupuesto" type="button">Crear presupuesto</button>');
    html += '</div>';
    return html;
  }

  vistaPresupuestos.despues = function () {
    var b = $('#buscador');
    if (b) b.addEventListener('input', function () { filtroPres.texto = this.value; refrescarListado(); });
    var s = $('#filtroEstadoPres');
    if (s) s.addEventListener('change', function () { filtroPres.estado = this.value; render(); });
  };

  function refrescarListado() {
    var cont = $('#vista');
    var pos = document.activeElement === $('#buscador') ? $('#buscador').selectionStart : null;
    render();
    if (pos !== null) {
      var b = $('#buscador');
      if (b) { b.focus(); b.setSelectionRange(pos, pos); }
    }
  }

  function vistaFacturas() {
    var anios = {};
    d.facturas.forEach(function (f) { anios[String(f.fecha).slice(0, 4)] = true; });
    var listaAnios = Object.keys(anios).sort().reverse();

    var lista = d.facturas.slice().sort(porFechaDesc).filter(function (f) {
      if (filtroFact.estado && D.estadoFactura(f) !== filtroFact.estado) return false;
      if (filtroFact.anio && String(f.fecha).slice(0, 4) !== filtroFact.anio) return false;
      return coincide(f.numero, filtroFact.texto) || coincide(nombreCliente(f.clienteId), filtroFact.texto) ||
             coincide(f.obra, filtroFact.texto);
    });

    var sumaBase = 0, sumaIva = 0, sumaTotal = 0, sumaPend = 0;
    lista.forEach(function (f) {
      var t = D.totales(f);
      if (f.estado === 'borrador') return;
      sumaBase += t.base; sumaIva += t.ivaTotal; sumaTotal += t.total; sumaPend += Math.max(t.pendiente, 0);
    });

    var html = cabecera('Facturas', 'Numeración correlativa automática, IVA e IRPF, control de cobros.',
      '<button class="btn" data-accion="exportar-csv" type="button">Exportar CSV</button>' +
      '<button class="btn btn--primario" data-accion="nueva-factura" type="button">' + icono('mas') + 'Nueva factura</button>');

    html += '<div class="tarjeta"><div class="tarjeta__cab">' + buscador(filtroFact.texto, 'Buscar por número, cliente u obra…') +
      '<div class="der filtros"><select id="filtroAnio"><option value="">Todos los años</option>' +
      listaAnios.map(function (a) { return '<option value="' + a + '"' + (filtroFact.anio === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') +
      '</select><select id="filtroEstadoFact">' +
      ['', 'borrador', 'emitida', 'cobrada', 'vencida'].map(function (e) {
        var t = { '': 'Todos los estados', borrador: 'Borrador', emitida: 'Emitida', cobrada: 'Cobrada', vencida: 'Vencida' }[e];
        return '<option value="' + e + '"' + (filtroFact.estado === e ? ' selected' : '') + '>' + t + '</option>';
      }).join('') + '</select></div></div>';

    html += lista.length ? tablaFacturas(lista) :
      sinDatos(d.facturas.length ? 'Ninguna factura coincide con la búsqueda.' : 'Aquí aparecerán tus facturas.',
        '<button class="btn btn--primario" data-accion="nueva-factura" type="button">Crear factura</button>');

    if (lista.length) {
      html += '<div class="tarjeta__cuerpo" style="border-top:1px solid var(--linea)"><div class="totales">' +
        '<div><span>Base imponible</span><span>' + D.euros(sumaBase) + '</span></div>' +
        '<div><span>IVA repercutido</span><span>' + D.euros(sumaIva) + '</span></div>' +
        '<div><span>Pendiente de cobro</span><span>' + D.euros(sumaPend) + '</span></div>' +
        '<div class="destacado"><span>Total facturado</span><span>' + D.euros(sumaTotal) + '</span></div>' +
        '</div></div>';
    }
    html += '</div>';
    return html;
  }

  vistaFacturas.despues = function () {
    var b = $('#buscador');
    if (b) b.addEventListener('input', function () { filtroFact.texto = this.value; refrescarListado(); });
    var s = $('#filtroEstadoFact');
    if (s) s.addEventListener('change', function () { filtroFact.estado = this.value; render(); });
    var a = $('#filtroAnio');
    if (a) a.addEventListener('change', function () { filtroFact.anio = this.value; render(); });
  };

  /* ── CLIENTES ───────────────────────────────────────────────────────── */

  var filtroCli = '';

  function vistaClientes() {
    var lista = d.clientes.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); })
      .filter(function (c) {
        return coincide(c.nombre, filtroCli) || coincide(c.nif, filtroCli) ||
               coincide(c.telefono, filtroCli) || coincide(c.ciudad, filtroCli);
      });

    var html = cabecera('Clientes', 'Los datos se copian solos al presupuesto y a la factura.',
      '<button class="btn btn--primario" data-accion="nuevo-cliente" type="button">' + icono('mas') + 'Nuevo cliente</button>');

    html += '<div class="tarjeta"><div class="tarjeta__cab">' + buscador(filtroCli, 'Buscar por nombre, NIF, teléfono o ciudad…') + '</div>';

    html += lista.length ? '<div class="tabla-scroll"><table class="tabla"><thead><tr>' +
      '<th>Nombre</th><th>NIF/CIF</th><th>Población</th><th>Teléfono</th>' +
      '<th class="num">Facturado</th><th class="num">Pendiente</th><th></th></tr></thead><tbody>' +
      lista.map(function (c) {
        var fact = 0, pend = 0;
        d.facturas.forEach(function (f) {
          if (f.clienteId !== c.id || f.estado === 'borrador') return;
          var t = D.totales(f);
          fact += t.total; pend += Math.max(t.pendiente, 0);
        });
        return '<tr class="pulsable" data-editar-cliente="' + c.id + '">' +
          '<td><strong>' + esc(c.nombre) + '</strong></td>' +
          '<td class="mono">' + esc(c.nif || '—') + '</td>' +
          '<td>' + esc([c.cp, c.ciudad].filter(Boolean).join(' ') || '—') + '</td>' +
          '<td>' + esc(c.telefono || '—') + '</td>' +
          '<td class="num">' + D.euros(fact) + '</td>' +
          '<td class="num">' + (pend > 0.009 ? D.euros(pend) : '—') + '</td>' +
          '<td class="acciones"><button class="btn btn--fantasma btn--sm" type="button" data-borrar-cliente="' + c.id + '" title="Eliminar">✕</button></td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>' :
      sinDatos(d.clientes.length ? 'Ningún cliente coincide con la búsqueda.' : 'Todavía no hay clientes dados de alta.',
        '<button class="btn btn--primario" data-accion="nuevo-cliente" type="button">Añadir cliente</button>');
    html += '</div>';
    return html;
  }

  vistaClientes.despues = function () {
    var b = $('#buscador');
    if (b) b.addEventListener('input', function () { filtroCli = this.value; refrescarListado(); });
  };

  function editarCliente(idc, alGuardar) {
    var c = idc ? cliente(idc) : null;
    var n = c || { id: '', nombre: '', nif: '', direccion: '', cp: '', ciudad: '', provincia: 'Almería', telefono: '', email: '', notas: '' };
    abrirModal({
      titulo: c ? 'Editar cliente' : 'Nuevo cliente',
      cuerpo: '<div class="campos">' +
        campo('cliNombre', 'Nombre o razón social', n.nombre, { ancho: true, req: true }) +
        campo('cliNif', 'NIF / CIF', n.nif) +
        campo('cliTel', 'Teléfono', n.telefono, { tipo: 'tel' }) +
        campo('cliEmail', 'Correo electrónico', n.email, { tipo: 'email' }) +
        campo('cliDir', 'Dirección', n.direccion, { ancho: true }) +
        campo('cliCp', 'Código postal', n.cp) +
        campo('cliCiudad', 'Población', n.ciudad) +
        campo('cliProv', 'Provincia', n.provincia) +
        area('cliNotas', 'Notas internas (no salen en los documentos)', n.notas) +
        '</div>',
      pie: '<button class="btn" data-cerrar type="button">Cancelar</button>' +
           '<button class="btn btn--primario" id="guardarCliente" type="button">Guardar cliente</button>'
    });
    $('#guardarCliente').addEventListener('click', function () {
      var nombre = $('#cliNombre').value.trim();
      if (!nombre) { $('#cliNombre').focus(); brindis('El nombre es obligatorio.'); return; }
      var datos = {
        nombre: nombre,
        nif: $('#cliNif').value.trim().toUpperCase(),
        telefono: $('#cliTel').value.trim(),
        email: $('#cliEmail').value.trim(),
        direccion: $('#cliDir').value.trim(),
        cp: $('#cliCp').value.trim(),
        ciudad: $('#cliCiudad').value.trim(),
        provincia: $('#cliProv').value.trim(),
        notas: $('#cliNotas').value.trim()
      };
      var nuevoId;
      if (c) { Object.assign(c, datos); nuevoId = c.id; }
      else { datos.id = D.id(); datos.creado = D.hoy(); d.clientes.push(datos); nuevoId = datos.id; }
      guardar();
      cerrarModal();
      brindis(c ? 'Cliente actualizado.' : 'Cliente añadido.');
      if (alGuardar) alGuardar(nuevoId); else render();
    });
  }

  function campo(id, et, valor, op) {
    op = op || {};
    return '<div class="campo' + (op.ancho ? ' campo--ancho' : '') + '">' +
      '<label for="' + id + '">' + esc(et) + (op.req ? ' *' : '') + '</label>' +
      '<input id="' + id + '" type="' + (op.tipo || 'text') + '" value="' + esc(valor) + '"' +
      (op.ph ? ' placeholder="' + esc(op.ph) + '"' : '') +
      (op.inputmode ? ' inputmode="' + op.inputmode + '"' : '') + '>' +
      (op.pista ? '<span class="pista">' + esc(op.pista) + '</span>' : '') + '</div>';
  }

  function area(id, et, valor, ph) {
    return '<div class="campo campo--ancho"><label for="' + id + '">' + esc(et) + '</label>' +
      '<textarea id="' + id + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '>' + esc(valor) + '</textarea></div>';
  }

  /* ── TARIFA DE PRECIOS ──────────────────────────────────────────────── */

  var filtroTar = '';

  function vistaTarifas() {
    var lista = d.tarifas.slice().filter(function (t) {
      return coincide(t.descripcion, filtroTar) || coincide(t.codigo, filtroTar) || coincide(t.categoria, filtroTar);
    }).sort(function (a, b) {
      return (a.categoria || '').localeCompare(b.categoria || '', 'es') || (a.codigo || '').localeCompare(b.codigo || '', 'es');
    });

    var html = cabecera('Tarifa de precios', 'Tu lista de precios. Al escribir una partida en un presupuesto se rellena sola desde aquí.',
      '<button class="btn btn--primario" data-accion="nueva-tarifa" type="button">' + icono('mas') + 'Nueva partida</button>');

    html += '<div class="tarjeta"><div class="tarjeta__cab">' + buscador(filtroTar, 'Buscar partida…') +
      '<div class="der"><button class="btn btn--sm" data-accion="subir-precios" type="button">Actualizar precios %</button></div></div>';

    html += lista.length ? '<div class="tabla-scroll"><table class="tabla"><thead><tr>' +
      '<th>Código</th><th>Categoría</th><th>Descripción</th><th>Ud.</th><th class="num">Precio</th><th></th></tr></thead><tbody>' +
      lista.map(function (t) {
        return '<tr class="pulsable" data-editar-tarifa="' + t.id + '">' +
          '<td class="mono">' + esc(t.codigo || '—') + '</td>' +
          '<td>' + esc(t.categoria || '—') + '</td>' +
          '<td>' + esc(t.descripcion) + '</td>' +
          '<td>' + esc(t.unidad) + '</td>' +
          '<td class="num">' + D.euros(t.precio) + '</td>' +
          '<td class="acciones"><button class="btn btn--fantasma btn--sm" type="button" data-borrar-tarifa="' + t.id + '" title="Eliminar">✕</button></td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>' : sinDatos('No hay partidas en la tarifa.');
    html += '</div>';
    return html;
  }

  vistaTarifas.despues = function () {
    var b = $('#buscador');
    if (b) b.addEventListener('input', function () { filtroTar = this.value; refrescarListado(); });
  };

  function editarTarifa(idt) {
    var t = idt ? d.tarifas.filter(function (x) { return x.id === idt; })[0] : null;
    var n = t || { codigo: '', categoria: '', descripcion: '', unidad: 'ud', precio: 0 };
    var cats = {};
    d.tarifas.forEach(function (x) { if (x.categoria) cats[x.categoria] = true; });

    abrirModal({
      titulo: t ? 'Editar partida' : 'Nueva partida de tarifa',
      cuerpo: '<div class="campos">' +
        campo('tarCodigo', 'Código', n.codigo, { ph: 'AG02' }) +
        '<div class="campo"><label for="tarCat">Categoría</label>' +
          '<input id="tarCat" list="listaCategorias" value="' + esc(n.categoria) + '">' +
          '<datalist id="listaCategorias">' + Object.keys(cats).map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></div>' +
        campo('tarDesc', 'Descripción', n.descripcion, { ancho: true, req: true }) +
        '<div class="campo"><label for="tarUni">Unidad</label><select id="tarUni">' + opcionesUnidad(n.unidad) + '</select></div>' +
        campo('tarPrecio', 'Precio unitario (€)', String(n.precio).replace('.', ','), { inputmode: 'decimal' }) +
        '</div>',
      pie: '<button class="btn" data-cerrar type="button">Cancelar</button>' +
           '<button class="btn btn--primario" id="guardarTarifa" type="button">Guardar</button>'
    });
    $('#guardarTarifa').addEventListener('click', function () {
      var desc = $('#tarDesc').value.trim();
      if (!desc) { $('#tarDesc').focus(); brindis('La descripción es obligatoria.'); return; }
      var datos = {
        codigo: $('#tarCodigo').value.trim().toUpperCase(),
        categoria: $('#tarCat').value.trim(),
        descripcion: desc,
        unidad: D.normalizarUnidad($('#tarUni').value),
        precio: D.num($('#tarPrecio').value)
      };
      if (t) Object.assign(t, datos);
      else { datos.id = D.id(); d.tarifas.push(datos); }
      guardar(); cerrarModal(); render();
      brindis('Tarifa guardada.');
    });
  }

  function subirPrecios() {
    abrirModal({
      titulo: 'Actualizar precios de la tarifa',
      cuerpo: '<p class="pista">Aplica una subida o bajada porcentual a todas las partidas de la tarifa. ' +
        'No afecta a los presupuestos ni facturas ya creados.</p><div class="campos">' +
        campo('pctPrecio', 'Porcentaje (usa negativo para bajar)', '5', { inputmode: 'decimal', pista: 'Ejemplo: 5 sube un 5 %; -3 baja un 3 %.' }) +
        '</div>',
      pie: '<button class="btn" data-cerrar type="button">Cancelar</button>' +
           '<button class="btn btn--primario" id="aplicarPct" type="button">Aplicar</button>'
    });
    $('#aplicarPct').addEventListener('click', function () {
      var p = D.num($('#pctPrecio').value);
      d.tarifas.forEach(function (t) { t.precio = D.redondear(D.num(t.precio) * (1 + p / 100), 2); });
      guardar(); cerrarModal(); render();
      brindis('Precios actualizados un ' + p + ' %.');
    });
  }

  /* ── EDITOR DE PRESUPUESTOS Y FACTURAS ──────────────────────────────── */

  function nuevoDocumento(tipo, patron) {
    var base = {
      id: D.id(),
      numero: '',
      tipo: tipo,
      clienteId: '',
      fecha: D.hoy(),
      obra: '',
      lineas: [],
      descuento: 0,
      irpf: d.ajustes.irpfDefecto || 0,
      notas: '',
      condiciones: tipo === 'factura' ? d.ajustes.condicionesFactura : d.ajustes.condicionesPresupuesto,
      creado: new Date().toISOString()
    };
    if (tipo === 'presupuesto') {
      base.estado = 'borrador';
      base.validez = D.sumarDias(base.fecha, d.ajustes.validezDias);
    } else {
      base.estado = 'emitida';
      base.vencimiento = D.sumarDias(base.fecha, d.ajustes.vencimientoDias);
      base.formaPago = d.ajustes.formaPago;
      base.cobros = [];
    }
    return Object.assign(base, patron || {});
  }

  function abrirEditor(doc, esNuevo) {
    editor = { doc: doc, tipo: doc.tipo, nuevo: !!esNuevo };
    var esFactura = doc.tipo === 'factura';
    var titulo = (esNuevo ? 'Nuevo ' : '') + (esFactura ? 'factura' : 'presupuesto') + (doc.numero ? ' · ' + doc.numero : '');

    var pie =
      '<div class="izq">' +
        (esNuevo ? '' : '<button class="btn btn--peligro btn--sm" id="btnEliminarDoc" type="button">Eliminar</button> ') +
        (esNuevo ? '' : '<button class="btn btn--sm" id="btnDuplicarDoc" type="button">Duplicar</button> ') +
        (!esNuevo && !esFactura && !doc.facturaId ? '<button class="btn btn--sm" id="btnConvertir" type="button">Convertir en factura</button>' : '') +
        (esFactura && !esNuevo ? '<button class="btn btn--sm" id="btnCobro" type="button">Registrar cobro</button>' : '') +
      '</div>' +
      '<button class="btn" data-cerrar type="button">Cerrar</button>' +
      '<button class="btn" id="btnVerDoc" type="button">' + icono('imprimir') + 'Ver e imprimir</button>' +
      '<button class="btn btn--primario" id="btnGuardarDoc" type="button">Guardar</button>';

    var fondo = abrirModal({ titulo: titulo.charAt(0).toUpperCase() + titulo.slice(1), cuerpo: '<div id="editorCuerpo"></div>', pie: pie, ancho: true, cerrarFuera: false, sinFoco: true });
    fondo.addEventListener('click', function (ev) {
      if (!ev.target.closest('[data-cerrar]')) return;
      var sucio = editor && !editor.guardado && editor.doc.lineas.length;
      editor = null;
      setTimeout(function () {
        render();
        if (sucio) brindis('Cerrado sin guardar los cambios.');
      }, 0);
    }, true);
    pintarEditor();

    $('#btnGuardarDoc').addEventListener('click', function () { guardarDocumento(true); });
    $('#btnVerDoc').addEventListener('click', function () {
      if (!guardarDocumento(false)) return;
      var doc2 = editor.doc;
      cerrarModal();
      editor = null;
      render();
      previsualizar(doc2);
    });
    var bd = $('#btnDuplicarDoc');
    if (bd) bd.addEventListener('click', duplicarDocumento);
    var be = $('#btnEliminarDoc');
    if (be) be.addEventListener('click', eliminarDocumento);
    var bc = $('#btnConvertir');
    if (bc) bc.addEventListener('click', convertirEnFactura);
    var bco = $('#btnCobro');
    if (bco) bco.addEventListener('click', registrarCobro);
  }

  function pintarEditor() {
    var doc = editor.doc;
    var esFactura = doc.tipo === 'factura';
    var c = cliente(doc.clienteId);

    var cab = '<div class="campos" style="margin-bottom:16px">' +
      '<div class="campo campo--ancho"><label for="docCliente">Cliente *</label>' +
        '<div style="display:flex;gap:8px"><select id="docCliente" style="flex:1">' + opcionesClientes(doc.clienteId) + '</select>' +
        '<button class="btn btn--sm" id="btnNuevoCliente" type="button">' + icono('mas') + 'Nuevo</button></div>' +
        (c ? '<span class="pista">' + esc([c.nif, c.direccion, [c.cp, c.ciudad].filter(Boolean).join(' ')].filter(Boolean).join(' · ')) + '</span>' : '') +
      '</div>' +
      '<div class="campo"><label for="docNumero">Número</label><input id="docNumero" value="' + esc(doc.numero) + '" ' +
        'placeholder="Se asigna al guardar"></div>' +
      '<div class="campo"><label for="docFecha">Fecha</label><input id="docFecha" type="date" value="' + esc(doc.fecha) + '"></div>' +
      (esFactura
        ? '<div class="campo"><label for="docVence">Vencimiento</label><input id="docVence" type="date" value="' + esc(doc.vencimiento || '') + '"></div>' +
          '<div class="campo"><label for="docPago">Forma de pago</label><input id="docPago" value="' + esc(doc.formaPago || '') + '"></div>'
        : '<div class="campo"><label for="docValidez">Válido hasta</label><input id="docValidez" type="date" value="' + esc(doc.validez || '') + '"></div>') +
      '<div class="campo"><label for="docEstado">Estado</label><select id="docEstado">' +
        (esFactura ? ['borrador', 'emitida'] : ['borrador', 'enviado', 'aceptado', 'rechazado']).map(function (e) {
          var t = { borrador: 'Borrador', emitida: 'Emitida', enviado: 'Enviado', aceptado: 'Aceptado', rechazado: 'Rechazado' }[e];
          return '<option value="' + e + '"' + (doc.estado === e ? ' selected' : '') + '>' + t + '</option>';
        }).join('') + '</select></div>' +
      '<div class="campo campo--ancho"><label for="docObra">Obra o dirección de los trabajos</label>' +
        '<input id="docObra" value="' + esc(doc.obra || '') + '" placeholder="C/ Ejemplo 12, 3ºB · Reforma de baño"></div>' +
    '</div>';

    var barra = '<div class="tarjeta__cab" style="padding:10px 0;border-bottom:1px solid var(--linea);margin-bottom:6px">' +
      '<h3 style="margin:0">Mediciones y partidas</h3>' +
      '<div class="der">' +
        '<button class="btn btn--sm btn--primario" id="btnImportar" type="button">Pegar mediciones</button>' +
        '<button class="btn btn--sm" id="btnDeTarifa" type="button">Añadir de la tarifa</button>' +
        '<button class="btn btn--sm" id="btnLinea" type="button">+ Línea</button>' +
        '<button class="btn btn--sm" id="btnCapitulo" type="button">+ Capítulo</button>' +
      '</div></div>';

    $('#editorCuerpo').innerHTML = cab + barra +
      '<div class="tabla-scroll"><div id="tablaLineas"></div></div>' +
      '<div class="campos" style="margin-top:18px;align-items:start">' +
        '<div class="campo"><label for="docDto">Descuento general (%)</label>' +
          '<input id="docDto" inputmode="decimal" value="' + esc(String(doc.descuento || 0).replace('.', ',')) + '"></div>' +
        '<div class="campo"><label for="docIrpf">Retención IRPF (%)</label>' +
          '<input id="docIrpf" inputmode="decimal" value="' + esc(String(doc.irpf || 0).replace('.', ',')) + '">' +
          '<span class="pista">Solo si facturas a empresa o profesional y te retienen.</span></div>' +
        '<div class="campo campo--ancho"><label for="docNotas">Notas visibles en el documento</label>' +
          '<textarea id="docNotas" placeholder="Plazo de ejecución, materiales que aporta el cliente…">' + esc(doc.notas || '') + '</textarea></div>' +
        '<div class="campo campo--ancho"><label for="docCondiciones">Condiciones</label>' +
          '<textarea id="docCondiciones">' + esc(doc.condiciones || '') + '</textarea></div>' +
      '</div>' +
      '<div id="cajaTotales" style="margin-top:14px"></div>' +
      (esFactura && (doc.cobros || []).length ? cajaCobros(doc) : '');

    pintarLineas();
    pintarTotales();

    $('#docCliente').addEventListener('change', function () {
      editor.doc.clienteId = this.value;
      pintarEditor();
    });
    $('#btnNuevoCliente').addEventListener('click', function () {
      Object.assign(editor.doc, recogerCabecera());
      editarCliente(null, function (idNuevo) {
        editor.doc.clienteId = idNuevo;
        pintarEditor();
      });
    });
    $('#btnLinea').addEventListener('click', function () {
      editor.doc.lineas.push(D.nuevaLinea());
      pintarLineas(); pintarTotales(); enfocarUltima();
    });
    $('#btnCapitulo').addEventListener('click', function () {
      editor.doc.lineas.push(D.nuevaLinea({ tipo: 'capitulo', descripcion: '' }));
      pintarLineas(); pintarTotales(); enfocarUltima();
    });
    $('#btnImportar').addEventListener('click', dialogoImportar);
    $('#btnDeTarifa').addEventListener('click', dialogoTarifa);
  }

  function enfocarUltima() {
    var filas = $$('#tablaLineas tbody tr');
    if (!filas.length) return;
    var inp = filas[filas.length - 1].querySelector('input[data-campo="descripcion"]');
    if (inp) inp.focus();
  }

  function recogerCabecera() {
    var doc = editor.doc;
    if (!$('#editorCuerpo')) return {};      // el editor no está pintado: no se toca nada
    var v = function (sel) { var e = $(sel); return e ? e.value : undefined; };
    var d1 = function (sel, actual) { var x = v(sel); return x === undefined ? actual : x; };
    var r = {
      clienteId: d1('#docCliente', doc.clienteId),
      numero: String(d1('#docNumero', doc.numero) || '').trim(),
      fecha: d1('#docFecha', doc.fecha) || doc.fecha,
      obra: d1('#docObra', doc.obra),
      estado: d1('#docEstado', doc.estado),
      descuento: D.num(d1('#docDto', doc.descuento)),
      irpf: D.num(d1('#docIrpf', doc.irpf)),
      notas: d1('#docNotas', doc.notas),
      condiciones: d1('#docCondiciones', doc.condiciones)
    };
    if (doc.tipo === 'factura') {
      r.vencimiento = d1('#docVence', doc.vencimiento) || doc.vencimiento;
      r.formaPago = d1('#docPago', doc.formaPago);
    } else {
      r.validez = d1('#docValidez', doc.validez) || doc.validez;
    }
    return r;
  }

  function pintarLineas() {
    var doc = editor.doc;
    var listaTarifa = '<datalist id="listaPartidas">' + d.tarifas.map(function (t) {
      return '<option value="' + esc(t.descripcion) + '">' + esc(t.codigo ? t.codigo + ' · ' + D.euros(t.precio) + '/' + t.unidad : '') + '</option>';
    }).join('') + '</datalist>';

    if (!doc.lineas.length) {
      $('#tablaLineas').innerHTML = listaTarifa +
        '<div class="vacio" style="padding:28px 12px">' +
        '<p>Ninguna partida todavía. Lo más rápido: pulsa <strong>Pegar mediciones</strong> y suelta ahí la lista de la obra.</p></div>';
      return;
    }

    var filas = doc.lineas.map(function (l, i) {
      if (l.tipo === 'capitulo') {
        return '<tr class="es-capitulo" data-fila="' + i + '">' +
          '<td class="arrastre">' + botonesOrden(i) + '</td>' +
          '<td colspan="10"><input data-campo="descripcion" value="' + esc(l.descripcion) + '" placeholder="Nombre del capítulo (Baño, Cocina, Instalación general…)"></td>' +
          '<td class="acciones"><button class="btn btn--fantasma btn--sm" data-borrar-linea="' + i + '" type="button" title="Quitar">✕</button></td></tr>';
      }
      var cant = D.cantidadLinea(l);
      return '<tr data-fila="' + i + '">' +
        '<td class="arrastre">' + botonesOrden(i) + '</td>' +
        '<td class="col-med"><input data-campo="codigo" value="' + esc(l.codigo || '') + '" placeholder="cód."></td>' +
        '<td><input data-campo="descripcion" list="listaPartidas" value="' + esc(l.descripcion) + '" placeholder="Descripción de la partida"></td>' +
        '<td class="col-uni"><select data-campo="unidad">' + opcionesUnidad(l.unidad) + '</select></td>' +
        '<td class="col-med"><input class="num" data-campo="uds" inputmode="decimal" value="' + esc(l.uds) + '" title="Unidades o nº de veces"></td>' +
        '<td class="col-med"><input class="num" data-campo="largo" inputmode="decimal" value="' + esc(l.largo) + '" title="Largo"></td>' +
        '<td class="col-med"><input class="num" data-campo="ancho" inputmode="decimal" value="' + esc(l.ancho) + '" title="Ancho"></td>' +
        '<td class="col-med"><input class="num" data-campo="alto" inputmode="decimal" value="' + esc(l.alto) + '" title="Alto"></td>' +
        '<td class="col-cant num cantidad">' + D.cantidad(cant) + '</td>' +
        '<td class="col-precio"><input class="num" data-campo="precio" inputmode="decimal" value="' + esc(String(l.precio).replace('.', ',')) + '"></td>' +
        '<td class="col-dto"><input class="num" data-campo="dto" inputmode="decimal" value="' + esc(String(l.dto || 0).replace('.', ',')) + '"></td>' +
        '<td class="col-iva"><select data-campo="iva">' + [0, 4, 10, 21].map(function (v) {
          return '<option value="' + v + '"' + (D.num(l.iva) === v ? ' selected' : '') + '>' + v + ' %</option>';
        }).join('') + '</select></td>' +
        '<td class="col-imp importe num">' + D.euros(D.importeLinea(l)) + '</td>' +
        '<td class="acciones"><button class="btn btn--fantasma btn--sm" data-borrar-linea="' + i + '" type="button" title="Quitar">✕</button></td></tr>';
    }).join('');

    $('#tablaLineas').innerHTML = listaTarifa + '<table class="lineas"><thead><tr>' +
      '<th></th><th>Cód.</th><th>Descripción</th><th>Ud.</th><th>Uds</th><th>Largo</th><th>Ancho</th><th>Alto</th>' +
      '<th class="num">Cantidad</th><th class="num">Precio</th><th class="num">Dto%</th><th>IVA</th>' +
      '<th class="num">Importe</th><th></th></tr></thead><tbody>' + filas + '</tbody></table>';
  }

  function botonesOrden(i) {
    return '<button class="btn btn--fantasma btn--sm" data-subir="' + i + '" type="button" title="Subir" style="padding:0 4px">▲</button>' +
           '<button class="btn btn--fantasma btn--sm" data-bajar="' + i + '" type="button" title="Bajar" style="padding:0 4px">▼</button>';
  }

  function pintarTotales() {
    var doc = editor.doc;
    Object.assign(doc, recogerCabecera());
    var t = D.totales(doc);
    var html = '<div class="totales">' +
      '<div><span>Suma de partidas</span><span>' + D.euros(t.bruto) + '</span></div>' +
      (t.descuento ? '<div class="apagado"><span>Descuento ' + D.cantidad(t.descuentoTipo) + ' %</span><span>−' + D.euros(t.descuento) + '</span></div>' : '') +
      '<div><span><strong>Base imponible</strong></span><span><strong>' + D.euros(t.base) + '</strong></span></div>' +
      t.iva.map(function (g) {
        return '<div class="apagado"><span>IVA ' + g.tipo + ' % sobre ' + D.euros(g.base) + '</span><span>' + D.euros(g.cuota) + '</span></div>';
      }).join('') +
      (t.irpf ? '<div class="apagado"><span>Retención IRPF ' + D.cantidad(t.irpfTipo) + ' %</span><span>−' + D.euros(t.irpf) + '</span></div>' : '') +
      '<div class="destacado"><span>Total</span><span>' + D.euros(t.total) + '</span></div>' +
      (doc.tipo === 'factura' && t.cobrado ? '<div class="apagado"><span>Cobrado</span><span>' + D.euros(t.cobrado) + '</span></div>' +
        '<div><span><strong>Pendiente</strong></span><span><strong>' + D.euros(t.pendiente) + '</strong></span></div>' : '') +
    '</div>';
    $('#cajaTotales').innerHTML = html;
  }

  function cajaCobros(doc) {
    return '<div class="tarjeta" style="margin-top:16px"><div class="tarjeta__cab"><h3>Cobros registrados</h3></div>' +
      '<div class="tabla-scroll"><table class="tabla"><thead><tr><th>Fecha</th><th>Método</th><th class="num">Importe</th><th></th></tr></thead><tbody>' +
      doc.cobros.map(function (c, i) {
        return '<tr><td>' + D.fecha(c.fecha) + '</td><td>' + esc(c.metodo || '—') + '</td>' +
          '<td class="num">' + D.euros(c.importe) + '</td>' +
          '<td class="acciones"><button class="btn btn--fantasma btn--sm" data-borrar-cobro="' + i + '" type="button">✕</button></td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  /* Eventos del editor (delegados sobre el modal) */
  document.addEventListener('input', function (e) {
    if (!editor) return;
    if (e.target.closest('#editorCuerpo')) editor.guardado = false;
    var fila = e.target.closest('#tablaLineas tr[data-fila]');
    if (fila) {
      var i = parseInt(fila.getAttribute('data-fila'), 10);
      var campo = e.target.getAttribute('data-campo');
      if (!campo) return;
      var l = editor.doc.lineas[i];
      if (!l) return;
      if (campo === 'precio' || campo === 'dto' || campo === 'iva') l[campo] = D.num(e.target.value);
      else l[campo] = e.target.value;
      var celdaCant = fila.querySelector('.cantidad');
      if (celdaCant) celdaCant.textContent = D.cantidad(D.cantidadLinea(l));
      var celdaImp = fila.querySelector('.importe');
      if (celdaImp) celdaImp.textContent = D.euros(D.importeLinea(l));
      pintarTotales();
      return;
    }
    if (e.target.closest('#editorCuerpo')) pintarTotales();
  });

  document.addEventListener('change', function (e) {
    if (!editor) return;
    var fila = e.target.closest('#tablaLineas tr[data-fila]');
    if (!fila) return;
    var i = parseInt(fila.getAttribute('data-fila'), 10);
    var l = editor.doc.lineas[i];
    if (!l) return;
    var campo = e.target.getAttribute('data-campo');
    if (campo === 'unidad') { l.unidad = e.target.value; return; }
    if (campo === 'iva') { l.iva = D.num(e.target.value); pintarTotales(); return; }
    if (campo === 'descripcion') {
      var t = D.buscarTarifa(e.target.value);
      if (t && String(t.descripcion).toLowerCase() === String(e.target.value).toLowerCase()) {
        l.descripcion = t.descripcion;
        l.codigo = t.codigo;
        l.unidad = t.unidad;
        if (!D.num(l.precio)) l.precio = t.precio;
        pintarLineas(); pintarTotales();
      }
    }
    if (campo === 'codigo') {
      var t2 = D.buscarTarifa(e.target.value);
      if (t2 && String(t2.codigo).toLowerCase() === String(e.target.value).toLowerCase()) {
        l.codigo = t2.codigo;
        if (!l.descripcion) l.descripcion = t2.descripcion;
        l.unidad = t2.unidad;
        if (!D.num(l.precio)) l.precio = t2.precio;
        pintarLineas(); pintarTotales();
      }
    }
  });

  /* ── Importar mediciones ────────────────────────────────────────────── */

  var EJEMPLO_MEDICIONES =
    '# Baño principal\n' +
    'Desmontaje de sanitarios y retirada de escombros ; ud ; 1 ; 120\n' +
    'Tubería multicapa 20 mm, instalada con accesorios ; ml ; 2x4,30 ; 12,40\n' +
    'Punto de agua empotrado (fría + caliente) ; ud ; 3 ; 78\n' +
    'Plato de ducha de resina, instalado ; ud ; 1 ; 210\n' +
    '# Cocina\n' +
    'Fregadero de cocina con grifería, instalado ; ud ; 1 ; 130\n' +
    '6 h Hora de oficial de 1ª fontanero';

  function dialogoImportar() {
    abrirModal({
      titulo: 'Pegar mediciones',
      ancho: true,
      cuerpo:
        '<div class="info" style="margin-bottom:12px">' +
          '<strong>Cómo escribir cada línea</strong><br>' +
          '<code>Descripción ; unidad ; medición ; precio ; dto%</code> — también valen tabulaciones o <code>|</code> como separador.<br>' +
          'La medición admite operaciones: <code>2x4,30</code>, <code>3*(1,20+0,80)</code>.<br>' +
          'Si no pones precio, se busca la partida en tu tarifa y se coge de ahí.<br>' +
          'Una línea que empiece por <code>#</code> se convierte en capítulo.<br>' +
          'También se entiende el estilo rápido: <code>6 h Hora de oficial de 1ª fontanero</code>.' +
        '</div>' +
        '<div class="campo"><label for="txtMediciones">Mediciones</label>' +
        '<textarea id="txtMediciones" style="min-height:240px;font-family:var(--mono);font-size:.85rem" ' +
        'placeholder="' + esc(EJEMPLO_MEDICIONES) + '"></textarea></div>' +
        '<div id="avisosImport"></div>',
      pie: '<button class="btn btn--sm izq" id="btnEjemplo" type="button">Rellenar con un ejemplo</button>' +
           '<button class="btn" data-cerrar type="button">Cancelar</button>' +
           '<button class="btn btn--primario" id="btnHacerImport" type="button">Añadir al documento</button>'
    });
    $('#btnEjemplo').addEventListener('click', function () { $('#txtMediciones').value = EJEMPLO_MEDICIONES; });
    $('#btnHacerImport').addEventListener('click', function () {
      var texto = $('#txtMediciones').value;
      if (!texto.trim()) { brindis('Pega primero las mediciones.'); return; }
      var r = D.importarMediciones(texto);
      if (!r.lineas.length) { brindis('No se ha reconocido ninguna partida.'); return; }
      Object.assign(editor.doc, recogerCabecera());
      editor.doc.lineas = editor.doc.lineas.concat(r.lineas);
      editor.guardado = false;
      cerrarModal();
      pintarLineas();
      pintarTotales();
      brindis(r.lineas.length + ' línea' + (r.lineas.length === 1 ? '' : 's') + ' añadida' + (r.lineas.length === 1 ? '' : 's') +
        (r.avisos.length ? ' · ' + r.avisos.length + ' por revisar' : ''));
      if (r.avisos.length) {
        setTimeout(function () {
          abrirModal({
            titulo: 'Revisa estas líneas',
            cuerpo: '<div class="aviso">Se han añadido todas, pero estas necesitan que pongas el precio a mano:<ul>' +
              r.avisos.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul></div>',
            pie: '<button class="btn btn--primario" data-cerrar type="button">Entendido</button>'
          });
        }, 400);
      }
    });
  }

  function dialogoTarifa() {
    var lista = d.tarifas.slice().sort(function (a, b) {
      return (a.categoria || '').localeCompare(b.categoria || '', 'es') || a.descripcion.localeCompare(b.descripcion, 'es');
    });
    var fondo = abrirModal({
      titulo: 'Añadir partidas de la tarifa',
      ancho: true,
      cuerpo: '<div class="busqueda" style="max-width:none;margin-bottom:12px">' + icono('buscar') +
        '<input type="search" id="filtroTarifaModal" placeholder="Filtrar partidas…" autocomplete="off"></div>' +
        '<div class="tabla-scroll" style="max-height:50vh;overflow-y:auto"><table class="tabla"><tbody id="cuerpoTarifaModal">' +
        lista.map(function (t) {
          return '<tr data-tarifa="' + t.id + '" data-txt="' + esc((t.codigo + ' ' + t.categoria + ' ' + t.descripcion).toLowerCase()) + '">' +
            '<td style="width:70px" class="mono">' + esc(t.codigo || '') + '</td>' +
            '<td>' + esc(t.descripcion) + '<br><span class="pista">' + esc(t.categoria || '') + '</span></td>' +
            '<td class="num" style="width:110px">' + D.euros(t.precio) + ' /' + esc(t.unidad) + '</td>' +
            '<td style="width:110px" class="acciones"><button class="btn btn--sm" type="button" data-add-tarifa="' + t.id + '">Añadir</button></td></tr>';
        }).join('') + '</tbody></table></div>',
      pie: '<button class="btn btn--primario" data-cerrar type="button">Listo</button>'
    });
    fondo.querySelector('#filtroTarifaModal').addEventListener('input', function () {
      var v = this.value.toLowerCase();
      $$('#cuerpoTarifaModal tr', fondo).forEach(function (tr) {
        tr.style.display = tr.getAttribute('data-txt').indexOf(v) > -1 ? '' : 'none';
      });
    });
    fondo.querySelector('#cuerpoTarifaModal').addEventListener('click', function (e) {
      var b = e.target.closest('[data-add-tarifa]');
      if (!b) return;
      var t = d.tarifas.filter(function (x) { return x.id === b.getAttribute('data-add-tarifa'); })[0];
      if (!t) return;
      editor.doc.lineas.push(D.nuevaLinea({
        codigo: t.codigo, descripcion: t.descripcion, unidad: t.unidad, precio: t.precio, uds: 1
      }));
      editor.guardado = false;
      brindis('Añadida: ' + t.descripcion);
    });
    fondo.addEventListener('click', function (e) {
      if (!e.target.closest('[data-cerrar]')) return;
      setTimeout(function () { if (editor) { pintarLineas(); pintarTotales(); } }, 0);
    });
  }

  /* ── Acciones sobre el documento ────────────────────────────────────── */

  function guardarDocumento(cerrar) {
    var doc = editor.doc;
    Object.assign(doc, recogerCabecera());
    if (!doc.clienteId) { brindis('Elige un cliente antes de guardar.'); $('#docCliente').focus(); return false; }
    var conPartidas = doc.lineas.filter(function (l) { return l.tipo !== 'capitulo'; });
    if (!conPartidas.length) { brindis('Añade al menos una partida.'); return false; }

    // Una factura en borrador no consume número: así la numeración queda correlativa y sin huecos
    if (!doc.numero && !(doc.tipo === 'factura' && doc.estado === 'borrador')) {
      doc.numero = D.siguienteNumero(doc.tipo, doc.fecha);
    }
    doc.modificado = new Date().toISOString();

    var lista = doc.tipo === 'factura' ? d.facturas : d.presupuestos;
    var idx = -1;
    lista.forEach(function (x, i) { if (x.id === doc.id) idx = i; });
    if (idx === -1) lista.push(doc); else lista[idx] = doc;

    guardar();
    editor.nuevo = false;
    editor.guardado = true;
    if (cerrar) {
      cerrarModal();
      editor = null;
      render();
      brindis('Guardado.');
    }
    return true;
  }

  function duplicarDocumento() {
    var copia = JSON.parse(JSON.stringify(editor.doc));
    Object.assign(copia, recogerCabecera());
    copia.id = D.id();
    copia.numero = '';
    copia.fecha = D.hoy();
    copia.estado = 'borrador';
    copia.cobros = [];
    delete copia.facturaId;
    delete copia.presupuestoId;
    copia.lineas = copia.lineas.map(function (l) { return Object.assign({}, l, { id: D.id() }); });
    if (copia.tipo === 'factura') copia.vencimiento = D.sumarDias(copia.fecha, d.ajustes.vencimientoDias);
    else copia.validez = D.sumarDias(copia.fecha, d.ajustes.validezDias);
    cerrarModal();
    editor = null;
    abrirEditor(copia, true);
    brindis('Copia lista. Se numerará al guardar.');
  }

  function eliminarDocumento() {
    var doc = editor.doc;
    confirmar('¿Eliminar ' + (doc.tipo === 'factura' ? 'la factura ' : 'el presupuesto ') + (doc.numero || '') +
      '? No se puede deshacer.', function () {
      var lista = doc.tipo === 'factura' ? d.facturas : d.presupuestos;
      var i = -1;
      lista.forEach(function (x, k) { if (x.id === doc.id) i = k; });
      if (i > -1) lista.splice(i, 1);
      if (doc.tipo === 'factura') {
        d.presupuestos.forEach(function (p) { if (p.facturaId === doc.id) delete p.facturaId; });
      }
      guardar(); cerrarModal(); editor = null; render();
      brindis('Eliminado.');
    });
  }

  function convertirEnFactura() {
    if (!guardarDocumento(false)) return;
    var p = editor.doc;
    var f = nuevoDocumento('factura', {
      clienteId: p.clienteId,
      obra: p.obra,
      notas: p.notas,
      descuento: p.descuento,
      irpf: p.irpf,
      presupuestoId: p.id,
      lineas: p.lineas.map(function (l) { return Object.assign({}, l, { id: D.id() }); })
    });
    f.condiciones = d.ajustes.condicionesFactura;
    p.facturaId = f.id;
    if (p.estado !== 'aceptado') p.estado = 'aceptado';
    guardar();
    cerrarModal();
    editor = null;
    render();
    abrirEditor(f, true);
    brindis('Factura creada a partir del presupuesto ' + p.numero + '.');
  }

  function registrarCobro() {
    var doc = editor.doc;
    var t = D.totales(doc);
    abrirModal({
      titulo: 'Registrar cobro',
      cuerpo: '<div class="campos">' +
        campo('cobFecha', 'Fecha', D.hoy(), { tipo: 'date' }) +
        campo('cobImporte', 'Importe (€)', String(D.redondear(Math.max(t.pendiente, 0), 2)).replace('.', ','), { inputmode: 'decimal' }) +
        '<div class="campo"><label for="cobMetodo">Método</label><select id="cobMetodo">' +
        ['Transferencia', 'Efectivo', 'Bizum', 'Tarjeta', 'Cheque'].map(function (m) {
          return '<option>' + m + '</option>';
        }).join('') + '</select></div></div>',
      pie: '<button class="btn" data-cerrar type="button">Cancelar</button>' +
           '<button class="btn btn--primario" id="guardarCobro" type="button">Registrar</button>'
    });
    $('#guardarCobro').addEventListener('click', function () {
      if (!doc.cobros) doc.cobros = [];
      doc.cobros.push({
        fecha: $('#cobFecha').value || D.hoy(),
        importe: D.num($('#cobImporte').value),
        metodo: $('#cobMetodo').value
      });
      if (doc.estado === 'borrador') {
        doc.estado = 'emitida';
        var selEstado = $('#docEstado');
        if (selEstado) selEstado.value = 'emitida';
      }
      cerrarModal();
      guardarDocumento(false);
      pintarEditor();
      brindis('Cobro registrado.');
    });
  }

  /* ── Vista imprimible ───────────────────────────────────────────────── */

  function documentoHTML(doc) {
    var e = d.empresa;
    var c = cliente(doc.clienteId) || {};
    var t = D.totales(doc);
    var esFactura = doc.tipo === 'factura';

    var emisor = [
      e.direccion,
      [e.cp, e.ciudad].filter(Boolean).join(' ') + (e.provincia ? ' (' + e.provincia + ')' : ''),
      e.nif ? 'NIF: ' + e.nif : '',
      [e.telefono, e.email].filter(Boolean).join(' · '),
      e.web
    ].filter(function (x) { return x && x.trim(); }).join('\n');

    var receptor = [
      c.nif ? 'NIF: ' + c.nif : '',
      c.direccion,
      [c.cp, c.ciudad].filter(Boolean).join(' ') + (c.provincia ? ' (' + c.provincia + ')' : ''),
      c.telefono
    ].filter(function (x) { return x && x.trim(); }).join('\n');

    var filas = doc.lineas.map(function (l) {
      if (l.tipo === 'capitulo') {
        return '<tr class="cap"><td colspan="6">' + esc(l.descripcion) + '</td></tr>';
      }
      var med = [l.uds, l.largo, l.ancho, l.alto].filter(function (x) { return x !== '' && x !== null && x !== undefined; });
      var detalle = med.length > 1 ? med.join(' × ')
        : (/[+\-*/x×()]/i.test(String(med[0] === undefined ? '' : med[0])) ? String(med[0]) : '');
      return '<tr>' +
        '<td>' + esc(l.descripcion) + (detalle ? '<span class="doc__medicion">Medición: ' + esc(detalle) + '</span>' : '') +
          (D.num(l.dto) ? '<span class="doc__medicion">Descuento ' + D.cantidad(l.dto) + ' %</span>' : '') + '</td>' +
        '<td class="num">' + esc(l.unidad) + '</td>' +
        '<td class="num">' + D.cantidad(D.cantidadLinea(l)) + '</td>' +
        '<td class="num">' + D.euros(l.precio) + '</td>' +
        '<td class="num">' + D.num(l.iva) + ' %</td>' +
        '<td class="num">' + D.euros(D.importeLinea(l)) + '</td></tr>';
    }).join('');

    return '<div class="doc">' +
      '<div class="doc__cab">' +
        '<div class="doc__emisor">' +
          (e.logo ? '<img class="doc__logo" src="' + esc(e.logo) + '" alt="">' : '') +
          '<h1>' + esc(e.nombre || 'Fontanería Macael') + '</h1>' +
          '<p>' + esc(emisor) + '</p>' +
        '</div>' +
        '<div class="doc__tipo">' +
          '<h2>' + (esFactura ? 'Factura' : 'Presupuesto') + '</h2>' +
          '<div class="numero">' + esc(doc.numero || '(sin numerar)') + '</div>' +
          '<p>Fecha: ' + D.fecha(doc.fecha) + '</p>' +
          (esFactura
            ? '<p>Vencimiento: ' + D.fecha(doc.vencimiento) + '</p>' + (doc.formaPago ? '<p>' + esc(doc.formaPago) + '</p>' : '')
            : '<p>Válido hasta: ' + D.fecha(doc.validez) + '</p>') +
        '</div>' +
      '</div>' +
      '<div class="doc__partes">' +
        '<div class="doc__parte"><h3>Cliente</h3><strong>' + esc(c.nombre || '—') + '</strong>' +
          (receptor ? '<p>' + esc(receptor) + '</p>' : '') + '</div>' +
        (doc.obra ? '<div class="doc__parte"><h3>Obra / lugar de los trabajos</h3><p>' + esc(doc.obra) + '</p></div>' : '') +
      '</div>' +
      '<table class="doc__tabla"><thead><tr>' +
        '<th>Concepto</th><th class="num">Ud.</th><th class="num">Cantidad</th>' +
        '<th class="num">Precio</th><th class="num">IVA</th><th class="num">Importe</th>' +
      '</tr></thead><tbody>' + filas + '</tbody></table>' +
      '<div class="doc__cierre">' +
        '<div class="doc__notas">' +
          (doc.notas ? '<h4>Notas</h4><p>' + esc(doc.notas) + '</p>' : '') +
          (doc.condiciones ? '<h4>Condiciones</h4><p>' + esc(doc.condiciones) + '</p>' : '') +
          (esFactura && d.empresa.iban ? '<h4>Pago</h4><p>' + esc(d.empresa.iban) + '</p>' : '') +
          (!esFactura ? '<h4>Aceptación</h4><p>Firma del cliente:</p><p>&nbsp;</p><p>_______________________________</p>' : '') +
        '</div>' +
        '<div class="doc__totales">' +
          '<div><span>Suma de partidas</span><span>' + D.euros(t.bruto) + '</span></div>' +
          (t.descuento ? '<div><span>Descuento ' + D.cantidad(t.descuentoTipo) + ' %</span><span>−' + D.euros(t.descuento) + '</span></div>' : '') +
          '<div><span>Base imponible</span><span>' + D.euros(t.base) + '</span></div>' +
          t.iva.map(function (g) {
            return '<div><span>IVA ' + g.tipo + ' %</span><span>' + D.euros(g.cuota) + '</span></div>';
          }).join('') +
          (t.irpf ? '<div><span>Retención IRPF ' + D.cantidad(t.irpfTipo) + ' %</span><span>−' + D.euros(t.irpf) + '</span></div>' : '') +
          '<div class="total"><span>Total</span><span>' + D.euros(t.total) + '</span></div>' +
          (esFactura && t.cobrado ? '<div><span>Cobrado</span><span>' + D.euros(t.cobrado) + '</span></div>' +
            '<div><span>Pendiente</span><span>' + D.euros(t.pendiente) + '</span></div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="doc__pie">' + esc(e.nombre || 'Fontanería Macael') +
        (e.nif ? ' · NIF ' + esc(e.nif) : '') +
        (e.telefono ? ' · ' + esc(e.telefono) : '') +
        (e.email ? ' · ' + esc(e.email) : '') + '</div>' +
    '</div>';
  }

  function previsualizar(doc) {
    abrirModal({
      titulo: (doc.tipo === 'factura' ? 'Factura ' : 'Presupuesto ') + (doc.numero || ''),
      ancho: true,
      sinFoco: true,
      cuerpo: documentoHTML(doc),
      pie: '<button class="btn izq" id="btnVolverEditar" type="button">Volver a editar</button>' +
           '<button class="btn" data-cerrar type="button">Cerrar</button>' +
           '<button class="btn btn--primario" id="btnImprimirDoc" type="button">' + icono('imprimir') + 'Imprimir o guardar en PDF</button>'
    });
    $('#btnImprimirDoc').addEventListener('click', function () { window.print(); });
    $('#btnVolverEditar').addEventListener('click', function () {
      cerrarModal();
      abrirEditor(doc, false);
    });
  }

  /* ── AJUSTES ────────────────────────────────────────────────────────── */

  function vistaAjustes() {
    var e = d.empresa, a = d.ajustes;
    var html = cabecera('Ajustes', 'Rellena esto una vez: se copia en todos los documentos.');

    html += '<div class="tarjeta"><div class="tarjeta__cab"><h2>Datos de la empresa</h2></div><div class="tarjeta__cuerpo">' +
      '<div class="campos">' +
        campo('empNombre', 'Nombre o razón social', e.nombre, { ancho: true }) +
        campo('empNif', 'NIF / CIF', e.nif) +
        campo('empTel', 'Teléfono', e.telefono, { tipo: 'tel' }) +
        campo('empEmail', 'Correo electrónico', e.email, { tipo: 'email' }) +
        campo('empWeb', 'Web', e.web) +
        campo('empDir', 'Dirección', e.direccion, { ancho: true }) +
        campo('empCp', 'Código postal', e.cp) +
        campo('empCiudad', 'Población', e.ciudad) +
        campo('empProv', 'Provincia', e.provincia) +
        campo('empIban', 'IBAN o datos de pago', e.iban, { ancho: true, pista: 'Aparece en las facturas.' }) +
        '<div class="campo campo--ancho"><label for="empLogo">Logotipo</label>' +
          '<input type="file" id="empLogo" accept="image/*">' +
          '<span class="pista">Se guarda dentro del navegador y sale en la cabecera de los documentos.' +
          (e.logo ? ' <button class="btn btn--sm" data-accion="quitar-logo" type="button">Quitar el actual</button>' : '') + '</span>' +
          (e.logo ? '<img src="' + esc(e.logo) + '" alt="" style="max-height:60px;margin-top:8px">' : '') +
        '</div>' +
      '</div></div></div>';

    html += '<div class="tarjeta"><div class="tarjeta__cab"><h2>Numeración e impuestos</h2></div><div class="tarjeta__cuerpo">' +
      '<div class="campos">' +
        campo('ajSerieP', 'Serie de presupuestos', a.seriePresupuesto, { pista: 'Ej.: PRE-2026-0001' }) +
        campo('ajSerieF', 'Serie de facturas', a.serieFactura, { pista: 'Ej.: F-2026-0001' }) +
        campo('ajIva', 'IVA por defecto (%)', String(a.ivaDefecto).replace('.', ','), { inputmode: 'decimal' }) +
        campo('ajIrpf', 'Retención IRPF por defecto (%)', String(a.irpfDefecto).replace('.', ','), { inputmode: 'decimal' }) +
        campo('ajVenc', 'Días hasta el vencimiento', String(a.vencimientoDias), { inputmode: 'numeric' }) +
        campo('ajValidez', 'Días de validez del presupuesto', String(a.validezDias), { inputmode: 'numeric' }) +
        campo('ajPago', 'Forma de pago por defecto', a.formaPago, { ancho: true }) +
        area('ajCondP', 'Condiciones del presupuesto', a.condicionesPresupuesto) +
        area('ajCondF', 'Condiciones de la factura', a.condicionesFactura) +
      '</div>' +
      '<div class="aviso" style="margin-top:14px">Los contadores actuales son: presupuestos ' +
        esc(String((d.contadores.presupuesto || {})[anioActual()] || 0)) + ' y facturas ' +
        esc(String((d.contadores.factura || {})[anioActual()] || 0)) + ' emitidos en ' + anioActual() + '. ' +
        'La numeración de facturas debe ser correlativa y sin huecos: no borres facturas ya entregadas.</div>' +
      '</div></div>';

    html += '<div class="tarjeta"><div class="tarjeta__cab"><h2>Copia de seguridad</h2></div><div class="tarjeta__cuerpo">' +
      '<p class="pista">Los datos viven solo en este navegador y en este dispositivo. Si borras los datos de navegación, se pierden. ' +
      'Descarga una copia cada semana y guárdala donde quieras.</p>' +
      '<div class="cabecera__acciones">' +
        '<button class="btn btn--primario" data-accion="copia-descargar" type="button">Descargar copia</button>' +
        '<button class="btn" data-accion="copia-restaurar" type="button">Restaurar copia</button>' +
        '<button class="btn" data-accion="copia-pegar" type="button">Pegar copia</button>' +
        '<button class="btn" data-accion="exportar-csv" type="button">Exportar facturas a CSV</button>' +
        '<button class="btn btn--peligro" data-accion="borrar-todo" type="button">Borrar todos los datos</button>' +
      '</div>' +
      '<input type="file" id="ficheroCopia" accept="application/json,.json" hidden>' +
      '</div></div>';

    html += '<div class="cabecera__acciones" style="justify-content:flex-end">' +
      '<button class="btn btn--primario" data-accion="guardar-ajustes" type="button">Guardar ajustes</button></div>';
    return html;
  }

  function guardarAjustes() {
    var v = function (id) { var el = $('#' + id); return el ? el.value.trim() : ''; };
    Object.assign(d.empresa, {
      nombre: v('empNombre'), nif: v('empNif').toUpperCase(), telefono: v('empTel'), email: v('empEmail'),
      web: v('empWeb'), direccion: v('empDir'), cp: v('empCp'), ciudad: v('empCiudad'),
      provincia: v('empProv'), iban: v('empIban')
    });
    Object.assign(d.ajustes, {
      seriePresupuesto: v('ajSerieP'), serieFactura: v('ajSerieF'),
      ivaDefecto: D.num(v('ajIva')), irpfDefecto: D.num(v('ajIrpf')),
      vencimientoDias: D.num(v('ajVenc')), validezDias: D.num(v('ajValidez')),
      formaPago: v('ajPago'), condicionesPresupuesto: v('ajCondP'), condicionesFactura: v('ajCondF')
    });
    guardar();
    render();
    brindis('Ajustes guardados.');
  }

  vistaAjustes.despues = function () {
    var f = $('#empLogo');
    if (f) f.addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file) return;
      if (file.size > 700 * 1024) { brindis('El logo es muy grande: usa una imagen de menos de 700 KB.'); return; }
      var lector = new FileReader();
      lector.onload = function () {
        d.empresa.logo = lector.result;
        guardar(); render();
        brindis('Logotipo actualizado.');
      };
      lector.readAsDataURL(file);
    });
    var fc = $('#ficheroCopia');
    if (fc) fc.addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file) return;
      var lector = new FileReader();
      lector.onload = function () {
        try {
          d = D.importar(lector.result);
          render();
          brindis('Copia restaurada.');
        } catch (err) {
          abrirModal({
            titulo: 'No se ha podido restaurar',
            cuerpo: '<div class="aviso">' + esc(err.message || 'El archivo no es una copia válida.') + '</div>',
            pie: '<button class="btn btn--primario" data-cerrar type="button">Cerrar</button>'
          });
        }
      };
      lector.readAsText(file);
    });
  };

  /* ── Descargas ──────────────────────────────────────────────────────── */

  /* Guardar un archivo. En el navegador se descarga directamente; dentro del
     visor de Claude hay que pedirle permiso al usuario con la capacidad de descargas. */
  var promesaDescargas = null;
  function capacidadDescargas() {
    if (!promesaDescargas) {
      promesaDescargas = (window.claude && typeof window.claude.use === 'function')
        ? Promise.resolve(window.claude.use('downloads')).catch(function () { return null; })
        : Promise.resolve(null);
    }
    return promesaDescargas;
  }

  function descargaDirecta(nombre, contenido, tipo) {
    var blob = new Blob([contenido], { type: (tipo || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 800);
  }

  function descargar(nombre, contenido, tipo, mensaje) {
    capacidadDescargas().then(function (dl) {
      if (!dl) {
        if (window.claude && typeof window.claude.use === 'function') {
          mostrarTexto(nombre, contenido);
          return;
        }
        descargaDirecta(nombre, contenido, tipo);
        if (mensaje) brindis(mensaje);
        return;
      }
      dl.save({ filename: nombre, data: contenido }).then(function () {
        if (mensaje) brindis(mensaje);
      }).catch(function (err) {
        var codigo = err && err.code;
        if (codigo === 'declined') { brindis('Descarga cancelada.'); return; }
        if (codigo === 'rate_limited') { brindis('Espera un momento y vuelve a intentarlo.'); return; }
        if (codigo === 'extension_not_enabled' || codigo === 'rejected_extension') {
          dl.save({ filename: nombre.replace(/\.[a-z]+$/i, '.txt'), data: contenido }).then(function () {
            if (mensaje) brindis(mensaje);
          }).catch(function () { mostrarTexto(nombre, contenido); });
          return;
        }
        mostrarTexto(nombre, contenido);
      });
    });
  }

  /* Cuando no se puede guardar un archivo, se enseña el contenido para copiarlo. */
  function mostrarTexto(nombre, contenido) {
    var fondo = abrirModal({
      titulo: 'Copia de seguridad: ' + nombre,
      ancho: true,
      sinFoco: true,
      cuerpo: '<div class="info" style="margin-bottom:12px">Aquí no se pueden guardar archivos. ' +
        'Copia todo este texto y pégalo en una nota, un correo o un archivo de texto. ' +
        'Para volver a cargarlo, usa <strong>Pegar copia</strong> en Ajustes.</div>' +
        '<textarea id="txtCopia" readonly style="min-height:260px;font-family:var(--mono);font-size:.78rem">' +
        esc(contenido) + '</textarea>',
      pie: '<button class="btn" data-cerrar type="button">Cerrar</button>' +
           '<button class="btn btn--primario" id="btnCopiarTexto" type="button">Copiar todo</button>'
    });
    fondo.querySelector('#btnCopiarTexto').addEventListener('click', function () {
      var area = fondo.querySelector('#txtCopia');
      area.focus();
      area.select();
      var hecho = false;
      try { hecho = document.execCommand('copy'); } catch (err) { hecho = false; }
      if (hecho) { brindis('Copiado al portapapeles.'); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(area.value).then(function () {
          brindis('Copiado al portapapeles.');
        }).catch(function () { brindis('Selecciona el texto y cópialo a mano.'); });
        return;
      }
      brindis('Selecciona el texto y cópialo a mano.');
    });
  }

  function dialogoPegarCopia() {
    var fondo = abrirModal({
      titulo: 'Pegar copia de seguridad',
      ancho: true,
      cuerpo: '<div class="aviso" style="margin-bottom:12px">Al restaurar se sustituyen todos los datos actuales ' +
        '(clientes, presupuestos, facturas y tarifa) por los de la copia.</div>' +
        '<div class="campo"><label for="txtPegarCopia">Pega aquí el contenido de la copia</label>' +
        '<textarea id="txtPegarCopia" style="min-height:220px;font-family:var(--mono);font-size:.78rem" ' +
        'placeholder="{ &quot;version&quot;: 1, ... }"></textarea></div>',
      pie: '<button class="btn" data-cerrar type="button">Cancelar</button>' +
           '<button class="btn btn--primario" id="btnRestaurarPegado" type="button">Restaurar</button>'
    });
    fondo.querySelector('#btnRestaurarPegado').addEventListener('click', function () {
      var texto = fondo.querySelector('#txtPegarCopia').value.trim();
      if (!texto) { brindis('Pega primero el contenido de la copia.'); return; }
      try {
        d = D.importar(texto);
        cerrarModal();
        render();
        brindis('Copia restaurada.');
      } catch (err) {
        brindis('Ese texto no es una copia válida.');
      }
    });
  }

  function exportarCSV() {
    var filas = [['Numero', 'Fecha', 'Vencimiento', 'Cliente', 'NIF', 'Obra', 'Base', 'IVA', 'IRPF', 'Total', 'Cobrado', 'Pendiente', 'Estado']];
    d.facturas.slice().sort(function (a, b) { return (a.fecha || '').localeCompare(b.fecha || ''); }).forEach(function (f) {
      var t = D.totales(f);
      var c = cliente(f.clienteId) || {};
      filas.push([
        f.numero, f.fecha, f.vencimiento || '', c.nombre || '', c.nif || '', f.obra || '',
        t.base, t.ivaTotal, t.irpf, t.total, t.cobrado, t.pendiente, D.estadoFactura(f)
      ]);
    });
    var csv = filas.map(function (fila) {
      return fila.map(function (celda) {
        var s = typeof celda === 'number' ? celda.toFixed(2).replace('.', ',')
          : String(celda === null || celda === undefined ? '' : celda);
        return '"' + s.replace(/"/g, '""') + '"';
      }).join(';');
    }).join('\r\n');
    descargar('facturas-' + D.hoy() + '.csv', '﻿' + csv, 'text/csv', 'CSV descargado.');
  }

  /* ── Eventos globales ───────────────────────────────────────────────── */

  document.addEventListener('click', function (e) {
    var t = e.target;

    var nav = t.closest('[data-vista]');
    if (nav) { ir(nav.getAttribute('data-vista')); return; }

    var subir = t.closest('[data-subir]');
    if (subir && editor) {
      var i = parseInt(subir.getAttribute('data-subir'), 10);
      if (i > 0) {
        var l = editor.doc.lineas.splice(i, 1)[0];
        editor.doc.lineas.splice(i - 1, 0, l);
        pintarLineas(); pintarTotales();
      }
      return;
    }
    var bajar = t.closest('[data-bajar]');
    if (bajar && editor) {
      var j = parseInt(bajar.getAttribute('data-bajar'), 10);
      if (j < editor.doc.lineas.length - 1) {
        var l2 = editor.doc.lineas.splice(j, 1)[0];
        editor.doc.lineas.splice(j + 1, 0, l2);
        pintarLineas(); pintarTotales();
      }
      return;
    }
    var borrarLinea = t.closest('[data-borrar-linea]');
    if (borrarLinea && editor) {
      editor.doc.lineas.splice(parseInt(borrarLinea.getAttribute('data-borrar-linea'), 10), 1);
      pintarLineas(); pintarTotales();
      return;
    }
    var borrarCobro = t.closest('[data-borrar-cobro]');
    if (borrarCobro && editor) {
      editor.doc.cobros.splice(parseInt(borrarCobro.getAttribute('data-borrar-cobro'), 10), 1);
      guardarDocumento(false);
      pintarEditor();
      return;
    }

    var impP = t.closest('[data-imprimir-presupuesto]');
    if (impP) {
      e.stopPropagation();
      var p = d.presupuestos.filter(function (x) { return x.id === impP.getAttribute('data-imprimir-presupuesto'); })[0];
      if (p) previsualizar(p);
      return;
    }
    var impF = t.closest('[data-imprimir-factura]');
    if (impF) {
      e.stopPropagation();
      var f = d.facturas.filter(function (x) { return x.id === impF.getAttribute('data-imprimir-factura'); })[0];
      if (f) previsualizar(f);
      return;
    }

    var borrarCli = t.closest('[data-borrar-cliente]');
    if (borrarCli) {
      e.stopPropagation();
      var idc = borrarCli.getAttribute('data-borrar-cliente');
      var usos = d.facturas.concat(d.presupuestos).filter(function (x) { return x.clienteId === idc; }).length;
      confirmar(usos ? 'Este cliente tiene ' + usos + ' documento(s). Si lo eliminas, seguirán guardados pero sin ficha de cliente. ¿Continuar?'
                     : '¿Eliminar este cliente?', function () {
        d.clientes = d.clientes.filter(function (c) { return c.id !== idc; });
        guardar(); render(); brindis('Cliente eliminado.');
      });
      return;
    }
    var editarCli = t.closest('[data-editar-cliente]');
    if (editarCli) { editarCliente(editarCli.getAttribute('data-editar-cliente')); return; }

    var borrarTar = t.closest('[data-borrar-tarifa]');
    if (borrarTar) {
      e.stopPropagation();
      var idt = borrarTar.getAttribute('data-borrar-tarifa');
      confirmar('¿Quitar esta partida de la tarifa?', function () {
        d.tarifas = d.tarifas.filter(function (x) { return x.id !== idt; });
        guardar(); render(); brindis('Partida eliminada.');
      });
      return;
    }
    var editarTar = t.closest('[data-editar-tarifa]');
    if (editarTar) { editarTarifa(editarTar.getAttribute('data-editar-tarifa')); return; }

    var abrirP = t.closest('[data-abrir-presupuesto]');
    if (abrirP) {
      var pd = d.presupuestos.filter(function (x) { return x.id === abrirP.getAttribute('data-abrir-presupuesto'); })[0];
      if (pd) abrirEditor(pd, false);
      return;
    }
    var abrirF = t.closest('[data-abrir-factura]');
    if (abrirF) {
      var fd = d.facturas.filter(function (x) { return x.id === abrirF.getAttribute('data-abrir-factura'); })[0];
      if (fd) abrirEditor(fd, false);
      return;
    }

    var acc = t.closest('[data-accion]');
    if (!acc) return;
    switch (acc.getAttribute('data-accion')) {
      case 'nuevo-presupuesto': abrirEditor(nuevoDocumento('presupuesto'), true); break;
      case 'nueva-factura': abrirEditor(nuevoDocumento('factura'), true); break;
      case 'nuevo-cliente': editarCliente(null); break;
      case 'nueva-tarifa': editarTarifa(null); break;
      case 'subir-precios': subirPrecios(); break;
      case 'guardar-ajustes': guardarAjustes(); break;
      case 'quitar-logo': d.empresa.logo = ''; guardar(); render(); break;
      case 'exportar-csv': exportarCSV(); break;
      case 'copia-descargar':
        descargar('fontaneria-macael-copia-' + D.hoy() + '.json', D.exportar(), 'application/json', 'Copia descargada.');
        break;
      case 'copia-restaurar': $('#ficheroCopia').click(); break;
      case 'copia-pegar': dialogoPegarCopia(); break;
      case 'borrar-todo':
        confirmar('Se borrarán clientes, presupuestos y facturas de este navegador. Descarga antes una copia. ¿Seguro?', function () {
          d = D.borrarTodo();
          render();
          brindis('Datos borrados.');
        }, 'Borrar todo');
        break;
      case 'menu': document.body.classList.toggle('menu-abierto'); break;
    }
  });

  window.addEventListener('hashchange', function () {
    var v = location.hash.slice(1);
    if (v && v !== vista) { vista = v; render(); }
  });

  /* ── Arranque ───────────────────────────────────────────────────────── */

  capacidadDescargas();   // se resuelve en segundo plano para que el botón responda al instante
  var inicial = location.hash.slice(1);
  if (inicial && SECCIONES.some(function (s) { return s.id === inicial; })) vista = inicial;
  render();
})();
