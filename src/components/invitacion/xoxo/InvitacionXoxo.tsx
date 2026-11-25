"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { parsearFecha } from "@/invitaciones/fecha";
import type { FotoEscena, InvitacionEscena as Datos } from "@/invitaciones/tipos";
import Formulario from "../comun/Formulario";
import Renglones from "../comun/Renglones";
import { BotonCalendario, Copiable, Cuenta, DIAS, Escena, Escrito, Llega, MESES, Mapa, Musica, conTeclado, diaVecino, usarArrastre, usarMusica, usarTapa } from "../comun/piezas";
import type { Personal } from "../personal";
import { Abierta } from "../rasgado/abierta";
import Borde from "../rasgado/Borde";

/**
 * Estilo "XOXO": rojo, pincel y parches bordados. Para entrar se despega el
 * corazón: los hilos se estiran y se cortan, y el hueco del corazón se agranda
 * hasta ser la invitación. Criterios: .claude/skills/invitacion-referencias
 */

const PARCHE = "/invitaciones/xoxo/corazon.webp";
const Parche = ({ className = "" }: { className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img className={`xo-parche ${className}`} src={PARCHE} alt="" width={520} height={520} draggable={false} />
);

/* ── La entrada ────────────────────────────────────────────── */

const PUNTADAS = [[22, 24], [50, 30], [78, 24], [92, 44], [80, 66], [50, 92], [20, 66], [8, 44]];

function Despega({ nombres, fecha, alAbrir }: { nombres: string; fecha: string; alAbrir: () => void }) {
  const { estado, abrir } = usarTapa(2300, alAbrir);
  const ref = useRef<HTMLDivElement>(null);
  const hilos = useRef<SVGSVGElement>(null);

  const mover = (dx: number, dy: number) => {
    const n = ref.current;
    if (!n) return;
    n.style.setProperty("--x", `${dx}px`);
    n.style.setProperty("--y", `${dy}px`);
    const lado = hilos.current?.clientWidth || 260;
    hilos.current?.querySelectorAll("line").forEach((l, i) => {
      l.setAttribute("x2", String(PUNTADAS[i][0] + (dx / lado) * 100));
      l.setAttribute("y2", String(PUNTADAS[i][1] + (dy / lado) * 100));
      // Cada hilo aguanta distinto antes de cortarse.
      l.style.opacity = Math.hypot(dx, dy) > 46 + i * 9 ? "0" : "1";
    });
  };
  const soltar = (dx = 70, dy = -50) => { mover(dx, dy); setTimeout(abrir, 220); };

  const arrastre = usarArrastre({
    alMover: (dx, dy) => estado === "cerrada" && mover(dx, dy),
    alSoltar: (dx, dy, toque) => {
      if (estado !== "cerrada") return;
      if (toque) soltar();
      else if (Math.hypot(dx, dy) > 70) abrir();
      else mover(0, 0);
    },
  });

  if (estado === "fuera") return null;
  return (
    <div ref={ref} role="button" tabIndex={0} aria-label={`Abrir la invitación de ${nombres}`} className="cm-tapa xo-tapa" data-estado={estado} onKeyDown={conTeclado(() => soltar())} {...arrastre}>
      <div className="xo-tapa__rojo">
        <div className="xo-tapa__love" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <p key={i}>{"love ".repeat(7)}</p>)}</div>
        <p className="xo-tapa__nombres">{nombres}</p>
        <p className="xo-tapa__fecha">{fecha}</p>
        <p className="cm-tapa__indica xo-tapa__indica">Despega el corazón</p>
      </div>
      <div className="xo-tapa__lugar">
        <span className="xo-tapa__huella" />
        <svg ref={hilos} className="xo-tapa__hilos" viewBox="0 0 100 100" aria-hidden="true">{PUNTADAS.map(([x, y]) => <line key={`${x}-${y}`} x1={x} y1={y} x2={x} y2={y} />)}</svg>
        <Parche className="xo-tapa__parche" />
      </div>
    </div>
  );
}

