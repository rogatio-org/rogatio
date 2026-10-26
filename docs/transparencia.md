# Transparencia

Estado: propuesta. Fecha: 2026-10-20. Sitio: [rogatio.org](https://rogatio.org). Licencia: AGPL-3.0.

Alcance del producto: toda la Ciudad de México (CDMX). Alcance de la demo: la alcaldía Cuauhtémoc, en el Claude Impact Lab de la Cámara de Diputados (2026-10-26).

## Resumen

Este documento explica dos cosas:

1. Cómo cualquier persona puede comprobar lo que hace Rogatio sin confiar en quien la opera.
2. Cómo evitamos que un partido, un gobierno, un donante o una persona, incluidos los fundadores, influya en qué peticiones se publican, cómo se muestran, a quién se envían y cuándo.

La idea central es simple. Rogatio no pide confianza. Publica sus reglas, su código y su registro. Cada decisión que una persona toma dentro de la plataforma queda escrita, con fecha, autor y motivo.

Una parte de este documento repite lo que ya definen el [whitepaper](whitepaper.md) y los documentos de [arquitectura](arquitectura/). Otra parte propone políticas nuevas. La sección 1.3 explica cómo distinguirlas.

## 1. Qué significa transparencia en Rogatio

### 1.1 Transparencia del proceso, no de las personas

Rogatio hace público el proceso. No hace públicas a las personas.

- **Público:** las reglas, el código, los conteos, el registro de firmas en forma de seudónimos, las decisiones de moderación, los envíos, los acuses de recibo y las respuestas de las autoridades.
- **Privado:** la identidad de cada firmante.

La razón es legal y práctica. La LFPDPPP considera las opiniones políticas como datos sensibles (Art. 2 fr. VI). Una firma puede revelar una opinión política. Por eso Rogatio pide consentimiento expreso y por escrito antes de la primera firma (Art. 8 de la LFPDPPP). Ver el [whitepaper](whitepaper.md), sección 6, y [04-autenticacion.md](arquitectura/04-autenticacion.md), sección 7.

Una plataforma que publica nombres de firmantes expone a esas personas a represalias. Una plataforma que no publica nada pide fe ciega. Rogatio publica pruebas matemáticas en lugar de nombres.

### 1.2 Qué se publica y qué no

| Dato | ¿Público? | Dónde vive | Fuente |
|---|---|---|---|
| Código fuente | Sí | Repositorio público, AGPL-3.0 | Whitepaper, secc. 5 |
| Raíz del árbol Merkle de cada petición | Sí | Página de la petición | Whitepaper, secc. 5 |
| Número de firmas | Sí | Página de la petición | Whitepaper, secc. 3 |
| `curp_hmac` truncado de cada firma | Sí | Lista pública de la petición | [04-autenticacion.md](arquitectura/04-autenticacion.md), secc. 7 |
| Umbrales, reglas de enrutamiento, criterios de moderación | Sí | Archivos del repositorio | Whitepaper, secc. 8 |
| Hash del acuse de recibo | Sí | Registro de la petición | Whitepaper, secc. 5 |
| Conteo de firmantes por distrito | Sí | Copias a representantes y página de la petición | [03-representantes.md](arquitectura/03-representantes.md), secc. 4 |
| Nombre y CURP del firmante | No | Cifrados en la base de datos | 04-autenticacion, secc. 7 |
| Imágenes de la credencial para votar | No, y no se conservan | Se borran tras procesarlas | 04-autenticacion, secc. 7 |
| `curp_hmac` completo | No | Base de datos | 04-autenticacion, secc. 7 |
| Llave del HMAC | No | Fuera de la base de datos y del repositorio | 04-autenticacion, secc. 7 |
| `(entidad, seccion)` de cada firmante | No en forma individual | Base de datos, en claro | 04-autenticacion, secc. 7 |
| Petición del Art. 8 con nombres | Solo a sus destinatarios | Autoridad y representantes | Whitepaper, secc. 6 |
| Petición del Art. 8 sin nombres | Sí (propuesta) | Página de la petición | Este documento |

La petición del Art. 8 lleva los nombres de los firmantes, porque la autoridad responde a peticionarios identificados. Esto ya está definido. Este documento propone además publicar en la página de la petición la misma petición sin nombres, para que cualquiera compare el texto enviado con el texto firmado.

**Propuesta: umbral mínimo para conteos por territorio.** Rogatio no publica conteos por sección electoral cuando una sección tiene menos de 10 firmas en una petición. Los agrupa en el distrito. Una sección tiene entre 100 y 3,000 electores (LGIPE Art. 147), y un conteo muy pequeño puede ayudar a identificar a una persona. La cifra de 10 es una propuesta para revisión.

### 1.3 Qué está definido y qué propone este documento

Este documento usa dos marcas:

- **Definido:** la regla ya aparece en el whitepaper o en un documento de arquitectura. Se cita la fuente.
- **Propuesta:** la regla es nueva. Aparece con la palabra "propuesta" o en una tabla con la columna "Origen". El dueño del proyecto debe aprobarla antes de que sea política.

Todo dato legal o institucional que no aparece en los documentos existentes lleva la marca "(por verificar)".

## 2. Qué puede verificar cualquier persona

### 2.1 Código abierto

Todo el código es público bajo [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html). Una bifurcación que funcione como servicio debe publicar sus cambios. La seguridad depende de llaves secretas, no de código secreto. Esto está definido en el whitepaper (secc. 5) y en [04-autenticacion.md](arquitectura/04-autenticacion.md) (secc. 1).

Propuestas:

- Cada página de Rogatio muestra en su pie el identificador del commit que está en producción.
- El repositorio publica las instrucciones para construir la misma versión. La meta a mediano plazo son compilaciones reproducibles.
- Ningún cambio llega a producción sin un pull request público. La única excepción es un parche de seguridad urgente. Ese parche se publica en un máximo de 14 días, con una explicación.

### 2.2 Registro de solo adición y comprobantes

Cada firma es una hoja nueva en el árbol Merkle de la petición. El diseño sigue [Certificate Transparency (RFC 6962)](https://www.rfc-editor.org/rfc/rfc6962). Rogatio no puede cambiar ni borrar una firma sin cambiar la raíz. Esto está definido en el whitepaper (secc. 4 y 5).

El firmante recibe un comprobante con:

- el número de secuencia,
- el hash de su hoja,
- la raíz del árbol en ese momento,
- una prueba de inclusión.

Con ese comprobante, el firmante comprueba que su firma está en el registro. No necesita la ayuda de Rogatio. Opcionalmente, la raíz se ancla en Bitcoin con [OpenTimestamps](https://opentimestamps.org/). Así nadie puede fechar hacia atrás ni reescribir el registro.

Propuestas:

- Rogatio publica la raíz de cada petición abierta al menos una vez al día, con su tamaño y su fecha. Cada publicación queda en un historial público.
- Rogatio publica pruebas de consistencia entre raíces sucesivas, como prevé RFC 6962. Una prueba de consistencia demuestra que la raíz nueva contiene todas las hojas de la anterior.
- El anclaje en OpenTimestamps es obligatorio para toda petición que llegue a su umbral.

Estado del anclaje:

- Cada raíz nueva se envía a los calendarios de OpenTimestamps al registrar la firma.
- La prueba (`.ots`) se descarga en `/peticion/<slug>/ots/<tamaño>`. El digest es la raíz.
- `npm run db:anclar` sella las raíces sin prueba y agrega el bloque de Bitcoin a las pendientes. Debe correr cada hora.
- `/verificar` revisa el `.ots` en el navegador contra la raíz del comprobante y el bloque de Bitcoin.
- Con el cliente oficial: `ots verify -d <raíz> archivo.ots`.

### 2.3 Conteos

El conteo de una petición es el tamaño de su árbol. No es un número que alguien escriba a mano. Cualquiera puede comparar el conteo de la página con el tamaño de la raíz publicada.

El umbral es una regla del producto. La ley no exige un número mínimo de firmantes para una petición del Art. 8. Cada nodo del árbol de jurisdicciones puede fijar su propio umbral, y gana el nodo más cercano (`resolver_configuracion()`, ver [01-jurisdicciones.md](arquitectura/01-jurisdicciones.md), secc. 4). El umbral de la demo en Cuauhtémoc está pendiente; la propuesta del whitepaper es 50.

**Propuesta: umbral fijo por petición.** Al publicarse una petición, Rogatio guarda con ella el umbral vigente. Un cambio posterior en `jurisdicciones.configuracion` solo aplica a peticiones nuevas. Nadie puede subir el umbral de una petición incómoda ni bajarlo para una petición favorita.

### 2.4 Reglas como datos públicos

Los criterios de moderación, los umbrales y la tabla de enrutamiento son archivos del repositorio público. Un cambio a cualquiera de ellos es un pull request público con revisión. Esto está definido en el whitepaper (secc. 8).

| Regla | Dónde vive | Documento |
|---|---|---|
| Catálogo de categorías | Tabla `categorias` (`codigo`, `nombre`, `codigo_padre`) | [02-enrutamiento.md](arquitectura/02-enrutamiento.md), secc. 6.1 |
| Reglas de competencia | Clave `enrutamiento` en `jurisdicciones.configuracion` | 02-enrutamiento, secc. 6.2 |
| Umbrales | `jurisdicciones.configuracion` | 01-jurisdicciones, secc. 4 |
| Representantes | Tabla `representantes`, con `url_fuente` y `obtenido_en` | [03-representantes.md](arquitectura/03-representantes.md), secc. 5 |
| Historial de representantes | Tabla `representantes_historial` | 03-representantes, secc. 5 |
| Criterios de moderación | Archivo de criterios en el repositorio | Whitepaper, secc. 3 y 8 |

Propuesta: el contenido de la tabla `categorias`, de la clave `enrutamiento` y de la tabla `representantes` se publica también como datos abiertos descargables (JSON y CSV), con la fecha y el commit de cada versión.

### 2.5 Envíos, acuses y respuestas

Cuando una petición llega a su umbral, Rogatio genera la petición del Art. 8, la envía a la autoridad competente y manda una copia a cada representante de los distritos de los firmantes. Rogatio guarda un registro de entrega por cada copia y guarda el hash de cada acuse de recibo en el registro. El plazo de respuesta corre desde la fecha de entrega. Esto está definido en el whitepaper (secc. 4 y 5) y en [03-representantes.md](arquitectura/03-representantes.md) (secc. 4 y 6).

Propuesta: la página de cada petición muestra, para cada destinatario:

| Campo | Ejemplo |
|---|---|
| Rol | `autoridad`, `autoridad_secundaria` o `representante` |
| Nombre y cargo | Persona titular de la Alcaldía Cuauhtémoc |
| Fundamento legal | LOA art. 32 fr. IV |
| `estado_competencia` | `verificada` o `por_verificar` |
| Canal | Correo institucional u oficialía de partes |
| Fecha de envío | 2026-11-03 |
| Hash del acuse | Hash publicado en el registro |
| Imagen del acuse | Copia sin datos personales de los firmantes |
| Respuesta | Texto o PDF de la respuesta, sin datos personales |
| Días transcurridos | Días naturales desde la entrega hasta la respuesta |

Si la autoridad responde "no es de mi competencia", Rogatio registra la respuesta y ofrece reenviar la petición a la autoridad que la respuesta señale. Esto está definido en [02-enrutamiento.md](arquitectura/02-enrutamiento.md), secc. 4. La propuesta es que esa respuesta y el reenvío también sean públicos.

### 2.6 Plazos

El Art. 8 de la CPEUM obliga a responder por escrito "en breve término". La Constitución no fija un número de días. Rogatio no inventa uno. Muestra los días transcurridos desde la entrega y deja que cada persona juzgue.

Rogatio sí se impone plazos a sí misma. **Propuesta:**

| Paso | Plazo máximo de Rogatio |
|---|---|
| Revisión de moderación de una petición nueva | 5 días hábiles |
| Resolución de una apelación de moderación | 10 días hábiles |
| Revisión humana de `estado_competencia = "por_verificar"` | 5 días hábiles desde el umbral |
| Envío de la petición del Art. 8 tras el umbral (competencia verificada) | 3 días hábiles |
| Publicación del acuse tras recibirlo | 2 días hábiles |
| Publicación de una respuesta tras recibirla | 5 días hábiles |

Cada retraso sobre estos plazos aparece en la página de la petición con su motivo. El informe de transparencia (secc. 5.6) cuenta los retrasos.

## 3. Neutralidad política

### 3.1 Principio: la misma regla para todas las peticiones

El whitepaper lo dice así: la neutralidad es el activo principal. Un partido que pueda pagar para mover una petición la destruye.

Rogatio aplica una sola regla a todas las peticiones, sin importar su tema, su autor o a quién incomoda. Cada decisión cae en uno de dos tipos:

- **Decisiones automáticas.** Las toma el código con reglas públicas: conteo, umbral, enrutamiento con competencia verificada, orden de las listas. Son deterministas. Las mismas entradas dan las mismas salidas.
- **Decisiones humanas.** Moderación, revisión de competencia por verificar, revisión de cambios de representantes. Siguen criterios publicados, quedan registradas con su motivo y se pueden apelar.

No existe un tercer tipo. Ninguna persona puede decidir "a mano" fuera de estos dos caminos.

Hay cuatro momentos donde alguien podría intentar influir. La tabla resume cómo los cierra Rogatio.

| Momento | Riesgo | Control | Origen |
|---|---|---|---|
| Publicación | Rechazar peticiones incómodas | Criterios publicados, decisión registrada, apelación | Whitepaper (criterios); este documento (registro y apelación) |
| Visibilidad | Destacar o esconder peticiones | Sin orden editorial ni destacados pagados | Whitepaper (sin peticiones patrocinadas); este documento (orden) |
| Destino | Enviar a la autoridad equivocada | Enrutamiento determinista con reglas públicas | 02-enrutamiento |
| Tiempo | Retrasar el envío | Umbral fijo, envío automático, plazos publicados | Este documento |

### 3.2 Publicación: moderación con criterios publicados

Rogatio revisa cada petición antes de que pueda recibir firmas. Este paso viene del modelo del Parlamento británico y está definido en el whitepaper (secc. 3). Los criterios de moderación son un archivo del repositorio público (whitepaper, secc. 8).

**Propuesta de criterios mínimos.** Una petición se publica si cumple todo esto:

1. Pide una acción concreta a una autoridad.
2. Es escrita, pacífica y respetuosa, como exige el Art. 8 de la CPEUM.
3. No contiene datos personales de terceros.
4. No llama a votar por o contra un partido, candidato o coalición, ni hace propaganda electoral.
5. No duplica una petición abierta con el mismo objeto en la misma jurisdicción. En ese caso, Rogatio sugiere la petición existente.
6. No pide algo ilegal ni incita a la violencia o a la discriminación.

La postura política de la petición no es un criterio. Una petición contra el gobierno en turno y una petición a favor reciben la misma revisión.

**Propuesta de registro y apelación:**

- Cada decisión de moderación queda en la bitácora de auditoría (secc. 5.3) con el criterio aplicado, la persona que decidió y la fecha.
- El autor recibe el motivo por escrito, con el número del criterio.
- Rogatio publica una lista de peticiones rechazadas con su título y su criterio. Omite el texto solo cuando ese texto viola los criterios 3 o 6.
- El autor puede apelar una vez. Resuelve una persona distinta de la que rechazó.
- Rogatio no edita el texto de una petición. Puede sugerir cambios; el autor decide.
- Una petición publicada no se retira por presión externa. Solo se retira por una orden de autoridad competente (secc. 5.7) o por un error de moderación registrado y explicado.

### 3.3 Visibilidad: sin orden editorial ni destacados pagados

El whitepaper prohíbe las peticiones patrocinadas. **Propuesta para el orden:**

- Las listas de peticiones tienen solo órdenes mecánicos: más recientes, más firmas, más cerca del umbral, por jurisdicción y por categoría.
- El código de cada orden es público. No hay un orden "recomendado" ni "destacado".
- Rogatio no vende ni regala espacios de portada, banners ni notificaciones para una petición.
- Los correos y avisos de Rogatio a sus usuarios siguen la misma regla. Un aviso sobre una petición solo llega a quien la firmó o a quien se suscribió a esa jurisdicción o categoría.
- Las cuentas oficiales de Rogatio en redes sociales no promueven peticiones individuales. Publican hitos con una regla fija, por ejemplo "llegó al umbral" o "la autoridad respondió", para todas las peticiones por igual.

### 3.4 Destino: enrutamiento determinista con reglas públicas

El enrutamiento ya está definido en [02-enrutamiento.md](arquitectura/02-enrutamiento.md):

- La entrada es la categoría de la petición y el territorio de los firmantes.
- La regla vive en la clave `enrutamiento` de `jurisdicciones.configuracion`. Gana el nodo más cercano. Gana el código exacto sobre el código padre.
- `enrutar()` devuelve primero la autoridad, luego las autoridades secundarias y al final los representantes.
- Si no hay regla, `estado_competencia = "por_verificar"`, y una persona confirma el destinatario antes del envío.
- El resultado se guarda con la petición al llegar al umbral.

El partido político no participa en el enrutamiento. La columna `representantes.partido` es solo informativa ([03-representantes.md](arquitectura/03-representantes.md), secc. 5). Rogatio nunca envía copias a un grupo parlamentario, porque es un órgano de partido y no territorial (03-representantes, secc. 4).

Propuestas:

- Una prueba automática del repositorio falla si `enrutar()` lee `representantes.partido`.
- Con el resultado de `enrutar()`, Rogatio guarda el commit de las reglas que usó. Cualquiera puede repetir el cálculo con esa versión.
- La revisión humana de `por_verificar` registra el destinatario elegido, el fundamento legal y la persona que decidió. Si la misma categoría aparece por verificar dos veces, el equipo abre un pull request para agregar la regla a la tabla. Así la decisión humana se vuelve regla pública.
- La revisión de competencia no puede cambiar las copias a representantes. Esas salen siempre de los distritos de los firmantes.

### 3.5 Tiempo: umbral fijo y envío automático

Retrasar un envío es una forma de censura. Alguien podría guardar una petición incómoda hasta después de una elección. **Propuesta:**

- El umbral queda fijo al publicar la petición (secc. 2.3).
- Al llegar al umbral, el sistema genera la petición del Art. 8 de inmediato. Si la competencia está verificada, el envío sale en el plazo de la secc. 2.6.
- La página muestra la fecha y hora en que se cruzó el umbral, tomada del registro.
- Cualquier pausa en un envío requiere la regla de dos personas (secc. 5.4) y queda pública con su motivo.
- Los periodos electorales no detienen los envíos (secc. 3.8).

### 3.6 Quién no puede operar ni financiar la plataforma

El whitepaper fija estas líneas rojas:

- Sin dinero de partidos, candidatos ni campañas.
- Sin venta de datos, tampoco como agregados.
- Sin peticiones patrocinadas.
- Registros de financiamiento públicos.

También define que el gobierno es destinatario de peticiones, nunca dueño.

**Propuesta: incompatibilidades.** Mientras ocupen el cargo y durante 2 años después, estas personas no pueden ser parte del consejo, del equipo de moderación, del equipo de operación ni tener acceso administrativo:

| Persona | Incompatible |
|---|---|
| Dirigente de un partido político, en cualquier nivel | Sí |
| Candidato, precandidato o aspirante registrado a un cargo de elección | Sí |
| Persona servidora pública con cargo de elección o de mando | Sí |
| Persona que trabaje para una autoridad de la tabla de enrutamiento | Sí, mientras trabaje ahí |
| Persona contratada por una campaña o un grupo parlamentario | Sí |
| Militante sin cargo | No, pero lo declara (secc. 3.7) |

Estas personas sí pueden firmar peticiones como cualquier ciudadano. El derecho de petición es de todas las personas.

Si un fundador, consejero o miembro del equipo decide buscar un cargo de elección, deja su función en Rogatio antes de registrarse como aspirante.

### 3.7 Conflictos de interés

**Propuesta:**

- Cada consejero, moderador y operador firma una declaración pública de intereses al entrar y la actualiza cada año. Incluye militancia partidista, empleos y contratos con autoridades, y relación con donantes.
- Una persona no modera, no revisa competencia y no apela en una petición donde tenga un interés. Ejemplos: la petición se dirige a su empleador, a un cliente de su empresa, o la escribió un familiar.
- La persona se excusa y la excusa queda en la bitácora.
- Un conflicto no declarado es causa de baja.

### 3.8 Periodos electorales

Las peticiones no son propaganda electoral. Un periodo electoral no suspende el derecho de petición. La LGIPE prohíbe la propaganda electoral en los días previos a la jornada (artículo por verificar). La ley que rige estos periodos es la LGIPE y la ley electoral local de la CDMX (artículos por verificar).

**Propuesta:**

- Rogatio sigue recibiendo firmas y enviando peticiones durante campañas y veda. Las reglas no cambian.
- El criterio de moderación 4 (secc. 3.2) aplica siempre, no solo en elecciones.
- Si un candidato registrado es autor de una petición, la página lo dice. Rogatio no publica peticiones nuevas cuyo autor sea candidato entre el inicio de las campañas y el día de la jornada. Se publican al día siguiente.
- Durante la veda, Rogatio no publica comunicados que mencionen partidos ni candidatos.
- Rogatio no publica rankings de representantes por partido, ni de "quién responde más" agrupados por partido. Publica datos por cargo y por persona, iguales para todos.

### 3.9 Fundadores y el lugar de la demo

Las reglas aplican también a los fundadores. Ser fundador no da ningún permiso fuera de las reglas de este documento.

Propuesta: quien opere Rogatio declara en público sus contratos con autoridades, partidos o grupos parlamentarios, y se excusa en peticiones dirigidas a esas contrapartes. Ninguna organización externa tiene acceso a datos de firmantes.

La demo se presenta en la Cámara de Diputados, en el Claude Impact Lab. Presentar en un recinto legislativo no crea una relación con la Cámara ni con ningún grupo parlamentario. Propuesta: todo apoyo en especie recibido para la demo (espacio, créditos, viajes) aparece en el primer informe de transparencia.

### 3.10 Lo que no es manipulación

Un partido puede pedir a sus militantes que firmen una petición. Si cada firmante es una persona real con su credencial, firma una sola vez y vive en el territorio, esa firma es legítima. Rogatio no juzga el motivo de un firmante.

Rogatio garantiza que cada firma cuenta una vez y que el partido no puede comprar nada que un ciudadano sin partido no tenga. No garantiza que las peticiones no tengan contenido político. El derecho de petición incluye la materia política (CPEUM Art. 35 fr. V).

## 4. Financiamiento

### 4.1 Fuentes aceptables y prohibidas

Las líneas rojas del whitepaper ya prohíben dinero de partidos, candidatos y campañas. **Propuesta de tabla completa:**

| Fuente | ¿Aceptable? | Condición |
|---|---|---|
| Donativos de personas físicas | Sí | Tope por persona; publicación según 4.3 |
| Fundaciones y organizaciones civiles | Sí | Sin vínculo con partidos; declaran sus propios donantes principales |
| Empresas | Sí, con condiciones | Sin contratos vigentes con autoridades de la tabla de enrutamiento; sin derecho a influir |
| Cooperación internacional y organismos multilaterales | Sí, con condiciones | Sin condiciones sobre peticiones o temas |
| Créditos o servicios en especie (nube, API, espacio) | Sí | Se valoran y se publican como un donativo |
| Partidos, candidatos, campañas, precandidatos | No | Línea roja del whitepaper |
| Grupos parlamentarios y legisladores en lo individual | No | Mismo motivo |
| Gobiernos y autoridades de cualquier nivel | No | El gobierno es destinatario, nunca dueño |
| Donativos anónimos sobre el umbral de publicación | No | Se devuelven |
| Venta de datos o de agregados | No | Línea roja del whitepaper |
| Peticiones patrocinadas, destacados pagados | No | Línea roja del whitepaper |

Un donativo nunca compra una decisión. Ningún convenio de donación puede mencionar una petición, una categoría, una autoridad ni un plazo. Rogatio publica el texto de cada convenio mayor al umbral de publicación.

### 4.2 Topes

**Propuesta:**

- Ninguna fuente aporta más del 25% del ingreso anual de Rogatio A.C.
- Ninguna empresa aporta más del 10% del ingreso anual.
- Si una fuente supera el tope por una caída de otros ingresos, Rogatio no acepta nuevos fondos de esa fuente hasta volver al tope.

Estas cifras son propuestas para revisión, no requisitos legales.

### 4.3 Publicación de donantes y estados financieros

El whitepaper exige registros de financiamiento públicos. **Propuesta:**

- Rogatio publica cada trimestre la lista de donantes con nombre y monto cuando el donativo anual de una fuente supera un umbral (propuesta: el equivalente a 50 UMA (por verificar el valor vigente)). Los donativos menores se publican agregados.
- Rogatio publica cada año sus estados financieros y el informe de un auditor externo.
- Rogatio publica sus gastos por rubro: infraestructura, personal, legal, envíos físicos y otros.
- Si Rogatio A.C. obtiene la autorización como donataria autorizada del SAT, también cumple sus obligaciones de transparencia (régimen y requisitos por verificar).

Rogatio A.C. aún no está constituida (por verificar, según el whitepaper). Antes de su constitución, todo ingreso relacionado con Rogatio se publica con las mismas reglas.

## 5. Gobernanza y controles

### 5.1 Quién decide

Ya definido en el whitepaper (secc. 8):

- Una asociación civil, Rogatio A.C., opera la plataforma (por verificar: aún no constituida).
- El gobierno es destinatario, nunca dueño.
- Ninguna empresa ni organización externa controla la plataforma.
- Los criterios de moderación, los umbrales y la tabla de enrutamiento son archivos públicos. Un cambio es un pull request público con revisión.

**Propuesta de órganos:**

| Órgano | Decide | No decide |
|---|---|---|
| Asamblea de asociados | Estatutos, nombramiento del consejo, aprobación de estados financieros | Peticiones individuales |
| Consejo directivo | Cambios a esta política, a los criterios de moderación y a los umbrales; presupuesto | Peticiones individuales, salvo apelación final |
| Equipo de moderación | Publicación o rechazo según criterios | Enrutamiento, código, finanzas |
| Revisión legal | `estado_competencia = "por_verificar"`, reglas nuevas de enrutamiento | Moderación |
| Operación técnica | Despliegues, infraestructura, llaves | Contenido de peticiones |
| Comité de apelación | Apelaciones de moderación | Primera revisión |

Un cambio a los criterios de moderación o a los umbrales necesita un pull request público abierto al menos 14 días antes de su fusión, salvo un error evidente.

### 5.2 Separación de funciones

**Propuesta:**

- Quien modera una petición no revisa su competencia.
- Quien resolvió una moderación no resuelve su apelación.
- Quien tiene acceso a la llave del HMAC no tiene acceso al texto cifrado de nombres y CURP, salvo en el proceso automático que genera la petición del Art. 8.
- Quien despliega código no aprueba su propio pull request.
- Quien maneja finanzas no modera.

Con un equipo pequeño, algunas separaciones no serán posibles al inicio. Cada excepción se publica en el informe de transparencia (secc. 8).

### 5.3 Bitácora de auditoría

[04-autenticacion.md](arquitectura/04-autenticacion.md) (secc. 8) ya incluye una bitácora de auditoría como control contra un operador interno. **Propuesta de alcance:**

- Una tabla de solo adición, `bitacora_auditoria`, registra cada acción administrativa: quién, qué, cuándo, sobre qué objeto y con qué motivo.
- La bitácora usa el mismo árbol Merkle que las firmas. Su raíz se publica cada día.
- La versión pública muestra cada acción con su tipo, fecha, objeto y motivo. Muestra el rol de quien actuó, no su nombre. Las acciones de consejo muestran el nombre.
- La bitácora no contiene datos personales de firmantes.

Acciones que se registran, como mínimo:

| Acción | Registro público |
|---|---|
| Publicar o rechazar una petición | Sí, con criterio |
| Resolver una apelación | Sí, con motivo |
| Elegir destinatario en `por_verificar` | Sí, con fundamento legal |
| Pausar o reanudar un envío | Sí, con motivo |
| Retirar una petición publicada | Sí, con motivo |
| Cambiar una fila de `representantes` a mano | Sí, con `url_fuente` |
| Descifrar nombres para generar una petición del Art. 8 | Sí, sin nombres |
| Responder a una solicitud de autoridad | Sí, según secc. 5.7 |
| Rotar llaves | Sí, sin las llaves |
| Desplegar a producción | Sí, con commit |
| Cambiar permisos de una cuenta administrativa | Sí |

### 5.4 Regla de dos personas

**Propuesta:** estas acciones necesitan la aprobación de dos personas distintas, ambas registradas en la bitácora:

| Acción sensible | Por qué |
|---|---|
| Retirar una petición ya publicada | Puede ser censura |
| Pausar un envío | Puede ser retraso deliberado |
| Cambiar un destinatario ya calculado por `enrutar()` | Puede desviar la petición |
| Anular una firma (p. ej. por credencial falsa demostrada) | Puede ocultar firmas |
| Descifrar datos fuera del proceso automático | Puede exponer firmantes |
| Rotar o usar la llave del HMAC | Puede romper o revelar seudónimos |
| Entregar datos a una autoridad | Puede exponer firmantes |
| Desplegar un parche de seguridad sin pull request previo | Saltar la revisión pública |

Una anulación de firma no borra la hoja del árbol. Agrega una hoja nueva que anula la anterior, con el motivo. El conteo público resta la firma anulada y muestra cuántas anulaciones hubo.

### 5.5 Auditorías externas

**Propuesta:**

- Una auditoría de seguridad del código y la infraestructura antes del lanzamiento del piloto y después cada año.
- Una auditoría de procesos cada año. El auditor revisa una muestra de decisiones de moderación, de revisiones de competencia y de envíos contra la bitácora.
- Una auditoría de firmas cada año. El auditor revisa, con acuerdo de confidencialidad y en las instalaciones de Rogatio, una muestra aleatoria de firmas contra los datos cifrados. Comprueba que corresponden a personas verificadas y a la sección declarada. El auditor publica solo resultados agregados.
- Rogatio publica los informes completos. Si un informe revela una falla de seguridad abierta, se publica después de corregirla, en un máximo de 90 días.
- El auditor no puede tener contratos con partidos ni con autoridades de la tabla de enrutamiento.

### 5.6 Informes de transparencia

**Propuesta:** Rogatio publica un informe cada semestre con:

- Peticiones recibidas, publicadas, rechazadas (por criterio) y apeladas (con resultado).
- Peticiones que llegaron al umbral, envíos hechos, acuses recibidos, respuestas recibidas y días de respuesta por autoridad.
- Casos `por_verificar` y cómo se resolvieron.
- Retrasos sobre los plazos de la secc. 2.6.
- Anulaciones de firmas y su motivo.
- Solicitudes de autoridades (secc. 5.7).
- Incidentes de seguridad.
- Excepciones a la separación de funciones.
- Ingresos, donantes y gastos (secc. 4).
- Cambios a esta política y a los criterios.

Cada informe incluye los datos en formato abierto.

### 5.7 Solicitudes de autoridades

Una autoridad puede pedir datos de firmantes, el retiro de una petición o la suspensión de un envío. **Propuesta:**

- Rogatio solo atiende solicitudes por escrito, de autoridad competente, fundadas y motivadas.
- La revisión legal valida cada solicitud. Su atención requiere la regla de dos personas.
- Rogatio entrega el mínimo de datos que la orden exige.
- Rogatio avisa a los firmantes afectados, salvo que la ley o la orden lo prohíban (por verificar en cada caso).
- El informe de transparencia publica el número de solicitudes, la autoridad, el tipo de dato pedido y el resultado. Si la ley impide publicar un caso, el informe lo cuenta sin detalles.
- Una solicitud informal (llamada, reunión, mensaje) se registra en la bitácora y no se atiende.

### 5.8 Cambios a esta política

Esta política vive en el repositorio. Un cambio sigue la misma regla que los criterios de moderación: pull request público, al menos 14 días de comentarios y aprobación del consejo. El historial de Git es el registro de cambios.

## 6. Amenazas y mitigaciones

| Amenaza | Ejemplo | Mitigación | Qué ve el público | Origen |
|---|---|---|---|---|
| Presión de un partido o gobierno para rechazar una petición | Un funcionario pide "bajar" una petición | Criterios publicados; solicitud informal registrada y no atendida; retiro solo con orden escrita y dos personas | Bitácora, informe semestral | Whitepaper; este documento |
| Partido que paga para destacar una petición | Oferta de donativo a cambio de portada | Sin destacados pagados; sin dinero de partidos; orden mecánico | Código de orden; lista de donantes | Whitepaper; este documento |
| Firma masiva falsa | Bots o credenciales inventadas | Dígitos verificadores de la MRZ, cruces MRZ y frente, `UNIQUE(curp_hmac)`, límites por sección, alertas | Conteos; anulaciones publicadas | 04-autenticacion |
| Imágenes de INE robadas | Filtraciones de credenciales | Más adelante: prueba de vida, Llave CDMX como segundo factor, convenio con INE | Conteo de anulaciones | 04-autenticacion |
| Operador interno que borra firmas | Un empleado elimina hojas | Árbol Merkle de solo adición; la raíz cambia; comprobantes; anclaje en OpenTimestamps; pruebas de consistencia | Raíces e historial | Whitepaper; este documento |
| Operador interno que oculta firmas al recibirlas | El servidor rechaza firmas de una sección | Alertas de errores por sección; conteo público de intentos fallidos por petición; auditoría de procesos | Informe de errores | Este documento |
| Operador interno que revela identidades | Cruza `curp_hmac` con una lista de CURP | Llave del HMAC en un KMS, fuera de la base y del repositorio; nombres cifrados; dos personas para usar la llave | Bitácora de uso de llaves | 04-autenticacion; este documento |
| Censura por moderación | Rechazo de peticiones contra un gobierno | Criterios publicados, motivo escrito, lista de rechazos, apelación ante otra persona | Lista de rechazos | Whitepaper; este documento |
| Desvío a la autoridad equivocada | Enviar a quien no tiene competencia para que la petición muera | Enrutamiento determinista; reglas públicas; commit guardado con el resultado; revisión registrada en `por_verificar`; reenvío tras "no es de mi competencia" | Destinatario, fundamento, `estado_competencia` | 02-enrutamiento; este documento |
| Enrutamiento por partido | Copiar solo a representantes afines | `partido` solo informativo; prueba automática; nunca copia a grupos parlamentarios | Código y pruebas | 03-representantes; este documento |
| Retraso deliberado del envío | Guardar una petición hasta después de la elección | Umbral fijo; envío automático; plazos propios; pausa con dos personas | Fecha del umbral y del envío; días de retraso | Este documento |
| Cambio de umbral a conveniencia | Subir el umbral de una petición incómoda | Umbral fijo al publicar; cambios por pull request público | Umbral en la página | Este documento |
| Captura por un financiador | Un donante condiciona su apoyo | Topes por fuente; convenios sin cláusulas sobre peticiones; publicación de convenios | Donantes, convenios, estados financieros | Whitepaper; este documento |
| Captura por los fundadores | Un fundador usa la plataforma para su carrera política | Las reglas aplican a fundadores; incompatibilidades; salida antes de registrarse como aspirante | Declaraciones de intereses | Este documento |
| Conflicto de interés de quien opera | Una contraparte con contratos pide trato especial | Declaración pública de contratos con autoridades; excusa; sin acceso externo a datos de firmantes | Declaración de contratos | Este documento |
| Representante desactualizado | Copia a quien ya dejó el cargo | Actualización semanal; `obtenido_en` menor a 7 días antes de cada envío; `representantes_historial`; revisión manual de cambios de titular | `url_fuente`, `obtenido_en` | 03-representantes |
| Solicitud de datos por una autoridad | Orden para entregar nombres de firmantes | Solo por escrito, fundada y motivada; revisión legal; dos personas; mínimo de datos; aviso al firmante si la ley lo permite | Informe semestral | Este documento |
| Código distinto al publicado | Producción corre un cambio no revisado | Commit en el pie de página; pull requests públicos; auditoría de seguridad; meta de compilaciones reproducibles | Commit desplegado | Whitepaper; este documento |

## 7. Cómo comprobarlo, paso a paso

### 7.1 Un ciudadano que firmó

1. Guarda tu comprobante. Contiene el número de secuencia, el hash de tu hoja, la raíz y la prueba de inclusión.
2. Abre la página de la petición. Busca tu seudónimo en la lista pública. Es tu `curp_hmac` truncado.
3. Usa el verificador del repositorio (propuesta: una página estática y una herramienta de línea de comandos) para comprobar tu prueba de inclusión contra la raíz.
4. Más tarde, pide una prueba de consistencia entre la raíz de tu comprobante y la raíz actual. Si la prueba falla, alguien alteró el registro.
5. Si la petición llegó a su umbral, revisa a quién se envió, con qué fundamento legal y en qué fecha. Revisa el hash del acuse.
6. Revisa los días transcurridos desde la entrega y la respuesta de la autoridad.
7. Si algo no cuadra, abre un reporte público en el repositorio o escribe al contacto de transparencia (propuesta).

### 7.2 Un periodista

1. Descarga el historial de raíces de una petición. Comprueba que el tamaño del árbol nunca baja, salvo anulaciones publicadas.
2. Compara el conteo de la página con el tamaño de la raíz.
3. Comprueba el anclaje en OpenTimestamps de la raíz del umbral.
4. Busca la categoría de la petición en la tabla `categorias`. Busca su regla en la clave `enrutamiento` de `jurisdicciones.configuracion` con el commit guardado. Comprueba que el destinatario coincide.
5. Si la petición estuvo `por_verificar`, lee en la bitácora quién decidió, con qué fundamento y cuándo.
6. Revisa las copias a representantes. Comprueba que salen de los distritos de los firmantes y no del partido.
7. Pregunta a la autoridad si recibió la petición en la fecha del acuse.
8. Revisa la lista de peticiones rechazadas y sus criterios. Busca patrones por tema o por autoridad afectada.
9. Cruza la lista de donantes con los registros públicos de partidos y de contratos de gobierno.

### 7.3 Un auditor

1. Revisa el código en el commit desplegado. Construye la misma versión y compara (cuando haya compilaciones reproducibles).
2. Comprueba que `enrutar()` no lee `representantes.partido` y que la prueba automática existe y pasa.
3. Recalcula el árbol Merkle de una muestra de peticiones desde las hojas y compara las raíces publicadas.
4. Revisa la bitácora de auditoría contra las acciones visibles: cada rechazo, pausa, cambio de destinatario y anulación tiene su entrada.
5. Comprueba que las acciones sensibles tienen dos aprobaciones de personas distintas.
6. Revisa, con confidencialidad, una muestra aleatoria de firmas contra los datos cifrados.
7. Revisa el manejo de la llave del HMAC: dónde vive, quién la usó y cuándo.
8. Revisa las declaraciones de intereses, los convenios de donación y los topes.
9. Publica el informe completo.

## 8. Límites

Rogatio no puede garantizar todo. Estos son los límites conocidos.

- **El servidor puede correr código distinto.** El pie de página y la licencia AGPL obligan a publicar, pero no prueban qué corre en el servidor. Las compilaciones reproducibles y las auditorías reducen el riesgo. No lo eliminan.
- **La censura en la entrada no deja rastro criptográfico.** El árbol prueba que una firma aceptada no se borra. No prueba que el servidor aceptó todas las firmas que recibió. Quien no recibió comprobante no puede probar que intentó firmar. Los conteos de errores y las auditorías ayudan, pero dependen del operador.
- **La verificación de identidad es limitada.** La demo usa un formulario simulado. Más adelante, la OCR y los cruces detectan errores y falsificaciones simples. No detectan una credencial real robada sin prueba de vida ni convenio con INE ([04-autenticacion.md](arquitectura/04-autenticacion.md), secc. 2 y 8).
- **Quien tiene la llave del HMAC puede ligar seudónimos con CURP.** El control es organizacional: KMS, dos personas, bitácora. No es matemático.
- **Los destinatarios ven los nombres.** La petición del Art. 8 lleva los nombres de los firmantes. Rogatio no controla qué hace la autoridad o el representante con ellos. A ellos los rige la LGPDPPSO, no la LFPDPPP ([04-autenticacion.md](arquitectura/04-autenticacion.md), secc. 7).
- **La moderación es juicio humano.** Los criterios publicados, el registro y la apelación reducen la arbitrariedad. No la eliminan.
- **Muchas reglas de competencia están por verificar.** Varias filas de la tabla de [02-enrutamiento.md](arquitectura/02-enrutamiento.md) están marcadas `por_verificar`. Un error legal en una regla pública sigue siendo un error, aunque sea transparente.
- **Rogatio no puede obligar a responder.** El Art. 8 obliga a la autoridad. Rogatio solo muestra si respondió y cuándo. Los representantes no tienen obligación legal de responder.
- **Preguntas legales abiertas.** Aún no está definido quién firma como peticionario, ni si un correo institucional es una entrega válida del Art. 8 ([whitepaper](whitepaper.md), preguntas abiertas).
- **El equipo es pequeño.** Al inicio, la regla de dos personas y la separación de funciones serán difíciles de cumplir completas. Cada excepción se publica.
- **Rogatio A.C. no existe todavía** (por verificar). Hasta su constitución, la gobernanza formal de la secc. 5 es una propuesta.
- **Rogatio no puede impedir la acción política legítima.** Un partido puede organizar a sus militantes para firmar. Si cada firma es válida, cuenta (secc. 3.10).
- **Retirar una firma choca con el registro de solo adición.** El firmante puede tener derechos de cancelación sobre sus datos (derechos ARCO bajo la LFPDPPP, artículos por verificar). La propuesta es agregar una hoja de retiro y borrar los datos cifrados, sin borrar la hoja original. La validez legal de esta solución está por verificar con asesoría legal.

## Preguntas abiertas

- ¿Qué umbral mínimo usamos para publicar conteos por sección (propuesta: 10)?
- ¿Qué topes de financiamiento adopta el consejo (propuesta: 25% por fuente y 10% por empresa)?
- ¿Cuánto dura el periodo de incompatibilidad después de dejar un cargo partidista o público (propuesta: 2 años)?
- ¿Publicamos el nombre de cada moderador o solo su rol?
- ¿Quién hace la auditoría externa del piloto y quién la paga sin crear un conflicto?
- ¿Cómo maneja el registro de solo adición el derecho de cancelación del firmante?
- ¿Qué fechas exactas de campaña y veda aplican en la CDMX para la regla de la secc. 3.8 (por verificar con la LGIPE y la ley electoral local)?
- ¿Podemos publicar imágenes de los acuses y de las respuestas sin datos personales de servidores públicos que la ley proteja (por verificar)?

## Fuentes

- [Whitepaper de Rogatio](whitepaper.md): modelo de confianza (secc. 5), privacidad (secc. 6), alcance y hoja de ruta (secc. 7), gobernanza (secc. 8).
- Arquitectura: [01-jurisdicciones](arquitectura/01-jurisdicciones.md), [02-enrutamiento](arquitectura/02-enrutamiento.md), [03-representantes](arquitectura/03-representantes.md), [04-autenticacion](arquitectura/04-autenticacion.md).
- [CPEUM, Arts. 8 y 35, Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf)
- [LFPDPPP, Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf) y [LGPDPPSO](https://www.diputados.gob.mx/LeyesBiblio/pdf/LGPDPPSO.pdf)
- [LGIPE, Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LGIPE.pdf) (artículos sobre campañas y veda por verificar)
- [Ley Orgánica del Congreso General, Art. 26](https://www.diputados.gob.mx/LeyesBiblio/pdf/LOCGEUM.pdf)
- [RFC 6962, Certificate Transparency](https://www.rfc-editor.org/rfc/rfc6962); [OpenTimestamps](https://opentimestamps.org/); [GNU AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html)
- [Peticiones del Parlamento del Reino Unido: criterios](https://petition.parliament.uk/standards)
