# Video de la demo

Grabado con el guion `e2e/demo/recorrido.spec.ts` sobre la build de producción. Solo datos ficticios.

- `demo-60s.webm`: recorrido completo de la demo (57 s).
- `01-peticion.png`: petición con 49 de 50 firmas.
- `02-desglose.png`: firmas por distrito local y federal.
- `03-comprobante.png`: comprobante de la firma 50.
- `04-verificado.png`: el comprobante se verifica como válido.
- `05-umbral.png`: petición con 50 de 50 y el umbral alcanzado.
- `06-escrito.png`: escrito del Art. 8 con la marca "SIMULACIÓN – NO ENVIADO".

## Volver a grabar

Requiere Postgres y `.env.local`. El guion reinicia la semilla al empezar.

```bash
npm run demo:video
```

El video queda en `test-results/demo/recorrido-recorrido-de-la-demo/video.webm` y las capturas en `test-results/demo/capturas/`. Los tiempos de cada escena están en el objeto `PAUSAS` del guion.
