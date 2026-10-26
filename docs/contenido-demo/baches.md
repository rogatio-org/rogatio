# Contenido de la demo: baches en Cuauhtémoc

Borrador. La mesa lo revisa (#30) y lo congela (#31). Lo marcado "por verificar" sigue pendiente.

Archivos para código y pruebas e2e:

- `data/fixtures/peticion-demo.json`: la petición de baches. La semilla y la UI leen este archivo. El id sigue siendo `peticion-demo`.
- `data/fixtures/escrito-art8-baches.txt`: texto del escrito con campos entre llaves (#31). Va a `src/lib/escrito-art8.ts` (#37).

## Petición final (#12, #13)

### Petición final de baches (#12, #13)

#### 1. Campos del fixture que cambian

```json
{
  "titulo": "Reparar los baches de la calle Mérida, colonia Roma Norte",
  "texto": "Las personas firmantes, vecinas de la alcaldía Cuauhtémoc, ejercemos de manera pacífica y respetuosa el derecho de petición del Art. 8 de la Constitución federal. Solicitamos que la Alcaldía Cuauhtémoc repare todos los baches de la calle Mérida, en la colonia Roma Norte, en un plazo de 60 días naturales. Pedimos también un informe escrito con el número de baches reparados, las fechas de la obra y el tramo atendido. Pedimos que la respuesta sea por escrito, como indica el Art. 8.",
  "categoria": "vialidad.secundaria.bache",
  "ubicacion": "Calle Mérida, colonia Roma Norte, alcaldía Cuauhtémoc (tramo y sección INE por verificar)",
  "autoridad": "Alcaldía Cuauhtémoc"
}
```

`jurisdiccion` no cambia (`alcaldia`, `09-015`, Cuauhtémoc).

**Por qué `vialidad.secundaria.bache`:** `peticiones.categoria` es `text` libre en `src/db/esquema.ts`, así que el esquema no limita el código. Es el código del catálogo y la clave de la regla de enrutamiento en `docs/arquitectura/02-enrutamiento.md` (6.1 y 6.2). El valor corto `alumbrado` es de la petición ficticia y no coincide con ninguna regla.

#### 2. Fundamento del texto
- Art. 8 CPEUM: la petición va "por escrito, de manera pacífica y respetuosa", y la autoridad responde con un "acuerdo escrito". https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf
- LOA Art. 33: la alcaldía rehabilita y mantiene las vialidades. https://www.coyoacan.cdmx.gob.mx/docs/LEY_ORGANICA_DE_ALCALDIAS_DE_LA_CDMX_5.5.pdf
- El plazo de 60 días y el informe son lo que piden los firmantes. Ninguna ley los fija.

#### 3. Qué cambia en el código
- **Fixture:** cambian los 5 campos. Hay que ajustar `_aviso`: la petición ya es real, pero el envío sigue simulado.
- **`src/lib/peticion-demo.ts`:** sin cambios de tipo. Todos los campos son `string`.
- **`scripts/semilla.ts`:** sin cambios. Ya lee `titulo`, `texto` y `categoria` del fixture y los actualiza en el upsert.

#### Por verificar
- Si la calle Mérida está libre de vías primarias y aún tiene baches. La evidencia es de La Silla Rota, 8-sep-2025: https://lasillarota.com/metropoli/2025/9/8/alcaldia-cuauhtemoc-500-baches-olvidados-en-la-doctores-en-la-roma-en-la-juarez-en-santa-maria-467566.html
- Si la calle entró en la repavimentación de Roma de 2026 (boletín 506, hoy da 404).
- El tramo exacto y la sección INE: cruzar con `data/ine/secciones-cuauhtemoc.geojson`.
- La norma del límite entre primaria y secundaria. No está en los Arts. 32 y 33 de la LOA.
- La reforma de la LOA del 06-10-2023 y el trámite propio de la alcaldía para baches (LPA Art. 44).

## Modelo del escrito del Art. 8 (#25)

**Modelo provisional del escrito (Art. 8 CPEUM), #25**

1. **Destino:** persona titular de la Alcaldía Cuauhtémoc. Se presenta en su Oficialía de Partes, Aldama y Mina s/n, Col. Buenavista. El C.P. (06350 o 03650), el horario y la forma de cortesía del cargo están **por verificar**. Base: LPA Art. 44 fr. I.
2. **Quién firma:** el autor de la petición, como representante común de las personas firmantes. Si no hay representante designado, la autoridad trata con quien aparece primero (LPA Art. 43). Cómo se designa al representante dentro de Rogatio está **por verificar**.
3. **Firma:** cada promoción lleva firma autógrafa o electrónica. Sin firma, se tiene por no realizada (LPA Art. 33). Qué firma electrónica vale (Llave CDMX, FIEL u otra) está **por verificar**.
4. **Contenido (LPA Art. 44):** nombre de los interesados y del representante, domicilio para notificaciones, la petición (bacheo en vialidad secundaria), hechos y razones claros y breves, lugar, fecha y firma.
5. **Notificaciones:** el escrito dice si se aceptan notificaciones electrónicas. Si se aceptan, da un correo (LPA Art. 44, párrafo del correo).
6. **Entrega:** el escrito inicial va en persona, en la oficina que corresponde. No puede ir por correo (LPA Art. 46). Si la alcaldía acepta escritos en línea está **por verificar**.
7. **Forma y respuesta:** por escrito, pacífica y respetuosa. La autoridad responde por escrito y en breve término (CPEUM Art. 8).
8. **Competencia:** la alcaldía rehabilita y mantiene las vialidades (LOA Arts. 32 fr. IV y 33). La ley que fija el corte primaria/secundaria y la reforma posible de 2023 están **por verificar**. También falta confirmar que no hay reformas a la LPA después del 12-06-2019.

**Fuentes**
- LPA CDMX (Consejería Jurídica): https://data.consejeria.cdmx.gob.mx/images/leyes/leyes/LEY_DE_PROCEDIMIENTO_ADMINISTRATIVO_DE_LA_CDMX.pdf
- CPEUM: https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf
- LOA CDMX (copia de la CJSL): https://www.coyoacan.cdmx.gob.mx/docs/LEY_ORGANICA_DE_ALCALDIAS_DE_LA_CDMX_5.5.pdf
- Domicilio (aviso de privacidad; el dominio redirige a otro sitio, **por verificar**): https://alcaldiacuauhtemoc.mx/wp-content/uploads/2025/11/Aviso_de_Privacidad_Integral_Asesoria.pdf

## Plantilla base (#26)

**Plantilla base del escrito (Art. 8 CPEUM), #26**

`src/lib/escrito-art8.ts` no existe. Los nombres de los campos siguen los de `data/fixtures/peticion-demo.json` cuando aplica.

```text
{autoridad}
Persona titular de la Alcaldía Cuauhtémoc
Oficialía de Partes: {domicilio_autoridad}
P r e s e n t e

{representante_comun}, en mi carácter de representante común de las {numero_firmantes} personas firmantes que aparecen en el Anexo 1, señalo como domicilio para recibir notificaciones el ubicado en {domicilio_notificaciones}. {acepta_notificaciones_electronicas}: acepto recibir notificaciones electrónicas en el correo {correo_notificaciones}. Autorizo para oír y recibir notificaciones a {personas_autorizadas}.

Con fundamento en el artículo 8 de la Constitución Política de los Estados Unidos Mexicanos y en los artículos 43 y 44 de la Ley de Procedimiento Administrativo de la Ciudad de México, de manera pacífica y respetuosa, presento la siguiente petición.

HECHOS

{hechos}
(Ejemplo ficticio: 1. En la calle Ejemplo, entre Calle A y Calle B, colonia Ejemplo Centro, hay {numero_baches} baches. 2. Los baches existen desde {fecha_inicio_problema}. 3. Afectan el paso de vehículos, bicicletas y peatones.)

FUNDAMENTO

{fundamento}
(Fila de enrutamiento "Baches, vialidades secundarias": artículos 32, fracción IV, y 33 de la Ley Orgánica de Alcaldías de la Ciudad de México. El artículo 33 dice que es responsabilidad de las alcaldías rehabilitar y mantener las vialidades de su demarcación. La vía {ubicacion} es una vialidad secundaria.)

PETICIÓN

Por lo expuesto, solicito respetuosamente:

PRIMERO. Que la Alcaldía repare los baches de {ubicacion}.
SEGUNDO. Que la Alcaldía informe por escrito la fecha programada de los trabajos.
TERCERO. Que la Alcaldía responda por escrito y en breve término, en el domicilio o el correo que señalo, conforme al artículo 8 constitucional.

ATENTAMENTE

{lugar}, a {fecha}

{firma_representante}
{representante_comun}
Representante común

ANEXO 1. Personas firmantes ({numero_firmantes})
Raíz del registro de firmas: {raiz_hash}
{anexo_firmantes}
(Columnas: núm., nombre, sección electoral, firma o folio de verificación.)
```

**Campos**
- Obligatorios: `{representante_comun}`, `{domicilio_notificaciones}`, `{correo_notificaciones}`, `{anexo_firmantes}`.
- Otros: `{autoridad}`, `{domicilio_autoridad}`, `{hechos}`, `{fundamento}`, `{ubicacion}`, `{numero_firmantes}`, `{lugar}`, `{fecha}`, `{firma_representante}`, `{acepta_notificaciones_electronicas}`, `{personas_autorizadas}` (opcional), `{raiz_hash}`.

**Por verificar**
- El C.P. (06350 o 03650), el horario y la forma de cortesía del cargo.
- Qué firma electrónica es válida según el Art. 33 de la LPA. Sin firma, el escrito se tiene por no realizado.
- La norma que fija el corte entre vialidad primaria y secundaria. Los Arts. 32 y 33 de la LOA no lo fijan.
- Si las columnas del anexo bastan para cumplir el Art. 44, fr. II, de la LPA. También si la sección electoral es un dato personal que no conviene publicar.
- Cómo se designa al representante común en Rogatio (LPA Art. 43).

**Fuentes**
- CPEUM, Art. 8: https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf
- LPA CDMX, Arts. 33, 43, 44 y 46: https://data.consejeria.cdmx.gob.mx/images/leyes/leyes/LEY_DE_PROCEDIMIENTO_ADMINISTRATIVO_DE_LA_CDMX.pdf
- LOA CDMX, Arts. 32 y 33: https://www.coyoacan.cdmx.gob.mx/docs/LEY_ORGANICA_DE_ALCALDIAS_DE_LA_CDMX_5.5.pdf

## Plantilla ajustada a baches (#31)

### Borrador del escrito de baches (#31), para revisión de la mesa (#30)

Base: plantilla #26 y petición #12. Los campos variables son solo datos de personas o datos que se generan al cerrar la recolección. Las marcas **[POR VERIFICAR]** se quitan antes de congelar el texto.

```text
PERSONA TITULAR DE LA ALCALDÍA CUAUHTÉMOC
Oficialía de Partes: Aldama y Mina sin número, colonia Buenavista, C.P. 06350, Ciudad de México [POR VERIFICAR: C.P. 06350 o 03650; horario; forma de cortesía del cargo]
P r e s e n t e

{representante_comun}, en mi carácter de representante común de las {numero_firmantes} personas firmantes que aparecen en el Anexo 1, señalo como domicilio para recibir notificaciones el ubicado en {domicilio_notificaciones}. {acepta_notificaciones_electronicas}: acepto recibir notificaciones electrónicas en el correo {correo_notificaciones}. Autorizo para oír y recibir notificaciones a {personas_autorizadas}.

Con fundamento en el artículo 8 de la Constitución Política de los Estados Unidos Mexicanos y en los artículos 43 y 44 de la Ley de Procedimiento Administrativo de la Ciudad de México, de manera pacífica y respetuosa, presento la siguiente petición.

HECHOS

1. Las personas firmantes vivimos en la alcaldía Cuauhtémoc.
2. La calle Mérida, en la colonia Roma Norte, tiene baches en su carpeta asfáltica. [POR VERIFICAR: tramo exacto entre calles y estado actual en 2026]
3. Los baches afectan el paso seguro de vehículos, bicicletas y peatones.
4. La calle Mérida es una vialidad secundaria de la demarcación. No es un eje vial ni una vía primaria. [POR VERIFICAR: clasificación oficial]

FUNDAMENTO

El artículo 32, fracción IV, de la Ley Orgánica de Alcaldías de la Ciudad de México dice que es atribución exclusiva de la persona titular de la Alcaldía "prestar los siguientes servicios públicos: [...] pavimentación, de conformidad con la normatividad aplicable".

El artículo 33 de la misma ley dice: "Es responsabilidad de las Alcaldías, rehabilitar y mantener las vialidades, así como las guarniciones y banquetas requeridas en su demarcación".

[POR VERIFICAR: cotejar ambos artículos con la reforma de la LOA del 06-10-2023]

PETICIÓN

Por lo expuesto, solicito respetuosamente:

PRIMERO. Que la Alcaldía repare todos los baches de la calle Mérida, colonia Roma Norte, en un plazo de 60 días naturales.
SEGUNDO. Que la Alcaldía informe por escrito el número de baches reparados, las fechas de los trabajos y el tramo atendido.
TERCERO. Que la Alcaldía responda por escrito y en breve término, en el domicilio o el correo que señalo, conforme al artículo 8 constitucional.

ATENTAMENTE

Ciudad de México, a {fecha}

{firma_representante}
{representante_comun}
Representante común

ANEXO 1. Personas firmantes ({numero_firmantes})
Raíz del registro de firmas: {raiz_hash}
{anexo_firmantes}
(Columnas: núm., nombre, sección electoral, firma o folio de verificación.)
```

#### Campos variables
- Obligatorios: `{representante_comun}`, `{domicilio_notificaciones}`, `{correo_notificaciones}`, `{anexo_firmantes}`, `{firma_representante}`, `{fecha}`, `{numero_firmantes}`.
- Opcionales: `{acepta_notificaciones_electronicas}`, `{personas_autorizadas}`.
- Se genera al cerrar: `{raiz_hash}` (sale del registro de firmas, no de una persona).

#### Qué quedó fijo
- Cargo: "persona titular de la Alcaldía". Es el término de la LOA, Art. 32.
- Lugar: Ciudad de México.
- Hechos y puntos petitorios: calle Mérida, Roma Norte (#12). El plazo de 60 días y el informe los piden las personas firmantes. Ninguna ley los fija.
- No puse un número de baches. La fuente (La Silla Rota, 2025) no da una cifra por calle.

#### Por verificar antes de congelar
1. **Domicilio de la Oficialía de Partes.** Sale de avisos de privacidad en alcaldiacuauhtemoc.mx. Ese dominio hoy redirige (301) a portallicencias.com. Hay que confirmarlo en otra fuente oficial, junto con el C.P. (06350 o 03650) y el horario.
2. **Forma de cortesía** (Alcaldesa o Alcalde).
3. **Tramo y estado actual de la calle Mérida.** La evidencia es de 2025. Revisar si la calle entró en la repavimentación de Roma de 2026 (el boletín 506 da 404). Cruzar con `data/ine/secciones-cuauhtemoc.geojson`.
4. **Corte entre vía primaria y secundaria.** Los Arts. 32 y 33 de la LOA no dicen "secundaria". Falta la norma que fija el corte y el listado oficial de vías primarias.
5. **Reforma de la LOA del 06-10-2023.** Cotejar los Arts. 32 y 33.
6. **Firma válida (LPA, Art. 33).** Sin firma autógrafa o electrónica, el escrito se tiene por no realizado. Falta saber qué firma electrónica acepta la alcaldía. El Art. 46 pide presentar el escrito inicial en oficina.
7. **Anexo y LPA, Art. 44, fr. II.** Falta saber si estas columnas bastan y si conviene publicar la sección electoral.
8. **Representante común (LPA, Art. 43).** Falta definir cómo se designa en Rogatio. Si no hay designación, la autoridad trata con quien aparece primero.
9. **Trámite propio de la alcaldía para baches.** Si existe, sus requisitos tienen prioridad sobre el Art. 44.
10. **Reformas a la LPA posteriores al 12-06-2019.**

#### Fuentes
- CPEUM, Art. 8: https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf
- LPA CDMX, Arts. 33, 43, 44 y 46: https://data.consejeria.cdmx.gob.mx/images/leyes/leyes/LEY_DE_PROCEDIMIENTO_ADMINISTRATIVO_DE_LA_CDMX.pdf
- LOA CDMX, Arts. 32 y 33 (texto de la CJSL, última reforma 27-05-2022): https://www.coyoacan.cdmx.gob.mx/docs/LEY_ORGANICA_DE_ALCALDIAS_DE_LA_CDMX_5.5.pdf
- Domicilio (dominio con alerta): https://alcaldiacuauhtemoc.mx/wp-content/uploads/2025/11/Aviso_de_Privacidad_Integral_Asesoria.pdf
- Baches en la calle Mérida (prensa, 2025): https://lasillarota.com/metropoli/2025/9/8/alcaldia-cuauhtemoc-500-baches-olvidados-en-la-doctores-en-la-roma-en-la-juarez-en-santa-maria-467566.html
