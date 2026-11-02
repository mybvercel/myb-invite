"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * La mesa: el mantel con todo el contenido adentro, los novios en la cabecera,
 * los invitados a los costados y "tu lugar" en la punta de abajo. Se alarga con
 * el scroll: el borde del mantel se va dibujando y cada invitado aparece cuando
 * la mesa llega a su silla.
 *
 * Para que cada uno quede sentado A la mesa y no encima, cada invitado se pinta
 * dos veces: entero por debajo del mantel (el mantel le tapa las piernas) y,
 * por encima, sólo de la cintura para arriba (los brazos y la copa apoyan
 * sobre la mesa).
 *
 * Los invitados son ilustraciones (public/invitaciones/mesa/gente), no dibujos
 * por código: con geometría se veían armados. Cada una sabe para qué lado mira
 * y se espeja cuando le toca el otro costado, así todos miran a la mesa.
 */

type Persona = { src: string; mira: "der" | "izq" };

const G = "/invitaciones/mesa/gente/";
const GENTE: Persona[] = [
  ...["a1", "a2", "a4", "a5", "b1", "b4", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map((n) => ({ src: `${G}${n}.webp`, mira: "der" as const })),
  ...["a3", "a6", "b2", "b3", "b5", "b6"].map((n) => ({ src: `${G}${n}.webp`, mira: "izq" as const })),
];
const PLATOS = Array.from({ length: 9 }, (_, i) => `/invitaciones/mesa/platos/p${i + 1}.webp`);

/** Proporción alto/ancho de las ilustraciones de invitados. */
const ALTO = 1.5;
/** Lo que cuelga el mantel en la punta de abajo. */
const CAIDA = 22;

type Asiento = { id: string; lado: "izq" | "der"; y: number; persona: Persona; plato: string };

/** Reparte la gente sin que nadie se repita antes de que pase toda la lista. */
function sentar(alto: number, fig: number): Asiento[] {
  let s = 11;
  const azar = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const orden = GENTE.map((p) => [azar(), p] as const).sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  const paso = fig * ALTO * 0.98;
  // Abajo queda libre la punta, donde va la silla del invitado.
  const ultimo = alto - fig * ALTO * 0.9 - 70;
  const asientos: Asiento[] = [];
  let k = 0;
  for (let f = 0; 14 + f * paso <= ultimo; f++) {
    for (const lado of ["izq", "der"] as const) {
      // Los lados van corridos medio paso: en la misma altura nunca hay dos.
      const y = 14 + f * paso + (lado === "der" ? paso / 2 : 0);
      if (y > ultimo) continue;
      asientos.push({ id: `${lado}-${f}`, lado, y: Math.round(y), persona: orden[k % orden.length], plato: PLATOS[(k * 4) % PLATOS.length] });
      k++;
    }
  }
  // De arriba hacia abajo: el de más abajo está más cerca y se pinta encima.
  return asientos.sort((a, b) => a.y - b.y);
}

/** Una línea a pulso: puntos cada tanto con un temblor chico y curvas suaves. */
function aPulso(puntos: [number, number][], semilla: number) {
  let s = semilla;
  const azar = () => ((s = (s * 9301 + 49297) % 233280) / 233280 - 0.5);
  const p = puntos.map(([x, y], i) => (i === 0 || i === puntos.length - 1 ? [x, y] : [x + azar() * 1.6, y + azar() * 1.2]));
  let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    d += ` Q ${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`;
  }
  return d + ` L ${p.at(-1)![0].toFixed(1)} ${p.at(-1)![1].toFixed(1)}`;
}

function tramo(x0: number, y0: number, x1: number, y1: number, cada = 46): [number, number][] {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / cada));
  return Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
}

/** Un lado del mantel: del centro de la cabecera, por el costado, al centro de la punta. */
function costado(medio: number, arriba: number, abajo: number, x: number, r: number, semilla: number) {
  const hacia = x < medio ? 1 : -1;
  return aPulso(
    [
      ...tramo(medio, arriba, x + hacia * r, arriba),
      [x + hacia * r * 0.3, arriba + r * 0.3],
      ...tramo(x, arriba + r, x, abajo - r),
      [x + hacia * r * 0.3, abajo - r * 0.3],
      ...tramo(x + hacia * r, abajo, medio, abajo),
    ],
    semilla,
  );
}

function Figura({ persona, lado, className = "", style, ...resto }: { persona: Persona; lado: "izq" | "der"; className?: string; style?: React.CSSProperties; "data-y"?: number }) {
  // A la izquierda tiene que mirar a la derecha, y al revés.
  const espejo = (lado === "izq") !== (persona.mira === "der");
  return <img src={persona.src} alt="" className={`ms-figura${espejo ? " ms-figura--espejo" : ""} ${className}`} style={style} loading="lazy" decoding="async" draggable={false} {...resto} />;
}

