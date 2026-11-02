"use client";

import { useState } from "react";
import { fechaConPuntos } from "@/invitaciones/fecha";
import type { InvitacionFotomaton } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";

/**
 * "La función": todo lo que sigue al collage, como el programa de una noche de
 * teatro. Sigue sobre el mismo terciopelo, que se va oscureciendo, y la
 * información va en objetos de papel apoyados encima, cada uno torcido a su
 * manera y fuera del eje: un programa de sala, dos entradas con talón, un
 * ticket de caja, la entrada que se sella al confirmar, y la polaroid.
 *
 * Nada centrado por default. Los títulos van gigantes, en itálica, y se salen
 * del borde derecho; el texto va alineado a la izquierda, en columnas angostas
 * corridas. Sin etiquetas chiquitas encima de los títulos ("N.º 02 · ..."):
 * Benja las prohibió, el título solo alcanza. Ver la skill `invitacion-fotomaton`.
 */

type Estilo = React.CSSProperties & Record<`--${string}`, string>;
const v = (d: number, giro = 0): Estilo => ({ "--d": `${d}ms`, "--giro": `${giro}deg` });

function Escena({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, visible] = usarEnVista<HTMLElement>();
  return (
    <section ref={ref} data-visible={visible} className={`fn-escena ${className}`}>
      {children}
    </section>
  );
}

function Encabezado({ titulo }: { titulo: string }) {
  return (
    <header className="fn-encabezado">
      <h2 className="fn-titulo fn-entra fn-entra--lado" style={v(0)}>
        {titulo}
      </h2>
    </header>
  );
}

/* ── Programa de sala ── */
function Programa({ hitos, pie }: { hitos: { hora: string; titulo: string }[]; pie: string }) {
  return (
    <Escena>
      <Encabezado titulo="El programa" />
      <article className="fn-papel fn-programa fn-entra" style={v(260, 1.6)}>
        <p className="fn-mono fn-programa__cabeza">Programa de la noche</p>
        <ol>
          {hitos.map((h, i) => (
            <li key={`${h.hora}-${h.titulo}-${i}`} className="fn-programa__fila">
              <span className="fn-programa__hora">{h.hora}</span>
              <span className="fn-programa__guia" aria-hidden="true" />
              <span className="fn-mono">{h.titulo}</span>
            </li>
          ))}
        </ol>
        <p className="fn-mono fn-programa__pie">{pie}</p>
      </article>
    </Escena>
  );
}

