# Magia Fit Almería — web oficial

Landing page de alto rendimiento para **gimnasio y entrenamiento personal en Almería**, con estética *lujo futurista*, SEO local, galería de Instagram, comparador de transformaciones, asistente virtual (**MAGI**) y un embudo cuyo único objetivo es **agendar llamadas** o **derivar a WhatsApp**.

Sitio 100 % estático: HTML + CSS + JavaScript sin dependencias ni build. Se publica tal cual en cualquier hosting.

---

## ⚠️ Antes de publicar (obligatorio)

Estos puntos están rellenos con **contenido provisional** y hay que revisarlos:

| Qué | Dónde | Nota |
|---|---|---|
| **Tarifas** | `assets/js/config.js` → `grupoReducido` y `complementos` | ✅ Ya son las reales, tomadas de la Tabla de Servicios. Si cambian, actualiza también el JSON-LD de `index.html` (`hasOfferCatalog` y `FAQPage`), que no se genera solo. |
| **Horario** | `assets/js/config.js` → `horario` | Ejemplo. Actualiza texto y `openingHoursSpecification` en `index.html`. |
| **Dirección y coordenadas** | `assets/js/config.js` → `direccion`, y `geo` en el JSON-LD | Ahora mismo solo pone “Almería, España”. |
| **Cifras del hero** | `index.html` → `.hero__stats` | Reales: 100+ transformaciones, 8 años, 5,0 con 142 reseñas en Google y seguimiento 24 h. Actualiza el número de reseñas cuando crezca (también en `config.js` → `google`, que es lo que cita el bot). |
| **Nutrición** | — | Retirada de toda la web *por ahora*, a petición del cliente: método, planes, FAQ, textos SEO, datos estructurados, servicios del pie y respuestas del bot. Para recuperarla habría que reponerla en esos mismos sitios. |
| **Horario y dirección** | `assets/js/config.js` → `horario`, `direccion` | ⚠️ Siguen siendo de ejemplo. También hay que actualizar `openingHoursSpecification` y `geo` en el JSON-LD de `index.html`. |
| **Consentimiento de imagen** | sección `#transformaciones` | La foto y los datos (−8 kg / +2 kg) salen de vuestro Instagram. Asegúrate de tener el consentimiento por escrito de la socia. |
| **Datos fiscales** | `aviso-legal.html`, `privacidad.html` | Sustituye `[RAZÓN SOCIAL]`, `[NIF/CIF]` y `[DIRECCIÓN COMPLETA]`. |
| **Dominio** | `index.html` (canonical, OG, JSON-LD), `robots.txt`, `sitemap.xml` | Ahora apuntan a `https://magia-fit-almeria.vercel.app`. Cuando tengas el dominio propio, cámbialo con `./cambiar-dominio.sh https://tu-dominio.es`. |

---

## 📸 Imágenes

Todas las imágenes de la web son **material real de @magiafitalmeria**, recortado a
partir de capturas del perfil: se eliminó el interfaz de Instagram (barra de estado,
cabecera, barra de acciones y pie) y la insignia de carrusel, y se exportaron en 4:5
como JPEG progresivo.

```
assets/img/logo.png                                        Escudo oficial, fondo transparente
assets/img/favicon.png                                     Icono de pestaña
assets/img/og-cover.jpg                                    Vista previa al compartir el enlace
assets/img/instagram/01-analizamos.jpg  …  11-siete-meses.jpg   Galería, 11 publicaciones (900x1125)
assets/img/transformaciones/01-menos-100kg.jpg                  Casos reales (900x1125)
assets/img/transformaciones/02-recomposicion-4-meses.jpg
assets/img/transformaciones/03-recomposicion-3-meses.jpg
```

Retoques que hubo que hacer más allá de recortar el interfaz:

- `08-readaptacion`: la insignia «1/7» del carrusel tapaba el escudo de la marca de
  agua. Se limpió la esquina y se repintó el escudo con `logo.png` al 55 % de opacidad.
- `06-numeros`: había avatares del interfaz de Instagram sobre la franja inferior.
  Se rellenó clonando el bokeh limpio del lado derecho, con los bordes difuminados.
- `07-salud-lesiones`: los avatares caían encima del botón «¡envíanos tu mensaje!»,
  y no se podía reconstruir el texto tapado. Se recortó por encima del botón y se
  extendió el suelo hacia abajo, muy desenfocado y oscurecido, hasta recuperar el 4:5.
  El resultado se lee como una sombra de profundidad de campo.


Además de recortar el interfaz, en dos publicaciones hubo que retocar:
en `05-readaptacion` la insignia «1/7» del carrusel tapaba el escudo de la marca de
agua, así que se limpió la esquina y se repintó el escudo con `logo.png` al 55 % de
opacidad; en `06-numeros` había avatares del interfaz de Instagram sobre la franja
inferior, que se rellenó clonando el bokeh limpio del lado derecho.


### Añadir más publicaciones a la galería

1. Guarda la imagen en `assets/img/instagram/` como `05-loquesea.jpg`, en 4:5 (900x1125).
2. Duplica un bloque `<a class="ig-card">` en la sección `#instagram` de `index.html`
   y cambia `src` y `alt`. La rejilla es de 4 columnas: van bien de 4 en 4.

### Añadir más transformaciones

