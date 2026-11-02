"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Las casitas de Jerusalén del estilo "Ciudad" y el marco que arman: un arco
 * arriba, los dos costados y una fila de casas y portones abajo.
 * Criterios: .claude/skills/invitacion-ciudad/SKILL.md
 *
 * Son formas planas en dos azules, como las de una tarjeta impresa, así que
 * van por código. Cada vértice tiembla medio píxel: con esquinas perfectas se
 * ven de computadora, y así parecen estampadas.
 */

type Azar = () => number;
const azar = (semilla: number): Azar => {
  let s = Math.abs(Math.round(semilla)) % 233280;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};

const f = (n: number) => n.toFixed(1);

function poli(puntos: [number, number][], r: Azar, temblor = 0.55) {
  return "M " + puntos.map(([x, y]) => `${f(x + (r() - 0.5) * temblor * 2)} ${f(y + (r() - 0.5) * temblor * 2)}`).join(" L ") + " Z";
}
const caja = (x: number, y: number, w: number, h: number, r: Azar) => poli([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], r);
/** Ventana o puerta en arco: apoyada en `base`, de alto `h`. */
const arco = (x: number, base: number, w: number, h: number) =>
  `M ${f(x)} ${f(base)} L ${f(x)} ${f(base - h + w / 2)} A ${f(w / 2)} ${f(w / 2)} 0 0 1 ${f(x + w)} ${f(base - h + w / 2)} L ${f(x + w)} ${f(base)} Z`;
const cupula = (cx: number, base: number, rx: number, ry: number) => `M ${f(cx - rx)} ${f(base)} A ${f(rx)} ${f(ry)} 0 0 1 ${f(cx + rx)} ${f(base)} Z`;

export type Tipo = "cupula" | "dosAguas" | "torre" | "portal" | "plana" | "cubos" | "cipres";

/**
 * Una casa en coordenadas propias: x de 0 a w, el piso en y = 0, crece hacia
 * arriba. Cada una lleva el detalle de una fachada de piedra: sillares,
 * ventanas con marco, alféizar y travesaños, puertas con escalones, cornisas
 * con dentículos, cúpulas con nervaduras y farol, tejas y balcones.
 */
