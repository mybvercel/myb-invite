"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionEscena as Datos } from "@/invitaciones/tipos";
import Formulario from "../comun/Formulario";
import Renglones from "../comun/Renglones";
import { BotonCalendario, Cuenta, DIAS, Escena, Escrito, Llega, MESES, Mapa, Musica, conTeclado, diaVecino, usarArrastre, usarAvance, usarMusica, usarTapa } from "../comun/piezas";
import type { Personal } from "../personal";
import { Abierta } from "../rasgado/abierta";

/**
 * Estilo "Hilo rojo": crema, blanco y negro y un hilo que une todo. Para entrar
 * se tira del cabo del moño: se desata y el hilo sigue por toda la invitación.
 * Criterios: .claude/skills/invitacion-referencias
 */

/* Un moño de un solo trazo: empieza arriba, hace los dos lazos y baja al cabo. */
const MONO = "M195 -20C188 60 204 130 195 214C150 130 40 128 48 196C54 250 150 246 195 218C240 190 336 132 344 196C350 256 240 250 197 220C186 250 150 290 138 330C126 372 186 372 210 338C226 314 204 296 198 330C192 372 196 420 195 470";

function Mono({ nombres, fecha, alAbrir }: { nombres: string; fecha: string; alAbrir: () => void }) {
  const { estado, abrir } = usarTapa(2400, alAbrir);
  const ref = useRef<HTMLDivElement>(null);
  const tirar = (p: number) => ref.current?.style.setProperty("--tiro", p.toFixed(3));
  const soltar = () => { tirar(1); abrir(); };

  const arrastre = usarArrastre({
    alMover: (_, dy) => estado === "cerrada" && tirar(Math.max(0, Math.min(0.94, dy / 260))),
    alSoltar: (_, dy, toque) => {
      if (estado !== "cerrada") return;
      if (toque || dy > 80) soltar();
      else tirar(0);
    },
  });

  if (estado === "fuera") return null;
  return (
    <div ref={ref} role="button" tabIndex={0} aria-label={`Abrir la invitación de ${nombres}`} className="cm-tapa hi-tapa" data-estado={estado} onKeyDown={conTeclado(soltar)} {...arrastre}>
      <div className="hi-tapa__papel" />
      <p className="hi-tapa__amar">Amar es…</p>
      <svg className="hi-mono" viewBox="0 0 390 560" aria-hidden="true">
        <path className="hi-mono__sombra" d={MONO} pathLength={1} />
        <path className="hi-mono__hilo" d={MONO} pathLength={1} />
        <path className="hi-mono__brillo" d={MONO} pathLength={1} />
        <g className="hi-mono__cabo">
          <path d="M195 350v144" />
          <path className="hi-mono__corazon" d="M195 536c-15-11-25-20-25-31a13 13 0 0 1 25-6 13 13 0 0 1 25 6c0 11-10 20-25 31Z" />
        </g>
      </svg>
      <div className="hi-tapa__pie">
        <p className="hi-tapa__nombres">{nombres}</p>
        <p className="hi-tapa__fecha">{fecha}</p>
        <p className="cm-tapa__indica">Tira del hilo</p>
      </div>
    </div>
  );
}

/** El hilo que cruza la pantalla y se va trazando con el scroll. */
function Hilo({ d, className = "", alto = 120 }: { d: string; className?: string; alto?: number }) {
  const ref = usarAvance<HTMLDivElement>();
  return (
    <div ref={ref} className={`hi-hilo ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 390 ${alto}`} preserveAspectRatio="none"><path d={d} pathLength={1} /></svg>
    </div>
  );
}

/* ── El sobre ──────────────────────────────────────────────── */

function Sobre({ lineas, nombres }: { lineas: string[]; nombres: string }) {
  return (
    <Llega className="hi-sobre" margen="-22%">
      <svg className="hi-sobre__solapa" viewBox="0 0 320 130" aria-hidden="true"><path d="M0 128 140 12c12-10 28-10 40 0l140 116Z" /></svg>
      <div className="hi-sobre__carta">{lineas.map((l) => <p key={l}>{l}</p>)}</div>
      <svg className="hi-sobre__frente" viewBox="0 0 320 210" aria-hidden="true">
        <path className="hi-sobre__a" d="M0 0 160 112 320 0v206a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4Z" />
        <path className="hi-sobre__b" d="M2 208 136 96M318 208 184 96" />
      </svg>
      <p className="hi-sobre__nombres">{nombres.replace("&", "y")}</p>
    </Llega>
  );
}

