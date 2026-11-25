"use client";

import { useEffect, useRef, useState } from "react";
import { calcularFaltante, parsearFecha, type Faltante } from "@/invitaciones/fecha";
import type { InvitacionEscena, Lugar } from "@/invitaciones/tipos";
import { usarVisible } from "../rasgado/abierta";

/**
 * Lo que comparten las invitaciones hechas sobre una referencia (Cupido, Hilo
 * rojo, Dijo que sí, Vinilo, XOXO): la música, el mapa, el calendario, la
 * cuenta y las entradas. Cada estilo pone la piel por variables (--c-*).
 */

export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const dos = (v: number) => String(v).padStart(2, "0");

/** El día del evento corrido `n` días: para las tiras de calendario. */
export function diaVecino(fecha: Date, n: number) {
  const f = new Date(fecha);
  f.setDate(f.getDate() + n);
  return f;
}

/* ── Entradas ──────────────────────────────────────────────── */

export function Escena({ children, className = "", id, margen = "-10%" }: { children: React.ReactNode; className?: string; id?: string; margen?: string }) {
  const [ref, visible] = usarVisible<HTMLElement>(margen);
  return <section ref={ref} id={id} data-visible={visible} className={`cm-escena ${className}`}>{children}</section>;
}

/** Un bloque cualquiera que se entera de que llegó a la pantalla. */
export function Llega({ children, className = "", estilo, margen = "-8%" }: { children?: React.ReactNode; className?: string; estilo?: React.CSSProperties; margen?: string }) {
  const [ref, visible] = usarVisible<HTMLDivElement>(margen);
  return <div ref={ref} data-visible={visible} className={className} style={estilo}>{children}</div>;
}

/** Texto manuscrito que se escribe de izquierda a derecha. */
export function Escrito({ children, as: T = "h2", className = "" }: { children: React.ReactNode; as?: "h1" | "h2" | "p"; className?: string }) {
  const [ref, visible] = usarVisible<HTMLHeadingElement>("-6%");
  return <T ref={ref} data-visible={visible} className={`cm-escrito ${className}`}>{children}</T>;
}

/** Avance del scroll sobre un bloque, de 0 a 1, en la variable --s. */
export function usarAvance<T extends HTMLElement>(alMover?: (s: number) => void) {
  const ref = useRef<T>(null);
  const fn = useRef(alMover);
  useEffect(() => { fn.current = alMover; });

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pedido = 0;
    const medir = () => {
      pedido = 0;
      const r = nodo.getBoundingClientRect();
      if (r.bottom < -innerHeight || r.top > innerHeight * 2) return;
      const s = quieto ? 1 : Math.max(0, Math.min(1, (innerHeight * 0.82 - r.top) / r.height));
      nodo.style.setProperty("--s", s.toFixed(4));
      fn.current?.(s);
    };
    const pedir = () => { pedido ||= requestAnimationFrame(medir); };
    medir();
    addEventListener("scroll", pedir, { passive: true });
    addEventListener("resize", pedir);
    return () => {
      removeEventListener("scroll", pedir);
      removeEventListener("resize", pedir);
      cancelAnimationFrame(pedido);
    };
  }, []);

  return ref;
}

/* ── Música ────────────────────────────────────────────────── */

/** Nace del gesto que abre la invitación: los navegadores no dejan que suene sola. */
export function usarMusica() {
  const audio = useRef<HTMLAudioElement>(null);
  const [suena, setSuena] = useState(false);

  const tocar = () => {
    const a = audio.current;
    if (!a) return;
    a.volume = 0;
    a.play()
      .then(() => {
        const desde = performance.now();
        const subir = () => {
          const v = Math.min(1, (performance.now() - desde) / 2400);
          a.volume = v * 0.75;
          if (v < 1 && !a.paused) requestAnimationFrame(subir);
        };
        subir();
      })
      .catch(() => setSuena(false));
  };
  const alternar = () => (audio.current?.paused === false ? audio.current.pause() : tocar());

  useEffect(() => {
    const alCambiar = () => { if (document.hidden) audio.current?.pause(); };
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  }, []);

  return { audio, suena, setSuena, tocar, alternar };
}

export function Musica({ src, m }: { src?: string; m: ReturnType<typeof usarMusica> }) {
  if (!src) return null;
  return (
    <>
      <audio ref={m.audio} src={src} loop preload="auto" onPlay={() => m.setSuena(true)} onPause={() => m.setSuena(false)} />
      <button type="button" className="cm-musica" data-suena={m.suena} aria-label={m.suena ? "Pausar la música" : "Reproducir la música"} onClick={m.alternar}>
        <span className="cm-musica__barras" aria-hidden="true"><i /><i /><i /><i /></span>
        <svg className="cm-musica__play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
      </button>
    </>
  );
}

/* ── Google Maps ───────────────────────────────────────────── */

const busqueda = (l: Lugar) => {
  try {
    return new URL(l.mapa).searchParams.get("q") ?? `${l.titulo}, ${l.direccion}`;
  } catch {
    return `${l.titulo}, ${l.direccion}`;
  }
};

/**
 * El mapa de Google dentro de la invitación. Se carga recién cuando el invitado
 * se acerca, para no gastarle datos. Debajo, las dos cosas que hace falta tocar.
 */
