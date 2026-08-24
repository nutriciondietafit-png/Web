# Magia Fit Almería — web oficial

Landing page de alto rendimiento para **gimnasio y entrenamiento personal en Almería**, con estética *lujo futurista*, SEO local, galería de Instagram, comparador de transformaciones, asistente virtual (**MAGI**) y un embudo cuyo único objetivo es **agendar llamadas** o **derivar a WhatsApp**.

Sitio 100 % estático: HTML + CSS + JavaScript sin dependencias ni build. Se publica tal cual en cualquier hosting.

---

## ⚠️ Antes de publicar (obligatorio)

Estos puntos están rellenos con **contenido provisional** y hay que revisarlos:

| Qué | Dónde | Nota |
|---|---|---|
| **Tarifas** (34,90 / 59,90 / 129 €) | `assets/js/config.js` → `tarifas` | Precios de ejemplo. Cámbialos por los reales. También aparecen en el JSON-LD de `index.html` (`hasOfferCatalog` y `FAQPage`). |
| **Horario** | `assets/js/config.js` → `horario` | Ejemplo. Actualiza texto y `openingHoursSpecification` en `index.html`. |
| **Dirección y coordenadas** | `assets/js/config.js` → `direccion`, y `geo` en el JSON-LD | Ahora mismo solo pone “Almería, España”. |
| **Cifras del hero** (500+, 12 semanas…) | `index.html` → `.hero__stats` | Son estimaciones de marketing: ajústalas a datos reales. |
| **Textos de las transformaciones** | `index.html` → sección `#transformaciones` | Añade datos reales y consigue el consentimiento por escrito de cada cliente para publicar sus fotos. |
| **Datos fiscales** | `aviso-legal.html`, `privacidad.html` | Sustituye `[RAZÓN SOCIAL]`, `[NIF/CIF]` y `[DIRECCIÓN COMPLETA]`. |
| **Dominio** | `index.html` (canonical, OG, JSON-LD), `robots.txt`, `sitemap.xml` | Ahora apuntan a `https://magiafitalmeria.es/`. |

---

## 📸 Poner las fotos reales de Instagram

Las imágenes actuales son **marcadores SVG** generados a medida (no se pudo acceder a Instagram desde el entorno de desarrollo). Sustituirlas es directo:

1. **Logo** → reemplaza `assets/img/logo.svg` por el logo real de `@magiafitalmeria`.
   Si lo tienes en PNG/JPG, guárdalo como `assets/img/logo.png` y cambia las 4 referencias:
   ```bash
   grep -rl "assets/img/logo.svg" . | xargs sed -i 's#assets/img/logo.svg#assets/img/logo.png#g'
   ```
2. **Galería de Instagram** → sustituye `assets/img/gallery/01.svg` … `09.svg` por las fotos reales
   (recomendado: JPG/WebP, formato vertical 4:5, ~1080×1350 px). Si cambias la extensión,
   actualiza el `src` en la sección `#instagram` de `index.html`.
3. **Transformaciones** → `assets/img/transform/antes-1.svg` / `despues-1.svg` (y 2, 3).
   Usa el mismo encuadre, distancia y luz en el antes y el después: el comparador funciona mucho mejor.
4. **Imagen para compartir en redes** → `assets/img/og-cover.svg` (1200×630).

Las frases motivadoras y las etiquetas «Transformación» de cada foto se editan en el HTML,
dentro de cada `<figcaption>`.

> **Importante:** publica únicamente fotos propias o con permiso, y con el consentimiento
> firmado del cliente en el caso de las transformaciones (dato de salud según el RGPD).

### Opción B: feed de Instagram automático
Si prefieres que la galería se actualice sola, usa un widget de terceros (Elfsight, LightWidget,
Behold, SnapWidget) o la *Instagram Basic Display API*, y sustituye el `<div class="ig-grid">`
por el embed correspondiente. La estética de la sección se mantiene.

---

## ☎️ Teléfono y enlaces de WhatsApp

El número **+34 682 546 257** (provisional) está centralizado en `assets/js/config.js`:

```js
whatsapp: "34682546257",        // sin +, sin espacios
telefonoBonito: "+34 682 546 257"
```

