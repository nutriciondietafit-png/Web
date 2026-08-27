# IndaloDive — web oficial

Página web de **@indalodive**: un *link in bio* con esteroides. Su único trabajo es
llevar a quien llega desde Instagram al enlace del producto que le interesa
(bautismos, cursos, inmersiones, snorkel, tienda) y, si tiene dudas, ponerlo en
WhatsApp contigo en un toque.

Estética minimalista de fondo marino: la página **desciende** mientras haces
scroll —el agua se oscurece, la luz se apaga y un medidor lateral marca los
metros— con burbujas, galería de Instagram con visor a pantalla completa y
filtros por tipo de actividad.

Sitio 100 % estático: HTML + CSS + JavaScript, sin dependencias ni compilación.
Se publica tal cual en cualquier hosting.

---

## ⚠️ Antes de publicar (obligatorio)

Todo esto está relleno con **contenido de ejemplo** y hay que revisarlo. Está
marcado con `REVISAR` dentro de `assets/js/config.js`.

| Qué | Dónde | Nota |
|---|---|---|
| **Enlaces de producto** | `assets/js/config.js` → `enlaces` | Ahora mismo 6 apuntan a `"#"`. Pon las URLs reales de reserva/compra. Mientras haya alguno sin poner, al abrir la web en local sale un aviso naranja abajo a la izquierda. |
| **WhatsApp** | `config.js` → `whatsapp`, `telefonoBonito` | Es `+34 600 000 000` de ejemplo. El número va sin `+` ni espacios: `34XXXXXXXXX`. |
| **Correo** | `config.js` → `email` | Ejemplo: `hola@indalodive.com`. |
| **Cifras del hero** | `config.js` → `cifras` | +500 inmersiones, 12 puntos, 5,0 de nota son inventadas. Pon las tuyas o quita las que no puedas justificar. |
| **Ubicación y mapa** | `config.js` → `ubicacion`, `mapaUrl` | Pone «Almería · Cabo de Gata». Cámbialo por tu zona real y enlaza tu punto en Google Maps. |
| **Precios** | `config.js` → `enlaces[].precio` | «desde 60 €», «desde 350 €»… son ejemplos. |
| **Texto de «Sobre mí»** | `config.js` → `sobre` | Escríbelo con tus palabras: es lo que más convierte. |
| **Fotos de Instagram** | `assets/img/instagram/` + `assets/js/feed.js` | Son ilustraciones de relleno. Ver [📸 Fotos de Instagram](#-fotos-de-instagram). |
| **Datos fiscales** | `aviso-legal.html`, `privacidad.html` | Sustituye `[NOMBRE O RAZÓN SOCIAL]`, `[NIF/CIF]`, `[DIRECCIÓN COMPLETA]` y `[CORREO DE CONTACTO]`. En España son obligatorios para una web de actividad comercial. |
| **Dominio** | `index.html` (canonical, Open Graph, JSON-LD), `robots.txt`, `sitemap.xml` | Ahora apuntan a `https://indalodive.vercel.app`. Cuando tengas dominio propio: `./cambiar-dominio.sh https://tu-dominio.es` |

---

## 🔗 Cambiar los enlaces (lo que más vas a tocar)

Todo vive en `assets/js/config.js`. **No hace falta tocar el HTML**: la web se
construye sola con esa lista. Añadir un producto es añadir un objeto:

```js
{
  id: "nocturna",                 // identificador corto y único
  categoria: "inmersiones",       // cursos · inmersiones · tienda · contacto
  titulo: "Inmersión nocturna",
  texto: "Otro mar completamente distinto, con linterna.",
  precio: "55 €",                 // opcional
  etiqueta: "Últimas plazas",     // opcional, se ve como distintivo naranja
  destacado: false,               // true = tarjeta grande (usa 1 o 2 como mucho)
  icono: "burbuja",               // burbuja bombona olas camara tienda
                                  // whatsapp instagram mapa calendario correo
  url: "https://…"                // el enlace real
}
```

Si en vez de una URL quieres que el botón abra WhatsApp con un mensaje escrito,
cambia `url` por:

```js
  wa: true,
  mensaje: "¡Hola! Quiero información sobre la inmersión nocturna 🤿"
```

Los filtros de arriba (`Todos`, `Cursos`, `Inmersiones`…) se generan solos con
las categorías que estén en uso y llevan el contador al día. Si añades una
categoría nueva, apúntala también en `categorias`.

**Medir qué enlace funciona:** cada tarjeta manda un evento `clic_enlace` con su
`id`. Si algún día pones Google Analytics o Meta Pixel, verás sin tocar nada
qué producto es el que más clics recibe.

---

## 📸 Fotos de Instagram

Instagram **no deja que una web lea el perfil directamente**: hay que pasar por
su API con un token, o por un servicio que lo haga por ti. Por eso la galería
sale de `assets/js/feed.js`. Tienes tres caminos, de más a menos automático.

### Opción A — Sincronizar con la API de Instagram (recomendada)

Descarga tus últimas publicaciones al repositorio: la web sigue siendo estática
y rápida, y las fotos no dependen de que Instagram esté disponible.

```bash
INSTAGRAM_TOKEN=EAAG… node scripts/sync-instagram.mjs
```

El script baja las fotos a `assets/img/instagram/` (`ig-01.jpg`, `ig-02.jpg`…),
les quita los hashtags a los pies de foto y reescribe `assets/js/feed.js`.
Después, `git add -A && git commit && git push` y la web queda actualizada.

**Cómo conseguir el token** (unos 10 minutos, una sola vez):

1. Entra en [developers.facebook.com](https://developers.facebook.com/) con la
   cuenta que administra @indalodive y crea una app.
2. Añade el producto **Instagram** → *API con inicio de sesión de Instagram*.
3. En *Configuración de la API*, vincula la cuenta de @indalodive.
   La cuenta tiene que ser **profesional** (de empresa o creador); si es
   personal, cámbiala desde la app de Instagram: es gratis y no cambia nada
   de cara al público.
4. Genera un **token de acceso de larga duración** con el permiso
   `instagram_business_basic` y cópialo.

El token caduca a los 60 días. Se renueva sin volver a pasar por el panel:

```bash
curl "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=TU_TOKEN"
```

> ⚠️ El token es una contraseña: no lo subas nunca a Git ni lo pegues en
> `config.js`. Se pasa como variable de entorno, como en el ejemplo de arriba.

### Opción B — Servicio de feed (sin tocar la terminal)

Servicios como [Behold](https://behold.so), EmbedSocial o LightWidget conectan
tu cuenta y publican un JSON. Pega esa URL en `config.js`:

```js
instagram: {
  usuario: "indalodive",
  feedJson: "https://feeds.behold.so/XXXXXXXX"
}
```

La galería se actualizará sola en cada visita. Si el servicio falla, la web
enseña las fotos guardadas: nunca se queda en blanco. Contra: la página depende
de un tercero y algunos planes son de pago.

### Opción C — A mano

Copia tus fotos en `assets/img/instagram/` y edita la lista `publicaciones` de
`assets/js/feed.js` con el nombre del archivo, el texto y el enlace a la
publicación. Formato ideal: **4:5 (900 × 1125 px)**, JPEG.

### Mientras tanto

Las ocho imágenes que hay ahora son **ilustraciones generadas** (SVG de rayos de
luz, bancos de peces y medusas), no fotos reales de nadie: sirven para ver la
web terminada y se pueden borrar sin más. La galería avisa debajo con
«Imágenes provisionales · pendiente de conectar el perfil» hasta que sincronices.

**La foto de perfil** (`assets/img/avatar.svg`) también es provisional: sustitúyela
por la de tu cuenta, cuadrada, y actualiza la ruta en `index.html` (`#heroAvatar`).

---

## 🗂️ Archivos

```
index.html                  Toda la página (una sola pantalla, secciones ancladas)
404.html                    Página de error
aviso-legal.html            Textos legales (⚠️ con datos por rellenar)
privacidad.html
cookies.html

assets/css/style.css        Estilos
assets/js/config.js         ⭐ ENLACES Y TEXTOS — es el archivo que vas a editar
assets/js/feed.js           Galería de Instagram (lo genera el script)
assets/js/main.js           Interacciones: filtros, visor, burbujas, descenso

assets/img/logo.svg         Indalo estilizado, la marca
assets/img/favicon.svg      Icono de pestaña
assets/img/apple-touch-icon.png
assets/img/avatar.svg       Foto de perfil provisional
assets/img/og-cover.png     Vista previa al compartir el enlace (1200×630)
assets/img/instagram/       Fotos de la galería

scripts/sync-instagram.mjs  Trae las publicaciones reales de Instagram
cambiar-dominio.sh          Cambia el dominio en canonical, OG, sitemap y robots
vercel.json                 Cabeceras de seguridad y caché
```

---

## 💻 Verlo en local

No hace falta compilar nada, pero conviene servirlo por HTTP:

```bash
python3 -m http.server 8000    # y abre http://localhost:8000
```

En local aparece un aviso naranja si quedan enlaces sin configurar. En el
dominio publicado no se muestra nunca.

## 🚀 Publicar

Sirve cualquier hosting estático. Con **Vercel**: importa el repositorio, sin
comando de build y con la raíz del proyecto como directorio de salida.
`vercel.json` ya trae las cabeceras de seguridad y la caché de `assets/`.
También vale Netlify, GitHub Pages o el hosting que ya tengas.

## ♿ Detalles que ya están resueltos

- Se respeta `prefers-reduced-motion`: quien tenga las animaciones desactivadas
  en su móvil no verá burbujas ni transiciones.
- Navegación con teclado en el visor de fotos (`Esc`, `←`, `→`) y con el dedo
  (deslizar) en el móvil.
- Etiquetas `alt`, `aria-label` y contraste revisado sobre fondo oscuro.
- SEO: título y descripción orientados a *buceo en Almería*, Open Graph con
  imagen propia, datos estructurados (`Organization` + `WebSite`) y sitemap.
