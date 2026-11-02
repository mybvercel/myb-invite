"use client";

import Flores from "./Flores";
import Fondo from "./Fondo";
import TituloSeccion from "./TituloSeccion";
import { usarEnVista } from "./usarEnVista";

/**
 * Sección 5: la vestimenta.
 *
 * Va sobre el papel más hondo: el ritmo claro / cargado / claro es lo que hace
 * que la invitación se lea como capítulos y no como una tira continua.
 *
 * El detalle importa más que el código: nadie duda de qué es "elegante", duda
 * de si puede ir de blanco y de si el pasto le va a arruinar los tacos.
 */
export default function SeccionVestimenta({
  titulo,
  detalle,
  ilustracion,
  flores,
}: {
  titulo: string;
  detalle: string;
  ilustracion?: string;
  flores?: string;
}) {
  const [seccion, visible] = usarEnVista<HTMLElement>();

  return (
    <section
      ref={seccion}
      className="relative px-[clamp(2rem,9vw,3.5rem)] pt-[clamp(5rem,15vw,8rem)] pb-[clamp(5rem,14vw,7rem)]"
    >
      <Fondo variante="hondo" encuadre={3} />
      <Flores src={flores} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          className="inv-sube"
          data-visible={visible}
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <TituloSeccion>Vestimenta</TituloSeccion>
        </div>

        {ilustracion && (
          <div
            className="inv-sube mt-[clamp(2rem,7vw,3rem)] w-full"
            data-visible={visible}
            style={{ "--d": "160ms" } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ilustracion}
              alt=""
              aria-hidden="true"
              className="inv-linea mx-auto w-full max-w-[17rem]"
            />
          </div>
        )}

        <h3
          className="inv-sube inv-titulo mt-[clamp(1.5rem,5vw,2.25rem)] text-[clamp(1.7rem,7vw,2.2rem)]"
          data-visible={visible}
          style={{ "--d": "300ms" } as React.CSSProperties}
        >
          {titulo}
        </h3>

        <p
          className="inv-sube mt-5 max-w-[26ch] text-[1.0625rem] leading-relaxed font-light text-[var(--tinta-tenue)]"
          data-visible={visible}
          style={{ "--d": "420ms" } as React.CSSProperties}
        >
          {detalle}
        </p>
      </div>
    </section>
  );
}