export function Mapa({ lugar, etiqueta = "Cómo llegar" }: { lugar: Lugar; etiqueta?: string }) {
  const [ref, cerca] = usarVisible<HTMLDivElement>("40%");
  const q = encodeURIComponent(busqueda(lugar));
  return (
    <div className="cm-mapa" ref={ref}>
      <div className="cm-mapa__marco">
        {cerca && (
          <iframe
            title={`Mapa de ${lugar.titulo}`}
            src={`https://maps.google.com/maps?q=${q}&z=16&hl=es&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      <a className="cm-boton cm-boton--mapa" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.4 7-12.2A7 7 0 0 0 5 9.800C5 15.600 12 22 12 22Z" /><circle cx="12" cy="9.800" r="2.600" /></svg>
        {etiqueta}
      </a>
      <a className="cm-enlace" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">Abrir en Google Maps</a>
    </div>
  );
}

/* ── Calendario y cuenta ───────────────────────────────────── */

export function enlaceCalendario(d: InvitacionEscena) {
  const lugar = d.lugares?.[0];
  const [h, m] = (lugar?.hora ?? "20:00").split(":").map(Number);
  const inicio = parsearFecha(d.fecha, h);
  if (!inicio) return null;
  inicio.setMinutes(m || 0);
  const fin = new Date(inicio.getTime() + 9 * 3_600_000);
  const f = (x: Date) => `${x.getFullYear()}${dos(x.getMonth() + 1)}${dos(x.getDate())}T${dos(x.getHours())}${dos(x.getMinutes())}00`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: d.escena.evento,
    dates: `${f(inicio)}/${f(fin)}`,
    location: lugar ? `${lugar.titulo}, ${lugar.direccion}` : "",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function BotonCalendario({ d, children = "Guardar en mi calendario", className = "cm-enlace" }: { d: InvitacionEscena; children?: React.ReactNode; className?: string }) {
  const href = enlaceCalendario(d);
  return href ? <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a> : null;
}

/** Cuánto falta. En el servidor no existe "ahora": arranca en el navegador. */
export function usarFaltante(fecha: string) {
  const [f, setF] = useState<Faltante | null>(null);
  useEffect(() => {
    const medir = () => setF(calcularFaltante(parsearFecha(fecha)));
    const cuadro = requestAnimationFrame(medir);
    const t = setInterval(medir, 1000);
    return () => { cancelAnimationFrame(cuadro); clearInterval(t); };
  }, [fecha]);
  return f;
}

export function Cuenta({ fecha }: { fecha: string }) {
  const f = usarFaltante(fecha);
  const cajas: [string, number | undefined][] = [["días", f?.d], ["horas", f?.h], ["min", f?.m], ["seg", f?.s]];
  return (
    <div className="cm-cuenta" role="timer" aria-label={f ? `Faltan ${f.d} días` : undefined}>
      {cajas.map(([que, v]) => (
        <p key={que} aria-hidden="true"><b><span key={v}>{v ?? "··"}</span></b><i>{que}</i></p>
      ))}
    </div>
  );
}

export function Copiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <p className="cm-dato">
      <span>{etiqueta}</span>
      <strong>{valor}</strong>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(valor);
            navigator.vibrate?.(10);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2200);
          } catch {
            // Sin permiso de portapapeles el dato igual está a la vista.
          }
        }}
      >
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </p>
  );
}

/** Lo que pesa de la tapa en todos los estilos: bloquear el scroll y retirarse. */
export function usarTapa(duracion: number, alAbrir: () => void) {
  const [estado, setEstado] = useState<"cerrada" | "abriendo" | "fuera">("cerrada");
  useEffect(() => {
    if (estado !== "cerrada") return;
    const raiz = document.documentElement;
    const previo = raiz.style.overflow;
    raiz.style.overflow = "hidden";
    return () => { raiz.style.overflow = previo; };
  }, [estado]);
  useEffect(() => {
    if (estado !== "abriendo") return;
    const t = setTimeout(() => setEstado("fuera"), duracion);
    return () => clearTimeout(t);
  }, [estado, duracion]);
  const abrir = () => {
    if (estado !== "cerrada") return;
    setEstado("abriendo");
    navigator.vibrate?.([16, 30, 12]);
    alAbrir();
  };
  return { estado, abrir };
}

/** Arrastre de un solo eje o libre, con el resultado en `alSoltar`. Un toque también vale. */
export function usarArrastre({ alMover, alSoltar }: { alMover: (dx: number, dy: number) => void; alSoltar: (dx: number, dy: number, toque: boolean) => void }) {
  const desde = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      desde.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (desde.current) alMover(e.clientX - desde.current.x, e.clientY - desde.current.y);
    },
    onPointerUp: (e: React.PointerEvent) => {
      const d = desde.current;
      desde.current = null;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      alSoltar(dx, dy, Math.hypot(dx, dy) < 10);
    },
    onPointerCancel: () => { desde.current = null; alSoltar(0, 0, false); },
  };
}

/** Enter o espacio abren lo mismo que el toque. */
export const conTeclado = (fn: () => void) => (e: React.KeyboardEvent) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  fn();
};