export function Casa({ tipo, w, h, semilla }: { tipo: Tipo; w: number; h: number; semilla: number }) {
  const r = azar(semilla * 7 + 3);
  const piezas: React.ReactNode[] = [];
  let k = 0;
  const poner = (clase: string, d: string) => piezas.push(<path key={k++} className={clase} d={d} />);
  const muro = (d: string) => poner("cd-muro", d);
  const celeste = (d: string) => poner("cd-celeste", d);
  const azul = (d: string) => poner("cd-azul", d);
  const trazo = (d: string) => poner("cd-linea", d);
  const fino = (d: string) => poner("cd-linea cd-linea--fina", d);
  const blanco = (d: string) => poner("cd-linea cd-linea--blanca", d);

  /** Sillares: hiladas con las juntas cruzadas, como una pared de piedra. */
  const sillares = (x: number, top: number, ancho: number, alto: number) => {
    if (alto < 24) return;
    const paso = Math.max(5.5, alto / 9);
    let d = "";
    let fila = 0;
    for (let y = top + paso; y < top + alto - 1; y += paso, fila++) {
      d += `M ${f(x + 0.8)} ${f(y)} L ${f(x + ancho - 0.8)} ${f(y)} `;
      const sep = 9 + (fila % 2) * 2.5;
      for (let jx = x + sep * (0.45 + (fila % 2) * 0.5); jx < x + ancho - 2; jx += sep) d += `M ${f(jx)} ${f(y - paso)} L ${f(jx)} ${f(y)} `;
    }
    fino(d);
  };

  /** La cara en sombra: una franja celeste con rayado fino. */
  const sombra = (x: number, ancho: number, top: number, alto: number) => {
    if (r() < 0.35) return;
    const sw = ancho * 0.3;
    const x0 = x + ancho - sw;
    celeste(caja(x0, top, sw, alto, r));
    let d = "";
    for (let vx = x0 + 1.7; vx < x0 + sw - 0.6; vx += 2.6) d += `M ${f(vx)} ${f(top + 1)} L ${f(vx)} ${f(top + alto - 1)} `;
    poner("cd-linea cd-linea--sombra", d);
  };

  /** Cornisa: una banda celeste con dentículos debajo. */
  const cornisa = (x: number, y: number, ancho: number) => {
    celeste(caja(x - 1.4, y, ancho + 2.8, 2.6, r));
    let d = "";
    for (let dx = x + 1; dx < x + ancho - 2; dx += 4) d += caja(dx, y + 2.6, 2, 2, r) + " ";
    azul(d);
  };

  /** Ventana con marco, travesaños y alféizar; a veces con balcón. */
  const ventana = (x: number, base: number, vw: number, vh: number, enArco: boolean, balcon = false) => {
    const m = 1.5;
    muro(enArco ? arco(x - m, base + m, vw + 2 * m, vh + 2 * m) : caja(x - m, base - vh - m, vw + 2 * m, vh + 2 * m, r));
    azul(enArco ? arco(x, base, vw, vh) : caja(x, base - vh, vw, vh, r));
    blanco(`M ${f(x + vw / 2)} ${f(base - vh + (enArco ? vw / 2 : 0.5))} L ${f(x + vw / 2)} ${f(base - 0.4)} M ${f(x + 0.4)} ${f(base - vh * 0.42)} L ${f(x + vw - 0.4)} ${f(base - vh * 0.42)}`);
    celeste(caja(x - m - 1, base + m, vw + 2 * m + 2, 1.9, r));
    if (enArco) celeste(poli([[x + vw / 2 - 1.7, base - vh - m - 2.4], [x + vw / 2 + 1.7, base - vh - m - 2.4], [x + vw / 2 + 1, base - vh - m + 0.4], [x + vw / 2 - 1, base - vh - m + 0.4]], r));
    if (balcon) {
      const bx = x - m - 2;
      const bw = vw + 2 * m + 4;
      let d = `M ${f(bx)} ${f(base + m + 1.9)} L ${f(bx + bw)} ${f(base + m + 1.9)} M ${f(bx)} ${f(base + m + 1.9 + 4.4)} L ${f(bx + bw)} ${f(base + m + 1.9 + 4.4)} `;
      for (let vx = bx + 1; vx < bx + bw; vx += 2.8) d += `M ${f(vx)} ${f(base + m + 1.9)} L ${f(vx)} ${f(base + m + 1.9 + 4.4)} `;
      trazo(d);
    }
  };

  /** Una fila de ventanas parejas dentro de un tramo de pared. */
  const fila = (x: number, ancho: number, base: number, alto: number, n: number, enArco: boolean, balcon = false) => {
    const vw = Math.max(3.6, Math.min(ancho / (n * 2.5), alto * 0.58));
    const hueco = (ancho - n * vw) / (n + 1);
    for (let i = 0; i < n; i++) ventana(x + hueco + i * (vw + hueco), base, vw, alto, enArco, balcon);
  };

  /** Puerta en arco con marco celeste, tablones y escalones. */
  const puerta = (x: number, ancho: number, alto: number) => {
    muro(caja(x - 3.6, -1.7, ancho + 7.2, 1.7, r));
    muro(caja(x - 1.9, -3.4, ancho + 3.8, 1.7, r));
    celeste(arco(x - 1.7, -3.4, ancho + 3.4, alto + 1.7));
    azul(arco(x, -3.4, ancho, alto));
    blanco(`M ${f(x + ancho / 3)} ${f(-3.4 - alto + ancho / 2)} L ${f(x + ancho / 3)} -3.6 M ${f(x + (ancho * 2) / 3)} ${f(-3.4 - alto + ancho / 2)} L ${f(x + (ancho * 2) / 3)} -3.6`);
  };

  /** Cúpula celeste con nervaduras, un brillo y un farolito en la punta. */
  const domo = (cx: number, base: number, rx: number, ry: number) => {
    celeste(cupula(cx, base, rx, ry));
    let d = "";
    for (const t of [-0.64, -0.32, 0, 0.32, 0.64]) d += `M ${f(cx + t * rx)} ${f(base)} Q ${f(cx + t * rx * 0.72)} ${f(base - ry * 0.94)} ${f(cx)} ${f(base - ry)} `;
    poner("cd-linea cd-linea--nervio", d);
    blanco(`M ${f(cx - rx * 0.8)} ${f(base - ry * 0.4)} Q ${f(cx - rx * 0.62)} ${f(base - ry * 0.86)} ${f(cx - rx * 0.2)} ${f(base - ry * 0.97)}`);
    trazo(`M ${f(cx - rx)} ${f(base)} L ${f(cx + rx)} ${f(base)}`);
    const top = base - ry;
    muro(caja(cx - 1.9, top - 4.4, 3.8, 4.4, r));
    celeste(cupula(cx, top - 4.4, 2.7, 2.9));
    trazo(`M ${f(cx)} ${f(top - 7.2)} L ${f(cx)} ${f(top - 10.4)} M ${f(cx - 1.3)} ${f(top - 8.9)} L ${f(cx + 1.3)} ${f(top - 8.9)}`);
  };

  if (tipo === "cupula") {
    const hb = h * 0.58;
    const rx = w * (0.27 + r() * 0.08);
    const cx = w * (0.42 + r() * 0.16);
    muro(caja(0, -hb, w, hb, r));
    sillares(0, -hb, w, hb);
    sombra(0, w, -hb, hb);
    cornisa(0, -hb, w);
    domo(cx, -hb - 4.6, rx, Math.max(6, h - hb - 16));
    fila(0, w, -hb * 0.56, hb * 0.28, r() > 0.5 ? 3 : 2, true, r() > 0.6);
    puerta(w / 2 - w * 0.09, w * 0.18, hb * 0.34);
  } else if (tipo === "dosAguas") {
    const hb = h * 0.62;
    muro(caja(w * 0.72, -h * 0.98, 4.6, h * 0.24, r));
    celeste(caja(w * 0.72 - 0.8, -h * 0.98 - 1.7, 6.2, 1.7, r));
    muro(caja(0, -hb, w, hb, r));
    sillares(0, -hb, w, hb);
    sombra(0, w, -hb, hb);
    celeste(poli([[-w * 0.04, -hb], [w * 0.5, -h], [w * 1.04, -hb]], r));
    let d = "";
    const filas = 4;
    for (let t = 1; t <= filas; t++) {
      const fr = t / (filas + 1);
      const y = -hb - (h - hb) * fr;
      const mitad = w * 0.54 * (1 - fr);
      d += `M ${f(w / 2 - mitad)} ${f(y)} L ${f(w / 2 + mitad)} ${f(y)} `;
    }
    fino(d);
    trazo(`M ${f(-w * 0.04)} ${f(-hb)} L ${f(w * 1.04)} ${f(-hb)}`);
    fila(0, w, -hb * 0.5, hb * 0.26, 3, false, r() > 0.5);
    puerta(w / 2 - w * 0.09, w * 0.18, hb * 0.3);
  } else if (tipo === "torre") {
    const tw = w * 0.62;
    const tx = (w - tw) / 2;
    const hb = h * 0.78;
    muro(caja(tx, -hb, tw, hb, r));
    sillares(tx, -hb, tw, hb);
    sombra(tx, tw, -hb, hb);
    cornisa(tx, -hb, tw);
    domo(tx + tw / 2, -hb - 4.6, tw * 0.42, Math.max(5, h - hb - 14));
    celeste(caja(tx - 1.2, -hb * 0.46, tw + 2.4, 2.3, r));
    fila(tx, tw, -hb * 0.62, hb * 0.2, 2, true, true);
    fila(tx, tw, -hb * 0.18, hb * 0.2, 2, true);
  } else if (tipo === "portal") {
    const hb = h * 0.78;
    muro(caja(0, -hb, w, hb, r));
    sillares(0, -hb, w, hb);
    cornisa(0, -hb - 2.6, w);
    const pw = w * 0.4;
    puerta((w - pw) / 2, pw, hb * 0.66);
    ventana(w * 0.1, -hb * 0.6, Math.max(3.6, w * 0.1), hb * 0.2, false);
    ventana(w * 0.9 - Math.max(3.6, w * 0.1), -hb * 0.6, Math.max(3.6, w * 0.1), hb * 0.2, false);
  } else if (tipo === "plana") {
    const hb = h * 0.8;
    muro(caja(0, -hb, w, hb, r));
    sillares(0, -hb, w, hb);
    sombra(0, w, -hb, hb);
    celeste(caja(-1, -hb - 3.2, w + 2, 3.2, r));
    let d = "";
    for (let mx = 1; mx < w - 3; mx += 5.4) d += caja(mx, -hb - 5.6, 2.8, 2.4, r) + " ";
    azul(d);
    celeste(caja(w * 0.12, -h, w * 0.26, h - hb - 5.6, r));
    trazo(`M ${f(w * 0.12)} ${f(-h + 2.4)} L ${f(w * 0.38)} ${f(-h + 2.4)}`);
    fila(0, w, -hb * 0.3, hb * 0.38, 3, true, r() > 0.55);
  } else if (tipo === "cubos") {
    const h1 = h * 0.95;
    const w1 = w * 0.56;
    muro(caja(0, -h1, w1, h1, r));
    sillares(0, -h1, w1, h1);
    celeste(caja(-w1 * 0.04, -h, w1 * 1.08, h - h1 + 0.5, r));
    fila(0, w1, -h1 * 0.6, h1 * 0.2, 2, false, true);
    fila(0, w1, -h1 * 0.22, h1 * 0.2, 2, true);
    const h2 = h * 0.6;
    const x2 = w * 0.42;
    const w2 = w - x2;
    muro(caja(x2, -h2, w2, h2, r));
    sillares(x2, -h2, w2, h2);
    sombra(x2, w2, -h2, h2);
    cornisa(x2, -h2, w2);
    fila(x2, w2, -h2 * 0.3, h2 * 0.38, 2, true);
  } else {
    // Ciprés: la copa en llama, con vetas, y un tronco corto.
    const cx = w / 2;
    celeste(`M ${f(cx)} ${f(-h)} C ${f(cx - w * 0.7)} ${f(-h * 0.7)} ${f(cx - w * 0.55)} ${f(-h * 0.14)} ${f(cx)} ${f(-h * 0.1)} C ${f(cx + w * 0.55)} ${f(-h * 0.14)} ${f(cx + w * 0.7)} ${f(-h * 0.7)} ${f(cx)} ${f(-h)} Z`);
    let d = "";
    for (const t of [-0.28, 0, 0.28]) d += `M ${f(cx + t * w)} ${f(-h * 0.16)} Q ${f(cx + t * w * 1.1)} ${f(-h * 0.6)} ${f(cx + t * w * 0.2)} ${f(-h * 0.9)} `;
    poner("cd-linea cd-linea--nervio", d);
    azul(caja(cx - 1.2, -h * 0.12, 2.4, h * 0.12, r));
  }

  return <>{piezas}</>;
}

