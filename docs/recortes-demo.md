# Recortes de la demo

Estado: borrador. Fecha: 2026-10-23.

La demo del 2026-10-26 simplifica varias partes de Rogatio. Este documento lista cada recorte para retomarlo después. Un recorte no cambia el diseño: solo lo pospone.

Cada fila pasa a un issue con la etiqueta `despues` cuando se decida trabajarla.

## Backlog

| # | En la demo | Después | Contexto |
|---|---|---|---|
| 1 | Umbral fijo de 50 firmas, con 49 firmas sintéticas precargadas. | Cada nodo del árbol de jurisdicciones fija su umbral en un archivo público. | [Whitepaper, 4](whitepaper.md#4-cómo-funciona) |
| 2 | Solo las categorías verificadas de la alcaldía: alumbrado, basura, mercados, parques y baches en vías secundarias. | Todas las filas de la tabla de enrutamiento, con revisión de las marcadas "por verificar". | [02 Enrutamiento, 3](arquitectura/02-enrutamiento.md#3-tabla-de-enrutamiento) |
| 3 | La UT es solo una etiqueta de ubicación (colonia). No recibe peticiones. | Evaluar la Comisión de Participación Comunitaria de la UT como destinatario, y el vínculo con el presupuesto participativo. | [01 Jurisdicciones](arquitectura/01-jurisdicciones.md) |
| 4 | Sin geometría ni PostGIS. La sección de la credencial da la alcaldía y los distritos. | PostGIS en Neon para ubicar el problema (por ejemplo, vía primaria o secundaria) y para el mapa de firmas por sección, con un umbral mínimo de firmas por sección para proteger el anonimato. | [05 Stack](arquitectura/05-stack.md) |
| 5 | La credencial es una imagen de muestra con datos ficticios. La lectura (OCR) es simulada. | OCR real de los modelos E a J, incluido el QR nuevo de los modelos I y J. | [04 Autenticación](arquitectura/04-autenticacion.md) |
| 6 | Solo la alcaldía Cuauhtémoc. | Las 16 alcaldías de la CDMX y, después, otras entidades. | [Whitepaper, 7](whitepaper.md#7-alcance-y-hoja-de-ruta) |
