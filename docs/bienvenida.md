# Bienvenida a la mesa de Rogatio

Estado: borrador. Evento: Claude Impact Lab, Cámara de Diputados, 2026-10-26.

Gracias por sumarte. Esta guía te pone al día en **menos de 15 minutos**: 6 minutos de lectura común y de 4 a 8 minutos según tu perfil. Después tomas un issue y empiezas.

## 1. Qué es Rogatio, en 30 segundos

Rogatio es una plataforma de código abierto de peticiones ciudadanas verificadas para México.

1. Una persona propone una petición.
2. Quien firma acredita su identidad con la credencial para votar del INE. Cada persona firma una sola vez.
3. Cada firma recibe un comprobante público y verificable, sin exponer el nombre de quien firmó.
4. Al llegar al umbral, Rogatio redacta un escrito de petición (Art. 8 constitucional), lo envía a la autoridad competente y copia a los representantes de quienes firmaron.

Hoy construimos una demo para la **alcaldía Cuauhtémoc**.

## 2. Objetivo del día

Al final de las 3 horas mostramos, en **1 minuto**, una petición real de Cuauhtémoc que pasa de la firma al escrito del Art. 8 listo para enviarse.

Lo que más importa hoy es que el problema sea **real**: algo que la gente de Cuauhtémoc de verdad necesita. Eso demuestra para qué sirve Rogatio.

## 3. Lectura común (todos, ~6 min)

