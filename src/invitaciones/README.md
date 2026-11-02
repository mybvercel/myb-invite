# Invitaciones

Dos carpetas, dos propósitos distintos. **Nunca se mezclan.**

```
src/invitaciones/
├── tipos.ts              ← la forma de una invitación (una sola fuente de verdad)
├── demo/                 ← invitaciones de muestra, para vender
│   └── lacre.ts
└── clientes/             ← invitaciones reales, de parejas que pagaron
    └── <apellido-o-nombres>.ts

public/invitaciones/
├── demo/<slug>/          ← fotos y assets de cada demo
└── clientes/<slug>/      ← fotos y assets de cada cliente
```

## demo/

Invitaciones **inventadas** que se muestran en el catálogo de `/`. Sirven para que alguien vea cómo queda antes de comprar.

- Nombres, fechas y lugares son ficticios pero **verosímiles**.
- Los datos bancarios van en `XXXXX` — nunca un alias real.
- La fecha **siempre a futuro**, si no la cuenta regresiva se ve en cero y parece rota.
- Cada demo lleva su propia trivia y su propia frase. Una demo genérica no vende.

## clientes/

Invitaciones **reales**. Reglas duras:

- Los datos salen del brief firmado por la pareja, nunca de la imaginación.
- Alias y CBU se copian literal y se verifican con la pareja antes de publicar. Un dígito mal es plata perdida.
- Fotos de la pareja en `public/invitaciones/clientes/<slug>/`, nunca de Unsplash.
- No se sube nada acá sin el OK final de la pareja.
- Cuando pasa el casamiento, la invitación queda publicada el año contratado.

## Convención de nombres

El `slug` es minúsculas, sin tildes, con guiones. Es lo que va en la URL, así que se lee:

- Demo: el nombre del modelo → `lacre`, `olivar`, `granate`
- Cliente: los nombres de la pareja → `marti-y-tomi`

El mismo slug se usa en `src/invitaciones/…` y en `public/invitaciones/…`. Si no coinciden, las fotos no cargan.
