"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionEscena as Datos } from "@/invitaciones/tipos";
import Formulario from "../comun/Formulario";
import { BotonCalendario, Copiable, Cuenta, Escena, Escrito, Llega, Mapa, Musica, conTeclado, dos, usarArrastre, usarAvance, usarMusica, usarTapa } from "../comun/piezas";
import type { Personal } from "../personal";
import { Abierta } from "../rasgado/abierta";

/**
 * Estilo "Cupido": papel arrugado, tinta roja y grabados antiguos. Para entrar
 * se tensa el arco: se tira de la flecha hacia abajo y, al soltar, sale y abre
 * el papel por el corazón. Criterios: .claude/skills/invitacion-referencias
 */

const CORAZON = "M50 88C22 68 6 50 6 31 6 17 17 8 29 8c9 0 17 5 21 13C54 13 62 8 71 8c12 0 23 9 23 23 0 19-16 37-44 57Z";

/* ── La entrada ────────────────────────────────────────────── */

function Arco({ titulo, saludo, alAbrir }: { titulo: string; saludo: string; alAbrir: () => void }) {
  const { estado, abrir } = usarTapa(2600, alAbrir);
  const ref = useRef<HTMLDivElement>(null);
  const tensar = (p: number) => ref.current?.style.setProperty("--tension", p.toFixed(3));

  const arrastre = usarArrastre({
    alMover: (_, dy) => estado === "cerrada" && tensar(Math.max(0, Math.min(1, dy / 110))),
    alSoltar: (_, dy, toque) => {
      if (estado !== "cerrada") return;
      if (toque) {
        tensar(0.9);
        setTimeout(abrir, 260);
      } else if (dy > 34) abrir();
      else tensar(0);
    },
  });

  if (estado === "fuera") return null;
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Abrir la invitación"
      className="cm-tapa cu-tapa"
      data-estado={estado}
      onKeyDown={conTeclado(() => { tensar(0.9); setTimeout(abrir, 260); })}
      {...arrastre}
    >
      <div className="cu-tapa__papel">
        <p className="cu-tapa__titulo">{titulo}</p>
        <p className="cu-tapa__saludo">{saludo}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cu-tapa__medallon" src="/invitaciones/cupido/medallon.webp" alt="" width={760} height={760} />
      </div>
      <svg className="cu-tapa__corazon" viewBox="0 0 100 96" aria-hidden="true"><path d={CORAZON} /></svg>
      <svg className="cu-arco" viewBox="0 0 300 190" aria-hidden="true">
        <path className="cu-arco__madera" d="M14 92C34 88 44 60 74 44c26-14 50-10 76-2 26-8 50-12 76 2 30 16 40 44 60 48" />
        <path className="cu-arco__puno" d="M138 41c8 4 16 4 24 0" />
        <path className="cu-arco__rulo" d="M14 92c-8 2-9-9-2-10M286 92c8 2 9-9 2-10" />
        <path className="cu-arco__cuerda cu-arco__cuerda--izq" d="M14 92 150 92" />
        <path className="cu-arco__cuerda cu-arco__cuerda--der" d="M286 92 150 92" />
      </svg>
      <svg className="cu-flecha" viewBox="0 0 40 190" aria-hidden="true">
        <path d="M20 4 30 30 20 25 10 30Z" className="cu-flecha__punta" />
        <path d="M20 24V176" />
        <path d="M20 150 9 160M20 160 9 170M20 170 9 180M20 150 31 160M20 160 31 170M20 170 31 180" />
      </svg>
      <p className="cm-tapa__indica cu-tapa__indica">Tira de la flecha</p>
      {estado === "abriendo" && (
        <span className="cu-latidos" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => (
            <svg key={i} viewBox="0 0 100 96" style={{ "--a": `${i * 22.5 + (i % 2) * 8}deg`, "--l": `${24 + ((i * 37) % 30)}vmin`, "--e": 0.5 + ((i * 13) % 7) / 7 } as React.CSSProperties}><path d={CORAZON} /></svg>
          ))}
        </span>
      )}
    </div>
  );
}

/* ── La cinta de seda ──────────────────────────────────────── */

type P = [number, number];

