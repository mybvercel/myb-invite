"use client";

import { useState } from "react";
import type { InvitacionEscena } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarRsvp } from "../usarRsvp";

function Opcion({ activa, varias, onClick, children }: { activa: boolean; varias?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`cm-opcion ${varias ? "cm-opcion--varias" : ""}`} aria-pressed={activa} onClick={onClick}>
      <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 13.500c2.200 1.600 3.800 3.400 5 6C11.500 13 15 7.500 21 3" pathLength={1} /></svg></span>
      {children}
    </button>
  );
}

/**
 * La confirmación de las invitaciones por referencia. Preguntas numeradas, una
 * debajo de la otra, y sólo aparece lo que corresponde según la respuesta.
 */
export default function Formulario({ datos, personal, listo, textoEnviar = "Confirmar asistencia" }: {
  datos: InvitacionEscena;
  personal?: Personal;
  /** Lo que se ve al quedar guardada la respuesta. */
  listo: (asiste: boolean, personas: number) => React.ReactNode;
  textoEnviar?: string;
}) {
  const r = usarRsvp({ slug: datos.slug, personal });
  const [nota, setNota] = useState("");
  const [bebidas, setBebidas] = useState<string[]>([]);
  const plural = personal && r.cupo > 1;

  // La bebida no tiene columna propia: viaja con el mensaje para que los novios la lean.
  const juntar = (n: string, b: string[]) => r.setMensaje([n.trim(), b.length ? `Bebida: ${b.join(", ")}.` : ""].filter(Boolean).join(" "));

  if (r.cerrado && !personal) return <p className="cm-texto">Esta invitación es personal. Confirma desde el enlace que te enviaron.</p>;

  if (r.enviado) {
    return (
      <div className="cm-listo" role="status">
        {listo(Boolean(r.asiste), r.acompanantes)}
        {personal && <button type="button" className="cm-enlace" onClick={() => r.setEnviado(false)}>Cambiar la respuesta</button>}
      </div>
    );
  }

  return (
    <div ref={r.formRef} className="cm-form">
      {personal ? (
        <p className="cm-form__quien">{personal.nombre}{plural && <small>{r.cupo} lugares reservados</small>}</p>
      ) : (
        <label className="cm-campo">
          <span>Nombre y apellido</span>
          <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} autoComplete="name" maxLength={40} placeholder="Escribe tu nombre" />
        </label>
      )}

      <fieldset className="cm-campo">
        <legend>{plural ? "¿Nos acompañan?" : "¿Nos acompañas?"}</legend>
        <Opcion activa={r.asiste === true} onClick={() => r.setAsiste(true)}>Sí, con mucho gusto</Opcion>
        <Opcion activa={r.asiste === false} onClick={() => r.setAsiste(false)}>Lamentablemente no</Opcion>
      </fieldset>

      <div className="cm-pliegue" data-abierto={r.asiste === true} inert={r.asiste !== true}>
        <div>
          {r.cupo > 1 && (
            <div className="cm-campo cm-campo--cantidad">
              <span>¿Cuántos son?</span>
              <div className="cm-cantidad">
                <button type="button" aria-label="Uno menos" disabled={r.acompanantes <= 1} onClick={() => r.setAcompanantes(Math.max(1, r.acompanantes - 1))}>–</button>
                <b aria-live="polite">{r.acompanantes}</b>
                <button type="button" aria-label="Uno más" disabled={r.acompanantes >= r.cupo} onClick={() => r.setAcompanantes(Math.min(r.cupo, r.acompanantes + 1))}>+</button>
              </div>
            </div>
          )}
          <fieldset className="cm-campo">
            <legend>¿Alguna restricción para comer?</legend>
            {COMIDAS.map((c) => (
              <Opcion key={c} activa={r.comidas.includes(c)} onClick={() => r.setComidas(r.comidas.includes(c) ? [] : [c])}>
                {c === "Sin TACC" ? "Sin gluten" : c}
              </Opcion>
            ))}
          </fieldset>
          {datos.escena.bebidas && (
            <fieldset className="cm-campo">
              <legend>¿Qué te servimos?</legend>
              {datos.escena.bebidas.map((b) => (
                <Opcion
                  key={b}
                  varias
                  activa={bebidas.includes(b)}
                  onClick={() => {
                    const n = bebidas.includes(b) ? bebidas.filter((x) => x !== b) : [...bebidas, b];
                    setBebidas(n);
                    juntar(nota, n);
                  }}
                >
                  {b}
                </Opcion>
              ))}
            </fieldset>
          )}
        </div>
      </div>

      <label className="cm-campo">
        <span>Unas palabras para los novios</span>
        <textarea rows={3} maxLength={300} value={nota} onChange={(e) => { setNota(e.target.value); juntar(e.target.value, bebidas); }} placeholder="Opcional" />
      </label>

      {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="cm-aviso">Falta tu nombre o si nos acompañas</p>}
      {r.errorEnvio && <p role="alert" className="cm-aviso">{r.errorEnvio}</p>}

      <button type="button" className="cm-boton cm-boton--enviar" onClick={r.enviar} disabled={r.enviando}>
        {r.enviando ? "Enviando…" : textoEnviar}
      </button>
    </div>
  );
}