type Pieza = { id: string; tipo: Tipo; x: number; y: number; w: number; h: number; semilla: number; atras?: boolean };

const TIPOS: Tipo[] = ["cupula", "dosAguas", "torre", "plana", "cubos", "cupula", "dosAguas", "plana"];

/**
 * Arma la ciudad para una tarjeta de W × H. S es el ancho de un costado.
 * Devuelve las casas de atrás primero y después de arriba hacia abajo, así la
 * de más abajo queda adelante, como en una ciudad vista de frente.
 */
function armar(W: number, H: number, S: number) {
  const r = azar(W * 3 + 17);
  const piezas: Pieza[] = [];
  let n = 0;
  const tipo = () => TIPOS[Math.floor(r() * TIPOS.length)];
  // Nada se sale de la tarjeta: las casas de las puntas del arco se corren adentro.
  const agregar = (p: Omit<Pieza, "id" | "semilla">) =>
    piezas.push({ ...p, x: Math.min(Math.max(p.x, 2), W - 2 - p.w), id: `c${n}`, semilla: n++ * 13 + 5 });

  // El arco: un semicírculo de casas que une los dos costados. Cada casa
  // apoya su esquina de adentro sobre la curva interior y crece hacia afuera:
  // así el hueco del arco queda limpio, como en la tarjeta, y en las puntas
  // el arco cae justo sobre las columnas de los costados.
  const cx = W / 2;
  const adentro = W / 2 - 4 - S * 0.85;
  const cy = adentro + S + 8;
  const cuantas = Math.max(6, Math.round((Math.PI * adentro) / (S * 0.7)));
  for (let i = 0; i <= cuantas; i++) {
    const a = Math.PI - (i * Math.PI) / cuantas;
    const w = S * (0.74 + r() * 0.16);
    const h = S * (0.66 + r() * 0.3);
    const hacia = 0.5 - 0.5 * Math.cos(a);
    // Una fila de casas más chicas asomando por detrás del arco.
    if (i % 2 === 1) {
      const ra = adentro + S * 0.55;
      const wa = w * 0.8;
      agregar({ tipo: tipo(), x: cx + ra * Math.cos(a) - wa * hacia, y: cy - ra * Math.sin(a), w: wa, h: h * 0.8, atras: true });
    }
    agregar({ tipo: i === 0 || i === cuantas ? "torre" : tipo(), x: cx + adentro * Math.cos(a) - w * hacia, y: cy - adentro * Math.sin(a), w, h });
  }

  // Los costados: casas apiladas desde donde termina el arco hasta la base.
  const baseAlto = S * 1.05;
  const fin = H - baseAlto - 6;
  for (const lado of ["izq", "der"] as const) {
    let y = cy + S * 0.25;
    while (y < fin - S * 0.5) {
      const h = Math.min(S * (0.78 + r() * 0.32), fin - y + S * 0.2);
      const w = S * (0.82 + r() * 0.16);
      const corrido = r() * S * 0.1;
      const x = lado === "izq" ? 4 + corrido : W - 4 - corrido - w;
      if (r() > 0.55) {
        const wa = S * 0.55;
        agregar({ tipo: tipo(), x: lado === "izq" ? x + w * 0.55 : x - wa * 0.1, y: y + h * 0.5, w: wa, h: h * 0.62, atras: true });
      }
      agregar({ tipo: tipo(), x, y: y + h, w, h });
      y += h - 3;
    }
  }

  // La base: casas y portones de punta a punta. El hueco del medio es la
  // casa del invitado, que aparece cuando confirma.
  const piso = H - 8;
  const anchoTu = S * 0.95;
  const tuX = (W - anchoTu) / 2;
  let x = 6;
  let i = 0;
  while (x < W - S * 0.6) {
    if (x + S * 0.6 > tuX && x < tuX + anchoTu) {
      x = tuX + anchoTu + 2;
      continue;
    }
    const w = Math.min(S * (0.86 + r() * 0.34), (x < tuX ? tuX - 2 : W - 6) - x);
    if (w < S * 0.45) {
      x += w + 2;
      continue;
    }
    const h = S * (0.72 + r() * 0.3);
    agregar({ tipo: i % 3 === 1 ? "portal" : tipo(), x, y: piso, w, h });
    x += w + 1;
    i++;
  }

  // Unos cipreses entre las casas de la base, para romper la fila.
  for (let c = 0; c < 3; c++) {
    const cxp = S * 0.4 + r() * (W - S * 0.8);
    if (Math.abs(cxp - W / 2) < anchoTu * 0.75) continue;
    agregar({ tipo: "cipres", x: cxp - S * 0.16, y: piso, w: S * 0.32, h: S * (0.85 + r() * 0.35) });
  }

  const atras = piezas.filter((p) => p.atras);
  const adelante = piezas.filter((p) => !p.atras).sort((a, b) => a.y - b.y);
  return {
    piezas: [...atras, ...adelante],
    tu: { x: tuX, y: piso, w: anchoTu, h: S * 0.9 },
    texto: { cx, cy, r: adentro - 16 },
  };
}

