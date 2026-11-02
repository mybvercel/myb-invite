"use client";

import Flores from "./Flores";
import Fondo from "./Fondo";
import TituloSeccion from "./TituloSeccion";
import { usarEnVista } from "./usarEnVista";
import type { Hito } from "@/invitaciones/tipos";

/** El rombo de cobre que marca cada hito sobre la línea. */
function Marca() {
  return (
    <svg viewBox="0 0 14 14" className="h-[9px] w-[9px]" fill="none" aria-hidden="true">
      <path d="M7 0 L14 7 L7 14 L0 7 Z" fill="var(--papel)" />
      <path
        d="M7 1.6 L12.4 7 L7 12.4 L1.6 7 Z"
        fill="var(--cobre)"
        fillOpacity="0.55"
        stroke="var(--cobre)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/**
 * Sección 3: el cronograma del día.
 *
 * Es la sección que más agradece el invitado y la que casi nadie pone: saber
 * a qué hora se come evita veinte mensajes a los novios.
 *
 * La línea de cobre corre por el centro, con la hora a la izquierda y qué pasa
 * a la derecha. Sin tarjetas y sin iconos de librería.
 */
export default function SeccionCronograma({
  hitos,
  flores,
}: {
  hitos: Hito[];
  flores?: string;
}) {
  const [seccion, visible] = usarEnVista<HTMLElement>();

  return (
    <section
      ref={seccion}
      className="relative px-[clamp(1.5rem,7vw,3rem)] pt-[clamp(5rem,15vw,8rem)] pb-[clamp(6rem,17vw,9rem)]"
    >
      <Fondo encuadre={1} />
      <Flores src={flores} />

      <div className="relative z-10">
        <div
          className="inv-sube"
          data-visible={visible}
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <TituloSeccion>El día</TituloSeccion>
        </div>

        <ol className="relative mx-auto mt-[clamp(3rem,10vw,4.5rem)] w-full max-w-[19rem]">
          {/* La línea vive detrás de las marcas y arranca y termina en el
              primer y último hito, no en el borde de la lista: una línea que
              sale de la nada se ve a plantilla. */}
          <span
            aria-hidden="true"
            className="absolute top-3 bottom-3 left-1/2 w-px -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--cobre) 12%, var(--cobre) 88%, transparent)",
              opacity: 0.4,
            }}
          />

          {hitos.map((h, i) => (
            <li
              key={h.hora + h.titulo}
              className="inv-sube grid grid-cols-[1fr_auto_1fr] items-center gap-x-[clamp(0.9rem,4vw,1.4rem)] py-[clamp(0.9rem,3.5vw,1.4rem)]"
              data-visible={visible}
              style={{ "--d": `${160 + i * 130}ms` } as React.CSSProperties}
            >
              <span className="inv-hora text-right">{h.hora}</span>
              <Marca />
              <span className="inv-versalita text-left text-[0.68rem]">{h.titulo}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