/** El círculo de pincel que rodea la fecha: varias pasadas, como a mano. */
function Circulo() {
  return (
    <svg className="hi-circulo" viewBox="0 0 160 200" aria-hidden="true">
      <defs>
        <filter id="hi-cerdas" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.04" numOctaves="2" seed="4" result="r" />
          <feDisplacementMap in="SourceGraphic" in2="r" scale="6" />
        </filter>
      </defs>
      <g filter="url(#hi-cerdas)">
        <path pathLength={1} style={{ "--k": 0 } as React.CSSProperties} strokeWidth="6" d="M112 20C70 2 22 30 16 88c-6 60 30 104 70 100 44-4 66-56 58-106C138 40 112 12 76 14" />
        <path pathLength={1} style={{ "--k": 4 } as React.CSSProperties} strokeWidth="3.500" d="M100 12C56 4 14 44 12 98c-2 56 36 98 78 88 40-10 60-62 50-112-8-36-34-58-60-58" />
        <path pathLength={1} style={{ "--k": 7 } as React.CSSProperties} strokeWidth="2.200" d="M118 30C84 4 30 24 20 82c-8 50 16 100 60 102 44 2 74-48 64-104" />
      </g>
    </svg>
  );
}

/* Cuatro bordes distintos, como rodeados a mano alzada. */
const NUBES = [
  "M20 30C40 4 120 12 190 10c60-2 96 6 94 52-2 40-40 62-110 70C100 140 30 146 14 104 8 82 8 48 20 30Z",
  "M30 46C30 14 96 22 158 14c70-10 122-8 130 50 8 56-30 72-90 70-60-2-120 12-158-12C12 106 20 72 30 46Z",
  "M14 80C14 34 60 26 120 22c70-4 150-12 162 34 10 40-40 48-74 56-50 14-90 34-140 22C26 124 12 108 14 80Z",
  "M30 70C40 30 100 20 160 14c64-4 120 16 124 60 4 50-60 66-124 62C100 134 30 140 22 108c-4-14 4-26 8-38Z",
];

/* ── La invitación ─────────────────────────────────────────── */

