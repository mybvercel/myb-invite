"use client";

import { useEffect, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionCeramica as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";

/**
 * Estilo "Cerámica": la maqueta azul-ceramica (flujo GPT) pasada al motor.
 * Marfil, cobalto y azul grisáceo; la guarda de cerámica impresa conduce el
 * recorrido (dos bordes en la portada, uno lateral en la ceremonia, una cenefa
 * en la fiesta) y se descubre al entrar cada escena. Criterios:
 * .claude/skills/invitacion-ceramica/SKILL.md
 */

const A = "/invitaciones/ceramica/";

function Guarda({ lado }: { lado: "izq" | "der" | "lateral" }) {
  return <span className={`ce-guarda ce-guarda--${lado}`} aria-hidden="true" />;
}

function Rama({ clase = "" }: { clase?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${A}rama.webp`} alt="" aria-hidden="true" className={`ce-rama ${clase}`} loading="lazy" decoding="async" />;
}

function Escena({ id, children }: { id: string; children: React.ReactNode }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-8%");
  return (
    <section ref={ref} id={id} data-visible={visible} className={`ce-escena ce-e-${id}`}>
      {children}
    </section>
  );
}

const Estrella = () => (
  <svg className="ce-estrella" viewBox="0 0 40 44" aria-hidden="true">
    <path d="M20 3 L35 29 L5 29 Z M20 41 L5 15 L35 15 Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
  </svg>
);

export default function InvitacionCeramica({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const c = invitacion.ceramica;
  const ceremonia = invitacion.lugares?.find((l) => l.tipo === "Ceremonia");
  const fiesta = invitacion.lugares?.find((l) => l.tipo === "Fiesta");
  const fechaLarga = invitacion.fecha.replace(/ (\d{4})$/, " de $1").replace(/ de ([A-ZÁÉÍÓÚ])/, (_, l: string) => ` de ${l.toLowerCase()}`);
  const direccion = (d?: string) => d?.replace(/, ([^,]+)$/, " · $1");

  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => setDias(calcularFaltante(parsearFecha(invitacion.fecha))?.d ?? 0), [invitacion.fecha]);

  const r = usarRsvp({ slug: invitacion.slug, personal });
  const tope = personal ? personal.cupo : 6;

  return (
    <main className="inv-columna ce">
      {/* ── Portada ── */}
      <Escena id="portada">
        <div className="ce-marco">
          <Guarda lado="izq" />
          <Guarda lado="der" />
          <div className="ce-cont ce-portada">
            <Estrella />
            <p className="ce-frase">Con mucha alegría, te invito a compartir</p>
            <h1>
              {invitacion.nombres}
              {c.apellido && <span>{c.apellido}</span>}
            </h1>
            <p className="ce-tipo">{c.evento}</p>
            <Rama clase="ce-rama--chica" />
            <p className="ce-fecha">{fechaLarga}</p>
            <p className="ce-ciudad">{c.ciudad}</p>
            <a className="ce-seguir" href="#mensaje" aria-label="Descubrir la invitación">
              Deslizá para descubrir <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </Escena>

      {/* ── En familia ── */}
      <Escena id="mensaje">
        <div className="ce-cont ce-intima">
          <Rama clase="ce-rama--grande" />
          {personal && <p className="ce-saludo">{personal.saludo}</p>}
          <p className="ce-familia">{c.familia}</p>
          <h2>
            Un día que quiero
            <br />
            compartir con vos.
          </h2>
          <p className="ce-carta">{c.mensaje}</p>
          {personal?.nota && <p className="ce-carta">{personal.nota}</p>}
          {c.firma && <p className="ce-firma">{c.firma}</p>}
          <span className="ce-linea" />
          <p className="ce-fecha">{fechaLarga}</p>
          {dias !== null && dias > 0 && <p className="ce-faltan">Faltan {dias} días</p>}
        </div>
      </Escena>

      {/* ── Ceremonia ── */}
      {ceremonia && (
        <Escena id="ceremonia">
          <Guarda lado="lateral" />
          <div className="ce-cont">
            <p className="ce-gesto">Nos encontramos por la mañana</p>
            <h2>La ceremonia</h2>
            <p className="ce-hora">{ceremonia.hora} hs</p>
            {c.parasha && (
              <p className="ce-parasha">
                Voy a leer la parashá <strong>{c.parasha.nombre}</strong>
                <span lang="he" dir="rtl">
                  {c.parasha.hebreo}
                </span>
                <em>{c.parasha.fechaHebrea}</em>
              </p>
            )}
            <span className="ce-linea" />
            <h3>{ceremonia.titulo}</h3>
            <p className="ce-direccion">{direccion(ceremonia.direccion)}</p>
            <p className="ce-texto">{c.notaCeremonia}</p>
            <a className="ce-boton" href={ceremonia.mapa} target="_blank" rel="noopener noreferrer">
              Ver ubicación <span aria-hidden="true">↗</span>
            </a>
            <Rama clase="ce-rama--chica" />
          </div>
        </Escena>
      )}

      {/* ── Fiesta ── */}
      {fiesta && (
        <Escena id="fiesta">
          <span className="ce-cenefa" aria-hidden="true" />
          <div className="ce-cont">
            <p className="ce-gesto">Y cuando cae el sol…</p>
            <h2>¡A celebrar!</h2>
            <p className="ce-hora">{fiesta.hora} hs</p>
            <h3>{fiesta.titulo}</h3>
            <p className="ce-direccion">{direccion(fiesta.direccion)}</p>
            <p className="ce-texto">{c.notaFiesta}</p>
            <a className="ce-boton" href={fiesta.mapa} target="_blank" rel="noopener noreferrer">
              Ver ubicación <span aria-hidden="true">↗</span>
            </a>
            <p className="ce-despedida">{c.finFiesta}</p>
          </div>
        </Escena>
      )}

      {/* ── Los detalles ── */}
      <Escena id="detalles">
        <div className="ce-cont ce-borde">
          <h2>Los detalles</h2>
          <Rama clase="ce-rama--chica" />
          {invitacion.dressCode && (
            <>
              <h3>¿Qué me pongo?</h3>
              <p className="ce-dress">{invitacion.dressCode.titulo}</p>
              <p>{invitacion.dressCode.detalle}</p>
              <span className="ce-linea" />
            </>
          )}
          <h3>A la mesa</h3>
          <p>{c.comida}</p>
          {c.regalos && (
            <>
              <span className="ce-linea" />
              <h3>Tu presencia</h3>
              <p>{c.regalos}</p>
            </>
          )}
        </div>
      </Escena>

      {/* ── Asistencia ── */}
      <Escena id="asistencia">
        <div className="ce-cont ce-rsvp">
          <Rama clase="ce-rama--chica" />
          <h2>¿Me acompañás?</h2>
          {invitacion.cierreRsvp && <p className="ce-limite">{invitacion.cierreRsvp}</p>}

          {r.cerrado && !personal ? (
            <p className="ce-limite">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
          ) : r.enviado ? (
            <div className="ce-respuesta">
              <h3>{r.asiste ? "¡Gracias por confirmar!" : "Gracias por avisar"}</h3>
              <p>
                {r.asiste
                  ? `Anotamos ${r.acompanantes === 1 ? "1 persona" : `${r.acompanantes} personas`}. Nos vemos en la ceremonia y en la fiesta.`
                  : "Te vamos a extrañar. Gracias por avisarme."}
              </p>
              {personal && (
                <button type="button" className="ce-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                  cambiar la respuesta
                </button>
              )}
            </div>
          ) : (
            <div ref={r.formRef} className="ce-formulario">
              {!personal && (
                <label className="ce-campo">
                  <span>Nombre y apellido</span>
                  <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} placeholder="Tu nombre completo" autoComplete="name" maxLength={40} />
                </label>
              )}
              <fieldset className="ce-campo">
                <legend>{personal ? "¿Vienen?" : "¿Venís?"}</legend>
                {[[true, "Sí, ahí estaré"], [false, "No voy a poder asistir"]].map(([valor, texto]) => (
                  <button key={String(valor)} type="button" className="ce-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                    <span className="ce-casilla" aria-hidden="true" />
                    {texto as string}
                  </button>
                ))}
              </fieldset>
              {r.asiste === true && (
                <>
                  {tope > 1 && (
                    <label className="ce-campo">
                      <span>{personal ? `Cuántos vienen, de ${tope}` : "Personas que vienen"}</span>
                      <select value={r.acompanantes} onChange={(e) => r.setAcompanantes(Number(e.target.value))}>
                        {Array.from({ length: tope }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "persona" : "personas"}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <fieldset className="ce-campo">
                    <legend>Alergias o necesidades alimentarias</legend>
                    {COMIDAS.map((comida) => (
                      <button key={comida} type="button" className="ce-opcion" aria-pressed={r.comidas.includes(comida)} onClick={() => r.alternarComida(comida)}>
                        <span className="ce-casilla ce-casilla--cuadrada" aria-hidden="true" />
                        {comida}
                      </button>
                    ))}
                  </fieldset>
                </>
              )}
              {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="ce-aviso">Falta tu nombre y si venís</p>}
              {r.errorEnvio && <p role="alert" className="ce-aviso">{r.errorEnvio}</p>}
              <button type="button" className="ce-boton ce-boton--lleno" onClick={r.enviar} disabled={r.enviando}>
                {r.enviando ? "Enviando…" : "Confirmar asistencia"} <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </Escena>

      {/* ── Cierre ── */}
      <Escena id="cierre">
        <Guarda lado="izq" />
        <Guarda lado="der" />
        <div className="ce-cont ce-cierre">
          <Rama clase="ce-rama--chica" />
          <h2>
            Con vos,
            <br />
            mucho más especial.
          </h2>
          {c.firma && <p className="ce-firma">{c.firma}</p>}
          <p>
            {c.evento}
            <br />
            {fechaLarga}
          </p>
          <span className="ce-linea" />
          <p className="ce-creditos">MyB Digitals</p>
        </div>
      </Escena>
    </main>
  );
}
