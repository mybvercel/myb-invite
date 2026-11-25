"use client";

import { usarAvance } from "./piezas";

/** Renglones de pincel que corren en sentidos opuestos detrás de una foto. */
export default function Renglones({ texto, filas = 3, className = "" }: { texto: string; filas?: number; className?: string }) {
  const ref = usarAvance<HTMLDivElement>();
  return (
    <div ref={ref} className={`cm-renglones ${className}`} aria-hidden="true">
      {Array.from({ length: filas }, (_, i) => (
        <p key={i} style={{ "--f": i } as React.CSSProperties} className={i % 2 ? "cm-renglon cm-renglon--al-reves" : "cm-renglon"}>
          <span>{`${texto} `.repeat(8)}</span>
        </p>
      ))}
    </div>
  );
}
