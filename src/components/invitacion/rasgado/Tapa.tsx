"use client";

import { useEffect, useRef, useState } from "react";
import Borde from "./Borde";
import { sonarRasgado } from "./sonido";

/**
 * La entrada: un papel azul que tapa todo y se rasga con el dedo, de izquierda
 * a derecha. Las dos mitades comparten la misma curva, por eso encajan justo.
 * También se abre con un toque o con Enter.
 */
export default function Tapa({ nombres, marca, quemado, saludo, alAbrir, children }: {
  nombres: string;
  /** El monograma o emblema, ya armado. */
  marca: React.ReactNode;
  quemado?: boolean;
  /** Debajo de los nombres: el saludo personal o la fecha. */
  saludo?: string;
  /** Corre dentro del gesto del invitado: es donde puede arrancar la música. */
  alAbrir: () => void;
  children?: React.ReactNode;
}) {
  const [estado, setEstado] = useState<"cerrada" | "abriendo" | "fuera">("cerrada");
  const tapa = useRef<HTMLButtonElement>(null);
  const gesto = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (estado !== "cerrada") return;
    const raiz = document.documentElement;
    const previo = raiz.style.overflow;
    raiz.style.overflow = "hidden";
    return () => { raiz.style.overflow = previo; };
  }, [estado]);

  useEffect(() => {
    if (estado !== "abriendo") return;
    const t = setTimeout(() => setEstado("fuera"), 2000);
    return () => clearTimeout(t);
  }, [estado]);

  const rasgar = (p: number) => {
    const t = tapa.current;
    if (!t) return;
    t.style.setProperty("--rasgo", p.toFixed(3));
    // Apenas se rasga, por la abertura se ve la foto de abajo.
    t.toggleAttribute("data-rasgando", p > 0.02);
  };

  const abrir = () => {
    if (estado !== "cerrada") return;
    setEstado("abriendo");
    navigator.vibrate?.([18, 30, 12]);
    sonarRasgado();
    alAbrir();
  };

  if (estado === "fuera") return null;

  return (
    <button
      ref={tapa}
      type="button"
      className="rg-tapa"
      data-estado={estado}
      aria-label={`Abrir la invitación de ${nombres}`}
      onPointerDown={(e) => {
        gesto.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!gesto.current || estado !== "cerrada") return;
        rasgar(Math.min(1, Math.max(0, (e.clientX - gesto.current.x) / (window.innerWidth * 0.6))));
      }}
      onPointerUp={(e) => {
        const g = gesto.current;
        gesto.current = null;
        if (!g) return;
        const dx = e.clientX - g.x;
        const toque = Math.abs(dx) < 10 && Math.abs(e.clientY - g.y) < 10;
        if (toque || dx > window.innerWidth * 0.22) abrir();
        else rasgar(0);
      }}
      onPointerCancel={() => { gesto.current = null; rasgar(0); }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        abrir();
      }}
    >
      <span className="rg-tapa__mitad rg-tapa__mitad--abajo">
        <Borde semilla={91} lado="abajo" quemado={quemado} className="rg-tapa__borde" />
        <span className="rg-tapa__hoja rg-tapa__hoja--abajo">
          <span className="rg-tapa__guia" aria-hidden="true"><i /></span>
          <span className="rg-tapa__indica">Desliza o toca para abrir</span>
        </span>
      </span>
      <span className="rg-tapa__mitad rg-tapa__mitad--arriba">
        <span className="rg-tapa__hoja rg-tapa__hoja--arriba">
          {marca}
          <span className="rg-tapa__nombres">{nombres}</span>
          {saludo && <span className="rg-tapa__saludo">{saludo}</span>}
        </span>
        <Borde semilla={91} lado="arriba" quemado={quemado} className="rg-tapa__borde" />
      </span>
      {estado === "abriendo" && children}
    </button>
  );
}
