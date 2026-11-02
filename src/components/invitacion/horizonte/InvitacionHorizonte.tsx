"use client";

import { useEffect, useRef, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionHorizonte as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";

/**
 * Estilo "Horizonte": la maqueta tomer-horizonte (diseño por capas, flujo GPT)
 * pasada al motor. Papel blanco, un panorama dibujado a tinta que se descubre,
 * dos acuarelas azules y una fiesta en azul noche. Entra con un sobre que se
 * abre. Criterios: .claude/skills/invitacion-horizonte/SKILL.md
 */

const A = "/invitaciones/horizonte/";
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const Estrella = () => (
  <svg className="hz-estrella" viewBox="0 0 60 60" aria-hidden="true">
    <path d="M30 7 50 43H10Z M30 53 10 17H50Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const Arte = ({ n, clase = "" }: { n: "horizonte" | "acuarela-clara" | "acuarela-profunda"; clase?: string }) => (
  <img className={`hz-arte ${clase}`} src={`${A}${n}.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />
);

const Olas = () => (
  <div className="hz-horizonte" aria-hidden="true">
    <Arte n="acuarela-clara" clase="hz-ola" />
    <Arte n="acuarela-profunda" clase="hz-ola hz-profunda" />
    <Arte n="horizonte" clase="hz-ciudad" />
  </div>
);

function Escena({ id, clase, activa = true, children }: { id: string; clase: string; activa?: boolean; children: React.ReactNode }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-8%");
  return (
    <section ref={ref} id={id} data-visible={visible && activa} className={`hz-escena hz-e-${clase}`}>
      {children}
    </section>
  );
}

export default function InvitacionHorizonte({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const h = invitacion.horizonte;
  const ceremonia = invitacion.lugares?.find((l) => l.tipo === "Ceremonia");
  const fiesta = invitacion.lugares?.find((l) => l.tipo === "Fiesta");
  const [dia, , anio] = invitacion.fecha.match(/(\d{1,2}) de (\S+) (\d{4})/)?.slice(1) ?? [];
  const fecha = parsearFecha(invitacion.fecha);
  const mes = fecha ? MESES[fecha.getMonth()] : "";
  const fechaLarga = `${dia} de ${mes} de ${anio}`;
  const lugar = (d?: { direccion: string }) => d?.direccion.replace(/, ([^,]+)$/, " · $1");

  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => setDias(calcularFaltante(parsearFecha(invitacion.fecha))?.d ?? 0), [invitacion.fecha]);

  /* ── El sobre ──
     Se dibuja en el servidor como una capa sobre el contenido, que también está
     en el HTML: sin JS (o para un buscador) no tapa nada. Con JS, el contenido
     queda inerte hasta que se abre y el foco pasa al título. */
  const [fase, setFase] = useState<"cerrado" | "abriendo" | "abierto">("cerrado");
  const main = useRef<HTMLElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (fase !== "cerrado") return;
    main.current?.setAttribute("inert", "");
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      main.current?.removeAttribute("inert");
      document.body.style.overflow = previo;
    };
  }, [fase]);

  const abrir = () => {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setFase("abriendo");
    setTimeout(
      () => {
        setFase("abierto");
        titulo.current?.focus({ preventScroll: true });
      },
      quieto ? 0 : 750,
    );
  };

  // El horizonte se desplaza apenas con el scroll (±9 px).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let pendiente = false;
    const mover = () => {
      pendiente = false;
      document.querySelectorAll<HTMLElement>(".hz-horizonte").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) el.style.setProperty("--viaje", `${Math.max(-9, Math.min(9, (innerHeight / 2 - r.top) * 0.02))}px`);
      });
    };
    const alScroll = () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(mover);
      }
    };
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  const r = usarRsvp({ slug: invitacion.slug, personal });

  return (
    <>
      <noscript>
        <style>{".hz-apertura{display:none!important}"}</style>
      </noscript>
      {fase !== "abierto" && (
        <div className={`hz-apertura${fase === "abriendo" ? " hz-abierto" : ""}`} role="region" aria-label={`Abrir la invitación de ${invitacion.nombres}`}>
          <div className="hz-sobre">
            <div className="hz-solapa" />
            <div className="hz-sobre-contenido">
              <Estrella />
              <p>Una invitación para vos</p>
              <p className="hz-sobre-nombre">{invitacion.nombres}</p>
              <p>{h.evento}</p>
              <button id="hz-abrir" type="button" className="hz-abrir" onClick={abrir} disabled={fase === "abriendo"}>
                Abrir invitación <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main ref={main} className="inv-columna hz">
        {/* ── Portada ── */}
        <Escena id="portada" clase="portada" activa={fase === "abierto"}>
          <div className="hz-portada-texto">
            <Estrella />
            <p className="hz-invitacion">Con mucha alegría, te invito a mi</p>
            <p className="hz-caligrafia">Bar Mitzvá</p>
            <h1 ref={titulo} tabIndex={-1}>
              {invitacion.nombres}
            </h1>
            <div className="hz-fecha-portada">
              <span>{dia}</span>
              <div>
                {mes.toUpperCase()}
                <br />
                {anio}
              </div>
            </div>
            <p className="hz-ciudad-nombre">{h.ciudad}</p>
            {dias !== null && dias > 0 && <p className="hz-faltan">faltan {dias} días</p>}
          </div>
          <Olas />
          <a className="hz-descubrir" href="#mensaje" aria-label="Descubrir la invitación">
            Un día para compartir <span aria-hidden="true">↓</span>
          </a>
        </Escena>

        {personal && (
          <Escena id="saludo" clase="saludo">
            <div className="hz-contenido">
              <p className="hz-caligrafia">{personal.saludo}</p>
              {personal.nota && <p className="hz-descripcion">{personal.nota}</p>}
            </div>
          </Escena>
        )}

        {/* ── Mensaje ── */}
        <Escena id="mensaje" clase="mensaje">
          <Arte n="acuarela-clara" clase="hz-borde-mensaje" />
          <div className="hz-mensaje-texto">
            <p className="hz-familia">{h.familia}</p>
            <h2>
              Lo que viene
              <br />
              es más lindo
              <br />
              <em>con vos.</em>
            </h2>
            <p className="hz-carta">{h.mensaje}</p>
            <p className="hz-firma">{invitacion.nombres}</p>
          </div>
          <Arte n="horizonte" clase="hz-ciudad-mensaje" />
        </Escena>

        {/* ── Ceremonia ── */}
        {ceremonia && (
          <Escena id="ceremonia" clase="ceremonia">
            <div className="hz-ceremonia-dibujo">
              <Arte n="horizonte" />
            </div>
            <div className="hz-contenido">
              <p className="hz-caligrafia">El comienzo</p>
              <h2>La ceremonia</h2>
              <div className="hz-hora-fecha">
                <p className="hz-hora">{ceremonia.hora} hs</p>
                <p>{fechaLarga}</p>
              </div>
              <h3>{ceremonia.titulo}</h3>
              <p className="hz-direccion">{lugar(ceremonia)}</p>
              <p className="hz-descripcion">{h.notaCeremonia}</p>
              {h.parasha && (
                <p className="hz-parasha">
                  Leo la parashá <strong>{h.parasha.nombre}</strong>{" "}
                  <span lang="he" dir="rtl">
                    {h.parasha.hebreo}
                  </span>
                  <br />
                  {h.parasha.fechaHebrea}
                </p>
              )}
              <a className="hz-boton hz-boton--enlace" href={ceremonia.mapa} target="_blank" rel="noopener noreferrer">
                Cómo llegar <span aria-hidden="true">↗</span>
              </a>
            </div>
          </Escena>
        )}

        {/* ── Fiesta (azul noche) ── */}
        {fiesta && (
          <Escena id="fiesta" clase="fiesta">
            <Arte n="acuarela-clara" clase="hz-lavado" />
            <Arte n="acuarela-profunda" clase="hz-profundo" />
            <div className="hz-fiesta-texto">
              <p className="hz-caligrafia">Y después…</p>
              <h2>
                Que empiece
                <br />
                <em>la fiesta.</em>
              </h2>
              <p className="hz-descripcion">{h.notaFiesta}</p>
              <p className="hz-hora">{fiesta.hora} hs</p>
              <h3>{fiesta.titulo}</h3>
              <p className="hz-direccion">{lugar(fiesta)}</p>
              <a className="hz-boton hz-boton--enlace" href={fiesta.mapa} target="_blank" rel="noopener noreferrer">
                Cómo llegar <span aria-hidden="true">↗</span>
              </a>
              <p className="hz-ultimo">{h.finFiesta}</p>
            </div>
          </Escena>
        )}

        {/* ── Detalles ── */}
        <Escena id="detalles" clase="detalles">
          <Arte n="acuarela-clara" clase="hz-borde-detalles" />
          <div className="hz-detalles-texto">
            <p className="hz-caligrafia">Para disfrutar</p>
            <h2>
              Cada detalle
              <br />
              también cuenta.
            </h2>
            {invitacion.dressCode && (
              <div className="hz-detalle">
                <h3>El look</h3>
                <p className="hz-destacado">{invitacion.dressCode.titulo}</p>
                <p>{invitacion.dressCode.detalle}</p>
              </div>
            )}
            <div className="hz-detalle">
              <h3>A la mesa</h3>
              <p>{h.comida}</p>
            </div>
            {h.regalos && (
              <div className="hz-detalle hz-regalo">
                <h3>El mejor regalo</h3>
                <p>{h.regalos}</p>
              </div>
            )}
          </div>
        </Escena>

        {/* ── Asistencia ── */}
        <Escena id="asistencia" clase="asistencia">
          <div className="hz-rsvp-contenido">
            <Estrella />
            <p className="hz-caligrafia">Te espero</p>
            <h2>¿Me acompañás?</h2>
            {invitacion.cierreRsvp && <p className="hz-limite">{invitacion.cierreRsvp}</p>}

            {r.cerrado && !personal ? (
              <p className="hz-descripcion">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
            ) : r.enviado ? (
              <div className="hz-respuesta">
                <h3>{r.asiste ? "¡Gracias por confirmar!" : "Gracias por avisar"}</h3>
                <p>
                  {r.asiste
                    ? personal
                      ? `Anotamos ${r.acompanantes === 1 ? "1 persona" : `${r.acompanantes} personas`}. Nos vemos pronto.`
                      : `Ya estás en la lista${r.acompanantes > 1 ? ` con ${r.acompanantes - 1} más` : ""}. Nos vemos pronto.`
                    : "Te vamos a extrañar. Gracias por avisarnos."}
                </p>
                {personal && (
                  <button type="button" className="hz-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                    cambiar la respuesta
                  </button>
                )}
              </div>
            ) : (
              <div ref={r.formRef} className="hz-formulario">
                {!personal && (
                  <label className="hz-campo">
                    <span>Nombre y apellido</span>
                    <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} placeholder="Tu nombre completo" autoComplete="name" maxLength={40} />
                  </label>
                )}
                <fieldset className="hz-campo">
                  <legend>{personal ? "¿Vienen?" : "¿Venís?"}</legend>
                  {[[true, "Sí, voy a compartir el día"], [false, "No voy a poder asistir"]].map(([valor, texto]) => (
                    <button key={String(valor)} type="button" className="hz-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                      <span className="hz-casilla" aria-hidden="true" />
                      {texto as string}
                    </button>
                  ))}
                </fieldset>
                {r.asiste === true && (
                  <>
                    {(!personal || r.cupo > 1) && (
                      <label className="hz-campo">
                        <span>{personal && r.cupo > 1 ? `Cuántos vienen, de ${r.cupo}` : "Personas en tu invitación"}</span>
                        <input type="number" inputMode="numeric" min={1} max={r.cupo} value={r.acompanantes} onChange={(e) => r.setAcompanantes(Number(e.target.value))} />
                      </label>
                    )}
                    <fieldset className="hz-campo">
                      <legend>Alergias o necesidades alimentarias</legend>
                      {COMIDAS.map((c) => (
                        <button key={c} type="button" className="hz-opcion" aria-pressed={r.comidas.includes(c)} onClick={() => r.alternarComida(c)}>
                          <span className="hz-casilla" aria-hidden="true" />
                          {c}
                        </button>
                      ))}
                    </fieldset>
                    {!personal && (
                      <label className="hz-campo">
                        <span>La canción para la pista</span>
                        <input value={r.cancion} onChange={(e) => r.setCancion(e.target.value)} placeholder="Tema y artista" />
                      </label>
                    )}
                  </>
                )}
                {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="hz-aviso">Falta tu nombre y si venís</p>}
                {r.errorEnvio && <p role="alert" className="hz-aviso">{r.errorEnvio}</p>}
                <button type="button" className="hz-boton hz-boton--lleno" onClick={r.enviar} disabled={r.enviando}>
                  {r.enviando ? "Enviando…" : "Confirmar asistencia"} <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>
        </Escena>

        {/* ── Cierre ── */}
        <Escena id="cierre" clase="cierre">
          <div className="hz-cierre-texto">
            <p className="hz-caligrafia">Este recuerdo</p>
            <h2>
              Lo hacemos
              <br />
              <em>juntos.</em>
            </h2>
            <p className="hz-firma">{invitacion.nombres}</p>
            <p>
              {h.evento}
              <br />
              {fechaLarga}
            </p>
            <a className="hz-volver" href="#asistencia">
              Confirmar asistencia ↗
            </a>
          </div>
          <Olas />
        </Escena>
      </main>
    </>
  );
}
