import { useId } from "react";

/**
 * El marco dorado barroco, dibujado entero en SVG.
 *
 * Lo que lo hace parecer metal y no un dibujo es la LUZ, no el color: cada
 * pieza tiene un mapa de altura (su propia silueta desenfocada) y sobre ese
 * relieve se calculan con filtros de iluminación la sombra difusa y el brillo
 * especular, con la luz arriba a la izquierda. El resultado es una moldura con
 * volumen: los bordes redondeados agarran luz y los fondos quedan oscuros.
 *
 * Capas, de afuera hacia adentro: la moldura grande, un cordón de perlas, una
 * moldura fina, el labio oscuro y la placa de oro cepillado, hundida.
 *
 * viewBox 300 × 440. La ranura está calibrada contra `.fm-salida` en
 * fotomaton.css: si se mueve acá, se mueve allá.
 */

const VB = { w: 300, h: 440 };
const BASE = { x: 18, y: 44, w: 264, h: 352, r: 28, b: 16 };

/** Contorno de cartucho, metido `i` unidades hacia adentro. */
function cartucho(i: number) {
  const x = BASE.x + i, y = BASE.y + i, w = BASE.w - 2 * i, h = BASE.h - 2 * i;
  const r = BASE.r + i, b = BASE.b;
  return [
    `M ${x + r} ${y}`,
    `Q ${x + w / 2} ${y - b} ${x + w - r} ${y}`,
    // Esquinas cóncavas: el arco va con el centro afuera, en la esquina.
    `A ${r} ${r} 0 0 0 ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `A ${r} ${r} 0 0 0 ${x + w - r} ${y + h}`,
    `Q ${x + w / 2} ${y + h + b} ${x + r} ${y + h}`,
    `A ${r} ${r} 0 0 0 ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `A ${r} ${r} 0 0 0 ${x + r} ${y}`,
    "Z",
  ].join(" ");
}

/** Un anillo entre dos contornos: con evenodd, el de adentro es un hueco. */
const anillo = (afuera: number, adentro: number) => `${cartucho(afuera)} ${cartucho(adentro)}`;

/** La cresta: venera en abanico con dos volutas. Se espeja para abajo. */
function Cresta({ oro, y, abajo = false }: { oro: string; y: number; abajo?: boolean }) {
  const petalos = [-66, -44, -22, 0, 22, 44, 66];
  return (
    <g transform={`translate(150 ${y}) ${abajo ? "scale(1 -1)" : ""}`}>
      <path d="M -10 3 C -34 6 -54 -4 -52 -17 C -50 -28 -34 -28 -34 -18 C -34 -11 -42 -11 -42 -16"
        fill="none" stroke={`url(#${oro})`} strokeWidth="6.5" strokeLinecap="round" />
      <path d="M 10 3 C 34 6 54 -4 52 -17 C 50 -28 34 -28 34 -18 C 34 -11 42 -11 42 -16"
        fill="none" stroke={`url(#${oro})`} strokeWidth="6.5" strokeLinecap="round" />
      {/* Hojitas de acanto que salen de las volutas. */}
      <path d="M -24 4 C -20 12 -12 14 -6 10 C -12 9 -18 7 -24 4 Z" fill={`url(#${oro})`} />
      <path d="M 24 4 C 20 12 12 14 6 10 C 12 9 18 7 24 4 Z" fill={`url(#${oro})`} />
      {petalos.map((a) => (
        <ellipse key={a} cx="0" cy="-15" rx="5.6" ry="16" transform={`rotate(${a} 0 0)`} fill={`url(#${oro})`} />
      ))}
      <circle cx="0" cy="0" r="7" fill={`url(#${oro})`} />
    </g>
  );
}

