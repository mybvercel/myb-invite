/**
 * Filete con una ramita en el medio.
 *
 * Va dibujado a mano en SVG y no con un icono de librería: un vectorial de
 * Lucide al lado de una ilustración en acuarela es lo que más delata que algo
 * lo armó una máquina. Un solo peso de trazo, en cobre.
 */
export default function Ornamento({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 24"
      aria-hidden="true"
      className={`block ${className}`}
      style={{ width: "clamp(8rem, 34vw, 10rem)", height: "auto" }}
      fill="none"
    >
      <defs>
        <linearGradient id="orn-izq" x1="0" x2="1">
          <stop offset="0" stopColor="var(--cobre)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--cobre)" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="orn-der" x1="0" x2="1">
          <stop offset="0" stopColor="var(--cobre)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--cobre)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d="M2 12.5 H60" stroke="url(#orn-izq)" strokeWidth="1" />
      <path d="M100 12.5 H158" stroke="url(#orn-der)" strokeWidth="1" />

      {/* La ramita: tallo, dos hojas y un brote. */}
      <path d="M80 21 C80 16 80 11 80 6" stroke="var(--cobre)" strokeWidth="1" strokeLinecap="round" />
      <path
        d="M80 15.5 C74.6 15 71 12.4 69.6 8.8 C74.2 8.8 77.9 11.2 80 15.5 Z"
        fill="var(--cobre)"
        fillOpacity="0.72"
      />
      <path
        d="M80 12.2 C85.4 11.7 89 9.1 90.4 5.5 C85.8 5.5 82.1 7.9 80 12.2 Z"
        fill="var(--cobre)"
        fillOpacity="0.72"
      />
      <circle cx="80" cy="4.6" r="1.5" fill="var(--cobre)" fillOpacity="0.85" />
    </svg>
  );
}