/* ── Entradas con talón ── */
function Boletos({ lugares }: { lugares: InvitacionFotomaton["lugares"] }) {
  if (!lugares?.length) return null;
  return (
    <Escena>
      <Encabezado titulo="Dónde" />
      <div className="fn-boletos">
        {lugares.map((l, i) => (
          <article
            key={`${l.tipo}-${l.titulo}-${i}`}
            className={`fn-sombra fn-entra ${i % 2 ? "fn-boleto--der" : "fn-boleto--izq"}`}
            style={v(260 + i * 220, i % 2 ? 2.4 : -2.8)}
          >
            <div className="fn-boleto">
              <div className="fn-boleto__cuerpo">
                <p className="fn-mono fn-rojo">{l.tipo}</p>
                <h3 className="fn-boleto__lugar">{l.titulo}</h3>
                <p className="fn-boleto__dir">{l.direccion}</p>
                <p className="fn-mono fn-boleto__hora">{l.hora}</p>
              </div>
              {/* El talón es el link: lo que se arranca para ir. */}
              <a className="fn-boleto__talon" href={l.mapa} target="_blank" rel="noopener noreferrer">
                <span className="fn-mono">Cómo llegar</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </Escena>
  );
}

/* ── Vestimenta ── */
function Vestimenta({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <Escena className="fn-vestimenta">
      <Encabezado titulo="Vestimenta" />
      {/* La palabra es la sección: gigante, cruzando todo el ancho. */}
      <p className="fn-gigante fn-entra fn-entra--lado" style={v(160)}>
        {titulo}
      </p>
      <p className="fn-texto fn-vestimenta__detalle fn-entra" style={v(320)}>
        {detalle}
      </p>
    </Escena>
  );
}

/* ── Ticket de regalos ── */
function LineaTicket({ etiqueta, valor, copiable }: { etiqueta: string; valor: string; copiable: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sin permiso de portapapeles, el dato igual está a la vista.
    }
  };
  return (
    <li className="fn-ticket__linea">
      <span className="fn-mono fn-ticket__etiqueta">{etiqueta}</span>
      <span className="fn-ticket__valor">{valor}</span>
      {copiable && (
        <button type="button" onClick={copiar} className="fn-mono fn-ticket__copiar" aria-live="polite">
          {copiado ? "Copiado" : "Copiar"}
        </button>
      )}
    </li>
  );
}

function Regalos({ regalo, nombres }: { regalo: NonNullable<InvitacionFotomaton["regalo"]>; nombres: string }) {
  return (
    <Escena>
      <Encabezado titulo="Regalos" />
      <p className="fn-texto fn-regalos__mensaje fn-entra" style={v(220)}>
        {regalo.mensaje}
      </p>
      <article className="fn-sombra fn-ticket-marco fn-entra" style={v(380, -1.8)}>
        <div className="fn-papel fn-ticket">
          <p className="fn-mono fn-ticket__cabeza">{nombres}</p>
          <p className="fn-mono fn-ticket__sub">Ticket de regalo</p>
          <ul>
            <LineaTicket etiqueta="Alias" valor={regalo.alias} copiable />
            <LineaTicket etiqueta="CBU" valor={regalo.cbu} copiable />
            <LineaTicket etiqueta="Titular" valor={regalo.titular} copiable={false} />
            <LineaTicket etiqueta="Banco" valor={regalo.banco} copiable={false} />
          </ul>
          <p className="fn-mono fn-ticket__gracias">¡Gracias!</p>
        </div>
      </article>
    </Escena>
  );
}

/* ── La entrada: el RSVP ── */
function Marca({ activa }: { activa: boolean }) {
  return (
    <span className="fn-marca" aria-hidden="true">
      {activa ? "✕" : ""}
    </span>
  );
}

function Entrada({
  slug,
  cierre,
  personal,
}: {
  slug: string;
  cierre?: string;
  personal?: Personal;
}) {
  const r = usarRsvp({ slug, personal });

  return (
    <Escena>
      <Encabezado titulo="Tu entrada" />

      <article className="fn-sombra fn-entrada-marco fn-entra" style={v(260, -1.2)}>
        <div className={`fn-entrada${r.enviado ? " fn-entrada--sellada" : ""}`}>
          <div className="fn-entrada__franja fn-mono" aria-hidden="true">
            Admite {personal ? personal.cupo : "uno"}
          </div>
          <div className="fn-entrada__cuerpo">
            <p className="fn-entrada__titulo" style={{ marginTop: 0 }}>{personal ? personal.nombre : "Una noche para nosotros"}</p>
            {r.cerrado && !personal ? (
              <p className="fn-entrada__texto">Esta invitación es personal. Confirmá desde el link que te mandaron los novios.</p>
            ) : (
              cierre && <p className="fn-entrada__texto">{cierre}</p>
            )}

            {!r.enviado && !r.abierto && !(r.cerrado && !personal) && (
              <button type="button" onClick={r.abrir} className="fn-mono fn-boton">
                Confirmar asistencia
              </button>
            )}
          </div>

          {/* El sello de goma: aparece cuando la respuesta quedó guardada. */}
          {r.enviado && (
            <p className={`fn-sello fn-mono${r.asiste ? "" : " fn-sello--no"}`}>
              {r.asiste ? "Confirmado" : "No asiste"}
            </p>
          )}
        </div>
      </article>

      {r.enviado && (
        <div className="fn-respuesta fn-entra" style={v(0)} data-visible="true">
          <p className="fn-texto">
            {r.asiste
              ? personal
                ? `Anotamos ${r.acompanantes === 1 ? "1 persona" : `${r.acompanantes} personas`} por ${personal.nombre}. Falta poco.`
                : `Ya te anotamos${r.acompanantes > 1 ? ` y a ${r.acompanantes - 1} más` : ""}. Falta poco.`
              : personal
                ? "Los vamos a extrañar. Gracias por avisar."
                : "Te vamos a extrañar. Gracias por tomarte el momento de contestar."}
          </p>
          {personal && (
            <button
              type="button"
              className="fn-mono fn-enlace"
              onClick={() => {
                r.setEnviado(false);
                r.abrir();
              }}
            >
              Cambiar la respuesta
            </button>
          )}
        </div>
      )}

      {r.abierto && !r.enviado && (
        <div ref={r.formRef} className="fn-papel fn-formulario inv-entra">
          {personal ? (
            <p className="fn-mono">
              Confirman por <span className="fn-formulario__nombre">{personal.nombre}</span>
            </p>
          ) : (
            <label className="fn-campo">
              <span className="fn-mono">Tu nombre</span>
              <input
                value={r.nombre}
                onChange={(e) => r.setNombre(e.target.value)}
                placeholder="Nombre y apellido"
                autoComplete="name"
              />
            </label>
          )}

          <fieldset className="fn-campo">
            <legend className="fn-mono">{personal ? "¿Vienen?" : "¿Venís?"}</legend>
            <button type="button" className="fn-opcion" aria-pressed={r.asiste === true} onClick={() => r.setAsiste(true)}>
              <Marca activa={r.asiste === true} /> Ahí voy a estar
            </button>
            <button type="button" className="fn-opcion" aria-pressed={r.asiste === false} onClick={() => r.setAsiste(false)}>
              <Marca activa={r.asiste === false} /> Esta vez no puedo
            </button>
          </fieldset>

          {r.asiste === true && (
            <>
              {(!personal || r.cupo > 1) && (
                <label className="fn-campo">
                  <span className="fn-mono">{personal && r.cupo > 1 ? `Cuántos van, de ${r.cupo}` : "Cuántos son"}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={r.cupo}
                    value={r.acompanantes}
                    onChange={(e) => r.setAcompanantes(Number(e.target.value))}
                  />
                </label>
              )}

              <fieldset className="fn-campo">
                <legend className="fn-mono">Restricciones de comida</legend>
                {COMIDAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="fn-opcion"
                    aria-pressed={r.comidas.includes(c)}
                    onClick={() => r.alternarComida(c)}
                  >
                    <Marca activa={r.comidas.includes(c)} /> {c}
                  </button>
                ))}
              </fieldset>

              {!personal && (
                <label className="fn-campo">
                  <span className="fn-mono">Una canción que no puede faltar</span>
                  <input value={r.cancion} onChange={(e) => r.setCancion(e.target.value)} placeholder="Tema y artista" />
                </label>
              )}
            </>
          )}

          {r.falta && (!r.nombre.trim() || r.asiste === null) && (
            <p className="fn-mono fn-rojo fn-formulario__aviso">Falta tu nombre y si venís</p>
          )}
          {r.errorEnvio && (
            <p role="alert" className="fn-texto fn-rojo fn-formulario__aviso">
              {r.errorEnvio}
            </p>
          )}

          <button type="button" onClick={r.enviar} disabled={r.enviando} className="fn-mono fn-boton">
            {r.enviando ? "Sellando…" : "Enviar"}
          </button>
        </div>
      )}
    </Escena>
  );
}

