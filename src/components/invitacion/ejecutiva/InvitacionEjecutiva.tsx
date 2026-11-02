"use client";

import { useEffect, useRef, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionEjecutiva as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarRsvp } from "../usarRsvp";

/**
 * Estilos ejecutivos "Círculo privado" y "Entre platos": una misma estructura
 * (portada, agenda, lugar, confirmación) con dos pieles. "privado" empieza con
 * un sobre cuyas dos hojas se abren hacia los lados (1,2 s); "platos" entra
 * directo. Con el sobre cerrado el contenido queda `inert` y sin scroll.
 * Criterios: .claude/skills/invitacion-ejecutiva/SKILL.md
 */

export default function InvitacionEjecutiva({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const e = invitacion.ejecutiva;
  const privado = invitacion.estilo === "privado";
  const A = `/invitaciones/${invitacion.estilo}/`;
  const lugar = invitacion.lugares?.[0];
  const [cerrada, setCerrada] = useState(privado);
  const [abriendo, setAbriendo] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  const f = parsearFecha(invitacion.fecha, 20);
  const z = (n: number) => String(n).padStart(2, "0");
  const fechaCorta = f ? [z(f.getDate()), z(f.getMonth() + 1), String(f.getFullYear()).slice(2)].join(e.sepFecha) : "";
  const diaSemana = f ? f.toLocaleDateString("es-AR", { weekday: "long" }) : "";
  const diaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
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
    }, reducido ? 0 : 1200);
  };
  const volver = () => {
    window.scrollTo(0, 0);
    setCerrada(true);
    setTimeout(() => boton.current?.focus(), 0);
  };

  const r = usarRsvp({ slug: invitacion.slug, personal });
  const [t1, t2] = e.titulo;
  const linea = (txt: string, i: 0 | 1) => (e.enfasis === i ? <em>{txt}</em> : txt);

  return (
    <>
      {privado && cerrada && (
        <div className={`ej-entrada${abriendo ? " ej-entrada--abre" : ""}`}>
          <div className="ej-entrada__caja">
            <img className="ej-hoja ej-hoja--izq" src={`${A}hoja-izquierda.webp`} alt="" aria-hidden="true" />
            <img className="ej-hoja ej-hoja--der" src={`${A}hoja-derecha.webp`} alt="" aria-hidden="true" />
            <img className="ej-sobre" src={`${A}sobre.webp`} alt="" aria-hidden="true" />
            <p className="ej-entrada__titulo">
              {(e.sobre ?? "").toUpperCase()}
              <strong>{invitacion.nombres}</strong>
            </p>
            <button ref={boton} type="button" className="ej-sello" onClick={abrir} disabled={abriendo} aria-label="Abrir invitación" />
            <p className="ej-entrada__pista">TOCÁ EL SELLO PARA ABRIR</p>
          </div>
        </div>
      )}

      <main className={`inv-columna ej ej--${invitacion.estilo}`} {...(cerrada ? { inert: true } : {})}>
        {/* ── Portada ── */}
        <section id="portada" className="ej-portada">
          <img className="ej-portada__fondo" src={`${A}${privado ? "carta" : "portada"}.webp`} alt="" aria-hidden="true" decoding="async" />
          <div className="ej-portada__contenido">
            <p className="ej-anfitrion">{privado ? `${e.anfitrion.toUpperCase()} INVITA` : e.anfitrion.toUpperCase()}</p>
            <h1 ref={titulo} tabIndex={-1}>
              {linea(t1, 0)}
              <br />
              {linea(t2, 1)}
            </h1>
            <p className="ej-subtitulo">{e.subtitulo}</p>
            <p className="ej-cita">
              {e.cita[0]}
              <br />
              {e.cita[1]}
            </p>
            <div className="ej-fecha">
              <strong>{fechaCorta}</strong>
              <span>
                {diaCap} · {lugar?.hora} h
                {dias !== null && dias > 0 && <> · faltan {dias} días</>}
              </span>
            </div>
            <a className="ej-enlace" href="#asistencia">
              Confirmar asistencia ↗
            </a>
          </div>
          <a className="ej-bajar" href="#agenda">
            Descubrí el encuentro ↓
          </a>
        </section>

        {/* ── Agenda ── */}
        <section id="agenda" className="ej-agenda">
          <div className="ej-intro">
            <h2>
              {e.introTitulo[0]}
              <br />
              <em>{e.introTitulo[1]}</em>
            </h2>
            <p>{e.introTexto}</p>
          </div>
          <img className="ej-escena" src={`${A}${privado ? "mesa" : "plato"}.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <ol className="ej-tiempos">
            {e.agenda.map((a) => (
              <li key={a.hora}>
                <time>{a.etiqueta ? `${a.hora} · ${a.etiqueta.toUpperCase()}` : a.hora}</time>
                <div>
                  <strong>{a.titulo}</strong>
                  <p>{a.detalle}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="ej-fin">{e.cierreAgenda}</p>
        </section>

        {/* ── Lugar ── */}
        {lugar && (
          <section id="lugar" className="ej-lugar">
            <p className="ej-chico">NOS ENCONTRAMOS EN</p>
            <h2>
              {lugar.titulo.split(" ").slice(0, lugar.titulo.split(" ").length > 2 ? 2 : 1).join(" ")}
              <br />
              <em>{lugar.titulo.split(" ").slice(lugar.titulo.split(" ").length > 2 ? 2 : 1).join(" ")}</em>
            </h2>
            <p className="ej-direccion">{lugar.direccion.replace(/, ([^,]+)$/, " · $1")}</p>
            <a className="ej-boton ej-boton--claro" href={lugar.mapa} target="_blank" rel="noopener noreferrer">
              Cómo llegar <span aria-hidden="true">↗</span>
            </a>
            {invitacion.dressCode && (
              <div className="ej-vestimenta">
                <span className="ej-chico">VESTIMENTA</span>
                <strong>{invitacion.dressCode.titulo}</strong>
                <p>{invitacion.dressCode.detalle}</p>
              </div>
            )}
          </section>
        )}

        {/* ── Confirmación ── */}
        <section id="asistencia" className="ej-rsvp">
          <p className="ej-chico">{limite ? `CONFIRMÁ HASTA EL ${limite.toUpperCase()}` : "CONFIRMÁ TU ASISTENCIA"}</p>
          <h2>
            {e.rsvpTitulo[0]}
            <br />
            <em>{e.rsvpTitulo[1]}</em>
          </h2>
          <p className="ej-rsvp-intro">Dejanos tu respuesta para preparar cada detalle.</p>

          {r.cerrado && !personal ? (
            <p className="ej-rsvp-intro">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
          ) : r.enviado ? (
            <div className="ej-respuesta" role="status">
              <h3>{r.asiste ? "Tu lugar está reservado." : "Gracias por avisarnos."}</h3>
              <p>{r.asiste ? `Te esperamos el ${fechaLarga}.` : "Esperamos verte en la próxima."}</p>
              {personal && (
                <button type="button" className="ej-texto-boton" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                  Cambiar mi respuesta
                </button>
              )}
            </div>
          ) : (
            <div ref={r.formRef} className="ej-form">
              {!personal && (
                <label className="ej-campo">
                  <span>Nombre y apellido</span>
                  <input value={r.nombre} onChange={(ev) => r.setNombre(ev.target.value)} autoComplete="name" maxLength={40} />
                </label>
              )}
              <fieldset className="ej-campo">
                <legend>¿Nos acompañás?</legend>
                {[[true, "Sí, voy a estar"], [false, "No podré asistir"]].map(([valor, texto]) => (
                  <button key={String(valor)} type="button" className="ej-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                    <span className="ej-radio" aria-hidden="true" />
                    {texto as string}
                  </button>
                ))}
              </fieldset>
              {r.asiste === true && (
                <fieldset className="ej-campo">
                  <legend>Alimentación o accesibilidad</legend>
                  {COMIDAS.map((x) => (
                    <button key={x} type="button" className="ej-opcion" aria-pressed={r.comidas.includes(x)} onClick={() => r.alternarComida(x)}>
                      <span className="ej-radio ej-radio--cuadrado" aria-hidden="true" />
                      {x}
                    </button>
                  ))}
                </fieldset>
              )}
              {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="ej-aviso">Falta tu nombre y si vas a venir.</p>}
              {r.errorEnvio && <p role="alert" className="ej-aviso">{r.errorEnvio}</p>}
              <button type="button" className="ej-boton" onClick={r.enviar} disabled={r.enviando}>
                {r.enviando ? "Reservando tu lugar…" : "Enviar mi respuesta"} <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}

          <footer className="ej-footer">
            <em>{e.cierre}</em>
            <span>{e.anfitrion.toUpperCase()}</span>
            {privado && (
              <button type="button" onClick={volver}>
                Volver a abrir la carta
              </button>
            )}
            <small>Diseño de MyB Digitals</small>
          </footer>
        </section>
      </main>
    </>
  );
}
