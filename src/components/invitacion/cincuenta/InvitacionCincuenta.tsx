"use client";

import { useEffect, useRef, useState } from "react";
import type { InvitacionCincuenta as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { Personal } from "../personal";
import { usarRsvp } from "../usarRsvp";

/**
 * Estilo "Una carta, cincuenta historias": carta borgoña y marfil. Un sobre
 * con sello se abre al tocar (la solapa gira 850 ms y la carta asciende);
 * mientras está cerrado el contenido queda `inert` y sin scroll. Se puede
 * volver a ver el sobre desde el cierre. Criterios:
 * .claude/skills/invitacion-cincuenta/SKILL.md
 */

const A = "/invitaciones/carta/";

export default function InvitacionCincuenta({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const c = invitacion.cincuenta;
  const lugar = invitacion.lugares?.[0];
  const [cerrada, setCerrada] = useState(true);
  const [abriendo, setAbriendo] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const sello = useRef<HTMLButtonElement>(null);

  const [, dia] = invitacion.fecha.match(/(\d{1,2}) de (\S+)/) ?? [];
  const f = parsearFecha(invitacion.fecha, 20);
  const nMes = f ? String(f.getMonth() + 1).padStart(2, "0") : "";
  const diaSemana = f ? f.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase() : "";
  const fechaLarga = invitacion.fecha.replace(/ (\d{4})$/, " de $1").replace(/ de ([A-ZÁÉÍÓÚ])/, (_, l: string) => ` de ${l.toLowerCase()}`);
  const limite = invitacion.cierreRsvp?.replace(/^Confirmá antes del?\s*/i, "").replace(/\.$/, "");
  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => setDias(calcularFaltante(parsearFecha(invitacion.fecha, 20))?.d ?? 0), [invitacion.fecha]);

  useEffect(() => {
    if (!cerrada) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [cerrada]);

  const abrir = () => {
    if (abriendo) return;
    setAbriendo(true);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      setCerrada(false);
      setAbriendo(false);
      window.scrollTo(0, 0);
      titulo.current?.focus({ preventScroll: true });
    }, reducido ? 0 : 1300);
  };
  const volver = () => {
    window.scrollTo(0, 0);
    setCerrada(true);
    setTimeout(() => sello.current?.focus(), 0);
  };

  const r = usarRsvp({ slug: invitacion.slug, personal });

  return (
    <>
      {cerrada && (
        <div className={`ca-sobre${abriendo ? " ca-sobre--abre" : ""}`}>
          <div className="ca-sobre__interior">
            <div className="ca-previa" aria-hidden="true">
              Hay historias
              <br />
              que se celebran.
            </div>
            <div className="ca-pliegue ca-pliegue--izq" aria-hidden="true" />
            <div className="ca-pliegue ca-pliegue--der" aria-hidden="true" />
            <div className="ca-pliegue ca-pliegue--base" aria-hidden="true" />
            <div className="ca-solapa">
              <span>Una invitación para vos</span>
              <strong>{c.anios}</strong>
              <em>años</em>
            </div>
            <button ref={sello} type="button" className="ca-sello" onClick={abrir} disabled={abriendo} aria-label={`Abrir invitación de ${invitacion.nombres}`}>
              <img src={`${A}sello.webp`} alt="" aria-hidden="true" />
              <span>{c.inicial}</span>
            </button>
            <div className="ca-sobre__nombre">
              <span>Con cariño,</span>
              <strong>{invitacion.nombres}</strong>
            </div>
            <p className="ca-pista">TOCÁ EL SELLO PARA ABRIR</p>
          </div>
        </div>
      )}

      <main className="inv-columna ca" {...(cerrada ? { inert: true } : {})}>
        {/* ── Portada ── */}
        <section id="portada" className="ca-portada">
          <div className="ca-carta">
            <p className="ca-sobrelinea">ESTA CARTA ES PARA VOS</p>
            <div className="ca-cincuenta" aria-label={`${c.anios} años`}>
              <span>{c.anios}</span>
              <em>años de historias</em>
            </div>
            <h1 ref={titulo} tabIndex={-1}>
              {invitacion.nombres}
            </h1>
            <div className="ca-regla" />
            <p className="ca-personal">
              {c.frase[0]}
              <br />
              <em>{c.frase[1]}</em>
            </p>
            <div className="ca-fecha">
              <span>{diaSemana}</span>
              <strong>
                {dia?.padStart(2, "0")} <i>/</i> {nMes}
              </strong>
              <span>
                {f?.getFullYear()} · {lugar?.hora} H
              </span>
            </div>
            <a className="ca-enlace" href="#asistencia">
              Reservá tu lugar en mi mesa ↗
            </a>
            <span className="ca-pie">Una noche, los de siempre y mucho por celebrar.</span>
          </div>
          <a className="ca-bajar" href="#noche">
            {dias !== null && dias > 0 ? `Faltan ${dias} días · ` : ""}La noche que nos espera ↓
          </a>
        </section>

        {/* ── Noche ── */}
        <section id="noche" className="ca-noche">
          <div className="ca-foto">
            <img src={`${A}brindis.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <div className="ca-foto__nota">
              <em>{c.brindis}</em>
              <span>
                {c.detalleBrindis[0]}
                <br />
                {c.detalleBrindis[1]}
              </span>
            </div>
          </div>
          <div className="ca-noche__texto">
            <h2>
              Sin apuro.
              <br />
              <em>Con buena compañía.</em>
            </h2>
            <p>{c.intro}</p>
            <dl className="ca-agenda">
              {c.agenda.map((a) => (
                <div key={a.hora}>
                  <dt>{a.hora}</dt>
                  <dd>
                    {a.titulo}
                    <small>{a.detalle}</small>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Lugar ── */}
        {lugar && (
          <section id="lugar" className="ca-lugar">
            <div className="ca-tarjeta">
              <span className="ca-tarjeta__sobre">NOS ENCONTRAMOS EN</span>
              <h2>
                {lugar.titulo.split(" ")[0]}
                <br />
                <em>{lugar.titulo.split(" ").slice(1).join(" ")}</em>
              </h2>
              <div className="ca-sigla" aria-hidden="true">
                {c.sigla}
              </div>
              <p>{lugar.direccion.replace(/, ([^,]+)$/, "\n$1")}</p>
              <a className="ca-boton" href={lugar.mapa} target="_blank" rel="noopener noreferrer">
                Ver ubicación <span aria-hidden="true">↗</span>
              </a>
              {invitacion.dressCode && (
                <div className="ca-vestimenta">
                  <span>VESTIMENTA</span>
                  <strong>{invitacion.dressCode.titulo}</strong>
                  <p>{invitacion.dressCode.detalle}</p>
                </div>
              )}
            </div>
            <p className="ca-regalo">
              <em>{c.regalo[0]}</em>
              <br />
              {c.regalo[1]}
            </p>
          </section>
        )}

        {/* ── Confirmación ── */}
        <section id="asistencia" className="ca-asistencia">
          <p className="ca-sobrelinea">{limite ? `CONFIRMÁ HASTA EL ${limite.toUpperCase()}` : "CONFIRMÁ TU ASISTENCIA"}</p>
          <h2>
            Te guardo
            <br />
            <em>un lugar.</em>
          </h2>
          <p className="ca-intro">Dejame tu respuesta para organizar la mesa.</p>

          {r.cerrado && !personal ? (
            <p className="ca-intro">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
          ) : r.enviado ? (
            <div className="ca-respuesta" role="status">
              <h3>{r.asiste ? "Tu lugar está guardado." : "Gracias por avisarme."}</h3>
              <p>{r.asiste ? `Te espero el ${fechaLarga}.` : "Te voy a extrañar."}</p>
              {personal && (
                <button type="button" className="ca-texto-boton" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                  Cambiar mi respuesta
                </button>
              )}
            </div>
          ) : (
            <div ref={r.formRef} className="ca-form">
              {!personal && (
                <label className="ca-campo">
                  <span>Nombre y apellido</span>
                  <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} autoComplete="name" maxLength={40} />
                </label>
              )}
              <fieldset className="ca-campo">
                <legend>¿Venís a celebrar?</legend>
                {[[true, "Sí, ahí estaré"], [false, "No puedo ir"]].map(([valor, texto]) => (
                  <button key={String(valor)} type="button" className="ca-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                    <span className="ca-radio" aria-hidden="true" />
                    {texto as string}
                  </button>
                ))}
              </fieldset>
              {r.asiste === true && (
                <>
                  {c.cupo > 1 && (
                    <label className="ca-campo">
                      <span>Personas incluidas en tu invitación</span>
                      <select value={r.acompanantes} onChange={(e) => r.setAcompanantes(Number(e.target.value))}>
                        {Array.from({ length: c.cupo }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "persona" : "personas"}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <fieldset className="ca-campo">
                    <legend>Alimentación o accesibilidad</legend>
                    {COMIDAS.map((x) => (
                      <button key={x} type="button" className="ca-opcion" aria-pressed={r.comidas.includes(x)} onClick={() => r.alternarComida(x)}>
                        <span className="ca-radio ca-radio--cuadrado" aria-hidden="true" />
                        {x}
                      </button>
                    ))}
                  </fieldset>
                </>
              )}
              {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="ca-aviso">Falta tu nombre y si vas a venir.</p>}
              {r.errorEnvio && <p role="alert" className="ca-aviso">{r.errorEnvio}</p>}
              <button type="button" className="ca-boton" onClick={r.enviar} disabled={r.enviando}>
                {r.enviando ? "Guardando tu lugar…" : "Enviar mi respuesta"} <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}

          <footer className="ca-footer">
            <em>Nos vemos pronto,</em>
            <strong>{invitacion.nombres}</strong>
            <span>{c.despedida}</span>
            <button type="button" onClick={volver}>
              Volver a ver la carta
            </button>
            <small>Diseño de MyB Digitals</small>
          </footer>
        </section>
      </main>
    </>
  );
}
