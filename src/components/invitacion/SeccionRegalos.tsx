"use client";

import { useState } from "react";
import Flores from "./Flores";
import Fondo from "./Fondo";
import TituloSeccion from "./TituloSeccion";
import { usarEnVista } from "./usarEnVista";
import type { Regalo } from "@/invitaciones/tipos";

/**
 * Un dato para copiar: alias, CBU o titular.
 *
 * Sin caja y sin sombra. Va entre dos filetes de cobre, sobre el papel: una
 * tarjeta con `box-shadow` acá rompería toda la pieza.
 */
function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sin permiso de portapapeles el dato igual está a la vista para
      // copiarlo a mano: no hace falta avisar nada.
    }
  };

  return (
    <li className="border-t border-[var(--cobre)]/25 py-5 last:border-b">
      <p className="inv-versalita text-[0.58rem]">{etiqueta}</p>

      <button
        type="button"
        onClick={copiar}
        className="mt-2 flex w-full items-center justify-center gap-3 text-center"
      >
        <span className="text-[1.05rem] tracking-[0.06em] break-all text-[var(--tinta)]">
          {valor}
        </span>
        <span
          className="inv-versalita shrink-0 text-[0.52rem] text-[var(--cobre)]"
          aria-live="polite"
        >
          {copiado ? "Copiado" : "Copiar"}
        </span>
      </button>
    </li>
  );
}

/**
 * Sección 6: los regalos.
 *
 * El pedido se hace con vergüenza y con humor, nunca como exigencia. Y los
 * datos van visibles, no escondidos detrás de un botón: el invitado que quiere
 * transferir lo hace parado en la fiesta, con una mano.
 */
export default function SeccionRegalos({
  regalo,
  flores,
}: {
  regalo: Regalo;
  flores?: string;
}) {
  const [seccion, visible] = usarEnVista<HTMLElement>();

  return (
    <section
      ref={seccion}
      className="relative px-[clamp(2rem,9vw,3.5rem)] pt-[clamp(5rem,15vw,8rem)] pb-[clamp(5rem,14vw,7rem)]"
    >
      <Fondo encuadre={4} />
      <Flores src={flores} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          className="inv-sube"
          data-visible={visible}
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <TituloSeccion>Regalos</TituloSeccion>
        </div>

        <p
          className="inv-sube mt-[clamp(2rem,7vw,3rem)] max-w-[28ch] text-[1.0625rem] leading-relaxed font-light text-[var(--tinta-tenue)]"
          data-visible={visible}
          style={{ "--d": "160ms" } as React.CSSProperties}
        >
          {regalo.mensaje}
        </p>

        <ul
          className="inv-sube mt-[clamp(2.5rem,8vw,3.5rem)] w-full max-w-[21rem]"
          data-visible={visible}
          style={{ "--d": "320ms" } as React.CSSProperties}
        >
          <Dato etiqueta="Alias" valor={regalo.alias} />
          <Dato etiqueta="CBU" valor={regalo.cbu} />
          <Dato etiqueta="A nombre de" valor={regalo.titular} />
        </ul>

        <p
          className="inv-versalita inv-sube mt-7 text-[0.56rem]"
          data-visible={visible}
          style={{ "--d": "440ms" } as React.CSSProperties}
        >
          {regalo.banco}
        </p>
      </div>
    </section>
  );
}
