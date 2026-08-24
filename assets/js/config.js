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
  whatsapp: "34682546257",            // número provisional facilitado
  telefonoBonito: "+34 682 546 257",
  instagram: "magiafitalmeria",
  instagramUrl: "https://www.instagram.com/magiafitalmeria/",
  email: "nutriciondietafit@gmail.com",

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

  // --- Tarifas (REVISAR antes de publicar) ---
  tarifas: [
    {
      id: "start",
      nombre: "START",
      resumen: "Empieza sin excusas",
      mensual: 34.90, trimestral: 94.90, anual: 349,
      destacado: false,
      incluye: [
        "Acceso libre a sala de musculación y cardio",
        "Rutina inicial personalizada",
        "Medición corporal de bienvenida",
        "App de seguimiento de entrenos"
      ]
    },
    {
      id: "magia",
      nombre: "MAGIA",
      resumen: "El plan que más transforma",
      mensual: 59.90, trimestral: 159.90, anual: 599,
      destacado: true,
      incluye: [
        "Todo lo del plan START",
        "Plan de entrenamiento personalizado mensual",
        "Asesoramiento nutricional adaptado",
        "Clases dirigidas ilimitadas",
        "Revisión de progreso cada 30 días"
      ]
    },
    {
      id: "elite",
      nombre: "ÉLITE",
      resumen: "Entrenamiento personal 1 a 1",
      mensual: 129, trimestral: 349, anual: 1290,
      destacado: false,
      incluye: [
        "Todo lo del plan MAGIA",
        "8 sesiones de entrenador personal al mes",
        "Nutrición y suplementación a medida",
        "Contacto directo por WhatsApp con tu coach",
        "Seguimiento de fotos y métricas semanal"
      ]
    }
  ],

  // Extras que el bot puede citar (REVISAR)
  extras: {
    matricula: "Matrícula 0 € durante la promoción de bienvenida.",
    prueba: "Primera clase de prueba y asesoramiento inicial GRATIS.",
    permanencia: "Sin permanencia en las cuotas mensuales.",
    pago: "Pago con tarjeta, Bizum, domiciliación o efectivo."
  },

  servicios: [
    "Entrenamiento personal", "Musculación y fuerza", "Pérdida de grasa",
    "Ganancia de masa muscular", "Asesoramiento nutricional",
    "Clases dirigidas", "Entrenamiento online", "Recomposición corporal"
  ]
};
