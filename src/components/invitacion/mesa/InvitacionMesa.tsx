"use client";

import { useEffect, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionMesa as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";
import { Mesa } from "./Mesa";

/**
 * Estilo "Mesa": un banquete visto desde arriba, a tinta negra sobre papel.
 * Toda la invitación está escrita sobre el mantel; la mesa se alarga con el
 * scroll y se van sentando invitados a los costados. En la otra punta hay una
 * silla vacía con una tarjeta: al confirmar, el invitado se sienta ahí y la
 * tarjeta pasa a tener su nombre. Criterios: .claude/skills/invitacion-mesa/SKILL.md
 */

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** Lo que va en el centro de la mesa, entre sección y sección. Ilustraciones
    del mismo trazo que los invitados (public/invitaciones/mesa/mesa). */
const CENTROS = { flores: "o1", velas: "o2", torta: "o3", vino: "o4", quesos: "o5", pan: "o6" } as const;
type TipoCentro = keyof typeof CENTROS;

function Escena({ children, className = "", centro }: { children: React.ReactNode; className?: string; centro?: TipoCentro }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-10%");
  return (
    <section ref={ref} data-visible={visible} className={`ms-escena ${className}`}>
      {centro && <img src={`/invitaciones/mesa/mesa/${CENTROS[centro]}.webp`} alt="" className="ms-centro" loading="lazy" decoding="async" />}
      {children}
    </section>
  );
}

function Copiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <p className="ms-renglon ms-renglon--dato">
      <span className="ms-renglon__que">{etiqueta}</span>
      <span className="ms-renglon__puntos" aria-hidden="true" />
      <button
        type="button"
        className="ms-copiar"
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
        {copiado ? "copiado" : valor}
      </button>
    </p>
  );
}

