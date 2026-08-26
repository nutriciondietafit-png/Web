/* =====================================================================
   MAGIA FIT ALMERÍA — CONFIGURACIÓN ÚNICA DEL SITIO
   ---------------------------------------------------------------------
   ⚠️  EDITA SOLO ESTE ARCHIVO para cambiar teléfono, tarifas, horarios,
   dirección y textos del bot. Todo lo demás (web + chatbot + enlaces de
   WhatsApp) lee estos datos automáticamente.

   ⚠️  DATOS PENDIENTES DE CONFIRMAR (marcados con REVISAR):
       tarifas, horarios, dirección exacta y coordenadas.
   ===================================================================== */
window.MAGIAFIT = {
  marca: "Magia Fit Almería",
  claim: "Tu transformación empieza hoy",

  // --- Contacto ---
  whatsapp: "34637254347",
  telefonoBonito: "+34 637 254 347",
  instagram: "magiafitalmeria",
  instagramUrl: "https://www.instagram.com/magiafitalmeria/",
  email: "magiafitalmeria2017@gmail.com",

  // --- Reseñas oficiales de Google ---
  google: { nota: "5,0", resenas: 142 },

  // --- Localización (REVISAR: dirección y coordenadas exactas) ---
  ciudad: "Almería",
  direccion: "Almería, España",
  codigoPostal: "04001",
  zonas: ["Almería Centro", "El Zapillo", "Nueva Almería", "Retamar",
          "Huércal de Almería", "Roquetas de Mar", "Aguadulce", "Vícar", "El Ejido"],
  mapaUrl: "https://www.google.com/maps/search/?api=1&query=gimnasio+Almer%C3%ADa",

  // --- Horarios (REVISAR) ---
  horario: {
    texto: "Lunes a viernes de 7:00 a 22:00 · Sábados de 9:00 a 14:00 · Domingos cerrado",
    schema: [
      { dias: ["Monday","Tuesday","Wednesday","Thursday","Friday"], abre: "07:00", cierra: "22:00" },
      { dias: ["Saturday"], abre: "09:00", cierra: "14:00" }
    ]
  },

  // --- Tarifas reales (Tabla de Servicios de Magia Fit) ---
  // El precio del grupo reducido es por cada 4 semanas.
  grupoReducido: [
    { id: "basic",         nombre: "BASIC",      horas: 2, precio: 88,  destacado: false },
    { id: "standard",      nombre: "STANDARD",   horas: 3, precio: 129, destacado: false },
    { id: "standard-plus", nombre: "STANDARD +", horas: 4, precio: 150, destacado: false },
    { id: "premium",       nombre: "PREMIUM",    horas: 5, precio: 160, destacado: true  }
  ],

  complementos: [
    {
      id: "bonos",
      nombre: "Bonos de sesiones",
      resumen: "Sesiones sueltas, a tu ritmo",
      lineas: [ { concepto: "5 sesiones", precio: 200 }, { concepto: "10 sesiones", precio: 370 } ],
      nota: "Primera valoración gratuita"
    },
    {
      id: "online",
      nombre: "Entrenamiento online",
      resumen: "Entrenes donde entrenes",
      lineas: [ { concepto: "12 semanas", precio: 180 } ],
      nota: "Incluye 15 min de videollamada cada semana"
    },
    {
      id: "masaje",
      nombre: "Masaje deportivo",
      resumen: "Sesiones de 1 hora",
      lineas: [ { concepto: "Sesión suelta", precio: 35 },
                { concepto: "Bono de 5 sesiones", precio: 150, unidad: 30 },
                { concepto: "Bono de 10 sesiones", precio: 280, unidad: 28 } ],
      nota: "Masaje deportivo específico"
    }
  ],

  // Datos que figuran en la tabla de servicios
  extras: {
    prueba: "La primera valoración es GRATUITA.",
    grupo: "Se entrena en grupo reducido, de 4 a 6 personas."
  },

  servicios: [
    "Entrenamiento personal", "Musculación y fuerza", "Pérdida de grasa",
    "Ganancia de masa muscular", "Readaptación de lesiones",
    "Clases dirigidas", "Entrenamiento online", "Recomposición corporal"
  ]
};
