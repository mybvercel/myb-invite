"use client";

import { useEffect, useRef, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionSobremesa as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";
import Flecha from "../Flecha";

/**
 * Estilo "Sobremesa": cena ejecutiva en blanco cálido, tinta y borgoña. La
 * maqueta (flujo GPT, por capas) pasada al motor: una copa a gran escala en la
 * portada, la cena que vira a vino sobre la foto de la mesa, la ubicación en
 * claro y el cierre en vino. Copa y aperitivo se desplazan ±10 px con el
 * scroll. Criterios: .claude/skills/invitacion-sobremesa/SKILL.md
 */

const A = "/invitaciones/sobremesa/";

function Escena({ id, clase, children }: { id: string; clase: string; children: React.ReactNode }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-8%");
  return (
    <section ref={ref} id={id} data-visible={visible} className={`so-e so-e-${clase}`}>
      {children}
    </section>
  );
}

/** Un objeto que acompaña el scroll apenas: tope de ±10 px y un cuadro por frame. */
function usarDesplazamiento(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const raiz = ref.current;
    if (!raiz || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const objetos = Array.from(raiz.querySelectorAll<HTMLElement>(".so-objeto"));
    let pendiente = false;
    const mover = () => {
      pendiente = false;
      for (const el of objetos) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const d = Math.max(-10, Math.min(10, (innerHeight / 2 - r.top - r.height / 2) * 0.025));
        el.style.setProperty("--desp", `${d.toFixed(1)}px`);
      }
    };
    const alScroll = () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(mover);
      }
    };
    mover();
    addEventListener("scroll", alScroll, { passive: true });
    return () => removeEventListener("scroll", alScroll);
  }, [ref]);
}