| Qué | Dónde | Tiempo |
|---|---|---|
| README | [README.md](../README.md) | 30 s |
| Resumen | [Whitepaper, Resumen](whitepaper.md#resumen) | 1 min |
| Por qué hace falta | [Whitepaper, 1.2](whitepaper.md#12-el-derecho-de-petición-es-fuerte-pero-difícil-de-ejercer-en-conjunto) | 1 min |
| Cómo funciona | [Whitepaper, 4](whitepaper.md#4-cómo-funciona) | 2 min |
| Qué entra en la demo | [Whitepaper, 7](whitepaper.md#7-alcance-y-hoja-de-ruta) | 1 min |

## 4. Lectura por perfil (~4–8 min)

Busca tu perfil. Si tienes dos, elige el que vas a trabajar hoy.

### Cívica / comunidad (etiqueta `civica`)

| Qué | Dónde |
|---|---|
| Cómo se divide la CDMX | [01 Jurisdicciones, 1 y 2](arquitectura/01-jurisdicciones.md#1-dos-árboles-un-átomo) |
| Qué puede resolver la alcaldía | [02 Enrutamiento, 2.3](arquitectura/02-enrutamiento.md#23-facultades-de-la-alcaldía-para-la-demo) |
| Quién representa a Cuauhtémoc | [03 Representantes, Cuauhtémoc en las legislaturas actuales](arquitectura/03-representantes.md#cuauhtémoc-en-las-legislaturas-actuales) |

Tu pregunta clave: ¿qué problema de Cuauhtémoc firmaría la gente hoy? Las noticias locales y los vecinos son la mejor fuente.

### Legal (etiqueta `legal`)

| Qué | Dónde |
|---|---|
| Fundamento y competencia | [02 Enrutamiento, 2](arquitectura/02-enrutamiento.md#2-fundamento-legal) |
| Tabla de enrutamiento | [02 Enrutamiento, 3](arquitectura/02-enrutamiento.md#3-tabla-de-enrutamiento) |
| Qué es público y qué no | [Transparencia, 1.1](transparencia.md#11-transparencia-del-proceso-no-de-las-personas) |

Hoy el foco legal es el escrito del Art. 8: quién firma, dónde se notifica y ante qué oficina se presenta. La privacidad ([Whitepaper, 6](whitepaper.md#6-privacidad)) es lectura opcional: la demo usa solo datos ficticios.

### UX/UI (etiqueta `ux`)

| Qué | Dónde |
|---|---|
| Por qué confiar | [Whitepaper, 5](whitepaper.md#5-modelo-de-confianza) |
| Qué se muestra en público | [Transparencia, 1.2](transparencia.md#12-qué-se-publica-y-qué-no) |
| Registro y comprobantes | [Transparencia, 2.2](transparencia.md#22-registro-de-solo-adición-y-comprobantes) |
| La experiencia de quien firma | [Transparencia, 7.1](transparencia.md#71-un-ciudadano-que-firmó) |

### Comunicación (etiqueta `comunicacion`)

| Qué | Dónde |
|---|---|
| El problema en una frase | [Whitepaper, 1.1](whitepaper.md#11-las-listas-en-línea-no-prueban-nada) |
| El nombre | [Whitepaper, 2](whitepaper.md#2-el-nombre) |
| El modelo del Reino Unido | [Whitepaper, 3](whitepaper.md#3-inspiración-peticiones-del-parlamento-del-reino-unido) |
| Cómo lo verifica un periodista | [Transparencia, 7.2](transparencia.md#72-un-periodista) |

### Negocio (etiqueta `negocio`)

| Qué | Dónde |
|---|---|
| Quién opera Rogatio | [Whitepaper, 8](whitepaper.md#8-gobernanza) |
| Financiamiento | [Transparencia, 4](transparencia.md#41-fuentes-aceptables-y-prohibidas) |

### Código (etiqueta `codigo`)

| Qué | Dónde |
|---|---|
| Modelo de confianza | [Whitepaper, 5](whitepaper.md#5-modelo-de-confianza) |
| Modelo de datos de jurisdicciones | [01 Jurisdicciones, 4](arquitectura/01-jurisdicciones.md#4-modelo-de-datos-de-rogatio) |
| Flujo de enrutamiento | [02 Enrutamiento, 5 y 6](arquitectura/02-enrutamiento.md#5-flujo-de-decisión) |
| Qué hace el MVP de identidad | [04 Autenticación, 2](arquitectura/04-autenticacion.md#2-mvp-frente-a-etapas-posteriores) |

## 5. Cómo trabajamos

**GitHub es la fuente de verdad.** Todo el trabajo vive como issues en [rogatio-org/rogatio](https://github.com/rogatio-org/rogatio/issues).

1. Filtra los issues por la etiqueta de tu perfil. Si no programas, filtra por `sin-codigo`.
2. Toma uno: comenta "lo tomo" en el issue. No hace falta pedir permiso.
3. Cada issue dice qué entregar y dónde. Un issue se cierra en 3 horas o menos.
4. Entrega:
   - Con código: abre un PR que diga `Cierra #<número>`.
   - Sin código: deja el entregable como comentario en el issue (texto, enlace a un documento o imágenes).
5. Si te atoras más de 15 minutos, pregunta en la mesa.

### Si programas: Codespaces

No instales nada. Usa Codespaces en el navegador.

1. Abre [codespaces.new/rogatio-org/rogatio](https://codespaces.new/rogatio-org/rogatio).
2. Haz clic en **Create codespace**. Espera unos 2 minutos.
3. En la terminal, escribe `npm run dev`.
4. Abre el puerto 3000 cuando VS Code lo ofrezca. Ves la app.
5. Crea una rama, haz tus cambios y abre un PR. Vercel publica una vista previa del PR.

Necesitas permiso de escritura en el repo. Pídelo en la mesa con tu usuario de GitHub.

Los issues con la etiqueta `despues` quedan registrados, pero hoy no se trabajan.

**La demo usa solo datos ficticios.** No captures tu credencial, tu CURP ni datos reales de nadie.

## 6. Etiquetas

| Etiqueta | Para quién |
|---|---|
| `civica` | Comunidad, tecnología cívica, datos de Cuauhtémoc |
| `legal` | Derecho constitucional, administrativo, protección de datos |
| `ux` | Diseño, flujos, accesibilidad |
| `comunicacion` | Narrativa, demo, difusión |
| `negocio` | Sostenibilidad |
| `codigo` | Requiere programar |
| `sin-codigo` | No requiere programar |
| `despues` | Registrado, no se trabaja hoy |

## 7. Glosario

- **Art. 8:** artículo de la Constitución que garantiza el derecho de petición. La autoridad debe responder por escrito en breve término.
- **Alcaldía:** gobierno de cada una de las 16 demarcaciones de la CDMX. Cuauhtémoc es una.
- **UT:** unidad territorial, la división de colonias y barrios que usa la participación ciudadana en la CDMX.
- **Sección electoral:** la unidad más pequeña del INE. Viene impresa en la credencial.
- **CURP:** clave única de cada persona. Rogatio la convierte en un seudónimo y no la publica.
- **Umbral:** número de firmas que dispara el envío.
- **Comprobante:** prueba pública de que una firma está en el registro, sin el nombre de quien firmó.
- **Acuse:** constancia de que la autoridad recibió el escrito.
