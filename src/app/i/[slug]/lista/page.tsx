import { notFound } from "next/navigation";
import { buscarInvitacion } from "@/invitaciones";
import { listar, puedeVerLista, resumen } from "@/lib/rsvp";

/** Lee del disco y de la query: siempre en vivo. */
export const dynamic = "force-dynamic";

/* Nombres y restricciones de comida de gente real: esto no se indexa. */
export const metadata = {
  title: "Confirmaciones",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ clave?: string }>;
};

function Dato({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="inv-numero">{valor}</span>
      <span className="inv-versalita mt-2 text-[0.55rem]">{etiqueta}</span>
    </div>
  );
}

/**
 * La lista de confirmaciones, para la pareja.
 *
 * Es la pantalla que justifica el precio del producto: sin esto, la invitación
 * es linda pero la pareja sigue persiguiendo gente por WhatsApp.
 *
 * Se abre desde el celular, así que está pensada para leerse parado y para
 * bajarse en Excel cuando hay que pasarle los números al salón.
 */
export default async function ListaRsvp({ params, searchParams }: Props) {
  const { slug } = await params;
  const { clave } = await searchParams;

  const invitacion = buscarInvitacion(slug);
  if (!invitacion) notFound();

  // Un 404 y no un "clave incorrecta": sin la clave, esta página no existe.
  if (!puedeVerLista(clave)) notFound();

  const confirmaciones = await listar(slug);
  const r = resumen(confirmaciones);
  const query = clave ? `?clave=${encodeURIComponent(clave)}` : "";

  return (
    <main className="inv-columna min-h-svh px-[clamp(1.25rem,6vw,2.5rem)] py-[clamp(3rem,10vw,5rem)]">
      <header className="flex flex-col items-center text-center">
        <p className="inv-versalita">{invitacion.nombres}</p>
        <h1 className="inv-titulo mt-3 text-[clamp(1.9rem,8vw,2.6rem)]">Confirmaciones</h1>
      </header>

      <div className="mt-[clamp(2.5rem,8vw,3.5rem)] flex items-start justify-center gap-[clamp(1.25rem,6vw,2.5rem)]">
        <Dato valor={r.personas} etiqueta="Personas" />
        <Dato valor={r.vienen} etiqueta="Confirmaron" />
        <Dato valor={r.noVienen} etiqueta="No pueden" />
      </div>

      <div className="mt-9 flex justify-center">
        <a
          href={`/api/rsvp/csv?slug=${slug}${query ? "&" + query.slice(1) : ""}`}
          className="inv-versalita border border-[var(--cobre)]/45 px-7 py-3 text-[0.6rem] text-[var(--tinta)]"
        >
          Bajar en Excel
        </a>
      </div>

      {confirmaciones.length === 0 ? (
        <p className="mt-[clamp(3rem,10vw,4rem)] text-center text-[1.0625rem] font-light text-[var(--tinta-tenue)]">
          Todavía no confirmó nadie.
        </p>
      ) : (
        <ul className="mx-auto mt-[clamp(3rem,10vw,4rem)] max-w-[26rem]">
          {confirmaciones.map((c, i) => (
            <li key={c.enviada + i} className="border-t border-[var(--cobre)]/25 py-5 last:border-b">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[1.05rem] text-[var(--tinta)]">{c.nombre}</span>
                <span
                  className="inv-versalita shrink-0 text-[0.55rem]"
                  style={{ color: c.asiste ? "var(--burdeos)" : "var(--tinta-tenue)" }}
                >
                  {c.asiste ? `Vienen ${c.acompanantes}` : "No puede"}
                </span>
              </div>

              {c.comidas.length > 0 && (
                <p className="mt-2 text-[0.9rem] font-light text-[var(--tinta-tenue)]">
                  {c.comidas.join(" · ")}
                </p>
              )}

              {c.cancion && (
                <p className="mt-1 text-[0.9rem] font-light italic text-[var(--tinta-tenue)]">
                  ♪ {c.cancion}
                </p>
              )}

              <p className="inv-versalita mt-2 text-[0.5rem]">
                {new Date(c.enviada).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
