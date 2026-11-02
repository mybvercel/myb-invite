/**
 * Comprueba que la base de las confirmaciones funciona de punta a punta.
 *
 *   npm run probar-base
 *
 * Escribe una confirmación de prueba, la lee, y la borra. Si esto pasa, el
 * RSVP anda: es exactamente lo que hace la app cuando un invitado confirma.
 *
 * Corre contra lo que diga DATABASE_URL. En Vercel se baja con:
 *   vercel env pull .env.local
 */

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  console.log("\nDATABASE_URL no está configurada.");
  console.log("La app va a guardar en datos/rsvp/<slug>.jsonl, que sirve para");
  console.log("desarrollo pero NO en Vercel: ahí el disco se borra solo.\n");
  console.log("Para conectar la base:  vercel install neon");
  console.log("Para bajar la variable: vercel env pull .env.local\n");
  process.exit(1);
}

const sql = neon(url);
const SLUG = "__prueba__";
let paso = "";

try {
  paso = "conectar";
  const [{ version }] = await sql`SELECT version()`;
  console.log("✓ conectado:", String(version).split(",")[0]);

  paso = "crear la tabla";
  await sql`
    CREATE TABLE IF NOT EXISTS confirmaciones (
      id            bigserial PRIMARY KEY,
      slug          text        NOT NULL,
      nombre        text        NOT NULL,
      asiste        boolean     NOT NULL,
      acompanantes  integer     NOT NULL DEFAULT 0,
      comidas       text[]      NOT NULL DEFAULT '{}',
      cancion       text        NOT NULL DEFAULT '',
      enviada       timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE INDEX IF NOT EXISTS confirmaciones_slug_idx
    ON confirmaciones (slug, enviada DESC)`;
  console.log("✓ tabla lista");

  paso = "guardar";
  // Con acentos a propósito: es lo primero que se rompe con una codificación mal.
  await sql`
    INSERT INTO confirmaciones (slug, nombre, asiste, acompanantes, comidas, cancion)
    VALUES (${SLUG}, ${"Sofía Ramírez"}, ${true}, ${3}, ${["Sin TACC"]}, ${"La Bicicleta — Carlos Vives"})`;
  console.log("✓ confirmación guardada");

  paso = "leer";
  const [fila] = await sql`
    SELECT nombre, asiste, acompanantes, comidas, cancion
    FROM confirmaciones WHERE slug = ${SLUG} ORDER BY enviada DESC LIMIT 1`;

  const bien =
    fila?.nombre === "Sofía Ramírez" &&
    fila.acompanantes === 3 &&
    fila.comidas?.[0] === "Sin TACC" &&
    fila.cancion === "La Bicicleta — Carlos Vives";

  console.log(bien ? "✓ leída igual que se guardó (acentos incluidos)" : "✗ volvió distinta:", bien ? "" : fila);
  if (!bien) process.exit(1);

  paso = "limpiar";
  await sql`DELETE FROM confirmaciones WHERE slug = ${SLUG}`;
  console.log("✓ prueba borrada\n");

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM confirmaciones`;
  console.log(`La base anda. Confirmaciones reales guardadas: ${count}\n`);
} catch (e) {
  console.error(`\n✗ falló al ${paso}:`, e instanceof Error ? e.message : e);
  console.error("\nRevisá que DATABASE_URL apunte a la base de Neon del proyecto.\n");
  process.exit(1);
}
