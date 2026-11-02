"use client";

import { useEffect, useRef, useState } from "react";
import type { InvitacionJardin as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { Personal } from "../personal";
import { usarRsvp } from "../usarRsvp";

/**
 * Estilo "Jardín al anochecer": quince años en lila y ciruela. Una puerta de
 * dos hojas de papel se abre al tocar el sello (1,5 s, una sola vez); mientras
 * está cerrada el contenido queda `inert` y sin scroll. Las flores son
 * recortes PNG con alfa posicionados por CSS. Criterios:
 * .claude/skills/invitacion-jardin/SKILL.md
 */

const A = "/invitaciones/jardin/";

export default function InvitacionJardin({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const j = invitacion.jardin;
  const lugar = invitacion.lugares?.[0];
  const [abierta, setAbierta] = useState(false);
  const [abriendo, setAbriendo] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);

  const [, dia, mes] = invitacion.fecha.match(/(\d{1,2}) de (\S+)/) ?? [];
  const f = parsearFecha(invitacion.fecha, 21);
  const nMes = f ? String(f.getMonth() + 1).padStart(2, "0") : "";
  const diaSemana = f ? f.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase() : "";
  const fechaLarga = invitacion.fecha.replace(/ (\d{4})$/, " de $1").replace(/ de ([A-ZÁÉÍÓÚ])/, (_, l: string) => ` de ${l.toLowerCase()}`);
  const limite = invitacion.cierreRsvp?.replace(/^Confirmá antes del?\s*/i, "").replace(/\.$/, "");
  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => setDias(calcularFaltante(parsearFecha(invitacion.fecha, 21))?.d ?? 0), [invitacion.fecha]);

  // Con la puerta cerrada no hay scroll.
  useEffect(() => {
    if (abierta) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierta]);

  const abrir = () => {
    if (abriendo) return;
    setAbriendo(true);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      setAbierta(true);
      window.scrollTo(0, 0);
      titulo.current?.focus({ preventScroll: true });
    }, reducido ? 0 : 1500);
  };

  const r = usarRsvp({ slug: invitacion.slug, personal });

  return (
    <>
      {!abierta && (
        <div className={`ja-puerta${abriendo ? " ja-puerta--abre" : ""}`} role="dialog" aria-modal="true" aria-label="Una invitación para vos">
          {(["izq", "der"] as const).map((lado) => (
            <div key={lado} className={`ja-hoja ja-hoja--${lado}`}>
              <div className="ja-hoja__arco" />
              <img src={`${A}rosas.webp`} alt="" aria-hidden="true" decoding="async" />
            </div>
          ))}
          <div className="ja-puerta__texto">
            <p>UNA NOCHE PARA FLORECER</p>
            <span className="ja-puerta__nombre">{invitacion.nombres}</span>
            <p>{invitacion.volanta.toUpperCase()}</p>
          </div>
          <button type="button" className="ja-sello" onClick={abrir} disabled={abriendo} aria-label={`Abrir invitación de ${invitacion.nombres}`}>
            <span className="ja-sello__marca">{j.inicial}</span>
            <span className="ja-sello__toca">Tocá para abrir</span>
          </button>
          <p className="ja-puerta__fecha">
            {dia} · {mes?.toUpperCase()} · {f?.getFullYear()}
          </p>
        </div>
      )}

      <main className="inv-columna ja" {...(!abierta ? { inert: true } : {})}>
        {/* ── Portada ── */}
        <section id="portada" className="ja-portada">
          <img className="ja-portada__flor-alta" src={`${A}rosas.webp`} alt="" aria-hidden="true" />
          <div className="ja-arco" aria-hidden="true" />
          <div className="ja-portada__texto">
            <p className="ja-sobre">{invitacion.volanta.toUpperCase()}</p>
            <h1 ref={titulo} tabIndex={-1}>
              {invitacion.nombres}
            </h1>
            <p className="ja-frase">
              {j.frase[0]}
              <br />
              <em>{j.frase[1]}</em>
            </p>
          </div>
          <span className="ja-xv" aria-hidden="true">
            XV
          </span>
          <img className="ja-portada__flor-baja" src={`${A}rosas.webp`} alt="" aria-hidden="true" />
          <div className="ja-fecha">
            <span>{diaSemana}</span>
            <strong>
              {dia?.padStart(2, "0")}.{nMes}
            </strong>
            <span>
              {f?.getFullYear()} · {lugar?.hora.slice(0, 2)} H
            </span>
          </div>
          <a className="ja-boton ja-portada__cta" href="#asistencia">
            Confirmar asistencia <span aria-hidden="true">↗</span>
          </a>
          <a className="ja-bajar" href="#noche">
            {dias !== null && dias > 0 ? `Faltan ${dias} días · ` : ""}Conocé mi noche ↓
          </a>
        </section>

        {/* ── Noche + lugar ── */}
        <section id="noche" className="ja-noche">
          <div className="ja-papel">
            <h2>
              Todo empieza
              <br />
              <em>con un encuentro.</em>
            </h2>
            <p className="ja-intro">
              La cuenta regresiva termina acá.
              <br />
              La fiesta recién empieza.
            </p>
            <ol className="ja-agenda">
              {j.agenda.map((a) => (
                <li key={a.hora}>
                  <time>{a.hora}</time>
                  <span>
                    <strong>{a.titulo}</strong>
                    {a.detalle}
                  </span>
                </li>
              ))}
            </ol>
            <p className="ja-fin">{j.cierre}</p>
          </div>
          {lugar && (
            <div className="ja-lugar">
              <span className="ja-lugar__sobre">NOS ENCONTRAMOS EN</span>
              <h2>
                {lugar.titulo.split(" ").slice(0, 1)}
                <br />
                <em>{lugar.titulo.split(" ").slice(1).join(" ")}</em>
              </h2>
              <p>{lugar.direccion.replace(/, ([^,]+)$/, "\n$1")}</p>
              <a className="ja-boton ja-boton--linea" href={lugar.mapa} target="_blank" rel="noopener noreferrer">
                Cómo llegar <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}
          <img className="ja-flores-altas" src={`${A}flores-altas.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        </section>

        {/* ── Detalles ── */}
        <section id="detalles" className="ja-detalles">
          <p className="ja-sobre">PARA ESTA NOCHE</p>
          <h2>
            Un toque
            <br />
            <em>de elegancia.</em>
          </h2>
          <p className="ja-detalles__texto">
            Vestimenta {invitacion.dressCode?.titulo.toLowerCase()}.
            <br />
            {invitacion.dressCode?.detalle}
          </p>
          <div className="ja-paleta" aria-label="Colores de inspiración">
            {j.paleta.map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
          <div className="ja-regalo">
            <span className="ja-regalo__marca" aria-hidden="true">
              {j.inicial}
            </span>
            <h3>
              El mejor regalo
              <br />
              es que estés.
            </h3>
            <p>{j.regalo}</p>
          </div>
        </section>

        {/* ── Confirmación ── */}
        <section id="asistencia" className="ja-asistencia">
          <div className="ja-papel ja-papel--form">
            <p className="ja-sobre">{limite ? `HASTA EL ${limite.toUpperCase()}` : "CONFIRMÁ TU ASISTENCIA"}</p>
            <h2>
              Guardé un lugar
              <br />
              <em>para vos.</em>
            </h2>
            <p className="ja-intro">Contame si venís, así preparo cada detalle.</p>

            {r.cerrado && !personal ? (
              <p className="ja-intro">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
            ) : r.enviado ? (
              <div className="ja-respuesta" role="status">
                <h3>{r.asiste ? "¡Tu lugar está guardado!" : "Gracias por avisarme."}</h3>
                <p>{r.asiste ? `Te espero el ${fechaLarga}.` : "Te voy a extrañar."}</p>
                {personal && (
                  <button type="button" className="ja-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                    Cambiar mi respuesta
                  </button>
                )}
              </div>
            ) : (
              <div ref={r.formRef} className="ja-form">
                {!personal && (
                  <label className="ja-campo">
                    <span>Nombre y apellido</span>
                    <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} autoComplete="name" maxLength={40} />
                  </label>
                )}
                <fieldset className="ja-campo">
                  <legend>¿Me acompañás?</legend>
                  {[[true, "¡Sí, voy!"], [false, "No podré ir"]].map(([valor, texto]) => (
                    <button key={String(valor)} type="button" className="ja-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                      <span className="ja-radio" aria-hidden="true" />
                      {texto as string}
                    </button>
                  ))}
                </fieldset>
                {r.asiste === true && (
                  <fieldset className="ja-campo">
                    <legend>Alimentación o accesibilidad</legend>
                    {COMIDAS.map((c) => (
                      <button key={c} type="button" className="ja-opcion" aria-pressed={r.comidas.includes(c)} onClick={() => r.alternarComida(c)}>
                        <span className="ja-radio ja-radio--cuadrado" aria-hidden="true" />
                        {c}
                      </button>
                    ))}
                  </fieldset>
                )}
                {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="ja-aviso">Falta tu nombre y si vas a venir.</p>}
                {r.errorEnvio && <p role="alert" className="ja-aviso">{r.errorEnvio}</p>}
                <button type="button" className="ja-boton" onClick={r.enviar} disabled={r.enviando}>
                  {r.enviando ? "Guardando tu lugar…" : "Enviar mi respuesta"} <span aria-hidden="true">↗</span>
                </button>
              </div>
            )}
          </div>

          <div className="ja-despedida">
            <img src={`${A}rosas.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <p>
              {j.despedida[0]}
              <br />
              <em>{j.despedida[1]}</em>
            </p>
            <span>{invitacion.nombres}</span>
            <small>Diseño de MyB Digitals</small>
          </div>
        </section>
      </main>
    </>
  );
}
