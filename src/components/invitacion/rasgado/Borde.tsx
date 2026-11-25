/**
 * El borde de papel rasgado. Es un trazo generado: ruido en varias escalas, de
 * los picos grandes a la fibra fina, con semilla fija para que el servidor y el
 * navegador dibujen exactamente lo mismo.
 */

const ANCHO = 480;
const PUNTOS = 240;

/** Azar repetible con enteros: no depende de cómo redondee cada motor. */
function azar(semilla: number) {
  let a = semilla * 2654435761;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ESCALAS: [tramos: number, peso: number][] = [[4, 0.5], [9, 0.26], [23, 0.14], [61, 0.07], [160, 0.04]];

function curva(semilla: number, alto: number) {
  const r = azar(semilla);
  const capas = ESCALAS.map(([tramos, peso]) => ({ peso, tramos, v: Array.from({ length: tramos + 2 }, r) }));
  const fibra = Array.from({ length: PUNTOS + 1 }, () => 1.2 + r() * r() * 6.5);
  const y = Array.from({ length: PUNTOS + 1 }, (_, i) => {
    const suma = capas.reduce((t, { tramos, peso, v }) => {
      const p = (i / PUNTOS) * tramos;
      const k = Math.floor(p);
      return t + peso * (v[k] + (v[k + 1] - v[k]) * (p - k));
    }, 0);
    // El centro del ruido se estira para usar casi todo el alto.
    return Math.min(0.96, Math.max(0.08, 0.5 + (suma - 0.5) * 1.75)) * alto;
  });
  return { y, fibra };
}

const n = (v: number) => Math.round(v * 10) / 10;

export default function Borde({ semilla, lado, alto = 66, quemado, className = "" }: {
  semilla: number;
  /** "arriba": el papel cuelga desde arriba. "abajo": sube desde abajo. */
  lado: "arriba" | "abajo";
  alto?: number;
  /** Suma el filo de brasa: un trazo encendido sobre el borde. */
  quemado?: boolean;
  className?: string;
}) {
  const { y, fibra } = curva(semilla, alto);
  const signo = lado === "arriba" ? 1 : -1;
  const fin = lado === "arriba" ? -1 : alto + 1;
  const camino = (corrido: boolean) =>
    `M0 ${fin}` +
    y.map((v, i) => `L${n((i / PUNTOS) * ANCHO)} ${n(v + (corrido ? signo * fibra[i] : 0))}`).join("") +
    `L${ANCHO} ${fin}Z`;

  return (
    <svg className={`rg-borde rg-borde--${lado} ${className}`} viewBox={`0 0 ${ANCHO} ${alto}`} preserveAspectRatio="none" aria-hidden="true">
      <path className="rg-borde__fibra" d={camino(true)} />
      <path className="rg-borde__papel" d={camino(false)} />
      {quemado && (
        <path className="rg-borde__brasa" d={"M" + y.filter((_, i) => i % 2 === 0).map((v, i) => `${n((i * 2 / PUNTOS) * ANCHO)} ${n(v)}`).join("L")} />
      )}
    </svg>
  );
}