Cambiarlo ahí actualiza automáticamente: botón flotante, botones del hero, tarifas, formulario,
pie de página, FAQ y todas las respuestas del bot. La única referencia adicional está en el
JSON-LD de `index.html` (`"telephone"`).

Todos los enlaces se generan con `https://wa.me/<número>?text=<mensaje precargado>`, y cada
botón lleva un mensaje distinto para saber de qué sección viene el contacto.

---

## 🤖 MAGI, el asistente virtual

`assets/js/chatbot.js` — bot por reglas, sin servidor, sin coste y sin dependencias.

- Entiende ~20 intenciones: tarifas, horarios, ubicación, clase de prueba, permanencia,
  formas de pago, nutrición, perder grasa, ganar músculo, principiantes, lesiones, online,
  clases dirigidas, transformaciones, Instagram, contacto, agendar…
- Normaliza acentos y signos, así que «¿cuanto cuesta?» y «¿Cuánto cuesta?» funcionan igual.
- Lee las tarifas de `config.js`: si cambias los precios, el bot los cambia solos.
- Botones de respuesta rápida + salida a WhatsApp siempre visible.
- Tras 3 preguntas recuerda el CTA de la llamada.

**Añadir una respuesta nueva:** añade un objeto al array `INTENTS`:

```js
{
  id: 'ducha',
  keys: ['ducha', 'duchas', 'vestuario', 'taquilla'],
  reply: () => `Sí, tenemos vestuarios con duchas y taquillas 🚿`
}
```

Si algún día quieres un bot con IA real, el punto de enganche es la función `send()`:
sustituye `match(text)` por una llamada a tu backend (nunca pongas una API key en el front).

---

## 🔍 SEO incluido

- `<title>` y meta description orientados a **«gimnasio en Almería»**.
- Datos estructurados JSON-LD: `ExerciseGym` + `LocalBusiness`, `WebSite`, `FAQPage`,
  `BreadcrumbList` y `OfferCatalog` con los tres planes.
- Metadatos geográficos (`geo.region`, `geo.position`, `ICBM`) y `areaServed` con los municipios.
- Bloque de texto local con palabras clave y las zonas de la provincia.
- Open Graph + Twitter Card, canonical, `hreflang`, `robots.txt`, `sitemap.xml` y `site.webmanifest`.
- HTML semántico, jerarquía de encabezados correcta, `alt` descriptivos, `loading="lazy"`.

**Siguientes pasos recomendados fuera del código:** dar de alta el **Perfil de Empresa de Google**
(el factor nº 1 en búsquedas locales), enlazar la web desde la bio de Instagram y pedir reseñas.

---

## 🚀 Publicar

No hay que compilar nada. Sube la carpeta a cualquier hosting estático:

- **Netlify / Vercel / Cloudflare Pages:** arrastra la carpeta o conecta el repositorio.
- **GitHub Pages:** Settings → Pages → Deploy from branch.
- **Hosting clásico (Hostinger, IONOS…):** sube todo por FTP a `public_html`.

Para probar en local:

```bash
python3 -m http.server 8080   # y abre http://localhost:8080
```

---

## 📁 Estructura

```
index.html               Página principal (todas las secciones)
aviso-legal.html         Aviso legal
privacidad.html          Política de privacidad (RGPD)
cookies.html             Política de cookies
404.html                 Página de error
robots.txt · sitemap.xml · site.webmanifest
assets/
  css/style.css          Estilos completos
  js/config.js           ⭐ Teléfono, tarifas, horarios, zonas (edita solo esto)
  js/main.js             Interacciones: hero animado, scroll, tarifas, formulario
  js/chatbot.js          Asistente MAGI
  img/logo.svg           Logo (sustituir por el real)
  img/gallery/           9 fotos de Instagram (sustituir)
  img/transform/         Pares antes/después (sustituir)
```

---

## ♿ Accesibilidad y rendimiento

- Contraste alto sobre fondo oscuro, foco visible, `skip-link`, `aria-*` en menú, bot y formulario.
- Respeta `prefers-reduced-motion`: desactiva partículas, parallax y animaciones.
- Sin librerías externas: el único recurso de terceros son las tipografías de Google Fonts
  (si quieres 0 dependencias, descárgalas y sírvelas en local).
- El canvas del hero se detiene al cambiar de pestaña.
