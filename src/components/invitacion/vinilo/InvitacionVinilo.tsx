"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionEscena as Datos } from "@/invitaciones/tipos";
import Formulario from "../comun/Formulario";
import { BotonCalendario, Copiable, Cuenta, Escena, Escrito, Llega, MESES, Mapa, Musica, conTeclado, diaVecino, usarArrastre, usarAvance, usarMusica, usarTapa } from "../comun/piezas";
import type { Personal } from "../personal";
import { Abierta } from "../rasgado/abierta";
import Borde from "../rasgado/Borde";

/**
 * Estilo "Vinilo": granate, polaroids de chicos y un disco. Se baja la púa: el
 * disco gira, suena la música con su fritura y el papel se abre. Adentro, el
 * mismo disco es el botón de música. Criterios: .claude/skills/invitacion-referencias
 */

const CORAZON = "M50 88C22 68 6 50 6 31 6 17 17 8 29 8c9 0 17 5 21 13C54 13 62 8 71 8c12 0 23 9 23 23 0 19-16 37-44 57Z";

function Disco({ gira, etiqueta }: { gira: boolean; etiqueta?: string }) {
  return (
    <span className="vi-disco" data-gira={gira}>
      <span className="vi-disco__surcos" />
      <span className="vi-disco__etiqueta"><svg viewBox="0 0 100 96" aria-hidden="true"><path d={CORAZON} /></svg>{etiqueta && <i>{etiqueta}</i>}</span>
      <span className="vi-disco__luz" />
    </span>
  );
}

/** El brazo del tocadiscos: gira desde su base. */
const Brazo = () => (
  <svg className="vi-brazo" viewBox="0 0 120 260" aria-hidden="true">
    <defs><linearGradient id="vi-metal" x1="0" x2="1"><stop offset="0" stopColor="#8f8a85" /><stop offset=".45" stopColor="#f6f3ee" /><stop offset="1" stopColor="#7d7873" /></linearGradient></defs>
    <circle cx="90" cy="34" r="24" fill="#cfc9c2" /><circle cx="90" cy="34" r="15" fill="url(#vi-metal)" />
    <rect x="82" y="-6" width="16" height="26" rx="4" fill="#a9a39d" />
    <path d="M90 34C92 120 84 160 42 214" fill="none" stroke="url(#vi-metal)" strokeWidth="8" strokeLinecap="round" />
    <path d="M48 204 24 226l8 16 24-20Z" fill="#d9d4cd" stroke="#9a948e" /><path d="M26 238l-3 8" stroke="#555" strokeWidth="2.500" strokeLinecap="round" />
    <circle cx="90" cy="34" r="5" fill="#5f5a56" />
  </svg>
);

function Tocadiscos({ nombres, alAbrir }: { nombres: string; alAbrir: () => void }) {
  const { estado, abrir } = usarTapa(3500, alAbrir);
  const ref = useRef<HTMLDivElement>(null);
  const [gira, setGira] = useState(false);
  const girar = (p: number) => ref.current?.style.setProperty("--pua", p.toFixed(3));
  const bajar = () => { girar(1); setGira(true); abrir(); };

  const arrastre = usarArrastre({
    alMover: (dx, dy) => estado === "cerrada" && girar(Math.max(0, Math.min(1, (-dx + dy) / 150))),
    alSoltar: (dx, dy, toque) => {
      if (estado !== "cerrada") return;
      if (toque || -dx + dy > 60) bajar();
      else girar(0);
    },
  });

  if (estado === "fuera") return null;
  return (
    <div ref={ref} role="button" tabIndex={0} aria-label={`Abrir la invitación de ${nombres}`} className="cm-tapa vi-tapa" data-estado={estado} onKeyDown={conTeclado(bajar)} {...arrastre}>
      <div className="vi-tapa__hoja">
        <p className="vi-tapa__titulo"><b>Una invitación</b><i>muy especial</i></p>
        <div className="vi-plato">
          <Disco gira={gira} />
          <Brazo />
        </div>
        <p className="vi-tapa__nombres">{nombres}</p>
        <p className="cm-tapa__indica">Baja la púa</p>
        <div className="vi-tapa__borde"><Borde semilla={33} lado="arriba" /></div>
      </div>
    </div>
  );
}