export default function InvitacionSobremesa({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const s = invitacion.sobremesa;
  const lugar = invitacion.lugares?.[0];
  const raiz = useRef<HTMLElement>(null);
  usarDesplazamiento(raiz);

  const [, dia, mes] = invitacion.fecha.match(/(\d{1,2}) de (\S+)/) ?? [];
  const fechaLarga = invitacion.fecha.replace(/ (\d{4})$/, " de $1").replace(/ de ([A-ZÁÉÍÓÚ])/, (_, l: string) => ` de ${l.toLowerCase()}`);
  const limite = invitacion.cierreRsvp?.replace(/^Confirmá antes del?\s*/i, "").replace(/\.$/, "");

  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => setDias(calcularFaltante(parsearFecha(invitacion.fecha, 19))?.d ?? 0), [invitacion.fecha]);

  const r = usarRsvp({ slug: invitacion.slug, personal });

  return (
    <main ref={raiz} className="inv-columna so">
      {/* ── Portada ── */}
      <Escena id="portada" clase="portada">
        <div className="so-marca">
          {s.anfitrion}
          <span>INVITA</span>
        </div>
        <p className="so-tipo so-tipo--portada">{s.tipo}</p>
        <h1 className="so-nombre" aria-label={invitacion.nombres}>
          Sobre<span>mesa.</span>
        </h1>
        <div className="so-objeto so-copa-hero">
          <img src={`${A}copa.webp`} alt="" aria-hidden="true" decoding="async" />
        </div>
        <p className="so-claim">
          Buenas conversaciones.
          <br />
          Una mesa excepcional.
        </p>
        <div className="so-portada-datos">
          <div className="so-fecha-grande">
            {dia}
            <span>{mes?.slice(0, 3).toUpperCase()}</span>
          </div>
          <p>
            {lugar?.hora} hs
            <br />
            {s.ciudad}
            <br />
            {dias !== null && dias > 0 ? <span className="so-faltan">Faltan {dias} días</span> : s.cupo}
          </p>
        </div>
        <a href="#encuentro" className="so-bajar">
          Descubrí la noche <span aria-hidden="true"><Flecha dir="s" /></span>
        </a>
      </Escena>

      {/* ── El encuentro ── */}
      <Escena id="encuentro" clase="encuentro">
        {personal && <p className="so-saludo">{personal.saludo}</p>}
        <h2>
          Fuera de agenda.
          <br />
          Alrededor
          <br />
          de una mesa.
        </h2>
        <p className="so-intro">{s.mensaje}</p>
        <div className="so-agenda">
          {s.agenda.map((a) => (
            <div key={a.hora} className="so-momento">
              <time>{a.hora}</time>
              <div>
                <h3>{a.titulo}</h3>
                <p>{a.detalle}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="so-anfitrion">Una invitación de {s.anfitrion}.</p>
      </Escena>

      {/* ── La cena ── */}
      <Escena id="cena" clase="cena">
        <div className="so-foto">
          <img src={`${A}mesa.webp`} alt="Una mesa larga servida, con copas y servilletas de lino" loading="lazy" decoding="async" />
        </div>
        <div className="so-cena-titulo">
          <h2>
            Tiempo para
            <br />
            <em>disfrutar.</em>
          </h2>
        </div>
        <div className="so-menu">
          <p className="so-menu-intro">Tres pasos. Sin apuro.</p>
          {s.menu.map((m) => (
            <div key={m.nombre} className="so-plato">
              <h3>{m.nombre}</h3>
              <p>{m.plato}</p>
            </div>
          ))}
          <p className="so-bebidas">{s.bebidas}</p>
        </div>
      </Escena>

      {/* ── El lugar y la vestimenta ── */}
      {lugar && (
        <Escena id="lugar" clase="lugar">
          <h2>{lugar.titulo}</h2>
          <p className="so-salon">{s.salon}</p>
          <div className="so-objeto so-aperitivo">
            <img src={`${A}aperitivo.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          </div>
          <div className="so-lugar-datos">
            <p>{lugar.direccion.replace(/, ([^,]+)$/, " · $1")}</p>
            <a className="so-boton" href={lugar.mapa} target="_blank" rel="noopener noreferrer">
              Ver ubicación <span aria-hidden="true"><Flecha dir="ne" /></span>
            </a>
            {invitacion.dressCode && (
              <div className="so-vestimenta">
                <h3>{invitacion.dressCode.titulo}</h3>
                <p>{invitacion.dressCode.detalle}</p>
              </div>
            )}
          </div>
        </Escena>
      )}

      {/* ── Confirmación ── */}
      <Escena id="asistencia" clase="asistencia">
        <h2>
          ¿Nos
          <br />
          <em>encontramos?</em>
        </h2>
        <p className="so-intro">
          {limite ? `Confirmá antes del ${limite}.` : "Confirmá tu asistencia."}
          <br />
          {s.cupo}.
        </p>

        {r.cerrado && !personal ? (
          <p className="so-intro">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
        ) : r.enviado ? (
          <div className="so-respuesta" role="status">
            <h3>{r.asiste ? "Tu lugar está reservado." : "Gracias por avisarnos."}</h3>
            <p>{r.asiste ? `Te esperamos el ${fechaLarga}.` : "Esperamos verte en la próxima."}</p>
            {personal && (
              <button type="button" className="so-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                Cambiar mi respuesta
              </button>
            )}
          </div>
        ) : (
          <div ref={r.formRef} className="so-formulario">
            {!personal && (
              <label className="so-campo">
                <span>Nombre y apellido</span>
                <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} autoComplete="name" maxLength={40} />
              </label>
            )}
            <fieldset className="so-campo">
              <legend>¿Vas a acompañarnos?</legend>
              {[[true, "Sí, voy a estar"], [false, "Esta vez no puedo"]].map(([valor, texto]) => (
                <button key={String(valor)} type="button" className="so-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                  <span className="so-casilla" aria-hidden="true" />
                  {texto as string}
                </button>
              ))}
            </fieldset>
            {r.asiste === true && (
              <fieldset className="so-campo">
                <legend>Alergias o necesidades alimentarias</legend>
                {COMIDAS.map((c) => (
                  <button key={c} type="button" className="so-opcion" aria-pressed={r.comidas.includes(c)} onClick={() => r.alternarComida(c)}>
                    <span className="so-casilla so-casilla--cuadrada" aria-hidden="true" />
                    {c}
                  </button>
                ))}
              </fieldset>
            )}
            {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="so-aviso">Falta tu nombre y si vas a venir.</p>}
            {r.errorEnvio && <p role="alert" className="so-aviso">{r.errorEnvio}</p>}
            <button type="button" className="so-boton so-boton--lleno" onClick={r.enviar} disabled={r.enviando}>
              {r.enviando ? "Reservando tu lugar…" : "Confirmar asistencia"} <span aria-hidden="true"><Flecha dir="ne" /></span>
            </button>
          </div>
        )}
      </Escena>

      {/* ── Cierre ── */}
      <Escena id="cierre" clase="cierre">
        <p className="so-tipo">{s.tipo}</p>
        <h2>
          Las mejores
          <br />
          ideas también
          <br />
          nacen en la
          <br />
          <em>sobremesa.</em>
        </h2>
        <div className="so-objeto so-copa-cierre">
          <img src={`${A}copa.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        </div>
        <div className="so-cierre-datos">
          <p>
            {fechaLarga}
            <br />
            {lugar?.hora} hs · {lugar?.titulo}
          </p>
          <p className="so-marca so-marca--cierre">{s.anfitrion}</p>
          <a href="#asistencia" className="so-enlace">
            Confirmar asistencia <Flecha dir="ne" />
          </a>
        </div>
      </Escena>
    </main>
  );
}
