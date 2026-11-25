"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { FotoEscena } from "@/invitaciones/tipos";
import { usarVisible } from "../rasgado/abierta";

/** La utilería del teatro: bola de espejos, tele, cinta de cine y stickers. Objetos, nunca personas. */

/* ── Bola de espejos ───────────────────────────────────────── */

export function Bola() {
  const [ref, visible] = usarVisible<HTMLCanvasElement>("20%");

  useEffect(() => {
    const lienzo = ref.current;
    const ctx = lienzo?.getContext("2d");
    if (!lienzo || !ctx || !visible) return;
    const N = 220, R = N / 2 - 2, filas = 17;
    lienzo.width = lienzo.height = N;
    const azar = (a: number, b: number) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
    let pedido = 0;
    const pintar = (t: number) => {
      ctx.clearRect(0, 0, N, N);
      ctx.fillStyle = "#3a3634";
      ctx.beginPath();
      ctx.arc(N / 2, N / 2, R, 0, 7);
      ctx.fill();
      const giro = t * 0.00034;
      for (let f = 0; f < filas; f++) {
        const l0 = -Math.PI / 2 + (f / filas) * Math.PI, l1 = -Math.PI / 2 + ((f + 1) / filas) * Math.PI;
        const lm = (l0 + l1) / 2, cols = Math.max(4, Math.round(34 * Math.cos(lm)));
        for (let c = 0; c < cols; c++) {
          const a0 = (c / cols) * Math.PI * 2 + giro, a1 = ((c + 0.9) / cols) * Math.PI * 2 + giro, am = (a0 + a1) / 2;
          if (Math.cos(am) < 0.03) continue;
          const x = (a: number, l: number) => N / 2 + R * Math.sin(a) * Math.cos(l), y = (l: number) => N / 2 + R * Math.sin(l);
          const nx = Math.sin(am) * Math.cos(lm), ny = Math.sin(lm);
          const foco = Math.max(0, -nx * 0.5 - ny * 0.65 + Math.cos(am) * Math.cos(lm) * 0.5);
          const brillo = azar(f, c);
          const destello = Math.pow(Math.max(0, Math.sin(am * 5 + brillo * 9 + t * 0.0012)), 14);
          const v = Math.min(255, 62 + foco * 120 + brillo * 46 + destello * 190);
          ctx.fillStyle = `rgb(${v},${v * 0.975},${v * 0.94})`;
          ctx.beginPath();
          ctx.moveTo(x(a0, l0 + 0.012), y(l0 + 0.012));
          ctx.lineTo(x(a1, l0 + 0.012), y(l0 + 0.012));
          ctx.lineTo(x(a1, l1 - 0.012), y(l1 - 0.012));
          ctx.lineTo(x(a0, l1 - 0.012), y(l1 - 0.012));
          ctx.fill();
        }
      }
      pedido = requestAnimationFrame(pintar);
    };
    pintar(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) cancelAnimationFrame(pedido);

    // Fuera de pantalla no se gasta batería.
    const io = new IntersectionObserver(([e]) => { cancelAnimationFrame(pedido); if (e.isIntersecting) pedido = requestAnimationFrame(pintar); });
    io.observe(lienzo);
    return () => { cancelAnimationFrame(pedido); io.disconnect(); };
  }, [visible, ref]);

  return <canvas ref={ref} className="dq-bola__esfera" aria-hidden="true" />;
}

/* ── La tele ───────────────────────────────────────────────── */

