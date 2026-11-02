"use client";

import Flores from "./Flores";
import Ornamento from "./Ornamento";
import Fondo from "./Fondo";
import TituloSeccion from "./TituloSeccion";
import { usarEnVista } from "./usarEnVista";
import type { Lugar } from "@/invitaciones/tipos";

/**
 * Sección 4: dónde y a qué hora.
 *
 * Es la sección más consultada de toda la invitación y la que el invitado abre
 * el mismo día, apurado y en la calle. Por eso el botón al mapa es lo único
 * que tiene peso de botón: todo lo demás es texto sobre papel.
 */
export default function SeccionLugares({
  lugares,
  ilustracion,
  flores,
}: {
  lugares: Lugar[];
  ilustracion?: string;
  flores?: string;
}) {
  const [seccion, visible] = usarEnVista<HTMLElement>();

  return (
    <section
      ref={seccion}
      className="relative px-[clamp(2rem,9vw,3.5rem)] pt-[clamp(5rem,15vw,8rem)] pb-[clamp(5rem,14vw,7rem)]"
    >
      <Fondo encuadre={2} />
      <Flores src={flores} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          className="inv-sube"
          data-visible={visible}
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <TituloSeccion>Dónde</TituloSeccion>
        </div>

        <ul className="mt-[clamp(2.5rem,9vw,4rem)] flex w-full flex-col items-center">
          {lugares.map((l, i) => (
            <li
              key={`${l.tipo}-${l.titulo}`} /* ceremonia y fiesta pueden ser en el mismo lugar */
              className="inv-sube flex w-full flex-col items-center"
              data-visible={visible}
              style={{ "--d": `${180 + i * 200}ms` } as React.CSSProperties}
            >
              {/* Entre la ceremonia y la fiesta va el dibujo del salón: separa
                  los dos lugares y de paso los ubica, mejor que un ornamento
                  genérico. Si hubiera un tercer lugar, ese va con la ramita:
                  el dibujo repetido perdería la gracia. */}
              {i === 1 && ilustracion ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ilustracion}
                  alt=""
                  aria-hidden="true"
                  className="inv-linea my-[clamp(1.5rem,6vw,2.5rem)] w-full max-w-[19rem]"
                />
              ) : (
                i > 0 && <Ornamento className="my-[clamp(2.5rem,9vw,4rem)]" />
              )}

              <p className="inv-versalita">{l.tipo}</p>

              <h3 className="inv-titulo mt-3 text-[clamp(1.6rem,6.5vw,2rem)]">{l.titulo}</h3>

              <p className="inv-hora mt-4">{l.hora}</p>

              <p className="mt-4 max-w-[24ch] text-[0.95rem] leading-relaxed font-light text-[var(--tinta-tenue)]">
                {l.direccion}
              </p>

              <a
                href={l.mapa}
                target="_blank"
                rel="noopener noreferrer"
                className="inv-versalita mt-6 inline-block border border-[var(--cobre)]/45 px-7 py-3 text-[0.62rem] text-[var(--tinta)] transition-colors duration-500 hover:bg-[var(--cobre)]/8"
              >
                Cómo llegar
              </a>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
