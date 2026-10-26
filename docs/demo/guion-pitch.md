# Guion del pitch

Duración: 1 minuto. El guion se dice sobre el video de la demo.

- Deck: <https://claude.ai/artifact/LmsvjRcveBdEzdLiTx5FM6>
- Video: [`demo-60s.webm`](demo-60s.webm) (61 s)

La portada está en pantalla antes de empezar. El reloj arranca con el video. Las demás diapositivas quedan para responder preguntas.

## Guion

Los tiempos son del video. Cada fila tiene el tiempo de su escena: no hay que decir más palabras de las que caben.

| Video | Pantalla | Qué decir |
| --- | --- | --- |
| 0:00 | Inicio, petición con 49 de 50 | «Velitis, iubeatis, Quirites?» Así le preguntaba al pueblo la *rogatio* romana. Nuestra Rogatio la invierte: es código abierto para que el pueblo pregunte. |
| 0:07 | Firmas por distrito | Y el Art. 8 de la Constitución obliga a la autoridad a responder por escrito. |
| 0:13 | Mapa por sección, aviso de privacidad | Sirve desde una calle hasta el nivel federal. Este ejemplo es de la Alcaldía Cuauhtémoc: el mapa muestra las firmas por sección. |
| 0:21 | Credencial | Para firmar, se lee la credencial del INE. Su sección dice que vive en Cuauhtémoc. |
| 0:29 | Confirmar, comprobante 50 | Cada petición fija su umbral de firmas, para darle más peso. El umbral se puede ajustar. Su comprobante no lleva su nombre ni su CURP. |
| 0:37 | Verificar, válido | Cualquiera lo verifica en su navegador. Todas las firmas se resumen en un solo hash, anclado en Bitcoin con OpenTimestamps: nadie puede cambiarlo. |
| 0:46 | Umbral alcanzado | 50 de 50: umbral alcanzado. |
| 0:52 | Escrito del Art. 8 | Rogatio genera el escrito del Art. 8 para la alcaldía. El pueblo pregunta. La autoridad responde. |

## Antes de presentar

- **Ensayen con reloj.** Cada escena da unas 2 palabras por segundo. Si una frase no cabe, recórtenla; no esperen al video.
- **Tiempos del video.** Salen de los cortes de escena del video y de un cuadro por segundo. Puede haber un desfase de 1 segundo.
- **OpenTimestamps no sale en el video.** El video se grabó antes de fusionar OpenTimestamps. La línea de 0:37 lo dice en voz alta. Para que se vea, hay que volver a grabar con `npm run demo:video`.
- **El video no está dentro del deck.** Hay que reproducirlo aparte.
- **Es una demo.** Las firmas son sintéticas, la credencial es simulada y el escrito no se envía. Si alguien pregunta, díganlo.
- **Equipo.** Falta llenar `[Equipo: nombres y contacto]` en la última diapositiva.
