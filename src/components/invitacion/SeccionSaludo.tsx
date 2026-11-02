"use client";

import Fondo from "./Fondo";
import Ornamento from "./Ornamento";
import { usarEnVista } from "./usarEnVista";

/**
 * El saludo de una invitación personal, justo debajo de la portada: es lo
 * primero que lee la familia y lo que hace que la invitación sea suya y no una
 * general reenviada.
 */
export default function SeccionSaludo({ saludo, nota }: { saludo: string; nota: string }) {
  const [seccion, visible] = usarEnVista<HTMLElement>();

  return (
    <section ref={seccion} className="relative px-[clamp(2rem,9vw,3.5rem)] pt-[clamp(3.5rem,11vw,5rem)] pb-[clamp(3rem,10vw,4.5rem)]">
      <Fondo encuadre={1} />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="inv-sube" data-visible={visible} style={{ "--d": "0ms" } as React.CSSProperties}>
          <Ornamento className="mx-auto" />
        </div>
        <p
          className="inv-titulo inv-sube mt-7 max-w-[18ch] text-[clamp(1.9rem,8vw,2.5rem)] leading-[1.15]"
          data-visible={visible}
          style={{ "--d": "140ms" } as React.CSSProperties}
        >
          {saludo}
        </p>
        {nota && (
          <p
            className="inv-sube mt-5 max-w-[28ch] text-[1.0625rem] leading-relaxed font-light text-[var(--tinta-tenue)]"
            data-visible={visible}
            style={{ "--d": "280ms" } as React.CSSProperties}
          >
            {nota}
          </p>
        )}
      </div>
    </section>
  );
}
