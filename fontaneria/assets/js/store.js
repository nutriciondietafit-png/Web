/* ==========================================================================
   Fontanería Macael · Capa de datos
   Todo se guarda en el navegador (localStorage). Sin servidor, sin cuentas.
   ========================================================================== */
(function (global) {
  'use strict';

  var CLAVE = 'fontaneria-macael:v1';
  var VERSION = 1;

  /* ---------- utilidades ---------- */

  function id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function hoy() {
    return new Date().toISOString().slice(0, 10);
  }

  function sumarDias(fechaISO, dias) {
    var d = new Date(fechaISO + 'T12:00:00');
    d.setDate(d.getDate() + (Number(dias) || 0));
    return d.toISOString().slice(0, 10);
  }

  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (v === null || v === undefined || v === '') return 0;
    var s = String(v).trim().replace(/\s/g, '');
    // 1.234,56 -> 1234.56   |   1234.56 -> 1234.56
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }

  function redondear(n, dec) {
    var f = Math.pow(10, dec === undefined ? 2 : dec);
    return Math.round((n + Number.EPSILON) * f) / f;
  }

  var fmtMoneda = new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2
  });
  var fmtCantidad = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 });

  function euros(n) { return fmtMoneda.format(redondear(num(n), 2)); }
  function cantidad(n) { return fmtCantidad.format(redondear(num(n), 3)); }

  function fecha(iso) {
    if (!iso) return '—';
    var p = String(iso).slice(0, 10).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  }

  /* Evalúa una medición: admite 3, "3,5", "2x3,40", "4*(1,20+0,80)" */
  function evalMedicion(expr) {
    if (expr === null || expr === undefined || expr === '') return 0;
    if (typeof expr === 'number') return isFinite(expr) ? expr : 0;
    var s = String(expr).trim()
      .replace(/[×xX*]/g, '*')
      .replace(/\s/g, '');
    // Si usa coma decimal, la coma manda y el punto es separador de millares
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(/,/g, '.');
    if (!/^[0-9.+\-*/() ]+$/.test(s)) return num(expr);
    try {
      /* jshint evil:true */
      var r = Function('"use strict";return (' + s + ')')();
      return isFinite(r) ? r : 0;
    } catch (e) {
      return num(expr);
    }
  }

  /* ---------- estado inicial ---------- */

  var EMPRESA = {
    nombre: 'Fontanería Macael',
    nif: '',
    direccion: '',
    cp: '',
    ciudad: 'Macael',
    provincia: 'Almería',
    telefono: '',
    email: '',
    web: '',
    iban: '',
    logo: ''
  };

  var AJUSTES = {
    ivaDefecto: 21,
    irpfDefecto: 0,
    seriePresupuesto: 'PRE',
    serieFactura: 'F',
    vencimientoDias: 30,
    validezDias: 30,
    formaPago: 'Transferencia bancaria',
    condicionesPresupuesto: 'Presupuesto sin compromiso. No incluye trabajos de albañilería, alicatado ni pintura salvo indicación expresa. Los precios pueden variar si al abrir la instalación aparecen daños no visibles en la visita.',
    condicionesFactura: 'Pago según forma indicada. Los materiales instalados conservan la garantía del fabricante; la mano de obra tiene 1 año de garantía.'
  };

  var TARIFAS_BASE = [
    { codigo: 'MO01', categoria: 'Mano de obra', descripcion: 'Hora de oficial de 1ª fontanero', unidad: 'h', precio: 32 },
    { codigo: 'MO02', categoria: 'Mano de obra', descripcion: 'Hora de ayudante', unidad: 'h', precio: 22 },
    { codigo: 'MO03', categoria: 'Mano de obra', descripcion: 'Desplazamiento y salida a domicilio', unidad: 'ud', precio: 35 },
    { codigo: 'MO04', categoria: 'Mano de obra', descripcion: 'Hora de urgencia (festivos y nocturno)', unidad: 'h', precio: 55 },
    { codigo: 'AG01', categoria: 'Agua fría y caliente', descripcion: 'Tubería multicapa 16 mm, instalada con accesorios', unidad: 'ml', precio: 9.8 },
    { codigo: 'AG02', categoria: 'Agua fría y caliente', descripcion: 'Tubería multicapa 20 mm, instalada con accesorios', unidad: 'ml', precio: 12.4 },
    { codigo: 'AG03', categoria: 'Agua fría y caliente', descripcion: 'Tubería multicapa 26 mm, instalada con accesorios', unidad: 'ml', precio: 16.9 },
    { codigo: 'AG04', categoria: 'Agua fría y caliente', descripcion: 'Punto de agua empotrado (fría + caliente)', unidad: 'ud', precio: 78 },
    { codigo: 'AG05', categoria: 'Agua fría y caliente', descripcion: 'Llave de corte de esfera 1/2"', unidad: 'ud', precio: 24 },
    { codigo: 'AG06', categoria: 'Agua fría y caliente', descripcion: 'Colector con llaves de corte por circuito', unidad: 'ud', precio: 145 },
    { codigo: 'AG07', categoria: 'Agua fría y caliente', descripcion: 'Grupo de presión doméstico instalado', unidad: 'ud', precio: 460 },
    { codigo: 'DE01', categoria: 'Desagües y saneamiento', descripcion: 'Bajante de PVC 110 mm, instalada', unidad: 'ml', precio: 28.5 },
    { codigo: 'DE02', categoria: 'Desagües y saneamiento', descripcion: 'Derivación de desagüe PVC 40/50 mm', unidad: 'ml', precio: 14.2 },
    { codigo: 'DE03', categoria: 'Desagües y saneamiento', descripcion: 'Bote sifónico registrable', unidad: 'ud', precio: 46 },
    { codigo: 'DE04', categoria: 'Desagües y saneamiento', descripcion: 'Desatasco con máquina eléctrica', unidad: 'h', precio: 68 },
    { codigo: 'DE05', categoria: 'Desagües y saneamiento', descripcion: 'Sumidero sifónico de ducha 15x15', unidad: 'ud', precio: 52 },
    { codigo: 'SA01', categoria: 'Sanitarios y griferías', descripcion: 'Inodoro con cisterna, instalado', unidad: 'ud', precio: 165 },
    { codigo: 'SA02', categoria: 'Sanitarios y griferías', descripcion: 'Lavabo con pedestal o mueble, instalado', unidad: 'ud', precio: 140 },
    { codigo: 'SA03', categoria: 'Sanitarios y griferías', descripcion: 'Plato de ducha de resina, instalado', unidad: 'ud', precio: 210 },
    { codigo: 'SA04', categoria: 'Sanitarios y griferías', descripcion: 'Mampara de ducha, montaje', unidad: 'ud', precio: 120 },
    { codigo: 'SA05', categoria: 'Sanitarios y griferías', descripcion: 'Grifería monomando de lavabo, instalada', unidad: 'ud', precio: 58 },
    { codigo: 'SA06', categoria: 'Sanitarios y griferías', descripcion: 'Grifería termostática de ducha, instalada', unidad: 'ud', precio: 96 },
    { codigo: 'SA07', categoria: 'Sanitarios y griferías', descripcion: 'Fregadero de cocina con grifería, instalado', unidad: 'ud', precio: 130 },
    { codigo: 'CA01', categoria: 'Calefacción y ACS', descripcion: 'Termo eléctrico 80 l, instalado', unidad: 'ud', precio: 320 },
    { codigo: 'CA02', categoria: 'Calefacción y ACS', descripcion: 'Calentador de gas estanco, instalado', unidad: 'ud', precio: 540 },
    { codigo: 'CA03', categoria: 'Calefacción y ACS', descripcion: 'Radiador de aluminio, montaje y purga', unidad: 'ud', precio: 95 },
    { codigo: 'CA04', categoria: 'Calefacción y ACS', descripcion: 'Suelo radiante, tubería y colocación', unidad: 'm2', precio: 42 },
    { codigo: 'CA05', categoria: 'Calefacción y ACS', descripcion: 'Mantenimiento anual de caldera', unidad: 'ud', precio: 85 },
    { codigo: 'RE01', categoria: 'Reparaciones', descripcion: 'Localización y reparación de fuga de agua', unidad: 'ud', precio: 130 },
    { codigo: 'RE02', categoria: 'Reparaciones', descripcion: 'Sustitución de flexo o latiguillo', unidad: 'ud', precio: 26 },
    { codigo: 'RE03', categoria: 'Reparaciones', descripcion: 'Reparación de cisterna (mecanismo completo)', unidad: 'ud', precio: 62 },
    { codigo: 'AU01', categoria: 'Auxiliares', descripcion: 'Apertura y cierre de roza en pared', unidad: 'ml', precio: 18 },
    { codigo: 'AU02', categoria: 'Auxiliares', descripcion: 'Retirada de escombros y limpieza', unidad: 'ud', precio: 60 },
    { codigo: 'AU03', categoria: 'Auxiliares', descripcion: 'Certificado de instalación / boletín', unidad: 'ud', precio: 90 }
  ];

  function estadoInicial() {
    return {
      version: VERSION,
      empresa: JSON.parse(JSON.stringify(EMPRESA)),
      ajustes: JSON.parse(JSON.stringify(AJUSTES)),
      clientes: [],
      tarifas: TARIFAS_BASE.map(function (t) {
        return { id: id(), codigo: t.codigo, categoria: t.categoria, descripcion: t.descripcion, unidad: t.unidad, precio: t.precio };
      }),
      presupuestos: [],
      facturas: [],
      contadores: { presupuesto: {}, factura: {} }
    };
  }

  /* ---------- persistencia ---------- */

  var estado = null;

  function cargar() {
    try {
      var bruto = localStorage.getItem(CLAVE);
      if (!bruto) { estado = estadoInicial(); guardar(); return estado; }
      var d = JSON.parse(bruto);
      estado = migrar(d);
    } catch (e) {
      console.warn('No se pudo leer el almacenamiento, se empieza de cero.', e);
      estado = estadoInicial();
    }
    return estado;
  }

  function migrar(d) {
    var base = estadoInicial();
    d = d && typeof d === 'object' ? d : {};
    return {
      version: VERSION,
      empresa: Object.assign({}, base.empresa, d.empresa || {}),
      ajustes: Object.assign({}, base.ajustes, d.ajustes || {}),
      clientes: Array.isArray(d.clientes) ? d.clientes : [],
      tarifas: Array.isArray(d.tarifas) && d.tarifas.length ? d.tarifas : base.tarifas,
      presupuestos: Array.isArray(d.presupuestos) ? d.presupuestos : [],
      facturas: Array.isArray(d.facturas) ? d.facturas : [],
      contadores: Object.assign({ presupuesto: {}, factura: {} }, d.contadores || {})
    };
  }

  var pendiente = null;
  function guardar() {
    if (pendiente) clearTimeout(pendiente);
    pendiente = setTimeout(function () {
      try {
        localStorage.setItem(CLAVE, JSON.stringify(estado));
      } catch (e) {
        alert('No se han podido guardar los datos: el navegador ha rechazado la escritura.\n\n' +
              'Descarga una copia de seguridad desde Ajustes antes de cerrar.');
      }
    }, 120);
  }

  function datos() { return estado || cargar(); }

  /* ---------- numeración ---------- */

  function siguienteNumero(tipo, fechaISO) {
    var d = datos();
    var anio = String(fechaISO || hoy()).slice(0, 4);
    var serie = tipo === 'factura' ? d.ajustes.serieFactura : d.ajustes.seriePresupuesto;
    var cont = d.contadores[tipo] || (d.contadores[tipo] = {});
    var n = (cont[anio] || 0) + 1;
    cont[anio] = n;
    guardar();
    return (serie ? serie + '-' : '') + anio + '-' + String(n).padStart(4, '0');
  }

  /* ---------- líneas y totales ---------- */

  function nuevaLinea(patron) {
    return Object.assign({
      id: id(),
      tipo: 'partida',
      codigo: '',
      descripcion: '',
      unidad: 'ud',
      uds: 1,
      largo: '',
      ancho: '',
      alto: '',
      precio: 0,
      dto: 0,
      iva: datos().ajustes.ivaDefecto
    }, patron || {});
  }

  /* Cantidad medida: uds × largo × ancho × alto (los campos vacíos no multiplican) */
  function cantidadLinea(l) {
    if (l.tipo === 'capitulo') return 0;
    var partes = ['uds', 'largo', 'ancho', 'alto'];
    var total = null;
    for (var i = 0; i < partes.length; i++) {
      var v = l[partes[i]];
      if (v === '' || v === null || v === undefined) continue;
      var n = evalMedicion(v);
      total = total === null ? n : total * n;
    }
    return redondear(total === null ? 0 : total, 3);
  }

  function importeLinea(l) {
    if (l.tipo === 'capitulo') return 0;
    var bruto = cantidadLinea(l) * num(l.precio);
    var dto = Math.min(Math.max(num(l.dto), 0), 100);
    return redondear(bruto * (1 - dto / 100), 2);
  }

  /* Totales de un documento (presupuesto o factura) */
  function totales(doc) {
    var lineas = (doc.lineas || []).filter(function (l) { return l.tipo !== 'capitulo'; });
    var bruto = 0;
    lineas.forEach(function (l) { bruto += importeLinea(l); });
    bruto = redondear(bruto, 2);

    var dtoGeneral = Math.min(Math.max(num(doc.descuento), 0), 100);
    var descuento = redondear(bruto * dtoGeneral / 100, 2);
    var base = redondear(bruto - descuento, 2);

    // IVA agrupado por tipo impositivo
    var grupos = {};
    lineas.forEach(function (l) {
      var tipo = num(l.iva);
      var imp = importeLinea(l) * (1 - dtoGeneral / 100);
      if (!grupos[tipo]) grupos[tipo] = { tipo: tipo, base: 0, cuota: 0 };
      grupos[tipo].base += imp;
    });
    var ivaTotal = 0;
    var listaIva = Object.keys(grupos).map(function (k) {
      var g = grupos[k];
      g.base = redondear(g.base, 2);
      g.cuota = redondear(g.base * g.tipo / 100, 2);
      ivaTotal += g.cuota;
      return g;
    }).sort(function (a, b) { return a.tipo - b.tipo; });
    ivaTotal = redondear(ivaTotal, 2);

    var irpfTipo = num(doc.irpf);
    var irpf = redondear(base * irpfTipo / 100, 2);
    var total = redondear(base + ivaTotal - irpf, 2);

    return {
      bruto: bruto,
      descuentoTipo: dtoGeneral,
      descuento: descuento,
      base: base,
      iva: listaIva,
      ivaTotal: ivaTotal,
      irpfTipo: irpfTipo,
      irpf: irpf,
      total: total,
      cobrado: cobrado(doc),
      pendiente: redondear(total - cobrado(doc), 2)
    };
  }

  function cobrado(doc) {
    var c = 0;
    (doc.cobros || []).forEach(function (x) { c += num(x.importe); });
    return redondear(c, 2);
  }

  /* Estado real de una factura teniendo en cuenta el vencimiento */
  function estadoFactura(f) {
    if (f.estado === 'borrador') return 'borrador';
    var t = totales(f);
    if (t.cobrado >= t.total - 0.01 && t.total > 0) return 'cobrada';
    if (f.vencimiento && f.vencimiento < hoy()) return 'vencida';
    return 'emitida';
  }

  /* ---------- importador de mediciones ---------- */
  /*
     Formatos admitidos, una línea por partida:
       # Capítulo
       Descripción ; unidad ; medición ; precio ; dto
       Descripción | unidad | medición | precio
       Descripción <TAB> unidad <TAB> medición <TAB> precio
       4 ud Punto de agua empotrado 78,00
       12,5 ml Tubería multicapa 20 mm
     La medición admite operaciones: 2x3,40  ·  3*(1,20+0,80)
     Si no se indica precio, se busca en la tarifa por código o descripción.
  */
  var UNIDADES = ['ud', 'uds', 'u', 'ml', 'm', 'm2', 'm²', 'm3', 'm³', 'h', 'kg', 'l', 'pa', 'jornada', 'día', 'dia'];

  function normalizarUnidad(u) {
    var s = String(u || '').toLowerCase().trim().replace(/\.$/, '');
    if (s === 'uds' || s === 'u' || s === 'unidad' || s === 'unidades') return 'ud';
    if (s === 'm²') return 'm2';
    if (s === 'm³') return 'm3';
    if (s === 'metros' || s === 'metro' || s === 'mts') return 'ml';
    if (s === 'horas' || s === 'hora' || s === 'hr') return 'h';
    if (s === 'dia' || s === 'día' || s === 'jornada') return 'jornada';
    return s || 'ud';
  }

  function buscarTarifa(texto) {
    var d = datos();
    var t = String(texto || '').trim().toLowerCase();
    if (!t) return null;
    var exacta = d.tarifas.filter(function (x) {
      return String(x.codigo).toLowerCase() === t || String(x.descripcion).toLowerCase() === t;
    })[0];
    if (exacta) return exacta;
    return d.tarifas.filter(function (x) {
      return String(x.descripcion).toLowerCase().indexOf(t) > -1;
    })[0] || null;
  }

  function importarMediciones(texto) {
    var resultado = { lineas: [], avisos: [] };
    var filas = String(texto || '').split(/\r?\n/);
    var ivaDef = datos().ajustes.ivaDefecto;

    filas.forEach(function (cruda, i) {
      var fila = cruda.trim();
      if (!fila) return;
      if (/^[-=_*]{3,}$/.test(fila)) return;

      // Capítulo
      if (/^#+\s*/.test(fila) || /^(cap[ií]tulo|capitulo)\s*[:.-]/i.test(fila)) {
        resultado.lineas.push(nuevaLinea({
          tipo: 'capitulo',
          descripcion: fila.replace(/^#+\s*/, '').replace(/^(cap[ií]tulo)\s*[:.-]\s*/i, '').trim()
        }));
        return;
      }

      var campos = null;
      if (fila.indexOf('\t') > -1) campos = fila.split('\t');
      else if (fila.indexOf(';') > -1) campos = fila.split(';');
      else if (fila.indexOf('|') > -1) campos = fila.split('|');

      if (campos) {
        campos = campos.map(function (c) { return c.trim(); }).filter(function (c, idx, arr) {
          return !(c === '' && (idx === 0 || idx === arr.length - 1));
        });
        var desc = campos[0] || '';
        var uni = campos[1] || '';
        var med = campos[2] !== undefined ? campos[2] : '1';
        var pre = campos[3];
        var dto = campos[4];
        var tarifa = (pre === undefined || pre === '') ? buscarTarifa(desc) : null;
        resultado.lineas.push(nuevaLinea({
          codigo: tarifa ? tarifa.codigo : '',
          descripcion: tarifa ? tarifa.descripcion : desc,
          unidad: normalizarUnidad(uni || (tarifa ? tarifa.unidad : 'ud')),
          uds: med === '' ? 1 : med,
          precio: pre !== undefined && pre !== '' ? num(pre) : (tarifa ? tarifa.precio : 0),
          dto: dto ? num(dto) : 0,
          iva: ivaDef
        }));
        if (!tarifa && (pre === undefined || pre === '')) {
          resultado.avisos.push('Línea ' + (i + 1) + ': sin precio y sin coincidencia en la tarifa («' + desc.slice(0, 40) + '»).');
        }
        return;
      }

      // Formato libre: «4 ud Punto de agua empotrado 78,00»
      var m = fila.match(/^([0-9][0-9.,]*(?:\s*[x×*]\s*[0-9][0-9.,]*)*)\s+([a-zA-Zª²³]+\.?)\s+(.+)$/);
      if (m && UNIDADES.indexOf(normalizarUnidad(m[2])) > -1) {
        var resto = m[3].trim();
        var precio = null;
        var mp = resto.match(/(?:@|\s)\s*([0-9]+(?:[.,][0-9]{1,2})?)\s*(?:€|eur|euros)?$/i);
        if (mp) { precio = num(mp[1]); resto = resto.slice(0, mp.index).trim(); }
        var t2 = precio === null ? buscarTarifa(resto) : null;
        resultado.lineas.push(nuevaLinea({
          codigo: t2 ? t2.codigo : '',
          descripcion: t2 ? t2.descripcion : resto,
          unidad: normalizarUnidad(m[2]),
          uds: m[1],
          precio: precio !== null ? precio : (t2 ? t2.precio : 0),
          iva: ivaDef
        }));
        if (precio === null && !t2) {
          resultado.avisos.push('Línea ' + (i + 1) + ': sin precio y sin coincidencia en la tarifa («' + resto.slice(0, 40) + '»).');
        }
        return;
      }

      // Solo descripción: se intenta con la tarifa
      var t3 = buscarTarifa(fila);
      resultado.lineas.push(nuevaLinea({
        codigo: t3 ? t3.codigo : '',
        descripcion: t3 ? t3.descripcion : fila,
        unidad: t3 ? t3.unidad : 'ud',
        uds: 1,
        precio: t3 ? t3.precio : 0,
        iva: ivaDef
      }));
      if (!t3) resultado.avisos.push('Línea ' + (i + 1) + ': no se ha reconocido el formato, se ha añadido con cantidad 1 y precio 0.');
    });

    return resultado;
  }

  /* ---------- copia de seguridad ---------- */

  function exportar() {
    return JSON.stringify(datos(), null, 2);
  }

  function importar(json) {
    var d = JSON.parse(json);
    if (!d || typeof d !== 'object') throw new Error('El archivo no contiene datos válidos.');
    estado = migrar(d);
    guardar();
    return estado;
  }

  function borrarTodo() {
    estado = estadoInicial();
    guardar();
    return estado;
  }

  global.Datos = {
    CLAVE: CLAVE,
    id: id, hoy: hoy, sumarDias: sumarDias, num: num, redondear: redondear,
    euros: euros, cantidad: cantidad, fecha: fecha, evalMedicion: evalMedicion,
    normalizarUnidad: normalizarUnidad, unidades: UNIDADES,
    cargar: cargar, guardar: guardar, datos: datos,
    siguienteNumero: siguienteNumero,
    nuevaLinea: nuevaLinea, cantidadLinea: cantidadLinea, importeLinea: importeLinea,
    totales: totales, cobrado: cobrado, estadoFactura: estadoFactura,
    buscarTarifa: buscarTarifa, importarMediciones: importarMediciones,
    exportar: exportar, importar: importar, borrarTodo: borrarTodo,
    tarifasBase: TARIFAS_BASE
  };
})(window);
