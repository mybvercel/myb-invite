import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Invitacion from "@/components/invitacion/Invitacion";
import { imagenCompartir } from "@/invitaciones/tipos";
import { buscarInvitacion, slugsDeInvitaciones } from "@/invitaciones";

type Props = { params: Promise<{ slug: string }> };

/* Las invitaciones son pocas y conocidas de antemano: se prerenderizan todas
   para que abran al instante desde WhatsApp, que es de donde llega la gente. */
export function generateStaticParams() {
  return slugsDeInvitaciones().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const inv = buscarInvitacion(slug);
  if (!inv) return {};

  return {
    title: `${inv.nombres} · ${inv.fecha}`,
    description: `${inv.volanta} — ${inv.nombres}. ${inv.fecha}.`,
    // La previsualización en WhatsApp es el sobre: es lo primero que ve el
    // invitado, antes incluso de tocar el link.
    openGraph: {
      title: `${inv.nombres} · ${inv.fecha}`,
      description: inv.volanta,
      images: [imagenCompartir(inv)],
    },
  };
}

export default async function PaginaInvitacion({ params }: Props) {
  const { slug } = await params;
  const invitacion = buscarInvitacion(slug);
  if (!invitacion) notFound();

  return <Invitacion invitacion={invitacion} />;
}
