"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { calcularFaltante, parsearFecha, type Faltante } from "@/invitaciones/fecha";
import type { InvitacionRosedal as Datos, Lugar } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import Carta from "../Carta";
import Fondo from "../Fondo";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";

/**
 * Estilo "Rosedal": hermano de Rosa, con la foto de la pareja dentro del arco.
 *
 * Sobre granate con lacre dorado, papel crudo, rosas rojas y un corazón que
 * vuelve tres veces: en el lacre, en el botón de confirmar y en los globos que
 * suben al decir que sí. Criterios: .claude/skills/invitacion-rosedal/SKILL.md
 */

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const COMIDA_NEUTRA: Record<string, string> = { "Sin TACC": "Sin gluten" };
const dos = (n: number) => String(n).padStart(2, "0");

/* ── Piezas ────────────────────────────────────────────────── */

function Escena({ id, className = "", encuadre = 0, hondo, fin, flores, children }: {
  id?: string;
  className?: string;
  encuadre?: number;
  hondo?: boolean;
  fin?: boolean;
  flores?: { src: string; lado: "izq" | "der" };
  children: React.ReactNode;
}) {
  const [ref, visible] = usarEnVista<HTMLElement>("-14%");
  return (
    <section id={id} ref={ref} data-visible={visible} className={`rd-escena ${className}`}>
      <Fondo encuadre={encuadre} variante={hondo ? "hondo" : "claro"} fin={fin} />
      {flores && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={flores.src} alt="" aria-hidden="true" loading="lazy" className={`rd-flor rd-flor--${flores.lado}`} />
      )}
      <div className="rd-dentro">{children}</div>
    </section>
  );
}

/** Un corazón de un solo trazo entre dos filetes: el ornamento de este estilo. */
function Adorno() {
  return (
    <svg className="rd-adorno" viewBox="0 0 120 20" aria-hidden="true">
      <path d="M4 10 H46 M74 10 H116" />
      <path d="M60 16 C50 9 52 3.5 56 3.5 C58.4 3.5 60 5.6 60 7.2 C60 5.6 61.6 3.5 64 3.5 C68 3.5 70 9 60 16 Z" />
    </svg>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="rd-titulo">{children}</h2>
      <Adorno />
    </>
  );
}

function Copiar({ valor, children = "Copiar" }: { valor: string; children?: React.ReactNode }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className="rd-enlace"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(valor);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2200);
        } catch {
          // Sin permiso de portapapeles el dato igual está a la vista.
        }
      }}
    >
      {copiado ? "Copiado" : children}
    </button>
  );
}

/** [posición %, adelanto s, duración s, escala] */
const PETALOS = [
  [6, 0, 13, 0.9], [18, 5, 16, 0.6], [31, 9, 14, 1], [46, 2, 18, 0.7], [58, 7, 15, 0.85],
  [71, 12, 17, 0.6], [83, 4, 14, 1], [93, 10, 16, 0.75],
] as const;

function Petalos() {
  return (
    <div className="rd-petalos" aria-hidden="true">
      {PETALOS.map(([x, demora, dura, escala], i) => (
        <svg key={i} viewBox="0 0 20 24" style={{ left: `${x}%`, "--t": `${dura}s`, "--d": `${-demora}s`, "--e": escala } as React.CSSProperties}>
          <path d="M10 1 C17 5 20 13 14 21 C12 23.5 8 23.5 6 21 C0 13 3 5 10 1 Z" />
          <path className="rd-petalos__luz" d="M10 3 C8 9 8 15 10 21" />
        </svg>
      ))}
    </div>
  );
}

const GLOBOS = [
  [8, 0, 7, 0.9], [20, 1.1, 8.2, 0.65], [33, 0.4, 7.4, 1.1], [47, 1.7, 8.6, 0.75],
  [60, 0.2, 7, 1], [72, 1.4, 7.8, 0.7], [84, 0.7, 7.2, 0.95],
] as const;

/** Los globos de corazón de la foto. Suben una sola vez, al decir que sí. */
function Globos() {
  return (
    <div className="rd-globos" aria-hidden="true">
      {GLOBOS.map(([x, demora, dura, escala], i) => (
        <svg key={i} viewBox="0 0 60 130" style={{ left: `${x}%`, "--t": `${dura}s`, "--d": `${demora}s`, "--e": escala } as React.CSSProperties}>
          <defs>
            <radialGradient id={`rd-g${i}`} cx="34%" cy="28%" r="78%">
              <stop offset="0" stopColor="#f2757a" />
              <stop offset="0.28" stopColor="#d3222f" />
              <stop offset="1" stopColor="#7d0f1c" />
            </radialGradient>
          </defs>
          <path d="M30 58 C34 78 25 96 31 128" fill="none" stroke="#b98a4a" strokeWidth="0.9" />
          <path d="M30 57 C8 42 2 28 5 17 C8 5 23 3 30 16 C37 3 52 5 55 17 C58 28 52 42 30 57 Z" fill={`url(#rd-g${i})`} />
          <path d="M27 60 L30 55 L33 60 Z" fill="#7d0f1c" />
        </svg>
      ))}
    </div>
  );
}