/* ── Final: la polaroid ── */
function Final({ nombres, fecha, polaroid }: { nombres: string; fecha: string; polaroid?: string }) {
  return (
    <Escena className="fn-final">
      {polaroid && (
        <figure className="fn-polaroid fn-entra" style={v(0, -4)}>
          <span className="fn-cinta" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={polaroid} alt={`${nombres}, caminando de la mano`} loading="lazy" />
          <figcaption>{nombres}</figcaption>
        </figure>
      )}
      <p className="fn-final__te fn-entra fn-entra--lado" style={v(260)}>
        Te esperamos
      </p>
      <p className="fn-mono fn-final__pie fn-entra" style={v(420)}>
        {fecha}
      </p>
    </Escena>
  );
}

/* ── Saludo de un link personal ── */
function Saludo({ saludo, nota }: { saludo: string; nota: string }) {
  return (
    <Escena className="fn-saludo">
      <p className="fn-saludo__texto fn-entra fn-entra--lado" style={v(140)}>
        {saludo}
      </p>
      {nota && (
        <p className="fn-texto fn-entra" style={v(300)}>
          {nota}
        </p>
      )}
    </Escena>
  );
}

export default function Funcion({ invitacion, personal }: { invitacion: InvitacionFotomaton; personal?: Personal }) {
  const fecha = fechaConPuntos(invitacion.fecha);

  return (
    <div className="fn">
      {personal && <Saludo saludo={personal.saludo} nota={personal.nota} />}
      {invitacion.cronograma && <Programa hitos={invitacion.cronograma} pie={fecha} />}
      <Boletos lugares={invitacion.lugares} />
      {invitacion.dressCode && <Vestimenta titulo={invitacion.dressCode.titulo} detalle={invitacion.dressCode.detalle} />}
      {invitacion.regalo && <Regalos regalo={invitacion.regalo} nombres={invitacion.nombres} />}
      <Entrada slug={invitacion.slug} cierre={invitacion.cierreRsvp} personal={personal} />
      <Final nombres={invitacion.nombres} fecha={fecha} polaroid={invitacion.fotomaton.polaroid} />
    </div>
  );
}
