import { MAQUETAS, personalizarMaqueta } from "@/lib/maquetas";
import { esLargo, leerVista } from "@/lib/vista";

/**
 * Sirve un modelo de HTML propio con los datos del visitante. Sólo reescribe
 * el HTML y el JS; imágenes, fuentes y CSS se redirigen al archivo original.
 *
 * `datos` es la consulta de la vista previa (a=…&b=…&f=…) como un segmento de
 * la ruta, para que los enlaces relativos del modelo la conserven.
 */
type Contexto = { params: Promise<{ modelo: string; datos: string; ruta: string[] }> };

const TIPOS: Record<string, string> = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
};

export async function GET(pedido: Request, { params }: Contexto) {
  const { modelo, datos, ruta } = await params;
  const maqueta = Object.hasOwn(MAQUETAS, modelo) ? MAQUETAS[modelo] : undefined;
  if (!maqueta || ruta.some((r) => r.includes(".."))) return new Response("No existe", { status: 404 });

  const original = new URL(`${maqueta.carpeta}/${ruta.map(encodeURIComponent).join("/")}`, pedido.url);
  const tipo = TIPOS[ruta.at(-1)?.split(".").at(-1) ?? ""];
  if (!tipo) return Response.redirect(original, 307);

  const consulta = new URLSearchParams(decodeURIComponent(datos));
  const vista = leerVista((k) => consulta.get(k));
  if (!vista) return Response.redirect(original, 307);

  const r = await fetch(original);
  if (!r.ok) return new Response("No existe", { status: 404 });
  let texto = personalizarMaqueta(maqueta, vista)(await r.text());
  if (modelo === "mis-humanos-se-casan" && ruta.at(-1) === "index.html" && esLargo(vista)) {
    texto = texto.replace("</head>", "<style>svg .names{font-size:25px}</style></head>");
  }
  return new Response(texto, {
    headers: { "Content-Type": tipo, "Cache-Control": "private, max-age=300", "X-Robots-Tag": "noindex" },
  });
}