const d = (paths: string[], clase: string, vb: string) => (
  <svg className={`cm-trazo vi-dibujo ${clase}`} viewBox={vb} aria-hidden="true">{paths.map((p, i) => <path key={i} d={p} pathLength={1} style={{ "--k": i } as React.CSSProperties} />)}</svg>
);

const DIBUJOS = [
  d(["M30 8 62 14 54 56c-4 14-28 10-26-4ZM26 34c10 6 22 8 32 2M40 62l-6 44M20 104l28 6", "M92 18 64 12 62 54c2 14 26 14 28 0ZM63 36c10 4 18 4 27 0M76 64l2 44M64 110h28", "M50 4l4-8M66 2l2-10M34 2l-2-8"], "vi-dibujo--copas", "0 -10 100 130"),
  d(["M10 60c0-28 22-48 50-48s50 20 50 48-22 48-50 48-50-20-50-48ZM26 60c0-20 14-34 34-34s34 14 34 34-14 34-34 34-34-14-34-34Z", "M40 46l40 28M52 38c16 4 24 12 28 26M40 60c4 12 10 18 20 22", "M128 14v34c0 8 12 8 12 0V14M134 14v96M156 14c-10 8-10 34 0 40v56"], "vi-dibujo--plato", "0 0 170 120"),
  d(["M52 10c0-8 12-8 12 0M44 26c0-10 28-10 28 0v10H44Z", "M38 36h40v28H38ZM28 64h60v34H28ZM16 98h84v36H16ZM8 134h100M58 134v16M36 158c6-10 38-10 44 0", "M38 42c4 8 9 8 13 0 4 8 10 8 14 0 4 8 9 8 13 0M28 72c5 8 10 8 15 0 5 8 10 8 15 0 5 8 10 8 15 0 5 8 10 8 15 0M16 108c6 9 12 9 17 0 6 9 12 9 17 0 5 9 11 9 17 0 6 9 11 9 17 0 5 9 11 9 16 0"], "vi-dibujo--pastel", "0 0 116 166"),
];

/* ── La invitación ─────────────────────────────────────────── */