export function Mesa({ children, cabecera, tarjeta, sentado }: { children: React.ReactNode; cabecera: React.ReactNode; tarjeta: React.ReactNode; sentado: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const bordes = useRef<SVGGElement>(null);
  const [medida, setMedida] = useState({ ancho: 0, alto: 0 });
  const [completa, setCompleta] = useState(false);

  useEffect(() => {
    const mesa = ref.current;
    if (!mesa) return;
    const medir = () => setMedida({ ancho: mesa.offsetWidth, alto: mesa.offsetHeight });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(mesa);
    return () => ro.disconnect();
  }, []);

  const { ancho, alto } = medida;
  // El ancho de cada invitado manda: de ahí salen el canto del mantel, los
  // platos y el margen del texto (ver --fig y --borde en mesa.css).
  const fig = Math.round(Math.min(118, Math.max(82, ancho * 0.24)));
  const borde = Math.round(fig * 0.64);
  const asientos = useMemo(() => (alto ? sentar(alto, fig) : []), [alto, fig]);

  const dibujo = useMemo(() => {
    if (!ancho) return null;
    const r = 14;
    const medio = ancho / 2;
    const caida: [number, number][] = [
      ...tramo(borde, alto, borde + 3, alto + CAIDA - 4, 12),
      ...tramo(borde + 3, alto + CAIDA, ancho - borde - 3, alto + CAIDA, 14).map(([x, y], i) => [x, y + Math.sin(i * 1.7) * 2.4] as [number, number]),
      ...tramo(ancho - borde - 3, alto + CAIDA - 4, ancho - borde, alto, 12),
    ];
    const pliegues = Array.from({ length: Math.floor((ancho - 2 * borde - 20) / 30) }, (_, i) => {
      const x = borde + 22 + i * 30;
      return `M ${x} ${alto + 3} Q ${x + 3} ${alto + 11} ${x - 1} ${alto + CAIDA - 3}`;
    }).join(" ");
    return {
      tela: `M ${borde + r} 0 L ${ancho - borde - r} 0 Q ${ancho - borde} 0 ${ancho - borde} ${r} L ${ancho - borde} ${alto} L ${borde} ${alto} L ${borde} ${r} Q ${borde} 0 ${borde + r} 0 Z`,
      bordes: [costado(medio, 0, alto, borde, r, 7), costado(medio, 0, alto, ancho - borde, r, 23)],
      dobladillo: [costado(medio, 7, alto - 7, borde + 7, r - 5, 41), costado(medio, 7, alto - 7, ancho - borde - 7, r - 5, 59)],
      caida: aPulso(caida, 5) + " Z",
      pliegues,
    };
  }, [ancho, alto, borde]);

  useEffect(() => {
    const mesa = ref.current;
    if (!mesa || !alto) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const piezas = Array.from(mesa.querySelectorAll<HTMLElement>("[data-y]"));
    const tope = ancho / 2 - borde;
    let pendiente = false;

    const pintar = () => {
      pendiente = false;
      // La punta de la mesa va un poco por encima del borde de la pantalla:
      // se la ve alargarse mientras se lee.
      const frente = quieto ? alto + 400 : window.innerHeight * 0.88 - mesa.getBoundingClientRect().top;
      const hecho = frente >= alto ? 1 : (tope + Math.max(0, frente)) / (tope * 2 + alto);
      bordes.current?.querySelectorAll("path").forEach((p) => (p.style.strokeDashoffset = String(1 - hecho)));
      setCompleta(hecho >= 1);
      for (const pieza of piezas) {
        if (!pieza.dataset.sentado && Number(pieza.dataset.y) + fig * 0.5 < frente) pieza.dataset.sentado = "true";
      }
    };
    const alScroll = () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(pintar);
      }
    };

    pintar();
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    return () => {
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alScroll);
    };
  }, [alto, ancho, borde, fig, asientos]);

  const lugar = (a: Asiento): React.CSSProperties => ({ top: a.y, [a.lado === "izq" ? "left" : "right"]: 0 });

  return (
    <div className="ms-salon" style={{ "--fig": `${fig}px`, "--borde": `${borde}px` } as React.CSSProperties}>
      <div className="ms-cabecera">{cabecera}</div>
      <div ref={ref} className={`ms-mesa${completa ? " ms-mesa--completa" : ""}`}>
        {/* 1. Los invitados enteros, por debajo del mantel */}
        {asientos.map((a) => (
          <Figura key={a.id} persona={a.persona} lado={a.lado} className="ms-figura--abajo" style={lugar(a)} data-y={a.y} />
        ))}

        {/* 2. El mantel: tapa las piernas de todos */}
        <svg className="ms-mantel" width={ancho} height={alto} viewBox={`0 0 ${ancho || 1} ${alto || 1}`} aria-hidden="true">
          {dibujo && (
            <>
              <path className="ms-mantel__tela" d={dibujo.tela} />
              <g className="ms-mantel__caida">
                <path className="ms-mantel__tela ms-mantel__linea" d={dibujo.caida} />
                <path className="ms-mantel__pliegue" d={dibujo.pliegues} />
              </g>
              <g ref={bordes}>
                {dibujo.bordes.map((d, i) => (
                  <path key={i} className="ms-mantel__borde" d={d} pathLength={1} />
                ))}
                {dibujo.dobladillo.map((d, i) => (
                  <path key={`d${i}`} className="ms-mantel__dobladillo" d={d} pathLength={1} />
                ))}
              </g>
            </>
          )}
        </svg>

        {/* 3. Un plato delante de cada uno */}
        {asientos.map((a) => (
          <img key={`p-${a.id}`} src={a.plato} alt="" className={`ms-cubierto ms-cubierto--${a.lado}`} style={{ top: a.y + fig * ALTO * 0.3 }} data-y={a.y} loading="lazy" decoding="async" />
        ))}

        {/* 4. De la cintura para arriba, sobre el mantel */}
        {asientos.map((a) => (
          <Figura key={`c-${a.id}`} persona={a.persona} lado={a.lado} className="ms-figura--arriba" style={lugar(a)} data-y={a.y} />
        ))}

        <div className="ms-contenido">{children}</div>

        {/* Tu lugar: la silla de la punta, de espaldas. Al confirmar se sienta alguien. */}
        <div className={`ms-punta${sentado ? " ms-punta--ocupada" : ""}`}>
          <div className="ms-punta__tarjeta">{tarjeta}</div>
          <img src={`${G}punta-vacia.webp`} alt="" className="ms-punta__silla" />
          <img src={`${G}punta-invitado.webp`} alt="" className="ms-punta__invitado" />
        </div>
      </div>
    </div>
  );
}
