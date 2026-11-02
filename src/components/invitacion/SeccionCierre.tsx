"use client";

import Fondo from "./Fondo";
import Ornamento from "./Ornamento";
import { usarEnVista } from "./usarEnVista";

/**
 * Sección 9: el cierre.
 *
 * Lo más corto de toda la invitación, a propósito. Después del RSVP no hay
 * nada más que pedirle al invitado: sólo despedirse.
 *
 * Es la única sección con botánica en las dos esquinas de abajo. En el resto
 * eso sería marco de diploma, pero acá cierra la hoja como un pie y es lo que
 * hace que la invitación termine en vez de cortarse.
 */
export default function SeccionCierre({
  nombres,
  fecha,
  flores,
}: {
  nombres: string;
  fecha: string;
  flores?: string;
}) {
  const [seccion, visible] = usarEnVista<HTMLElement>();

  return (
    <section
      ref={seccion}
      // El pie es largo a propósito: la botánica sube desde abajo y el texto
      // tiene que quedar por encima de la parte densa.
      className="relative px-[clamp(2rem,9vw,3.5rem)] pt-[clamp(5rem,15vw,8rem)] pb-[clamp(12rem,36vw,17rem)]"
    >
      <Fondo encuadre={0} fin />

      {flores && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src={flores}
            alt=""
            className="inv-flor -bottom-8 -left-7"
            style={{ transform: "rotate(180deg)", width: "clamp(5.5rem,27%,9rem)" }}
          />
          <img
            src={flores}
            alt=""
            className="inv-flor -right-7 -bottom-8"
            style={{ transform: "rotate(180deg) scaleX(-1)", width: "clamp(5.5rem,27%,9rem)", opacity: 0.72 }}
          />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        <p
          className="inv-sube inv-titulo text-[clamp(2.3rem,10vw,3.2rem)]"
          data-visible={visible}
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          Te esperamos
        </p>

        <div
          className="inv-sube mt-7"
          data-visible={visible}
          style={{ "--d": "220ms" } as React.CSSProperties}
        >
          <Ornamento className="mx-auto" />
        </div>

        <p
          className="inv-versalita inv-sube mt-8"
          data-visible={visible}
          style={{ "--d": "400ms" } as React.CSSProperties}
        >
          {nombres}
        </p>

        <p
          className="inv-versalita inv-sube mt-3 text-[0.58rem]"
          data-visible={visible}
          style={{ "--d": "520ms" } as React.CSSProperties}
        >
          {fecha}
        </p>
      </div>
    </section>
  );
}
