import { notFound } from "next/navigation";
import { Panel } from "@/components/panel/Panel";
import { buscarInvitacion } from "@/invitaciones";
import { acceso } from "@/lib/panel-acceso";
import { leerPanel } from "@/lib/panel-almacen";
import { listar } from "@/lib/rsvp";
import { mezclarConfirmaciones } from "@/panel/logica";
import type { Plan } from "@/panel/tipos";
import { Ingreso } from "./Ingreso";

/** Datos de invitados en vivo y cookie de sesión: nunca estático. */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ plan?: string }>;
};

const PLANES: Plan[] = ["esencial", "completa", "completa-plus"];

/**
 * El panel del organizador: la lista de invitados que se llena sola con las
 * confirmaciones de la invitación, y en Completa + el salón, las mesas y el
 * estilo.
 */
export default async function PaginaPanel({ params, searchParams }: Props) {
  const { slug } = await params;
  const { plan: planPedido } = await searchParams;

  const invitacion = buscarInvitacion(slug);
  if (!invitacion) notFound();

  const a = await acceso(slug);
  // Como la lista vieja: sin acceso, esta página no existe.
  if (a === "cerrado") notFound();
  if (a === "pedir-clave") return <Ingreso slug={slug} nombres={invitacion.nombres} />;

  // En las demos se puede mirar cualquier plan con ?plan=, para vender.
  const plan: Plan =
    invitacion.origen === "demo" && PLANES.includes(planPedido as Plan)
      ? (planPedido as Plan)
      : (invitacion.plan ?? "completa");

  const doc = await leerPanel(slug, invitacion.diseno.acento);
  const inicial = { ...doc, invitados: mezclarConfirmaciones(doc, await listar(slug)) };

  return (
    <Panel
      slug={slug}
      nombres={invitacion.nombres}
      fecha={invitacion.fecha}
      cierre={invitacion.cierreRsvp}
      plan={plan}
      inicial={inicial}
      enlaceInvitacion={`/i/${slug}`}
    />
  );
}
