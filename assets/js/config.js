/* =====================================================================
   INDALODIVE — CONFIGURACIÓN ÚNICA DEL SITIO
   ---------------------------------------------------------------------
   ⚠️  EDITA SOLO ESTE ARCHIVO para cambiar los enlaces de productos, los
   textos del hero, el contacto y las cifras. La web (index.html) se
   construye sola leyendo estos datos: no hace falta tocar el HTML para
   añadir, quitar o reordenar un enlace.

   ⚠️  TODO LO MARCADO CON «REVISAR» ES PROVISIONAL: son ejemplos puestos
   para que la web se vea completa. Sustitúyelos por tus datos reales
   antes de publicar.
   ===================================================================== */
window.INDALO = {

  /* ── Marca ──────────────────────────────────────────────────────── */
  marca: "IndaloDive",
  claim: "El azul empieza aquí",                       // REVISAR
  subclaim: "Inmersiones, cursos y equipo. Todos mis enlaces, en un solo sitio.",
  ubicacion: "Almería · Cabo de Gata",                 // REVISAR: tu zona real

  /* ── Instagram ──────────────────────────────────────────────────── */
  instagram: {
    usuario: "indalodive",
    url: "https://www.instagram.com/indalodive/",
    // Si usas un servicio de feed (Behold, EmbedSocial…), pega aquí la URL
    // del JSON y la galería se actualizará sola en cada visita.
    // Si lo dejas vacío, se usan las fotos de assets/js/feed.js, que genera
    // el script scripts/sync-instagram.mjs. Ver README.
    feedJson: ""
  },

  /* ── Contacto ───────────────────────────────────────────────────── */
  whatsapp: "34600000000",                             // REVISAR: sin + ni espacios
  telefonoBonito: "+34 600 000 000",                   // REVISAR
  email: "hola@indalodive.com",                        // REVISAR
  mapaUrl: "https://www.google.com/maps/search/?api=1&query=Cabo+de+Gata+buceo",  // REVISAR

  /* ── Cifras del hero (REVISAR: pon las tuyas reales) ────────────── */
  cifras: [
    { valor: "+500", texto: "inmersiones guiadas" },
    { valor: "12",   texto: "puntos de buceo" },
    { valor: "5,0",  texto: "valoración media" }
  ],

  /* ── Profundidad máxima del medidor lateral (efecto visual) ─────── */
  profundidadMax: 40,

  /* ── Categorías de los enlaces (los filtros de la sección) ──────── */
  categorias: [
    { id: "todos",       nombre: "Todos"       },
    { id: "cursos",      nombre: "Cursos"      },
    { id: "inmersiones", nombre: "Inmersiones" },
    { id: "tienda",      nombre: "Tienda"      },
    { id: "contacto",    nombre: "Contacto"    }
  ],

  /* ── ENLACES DE PRODUCTO ────────────────────────────────────────────
     Esto es el corazón de la web. Cada objeto es una tarjeta.

       id         identificador corto y único (se usa en las estadísticas)
       categoria  una de las de arriba
       titulo     nombre del producto
       texto      una línea explicando qué es
       precio     opcional; texto libre ("desde 60 €", "gratis"…)
       etiqueta   opcional; distintivo de color ("Nuevo", "Últimas plazas"…)
       destacado  true = tarjeta grande y resaltada (usa 1 o 2 como mucho)
       icono      uno de: burbuja, bombona, olas, camara, tienda, whatsapp,
                  instagram, mapa, calendario
       url        ⚠️ REVISAR: aquí van TUS enlaces reales de reserva/compra
       wa         true = el enlace se genera solo hacia tu WhatsApp con el
                  texto de `mensaje`
     ------------------------------------------------------------------ */
  enlaces: [
    {
      id: "bautismo",
      categoria: "inmersiones",
      titulo: "Bautismo de buceo",
      texto: "Tu primera inmersión, sin experiencia previa y con instructor.",
      precio: "desde 60 €",                            // REVISAR
      etiqueta: "Más reservado",
      destacado: true,
      icono: "burbuja",
      url: "#",                                        // REVISAR
      wa: true,
      mensaje: "¡Hola IndaloDive! Quiero reservar un bautismo de buceo 🤿"
    },
    {
      id: "open-water",
      categoria: "cursos",
      titulo: "Curso Open Water",
      texto: "Certifícate como buceador autónomo hasta 18 metros.",
      precio: "desde 350 €",                           // REVISAR
      icono: "bombona",
      url: "#"                                         // REVISAR
    },
    {
      id: "advanced",
      categoria: "cursos",
      titulo: "Advanced y especialidades",
      texto: "Profundidad, navegación, nocturna y buceo con nitrox.",
      icono: "bombona",
      url: "#"                                         // REVISAR
    },
    {
      id: "inmersiones-guiadas",
      categoria: "inmersiones",
      titulo: "Inmersiones guiadas",
      texto: "Para titulados: salidas a los mejores puntos de la zona.",
      precio: "desde 40 €",                            // REVISAR
      icono: "olas",
      url: "#"                                         // REVISAR
    },
    {
      id: "snorkel",
      categoria: "inmersiones",
      titulo: "Rutas de snorkel",
      texto: "Plan en familia, sin botella y desde la superficie.",
      etiqueta: "Familias",
      icono: "mapa",
      url: "#"                                         // REVISAR
    },
    {
      id: "fotos",
      categoria: "tienda",
      titulo: "Fotos y vídeo de tu inmersión",
      texto: "Te llevas el recuerdo editado el mismo día.",
      icono: "camara",
      url: "#"                                         // REVISAR
    },
    {
      id: "equipo",
      categoria: "tienda",
      titulo: "Mi equipo de buceo",
      texto: "Lo que uso y recomiendo, con enlaces directos.",
      etiqueta: "Nuevo",
      icono: "tienda",
      url: "#"                                         // REVISAR
    },
    {
      id: "reservar",
      categoria: "contacto",
      titulo: "Reserva por WhatsApp",
      texto: "Cuéntame qué buscas y te propongo fecha y plan.",
      destacado: true,
      icono: "whatsapp",
      wa: true,
      mensaje: "¡Hola IndaloDive! Vengo de la web y quiero información 🤿"
    },
    {
      id: "instagram",
      categoria: "contacto",
      titulo: "Sígueme en Instagram",
      texto: "Fondos, fauna y cada salida, en @indalodive.",
      icono: "instagram",
      url: "https://www.instagram.com/indalodive/"
    }
  ],

  /* ── Bloque «Sobre» (REVISAR: escríbelo con tus palabras) ───────── */
  sobre: {
    titulo: "Bajo la superficie",
    texto: "IndaloDive nace de una idea sencilla: que cualquiera pueda asomarse a lo que hay debajo. Grupos pequeños, material revisado y un ritmo tranquilo para que la inmersión se disfrute, no se aguante.",
    puntos: [
      "Grupos reducidos",
      "Material incluido",
      "Instructor titulado",                            // REVISAR
      "Fotos de recuerdo"
    ]
  },

  /* ── Pie ────────────────────────────────────────────────────────── */
  aviso: "Las salidas están sujetas a las condiciones del mar y a la normativa vigente."
};