export default function InvitacionMesa({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const [uno, dos] = invitacion.nombres.split("&").map((n) => n.trim());
  const ceremonia = invitacion.lugares?.find((l) => l.tipo === "Ceremonia" || l.tipo === "Civil");
  const fiesta = invitacion.lugares?.find((l) => l.tipo === "Fiesta");
  const principal = fiesta ?? ceremonia;

  const fecha = parsearFecha(invitacion.fecha);
  const [, diaNum, mes, anio] = invitacion.fecha.match(/(\d{1,2}) de (\S+) (\d{4})/) ?? [];
  const pueblo = principal?.direccion.split(",").slice(-2).join(",").trim();

  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => {
    setDias(calcularFaltante(fecha)?.d ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitacion.fecha]);

  const r = usarRsvp({ slug: invitacion.slug, personal });
  const sentado = r.enviado && r.asiste === true;
  const nombreTarjeta = personal ? personal.nombre : r.nombre.trim().split(" ")[0];

  return (
    <main className="inv-columna ms">
      <div className="ms-difuminado" aria-hidden="true" />
      <Mesa
        sentado={sentado}
        cabecera={<img src="/invitaciones/mesa/gente/novios.webp" alt={`${uno} y ${dos} brindando en la cabecera de la mesa`} className="ms-novios" />}
        tarjeta={<span key={sentado ? "nombre" : "lugar"}>{sentado ? nombreTarjeta : r.enviado && r.asiste === false ? "te extrañaremos" : "tu lugar"}</span>}
      >
        {/* ── Portada ── */}
        <Escena className="ms-portada">
          <h1 className="ms-pareja">
            <span className="ms-nombre">{uno}</span>
            <span className="ms-amper">&amp;</span>
            <span className="ms-nombre">{dos}</span>
          </h1>
          <p className="ms-bajada">nos casamos y te guardamos un lugar en nuestra mesa</p>

          <div className="ms-fecha">
            <span className="ms-fecha__lado">{fecha ? DIAS[fecha.getDay()] : ""}</span>
            <span className="ms-fecha__dia">{diaNum}</span>
            <span className="ms-fecha__lado">{mes}</span>
          </div>
          <p className="ms-anio">{anio}</p>
          {principal && <p className="ms-texto ms-lugar">{principal.titulo} · {pueblo}</p>}
        </Escena>

        {personal && (
          <Escena className="ms-saludo">
            <p className="ms-titulo">{personal.saludo}</p>
            {personal.nota && <p className="ms-texto">{personal.nota}</p>}
          </Escena>
        )}

        {/* ── Faltan ── */}
        <Escena centro="flores">
          <p className="ms-faltan">
            <span className="ms-texto">faltan</span>
            <span className="ms-faltan__n">{dias ?? "··"}</span>
            <span className="ms-texto">días para sentarnos a la mesa</span>
          </p>
        </Escena>

        {/* ── Ceremonia ── */}
        {ceremonia && (
          <Escena centro="velas">
            <h2 className="ms-titulo">La ceremonia</h2>
            <p className="ms-hora">{ceremonia.hora} <span>hs</span></p>
            <p className="ms-lugar-nombre">{ceremonia.titulo}</p>
            <p className="ms-texto">{ceremonia.direccion}</p>
            <a className="ms-boton" href={ceremonia.mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a>
          </Escena>
        )}

        {/* ── La fiesta ── */}
        {fiesta && (
          <Escena centro="vino">
            <h2 className="ms-titulo">La fiesta</h2>
            <p className="ms-hora">{fiesta.hora} <span>hs</span></p>
            <p className="ms-lugar-nombre">{fiesta.titulo}</p>
            <p className="ms-texto">{fiesta.direccion}</p>
            <a className="ms-boton" href={fiesta.mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a>

            {invitacion.cronograma && (
              <ul className="ms-carta">
                {invitacion.cronograma.map((h, i) => (
                  <li key={`${h.hora}-${i}`} className="ms-renglon">
                    <span className="ms-renglon__hora">{h.hora}</span>
                    <span className="ms-renglon__puntos" aria-hidden="true" />
                    <span className="ms-renglon__que">{h.titulo}</span>
                  </li>
                ))}
              </ul>
            )}
          </Escena>
        )}

        {/* ── El menú ── */}
        <Escena centro="quesos">
          <h2 className="ms-titulo">En la mesa</h2>
          <ul className="ms-menu">
            {invitacion.mesa.menu.map((m) => (
              <li key={m.paso}>
                <span className="ms-plato">{m.plato}</span>
                <span className="ms-paso">{m.paso}</span>
              </li>
            ))}
          </ul>
          <p className="ms-texto ms-nota">Si tenés alguna restricción, avisanos al confirmar y te preparamos otro plato.</p>
        </Escena>

        {/* ── Vestimenta ── */}
        {invitacion.dressCode && (
          <Escena centro="pan">
            <h2 className="ms-titulo">{invitacion.dressCode.titulo}</h2>
            <p className="ms-texto">{invitacion.dressCode.detalle}</p>
          </Escena>
        )}

        {/* ── Cómo llegar ── */}
        {invitacion.logistica && (
          <Escena centro="flores">
            <h2 className="ms-titulo">Ida y vuelta</h2>
            {invitacion.logistica.transporte && <p className="ms-texto">{invitacion.logistica.transporte}</p>}
            {invitacion.logistica.hoteles && <p className="ms-texto">{invitacion.logistica.hoteles}</p>}
          </Escena>
        )}

        {/* ── Regalos ── */}
        {invitacion.regalo && (
          <Escena centro="torta">
            <h2 className="ms-titulo">Regalos</h2>
            <p className="ms-texto">{invitacion.regalo.mensaje}</p>
            <div className="ms-carta">
              <Copiable etiqueta="Alias" valor={invitacion.regalo.alias} />
              <Copiable etiqueta="CBU" valor={invitacion.regalo.cbu} />
            </div>
            <p className="ms-texto ms-nota">{invitacion.regalo.titular} · {invitacion.regalo.banco}</p>
          </Escena>
        )}

        {/* ── Tu lugar ── */}
        <Escena centro="velas" className="ms-rsvp">
          <h2 className="ms-titulo">¿Te sentás con nosotros?</h2>
          {invitacion.cierreRsvp && <p className="ms-texto">{invitacion.cierreRsvp}</p>}

          {r.cerrado && !personal ? (
            <p className="ms-texto">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
          ) : r.enviado ? (
            <div className="ms-respuesta">
              <p className="ms-titulo ms-titulo--chico">{r.asiste ? "¡Ya tenés tu lugar!" : "Gracias por avisar"}</p>
              <p className="ms-texto">
                {r.asiste
                  ? personal
                    ? `Anotamos ${r.acompanantes === 1 ? "1 persona" : `${r.acompanantes} personas`}. Mirá la punta de la mesa.`
                    : `Estás en la lista${r.acompanantes > 1 ? ` con ${r.acompanantes - 1} más` : ""}. Mirá la punta de la mesa.`
                  : "Te vamos a extrañar en la mesa."}
              </p>
              {personal && (
                <button type="button" className="ms-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                  cambiar la respuesta
                </button>
              )}
            </div>
          ) : (
            <div ref={r.formRef} className="ms-formulario">
              {!personal && (
                <label className="ms-campo">
                  <span>Tu nombre</span>
                  <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} placeholder="Nombre y apellido" autoComplete="name" maxLength={40} />
                </label>
              )}

              <fieldset className="ms-campo">
                <legend>{personal ? "¿Vienen?" : "¿Venís?"}</legend>
                {[[true, "Sí, ahí estaré"], [false, "No puedo, brindo de lejos"]].map(([valor, texto]) => (
                  <button key={String(valor)} type="button" className="ms-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                    <span className="ms-casilla" aria-hidden="true" />
                    {texto as string}
                  </button>
                ))}
              </fieldset>

              {r.asiste === true && (
                <>
                  {(!personal || r.cupo > 1) && (
                    <label className="ms-campo">
                      <span>{personal && r.cupo > 1 ? `Cuántos vienen, de ${r.cupo}` : "Cuántos son"}</span>
                      <input type="number" inputMode="numeric" min={1} max={r.cupo} value={r.acompanantes} onChange={(e) => r.setAcompanantes(Number(e.target.value))} />
                    </label>
                  )}
                  <fieldset className="ms-campo">
                    <legend>¿Algo que no comas?</legend>
                    {COMIDAS.map((c) => (
                      <button key={c} type="button" className="ms-opcion" aria-pressed={r.comidas.includes(c)} onClick={() => r.alternarComida(c)}>
                        <span className="ms-casilla" aria-hidden="true" />
                        {c}
                      </button>
                    ))}
                  </fieldset>
                  {!personal && (
                    <label className="ms-campo">
                      <span>La canción que no puede faltar</span>
                      <input value={r.cancion} onChange={(e) => r.setCancion(e.target.value)} placeholder="Tema y artista" />
                    </label>
                  )}
                </>
              )}

              {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="ms-aviso">Falta tu nombre y si venís</p>}
              {r.errorEnvio && <p role="alert" className="ms-aviso">{r.errorEnvio}</p>}

              <button type="button" className="ms-boton ms-boton--lleno" onClick={r.enviar} disabled={r.enviando}>
                {r.enviando ? "Reservando tu silla…" : "Confirmar"}
              </button>
            </div>
          )}
        </Escena>
      </Mesa>

      {/* ── Cierre ── */}
      <footer className="ms-cierre">
        <p className="ms-pareja ms-pareja--chica">
          {uno} <span className="ms-amper">&amp;</span> {dos}
        </p>
        <p className="ms-texto">{invitacion.fecha.replace(/ (\d{4})$/, ", $1")} · {pueblo}</p>
      </footer>
    </main>
  );
}