/** Curva suave que pasa por todos los puntos. */
function suave(puntos: P[], n = 26): P[] {
  const o: P[] = [];
  for (let k = 0; k < puntos.length - 1; k++) {
    const [a, b, c, d] = [puntos[Math.max(0, k - 1)], puntos[k], puntos[k + 1], puntos[Math.min(puntos.length - 1, k + 2)]];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      const f = (i: 0 | 1) => 0.5 * (2 * b[i] + (c[i] - a[i]) * t + (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * t2 + (3 * b[i] - a[i] - 3 * c[i] + d[i]) * t3);
      o.push([f(0), f(1)]);
    }
  }
  return o;
}

const TRAMOS: P[][] = [
  [[236, -10], [196, 34], [120, 70], [62, 122], [66, 176], [140, 226], [262, 240], [410, 236]],
  [[-20, 290], [90, 262], [210, 226], [310, 206], [410, 214]],
  [[410, 372], [320, 366], [226, 400], [120, 452], [-20, 470]],
  [[410, 540], [318, 590], [210, 616], [96, 642], [52, 700], [92, 762], [176, 764], [254, 742], [306, 768], [300, 834]],
];

/** La cinta gira sobre sí misma: cada trozo cambia de ancho y de brillo. */
function trozos(puntos: P[], fase: number) {
  const c = suave(puntos);
  const r = (v: number) => Math.round(v * 10) / 10;
  const borde = c.map((p, i) => {
    const q = c[Math.min(c.length - 1, i + 1)], o = c[Math.max(0, i - 1)];
    const dx = q[0] - o[0], dy = q[1] - o[1], m = Math.hypot(dx, dy) || 1;
    const giro = Math.sin(i * 0.052 + fase);
    const w = 3.2 + 5.2 * Math.abs(giro);
    return { a: [p[0] - (dy / m) * w, p[1] + (dx / m) * w] as P, b: [p[0] + (dy / m) * w, p[1] - (dx / m) * w] as P, giro };
  });
  return borde.slice(0, -1).map((x, i) => {
    const y = borde[i + 1];
    const luz = Math.round(58 + 30 * Math.pow(Math.abs(x.giro), 1.5) + 7 * Math.sin(i * 0.4));
    return { d: `M${r(x.a[0])} ${r(x.a[1])}L${r(y.a[0])} ${r(y.a[1])}L${r(y.b[0])} ${r(y.b[1])}L${r(x.b[0])} ${r(x.b[1])}Z`, luz };
  });
}

function Cinta() {
  const listos = useMemo(() => TRAMOS.map((t, k) => trozos(t, k * 1.7)), []);
  return (
    <svg className="cu-cinta" viewBox="0 0 390 850" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {TRAMOS.map((t, k) => (
          <mask key={k} id={`cu-mask-${k}`} maskUnits="userSpaceOnUse" x="-30" y="-30" width="450" height="900">
            <path
              className="cu-cinta__mascara"
              style={{ "--desde": k / TRAMOS.length } as React.CSSProperties}
              d={"M" + suave(t, 8).map((p) => p.map(Math.round).join(" ")).join("L")}
              pathLength={1}
            />
          </mask>
        ))}
      </defs>
      {listos.map((tramo, k) => (
        <g key={k} mask={`url(#cu-mask-${k})`}>
          {tramo.map((t, i) => <path key={i} d={t.d} fill={`hsl(2 22% ${t.luz}%)`} stroke={`hsl(2 22% ${t.luz}%)`} strokeWidth="0.7" />)}
        </g>
      ))}
    </svg>
  );
}

/* ── Los dibujos a pluma ───────────────────────────────────── */

const p = (d: string, k = 0) => <path d={d} pathLength={1} style={{ "--k": k } as React.CSSProperties} />;

