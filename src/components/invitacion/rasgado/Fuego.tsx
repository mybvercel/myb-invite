/** Lo propio del tema Fogata: brasas, malvaviscos y el emblema. Objetos, nunca personas. */

/** Dos palos de malvaviscos cruzados. Reemplaza al monograma cuando no hay nombres. */
export function Emblema({ grande }: { grande?: boolean }) {
  return (
    <svg className={`rg-emblema ${grande ? "rg-emblema--grande" : ""}`} viewBox="0 0 100 104" aria-hidden="true">
      {[-33, 33].map((giro) => (
        <g key={giro} transform={`rotate(${giro} 50 68)`}>
          <line x1="50" y1="102" x2="50" y2="6" />
          <rect x="41" y="11" width="18" height="17" rx="5.5" />
          <rect x="41" y="30" width="18" height="17" rx="5.5" />
        </g>
      ))}
      <path className="rg-emblema__corazon" d="M50 33c-5-3.4-8.4-6.4-8.4-10.2a4.5 4.5 0 0 1 8.4-2.2 4.5 4.5 0 0 1 8.4 2.2c0 3.8-3.4 6.8-8.4 10.2Z" />
    </svg>
  );
}

const BRASAS = Array.from({ length: 16 }, (_, i) => {
  const a = (i * 0.618 + 0.11) % 1;
  const b = (i * 0.414 + 0.31) % 1;
  const c = (i * 0.755 + 0.07) % 1;
  return {
    left: `${Math.round(6 + a * 88)}%`,
    "--t": `${(4.2 + b * 4).toFixed(2)}s`,
    "--d": `${(-c * 8).toFixed(2)}s`,
    "--dx": `${Math.round((b - 0.5) * 90)}px`,
    "--e": (0.55 + c * 0.9).toFixed(2),
  } as React.CSSProperties;
});

/** Brasas que suben desde abajo de la foto, y el resplandor que late. */
export function Chispas() {
  return (
    <span className="rg-chispas" aria-hidden="true">
      <b />
      {BRASAS.map((estilo, i) => <i key={i} style={estilo} />)}
    </span>
  );
}

/** Al confirmar, tres malvaviscos se tuestan de a uno sobre la llama. */
export function Malvaviscos() {
  return (
    <svg className="rg-malv" viewBox="0 0 160 132" role="img" aria-label="Malvaviscos tostándose al fuego">
      <g className="rg-malv__llama">
        <path d="M98 130c-17 0-27-9-27-22 0-13 12-17 15-33 10 7 11 14 10 20 5-3 7-8 7-13 12 9 22 17 22 28 0 12-10 20-27 20Z" />
        <path className="rg-malv__nucleo" d="M98 130c-9 0-14-5-14-12 0-8 8-11 10-20 9 8 18 12 18 21 0 7-5 11-14 11Z" />
      </g>
      <g transform="rotate(-14 80 44)">
        <line x1="2" y1="44" x2="152" y2="44" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={70 + i * 25} y="29" width="22" height="30" rx="8.5" style={{ "--i": 2 - i } as React.CSSProperties} />
        ))}
      </g>
    </svg>
  );
}
