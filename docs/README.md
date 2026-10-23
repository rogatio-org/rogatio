# Documentación de Rogatio

Rogatio es una plataforma de código abierto de peticiones ciudadanas verificadas para México.
Cada firmante acredita su identidad con la credencial para votar del INE y recibe un comprobante público y verificable.
Al alcanzar su umbral, Rogatio envía una petición del Art. 8 a la autoridad competente y copia a los representantes de los firmantes.

- [Bienvenida](bienvenida.md): guía de 15 minutos para la mesa de la demo.
- [Whitepaper](whitepaper.md): problema, diseño, modelo de confianza, privacidad, hoja de ruta y gobernanza.
- [Transparencia](transparencia.md): qué puede verificar cualquiera y cómo se impide que un partido o una persona influya en la plataforma.
- [01 Jurisdicciones](arquitectura/01-jurisdicciones.md): unidades territoriales de la CDMX y el modelo de datos `jurisdicciones`.
- [02 Enrutamiento](arquitectura/02-enrutamiento.md): cómo elige Rogatio la autoridad competente para cada categoría.
- [03 Representantes](arquitectura/03-representantes.md): qué representantes reciben copia y la tabla `representantes`.
- [04 Autenticación](arquitectura/04-autenticacion.md): verificación de la credencial del INE, una persona una firma, reglas de privacidad.
- [05 Stack](arquitectura/05-stack.md): Next.js con TypeScript en Vercel, Neon y Codespaces.

Licencia: [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html). Sitio: [rogatio.org](https://rogatio.org).