const Candelabro = () => (
  <svg className="cm-trazo cu-dibujo cu-dibujo--arana" viewBox="0 0 120 260" aria-hidden="true">
    {p("M58 4c-8 6 10 10 2 16s10 8 2 14 8 8 0 14", 0)}{p("M60 48C44 70 30 92 22 122M60 48c16 22 30 44 38 74M60 48V122M60 48c-8 24-16 48-18 74M60 48c8 24 16 48 18 74", 1)}
    {p("M18 122h84M16 132h88M22 122c-6 4-8 8-6 10M98 122c6 4 8 8 6 10", 2)}{p("M18 132c2 34 10 56 26 72M102 132c-2 34-10 56-26 72M40 132c2 30 8 54 20 74M80 132c-2 30-8 54-20 74", 3)}
    {p("M20 150c6 10 14 10 20 0M40 152c6 10 14 10 20 0M60 152c6 10 14 10 20 0M80 150c6 10 14 10 20 0M26 178c6 9 12 9 18 0M46 182c6 9 22 9 28 0M76 178c6 9 12 9 18 0", 4)}
    {p("M44 204c-12-2-18 6-12 14 8 8 48 8 56 0 6-8 0-16-12-14", 5)}{p("M60 226c-6 6-6 14 0 18 6-4 6-12 0-18M10 110c-4-8 4-14 6-20 4 6 8 14 2 20M104 110c-4-8 4-14 6-20 4 6 8 14 2 20", 6)}
  </svg>
);

const Pastel = () => (
  <svg className="cm-trazo cu-dibujo cu-dibujo--pastel" viewBox="0 0 150 200" aria-hidden="true">
    {p("M50 14c16-6 36-6 50 0v34c-14 6-34 6-50 0ZM50 14c14 6 36 6 50 0", 0)}{p("M36 56c26-9 54-9 80 0v38c-26 8-54 8-80 0ZM36 56c26 8 54 8 80 0", 1)}{p("M20 104c36-12 76-12 112 0v44c-36 12-76 12-112 0ZM20 104c36 10 76 10 112 0", 2)}
    {p("M50 22c5 8 11 8 16 1 6 8 12 8 18 0 5 7 11 6 16-1M36 66c6 9 13 9 19 1 7 9 15 9 21 0 7 9 14 8 20 0 6 8 13 7 20-1M20 116c7 10 16 10 23 1 7 10 17 10 25 0 8 10 17 9 24 0 7 9 15 9 22 0 6 8 12 6 18-1", 3)}
    {p("M8 156c44 14 90 14 134 0M70 166c0 12-6 20-14 24h40c-8-4-14-12-14-24M44 192h62M58 36c6 4 14 4 20-2M96 80c5-4 5-10 0-12-5 2-5 8 0 12M40 138c6-5 6-12 0-14-6 2-6 9 0 14", 4)}
  </svg>
);

const Vela = () => (
  <svg className="cu-dibujo cu-dibujo--vela cm-trazo" viewBox="0 0 80 280" aria-hidden="true">
    <g className="cu-llama">{p("M40 6c-9 14-9 24 0 32 9-8 9-18 0-32Z", 0)}</g>
    {p("M40 38v8M31 46c6-3 12-3 18 0v92H31ZM34 60c2 12-2 18 0 28", 1)}{p("M26 138h28l-3 10H29ZM34 148c-6 10 18 10 12 0M40 160c-18-14-34-6-30 6 4 10 20 6 30-6 10 12 26 16 30 6 4-12-12-20-30-6ZM36 164c-6 16-14 24-22 30M44 164c6 16 14 24 22 30", 2)}
    {p("M34 168v20c-8 6-8 14 0 18v14c-10 4-10 12 0 16h12c10-4 10-12 0-16v-14c8-4 8-12 0-18v-20M18 244c14-8 30-8 44 0l6 18H12ZM10 262h60", 3)}
  </svg>
);

const CorazonPluma = ({ className = "" }: { className?: string }) => (
  <svg className={`cm-trazo ${className}`} viewBox="0 0 100 96" aria-hidden="true">{p("M48 88C20 66 4 46 8 26 12 8 36 4 48 26 56 4 88 2 92 24c4 22-22 44-44 64 4-18 10-30 22-44", 2)}</svg>
);

/* ── El sobre de los regalos ───────────────────────────────── */

