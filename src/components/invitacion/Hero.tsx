"use client";

import { useEffect, useRef, useState } from "react";
import type { InvitacionRosa as Invitacion } from "@/invitaciones/tipos";

/**
 * La portada: la ilustración de los cisnes con los nombres escritos encima.
 *
 * El texto va por HTML y no dentro de la ilustración porque así se cambia por
 * pareja sin regenerar la imagen, escala solo en cada celular y nunca sale con
 * las letras deformes que delatan a la IA.
 *
 * Las bandas en porcentaje están calibradas contra la ilustración: el arco
 * llega hasta el 17%, el vacío del centro va del 18% al 64% y los cisnes
 * arrancan en el 72%. Si se cambia el arte, hay que recalibrarlas.
 */
export default function Hero({ invitacion }: { invitacion: Invitacion }) {
  const { hero, nombres, volanta, fecha } = invitacion;
  const [conMovimiento, setConMovimiento] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setConMovimiento(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // "Alan & Sofía" se apila: es más elegante y entra en cualquier ancho.
  const [uno, dos] = nombres.split("&").map((n) => n.trim());

  /**
   * La ilustración se desvanece a transparente, no hacia un color.
   *
   * Antes le pintaba encima un degradé hasta `--papel`, y como la sección de
   * abajo tenía su propio fondo con textura, los dos tonos no coincidían y
   * quedaba la línea. Enmascarando el video, lo que aparece debajo es el papel
   * de la columna: coincide siempre, sea cual sea el fondo.
   */
  const disolver = {
    WebkitMaskImage: "linear-gradient(to bottom, #000 68%, transparent 97%)",
    maskImage: "linear-gradient(to bottom, #000 68%, transparent 97%)",
  } as const;

  return (
    <section className="relative min-h-svh overflow-hidden">
      {/* El video corre en loop y silencioso. Quien pidió menos movimiento se
          queda con la ilustración quieta y no se pierde nada. */}
      {conMovimiento ? (
        <video
          ref={videoRef}
          src={hero.video}
          poster={hero.imagen}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          style={disolver}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero.imagen}
          alt=""
          aria-hidden="true"
          style={disolver}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}


      {/* El texto vive en el vacío del centro de la ilustración. */}
      <div className="inv-entra absolute inset-x-0 top-[18%] bottom-[36%] flex flex-col items-center justify-center px-10 text-center">
        <p className="inv-versalita">{volanta}</p>

        <span className="inv-filete mt-5 mb-6" aria-hidden="true" />

        <h1 className="inv-nombre">
          {uno}
          <span className="inv-amper my-1 block" aria-hidden="true">
            &amp;
          </span>
          {dos}
        </h1>

        <span className="inv-filete mt-6 mb-5" aria-hidden="true" />

        <p className="inv-versalita">{fecha}</p>
      </div>

      {/* Justo arriba de los cisnes, donde la ilustración está limpia. */}
      <div className="absolute inset-x-0 top-[66%] flex flex-col items-center gap-3">
        <p
          className="inv-versalita text-[0.62rem]"
          style={{ animation: "inv-respira 3.2s ease-in-out infinite" }}
        >
          Deslizá
        </p>
        <span
          className="h-8 w-px bg-[var(--cobre)]"
          aria-hidden="true"
          style={{ animation: "inv-baja 3.2s ease-in-out infinite" }}
        />
      </div>
    </section>
  );
}
