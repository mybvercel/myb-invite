# Tu Invitación Digital — mybinvite.com

Invitaciones web para casamientos, cumpleaños, bar y bat mitzvá y eventos de empresa, con confirmación de asistencia (RSVP) y un panel para quien organiza el evento. Next.js 16 (App Router), React 19, Tailwind 4.

> Este proyecto sale de `mybdigitals-wb` y contiene **solo** lo de invitaciones. La agencia MYB Digitals, SlopCheck e Imanía siguen en `mybdigitals.com`.

## Correrlo en local

```bash
npm install
npm run dev          # http://localhost:3000
```

Sin `DATABASE_URL`, las confirmaciones y el panel se guardan en archivos dentro de `datos/` (ignorada por git). Es solo para desarrollar.

## Build y pruebas

```bash
npm run build
npm start
npm run probar-agente   # asistente del salón: frases -> plano
npm run probar-panel    # renderiza cada pestaña del panel
npm run probar-base     # comprueba la conexión a Postgres (usa .env.local)
```

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Página de venta con los modelos y los precios |
| `/i/<slug>` | Una invitación (demo o de cliente) |
| `/i/<slug>/para/<token>` | Invitación personal para una familia |
| `/i/<slug>/lista` | Lista simple de confirmaciones (con clave) |
| `/panel/<slug>` | Panel del organizador: invitados, mesas, salón |
| `/demo/<id>` | Demos del motor viejo (ya no están en el catálogo) |
| `/api/rsvp`, `/api/panel/<slug>` | API de confirmaciones y del panel |

Los datos de cada invitación viven en `src/invitaciones/` y sus fotos en `public/invitaciones/`. Las reglas están en `src/invitaciones/README.md`.

## Variables de entorno

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Postgres (Neon). Sin esta, las confirmaciones **no son duraderas** en producción |
| `RSVP_CLAVE` | Clave de la lista de confirmaciones y clave de respaldo del panel |
| `PANEL_CLAVE_<SLUG>` | Clave del panel de cada evento. El slug va en mayúsculas y con `_` en vez de `-` (`marti-y-tomi` → `PANEL_CLAVE_MARTI_Y_TOMI`) |

Nunca se suben al repo. Para el desarrollo local, un `.env.local`.

## Deploy (Vercel)

1. Importar este repo en Vercel (framework Next.js, sin configuración extra).
2. En **Storage / Marketplace**, conectar Neon: inyecta `DATABASE_URL` solo.
3. Cargar `RSVP_CLAVE` y las `PANEL_CLAVE_*` en **Settings > Environment Variables**.
4. En **Settings > Domains** agregar `mybinvite.com` (principal) y `www.mybinvite.com` (que redirija al principal). Vercel muestra los registros DNS exactos que hay que crear en el proveedor del dominio.

La URL canónica está en `src/lib/site.ts` (`SITE_URL`): sitemap, robots y metadatos salen de ahí.