function Sobre({ datos }: { datos: Datos }) {
  const [abierto, setAbierto] = useState(false);
  if (!datos.regalo) return null;
  return (
    <div className="cu-regalo">
      <button type="button" className="cu-sobre" data-abierto={abierto} aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
        <svg viewBox="0 0 120 86" aria-hidden="true">
          <path d="M6 8h108v70H6Z" />
          <path className="cu-sobre__solapa" d="M6 8 60 50 114 8" />
          <path className="cu-sobre__corazon" d={CORAZON} transform="translate(44 26) scale(.32)" />
          <path d="M16 66h10v8H16ZM84 64h20M84 70h14" />
        </svg>
        <span>{abierto ? "Guardar los datos" : "Toca el sobre para ver los datos"}</span>
      </button>
      <div className="cm-pliegue cu-pliegue" data-abierto={abierto} inert={!abierto}>
        <div>
          <Copiable etiqueta="Alias" valor={datos.regalo.alias} />
          <Copiable etiqueta="Cuenta" valor={datos.regalo.cbu} />
        </div>
      </div>
    </div>
  );
}

/* ── La invitación ─────────────────────────────────────────── */

export default function InvitacionCupido({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const e = invitacion.escena;
  const [abierta, setAbierta] = useState(false);
  const [tela, setTela] = useState<number | null>(null);
  const m = usarMusica();
  const tiempos = usarAvance<HTMLElement>();
  const fecha = parsearFecha(invitacion.fecha);
  const fechaCorta = fecha ? `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()}` : invitacion.fecha;
  const limite = invitacion.cierreRsvp ? parsearFecha(invitacion.cierreRsvp) : null;
  const foto = (k: string, clase: string, sizes: string, prioridad = false) => (
    <div className={clase}><Image src={e.fotos[k].src} alt={e.fotos[k].alt} fill priority={prioridad} sizes={sizes} style={{ objectFit: "cover", objectPosition: e.fotos[k].foco }} /></div>
  );

  return (
    <Abierta.Provider value={abierta}>
      <main className="inv-columna cm cu" data-abierta={abierta}>
        <Arco titulo="Nos casamos" saludo={personal?.saludo ?? fechaCorta} alAbrir={() => { setAbierta(true); m.tocar(); }} />
        <Musica src={invitacion.musica} m={m} />

        {/* ── Portada ── */}
        <Escena className="cu-portada">
          <h1 className="cu-grande">
            <Escrito as="p" className="cu-grande__a">¡Nos vamos</Escrito>
            <Escrito as="p" className="cu-grande__b">a casar!</Escrito>
          </h1>
          <div className="cu-foto">
            <Candelabro />
            <Pastel />
            {foto("portada", "cu-foto__marco", "(min-width: 30rem) 330px, 70vw", true)}
          </div>
          <p className="cu-reserva cm-sube">Reserva la fecha</p>
          <Escrito as="p" className="cu-fecha">{fechaCorta}</Escrito>
          <BotonCalendario d={invitacion} />
          <Cuenta fecha={invitacion.fecha} />
        </Escena>

        {/* ── El querubín ── */}
        <Escena className="cu-vuelo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cu-querubin" src="/invitaciones/cupido/querubin.webp" alt="" width={900} height={535} loading="lazy" />
          <CorazonPluma className="cu-vuelo__corazon" />
          {personal && <p className="cm-clave">{personal.saludo}</p>}
          <p className="cu-creemos cm-sube">{invitacion.frase}</p>
        </Escena>

        {/* ── Dónde ── */}
        <Escena className="cu-lugar">
          <div className="cu-lugar__hoja">
            <Escrito className="cu-titulo cu-titulo--claro">El lugar</Escrito>
            {invitacion.lugares?.map((l, i) => (
              <article key={l.titulo}>
                <p className="cm-hora">{l.hora}</p>
                <h3 className="cm-clave">{l.titulo}</h3>
                <p className="cu-lugar__dir">{l.direccion}</p>
                <Mapa lugar={l} />
                {i === 0 && foto("mesa", "cu-lugar__foto", "300px")}
              </article>
            ))}
          </div>
        </Escena>

        {/* ── Los tiempos, con la cinta ── */}
        <section ref={tiempos} className="cu-tiempos">
          <Escrito className="cu-titulo">El día</Escrito>
          <div className="cu-tiempos__cuerpo">
            <Cinta />
            <ol>
              {invitacion.cronograma?.map((h, i) => (
                <li key={h.hora} className={i % 2 ? "cu-der" : ""}>
                  <Llega className="cu-tiempo">
                    <p className="cm-hora cm-sube">{h.hora}</p>
                    <p className="cu-tiempo__que cm-sube" style={{ "--i": 1 } as React.CSSProperties}>{h.titulo}</p>
                    {h.detalle && <p className="cu-tiempo__detalle cm-sube" style={{ "--i": 2 } as React.CSSProperties}>{h.detalle}</p>}
                  </Llega>
                </li>
              ))}
              <li className="cu-aparte">Entre la ceremonia y la cena haremos fotos. Puedes sumarte o disfrutar del paseo.</li>
            </ol>
          </div>
        </section>

        {/* ── Vestimenta ── */}
        <Escena className="cu-ropa">
          <Escrito className="cu-titulo">Vestimenta</Escrito>
          <p className="cm-clave cm-sube">{invitacion.dressCode?.titulo}</p>
          <p className="cm-texto cm-sube">{invitacion.dressCode?.detalle}</p>
          <div className="cu-telas">
            {e.paleta?.map((t, i) => (
              <button key={t.nombre} type="button" className="cu-tela" style={{ "--i": i, backgroundImage: `url(${t.imagen})` } as React.CSSProperties} aria-pressed={tela === i} aria-label={t.nombre} onClick={() => setTela(tela === i ? null : i)} />
            ))}
          </div>
          <p className="cu-tela__nombre" aria-live="polite">{tela === null ? "Toca una tela" : e.paleta?.[tela].nombre}</p>
          <div className="cu-par">
            {foto("ellas", "cu-par__foto", "45vw")}
            {foto("ellos", "cu-par__foto", "45vw")}
          </div>
        </Escena>

        {/* ── Detalles ── */}
        <Escena className="cu-detalles">
          <Escrito className="cu-titulo">Detalles</Escrito>
          <div className="cu-detalles__cuerpo">
            {e.notas?.map((n) => <p key={n} className="cm-texto cm-sube">{n}</p>)}
            <Vela />
          </div>
          <Sobre datos={invitacion} />
        </Escena>

        {/* ── Confirmación ── */}
        <Escena className="cu-rsvp" id="confirmar">
          <Escrito className="cu-titulo">¿Vienes?</Escrito>
          {limite && <p className="cm-texto">Responde antes del <b className="cu-limite">{dos(limite.getDate())}/{dos(limite.getMonth() + 1)}</b></p>}
          <Formulario
            datos={invitacion}
            personal={personal}
            listo={(si, n) => (
              <div className="cu-listo">
                <svg className="cu-blanco" viewBox="0 0 200 130" aria-hidden="true">
                  <path className="cu-blanco__corazon" d={CORAZON} transform="translate(58 14) scale(1)" />
                  {si && <g className="cu-blanco__flecha"><path d="M6 112 178 22M178 22l-20 2M178 22l-10 17M6 112l16-2M14 108l-2-14M24 103l-2-14" /></g>}
                </svg>
                <p className="cu-titulo">{si ? "¡Flechazo!" : "Te vamos a extrañar"}</p>
                <p className="cm-texto">{si ? (n === 1 ? "Tu lugar quedó guardado." : `Guardamos ${n} lugares.`) : "Gracias por avisarnos."}</p>
              </div>
            )}
          />
        </Escena>

        {/* ── Cierre ── */}
        <Escena className="cu-cierre">
          <div className="cu-cierre__fila"><Escrito as="p" className="cu-titulo cu-titulo--cierre">{e.gracias}</Escrito><CorazonPluma className="cu-cierre__corazon" /></div>
          <Escrito as="p" className="cu-firma">Con amor, los novios</Escrito>
          <div className="cu-cierre__angeles" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/invitaciones/cupido/querubin.webp" alt="" width={900} height={535} loading="lazy" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/invitaciones/cupido/querubin-2.webp" alt="" width={860} height={558} loading="lazy" />
          </div>
        </Escena>
      </main>
    </Abierta.Provider>
  );
}
