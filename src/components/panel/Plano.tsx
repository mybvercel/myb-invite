"use client";

import { useRef, useState } from "react";
import { caja, choques, encerrar, huella, medidas, tocan } from "@/panel/logica";
import type { Elemento, Salon } from "@/panel/tipos";
import { DefsMuebles, Mueble } from "./Muebles";

/**
 * El plano del salón en planta: todo en metros, con piso de baldosas de 1 m
 * (sirven de escala), muros, cotas en los bordes y cada mueble dibujado como
 * se ve desde arriba (ver Muebles.tsx). Que se vean las sillas y los platos es
 * lo que hace que el organizador entienda de un vistazo si una mesa está
 * pegada a la pista.
 */

type Props = {
  salon: Salon;
  ocupacion?: Map<string, number>;
  /** Uno o varios elementos elegidos. */
  seleccion?: string | null | Set<string>;
  /** `sumar`: con Shift o Ctrl, el elemento se agrega o se saca de la selección. */
  onSeleccionar?: (id: string | null, sumar?: boolean) => void;
  /** Recuadro de selección arrastrando sobre el piso (mouse). */
  onSeleccionarVarios?: (ids: string[], sumar: boolean) => void;
  onMover?: (e: Elemento) => void;
  /** Mover varios a la vez: se arrastra uno y lo siguen los demás elegidos. */
  onMoverVarios?: (els: Elemento[]) => void;
  soloLectura?: boolean;
};

/** Lo que entra escrito adentro de una mesa: el número, "Principal" o el apellido. */
function rotuloMesa(e: Elemento) {
  if (e.principal) return "Principal";
  const numero = e.nombre.match(/\d+/)?.[0];
  if (numero) return numero;
  const ultima = e.nombre.trim().split(/\s+/).at(-1) ?? "";
  return ultima.length > 9 ? ultima.slice(0, 8) + "." : ultima;
}

const fmt = (n: number) => n.toFixed(n % 1 ? 2 : 0).replace(".", ",");

