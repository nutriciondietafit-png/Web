# Fontanería Macael · Presupuestos y facturas

Aplicación web para organizar las facturas y sacar presupuestos a partir de mediciones.
Funciona en el navegador, sin servidor ni cuentas: se abre en `/fontaneria/` y ya está.

## Qué hace

- **Panel** con lo facturado en el año, lo pendiente de cobro, lo vencido, el IVA del trimestre
  y los presupuestos que siguen abiertos.
- **Presupuestos** a partir de mediciones pegadas de golpe, con capítulos, descuentos por línea
  y conversión a factura en un clic.
- **Facturas** con numeración correlativa automática (`F-2026-0001`), IVA por línea (0/4/10/21 %),
  retención de IRPF, vencimiento y registro de cobros (totales o a cuenta).
- **Clientes** con NIF, dirección y el histórico de lo facturado y lo que deben.
- **Tarifa de precios** con 34 partidas de fontanería ya cargadas, editables, y subida o bajada
  de precios en bloque por porcentaje.
- **Impresión en A4** con diseño limpio: desde el navegador se guarda como PDF y se envía por
  WhatsApp o correo.
- **Copia de seguridad** en un archivo `.json` y exportación de facturas a CSV para la gestoría.

## Dónde se guardan los datos

En el almacenamiento local del navegador del dispositivo donde se usa (`localStorage`), no en
Internet. Consecuencias prácticas:

- Nadie más ve los datos, ni siquiera el hosting.
- No se sincroniza entre el móvil y el ordenador: cada dispositivo tiene los suyos.
- Si se borran los datos de navegación, se pierden. **Descarga la copia de seguridad
  desde Ajustes con regularidad** y guárdala en el correo o en la nube.
- Para pasar los datos de un dispositivo a otro: *Ajustes → Descargar copia* en uno y
  *Ajustes → Restaurar copia* en el otro.

## Cómo se pegan las mediciones

Dentro de un presupuesto, botón **Pegar mediciones**. Una línea por partida:

```
Descripción ; unidad ; medición ; precio ; descuento%
```

También valen el tabulador y la barra vertical `|` como separadores. Reglas:

| Elemento | Cómo se escribe | Ejemplo |
|---|---|---|
| Capítulo | La línea empieza por `#` | `# Baño principal` |
| Medición con operaciones | `x`, `*`, `+`, paréntesis | `2x4,30` · `3*(1,20+0,80)` |
| Precio | En euros, con coma decimal | `12,40` |
| Sin precio | Se busca la partida en la tarifa y se coge de ahí | `Punto de agua empotrado ; ud ; 3` |
| Estilo rápido | `cantidad unidad descripción` | `6 h Hora de oficial de 1ª fontanero` |

Ejemplo completo:

```
# Baño principal
Desmontaje de sanitarios y retirada de escombros ; ud ; 1 ; 120
Tubería multicapa 20 mm, instalada con accesorios ; ml ; 2x4,30 ; 12,40
Punto de agua empotrado (fría + caliente) ; ud ; 3 ; 78
Plato de ducha de resina, instalado ; ud ; 1 ; 210
# Cocina
Fregadero de cocina con grifería, instalado ; ud ; 1 ; 130
6 h Hora de oficial de 1ª fontanero
```

Las líneas que no lleven precio ni coincidan con la tarifa se añaden igualmente con precio 0 y
se avisa de cuáles hay que repasar.

En la tabla de partidas también se puede medir a la manera clásica de obra, rellenando
**Uds × Largo × Ancho × Alto**: la cantidad se calcula sola y en el documento impreso sale el
detalle de la medición debajo del concepto.

## Antes de emitir la primera factura

En **Ajustes**, rellena los datos de la empresa: nombre, NIF, dirección, teléfono e IBAN.
Sin NIF y sin dirección la factura no es válida. Ahí se configuran también las series
(`PRE-`, `F-`), el IVA por defecto, la retención de IRPF y los días de vencimiento.

Una factura marcada como **borrador** no consume número: el número correlativo se asigna al
guardarla como *emitida*, de modo que la numeración queda sin huecos.

## Detalles técnicos

- HTML, CSS y JavaScript sin dependencias ni proceso de compilación.
- `assets/js/store.js`: datos, cálculo de totales, numeración y lectura de mediciones.
- `assets/js/app.js`: interfaz, listados, editor y documento imprimible.
- `assets/css/app.css`: estilos de pantalla y hoja de impresión A4.
- La sección está marcada `noindex` y excluida en `robots.txt`.
