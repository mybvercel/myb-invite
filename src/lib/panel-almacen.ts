import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { normalizar } from "@/panel/logica";
import type { DocPanel } from "@/panel/tipos";
import { motor } from "./rsvp-almacen";

/**
 * Dónde se guarda el documento del panel de cada evento.
 *
 * Los mismos tres motores que las confirmaciones (ver rsvp-almacen.ts), con la
 * misma regla: Postgres para eventos de verdad, archivo en desarrollo, memoria
 * sólo para la demo publicada.
 *
 * Cada guardado lleva la versión que el navegador leyó. Si no coincide con la
 * guardada, alguien más editó en el medio y se rechaza: es preferible pedir
 * que recargue a perder la mesa que acomodó la otra persona.
 */

export class VersionVieja extends Error {}

/* ── Postgres ─────────────────────────────────────────────── */

const sql = () => neon(process.env.DATABASE_URL!);

let tablaLista: Promise<void> | null = null;

function asegurarTabla() {
  tablaLista ??= (async () => {
    await sql()`
      CREATE TABLE IF NOT EXISTS paneles (
        slug        text        PRIMARY KEY,
        version     integer     NOT NULL,
        datos       jsonb       NOT NULL,
        actualizado timestamptz NOT NULL DEFAULT now()
      )`;
  })().catch((e) => {
    tablaLista = null;
    throw e;
  });
  return tablaLista;
}

/* ── Archivo ──────────────────────────────────────────────────
   Se escribe a un temporal y se renombra: si el proceso se corta a mitad de
   camino, queda el archivo anterior entero y no uno por la mitad. */

const carpeta = () => path.join(process.cwd(), "datos", "panel");
const archivo = (slug: string) => path.join(carpeta(), `${slug}.json`);

/* ── Memoria ─────────────────────────────────────────────────── */

const global = globalThis as typeof globalThis & { __panelMemoria?: Map<string, DocPanel> };
const enMemoria = (global.__panelMemoria ??= new Map<string, DocPanel>());

/* ── Interfaz ─────────────────────────────────────────────────── */

export async function leerPanel(slug: string, acento: string): Promise<DocPanel> {
  const m = motor();

  if (m === "memoria") return normalizar(structuredClone(enMemoria.get(slug) ?? null), acento);

  if (m === "postgres") {
    await asegurarTabla();
    const filas = await sql()`SELECT datos FROM paneles WHERE slug = ${slug}`;
    return normalizar(filas[0]?.datos ?? null, acento);
  }

  try {
    return normalizar(JSON.parse(await readFile(archivo(slug), "utf8")), acento);
  } catch {
    return normalizar(null, acento);
  }
}

/** Guarda y devuelve el documento con su versión nueva. */
export async function guardarPanel(slug: string, doc: DocPanel, versionLeida: number): Promise<DocPanel> {
  const nuevo: DocPanel = { ...doc, version: versionLeida + 1, actualizado: new Date().toISOString() };
  const m = motor();

  if (m === "postgres") {
    await asegurarTabla();
    // Una sola sentencia: inserta si no existe, actualiza sólo si la versión
    // guardada es la que leyó el navegador. Si no devuelve fila, perdió.
    const filas = await sql()`
      INSERT INTO paneles (slug, version, datos, actualizado)
      VALUES (${slug}, ${nuevo.version}, ${JSON.stringify(nuevo)}::jsonb, now())
      ON CONFLICT (slug) DO UPDATE
        SET version = EXCLUDED.version, datos = EXCLUDED.datos, actualizado = now()
        WHERE paneles.version = ${versionLeida}
      RETURNING version`;
    if (!filas.length) throw new VersionVieja();
    return nuevo;
  }

  const actual = await leerPanel(slug, doc.tema.acento);
  if (actual.version !== versionLeida) throw new VersionVieja();

  if (m === "memoria") {
    if (enMemoria.size > 200) enMemoria.clear(); // Techo: es la demo.
    enMemoria.set(slug, structuredClone(nuevo));
    return nuevo;
  }

  await mkdir(carpeta(), { recursive: true });
  const temporal = archivo(slug) + ".tmp";
  await writeFile(temporal, JSON.stringify(nuevo, null, 1), "utf8");
  await rename(temporal, archivo(slug));
  return nuevo;
}