export function Tele({ canales }: { canales: FotoEscena[] }) {
  const [ref, visible] = usarVisible<HTMLDivElement>("-25%");
  const [canal, setCanal] = useState(0);
  const [nieve, setNieve] = useState(false);
  const reloj = useRef<ReturnType<typeof setTimeout>>(undefined);

  const zapping = () => {
    setNieve(true);
    navigator.vibrate?.(8);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => { setCanal((c) => (c + 1) % canales.length); setNieve(false); }, 420);
  };
  useEffect(() => () => clearTimeout(reloj.current), []);

  return (
    <div ref={ref} className="dq-tele" data-visible={visible} data-nieve={nieve}>
      <svg className="dq-tele__caja" viewBox="0 0 360 262" aria-hidden="true">
        <defs>
          <linearGradient id="dq-rojo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c1202b" /><stop offset=".12" stopColor="#a3121d" /><stop offset=".8" stopColor="#7d0a14" /><stop offset="1" stopColor="#520509" /></linearGradient>
          <linearGradient id="dq-marco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9d3c8" /><stop offset=".5" stopColor="#8f877c" /><stop offset="1" stopColor="#4b453f" /></linearGradient>
          <radialGradient id="dq-perilla" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#8d8782" /><stop offset=".5" stopColor="#2c2827" /><stop offset="1" stopColor="#0c0a0a" /></radialGradient>
        </defs>
        <path d="M120 30 78 -38M196 30 262 -44" stroke="#6d6761" strokeWidth="3" strokeLinecap="round" /><circle cx="78" cy="-38" r="4" fill="#8d867e" /><circle cx="262" cy="-44" r="4" fill="#8d867e" />
        <path d="M132 32a26 16 0 0 1 52 0Z" fill="#2a2523" />
        <path d="M52 244 40 262h22l8-18ZM290 244l8 18h22l-12-18Z" fill="#2b1512" />
        <rect x="8" y="28" width="344" height="220" rx="20" fill="url(#dq-rojo)" />
        <rect x="8" y="28" width="344" height="220" rx="20" fill="none" stroke="#e2555c" strokeOpacity=".55" strokeWidth="2" />
        <path d="M18 62h324M18 222h324" stroke="#3b0408" strokeOpacity=".25" />
        <rect x="24" y="44" width="236" height="188" rx="30" fill="url(#dq-marco)" />
        <rect x="32" y="51" width="220" height="174" rx="26" fill="#0c0a0a" />
        <rect x="272" y="48" width="66" height="184" rx="10" fill="#2a0609" fillOpacity=".55" />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M280 ${168 + i * 6.4}h50`} stroke="#12080a" strokeWidth="2.6" strokeLinecap="round" />)}
        <circle cx="305" cy="136" r="15" fill="url(#dq-perilla)" /><path d="M305 125v10" stroke="#e8e2d8" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <button type="button" className="dq-tele__pantalla" onClick={zapping} aria-label="Cambiar de canal">
        {canales.map((c, i) => (
          <Image key={c.src} src={c.src} alt={i === canal ? c.alt : ""} fill sizes="(min-width: 30rem) 270px, 58vw" style={{ objectFit: "cover", objectPosition: c.foco, opacity: i === canal ? 1 : 0 }} />
        ))}
        <span className="dq-tele__nieve" /><span className="dq-tele__vidrio" />
      </button>
      <button type="button" className="dq-tele__perilla" onClick={zapping} aria-label="Girar la perilla" style={{ "--vuelta": canal } as React.CSSProperties}>
        <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="url(#dq-perilla)" />{Array.from({ length: 12 }, (_, i) => <path key={i} d="M30 2v5" stroke="#000" strokeOpacity=".5" strokeWidth="2" transform={`rotate(${i * 30} 30 30)`} />)}<path d="M30 8v15" stroke="#f3ede2" strokeWidth="3.500" strokeLinecap="round" /></svg>
      </button>
      <p className="dq-tele__pista">Gira la perilla</p>
    </div>
  );
}

/* ── La cinta de cine ──────────────────────────────────────── */

/** Una tira de película que ondula: se dibuja columna por columna sobre una onda. */
export function Pelicula({ fotos }: { fotos: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const lienzo = ref.current;
    const ctx = lienzo?.getContext("2d");
    if (!lienzo || !ctx) return;
    const ALTO = 150, CUADRO = 190, tira = document.createElement("canvas");
    tira.width = CUADRO * fotos.length;
    tira.height = ALTO;
    const tc = tira.getContext("2d")!;
    let lista = false, pedido = 0, vivo = true;

    Promise.all(fotos.map((src) => new Promise<HTMLImageElement>((ok, mal) => { const im = new window.Image(); im.onload = () => ok(im); im.onerror = mal; im.src = src; })))
      .then((ims) => {
        tc.fillStyle = "#151211";
        tc.fillRect(0, 0, tira.width, ALTO);
        ims.forEach((im, i) => {
          const w = CUADRO - 14, h = ALTO - 46, r = Math.max(w / im.width, h / im.height), sw = w / r, sh = h / r;
          tc.drawImage(im, (im.width - sw) / 2, (im.height - sh) * 0.3, sw, sh, i * CUADRO + 7, 23, w, h);
          tc.fillStyle = "#efeae1";
          for (let k = 0; k < 8; k++) for (const y of [5, ALTO - 17]) { tc.beginPath(); tc.roundRect(i * CUADRO + 6 + k * (CUADRO / 8), y, 13, 12, 3); tc.fill(); }
        });
        lista = true;
      })
      .catch(() => {});

    const medir = () => { const d = Math.min(2, devicePixelRatio || 1); lienzo.width = lienzo.clientWidth * d; lienzo.height = lienzo.clientHeight * d; };
    medir();

    const banda = (corr: number, base: number, amp: number, largo: number, fase: number, esc: number) => {
      const W = lienzo.width, d = W / lienzo.clientWidth, paso = 2;
      for (let x = 0; x < W; x += paso) {
        const u = x / W, ang = u * largo + fase;
        const y = base * lienzo.height + Math.sin(ang) * amp * d, pend = Math.cos(ang);
        const alto = ALTO * esc * d * (0.93 + 0.07 * pend * pend);
        const s = (((x / d / esc + corr) % tira.width) + tira.width) % tira.width;
        ctx.drawImage(tira, s, 0, Math.min(paso / d / esc + 0.6, tira.width - s), ALTO, x, y - alto / 2, paso + 0.6, alto);
        const luz = pend * 0.34;
        ctx.fillStyle = luz > 0 ? `rgba(255,250,240,${luz * 0.55})` : `rgba(0,0,0,${-luz})`;
        ctx.fillRect(x, y - alto / 2, paso, alto);
      }
    };

    const pintar = (t: number) => {
      if (!vivo) return;
      if (lista) {
        ctx.clearRect(0, 0, lienzo.width, lienzo.height);
        const c = scrollY * 0.3 + t * 0.012;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,.28)";
        banda(-c, 0.27, 34, 4.4, 2.2 + t * 0.00012, 0.62);
        banda(c, 0.7, 40, 3.8, 0.4 - t * 0.00012, 0.95);
        ctx.restore();
      }
      pedido = requestAnimationFrame(pintar);
    };
    const io = new IntersectionObserver(([e]) => { cancelAnimationFrame(pedido); if (e.isIntersecting) pedido = requestAnimationFrame(pintar); }, { rootMargin: "120px" });
    io.observe(lienzo);
    addEventListener("resize", medir);
    return () => { vivo = false; cancelAnimationFrame(pedido); io.disconnect(); removeEventListener("resize", medir); };
  }, [fotos]);

  return <canvas ref={ref} className="dq-pelicula" aria-hidden="true" />;
}

/* ── Stickers ──────────────────────────────────────────────── */

export function Beso({ className = "" }: { className?: string }) {
  return (
    <svg className={`dq-beso ${className}`} viewBox="0 0 160 110" aria-hidden="true">
      <defs>
        <filter id="dq-labial" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.045 0.012" numOctaves="3" seed="8" result="n" /><feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 5.1" result="m" /><feComposite in="SourceGraphic" in2="m" operator="in" result="g" /><feDisplacementMap in="g" in2="n" scale="5" /></filter>
      </defs>
      <g filter="url(#dq-labial)" fill="currentColor">
        <path d="M8 50C26 22 48 6 68 18c7 4 17 4 24 0 20-12 42 4 60 32-26-5-46 3-72 3S34 45 8 50Z" />
        <path d="M14 55c24-1 42 6 66 6s42-7 66-6c-14 34-38 47-66 47S28 89 14 55Z" />
      </g>
      <g stroke="#f1ede4" strokeWidth="1.300" strokeLinecap="round" opacity=".75">{[30, 42, 54, 66, 80, 94, 106, 118, 130].map((x, i) => <path key={x} d={`M${x} ${26 + Math.abs(80 - x) * 0.22}q${(i % 3) - 1} 9 ${(x - 80) * 0.04} 18M${x} ${66}q${(x - 80) * 0.05} 8 ${(x - 80) * 0.02} ${24 - Math.abs(80 - x) * 0.25}`} fill="none" />)}</g>
    </svg>
  );
}

const ic = (hijos: React.ReactNode) => <svg className="cm-trazo dq-icono" viewBox="0 0 80 70" aria-hidden="true">{hijos}</svg>;
const t = (d: string, k = 0) => <path key={d} d={d} pathLength={1} style={{ "--k": k } as React.CSSProperties} />;

/** Los dibujos del programa, en el orden en que suelen pasar. */
export const ICONOS: Record<string, React.ReactNode> = {
  Ceremonia: ic([t("M26 26a17 17 0 1 0 .1 0M50 24a17 17 0 1 0 .1 0"), t("M42 16l8-10h12l8 10-14 12ZM42 16h28M50 6l6 10 6-10", 3)]),
  Fotos: ic([t("M10 22h14l6-9h20l6 9h14v38H10Z"), t("M40 28a13 13 0 1 0 .1 0M40 34a7 7 0 1 0 .1 0M58 28h6", 3)]),
  Brindis: ic([t("M20 12l16 4-5 20c-2 7-14 4-12-3ZM25 37l-5 22M12 57l16 4"), t("M60 12 44 16l5 20c2 7 14 4 12-3ZM55 37l5 22M68 57l-16 4", 2), t("M40 3v6M28 2l3 6M52 2l-3 6", 5)]),
  Cena: ic([t("M8 34h64c0 16-12 26-32 26S8 50 8 34ZM28 62h24"), t("M28 26c-5-6 5-8 0-16M40 26c-5-6 5-8 0-16M52 26c-5-6 5-8 0-16", 3)]),
  Pastel: ic([t("M14 40h52v20H14ZM22 26h36v14H22ZM8 62h64"), t("M14 46c6 7 8 7 13 0 5 7 8 7 13 0 5 7 8 7 13 0 5 7 8 7 13 0M30 26V14M40 26V14M50 26V14M30 12c-3-4 0-6 0-8 2 2 3 5 0 8M40 12c-3-4 0-6 0-8 2 2 3 5 0 8M50 12c-3-4 0-6 0-8 2 2 3 5 0 8", 3)]),
  Fiesta: ic([t("M38 8a27 27 0 1 0 .1 0M38 20a15 15 0 1 0 .1 0M38 32a3 3 0 1 0 .1 0"), t("M72 10c2 12-2 18-10 26l-8 4M68 10h8", 3)]),
  Despedida: ic([t("M8 50V40c0-5 4-7 10-8l9-13c2-3 4-4 8-4h14c4 0 6 1 9 4l8 12c6 1 10 3 10 8v11h-8M54 50H27M14 50H8"), t("M20 44a8 8 0 1 0 .1 0M62 44a8 8 0 1 0 .1 0M28 31h30M43 16v15M32 4l3 3-3 4-3-4ZM22 8l2 2", 3)]),
};