export default function InvitacionVinilo({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const e = invitacion.escena;
  const [abierta, setAbierta] = useState(false);
  const [verBanco, setVerBanco] = useState(false);
  const [color, setColor] = useState(0);
  const m = usarMusica();
  const dia = usarAvance<HTMLElement>();
  const carrusel = useRef<HTMLDivElement>(null);
  const fecha = parsearFecha(invitacion.fecha);
  const limite = invitacion.cierreRsvp ? parsearFecha(invitacion.cierreRsvp) : null;
  const lugar = invitacion.lugares![0];
  const [uno, otra] = invitacion.nombres.split("&").map((x) => x.trim());
  // La semana del evento, de lunes a domingo.
  const lunes = fecha ? diaVecino(fecha, -((fecha.getDay() + 6) % 7)) : null;
  const pasar = (n: number) => carrusel.current?.scrollBy({ left: n * carrusel.current.clientWidth * 0.6, behavior: "smooth" });
  const foto = (k: string, clase: string, sizes: string, prioridad = false) => (
    <div className={clase}><Image src={e.fotos[k].src} alt={e.fotos[k].alt} fill priority={prioridad} sizes={sizes} style={{ objectFit: "cover", objectPosition: e.fotos[k].foco }} /></div>
  );

  return (
    <Abierta.Provider value={abierta}>
      <main className="inv-columna cm vi" data-abierta={abierta}>
        <Tocadiscos nombres={personal?.saludo ?? invitacion.nombres} alAbrir={() => { setAbierta(true); m.tocar(); }} />
        <Musica src={invitacion.musica} m={m} />

        <div className="vi-cinta" aria-hidden="true"><p>{"¡Estás invitado a nuestra boda!   ".repeat(8)}</p></div>

        {/* ── Portada ── */}
        <Escena className="vi-portada">
          <h1 className="vi-titulo vi-titulo--grande"><span>Nuestra</span><span>invitación</span><Escrito as="p" className="vi-cursiva">más especial</Escrito><span>es para ti</span></h1>
          <p className="cm-texto cm-sube">{invitacion.frase}</p>
          <div className="vi-polas">
            <figure className="vi-pola vi-pola--izq">{foto("el", "vi-pola__foto", "45vw", true)}<figcaption>{uno}</figcaption></figure>
            <figure className="vi-pola vi-pola--der">{foto("ella", "vi-pola__foto", "45vw", true)}<figcaption>{otra}</figcaption></figure>
          </div>
        </Escena>

        {/* ── El disco y la fecha ── */}
        <div className="vi-granate vi-granate--disco">
          <div className="vi-rasgo vi-rasgo--arriba"><Borde semilla={44} lado="arriba" /></div>
          <div className="vi-giradiscos" data-suena={m.suena}>
            <button type="button" onClick={m.alternar} aria-label={m.suena ? "Pausar el disco" : "Poner el disco"}><Disco gira={m.suena} /></button>
            <Brazo />
          </div>
          <Escena className="vi-queridos">
            <h2 className="vi-titulo"><span>Querida familia</span><Escrito as="p" className="vi-cursiva">y amigos</Escrito></h2>
            {personal && <p className="cm-clave">{personal.saludo}</p>}
            {e.intro.map((p) => <p key={p} className="cm-texto cm-sube">{p}</p>)}
            <span className="vi-raya" aria-hidden="true" />
            {fecha && lunes && (
              <div className="vi-semana">
                <p className="vi-semana__mes"><b>{MESES[fecha.getMonth()]}</b><b>{fecha.getFullYear()}</b></p>
                <ol>
                  {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((n, i) => {
                    const f = diaVecino(lunes, i), es = f.getDate() === fecha.getDate();
                    return (
                      <li key={n} className={es ? "vi-es" : ""} style={{ "--i": i } as React.CSSProperties}>
                        <span>{n}</span>
                        <b>{es && <svg viewBox="0 0 100 96" aria-hidden="true"><path d={CORAZON} /></svg>}<i>{f.getDate()}</i></b>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
            <Cuenta fecha={invitacion.fecha} />
            <BotonCalendario d={invitacion} className="cm-enlace" />
          </Escena>
          <div className="vi-rasgo vi-rasgo--abajo"><Borde semilla={52} lado="abajo" /></div>
        </div>

        {/* ── Dónde ── */}
        <Escena className="vi-lugar">
          <h2 className="vi-titulo"><span>El lugar</span><Escrito as="p" className="vi-cursiva">de la fiesta</Escrito></h2>
          <p className="cm-hora cm-sube">{lugar.hora} <small>hs</small></p>
          <p className="cm-clave cm-sube">{lugar.titulo}</p>
          <p className="cm-texto cm-sube">{lugar.direccion}</p>
          <Mapa lugar={lugar} etiqueta="Cómo llegar" />
          <Llega className="vi-pegada"><i aria-hidden="true" />{foto("mesa", "vi-pegada__foto", "(min-width: 30rem) 330px, 70vw")}</Llega>
        </Escena>

        {/* ── El día ── */}
        <div className="vi-granate">
          <div className="vi-rasgo vi-rasgo--arriba"><Borde semilla={63} lado="arriba" /></div>
          <section ref={dia} className="vi-dia">
            <h2 className="vi-titulo"><span>El día</span><Escrito as="p" className="vi-cursiva">paso a paso</Escrito></h2>
            <ol>
              {invitacion.cronograma?.map((h, i) => (
                <li key={h.hora}>
                  <Llega className="vi-hito" margen="-14%">
                    <span className="vi-hito__raya" aria-hidden="true" />
                    <p className="cm-hora cm-sube">{h.hora}</p>
                    <p className="vi-cursiva cm-sube" style={{ "--i": 1 } as React.CSSProperties}>{h.titulo}</p>
                    {h.detalle && <p className="cm-texto cm-sube" style={{ "--i": 2 } as React.CSSProperties}>{h.detalle}</p>}
                    {i > 0 && DIBUJOS[(i - 1) % 3]}
                  </Llega>
                </li>
              ))}
            </ol>
          </section>
          <div className="vi-rasgo vi-rasgo--abajo"><Borde semilla={71} lado="abajo" /></div>
        </div>

        {/* ── Vestimenta ── */}
        <Escena className="vi-ropa">
          <h2 className="vi-titulo"><span>Vestimenta</span><Escrito as="p" className="vi-cursiva">{invitacion.dressCode?.titulo}</Escrito></h2>
          <p className="cm-texto cm-sube">{invitacion.dressCode?.detalle}</p>
          <div className="vi-colores">
            {e.paleta?.map((c, i) => <button key={c.nombre} type="button" aria-label={c.nombre} aria-pressed={i === color} style={{ background: c.color, "--i": i } as React.CSSProperties} onClick={() => setColor(i)} />)}
          </div>
          <p className="vi-colores__nombre" aria-live="polite">{e.paleta?.[color].nombre}</p>
          <div className="vi-muestras">
            {foto("grupo", "vi-muestras__grupo", "70vw")}
            <div>{foto("saten", "vi-muestras__chica", "20vw")}{foto("flores", "vi-muestras__chica", "20vw")}<span className="vi-muestras__chica" style={{ background: e.paleta?.[color].color }} /></div>
          </div>
          <h2 className="vi-titulo vi-titulo--looks"><span>Ideas</span><Escrito as="p" className="vi-cursiva">para inspirarte</Escrito></h2>
          <div className="vi-flechas">
            <button type="button" aria-label="Anterior" onClick={() => pasar(-1)}>←</button><span>Desliza</span><button type="button" aria-label="Siguiente" onClick={() => pasar(1)}>→</button>
          </div>
        </Escena>
        <div ref={carrusel} className="vi-carrusel">{["look1", "look3", "look2", "grupo"].map((k) => <div key={k}>{foto(k, "vi-carrusel__foto", "45vw")}</div>)}</div>

        {/* ── Deseos y regalo ── */}
        <div className="vi-granate vi-granate--deseos">
          <Escena className="vi-deseos">
            <h2 className="vi-titulo"><span>Deseos</span></h2>
            {d(["M60 40c-10-14-30-8-26 8 3 12 18 18 26 26 8-8 23-14 26-26 4-16-16-22-26-8Z", "M32 44C14 30 4 34 2 44c8 0 6 8 14 8-2 8 8 8 18 4M88 44c18-14 28-10 30 0-8 0-6 8-14 8 2 8-8 8-18 4"], "vi-dibujo--alas", "0 20 120 62")}
            {e.notas?.map((n) => <p key={n} className="cm-texto cm-sube">{n}</p>)}
            {invitacion.regalo && (
              <>
                <button type="button" className="cm-boton vi-boton-banco" aria-expanded={verBanco} onClick={() => setVerBanco(!verBanco)}>{verBanco ? "Ocultar datos" : "Ver datos bancarios"}</button>
                <div className="cm-pliegue vi-pliegue" data-abierto={verBanco} inert={!verBanco}><div>
                  <Copiable etiqueta="Alias" valor={invitacion.regalo.alias} />
                  <Copiable etiqueta="Cuenta" valor={invitacion.regalo.cbu} />
                </div></div>
              </>
            )}
          </Escena>
          <div className="vi-rasgo vi-rasgo--abajo"><Borde semilla={85} lado="abajo" /></div>
        </div>

        <Escena className="vi-rsvp" id="confirmar">
          <h2 className="vi-titulo"><span>¿Bailamos</span><Escrito as="p" className="vi-cursiva">juntos?</Escrito></h2>
          {limite && <p className="cm-texto">Responde antes del <b className="vi-limite">{limite.getDate()} de {MESES[limite.getMonth()].toLowerCase()}</b></p>}
          <Formulario
            datos={invitacion}
            personal={personal}
            listo={(si, n) => (
              <>
                <div className="vi-single"><Disco gira={si} etiqueta={si ? "¡Sí!" : "…"} /></div>
                <p className="vi-cursiva vi-cursiva--listo">{si ? "¡Esta la bailamos juntos!" : "Te vamos a extrañar"}</p>
                <p className="cm-texto">{si ? (n === 1 ? "Tu lugar está guardado." : `Guardamos ${n} lugares.`) : "Gracias por avisarnos."}</p>
              </>
            )}
          />
        </Escena>
        <Escena className="vi-cierre"><p className="vi-titulo"><span>{e.gracias}</span></p><Escrito as="p" className="vi-cursiva">{invitacion.nombres.replace("&", "y")}</Escrito></Escena>
      </main>
    </Abierta.Provider>
  );
}
