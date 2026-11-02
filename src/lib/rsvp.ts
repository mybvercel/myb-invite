import { slugsDeInvitaciones } from "@/invitaciones";
import { guardar, listar, motor } from "./rsvp-almacen";
import { COMIDAS, type Confirmacion } from "./rsvp-comun";

export { guardar, listar, motor };
export type { Confirmacion };

/**
 * Las confirmaciones de asistencia.
 *
 * Acá viven la validación y el control de acceso. Dónde se guardan es
 * problema de `rsvp-almacen.ts`.
 *
 * Este módulo es SÓLO de servidor. Lo que necesite el formulario va en
 * `rsvp-comun.ts`.
 */

/* ── Validación ──────────────────────────────────────────────
   Todo lo que llega de afuera se valida acá, del lado del servidor. Lo que
   valide el formulario no cuenta: cualquiera puede postear al endpoint. */

const texto = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export function validar(
  cuerpo: unknown,
): { slug: string; datos: Confirmacion } | { error: string } {
  if (typeof cuerpo !== "object" || cuerpo === null) return { error: "Cuerpo inválido" };
  const c = cuerpo as Record<string, unknown>;

  // El slug se compara contra las invitaciones que existen: sin esto,
  // cualquiera podría escribir confirmaciones con el nombre que quiera.
  const slug = texto(c.slug, 60);
  if (!slugsDeInvitaciones().includes(slug)) return { error: "Invitación inexistente" };

  const nombre = texto(c.nombre, 80);
  if (nombre.length < 2) return { error: "Falta el nombre" };

  if (typeof c.asiste !== "boolean") return { error: "Falta si venís" };

  const bruto = Number(c.acompanantes);
  const acompanantes = c.asiste
    ? Math.min(20, Math.max(1, Number.isFinite(bruto) ? Math.floor(bruto) : 1))
    : 0;

  const comidas = Array.isArray(c.comidas)
    ? c.comidas.filter((x): x is string => COMIDAS.includes(x as (typeof COMIDAS)[number]))
    : [];

  return {
    slug,
    datos: {
      nombre,
      asiste: c.asiste,
      acompanantes,
      comidas,
      cancion: texto(c.cancion, 120),
      enviada: new Date().toISOString(),
      // Se valida contra el panel en la ruta: acá sólo se limpia.
      familia: texto(c.familia, 48).toLowerCase().replace(/[^a-z0-9-]/g, ""),
    },
  };
}

export function resumen(lista: Confirmacion[]) {
  const vienen = lista.filter((c) => c.asiste);
  return {
    respondieron: lista.length,
    vienen: vienen.length,
    personas: vienen.reduce((t, c) => t + c.acompanantes, 0),
    noVienen: lista.length - vienen.length,
  };
}

/* ── Control de acceso a la lista ────────────────────────────
   La lista tiene nombres y restricciones de comida de gente real: no puede
   quedar abierta. La clave sale del entorno; si no está configurada, se ve
   sólo en desarrollo. */

export function puedeVerLista(clave: string | undefined) {
  const esperada = process.env.RSVP_CLAVE;

  // Con clave configurada, manda la clave. Siempre. Incluso en la demo.
  if (esperada) return typeof clave === "string" && clave.length > 0 && clave === esperada;

  // Sin clave configurada sólo se abre donde no hay datos de nadie: en
  // desarrollo, y en la demo publicada, que guarda en memoria y se borra sola.
  // Con archivo o con Postgres hay confirmaciones reales y queda cerrada.
  return process.env.NODE_ENV === "development" || motor() === "memoria";
}

/* ── Freno básico contra el spam ─────────────────────────────
   En memoria: alcanza para que nadie llene la lista a mano desde el celular.
   En Vercel cada instancia tiene la suya y se reinician solas, así que esto no
   es una defensa contra un ataque en serio — para eso haría falta contar en la
   base o en el borde. Para una invitación de casamiento alcanza. */

const golpes = new Map<string, number[]>();

export function demasiadoSeguido(ip: string, limite = 8, ventanaMs = 600_000) {
  const ahora = Date.now();
  const previos = (golpes.get(ip) ?? []).filter((t) => ahora - t < ventanaMs);
  previos.push(ahora);
  golpes.set(ip, previos);

  if (golpes.size > 5000) golpes.clear(); // Techo de memoria.
  return previos.length > limite;
}
