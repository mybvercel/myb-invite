"use client";

import { useEffect, useState } from "react";
import Flores from "./Flores";
import Fondo from "./Fondo";
import Ornamento from "./Ornamento";
import { usarEnVista } from "./usarEnVista";
import { calcularFaltante, parsearFecha, type Faltante } from "@/invitaciones/fecha";

const UNIDADES = [
  { clave: "d", etiqueta: "Días" },
  { clave: "h", etiqueta: "Horas" },
  { clave: "m", etiqueta: "Minutos" },
  { clave: "s", etiqueta: "Segundos" },
] as const;

/** Punto de cobre entre número y número. Reemplaza a las tarjetas. */
function Punto() {
  return (
    <span aria-hidden="true" className="mt-[0.55em] self-start">
      <svg viewBox="0 0 6 6" className="h-[5px] w-[5px]" fill="none">
        <path d="M3 0 L6 3 L3 6 L0 3 Z" fill="var(--cobre)" fillOpacity="0.6" />
      </svg>
    </span>
  );
}

/**
 * Sección 2: la frase de la pareja y la cuenta regresiva.
 *
 * Sin tarjetas, sin sombras y sin cajas alrededor de los números: sólo tinta
 * sobre papel, que es como se ve un impreso.
 */
export default function SeccionFrase({
  frase,
  fecha,
  flores,
}: {
  frase: string;
  fecha: string;
  flores?: string;
}) {
  const [seccion, visible] = usarEnVista<HTMLElement>();
  const [faltante, setFaltante] = useState<Faltante | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const objetivo = parsearFecha(fecha);
    setMontado(true);
    setFaltante(calcularFaltante(objetivo));

    const reloj = setInterval(() => setFaltante(calcularFaltante(objetivo)), 1000);
    return () => clearInterval(reloj);
  }, [fecha]);

  // Antes de montar no hay cuenta: el servidor no sabe qué hora es en el
  // celular del invitado, y renderizar ceros produciría un salto al hidratar.
  const llego = montado && !faltante;

  return (
    <section
      ref={seccion}
      className="relative px-[clamp(2rem,9vw,3.5rem)] pt-[clamp(5rem,15vw,8rem)] pb-[clamp(6rem,17vw,9rem)]"
    >
      <Fondo encuadre={0} />
      <Flores src={flores} />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* ── La frase ── */}
        <div className="inv-sube" data-visible={visible} style={{ "--d": "0ms" } as React.CSSProperties}>
          <Ornamento className="mx-auto" />
        </div>

        <p
          className="inv-frase inv-sube mt-8"
          data-visible={visible}
          style={{ "--d": "160ms" } as React.CSSProperties}
        >
          {frase}
        </p>

        <div
          className="inv-sube mt-9"
          data-visible={visible}
          style={{ "--d": "320ms" } as React.CSSProperties}
        >
          <Ornamento className="mx-auto rotate-180" />
        </div>

        {/* ── La cuenta regresiva ──
            El salto de aire acá es a propósito y es grande: separa la frase,
            que es lo emotivo, de la cuenta, que es el dato. Sin ese corte las
            dos cosas compiten y ninguna gana. */}
        <p
          className="inv-versalita inv-sube mt-[clamp(6rem,20vw,10rem)]"
          data-visible={visible}
          style={{ "--d": "480ms" } as React.CSSProperties}
        >
          {llego ? "Llegó el día" : "Faltan"}
        </p>

        {!llego && (
          <div
            className="inv-sube mt-7 flex w-full items-start justify-center gap-[clamp(0.6rem,3.2vw,1.1rem)]"
            data-visible={visible}
            style={{ "--d": "600ms" } as React.CSSProperties}
          >
            {UNIDADES.map((u, i) => {
              const valor = faltante?.[u.clave];
              const texto = valor === undefined ? "––" : String(valor).padStart(2, "0");

              return (
                <div key={u.clave} className="contents">
                  {i > 0 && <Punto />}
                  <div className="flex min-w-[2.4ch] flex-col items-center">
                    {/* La key hace que el dígito se remonte y vuelva a entrar
                        cada vez que cambia. */}
                    <span key={texto} className="inv-numero inv-digito">
                      {texto}
                    </span>
                    <span className="inv-versalita mt-3 text-[0.58rem]">{u.etiqueta}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p
          className="inv-versalita inv-sube mt-[clamp(2.5rem,8vw,3.5rem)] text-[0.62rem]"
          data-visible={visible}
          style={{ "--d": "720ms" } as React.CSSProperties}
        >
          {fecha}
        </p>
      </div>
    </section>
  );
}
