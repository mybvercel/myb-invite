"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Carta as DatosCarta } from "@/invitaciones/tipos";

/**
 * El segundo en el que se corta el video. Después de ahí la animación ya
 * mostró lo que tenía que mostrar y sigue de largo sin aportar nada.
 */
const CORTE_SEG = 1.11;

/** Lo que tarda el desvanecido de la carta hacia la invitación. */
const FUNDIDO_MS = 900;

type Estado = "cerrada" | "abriendo" | "saliendo" | "abierta";

/**
 * La pantalla de entrada: un sobre cerrado con lacre que ocupa todo el celular.
 * Se toca en cualquier parte, corre la animación de apertura, se corta en el
 * segundo 1.11 y se desvanece dejando ver la invitación.
 *
 * El área táctil es toda la pantalla y no sólo el sello: el sello es la señal
 * visual, pero si hay que apuntarle, alguien va a fallar el toque.
 */
export default function Carta({
  datos,
  children,
}: {
  datos: DatosCarta;
  children: React.ReactNode;
}) {
  const [estado, setEstado] = useState<Estado>("cerrada");
  const [videoListo, setVideoListo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const cubriendo = estado !== "abierta";

  // Mientras la carta está arriba, la invitación de abajo no se scrollea.
  useEffect(() => {
    if (!cubriendo) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [cubriendo]);

  // El desvanecido termina en "abierta", que desmonta la carta.
  useEffect(() => {
    if (estado !== "saliendo") return;
    const id = setTimeout(() => setEstado("abierta"), FUNDIDO_MS);
    return () => clearTimeout(id);
  }, [estado]);

  const abrir = () => {
    if (estado !== "cerrada") return;

    // Quien pidió menos movimiento no ve la animación: pasa directo.
    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sinMovimiento) {
      setEstado("saliendo");
      return;
    }

    setEstado("abriendo");
    // El play va acá y no en un efecto porque necesita el gesto del usuario:
    // si no, iOS y Android lo bloquean.
    videoRef.current?.play().catch(() => setEstado("saliendo"));
  };

  const cortar = () => setEstado((e) => (e === "abriendo" ? "saliendo" : e));

  if (estado === "abierta") return <>{children}</>;

  return (
    <>
      {children}

      <div
        className="fixed inset-0 z-50 bg-[var(--papel)] transition-opacity ease-out"
        style={{
          opacity: estado === "saliendo" ? 0 : 1,
          transitionDuration: `${FUNDIDO_MS}ms`,
        }}
        aria-hidden={estado === "saliendo"}
      >
        {/* En desktop el sobre no se estira a todo el ancho: queda en la misma
            columna que la invitación, para que se lea como una tarjeta. */}
        <div className="relative mx-auto h-full w-full max-w-[var(--columna)] overflow-hidden">
        {/* El sobre quieto. Queda siempre abajo del video: como el primer
            fotograma del video es esta misma imagen, el arranque no parpadea
            aunque el video tarde un instante en largar. */}
        <Image
          src={datos.imagen}
          alt="Sobre de la invitación, cerrado con un sello de lacre"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover"
        />

        <video
          ref={videoRef}
          src={datos.video}
          muted
          playsInline
          preload="auto"
          onTimeUpdate={() => {
            if ((videoRef.current?.currentTime ?? 0) >= CORTE_SEG) cortar();
          }}
          onPlaying={() => setVideoListo(true)}
          onEnded={cortar}
          onError={cortar}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-150"
          style={{ opacity: estado !== "cerrada" && videoListo ? 1 : 0 }}
        />

        {/* Toda la pantalla es el botón. */}
        <button
          type="button"
          onClick={abrir}
          aria-label="Abrir la invitación"
          className="absolute inset-0 h-full w-full cursor-pointer"
        >
          <span
            className="inv-versalita pointer-events-none absolute inset-x-0 bottom-[22%] block text-center text-[0.62rem] text-[#9c6a63] transition-opacity duration-500"
            style={{
              opacity: estado === "cerrada" ? 1 : 0,
              animation: "inv-respira 3.2s ease-in-out infinite",
            }}
          >
            {datos.instruccion}
          </span>
        </button>
        </div>
      </div>
    </>
  );
}