export default function InvitacionHilo({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const e = invitacion.escena;
  const [abierta, setAbierta] = useState(false);
  const m = usarMusica();
  const fecha = parsearFecha(invitacion.fecha);
  const limite = invitacion.cierreRsvp ? parsearFecha(invitacion.cierreRsvp) : null;
  const lugar = invitacion.lugares![0];
  const foto = (k: string, clase: string, sizes: string, prioridad = false) => (
    <div className={clase}><Image src={e.fotos[k].src} alt={e.fotos[k].alt} fill priority={prioridad} sizes={sizes} style={{ objectFit: "cover", objectPosition: e.fotos[k].foco }} /></div>
  );

  return (
    <Abierta.Provider value={abierta}>
      <main className="inv-columna cm hi" data-abierta={abierta}>
        <Mono nombres={invitacion.nombres} fecha={personal?.saludo ?? invitacion.fecha.toLowerCase().replace(/ (\d{4})$/, " de $1")} alAbrir={() => { setAbierta(true); m.tocar(); }} />
        <Musica src={invitacion.musica} m={m} />

        {/* ── Amar es… ── */}
        <Escena className="hi-portada">
          <p className="hi-display hi-portada__a cm-sube">Amar es…</p>
          <div className="hi-cartel">
            <Renglones texto="Te quiero" />
            {foto("abrazo", "hi-cartel__foto", "260px", true)}
          </div>
          <p className="hi-display hi-portada__b cm-sube">…{invitacion.frase}</p>
          <h1 className="hi-nombres">{invitacion.nombres}</h1>
        </Escena>

        <Escena className="hi-carta">
          {personal && <p className="cm-clave">{personal.saludo}</p>}
          <Sobre lineas={e.intro} nombres={invitacion.nombres} />
        </Escena>

        {/* ── La fecha ── */}
        <Escena className="hi-fecha">
          {fecha && (
            <div className="hi-tira">
              {[-1, 0, 1].map((n) => {
                const f = diaVecino(fecha, n);
                return (
                  <div key={n} className={n === 0 ? "hi-dia hi-dia--es" : "hi-dia"} aria-hidden={n !== 0}>
                    <p className="hi-dia__nombre">{DIAS[f.getDay()]}</p>
                    <p className="hi-dia__mes">{MESES[f.getMonth()]}</p>
                    <p className="hi-dia__n">{f.getDate()}</p>
                  </div>
                );
              })}
              <Circulo />
            </div>
          )}
          <Escrito as="p" className="hi-pluma hi-guarda">¡guarda la fecha!</Escrito>
          <Cuenta fecha={invitacion.fecha} />
          <BotonCalendario d={invitacion} className="cm-boton hi-boton-cal">Agregar al calendario</BotonCalendario>
        </Escena>

        {/* ── Dónde ── */}
        <Escena className="hi-lugar">
          <p className="hi-mono-texto cm-sube">La ceremonia y toda la noche serán a las</p>
          <p className="cm-hora cm-sube">{lugar.hora}</p>
          <p className="hi-mono-texto cm-sube">en</p>
          <h2 className="cm-clave cm-sube">{lugar.titulo}</h2>
          <p className="hi-mono-texto cm-sube">{lugar.direccion}</p>
          <Mapa lugar={lugar} />
        </Escena>

        {/* ── La foto atravesada por el hilo ── */}
        <div className="hi-cruce">
          <Hilo className="hi-cruce__arriba" d="M0 58C60 66 90 84 150 80c50-4 60 24 100 20 44-4 40-46 80-52 30-4 30-40 60-44" />
          <Llega className="hi-cruce__marco">{foto("sentados", "hi-cruce__foto", "(min-width: 30rem) 330px, 66vw")}</Llega>
          <Hilo className="hi-cruce__abajo" d="M0 30C40 24 46 56 90 60c40 4 50-14 80 0 34 16 20 48 60 40 44-10 60-36 100-40 30-4 40-14 60-18" />
        </div>

        {/* ── Pedidos ── */}
        <Escena className="hi-deseos">
          <Escrito className="hi-pluma hi-titulo">Nuestros deseos</Escrito>
          <ol>
            {e.notas?.map((n, i) => (
              <li key={n}>
                <Llega className="hi-deseo" margen="-12%">
                  <svg className="cm-trazo" viewBox="0 0 300 150" preserveAspectRatio="none" aria-hidden="true"><path d={NUBES[i % 4]} pathLength={1} vectorEffect="non-scaling-stroke" /></svg>
                  <b aria-hidden="true">{i + 1}</b>
                  <p>{n}</p>
                </Llega>
              </li>
            ))}
          </ol>
        </Escena>

        {/* ── Contacto ── */}
        <Escena className="hi-contacto">
          <Llega className="hi-ficha">
            <svg className="hi-clip" viewBox="0 0 30 64" aria-hidden="true"><path d="M8 22v26a8 8 0 0 0 16 0V14a11 11 0 0 0-22 0v30" /></svg>
            <p className="hi-pluma hi-ficha__titulo">Contacto</p>
            <p className="hi-mono-texto">Si tienes alguna duda, escríbele a nuestra organizadora</p>
            <p className="cm-clave">Julia</p>
            <a className="hi-wsp" href="https://wa.me/?text=Hola%20Julia%2C%20te%20escribo%20por%20la%20boda" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.500 20.500l1.200-4.300A8.500 8.500 0 1 1 8 19.300Z" /><path d="M8.800 8.200c.5-.9 1.200-.6 1.500 0l.6 1.400c.1.300 0 .6-.6 1.200.5 1.200 1.600 2.200 2.900 2.800.6-.7.9-.9 1.300-.7l1.500.8c.5.300.4 1-.1 1.500-1.700 1.600-4.700.2-6.400-1.700-1.500-1.700-2.200-3.800-.7-5.300Z" /></svg>
              Escribir por WhatsApp
            </a>
          </Llega>
        </Escena>

        {/* ── Brindis y confirmación ── */}
        <div className="hi-brindis">
          <div className="hi-cartel hi-cartel--brindis">
            <Renglones texto="¡Salud!" />
            {foto("brindis", "hi-cartel__foto", "240px")}
          </div>
        </div>
        <Escena className="hi-rsvp" id="confirmar">
          <Escrito className="hi-pluma hi-titulo">Confirma con un brindis</Escrito>
          {limite && <p className="hi-mono-texto">antes del <b className="hi-limite">{limite.getDate()} de {MESES[limite.getMonth()].toLowerCase()}</b></p>}
          <Formulario
            datos={invitacion}
            personal={personal}
            listo={(si, n) => (
              <>
                <svg className="hi-nudo" viewBox="0 0 220 90" aria-hidden="true">
                  <path pathLength={1} d={si ? "M0 46C50 46 60 20 92 22c34 2 34 44 8 44-28 0-22-44 14-46 36 0 36 46 8 46-30 0-6-44 40-30 24 8 36 10 58 10" : "M0 46C50 46 60 30 92 32M128 58c32 2 42-12 92-12"} />
                </svg>
                <p className="hi-pluma hi-titulo">{si ? "¡Salud!" : "Te vamos a extrañar"}</p>
                <p className="hi-mono-texto">{si ? (n === 1 ? "Tu lugar quedó atado." : `${n} lugares quedaron atados.`) : "Gracias por avisarnos."}</p>
              </>
            )}
          />
        </Escena>

        {/* ── Cierre ── */}
        <Escena className="hi-cierre">
          {foto("perfil", "hi-cierre__foto", "60vw")}
          <p className="hi-con" aria-label={e.gracias}><span>Con</span><i>Amor</i></p>
          <p className="hi-cierre__nombres">{invitacion.nombres.replace("&", "y")}</p>
        </Escena>
      </main>
    </Abierta.Provider>
  );
}
