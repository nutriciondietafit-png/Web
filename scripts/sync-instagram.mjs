#!/usr/bin/env node
/* =====================================================================
   INDALODIVE — descarga las últimas publicaciones de Instagram
   ---------------------------------------------------------------------
   Qué hace:
     1. Pide tus últimas publicaciones a la API de Instagram.
     2. Descarga las fotos a assets/img/instagram/ (ig-01.jpg, ig-02.jpg…).
     3. Reescribe assets/js/feed.js para que la galería de la web las use.

   Cómo se usa:
       INSTAGRAM_TOKEN=xxxxx node scripts/sync-instagram.mjs
       INSTAGRAM_TOKEN=xxxxx node scripts/sync-instagram.mjs --limite 9

   De dónde sale el token (resumen; el paso a paso está en el README):
       developers.facebook.com → crea una app → producto «Instagram»
       → «API con inicio de sesión de Instagram» → genera un token de
       acceso de larga duración para @indalodive.

   El token caduca a los 60 días. Se renueva con:
       curl "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=TU_TOKEN"

   ⚠️  El token es una contraseña: no lo subas nunca a Git.
   ===================================================================== */

import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ    = join(dirname(fileURLToPath(import.meta.url)), '..');
const CARPETA = join(RAIZ, 'assets/img/instagram');
const SALIDA  = join(RAIZ, 'assets/js/feed.js');
const CAMPOS  = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';

const token = process.env.INSTAGRAM_TOKEN || process.env.IG_TOKEN;
const argLimite = process.argv.indexOf('--limite');
const limite = argLimite > -1 ? Number(process.argv[argLimite + 1]) || 8 : 8;

if (!token) {
  console.error('\n✖ Falta el token.\n  Uso:  INSTAGRAM_TOKEN=xxxxx node scripts/sync-instagram.mjs\n');
  process.exit(1);
}

const limpiar = (t) => String(t || '')
  .replace(/\s+/g, ' ')
  .replace(/#[^\s#]+/g, '')          // fuera los hashtags: quedan feos en la web
  .trim();

const resumen = (t) => {
  const s = limpiar(t);
  if (s.length <= 110) return s;
  return s.slice(0, 107).replace(/\s+\S*$/, '') + '…';
};

const jsonSeguro = (t) => JSON.stringify(t == null ? '' : String(t));

async function main() {
  const url = `https://graph.instagram.com/me/media?fields=${CAMPOS}&limit=${limite * 2}&access_token=${token}`;
  const res = await fetch(url);
  const datos = await res.json();

  if (!res.ok || datos.error) {
    console.error('\n✖ Instagram ha respondido con un error:');
    console.error('  ' + (datos.error?.message || res.status + ' ' + res.statusText));
    console.error('  Si pone que el token no es válido o ha caducado, renuévalo (ver cabecera de este archivo).\n');
    process.exit(1);
  }

  const publicaciones = (datos.data || [])
    .filter(p => p.media_url || p.thumbnail_url)
    .slice(0, limite);

  if (!publicaciones.length) {
    console.error('✖ La cuenta no ha devuelto publicaciones.');
    process.exit(1);
  }

  await mkdir(CARPETA, { recursive: true });

  // Fuera las fotos de la sincronización anterior (las de relleno .svg se quedan)
  for (const f of await readdir(CARPETA)) {
    if (/^ig-\d+\.(jpg|mp4)$/.test(f)) await unlink(join(CARPETA, f));
  }

  const items = [];
  for (const [i, p] of publicaciones.entries()) {
    const origen = p.media_type === 'VIDEO' ? (p.thumbnail_url || p.media_url) : p.media_url;
    const nombre = 'ig-' + String(i + 1).padStart(2, '0') + '.jpg';
    const foto = await fetch(origen);
    if (!foto.ok) { console.warn('  ! No he podido bajar ' + p.permalink); continue; }
    await writeFile(join(CARPETA, nombre), Buffer.from(await foto.arrayBuffer()));
    items.push({
      img: 'assets/img/instagram/' + nombre,
      alt: resumen(p.caption) || 'Publicación de IndaloDive en Instagram',
      texto: resumen(p.caption),
      url: p.permalink,
      fecha: (p.timestamp || '').slice(0, 10)
    });
    console.log('  ✓ ' + nombre + '  ' + (resumen(p.caption).slice(0, 48) || '(sin texto)'));
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const cuerpo = items.map(i =>
    `    { img: ${jsonSeguro(i.img)}, alt: ${jsonSeguro(i.alt)}, texto: ${jsonSeguro(i.texto)}, url: ${jsonSeguro(i.url)}, fecha: ${jsonSeguro(i.fecha)} }`
  ).join(',\n');

  await writeFile(SALIDA,
`/* =====================================================================
   INDALODIVE — GALERÍA DE INSTAGRAM
   Generado automáticamente por scripts/sync-instagram.mjs el ${hoy}.
   No lo edites a mano: se sobrescribe en cada sincronización.
   ===================================================================== */
window.INDALO_FEED = {
  fuente: "instagram",
  actualizado: "${hoy}",
  publicaciones: [
${cuerpo}
  ]
};
`);

  console.log(`\n✓ ${items.length} publicaciones guardadas y feed.js actualizado.`);
  console.log('  Revisa la web y súbelo:  git add -A && git commit -m "Actualizar galería" && git push\n');
}

main().catch(e => { console.error('✖ ' + e.message); process.exit(1); });
