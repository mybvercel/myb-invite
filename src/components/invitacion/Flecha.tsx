/**
 * Flecha dibujada a línea. Reemplaza a los caracteres ↗ ↓ ↘: en muchos
 * celulares el sistema los pinta como emoji (de colores, dentro de un
 * recuadro) y rompen el diseño. Un SVG se ve igual en todos lados y toma el
 * color y el tamaño del texto que lo rodea.
 */
const TRAZOS = {
  ne: "M7 17 17 7M8 7h9v9",
  se: "M7 7l10 10M17 8v9H8",
  s: "M12 5v14M6 13l6 6 6-6",
} as const;

export default function Flecha({ dir = "ne" }: { dir?: keyof typeof TRAZOS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: "inline-block", verticalAlign: "-0.12em", flex: "none" }}
    >
      <path d={TRAZOS[dir]} />
    </svg>
  );
}
