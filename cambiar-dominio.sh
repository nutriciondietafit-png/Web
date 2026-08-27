#!/usr/bin/env bash
# Cambia el dominio en todas las URLs absolutas de la web
# (canonical, Open Graph, Twitter Card, JSON-LD, sitemap.xml y robots.txt).
#
#   ./cambiar-dominio.sh https://indalodive.es
#
set -euo pipefail

NUEVO="${1:-}"
if [ -z "$NUEVO" ]; then
  echo "Uso: ./cambiar-dominio.sh https://tu-dominio.es"
  exit 1
fi

NUEVO="${NUEVO%/}"                                   # quita la barra final
if [[ ! "$NUEVO" =~ ^https?:// ]]; then
  echo "El dominio debe empezar por https:// — ejemplo: https://indalodive.es"
  exit 1
fi

ACTUAL=$(grep -oP '(?<=<link rel="canonical" href=")[^"/]*//[^"/]*' index.html | head -1)
if [ -z "$ACTUAL" ]; then
  echo "No he podido leer el dominio actual del canonical de index.html"
  exit 1
fi

echo "Cambiando  $ACTUAL  ->  $NUEVO"
for f in index.html sitemap.xml robots.txt; do
  n=$(grep -c "$ACTUAL" "$f" || true)
  sed -i "s#${ACTUAL}#${NUEVO}#g" "$f"
  echo "  $f: $n sustituciones"
done

echo
echo "Listo. Ahora haz:  git add -A && git commit -m 'Actualizar dominio' && git push"
