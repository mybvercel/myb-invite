"use client";

import { useState } from "react";
import type { Aviso } from "@/panel/logica";

/** Un número grande con su rótulo. Los números van en mono: se alinean. */
export function Cifra({ valor, etiqueta, fuerte, de }: { valor: number | string; etiqueta: string; fuerte?: boolean; de?: number }) {
  return (
    <div className={`pnl-cifra${fuerte ? " pnl-cifra--fuerte" : ""}`}>
      <span className="pnl-cifra__valor">
        {valor}
        {de !== undefined && <span className="pnl-cifra__de">/{de}</span>}
      </span>
      <span className="pnl-cifra__etiqueta">{etiqueta}</span>
    </div>
  );
}

export function Avisos({ lista }: { lista: Aviso[] }) {
  if (!lista.length) return null;
  return (
    <ul className="pnl-avisos">
      {lista.map((a, i) => (
        <li key={i} className={`pnl-aviso pnl-aviso--${a.nivel}`}>
          <span className="pnl-aviso__marca" aria-hidden>{a.nivel === "alerta" ? "!" : "→"}</span>
          <span>{a.texto}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Las etiquetas de una mesa: las familias que se sientan ahí. Se eligen de los
 * grupos que ya existen en la lista o se escriben a mano.
 */
export function EditorEtiquetas({
  etiquetas,
  grupos,
  onCambiar,
}: {
  etiquetas: string[];
  grupos: string[];
  onCambiar: (e: string[]) => void;
}) {
  const [texto, setTexto] = useState("");
  const sumar = () => {
    const t = texto.trim();
    if (t && !etiquetas.some((e) => e.toLowerCase() === t.toLowerCase())) onCambiar([...etiquetas, t].slice(0, 8));
    setTexto("");
  };

  return (
    <div className="pnl-etiquetas">
      {etiquetas.map((e) => (
        <span key={e} className="pnl-etiqueta">
          {e}
          <button onClick={() => onCambiar(etiquetas.filter((x) => x !== e))} aria-label={`Quitar ${e}`}>×</button>
        </span>
      ))}
      <input
        className="pnl-etiquetas__input"
        value={texto}
        list="pnl-grupos-mesa"
        placeholder={etiquetas.length ? "+ otra familia" : "+ familia o grupo"}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            sumar();
          }
        }}
        onBlur={sumar}
        aria-label="Agregar familia a la mesa"
      />
      <datalist id="pnl-grupos-mesa">
        {grupos.filter((g) => !etiquetas.includes(g)).map((g) => <option key={g} value={g} />)}
      </datalist>
    </div>
  );
}
