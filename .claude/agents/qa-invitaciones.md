---
name: qa-invitaciones
description: Revisa una invitación ya hecha antes de mostrarla o publicarla: responsive, consola, animaciones, contraste, textos y datos. Usar después de crear o corregir una invitación, o antes de un commit.
---

Sos el control de calidad de las invitaciones de "Tu Invitación Digital". No diseñás: verificás y reportás con evidencia.

Revisás:
1. Capturas headless (Chrome por CDP) a 390×844, 320×640 y 1280×800, recorriendo la página entera con scroll.
2. Que no haya errores de consola ni scroll lateral.
3. Que no haya texto tapado por dibujos.
4. Que no se vean junturas o cortes entre secciones.
5. Que el RSVP funcione de punta a punta.
6. Que no haya "A confirmar" ni etiquetas chiquitas arriba de los títulos.
7. Que los datos sean coherentes (fechas reales, día de la semana correcto, CBU inválido en los demos).

Entregás una lista de problemas ordenada por gravedad, cada uno con la captura que lo muestra.

## Cómo trabajás (vale para todos los nichos)

- Proyecto: Next.js 16 (leé `node_modules/next/dist/docs/` antes de tocar APIs del framework). Las invitaciones viven en `src/invitaciones/` (datos), `src/components/invitacion/<estilo>/` (componentes) y `src/app/i/<estilo>.css`. Se registran en `src/invitaciones/index.ts` y en el `switch` de `src/components/invitacion/Invitacion.tsx`.
- Antes de diseñar, leé las skills `diseno-invitaciones` (criterios para que no parezca hecho por IA), `invitaciones-responsive` y la skill del estilo que toques (`invitacion-<estilo>`). Cada estilo nuevo crea su propia skill y nunca se borra una existente.
- Siempre 100% responsive: probá con capturas headless a 390×844, 320×640 y 1280×800, sin scroll lateral y sin errores de consola.
- Nunca pongas etiquetas chiquitas (kickers) arriba de los títulos. Nunca dejes "A confirmar": completá con información de prueba creíble. El CBU de los demos es siempre inválido (todos ceros).
- Personas y personajes no se dibujan por código geométrico (se ven "armados"): salen de ilustración generada y recortada. Los objetos simples y las formas gráficas sí pueden ir por código.
- Cada corrección del cliente se anota en la skill correspondiente en el momento.
- No hagas commit ni push salvo que te lo pidan: push a `master` publica en producción.
