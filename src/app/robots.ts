import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Las invitaciones de clientes y el panel no se indexan: tienen nombres de
 * gente real. Los bots de IA quedan permitidos a propósito: bloquearlos deja
 * al sitio fuera de las respuestas de ChatGPT, Claude y Perplexity.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/panel/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