La sección `#transformaciones` muestra **tres casos** con la imagen compuesta tal y
como se publica en Instagram. Para añadir otro, duplica un bloque `<figure class="caso">`
y cambia la imagen, el tiempo y las cifras. La clase `caso--top` marca el destacado.

> Si algún día tienes **pares de fotos sueltas** de antes y después (mismo encuadre,
> misma distancia y misma luz), se puede recuperar el comparador deslizante que había
> antes: es mucho más vistoso, pero necesita las dos fotos por separado, no la
> composición ya montada.

**Importante:** las fotos de transformaciones son datos de salud según el RGPD.
Publica solo con el consentimiento por escrito de la persona.

### Feed automático de Instagram
Si prefieres que la galería se actualice sola, usa un widget de terceros (Elfsight,
LightWidget, Behold, SnapWidget) o la *Instagram Basic Display API*, y sustituye el
`<div class="ig-grid">` por el embed correspondiente.

### Sobre el logo
`assets/img/logo.png` es el escudo oficial con **fondo transparente**: en tema oscuro
se muestra en blanco y en tema claro el CSS lo invierte a negro (`--logo-filter`).
Si lo cambias, mantén el fondo transparente y la marca en blanco.

## ☎️ Teléfono y enlaces de WhatsApp

El número **+34 637 254 347** está centralizado en `assets/js/config.js`:

```js
whatsapp: "34637254347",        // sin +, sin espacios
telefonoBonito: "+34 637 254 347"
```

Cambiarlo ahí actualiza automáticamente: botón flotante, botones del hero, tarifas, formulario,
pie de página, FAQ y todas las respuestas del bot. La única referencia adicional está en el
JSON-LD de `index.html` (`"telephone"`).

Todos los enlaces se generan con `https://wa.me/<número>?text=<mensaje precargado>`, y cada
botón lleva un mensaje distinto para saber de qué sección viene el contacto.

---

## 💶 Tarifas

Todas salen de la **Tabla de Servicios** y viven en `assets/js/config.js`:

| Grupo reducido (4-6 personas) | Horas/semana | Cada 4 semanas | Sale a |
|---|---|---|---|
| BASIC | 2 h | 88 € | 11,00 €/h |
| STANDARD | 3 h | 129 € | 10,75 €/h |
| STANDARD + | 4 h | 150 € | 9,38 €/h |
| PREMIUM | 5 h | 160 € | 8,00 €/h |

- **Bonos de sesiones:** 5 por 200 € · 10 por 370 € · primera valoración gratuita
- **Online:** 180 € las 12 semanas, con 15 min de videollamada semanal
- **Masaje deportivo (1 h):** suelta 35 € · bono de 5 por 150 € (30 €/ud) · bono de 10 por 280 € (28 €/ud)

El precio por hora y el número de sesiones se calculan solos, no hay que escribirlos.
La etiqueta «mejor precio por hora» del PREMIUM es un hecho derivado de sus propios
números, no una afirmación de marketing.

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

## 🚀 Publicar en Vercel

No hay que compilar nada: es HTML estático y `vercel.json` ya lo deja configurado
(sin build, cabeceras de seguridad y caché en el CDN que se limpia en cada despliegue).

### Primera vez

1. Entra en [vercel.com](https://vercel.com) y crea la cuenta con **Continue with GitHub**.
2. **Add New… → Project** y busca el repositorio **`nutriciondietafit-png/Web`**.
   Si no aparece, pulsa *Adjust GitHub App Permissions* y dale acceso al repo.
3. En la pantalla de configuración:
   - **Project Name:** `magia-fit-almeria` ← ponlo exactamente así, es lo que
     determina la URL `magia-fit-almeria.vercel.app` que ya está en las etiquetas SEO.
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - Build y Output: **déjalos vacíos**, `vercel.json` se encarga.
4. **Deploy**. En menos de un minuto la web está online.

La rama `claude/magia-fit-almeria-website-4kdrca` es la rama por defecto del repositorio,
así que Vercel la usa como **producción** automáticamente. A partir de ahí, cada `git push`
vuelve a desplegar solo.

> Si Vercel te asigna una URL distinta (porque el nombre estuviera ocupado), ejecútalo
> con la URL real para que las etiquetas SEO coincidan:
> ```bash
> ./cambiar-dominio.sh https://la-url-que-te-dio.vercel.app
> git add -A && git commit -m "Actualizar dominio" && git push
> ```

### Conectar el dominio propio (cuando lo tengas)

1. En Vercel: **Settings → Domains → Add**, escribe el dominio y sigue las instrucciones
   de DNS que te dé (un registro `A` o `CNAME` en tu proveedor). El HTTPS es automático.
2. Actualiza las URLs del código y súbelo:
   ```bash
   ./cambiar-dominio.sh https://magiafitalmeria.es
   git add -A && git commit -m "Actualizar dominio" && git push
   ```

⚠️ **Sobre el SEO:** posicionar en `.vercel.app` y mudarse después a un dominio propio
obliga a rehacer buena parte del trabajo (Google trata cada dominio por separado).
Si el dominio definitivo ya lo tienes decidido, compensa conectarlo antes de empezar a
promocionar la web y de dar de alta el Perfil de Empresa de Google.

### Probar en local

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
vercel.json              Configuración de despliegue en Vercel
cambiar-dominio.sh       Cambia el dominio en todas las URLs de golpe
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
