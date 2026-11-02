"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Los dibujos del estilo "Cinta": doodles naranjas de fiesta y la cinta roja
 * que se traza con el scroll. Criterios: .claude/skills/invitacion-cinta/SKILL.md
 *
 * Cada trazo lleva `pathLength=1` y un índice `--i`: el CSS lo dibuja como
 * lapicera cuando la sección entra en pantalla.
 */

type Lapiz = (d: string, ancho?: number) => React.ReactElement;

function lapiz(): Lapiz {
  let k = 0;
  return (d, ancho = 2.3) => (
    <path key={k} d={d} pathLength={1} className="cn-t" strokeWidth={ancho} style={{ "--i": k++ } as React.CSSProperties} />
  );
}

const circulo = (cx: number, cy: number, r: number) => `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;

/** Contenedor de un doodle: cae como una pegatina, con su propio giro. */
function Pegatina({ children, giro = 0, retardo = 0, className = "" }: { children: React.ReactNode; giro?: number; retardo?: number; className?: string }) {
  return (
    <span className={`cn-pegatina ${className}`} style={{ "--giro": `${giro}deg`, "--d": `${retardo}ms` } as React.CSSProperties}>
      {children}
    </span>
  );
}

export function Anillos() {
  const t = lapiz();
  return (
    <svg viewBox="0 0 120 100" className="cn-svg" role="img" aria-label="Dos anillos entrelazados">
      {t(circulo(44, 64, 26))}
      {t(circulo(78, 64, 26))}
      {t("M50 24 L62 14 L76 24 L63 40 Z")}
      {t("M50 24 L76 24 M56 19 L58 24 M69 19 L67 24 M63 40 L58 24 M63 40 L67 24", 1.6)}
      {t("M40 8 L38 0 M52 6 L56 -2 M88 12 L96 6", 1.8)}
    </svg>
  );
}

export function Disco() {
  const t = lapiz();
  return (
    <svg viewBox="0 0 110 150" className="cn-svg" role="img" aria-label="Una bola de espejos">
      {t("M55 0 L55 42", 1.8)}
      {t(circulo(55, 86, 38))}
      {t("M19 72 Q55 86 91 72 M17 88 Q55 103 93 88 M24 104 Q55 114 86 104", 1.7)}
      {t("M55 48 Q43 86 55 124 M38 54 Q20 86 38 120 M72 54 Q90 86 72 120", 1.7)}
      {t("M100 46 L108 40 M104 62 L116 60 M96 32 L102 24", 1.8)}
    </svg>
  );
}

export function Copas() {
  const t = lapiz();
  return (
    <svg viewBox="0 0 200 140" className="cn-svg" role="img" aria-label="Dos copas brindando">
      <g transform="rotate(14 72 76)">
        {t("M58 18 L88 18 L83 68 Q73 80 63 68 Z")}
        {t("M73 80 L73 116 M58 118 Q73 111 88 118")}
        {t("M62 36 Q73 42 84 36", 1.6)}
      </g>
      <g transform="rotate(-14 128 76)">
        {t("M112 18 L142 18 L137 68 Q127 80 117 68 Z")}
        {t("M127 80 L127 116 M112 118 Q127 111 142 118")}
        {t("M116 36 Q127 42 138 36", 1.6)}
      </g>
      {t("M96 20 L92 6 M104 18 L104 2 M112 20 L116 6", 1.8)}
      {t(circulo(100, 36, 2.5) + circulo(92, 46, 2) + circulo(110, 44, 2), 1.5)}
    </svg>
  );
}

export function Pizza() {
  const t = lapiz();
  return (
    <svg viewBox="0 0 90 100" className="cn-svg" role="img" aria-label="Una porción de pizza">
      {t("M10 14 Q44 -2 80 16 L46 92 Z")}
      {t("M10 14 Q44 -2 80 16 L78 24 Q44 8 12 22 Z", 1.8)}
      {t(circulo(36, 40, 6) + circulo(54, 52, 5.5) + circulo(44, 68, 4.5), 1.8)}
    </svg>
  );
}

export function Corazon() {
  const t = lapiz();
  return (
    <svg viewBox="0 0 60 56" className="cn-svg" aria-hidden="true">
      {t("M30 52 C 6 34, 2 12, 18 8 C 25 6, 30 11, 30 16 C 30 11, 35 6, 42 8 C 58 12, 54 34, 30 52 Z", 2.6)}
    </svg>
  );
}

export function Estrella() {
  const t = lapiz();
  return (
    <svg viewBox="0 0 50 50" className="cn-svg" aria-hidden="true">
      {t("M25 4 L25 46 M5 25 L45 25 M11 11 L39 39 M39 11 L11 39", 2.6)}
    </svg>
  );
}

export function Sobre() {
  const t = lapiz();
  return (
    <svg viewBox="0 0 120 84" className="cn-svg" role="img" aria-label="Un sobre">
      {t("M10 12 L110 10 L112 74 L8 76 Z")}
      {t("M10 12 L60 48 L110 10", 2)}
      {t("M60 40 C 54 33, 44 38, 60 52 C 76 38, 66 33, 60 40 Z", 2)}
    </svg>
  );
}

/** Un lazo para la vestimenta. */
export function Lazo() {
  const t = lapiz();
  return (
    <svg viewBox="0 0 130 70" className="cn-svg" role="img" aria-label="Un moño">
      {t("M65 35 L22 12 C 14 9, 8 14, 8 22 L8 48 C 8 56, 14 61, 22 58 Z")}
      {t("M65 35 L108 12 C 116 9, 122 14, 122 22 L122 48 C 122 56, 116 61, 108 58 Z")}
      {t("M55 24 L75 24 L75 46 L55 46 Z", 2.4)}
    </svg>
  );
}

/* ── El brindis: las manos se acercan al confirmar ─────────────────── */
export function Brindis({ juntos }: { juntos: boolean }) {
  const t = lapiz();
  // Una mano: la manga sube en diagonal desde la esquina y termina en el puño,
  // que sostiene la copa por el pie. Las dos manos son la misma, espejada.
  const mano = (
    <>
      {t("M8 176 L66 112 L88 130 L30 194 Z", 2.4)}
      {t("M30 168 L48 184 M42 154 L60 170", 1.6)}
      {t(circulo(92, 112, 16), 2.4)}
      {t("M78 18 L106 18 L101 62 Q92 74 83 62 Z", 2.4)}
      {t("M92 74 L92 97", 2)}
      {t("M82 34 Q92 40 102 34", 1.6)}
    </>
  );
  return (
    <svg viewBox="0 0 300 200" className={`cn-brindis-svg${juntos ? " cn-brindis--juntos" : ""}`} role="img" aria-label="Dos manos brindando con copas">
      <g className="cn-mano cn-mano--izq">{mano}</g>
      {/* El espejo va en un <g> aparte: la animación de CSS pisaría su
          transform si fuera el mismo elemento. */}
      <g transform="translate(300 0) scale(-1 1)">
        <g className="cn-mano cn-mano--der">{mano}</g>
      </g>
      <g className="cn-chispas" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4">
        <path d="M150 10 L150 -6 M136 16 L126 6 M164 16 L174 6 M140 28 L128 26 M160 28 L172 26" />
        <circle cx="150" cy="44" r="3" />
        <circle cx="132" cy="42" r="2.2" />
        <circle cx="168" cy="42" r="2.2" />
      </g>
    </svg>
  );
}

/* ── La cinta roja: se traza a medida que se baja ──────────────────── */

/** Una onda suave de punta a punta de la página, hecha con S-curves. */
function onda(x: number, alto: number, amplitud: number, semilla: number) {
  let y = 90;
  let s = semilla;
  const azar = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let d = `M ${x} ${y}`;
  let lado = 1;
  while (y < alto - 140) {
    const paso = 80 + azar() * 70;
    const nx = x + lado * (amplitud * (0.5 + azar() * 0.5));
    d += ` C ${x - lado * amplitud * 0.2} ${y + paso * 0.35}, ${nx} ${y + paso * 0.65}, ${nx * 0.5 + x * 0.5} ${y + paso}`;
    y += paso;
    lado = -lado;
  }
  return d;
}

export function Cinta() {
  const svg = useRef<SVGSVGElement>(null);
  const [medida, setMedida] = useState({ ancho: 0, alto: 0 });

  useEffect(() => {
    const cont = svg.current?.parentElement;
    if (!cont) return;
    const medir = () => setMedida({ ancho: cont.offsetWidth, alto: cont.offsetHeight });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cont);
    return () => ro.disconnect();
  }, []);

  // El largo trazado sigue al scroll: la punta de la cinta queda siempre
  // abajo de la pantalla, como si la fueran dibujando mientras se lee.
  useEffect(() => {
    const cont = svg.current?.parentElement;
    if (!cont || !medida.alto) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pendiente = false;

    const pintar = () => {
      pendiente = false;
      const r = cont.getBoundingClientRect();
      const avance = quieto ? 1 : Math.min(1, Math.max(0, (window.innerHeight * 0.92 - r.top) / r.height));
      svg.current?.querySelectorAll<SVGPathElement>(".cn-cinta").forEach((p) => {
        p.style.strokeDashoffset = String(1 - avance);
      });
    };
    const alScroll = () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(pintar);
      }
    };

    pintar();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, [medida]);

  const { ancho, alto } = medida;
  return (
    <svg ref={svg} className="cn-cinta-svg" width={ancho} height={alto} viewBox={`0 0 ${ancho || 1} ${alto || 1}`} aria-hidden="true">
      {ancho > 0 && (
        <>
          <path d={onda(40, alto, 10, 7)} pathLength={1} className="cn-cinta" />
          <path d={onda(ancho - 40, alto, 10, 31)} pathLength={1} className="cn-cinta" />
        </>
      )}
    </svg>
  );
}

export { Pegatina };