export default function Marco({ ranura = true }: { ranura?: boolean }) {
  const id = useId().replace(/:/g, "");
  const oro = `oro-${id}`, placa = `placa-${id}`, hueco = `hueco-${id}`;
  const metal = `metal-${id}`, cepillado = `cepillado-${id}`, hundido = `hundido-${id}`, sombra = `sombra-${id}`;

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="fm-marco" aria-hidden="true">
      <defs>
        {/* Oro viejo: el color base es apagado a propósito. El brillo lo pone
            la iluminación del filtro; si el color ya viene brillante, satura. */}
        <linearGradient id={oro} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a6a2c" />
          <stop offset="0.3" stopColor="#b8913f" />
          <stop offset="0.55" stopColor="#caa452" />
          <stop offset="0.8" stopColor="#a57e36" />
          <stop offset="1" stopColor="#6e5222" />
        </linearGradient>
        <radialGradient id={placa} cx="0.3" cy="0.2" r="1">
          <stop offset="0" stopColor="#d9b56a" />
          <stop offset="0.55" stopColor="#bf974c" />
          <stop offset="1" stopColor="#8f6b2e" />
        </radialGradient>
        <linearGradient id={hueco} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#140b04" />
          <stop offset="1" stopColor="#3e2a10" />
        </linearGradient>

        {/* Metal con relieve. El mapa de altura es la silueta desenfocada: los
            bordes quedan redondeados, como una moldura. Sombra difusa por
            multiplicación + brillo especular sumado, y una pátina muy leve
            de ruido para que no sea oro de plástico. */}
        <filter id={metal} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="altura" />
          <feDiffuseLighting in="altura" surfaceScale="5" diffuseConstant="1.15" lightingColor="#fff6e0" result="difusa">
            <feDistantLight azimuth="225" elevation="48" />
          </feDiffuseLighting>
          <feComposite in="difusa" in2="SourceAlpha" operator="in" result="difusaIn" />
          <feBlend in="SourceGraphic" in2="difusaIn" mode="multiply" result="sombreado" />
          <feSpecularLighting in="altura" surfaceScale="5" specularConstant="1.05" specularExponent="26" lightingColor="#fff1c8" result="brillo">
            <feDistantLight azimuth="225" elevation="42" />
          </feSpecularLighting>
          <feComposite in="brillo" in2="SourceAlpha" operator="in" result="brilloIn" />
          <feComposite in="sombreado" in2="brilloIn" operator="arithmetic" k1="0" k2="1.12" k3="0.95" k4="0" result="lustre" />
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="5" result="grano" />
          <feColorMatrix in="grano" type="saturate" values="0" result="granoGris" />
          <feComposite in="granoGris" in2="SourceAlpha" operator="in" result="granoIn" />
          <feBlend in="lustre" in2="granoIn" mode="multiply" result="patina" />
          <feComposite in="patina" in2="lustre" operator="arithmetic" k1="0" k2="0.18" k3="0.82" k4="0" />
        </filter>

        {/* Oro cepillado: ruido estirado en horizontal, que es el rayado fino
            que deja el cepillo en una placa de metal. */}
        <filter id={cepillado} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.4 0.018" numOctaves="2" seed="11" result="rayas" />
          <feColorMatrix in="rayas" type="matrix"
            values="0 0 0 0 1  0 0 0 0 0.93  0 0 0 0 0.75  0 0 0 0.55 -0.12" result="luces" />
          <feComposite in="luces" in2="SourceAlpha" operator="in" result="lucesIn" />
          <feBlend in="SourceGraphic" in2="lucesIn" mode="screen" />
        </filter>

        {/* La placa está hundida: sombra interior arriba a la izquierda. */}
        <filter id={hundido} x="0" y="0" width="100%" height="100%">
          <feComponentTransfer in="SourceAlpha" result="inversa">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feGaussianBlur in="inversa" stdDeviation="4" />
          <feOffset dx="2.5" dy="3.5" result="desplazada" />
          <feFlood floodColor="#2b1a06" floodOpacity="0.75" />
          <feComposite in2="desplazada" operator="in" />
          <feComposite in2="SourceAlpha" operator="in" result="sombraIn" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="sombraIn" />
          </feMerge>
        </filter>

        <filter id={sombra} x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#140103" floodOpacity="0.6" />
        </filter>
      </defs>

      <g filter={`url(#${sombra})`}>
        {/* La placa, hundida y cepillada. */}
        <g filter={`url(#${hundido})`}>
          <path d={cartucho(15)} fill={`url(#${placa})`} filter={`url(#${cepillado})`} />
        </g>

        {/* Moldura grande. */}
        <path d={anillo(0, 9)} fillRule="evenodd" fill={`url(#${oro})`} filter={`url(#${metal})`} />
        {/* Cordón de perlas: puntos redondos sobre el contorno, cada uno con su brillo. */}
        <path d={cartucho(9.5)} fill="none" stroke={`url(#${oro})`} strokeWidth="3.4"
          strokeDasharray="0.1 5.2" strokeLinecap="round" filter={`url(#${metal})`} />
        {/* Moldura fina que baja a la placa. */}
        <path d={anillo(11.5, 15)} fillRule="evenodd" fill={`url(#${oro})`} filter={`url(#${metal})`} />

        <g filter={`url(#${metal})`}>
          <Cresta oro={oro} y={BASE.y - BASE.b + 3} />
          <Cresta oro={oro} y={BASE.y + BASE.h + BASE.b - 3} abajo />
        </g>
      </g>

      {ranura && (
        <g>
          {/* Borde metálico de la ranura y el hueco oscuro de adentro. */}
          <rect x="104" y="92" width="92" height="14" rx="7" fill={`url(#${oro})`} filter={`url(#${metal})`} />
          <rect x="108" y="96" width="84" height="8" rx="4" fill={`url(#${hueco})`} />
        </g>
      )}
    </svg>
  );
}