/** El texto en arco va de 145° a 35°: arriba, lejos de los hombros del arco. */
const ABRE = (35 * Math.PI) / 180;

/** S, el ancho de un costado, sale del ancho de la tarjeta. Igual que --cd-s en ciudad.css. */
export const costado = (ancho: number) => Math.min(72, Math.max(50, ancho * 0.17));

export function Ciudad({ agradecimiento, invitado }: { agradecimiento: string; invitado: string | null }) {
  const svg = useRef<SVGSVGElement>(null);
  const [medida, setMedida] = useState({ ancho: 0, alto: 0 });

  useEffect(() => {
    const tarjeta = svg.current?.parentElement;
    if (!tarjeta) return;
    const medir = () => setMedida({ ancho: tarjeta.offsetWidth, alto: tarjeta.offsetHeight });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(tarjeta);
    return () => ro.disconnect();
  }, []);

  const { ancho, alto } = medida;
  const S = costado(ancho);
  const ciudad = useMemo(() => (ancho ? armar(ancho, alto, S) : null), [ancho, alto, S]);

  // Las casas se construyen a medida que la tarjeta pasa por la pantalla. Las
  // de la primera pantalla van en orden, como si levantaran la ciudad.
  useEffect(() => {
    const el = svg.current;
    if (!el || !ciudad) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const casas = Array.from(el.querySelectorAll<SVGGElement>(".cd-casa"));
    let primera = true;
    let pendiente = false;

    const pintar = () => {
      pendiente = false;
      const frente = quieto ? Infinity : window.innerHeight * 0.96 - el.getBoundingClientRect().top;
      let orden = 0;
      for (const casa of casas) {
        if (casa.dataset.pie || Number(casa.dataset.y) > frente) continue;
        casa.style.setProperty("--d", `${primera ? 300 + orden * 38 : (orden % 5) * 60}ms`);
        casa.dataset.pie = "true";
        orden++;
      }
      primera = false;
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
  }, [ciudad]);

  return (
    <svg ref={svg} className="cd-ciudad" width={ancho} height={alto} viewBox={`0 0 ${ancho || 1} ${alto || 1}`} aria-hidden="true">
      {ciudad && (
        <>
          <path id="cd-arco-texto" fill="none" d={`M ${f(ciudad.texto.cx - ciudad.texto.r * Math.cos(ABRE))} ${f(ciudad.texto.cy - ciudad.texto.r * Math.sin(ABRE))} A ${f(ciudad.texto.r)} ${f(ciudad.texto.r)} 0 0 1 ${f(ciudad.texto.cx + ciudad.texto.r * Math.cos(ABRE))} ${f(ciudad.texto.cy - ciudad.texto.r * Math.sin(ABRE))}`} />
          {/* La letra se achica si el arco es corto: en 320px no entraría. */}
          <text className="cd-arco-texto" style={{ fontSize: Math.min(12.5, ((Math.PI - 2 * ABRE) * ciudad.texto.r) / (agradecimiento.length * 0.84)) }}>
            <textPath href="#cd-arco-texto" startOffset="50%" textAnchor="middle">
              {agradecimiento.toUpperCase()}
            </textPath>
          </text>

          {ciudad.piezas.map((p) => (
            <g key={p.id} transform={`translate(${f(p.x)} ${f(p.y)})`}>
              <g className={`cd-casa${p.atras ? " cd-casa--atras" : ""}`} data-y={Math.round(p.y - p.h)}>
                <Casa tipo={p.tipo} w={p.w} h={p.h} semilla={p.semilla} />
              </g>
            </g>
          ))}

          {/* Tu casa: un lote vacío hasta que el invitado confirma. */}
          <g transform={`translate(${f(ciudad.tu.x)} ${f(ciudad.tu.y)})`}>
            <path className="cd-lote" d={`M 0 0 L ${f(ciudad.tu.w)} 0`} />
            <g className={`cd-tucasa${invitado ? " cd-tucasa--lista" : ""}`}>
              <Casa tipo="cupula" w={ciudad.tu.w} h={ciudad.tu.h} semilla={99} />
              <path className="cd-mastil" d={`M ${f(ciudad.tu.w * 0.5)} ${f(-ciudad.tu.h + 2)} L ${f(ciudad.tu.w * 0.5)} ${f(-ciudad.tu.h - 30)}`} />
              <path className="cd-bandera" d={`M ${f(ciudad.tu.w * 0.5)} ${f(-ciudad.tu.h - 30)} L ${f(ciudad.tu.w * 0.5 + 74)} ${f(-ciudad.tu.h - 30)} L ${f(ciudad.tu.w * 0.5 + 66)} ${f(-ciudad.tu.h - 21)} L ${f(ciudad.tu.w * 0.5 + 74)} ${f(-ciudad.tu.h - 12)} L ${f(ciudad.tu.w * 0.5)} ${f(-ciudad.tu.h - 12)} Z`} />
              <text className="cd-bandera-texto" x={f(ciudad.tu.w * 0.5 + 33)} y={f(-ciudad.tu.h - 17.5)} textAnchor="middle">
                {invitado ?? ""}
              </text>
            </g>
          </g>
        </>
      )}
    </svg>
  );
}

/** Una casita sola, para separar secciones. */
export function Casita({ tipo = "cupula", semilla = 4 }: { tipo?: Tipo; semilla?: number }) {
  return (
    <svg viewBox="-4 -52 58 56" className="cd-casita" aria-hidden="true">
      <Casa tipo={tipo} w={50} h={48} semilla={semilla} />
    </svg>
  );
}