/** El garabato que rodea la fecha: varias vueltas de lápiz. */
const Garabato = () => (
  <svg className="xo-garabato" viewBox="0 0 300 130" preserveAspectRatio="none" aria-hidden="true">
    {["M36 70C26 30 96 10 160 12c70 2 124 24 120 58-4 36-70 50-136 48C80 116 20 100 22 66c2-36 70-52 134-50", "M28 78C18 44 80 16 150 18c66 2 122 18 126 48 2 34-62 46-124 46C92 112 30 104 26 72", "M60 22c60-18 190-10 216 36 14 34-46 60-130 58C86 116 24 106 18 78 14 58 44 34 90 26"].map((d, i) => (
      <path key={d} d={d} pathLength={1} vectorEffect="non-scaling-stroke" style={{ "--k": i } as React.CSSProperties} />
    ))}
  </svg>
);

/* ── Las polaroids apiladas ────────────────────────────────── */

function Pila({ fotos }: { fotos: FotoEscena[] }) {
  const [orden, setOrden] = useState(() => fotos.map((_, i) => i));
  const [sale, setSale] = useState<0 | 1 | -1>(0);
  const ref = useRef<HTMLDivElement>(null);

  const pasar = (lado: 1 | -1) => {
    setSale(lado);
    navigator.vibrate?.(8);
    setTimeout(() => {
      setOrden(([a, ...r]) => [...r, a]);
      setSale(0);
      ref.current?.style.setProperty("--dx", "0px");
    }, 320);
  };
  const arrastre = usarArrastre({
    alMover: (dx) => ref.current?.style.setProperty("--dx", `${dx}px`),
    alSoltar: (dx, _, toque) => {
      if (toque || Math.abs(dx) > 50) pasar(dx < 0 ? -1 : 1);
      else ref.current?.style.setProperty("--dx", "0px");
    },
  });

  return (
    <div ref={ref} className="xo-pila" data-sale={sale} role="button" tabIndex={0} aria-label="Pasar a la foto siguiente" onKeyDown={conTeclado(() => pasar(1))} {...arrastre}>
      {orden.map((f, i) => (
        <div key={f} className="xo-pola" style={{ "--n": i } as React.CSSProperties}>
          <div className="xo-pola__foto"><Image src={fotos[f].src} alt={i === 0 ? fotos[f].alt : ""} fill sizes="240px" style={{ objectFit: "cover", objectPosition: fotos[f].foco }} draggable={false} /></div>
          {i < 2 && <svg className="xo-clip" viewBox="0 0 24 54" aria-hidden="true"><path d="M7 18v22a6 6 0 0 0 12 0V11a9 9 0 0 0-17 0v26" /></svg>}
        </div>
      ))}
    </div>
  );
}

/* ── Los imanes ────────────────────────────────────────────── */

// Dónde cae cada palabra para que entre todas formen un corazón.
const LUGARES: [number, number, number][] = [
  [20, 5, -9], [72, 4, 4], [11, 19, -2], [38, 17, -13], [66, 18, 1], [91, 17, 3], [13, 36, -4], [36, 35, 2], [58, 34, -2],
  [84, 33, -4], [26, 51, 3], [46, 50, 0], [63, 49, -5], [85, 47, 3], [34, 64, -3], [58, 63, 2], [46, 76, -4], [53, 89, -16],
];

function Iman({ texto, i }: { texto: string; i: number }) {
  const [x, y, giro] = LUGARES[i % LUGARES.length];
  const ref = useRef<HTMLButtonElement>(null);
  const base = useRef({ x: 0, y: 0 });
  const poner = (dx: number, dy: number) => {
    ref.current?.style.setProperty("--mx", `${base.current.x + dx}px`);
    ref.current?.style.setProperty("--my", `${base.current.y + dy}px`);
  };
  const arrastre = usarArrastre({
    alMover: (dx, dy) => { ref.current?.setAttribute("data-agarrado", ""); poner(dx, dy); },
    alSoltar: (dx, dy) => {
      ref.current?.removeAttribute("data-agarrado");
      base.current = { x: base.current.x + dx, y: base.current.y + dy };
    },
  });
  return (
    <button ref={ref} type="button" className={`xo-iman ${texto === "♥" ? "xo-iman--corazon" : ""}`} style={{ left: `${x}%`, top: `${y}%`, "--g": `${giro}deg`, "--i": i } as React.CSSProperties} {...arrastre}>
      {texto}
    </button>
  );
}

