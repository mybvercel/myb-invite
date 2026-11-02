import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type { Confirmacion } from "./rsvp-comun";

/**
 * Dónde se guardan las confirmaciones.
 *
 * Tres motores, elegidos solos según dónde esté corriendo:
 *
 * 1. **Postgres (Neon)** si hay `DATABASE_URL`. Es el único apto para bodas de
 *    verdad. La variable la inyecta sola la integración de Neon del
 *    Marketplace de Vercel; no hay que copiar credenciales a mano.
 * 2. **Un archivo** en desarrollo. Permite trabajar sin base ni internet.
 * 3. **Memoria** en Vercel sin base configurada. Es el modo demo: el disco de
 *    Vercel es de sólo lectura, así que sin esto el invitado vería un error al
 *    confirmar. Las confirmaciones viven mientras viva la instancia y **se
 *    pierden solas**. Sirve para mostrar el producto, nunca para una boda.
 *
 * Son datos de clientes reales: si se pierde una confirmación, la pareja se
 * entera el día de la fiesta cuando falta una silla. Por eso para vender va
 * Postgres y no un almacén de claves: durabilidad, transacciones y
 * recuperación punto-en-el-tiempo.
 */

const hayPostgres = () => Boolean(process.env.DATABASE_URL);

/** En Vercel no hay disco donde escribir: sin base, se usa memoria. */
const enVercel = () => Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

export type Motor = "postgres" | "archivo" | "memoria";

export const motor = (): Motor =>
  hayPostgres() ? "postgres" : enVercel() ? "memoria" : "archivo";

/* ── Postgres ────────────────────────────────────────────────
   El driver de Neon parametriza solo lo que va en `${}`: no se arma SQL
   concatenando texto en ningún lado. */

const sql = () => neon(process.env.DATABASE_URL!);

/** La tabla se crea sola la primera vez. La promesa queda cacheada en el
    módulo para no mandar el DDL en cada pedido. */
let tablaLista: Promise<void> | null = null;

function asegurarTabla() {
  tablaLista ??= (async () => {
    const q = sql();
    await q`
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
    // Agregada con los links personales: las tablas viejas la suman solas.
    await q`ALTER TABLE confirmaciones ADD COLUMN IF NOT EXISTS familia text NOT NULL DEFAULT ''`;
    await q`
      CREATE INDEX IF NOT EXISTS confirmaciones_slug_idx
      ON confirmaciones (slug, enviada DESC)`;
  })().catch((e) => {
    tablaLista = null; // Si falló, que el próximo pedido vuelva a intentar.
    throw e;
  });

  return tablaLista;
}

/* ── Archivo, para desarrollo ────────────────────────────────
   JSONL: cada confirmación es una línea que se agrega al final. Dos invitados
   confirmando a la vez no se pisan, que es lo que pasaría leyendo y
   reescribiendo un JSON entero. */

const carpeta = () => path.join(process.cwd(), "datos", "rsvp");
const archivo = (slug: string) => path.join(carpeta(), `${slug}.jsonl`);

/* ── Memoria, para la demo publicada ─────────────────────────
   Cuelga de globalThis y no de una variable del módulo: en producción Next
   empaqueta la API y las páginas por separado, así que cada una tendría su
   propia copia y la confirmación se guardaría en un Map que la lista nunca
   lee. globalThis es uno solo por proceso.

   Sobrevive entre pedidos mientras la instancia siga caliente y se borra sola
   cuando Vercel la recicla. Con tope, para no inflar la memoria de la función. */

const global = globalThis as typeof globalThis & {
  __rsvpMemoria?: Map<string, Confirmacion[]>;
};

const enMemoria = (global.__rsvpMemoria ??= new Map<string, Confirmacion[]>());

/* ── La interfaz que ve el resto de la app ──────────────────── */

export async function guardar(slug: string, datos: Confirmacion) {
  if (motor() === "memoria") {
    const previas = enMemoria.get(slug) ?? [];
    enMemoria.set(slug, [...previas, datos].slice(-300));
    return;
  }

  if (hayPostgres()) {
    await asegurarTabla();
    await sql()`
      INSERT INTO confirmaciones (slug, nombre, asiste, acompanantes, comidas, cancion, enviada, familia)
      VALUES (${slug}, ${datos.nombre}, ${datos.asiste}, ${datos.acompanantes},
              ${datos.comidas}, ${datos.cancion}, ${datos.enviada}, ${datos.familia ?? ""})`;
    return;
  }

  await mkdir(carpeta(), { recursive: true });
  await appendFile(archivo(slug), JSON.stringify(datos) + "\n", "utf8");
}

export async function listar(slug: string): Promise<Confirmacion[]> {
  if (motor() === "memoria") {
    return [...(enMemoria.get(slug) ?? [])].reverse();
  }

  if (hayPostgres()) {
    await asegurarTabla();
    const filas = await sql()`
      SELECT nombre, asiste, acompanantes, comidas, cancion, enviada, familia
      FROM confirmaciones
      WHERE slug = ${slug}
      ORDER BY enviada DESC
      LIMIT 2000`;

    return filas.map((f) => ({
      nombre: String(f.nombre),
      asiste: Boolean(f.asiste),
      acompanantes: Number(f.acompanantes),
      comidas: Array.isArray(f.comidas) ? f.comidas.map(String) : [],
      cancion: String(f.cancion ?? ""),
      enviada: new Date(f.enviada as string).toISOString(),
      familia: String(f.familia ?? ""),
    }));
  }

  try {
    const crudo = await readFile(archivo(slug), "utf8");
    return crudo
      .split("\n")
      .filter(Boolean)
      .map((linea) => {
        try {
          return JSON.parse(linea) as Confirmacion;
        } catch {
          return null; // Una línea rota no puede tumbar la lista entera.
        }
      })
      .filter((x): x is Confirmacion => x !== null)
      .reverse();
  } catch {
    return []; // Todavía no confirmó nadie.
  }
}
