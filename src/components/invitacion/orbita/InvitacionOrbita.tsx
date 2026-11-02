"use client";

import { useEffect, useMemo, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionOrbita as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";

/**
 * Estilo "Órbita": encuentro ejecutivo sobre papel claro. Una rueda de
 * fotografías (16 sectores, 8 imágenes repetidas) gira muy despacio detrás del
 * nombre. La rueda es una sola animación CSS, pausable; los datos no giran.
 * Criterios: .claude/skills/invitacion-orbita/SKILL.md
 */

const A = "/invitaciones/orbita/";
const FOTOS = ["conversacion", "mesa", "copas", "charla", "recepcion", "plato", "salon", "aperitivo"];
const punto = (r: number, a: number) => [500 + r * Math.cos((a * Math.PI) / 180), 500 + r * Math.sin((a * Math.PI) / 180)].map((n) => Math.round(n * 10) / 10);

function Rueda() {
  const sectores = useMemo(
    () =>
      [...FOTOS, ...FOTOS].map((nombre, i) => {
        const a = i * 22.5 + 0.25;
        const b = (i + 1) * 22.5 - 0.25;
        const [px, py] = punto(498, a);
        const [qx, qy] = punto(498, b);
        const [sx, sy] = punto(350, b);
        const [tx, ty] = punto(350, a);
        const [cx, cy] = punto(424, (a + b) / 2);
        return { nombre, cx, cy, d: `M${px} ${py} A498 498 0 0 1 ${qx} ${qy} L${sx} ${sy} A350 350 0 0 0 ${tx} ${ty} Z` };
      }),
    [],
  );
  return (
    <svg className="or-rueda" viewBox="0 0 1000 1000" aria-hidden="true">
      <defs>
        {sectores.map((s, i) => (
          <clipPath key={i} id={`or-s${i}`}>
            <path d={s.d} />
          </clipPath>
        ))}
      </defs>
      {sectores.map((s, i) => (
        <image key={i} href={`${A}${s.nombre}.webp`} x={s.cx - 140} y={s.cy - 140} width={280} height={280} preserveAspectRatio="xMidYMid slice" clipPath={`url(#or-s${i})`} />
      ))}
    </svg>
  );
}

function Escena({ id, clase, children }: { id: string; clase: string; children: React.ReactNode }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-8%");
  return (
    <section ref={ref} id={id} data-visible={visible} className={`or-e or-e-${clase}`}>
      {children}
    </section>
  );
}

export default function InvitacionOrbita({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const o = invitacion.orbita;
  const lugar = invitacion.lugares?.[0];
  const [pausada, setPausada] = useState(false);

  const [, dia] = invitacion.fecha.match(/(\d{1,2}) de (\S+)/) ?? [];
  const f = parsearFecha(invitacion.fecha, 19);
  const diaSemana = f ? f.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase() : "";
  const nMes = f ? String(f.getMonth() + 1).padStart(2, "0") : "";
  const fechaLarga = invitacion.fecha.replace(/ (\d{4})$/, " de $1").replace(/ de ([A-ZÁÉÍÓÚ])/, (_, l: string) => ` de ${l.toLowerCase()}`);
  const limite = invitacion.cierreRsvp?.replace(/^Confirmá antes del?\s*/i, "").replace(/\.$/, "");

  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => setDias(calcularFaltante(parsearFecha(invitacion.fecha, 19))?.d ?? 0), [invitacion.fecha]);

  // Con movimiento reducido la rueda arranca quieta.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPausada(true);
  }, []);

  const r = usarRsvp({ slug: invitacion.slug, personal });

  const ics = () => {
    const d = f ?? new Date();
    const z = (n: number) => String(n).padStart(2, "0");
    const ini = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 19, 30);
    const fin = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 0);
    const u = (x: Date) => `${x.getUTCFullYear()}${z(x.getUTCMonth() + 1)}${z(x.getUTCDate())}T${z(x.getUTCHours())}${z(x.getUTCMinutes())}00Z`;
    const txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MyB Digitals//Orbita//ES", "BEGIN:VEVENT", `UID:${invitacion.slug}@mybdigitals.com`, `DTSTAMP:${u(new Date())}`, `DTSTART:${u(ini)}`, `DTEND:${u(fin)}`, `SUMMARY:${o.marca} - ${o.tipo}`, `LOCATION:${lugar?.titulo ?? ""} - ${lugar?.direccion ?? ""}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([txt], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invitacion.slug}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <main className="inv-columna or" data-pausada={pausada}>
      {/* ── Portada ── */}
      <Escena id="portada" clase="portada">
        <div className="or-orbital" aria-hidden="true">
          <Rueda />
        </div>
        <div className="or-top">
          <span>{o.anfitrion.toUpperCase()}</span>
          <span>{o.ciudad.toUpperCase()}</span>
        </div>
        <div className="or-copy">
          <p className="or-invita">Tenemos una invitación para vos.</p>
          <h1 aria-label={o.marca}>
            {o.marca}
            <span>{o.tipo}</span>
          </h1>
          <p className="or-claim">
            Las buenas ideas
            <br />
            empiezan con una
            <br />
            <em>conversación.</em>
          </p>
        </div>
        <div className="or-pie">
          <div className="or-fecha">
            <strong>
              {dia?.padStart(2, "0")}.{nMes}
            </strong>
            <p>
              {diaSemana} · {f?.getFullYear()}
              <br />
              {lugar?.hora} H · {lugar?.titulo.toUpperCase()}
              {dias !== null && dias > 0 && (
                <>
                  <br />
                  <span className="or-faltan">Faltan {dias} días</span>
                </>
              )}
            </p>
          </div>
          <a className="or-boton" href="#asistencia">
            Confirmar asistencia <span aria-hidden="true">↗</span>
          </a>
          <div className="or-pie-links">
            <a href="#agenda">Descubrí el encuentro ↓</a>
            <button type="button" onClick={() => setPausada((p) => !p)} aria-pressed={pausada}>
              {pausada ? "Activar galería" : "Pausar galería"}
            </button>
          </div>
        </div>
      </Escena>

      {/* ── Agenda ── */}
      <Escena id="agenda" clase="agenda">
        <div className="or-titulo">
          <p>
            Una mesa compartida.
            <br />
            <em>Nuevas perspectivas.</em>
          </p>
          <span className="or-circulo" aria-hidden="true">
            ↘
          </span>
        </div>
        <p className="or-intro">{o.mensaje}</p>
        <div className="or-foto-agenda">
          <img src={`${A}conversacion.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <span>El encuentro</span>
        </div>
        <ol className="or-lista">
          {o.agenda.map((a) => (
            <li key={a.hora}>
              <time>{a.hora}</time>
              <div>
                <strong>{a.titulo}</strong>
                <span>{a.detalle}</span>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="or-texto-boton" onClick={ics}>
          Agregar a mi calendario ↗
        </button>
      </Escena>

      {/* ── Lugar ── */}
      {lugar && (
        <Escena id="lugar" clase="lugar">
          <div className="or-foto-lugar">
            <img src={`${A}salon.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <span>Una noche en</span>
            <h2>
              {lugar.titulo.split(" ")[0]}
              <br />
              <em>{lugar.titulo.split(" ").slice(1).join(" ")}.</em>
            </h2>
          </div>
          <div className="or-lugar-datos">
            <p>{lugar.direccion.replace(/, ([^,]+)$/, " · $1")}</p>
            <a className="or-boton or-boton--claro" href={lugar.mapa} target="_blank" rel="noopener noreferrer">
              Ver ubicación <span aria-hidden="true">↗</span>
            </a>
            {invitacion.dressCode && (
              <div className="or-vestimenta">
                <span>VESTIMENTA</span>
                <strong>{invitacion.dressCode.titulo}</strong>
                <p>{invitacion.dressCode.detalle}</p>
              </div>
            )}
          </div>
        </Escena>
      )}

      {/* ── Confirmación ── */}
      <Escena id="asistencia" clase="asistencia">
        <p className="or-limite">{limite ? `CONFIRMÁ HASTA EL ${limite.toUpperCase()}` : "CONFIRMÁ TU ASISTENCIA"}</p>
        <h2>
          Tu lugar
          <br />
          <em>en la mesa.</em>
        </h2>
        <p className="or-intro">Dejanos tu respuesta para preparar cada detalle.</p>

        {r.cerrado && !personal ? (
          <p className="or-intro">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
        ) : r.enviado ? (
          <div className="or-respuesta" role="status">
            <h3>{r.asiste ? "Tu lugar está reservado." : "Gracias por avisarnos."}</h3>
            <p>{r.asiste ? `Te esperamos el ${fechaLarga}.` : "Esperamos verte en la próxima."}</p>
            {personal && (
              <button type="button" className="or-texto-boton" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                Cambiar mi respuesta
              </button>
            )}
          </div>
        ) : (
          <div ref={r.formRef} className="or-form">
            {!personal && (
              <label className="or-campo">
                <span>Nombre y apellido</span>
                <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} autoComplete="name" maxLength={40} />
              </label>
            )}
            <fieldset className="or-campo">
              <legend>¿Nos acompañás?</legend>
              {[[true, "Sí, voy a estar"], [false, "No podré asistir"]].map(([valor, texto]) => (
                <button key={String(valor)} type="button" className="or-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                  <span className="or-radio" aria-hidden="true" />
                  {texto as string}
                </button>
              ))}
            </fieldset>
            {r.asiste === true && (
              <fieldset className="or-campo">
                <legend>Alimentación o accesibilidad</legend>
                {COMIDAS.map((c) => (
                  <button key={c} type="button" className="or-opcion" aria-pressed={r.comidas.includes(c)} onClick={() => r.alternarComida(c)}>
                    <span className="or-radio or-radio--cuadrado" aria-hidden="true" />
                    {c}
                  </button>
                ))}
              </fieldset>
            )}
            {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="or-aviso">Falta tu nombre y si vas a venir.</p>}
            {r.errorEnvio && <p role="alert" className="or-aviso">{r.errorEnvio}</p>}
            <button type="button" className="or-boton" onClick={r.enviar} disabled={r.enviando}>
              {r.enviando ? "Reservando tu lugar…" : "Confirmar mi asistencia"} <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}

        <footer className="or-footer">
          <strong>{o.marca}</strong>
          <span>Nos vemos alrededor de una buena idea.</span>
          <small>{o.cupo} · Diseño de MyB Digitals</small>
        </footer>
      </Escena>
    </main>
  );
}
