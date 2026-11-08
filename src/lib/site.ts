/**
 * El dominio, en un solo lugar. Sitemap, robots, canonical y metadatos salen
 * de acá: si cambia el dominio principal, se corrige en este archivo.
 *
 * La canónica es www.mybinvite.com: en Vercel (Settings > Domains) el dominio
 * sin www redirige al www, así que canonical, sitemap y metadatos tienen que
 * apuntar al www. Si algún día se invierte la redirección, se cambia acá.
 */
export const SITE_URL = "https://www.mybinvite.com";

/** El nombre de marca, para buscadores y datos estructurados. */
export const MARCA = "MyB Invite";

/** URL absoluta para una ruta interna. */
export function urlDe(ruta: string): string {
  return `${SITE_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}
