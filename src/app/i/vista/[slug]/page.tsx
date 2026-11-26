import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BarraVista from "@/components/armar/BarraVista";
import BotonVolver from "@/components/invitacion/BotonVolver";
import Invitacion from "@/components/invitacion/Invitacion";
import { fotosDe, modeloPorSlug, slugDe } from "@/lib/armar";
import { DISENOS } from "@/lib/invitaciones";
import { buscarInvitacion } from "@/invitaciones";
import { imagenCompartir } from "@/invitaciones/tipos";
import { MAQUETAS } from "@/lib/maquetas";
import { personalizar } from "@/lib/personalizar";
import { consultaVista, esLargo, fechaLarga, leerVista } from "@/lib/vista";

/**
 * Un modelo con los datos del visitante. La abre el final de /armar y viaja en
 * el mensaje de WhatsApp, así la pareja la reenvía y nosotros la vemos al
 * contestar. Sin nombres, muestra el modelo tal cual.
 */
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function leer({ params, searchParams }: Props) {
  const { slug } = await params;
  const q = await searchParams;
  // Sólo los modelos del catálogo: la invitación de una pareja no se presta.
  if (!DISENOS.some((d) => slugDe(d) === slug)) notFound();
  const maqueta = Object.hasOwn(MAQUETAS, slug) ? MAQUETAS[slug] : undefined;
  const invitacion = maqueta ? undefined : buscarInvitacion(slug);
  return { slug, q, maqueta, invitacion, vista: leerVista((k) => q[k]) };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { maqueta, invitacion, vista } = await leer(props);
  if (!maqueta && !invitacion) return {};
  const quien = vista ? (vista.b ? `${vista.a} & ${vista.b}` : vista.a) : (maqueta?.titulo ?? invitacion!.nombres);
  const title = vista?.f ? `${quien} · ${fechaLarga(vista.f)}` : quien;
  return {
    title,
    description: "Así queda tu invitación. Vista previa de MyB Invite.",
    robots: { index: false, follow: false },
    // La dirección lleva los nombres: que no viaje a otros sitios.
    referrer: "no-referrer",
    openGraph: {
      title,
      description: "Así queda tu invitación.",
      images: [maqueta ? maqueta.imagen : imagenCompartir(invitacion!)],
    },
  };
}

export default async function PaginaVista(props: Props) {
  const { slug, q, maqueta, invitacion, vista } = await leer(props);
  if (!maqueta && !invitacion) notFound();
  const modelo = modeloPorSlug(slug);
  const fotosVista = modelo ? fotosDe(modelo) : 0;

  return (
    <>
      {!q.marco && (vista ? <BarraVista fotos={fotosVista} /> : <BotonVolver catalogo="/" modelo={modeloPorSlug(slug) && slug} />)}
      {maqueta ? (
        <iframe
          title={`Modelo ${maqueta.titulo}`}
          src={
            vista
              ? `/maqueta/${slug}/${encodeURIComponent(consultaVista(vista))}/index.html`
              : `${maqueta.carpeta}/index.html`
          }
          style={{ display: "block", width: "100%", height: "100dvh", border: 0 }}
        />
      ) : (
        <div className={vista && esLargo(vista) ? "vista-larga" : undefined}>
          <Invitacion invitacion={vista ? personalizar(invitacion!, vista) : invitacion!} />
        </div>
      )}
    </>
  );
}