/* ── La invitación ─────────────────────────────────────────── */

export default function InvitacionXoxo({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const e = invitacion.escena;
  const [abierta, setAbierta] = useState(false);
  const [verBanco, setVerBanco] = useState(false);
  const m = usarMusica();
  const fecha = parsearFecha(invitacion.fecha);
  const limite = invitacion.cierreRsvp ? parsearFecha(invitacion.cierreRsvp) : null;
  const lugar = invitacion.lugares![0];

  return (
    <Abierta.Provider value={abierta}>
      <main className="inv-columna cm xo" data-abierta={abierta}>
        <Despega nombres={personal?.saludo ?? invitacion.nombres} fecha={invitacion.fecha.toLowerCase().replace(/ (\d{4})$/, " de $1")} alAbrir={() => { setAbierta(true); m.tocar(); }} />
        <Musica src={invitacion.musica} m={m} />

        {/* ── Portada ── */}
        <header className="xo-portada">
          <div className="xo-portada__foto"><Image src={e.fotos.portada.src} alt={e.fotos.portada.alt} fill priority sizes="(min-width: 30rem) 480px, 100vw" style={{ objectFit: "cover", objectPosition: e.fotos.portada.foco }} /></div>
          <Escrito as="h1" className="xo-pincel xo-portada__titulo">Nos casamos</Escrito>
          <div className="xo-portada__rasgo"><Borde semilla={29} lado="abajo" /></div>
        </header>
        <div className="xo-rojo xo-saludo">
          <Llega className="xo-tarjeta">
            <p className="xo-tarjeta__arriba"><b>{lugar.hora} hs</b><b>{fecha ? `${fecha.getDate()} de ${MESES[fecha.getMonth()].toLowerCase()}` : invitacion.fecha}</b></p>
            {personal && <p className="xo-tarjeta__para">{personal.saludo}</p>}
            {e.intro.map((p, i) => <p key={p} className={i === 0 ? "xo-tarjeta__grande" : "xo-tarjeta__texto"}>{p}</p>)}
            <p className="xo-tarjeta__firma">Con amor,<br />{invitacion.nombres.replace("&", "y")}</p>
          </Llega>
          <Llega className="xo-saludo__parche"><Parche /></Llega>
          <Escrito as="p" className="xo-pincel xo-xoxo">XOXO</Escrito>
        </div>

        {/* ── La fecha ── */}
        <Escena className="xo-fecha">
          <Escrito className="xo-pluma">Te esperamos en {fecha ? MESES[fecha.getMonth()].toLowerCase() : ""}</Escrito>
          <p className="xo-anota cm-sube">Anótalo: <b>{fecha?.getDate()} a las {lugar.hora}</b></p>
          {fecha && (
            <div className="xo-tira">
              {[-1, 0, 1].map((n) => {
                const f = diaVecino(fecha, n);
                return <div key={n} className={n === 0 ? "xo-es" : ""} aria-hidden={n !== 0}><p>{DIAS[f.getDay()]}</p><b>{f.getDate()}</b></div>;
              })}
              <Garabato />
            </div>
          )}
          <Cuenta fecha={invitacion.fecha} />
          <BotonCalendario d={invitacion} />
          {limite && <p className="cm-texto">Confirma tu asistencia antes del <b className="xo-limite">{limite.getDate()} de {MESES[limite.getMonth()].toLowerCase()}</b></p>}
          <a className="cm-boton xo-ir" href="#confirmar">Confirmar asistencia</a>
        </Escena>

        {/* ── Sin código de vestimenta ── */}
        <div className="xo-rojo xo-love">
          <Renglones texto="love" filas={6} />
          <p className="xo-love__texto">{e.notas?.[0]}</p>
          <Pila fotos={[e.fotos.piso, e.fotos.cerca, e.fotos.sofa]} />
          <Llega className="xo-love__parche"><Parche /></Llega>
        </div>

        {/* ── Dónde ── */}
        <section className="xo-lugar">
          <div className="xo-lugar__fondo"><Image src={e.fotos.fondo.src} alt={e.fotos.fondo.alt} fill sizes="(min-width: 30rem) 480px, 100vw" style={{ objectFit: "cover", objectPosition: e.fotos.fondo.foco }} /></div>
          <Llega className="xo-carton" />
          <Llega className="xo-pola xo-pola--pegada">
            <i className="xo-cinta" aria-hidden="true" />
            <div className="xo-pola__foto"><Image src={e.fotos.piso.src} alt="" fill sizes="200px" style={{ objectFit: "cover", objectPosition: e.fotos.piso.foco }} /></div>
          </Llega>
          <Llega className="xo-cuaderno">
            <p className="xo-cuaderno__que">La fiesta será en</p>
            <p className="cm-clave">{lugar.titulo}</p>
            <p className="cm-hora">{lugar.hora} <small>hs</small></p>
            <p className="xo-cuaderno__dir">{lugar.direccion}</p>
          </Llega>
          <div className="xo-lugar__mapa"><Mapa lugar={lugar} /></div>
        </section>

        {/* ── Qué vamos a hacer ── */}
        <div className="xo-rojo xo-hacer">
          <Escena className="xo-hacer__escena">
            <Escrito className="xo-pluma xo-pluma--clara">Qué vamos a hacer</Escrito>
            <div className="xo-imanes">{e.palabras?.map((p, i) => <Iman key={`${p}${i}`} texto={p} i={i} />)}</div>
            <p className="xo-pista">Mueve las palabras</p>
            <p className="xo-enserio">En serio:</p>
            <ol className="xo-horas">{invitacion.cronograma?.map((h, i) => <li key={h.hora} style={{ "--i": i } as React.CSSProperties}><b>{h.hora}</b><span>{h.titulo}</span></li>)}</ol>
          </Escena>
        </div>

        {/* ── Regalo y confirmación ── */}
        <Escena className="xo-rsvp" id="confirmar">
          <Escrito className="xo-pluma">¿Te sumas?</Escrito>
          <Formulario
            datos={invitacion}
            personal={personal}
            listo={(si, n) => (
              <>
                <div className="xo-listo">{si && Array.from({ length: 10 }, (_, i) => <Parche key={i} className="xo-vuela" />)}<Parche className="xo-listo__grande" /></div>
                <p className="xo-pincel xo-pincel--rojo">{si ? "¡XOXO!" : "Te vamos a extrañar"}</p>
                <p className="cm-texto">{si ? (n === 1 ? "Tu lugar está guardado." : `Guardamos ${n} lugares.`) : "Gracias por avisarnos."}</p>
              </>
            )}
          />
          {invitacion.regalo && (
            <div className="xo-regalo">
              <p className="cm-texto">Si quieres hacernos un regalo:</p>
              <button type="button" className="cm-boton xo-boton-banco" aria-expanded={verBanco} onClick={() => setVerBanco(!verBanco)}>{verBanco ? "Ocultar datos" : "Ver datos bancarios"}</button>
              <div className="cm-pliegue xo-pliegue" data-abierto={verBanco} inert={!verBanco}><div>
                <Copiable etiqueta="Alias" valor={invitacion.regalo.alias} />
                <Copiable etiqueta="Cuenta" valor={invitacion.regalo.cbu} />
              </div></div>
            </div>
          )}
        </Escena>
        <div className="xo-rojo xo-cierre"><Renglones texto="love" filas={3} /><Llega className="xo-cierre__parche"><Parche /></Llega><p className="xo-pluma xo-pluma--clara xo-cierre__firma">{e.gracias}</p></div>
      </main>
    </Abierta.Provider>
  );
}