export function Plano({ salon, ocupacion, seleccion, onSeleccionar, onSeleccionarVarios, onMover, onMoverVarios, soloLectura }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const arrastre = useRef<{ x: number; y: number; origen: Elemento[] } | null>(null);
  const recuadroInicio = useRef<{ x: number; y: number; sumar: boolean } | null>(null);
  const [recuadro, setRecuadro] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);

  const elegidos = seleccion instanceof Set ? seleccion : new Set(seleccion ? [seleccion] : []);

  const enChoque = new Set(choques(salon).flat().map((e) => e.id));
  const M = 1.4; // margen para las cotas

  const punto = (ev: React.PointerEvent) => {
    const s = svg.current!;
    const p = s.createSVGPoint();
    p.x = ev.clientX;
    p.y = ev.clientY;
    return p.matrixTransform(s.getScreenCTM()!.inverse());
  };

  const bajar = (ev: React.PointerEvent, e: Elemento) => {
    if (soloLectura) return;
    ev.stopPropagation();
    const sumar = ev.shiftKey || ev.ctrlKey || ev.metaKey;
    if (sumar) {
      onSeleccionar?.(e.id, true);
      return;
    }
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
    const p = punto(ev);
    // Si ya estaba entre varios elegidos, se arrastra el grupo entero.
    const grupo = elegidos.has(e.id) && elegidos.size > 1 && onMoverVarios ? salon.elementos.filter((x) => elegidos.has(x.id)) : [e];
    arrastre.current = { x: p.x, y: p.y, origen: grupo.map((x) => ({ ...x })) };
    if (!elegidos.has(e.id) || grupo.length === 1) onSeleccionar?.(e.id);
  };

  const bajarPiso = (ev: React.PointerEvent) => {
    if (soloLectura) return;
    const sumar = ev.shiftKey || ev.ctrlKey || ev.metaKey;
    // El recuadro sólo con mouse: con el dedo, arrastrar el piso es scrollear.
    if (onSeleccionarVarios && ev.pointerType === "mouse" && ev.button === 0) {
      const p = punto(ev);
      recuadroInicio.current = { x: p.x, y: p.y, sumar };
      (ev.currentTarget as Element).setPointerCapture?.(ev.pointerId);
    }
    if (!sumar) onSeleccionar?.(null);
  };

  const mover = (ev: React.PointerEvent) => {
    const r = recuadroInicio.current;
    if (r) {
      const p = punto(ev);
      setRecuadro({ x0: Math.min(r.x, p.x), y0: Math.min(r.y, p.y), x1: Math.max(r.x, p.x), y1: Math.max(r.y, p.y) });
      return;
    }
    const a = arrastre.current;
    if (!a) return;
    const p = punto(ev);
    let dx = p.x - a.x;
    let dy = p.y - a.y;
    // El grupo se frena entero contra la pared: nadie queda afuera.
    for (const o of a.origen) {
      const q = encerrar({ ...o, x: o.x + dx, y: o.y + dy }, salon);
      if (Math.abs(q.x - (o.x + dx)) > 0.13) dx = q.x - o.x;
      if (Math.abs(q.y - (o.y + dy)) > 0.13) dy = q.y - o.y;
    }
    const movidos = a.origen.map((o) => encerrar({ ...o, x: o.x + dx, y: o.y + dy }, salon));
    const actual = salon.elementos.find((x) => x.id === movidos[0].id);
    if (actual && actual.x === movidos[0].x && actual.y === movidos[0].y) return;
    if (movidos.length > 1) onMoverVarios?.(movidos);
    else onMover?.(movidos[0]);
  };

  const soltar = () => {
    arrastre.current = null;
    const r = recuadroInicio.current;
    recuadroInicio.current = null;
    if (r && recuadro && (recuadro.x1 - recuadro.x0 > 0.3 || recuadro.y1 - recuadro.y0 > 0.3)) {
      const ids = salon.elementos.filter((e) => tocan(caja(e), recuadro)).map((e) => e.id);
      onSeleccionarVarios?.(ids, r.sumar);
    }
    setRecuadro(null);
  };

  // Primero las zonas, después las estructuras, arriba las mesas.
  const capas = [...salon.elementos].sort((a, b) => {
    const o = { zona: 0, estructura: 1, mesa: 2 };
    return o[a.tipo] - o[b.tipo];
  });

  return (
    <svg
      ref={svg}
      className={`pnl-plano${soloLectura ? " pnl-plano--lectura" : ""}`}
      viewBox={`${-M} ${-M} ${salon.ancho + M * 2} ${salon.largo + M * 2}`}
      onPointerMove={mover}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      onPointerDown={bajarPiso}
      role="img"
      aria-label={`Plano del salón, ${fmt(salon.ancho)} por ${fmt(salon.largo)} metros`}
    >
      <defs>
        <pattern id="pnl-baldosa" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" className="pnl-plano__baldosa" />
          <path d="M1 0H0V1" className="pnl-plano__junta" />
        </pattern>
        <radialGradient id="pnl-luz" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <DefsMuebles />
      </defs>

      {/* Piso, luz y muros */}
      <rect x="0" y="0" width={salon.ancho} height={salon.largo} fill="url(#pnl-baldosa)" />
      <rect x="0" y="0" width={salon.ancho} height={salon.largo} className="pnl-plano__luz" />
      <rect x={-0.15} y={-0.15} width={salon.ancho + 0.3} height={salon.largo + 0.3} className="pnl-plano__muro" />
      <rect x={0.06} y={0.06} width={Math.max(0, salon.ancho - 0.12)} height={Math.max(0, salon.largo - 0.12)} className="pnl-plano__zocalo" />

      {/* Cotas */}
      <g className="pnl-plano__cota">
        <line x1="0" y1={-0.75} x2={salon.ancho} y2={-0.75} />
        <line x1="0" y1={-1} x2="0" y2={-0.5} />
        <line x1={salon.ancho} y1={-1} x2={salon.ancho} y2={-0.5} />
        <text x={salon.ancho / 2} y={-0.95} textAnchor="middle">{fmt(salon.ancho)} m</text>
        <line x1={-0.75} y1="0" x2={-0.75} y2={salon.largo} />
        <line x1={-1} y1="0" x2={-0.5} y2="0" />
        <line x1={-1} y1={salon.largo} x2={-0.5} y2={salon.largo} />
        <text x={-0.95} y={salon.largo / 2} textAnchor="middle" transform={`rotate(-90 ${-0.95} ${salon.largo / 2})`}>
          {fmt(salon.largo)} m
        </text>
      </g>

      {capas.map((e) => {
        const sel = elegidos.has(e.id);
        const choca = enChoque.has(e.id);
        const { w, h } = medidas(e);
        const n = ocupacion?.get(e.id) ?? 0;
        const lleno = e.tipo === "mesa" && n >= (e.capacidad ?? 0) && n > 0;
        const pasado = e.tipo === "mesa" && n > (e.capacidad ?? 0);

        const clases = [
          "pnl-plano__el",
          `pnl-plano__el--${e.tipo}`,
          `pnl-plano__el--${e.clase}`,
          sel && "es-sel",
          choca && "es-choque",
          lleno && "es-lleno",
          e.principal && "es-principal",
          pasado && "es-pasado",
        ]
          .filter(Boolean)
          .join(" ");

        // El rótulo entra en el ancho del mueble: se achica si el nombre es largo.
        const texto = Math.min(0.4, Math.max(0.2, Math.min(w, h) * 0.26), (w * 0.9) / (Math.max(4, e.nombre.length) * 0.62));
        const hu = e.tipo === "zona" ? caja(e) : huella(e);

        // Hacia dónde queda el salón, en las coordenadas del mueble sin girar.
        const wx = salon.ancho / 2 - e.x;
        const wy = salon.largo / 2 - e.y;
        const frente = e.giro ? { x: wy, y: -wx } : { x: wx, y: wy };

        const redonda = e.clase === "redonda";
        const numero = Math.min(0.26, Math.max(0.16, Math.min(w, h) * 0.2));
        const largoEnX = w >= h;

        return (
          <g
            key={e.id}
            className={clases}
            transform={`translate(${e.x} ${e.y})`}
            onPointerDown={(ev) => bajar(ev, e)}
            tabIndex={soloLectura ? undefined : 0}
            role={soloLectura ? undefined : "button"}
            aria-label={soloLectura ? undefined : `${e.nombre}${e.tipo === "mesa" ? `, ${n} de ${e.capacidad}` : ""}`}
            onFocus={(ev) => !soloLectura && ev.currentTarget.matches(":focus-visible") && !elegidos.has(e.id) && onSeleccionar?.(e.id)}
          >
            {/* Área para agarrarlo: incluye las sillas. */}
            <rect x={hu.x0 - e.x} y={hu.y0 - e.y} width={hu.x1 - hu.x0} height={hu.y1 - hu.y0} className="pnl-plano__area" />

            <g transform={e.giro ? "rotate(90)" : undefined}>
              <Mueble e={e} n={n} frente={frente} />
            </g>

            {(sel || choca || pasado) && (
              <rect
                x={hu.x0 - e.x - 0.12}
                y={hu.y0 - e.y - 0.12}
                width={hu.x1 - hu.x0 + 0.24}
                height={hu.y1 - hu.y0 + 0.24}
                rx={0.12}
                className="pnl-plano__marca"
              />
            )}

            {e.tipo === "mesa" && (
              <>
                <text className="pnl-plano__numero pnl-plano__halo" textAnchor="middle" dominantBaseline="central" fontSize={rotuloMesa(e).length > 3 ? numero * 0.72 : numero}>
                  {rotuloMesa(e)}
                </text>
                <text
                  className="pnl-plano__dato pnl-plano__halo"
                  textAnchor="middle"
                  dominantBaseline="central"
                  x={redonda ? 0 : largoEnX ? Math.min(1.1, w / 2 - 0.3) : 0}
                  y={redonda ? Math.min(0.38, w * 0.25) : largoEnX ? 0 : Math.min(1.1, h / 2 - 0.3)}
                  fontSize={numero * 0.72}
                >
                  {n}/{e.capacidad}
                </text>
              </>
            )}
            {e.tipo === "estructura" && e.clase !== "columna" && e.clase !== "alfombra" && (
              <text className={`pnl-plano__nombre pnl-plano__halo${e.clase === "pista" || e.clase === "dj" ? " es-claro" : ""}`} textAnchor="middle" dominantBaseline="central" fontSize={texto}>
                {e.nombre}
              </text>
            )}
            {e.tipo === "zona" && (
              <text className="pnl-plano__nombre pnl-plano__halo" x={-w / 2 + 0.35} y={-h / 2 + 0.55} fontSize={0.36}>
                {e.nombre} <tspan className="pnl-plano__dato">{fmt(Math.round(e.ancho * e.largo))} m²</tspan>
              </text>
            )}
          </g>
        );
      })}

      {recuadro && (
        <rect x={recuadro.x0} y={recuadro.y0} width={recuadro.x1 - recuadro.x0} height={recuadro.y1 - recuadro.y0} className="pnl-plano__recuadro" />
      )}
    </svg>
  );
}
