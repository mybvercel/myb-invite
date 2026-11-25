"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { FotoRasgada } from "@/invitaciones/tipos";
import { usarVisible } from "./abierta";
import Borde from "./Borde";
import { Chispas } from "./Fuego";

/**
 * Una foto entre dos papeles rasgados. Al llegar, los papeles se abren y la
 * foto pasa del azul de la invitación a su color. Mientras se baja, se corre
 * apenas más lento que el papel.
 */
export default function Foto({ foto, semilla, arriba, abajo, prioridad, quemado, chispas }: {
  foto: FotoRasgada;
  semilla: number;
  arriba: "crema" | "azul";
  abajo: "crema" | "azul";
  prioridad?: boolean;
  /** Bordes con filo de brasa. */
  quemado?: boolean;
  /** Brasas que suben por la foto. */
  chispas?: boolean;
}) {
  const [ref, visible] = usarVisible<HTMLElement>("-14%");

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pedido = 0;
    const mover = () => {
      pedido = 0;
      const r = nodo.getBoundingClientRect();
      if (r.bottom < -80 || r.top > innerHeight + 80) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2);
      nodo.style.setProperty("--p", Math.max(-1, Math.min(1, p)).toFixed(3));
    };
    const alBajar = () => { pedido ||= requestAnimationFrame(mover); };
    mover();
    addEventListener("scroll", alBajar, { passive: true });
    return () => { removeEventListener("scroll", alBajar); cancelAnimationFrame(pedido); };
  }, [ref]);

  return (
    <figure
      ref={ref}
      data-visible={visible}
      className="rg-foto"
      style={{ aspectRatio: foto.proporcion, "--arriba": `var(--rg-${arriba})`, "--abajo": `var(--rg-${abajo})` } as React.CSSProperties}
    >
      <div className="rg-foto__marco">
        <Image src={foto.src} alt={foto.alt} fill priority={prioridad} quality={85} sizes="(min-width: 30rem) 480px, 100vw" style={{ objectPosition: foto.foco }} />
      </div>
      <span className="rg-foto__velo" />
      {chispas && <Chispas />}
      <div className="rg-foto__papel rg-foto__papel--arriba"><Borde semilla={semilla} lado="arriba" quemado={quemado} /></div>
      <div className="rg-foto__papel rg-foto__papel--abajo"><Borde semilla={semilla + 50} lado="abajo" quemado={quemado} /></div>
    </figure>
  );
}
