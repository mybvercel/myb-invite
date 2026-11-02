import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Invitacion from "@/components/invitacion/Invitacion";
import type { Personal } from "@/components/invitacion/personal";
import { imagenCompartir } from "@/invitaciones/tipos";
import { buscarInvitacion } from "@/invitaciones";
import { leerPanel } from "@/lib/panel-almacen";
import { listar } from "@/lib/rsvp";
import { mezclarConfirmaciones } from "@/panel/logica";

/** Sale del panel en vivo: si los novios cambian el saludo, se ve al toque. */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; token: string }> };

async function buscarPersonal(slug: string, token: string): Promise<Personal | null> {
  const invitacion = buscarInvitacion(slug);
  if (!invitacion) return null;
  const doc = await leerPanel(slug, invitacion.diseno.acento);
  const fila = mezclarConfirmaciones(doc, await listar(slug)).find((i) => i.enlace?.token === token);
  if (!fila?.enlace) return null;

  return {
    token,
    nombre: fila.nombre,
    saludo: fila.enlace.saludo || `Te esperamos, ${fila.nombre}`,
    nota: fila.enlace.nota,
    cupo: fila.enlace.cupo,
    respuesta: fila.rsvp && fila.estado !== "pendiente"
      ? { asiste: fila.estado === "confirmado", personas: fila.personas, comidas: fila.comidas }
      : null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, token } = await params;
  const inv = buscarInvitacion(slug);
  const personal = inv ? await buscarPersonal(slug, token).catch(() => null) : null;
  if (!inv || !personal) return {};

  return {
    title: `${personal.nombre} · ${inv.nombres}`,
    description: `${personal.saludo}. ${inv.nombres}, ${inv.fecha}.`,
    // Un link personal no se indexa: tiene el nombre de una familia real.
    robots: { index: false, follow: false },
    openGraph: { title: `${inv.nombres} · ${inv.fecha}`, description: personal.saludo, images: [imagenCompartir(inv)] },
  };
}

export default async function InvitacionPersonal({ params }: Props) {
  const { slug, token } = await params;
  const invitacion = buscarInvitacion(slug);
  if (!invitacion) notFound();

  const personal = await buscarPersonal(slug, token);
  if (!personal) notFound();

  return <Invitacion invitacion={invitacion} personal={personal} />;
}
