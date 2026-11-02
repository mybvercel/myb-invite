/**
 * El dominio, en un solo lugar. Sitemap, robots, canonical y metadatos salen
 * de acá: si cambia el dominio principal, se corrige en este archivo.
 *
 * La canónica es mybinvite.com sin www; www.mybinvite.com redirige a ella
 * (se configura en Vercel, Settings > Domains).
 */
export const SITE_URL = "https://mybinvite.com";

/** URL absoluta para una ruta interna. */
export function urlDe(ruta: string): string {
  return `${SITE_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}