/* ── Fecha ─────────────────────────────────────────────────── */

function enlaceCalendario(d: Datos, lugar?: Lugar) {
  const [h, m] = (lugar?.hora ?? "18:00").split(":").map(Number);
  const inicio = parsearFecha(d.fecha, h);
  if (!inicio) return null;
  inicio.setMinutes(m || 0);
  const fin = new Date(inicio.getTime() + 9.5 * 3_600_000);
  const f = (x: Date) => `${x.getFullYear()}${dos(x.getMonth() + 1)}${dos(x.getDate())}T${dos(x.getHours())}${dos(x.getMinutes())}00`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: d.rosedal.evento,
    dates: `${f(inicio)}/${f(fin)}`,
    location: lugar ? `${lugar.titulo}, ${lugar.direccion}` : "",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function Cuenta({ fecha }: { fecha: string }) {
  const [falta, setFalta] = useState<Faltante | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const objetivo = parsearFecha(fecha);
    setMontado(true);
    setFalta(calcularFaltante(objetivo));
    const reloj = setInterval(() => setFalta(calcularFaltante(objetivo)), 1000);
    return () => clearInterval(reloj);
  }, [fecha]);

  if (montado && !falta) return <p className="rd-frase">Llegó el día</p>;
  return (
    <div className="rd-cuenta" role="timer" aria-label="Cuenta regresiva">
      {([["d", "días"], ["h", "horas"], ["m", "min"], ["s", "seg"]] as const).map(([k, rotulo]) => (
        <p key={k}>
          <span className="rd-cuenta__n">{falta ? dos(falta[k]) : "––"}</span>
          <span className="rd-cuenta__r">{rotulo}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Confirmación ──────────────────────────────────────────── */

function Rsvp({ d, personal }: { d: Datos; personal?: Personal }) {
  const r = usarRsvp({ slug: d.slug, personal });
  // Los globos son del momento de confirmar: si la respuesta ya estaba, no suben.
  const [festejo, setFestejo] = useState(false);
  const [antes, setAntes] = useState(r.enviado);
  if (antes !== r.enviado) {
    setAntes(r.enviado);
    setFestejo(r.enviado && r.asiste === true);
  }

  return (
    <Escena id="confirmar" encuadre={2} hondo flores={{ src: d.rosedal.flores[0], lado: "der" }}>
      <Titulo>Confirma tu asistencia</Titulo>

      {r.cerrado && !personal ? (
        <p className="rd-texto">Esta invitación es personal. Confirma desde el enlace que te enviaron.</p>
      ) : r.enviado ? (
        <div className="rd-listo" role="status">
          <p className="rd-script">{r.asiste ? "¡Nos vemos ahí!" : "Gracias por avisar"}</p>
          <p className="rd-texto">
            {r.asiste
              ? `Anotamos ${r.acompanantes === 1 ? "1 lugar" : `${r.acompanantes} lugares`} a tu nombre.`
              : "Te vamos a extrañar mucho."}
          </p>
          <button type="button" className="rd-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
            Cambiar mi respuesta
          </button>
        </div>
      ) : (
        <>
          {d.cierreRsvp && <p className="rd-texto">{d.cierreRsvp}</p>}

          {!r.abierto ? (
            <button type="button" className="rd-sello" onClick={r.abrir}>
              <Image src={d.rosedal.sello} alt="" width={180} height={180} />
              <span>Toca el sello para responder</span>
            </button>
          ) : (
            <div ref={r.formRef} className="rd-formulario">
              {!personal && (
                <label className="rd-campo">
                  <span>Tu nombre</span>
                  <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} placeholder="Nombre y apellido" autoComplete="name" maxLength={40} />
                </label>
              )}

              <fieldset className="rd-campo">
                <legend>{personal ? "¿Vienen?" : "¿Vienes?"}</legend>
                {([[true, "Sí, ahí estaré"], [false, "No puedo acompañarlos"]] as const).map(([valor, texto]) => (
                  <button key={texto} type="button" className="rd-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor)}>
                    <i aria-hidden="true" />
                    {texto}
                  </button>
                ))}
              </fieldset>

              {r.asiste && (
                <>
                  {(!personal || r.cupo > 1) && (
                    <div className="rd-campo">
                      <span id="rd-cuantos">{personal ? `¿Cuántos van? (hasta ${r.cupo})` : "¿Cuántas personas son, contándote?"}</span>
                      <div className="rd-contador" role="group" aria-labelledby="rd-cuantos">
                        <button type="button" aria-label="Una persona menos" disabled={r.acompanantes <= 1} onClick={() => r.setAcompanantes(Math.max(1, r.acompanantes - 1))}>−</button>
                        <output>{r.acompanantes}</output>
                        <button type="button" aria-label="Una persona más" disabled={r.acompanantes >= r.cupo} onClick={() => r.setAcompanantes(Math.min(r.cupo, r.acompanantes + 1))}>+</button>
                      </div>
                    </div>
                  )}
                  <fieldset className="rd-campo">
                    <legend>¿Alguna restricción alimentaria?</legend>
                    {COMIDAS.map((c) => (
                      <button key={c} type="button" className="rd-opcion rd-opcion--cuadrada" aria-pressed={r.comidas.includes(c)} onClick={() => r.alternarComida(c)}>
                        <i aria-hidden="true" />
                        {COMIDA_NEUTRA[c] ?? c}
                      </button>
                    ))}
                  </fieldset>
                  {!personal && (
                    <label className="rd-campo">
                      <span>La canción que no puede faltar</span>
                      <input value={r.cancion} onChange={(e) => r.setCancion(e.target.value)} placeholder="Canción y artista" />
                    </label>
                  )}
                </>
              )}

              {r.falta && (!r.nombre.trim() || r.asiste === null) && (
                <p role="alert" className="rd-aviso">{!r.nombre.trim() ? "Falta tu nombre." : "Falta decirnos si vienes."}</p>
              )}
              {r.errorEnvio && <p role="alert" className="rd-aviso">{r.errorEnvio.replace("Probá", "Prueba")}</p>}

              <button type="button" className="rd-boton rd-boton--lleno" onClick={r.enviar} disabled={r.enviando}>
                {r.enviando ? "Enviando…" : "Enviar respuesta"}
              </button>
            </div>
          )}
        </>
      )}
      {festejo && <Globos />}
    </Escena>
  );
}

/* ── Barra para no perderse ────────────────────────────────── */

function Barra({ secciones }: { secciones: [string, string][] }) {
  const [a, setA] = useState({ visible: false, activa: "" });
  const clave = secciones.map(([id]) => id).join(",");

  useEffect(() => {
    const ids = clave.split(",");
    const medir = () => {
      const linea = window.innerHeight * 0.42;
      let activa = "";
      for (const id of ids) {
        const n = document.getElementById(id);
        const r = n?.getBoundingClientRect();
        if (r && r.top <= linea && r.bottom > linea) activa = id;
      }
      // La última parte es corta: al fondo de la página es la que se lee.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) activa = ids[ids.length - 1];
      // Mientras se llena el formulario, la barra taparía los campos.
      const llenando = activa === "confirmar" && document.querySelector(".rd-formulario") !== null;
      const visible = window.scrollY > window.innerHeight * 0.55 && !llenando;
      setA((p) => (p.visible === visible && p.activa === activa ? p : { visible, activa }));
    };
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [clave]);

  return (
    <nav className="rd-barra" data-visible={a.visible} inert={!a.visible} aria-label="Partes de la invitación">
      {secciones.map(([id, texto]) => (
        <button
          key={id}
          type="button"
          aria-current={a.activa === id ? "true" : undefined}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          {texto}
        </button>
      ))}
    </nav>
  );
}

/* ── La invitación ─────────────────────────────────────────── */

export default function InvitacionRosedal({ invitacion: d, personal }: { invitacion: Datos; personal?: Personal }) {
  const x = d.rosedal;
  const fecha = parsearFecha(d.fecha);
  const calendario = enlaceCalendario(d, d.lugares?.[0]);

  const secciones: [string, string][] = [["fecha", "Fecha"]];
  if (d.lugares) secciones.push(["lugar", "Lugar"]);
  if (d.cronograma) secciones.push(["programa", "Programa"]);
  secciones.push(["confirmar", "Confirmar"]);

  return (
    <Carta datos={d.carta}>
      <main className="inv-columna inv-grano rd">
        <header className="rd-portada">
          <Fondo encuadre={3} />
          <div className="rd-arco">
            <div className="rd-arco__foto">
              <Image src={x.portada.src} alt={x.portada.alt} fill priority quality={90} sizes="(min-width: 30rem) 22rem, 72vw" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={x.arco} alt="" aria-hidden="true" className="rd-arco__flores" />
          </div>
          <div className="rd-portada__texto">
            <h1 className="rd-nombre">{d.volanta}</h1>
            <Adorno />
            <p className="rd-portada__fecha">
              {fecha ? `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}` : d.fecha}
            </p>
            <p className="rd-desliza">Desliza<span aria-hidden="true" /></p>
          </div>
          <Petalos />
        </header>

        {personal && (
          <Escena encuadre={1}>
            <p className="rd-script">{personal.saludo}</p>
            {personal.nota && <p className="rd-texto">{personal.nota}</p>}
          </Escena>
        )}

        <Escena id="fecha" encuadre={0} flores={{ src: x.flores[0], lado: "izq" }}>
          {d.frase && <p className="rd-frase">{d.frase}</p>}
          {fecha && (
            <div className="rd-almanaque">
              <p>{MESES[fecha.getMonth()]}</p>
              <p className="rd-almanaque__dia">
                <span>{DIAS[fecha.getDay()]}</span>
                <b>{fecha.getDate()}</b>
                <span>{d.lugares?.[0] ? `${d.lugares[0].hora} h` : ""}</span>
              </p>
              <p>{fecha.getFullYear()}</p>
            </div>
          )}
          <Cuenta fecha={d.fecha} />
          {calendario && (
            <a className="rd-boton" href={calendario} target="_blank" rel="noopener noreferrer">Añadir al calendario</a>
          )}
        </Escena>

        {d.lugares && (
          <Escena id="lugar" encuadre={1} flores={{ src: x.flores[1], lado: "der" }}>
            <Titulo>Dónde</Titulo>
            {d.lugares.map((l, i) => (
              <div key={l.tipo + l.titulo} className="rd-lugar">
                {i === 1 && d.ilustracionLugar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.ilustracionLugar} alt="" aria-hidden="true" loading="lazy" className="rd-linea" />
                )}
                <h3 className="rd-script">{l.titulo}</h3>
                <p className="rd-lugar__dato">{l.tipo}, {l.hora} h</p>
                <p className="rd-texto">{l.direccion}</p>
                <div className="rd-acciones">
                  <a className="rd-boton" href={l.mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a>
                  <Copiar valor={`${l.titulo}, ${l.direccion}`}>Copiar dirección</Copiar>
                </div>
              </div>
            ))}
          </Escena>
        )}

        {d.cronograma && (
          <Escena id="programa" encuadre={2} hondo flores={{ src: x.flores[0], lado: "izq" }}>
            <Titulo>El programa</Titulo>
            <ol className="rd-programa">
              {d.cronograma.map((h) => (
                <li key={h.hora + h.titulo}><span className="rd-programa__hora">{h.hora}</span><span>{h.titulo}</span></li>
              ))}
            </ol>
          </Escena>
        )}

        <Escena encuadre={4}>
          <figure className="rd-marco">
            <Image src={x.foto.src} alt={x.foto.alt} width={880} height={1100} sizes="(min-width: 30rem) 22rem, 78vw" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={x.flores[0]} alt="" aria-hidden="true" loading="lazy" className="rd-marco__flor" />
          </figure>
          <p className="rd-frase">{x.foto.pie}</p>
        </Escena>

        {d.dressCode && (
          <Escena encuadre={3} flores={{ src: x.flores[1], lado: "izq" }}>
            <Titulo>Vestimenta</Titulo>
            {d.ilustracionVestimenta && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.ilustracionVestimenta} alt="" aria-hidden="true" loading="lazy" className="rd-linea" />
            )}
            <h3 className="rd-script">{d.dressCode.titulo}</h3>
            <p className="rd-texto">{d.dressCode.detalle}</p>
            <ul className="rd-paleta">
              {x.paleta.map((c) => (
                <li key={c.nombre}><i style={{ background: c.color }} aria-hidden="true" />{c.nombre}</li>
              ))}
            </ul>
          </Escena>
        )}

        {d.regalo && (
          <Escena encuadre={1} flores={{ src: x.flores[0], lado: "der" }}>
            <Titulo>Regalos</Titulo>
            <p className="rd-texto">{d.regalo.mensaje}</p>
            <dl className="rd-datos">
              {([["Alias", d.regalo.alias], ["Cuenta", d.regalo.cbu], ["A nombre de", d.regalo.titular]] as const).map(([k, v]) =>
                v ? (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd><Copiar valor={v} /></div>
                ) : null,
              )}
            </dl>
          </Escena>
        )}

        <Rsvp d={d} personal={personal} />

        <Escena encuadre={0} fin className="rd-cierre" flores={{ src: x.flores[1], lado: "izq" }}>
          <p className="rd-nombre rd-nombre--chico">Te esperamos</p>
          <Adorno />
          <p className="rd-portada__fecha">{d.fecha.toLowerCase()}</p>
        </Escena>

        <Barra secciones={secciones} />
      </main>
    </Carta>
  );
}
