"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionEscena as Datos } from "@/invitaciones/tipos";
import Formulario from "../comun/Formulario";
import { BotonCalendario, Copiable, Cuenta, Escena, Escrito, Llega, MESES, Mapa, Musica, conTeclado, diaVecino, usarArrastre, usarAvance, usarMusica, usarTapa } from "../comun/piezas";
import type { Personal } from "../personal";
import { Abierta } from "../rasgado/abierta";
import Borde from "../rasgado/Borde";
import { Beso, Bola, ICONOS, Pelicula, Tele } from "./Utileria";

/**
 * Estilo "Dijo que sí": un teatro. Se tira del cordón y se abre el telón; baja
 * la bola de espejos, la tele cambia de canal y la cinta de cine se mueve.
 * Criterios: .claude/skills/invitacion-referencias
 */

const CORAZON = "M50 90C20 68 4 48 6 28 8 10 26 4 40 12c6 4 9 8 11 14 4-8 9-14 18-16 16-4 28 8 26 26-2 22-22 40-45 54Z";

function Telon({ titulo, nombres, alAbrir }: { titulo: string; nombres: string; alAbrir: () => void }) {
  const { estado, abrir } = usarTapa(2700, alAbrir);
  const ref = useRef<HTMLDivElement>(null);
  const tirar = (p: number) => ref.current?.style.setProperty("--tiro", p.toFixed(3));
  const soltar = () => { tirar(1); setTimeout(abrir, 180); };

  const arrastre = usarArrastre({
    alMover: (_, dy) => estado === "cerrada" && tirar(Math.max(0, Math.min(1, dy / 120))),
    alSoltar: (_, dy, toque) => {
      if (estado !== "cerrada") return;
      if (toque || dy > 45) soltar();
      else tirar(0);
    },
  });

  if (estado === "fuera") return null;
  return (
    <div ref={ref} role="button" tabIndex={0} aria-label={`Abrir la invitación de ${nombres}`} className="cm-tapa dq-tapa" data-estado={estado} onKeyDown={conTeclado(soltar)} {...arrastre}>
      <span className="dq-pano dq-pano--izq" />
      <span className="dq-pano dq-pano--der" />
      <span className="dq-haz" aria-hidden="true" />
      <div className="dq-tapa__texto">
        <p className="dq-tapa__titulo">{titulo}</p>
        <p className="dq-tapa__nombres">{nombres}</p>
      </div>
      <svg className="dq-cordon" viewBox="0 0 60 420" aria-hidden="true">
        <path d="M30 -200V300" /><path className="dq-cordon__trenza" d="M30 -200V300" />
        <g className="dq-cordon__borla"><circle cx="30" cy="304" r="11" /><path d="M18 314h24l-3 14H21Z" /><path d="M20 328c-5 26-7 44-6 64M25 328c-2 28-3 46-2 68M30 328v70M35 328c2 28 3 46 2 68M40 328c5 26 7 44 6 64" /></g>
      </svg>
      <p className="cm-tapa__indica dq-tapa__indica">Tira del cordón</p>
    </div>
  );
}

/** Los reflejos de la bola, girando por la página. */
function Reflejos() {
  return (
    <span className="dq-reflejos" aria-hidden="true">
      {Array.from({ length: 26 }, (_, i) => <i key={i} style={{ left: `${(i * 61.8) % 100}%`, top: `${(i * 38.2 + 7) % 100}%`, "--t": `${9 + (i % 5) * 2}s`, "--d": `${-(i * 0.9)}s`, "--e": 0.6 + ((i * 7) % 10) / 10 } as React.CSSProperties} />)}
    </span>
  );
}

