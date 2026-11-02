import type { Invitacion } from "./tipos";
import { luisYJulieta } from "./clientes/luis-y-julieta";
import { cinta } from "./demo/cinta";
import { mesa } from "./demo/mesa";
import { ariel } from "./demo/ariel";
import { valentina } from "./demo/valentina";
import { benjamin } from "./demo/benjamin";
import { tomer } from "./demo/tomer";
import { sobremesa } from "./demo/sobremesa";
import { orbita } from "./demo/orbita";
import { garabato } from "./demo/garabato";
import { rosa } from "./demo/rosa";

/**
 * Registro único de invitaciones. Las demos y las de clientes conviven acá
 * porque comparten la misma ruta (/i/<slug>), pero cada una
 * declara su `origen` y las reglas de cada carpeta están en README.md.
 *
 * Al sumar una invitación: importarla arriba y agregarla a la lista.
 */
const INVITACIONES: Invitacion[] = [rosa, luisYJulieta, garabato, cinta, mesa, ariel, valentina, benjamin, tomer, sobremesa, orbita];

export const buscarInvitacion = (slug: string) =>
  INVITACIONES.find((i) => i.slug === slug);

export const slugsDeInvitaciones = () => INVITACIONES.map((i) => i.slug);

export type { Invitacion };
