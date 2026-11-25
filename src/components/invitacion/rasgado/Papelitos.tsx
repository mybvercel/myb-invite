/** Pedacitos de papel que saltan al rasgar la tapa y al confirmar. */
const FORMAS = [
  "polygon(8% 12%, 92% 0, 100% 78%, 40% 100%, 0 60%)",
  "polygon(0 20%, 60% 0, 100% 40%, 78% 100%, 14% 88%)",
  "polygon(20% 0, 100% 22%, 86% 92%, 0 100%)",
];
const COLORES = ["#fffdf0", "#b9c9d8", "#e3cfa8", "#3b476f", "#fffdf0"];

const PAPELES = Array.from({ length: 28 }, (_, i) => {
  // Reparto por razón áurea: parejo sin verse en fila, y sin azar que cambie entre servidor y navegador.
  const a = (i * 0.618) % 1;
  const b = (i * 0.382 + 0.17) % 1;
  const c = (i * 0.755 + 0.4) % 1;
  return {
    left: `${Math.round(a * 100)}%`,
    "--dx": `${Math.round((b - 0.5) * 46)}vw`,
    "--sube": `${-10 - Math.round(c * 36)}svh`,
    "--giro": `${Math.round((a - 0.5) * 900)}deg`,
    "--t": `${(2.2 + b * 1.6).toFixed(2)}s`,
    "--d": `${(c * 0.22).toFixed(2)}s`,
    width: `${6 + ((i * 7) % 9)}px`,
    height: `${8 + ((i * 5) % 9)}px`,
    background: COLORES[i % COLORES.length],
    clipPath: FORMAS[i % FORMAS.length],
  } as React.CSSProperties;
});

export default function Papelitos() {
  return (
    <span className="rg-papelitos" aria-hidden="true">
      {PAPELES.map((estilo, i) => <i key={i} style={estilo} />)}
    </span>
  );
}