export default function InvitacionDijoSi({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const e = invitacion.escena;
  const [abierta, setAbierta] = useState(false);
  const [verBanco, setVerBanco] = useState(false);
  const m = usarMusica();
  const programa = usarAvance<HTMLElement>();
  const fecha = parsearFecha(invitacion.fecha);
  const limite = invitacion.cierreRsvp ? parsearFecha(invitacion.cierreRsvp) : null;
  const lugar = invitacion.lugares![0];
  const cuadros = useMemo(() => [1, 2, 3, 4, 5].map((n) => e.fotos[`cuadro${n}`].src), [e.fotos]);

  return (
    <Abierta.Provider value={abierta}>
      <main className="inv-columna cm dq" data-abierta={abierta}>
        <Telon titulo={invitacion.volanta} nombres={personal?.saludo ?? invitacion.nombres} alAbrir={() => { setAbierta(true); m.tocar(); }} />
        <Musica src={invitacion.musica} m={m} />

        {/* ── El escenario ── */}
        <header className="dq-escenario">
          <Reflejos />
          <span className="dq-lado dq-lado--izq" aria-hidden="true"><i /></span>
          <span className="dq-lado dq-lado--der" aria-hidden="true"><i /></span>
          <div className="dq-bola"><Bola /></div>
          <Escrito as="h1" className="dq-si">{invitacion.volanta}</Escrito>
          <p className="dq-nombres">{invitacion.nombres}</p>
          <Tele canales={[e.fotos.tele1, e.fotos.tele2, e.fotos.tele3]} />
        </header>

        {/* ── Invitados y fecha ── */}
        <Escena className="dq-queridos">
          <h2 className="dq-serif dq-rojo cm-sube">¡Queridos invitados!</h2>
          {personal && <p className="cm-clave">{personal.saludo}</p>}
          {e.intro.map((p) => <p key={p} className="cm-texto cm-sube">{p}</p>)}
        </Escena>

        <Escena className="dq-dia">
          <p className="dq-mano cm-sube">Ese día será</p>
          {fecha && (
            <div className="dq-dias">
              {[-2, -1, 0, 1, 2].map((n) =>
                n === 0 ? (
                  <p key={n} className="dq-dias__es">
                    <svg viewBox="0 0 100 96" aria-hidden="true"><defs><filter id="dq-pincel"><feTurbulence type="fractalNoise" baseFrequency="0.05 0.5" numOctaves="2" seed="3" result="r" /><feDisplacementMap in="SourceGraphic" in2="r" scale="7" /></filter></defs><path filter="url(#dq-pincel)" d={CORAZON} /></svg>
                    <b>{fecha.getDate()}</b>
                  </p>
                ) : <p key={n} aria-hidden="true">{diaVecino(fecha, n).getDate()}</p>,
              )}
            </div>
          )}
          {fecha && <p className="cm-clave dq-mes">{MESES[fecha.getMonth()]} {fecha.getFullYear()}</p>}
          <p className="cm-hora">{lugar.hora} <small>hs</small></p>
          <Cuenta fecha={invitacion.fecha} />
          <BotonCalendario d={invitacion} />
        </Escena>

        {/* ── A M O R ── */}
        <div className="dq-amor">
          <div className="dq-kraft">
            <div className="dq-kraft__arriba"><Borde semilla={7} lado="arriba" /></div>
            <Llega className="dq-kraft__letras"><span>A</span><span>R</span></Llega>
            <div className="dq-kraft__abajo"><Borde semilla={19} lado="abajo" /></div>
          </div>
          <Llega className="dq-amor__foto"><Image src={e.fotos.retrato.src} alt={e.fotos.retrato.alt} fill sizes="(min-width: 30rem) 300px, 62vw" style={{ objectFit: "cover", objectPosition: e.fotos.retrato.foco }} /></Llega>
        </div>
        <Escena className="dq-casamos"><Escrito as="p" className="dq-mano dq-mano--grande">Nos casamos</Escrito></Escena>

        {/* ── Te esperamos ── */}
        <Escena className="dq-lugar">
          <span className="dq-luces" aria-hidden="true"><i /><i /></span>
          <h2 className="dq-serif">Te esperamos</h2>
          <div className="dq-lugar__foto"><Image src={e.fotos.lugar.src} alt={e.fotos.lugar.alt} fill sizes="(min-width: 30rem) 380px, 80vw" style={{ objectFit: "cover" }} /></div>
          <p className="cm-hora">{lugar.hora} <small>hs</small></p>
          <p className="cm-clave">{lugar.titulo}</p>
          <p className="dq-lugar__dir">{lugar.direccion}</p>
          <Mapa lugar={lugar} etiqueta="Ver cómo llegar" />
        </Escena>

        {/* ── Programa ── */}
        <section ref={programa} className="dq-programa">
          <Llega className="dq-programa__beso"><Beso /></Llega>
          <h2 className="dq-serif">Programa del día</h2>
          <ol>
            {invitacion.cronograma?.map((h) => (
              <li key={h.hora}>
                <Llega className="dq-hito" margen="-16%">
                  {ICONOS[h.titulo] ?? ICONOS.Fiesta}
                  <p className="cm-hora">{h.hora}</p>
                  <p className="dq-hito__que">{h.titulo}</p>
                  <svg className="dq-hito__corazon" viewBox="0 0 100 96" aria-hidden="true"><path d={CORAZON} /></svg>
                </Llega>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Vestimenta, encaje y cinta ── */}
        <Escena className="dq-ropa">
          <svg className="dq-sobrecito" viewBox="0 0 120 84" aria-hidden="true"><rect x="3" y="3" width="114" height="78" rx="4" fill="#f3e4cb" stroke="#d9c19b" /><path d="M3 5 60 48 117 5M3 79l40-38M117 79 77 41" fill="none" stroke="#c9ae84" strokeWidth="1.500" /><path d={CORAZON} transform="translate(46 30) scale(.28)" fill="#b3131f" /></svg>
          <h2 className="dq-codigo">Código de vestimenta</h2>
          <Escrito as="p" className="dq-etiqueta">{invitacion.dressCode?.titulo}</Escrito>
          <p className="cm-texto cm-sube">{invitacion.dressCode?.detalle}</p>
        </Escena>
        <div className="dq-encaje">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/invitaciones/dijo-que-si/encaje.webp" alt="" width={1000} height={1000} loading="lazy" />
          <Pelicula fotos={cuadros} />
          <p className="dq-sticker">amor de<br />mi vida</p>
        </div>

        {/* ── Detalles ── */}
        <Escena className="dq-detalles">
          <h2 className="dq-serif">Detalles</h2>
          {e.notas?.map((n) => <p key={n} className="cm-texto cm-sube">{n}</p>)}
          {invitacion.regalo && (
            <>
              <button type="button" className="cm-boton dq-boton-banco" aria-expanded={verBanco} onClick={() => setVerBanco(!verBanco)}>{verBanco ? "Ocultar datos" : "Ver datos bancarios"}</button>
              <div className="cm-pliegue dq-pliegue" data-abierto={verBanco} inert={!verBanco}><div>
                <Copiable etiqueta="Alias" valor={invitacion.regalo.alias} />
                <Copiable etiqueta="Cuenta" valor={invitacion.regalo.cbu} />
              </div></div>
            </>
          )}
        </Escena>

        <Escena className="dq-rsvp" id="confirmar">
          <h2 className="dq-serif dq-rojo">¿Dices que sí?</h2>
          {limite && <p className="cm-texto">Responde antes del <b className="dq-limite">{limite.getDate()} de {MESES[limite.getMonth()].toLowerCase()}</b></p>}
          <div className="dq-ficha">
            <Formulario
              datos={invitacion}
              personal={personal}
              listo={(si, n) => (
                <>
                  {si && <Beso className="dq-beso--sello" />}
                  <p className="dq-si dq-si--listo">{si ? "¡Dijiste que sí!" : "Te vamos a extrañar"}</p>
                  <p className="cm-texto">{si ? (n === 1 ? "Tu lugar está reservado." : `Reservamos ${n} lugares.`) : "Gracias por avisarnos."}</p>
                </>
              )}
            />
          </div>
        </Escena>

        <Escena className="dq-cierre"><Escrito as="p" className="dq-mano">{e.gracias}, {invitacion.nombres.replace("&", "y")}</Escrito></Escena>
      </main>
    </Abierta.Provider>
  );
}
