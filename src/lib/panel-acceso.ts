import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { motor } from "./rsvp-almacen";

/**
 * Quién puede entrar al panel de un evento.
 *
 * Cada evento tiene su clave en el entorno: PANEL_CLAVE_<SLUG>, con el slug en
 * mayúsculas y los guiones como guion bajo (marti-y-tomi → PANEL_CLAVE_MARTI_Y_TOMI).
 * Si no está, vale RSVP_CLAVE, la misma de la lista vieja.
 *
 * Al entrar con la clave queda una cookie firmada con esa misma clave: si se
 * cambia la clave, todas las sesiones abiertas se caen solas. No hace falta un
 * secreto aparte ni una tabla de sesiones.
 */

const variable = (slug: string) => `PANEL_CLAVE_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;

const claveDe = (slug: string) => process.env[variable(slug)] || process.env.RSVP_CLAVE || "";

export const nombreCookie = (slug: string) => `panel_${slug.replace(/[^a-z0-9-]/g, "")}`;

const firma = (clave: string, slug: string) =>
  createHmac("sha256", clave).update(`panel:${slug}`).digest("hex");

const iguales = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export type Acceso = "adentro" | "pedir-clave" | "cerrado";

export async function acceso(slug: string): Promise<Acceso> {
  const clave = claveDe(slug);

  if (!clave) {
    // Sin clave, sólo donde no hay datos de nadie: desarrollo y la demo en
    // memoria. Con Postgres hay invitados reales y el panel no existe.
    return process.env.NODE_ENV === "development" || motor() === "memoria" ? "adentro" : "cerrado";
  }

  const galleta = (await cookies()).get(nombreCookie(slug))?.value ?? "";
  return galleta && iguales(galleta, firma(clave, slug)) ? "adentro" : "pedir-clave";
}

/** Si la clave es correcta, devuelve el valor de la cookie. */
export function validarClave(slug: string, intento: string): string | null {
  const clave = claveDe(slug);
  if (!clave || !intento) return null;
  return iguales(intento, clave) ? firma(clave, slug) : null;
}
