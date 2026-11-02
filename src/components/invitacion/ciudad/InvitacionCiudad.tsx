"use client";

import { useEffect, useRef, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionCiudad as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";
import { Casita, Ciudad, type Tipo } from "./Casas";
import { crearMusica } from "./musica";

/**
 * Estilo "Ciudad": la tarjeta impresa de un Bar Mitzvá, pasada a digital. Es
 * una cartulina blanca sobre lino celeste, enmarcada por casitas de Jerusalén
 * que se construyen solas al bajar. Tiene las 13 velas para encender, música
 * klezmer de fondo y, al confirmar, la casa del invitado se suma a la ciudad.
 * Criterios: .claude/skills/invitacion-ciudad/SKILL.md
 */

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function Escena({ children, className = "", casita }: { children: React.ReactNode; className?: string; casita?: Tipo }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-10%");
  return (
    <section ref={ref} data-visible={visible} className={`cd-escena ${className}`}>
      {casita && (
        <div className="cd-separador" aria-hidden="true">
          <span />
          <Casita tipo={casita} semilla={casita.length * 7} />
          <span />
        </div>
      )}
      {children}
    </section>
  );
}

function Copiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  // Un CBU se lee en sus dos bloques, banco (8) y cuenta (14): así además
  // corta prolijo en dos renglones. Lo que se copia es el número entero.
  const visible = /^\d{22}$/.test(valor) ? `${valor.slice(0, 8)} ${valor.slice(8)}` : valor;
  const [copiado, setCopiado] = useState(false);
  return (
    <p className="cd-dato">
      <span className="cd-dato__que">{etiqueta}</span>
      <button
        type="button"
        className="cd-copiar"
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
        {copiado ? "copiado" : visible}
      </button>
    </p>
  );
}

/** Las 13 velas: se encienden solas al llegar y cada una dice para quién es. */
function Velas({ velas }: { velas: string[] }) {
  const [ref, visible] = usarEnVista<HTMLDivElement>("-20%");
  const [prendidas, setPrendidas] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);

  useEffect(() => {
    if (!visible || prendidas >= velas.length) return;
    const t = setTimeout(() => setPrendidas((n) => n + 1), prendidas === 0 ? 400 : 520);
    return () => clearTimeout(t);
  }, [visible, prendidas, velas.length]);

  const mostrada = elegida ?? (prendidas > 0 ? prendidas - 1 : null);
  const filas = [velas.slice(0, 7), velas.slice(7)];

  return (
    <div ref={ref} className="cd-velas">
      {filas.map((fila, f) => (
        <div key={f} className="cd-velas__fila">
          {fila.map((quien, i) => {
            const n = f * 7 + i;
            const prendida = n < prendidas;
            return (
              <button
                key={n}
                type="button"
                className={`cd-vela${prendida ? " cd-vela--prendida" : ""}${mostrada === n ? " cd-vela--elegida" : ""}`}
                onClick={() => {
                  setElegida(n);
                  if (!prendida) setPrendidas((p) => Math.max(p, n + 1));
                }}
                aria-label={`Vela ${n + 1}: ${quien}`}
              >
                <svg viewBox="0 0 24 64" aria-hidden="true">
                  <path className="cd-vela__llama" d="M12 3 C 16 9, 16.5 13, 12 17.5 C 7.5 13, 8 9, 12 3 Z" style={{ "--n": n } as React.CSSProperties} />
                  <path className="cd-vela__corazon" d="M12 9 C 13.6 12, 13.6 14, 12 15.6 C 10.4 14, 10.4 12, 12 9 Z" />
                  <path className="cd-azul-trazo" d="M12 17.5 L12 21" />
                  <path className="cd-muro" d={`M8 21 L16 21 L16 ${52 - (n % 3) * 2} L8 ${52 - (n % 3) * 2} Z`} />
                  <path className="cd-celeste" d="M3 52 L21 52 L19 57 L5 57 Z" />
                  <path className="cd-azul" d="M7 57 L17 57 L18 61 L6 61 Z" />
                </svg>
              </button>
            );
          })}
        </div>
      ))}
      <p className="cd-velas__para" aria-live="polite">
        {mostrada !== null ? (
          <>
            <span className="cd-velas__n">{mostrada + 1}</span>
            {velas[mostrada]}
          </>
        ) : (
          " "
        )}
      </p>
    </div>
  );
}

/** La música arranca con el primer toque en la página y se puede pausar. */
function usarMusica() {
  const musica = useRef<ReturnType<typeof crearMusica> | null>(null);
  const [sonando, setSonando] = useState(false);
  const pausada = useRef(false);

  useEffect(() => {
    musica.current = crearMusica();
    const primerToque = (e: Event) => {
      if ((e.target as HTMLElement).closest?.(".cd-musica") || pausada.current) return;
      musica.current?.tocar().then(() => setSonando(true));
      quitar();
    };
    const quitar = () => {
      window.removeEventListener("pointerdown", primerToque);
      window.removeEventListener("keydown", primerToque);
    };
    window.addEventListener("pointerdown", primerToque);
    window.addEventListener("keydown", primerToque);
    return () => {
      quitar();
      musica.current?.cerrar();
    };
  }, []);

  const alternar = () => {
    if (sonando) {
      musica.current?.pausar();
      pausada.current = true;
      setSonando(false);
    } else {
      musica.current?.tocar().then(() => setSonando(true));
      pausada.current = false;
    }
  };
  return { sonando, alternar };
}

export default function InvitacionCiudad({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const c = invitacion.ciudad;
  const templo = invitacion.lugares?.find((l) => l.tipo === "Ceremonia");
  const fiesta = invitacion.lugares?.find((l) => l.tipo === "Fiesta");
  const fecha = parsearFecha(invitacion.fecha);
  const [, dia, mes, anio] = invitacion.fecha.match(/(\d{1,2}) de (\S+) (\d{4})/) ?? [];
  const fechaLarga = `${fecha ? DIAS[fecha.getDay()] : ""} ${dia} de ${mes?.toLowerCase()} de ${anio}`;
  const barrio = (l?: { direccion: string }) => l?.direccion.split(",").slice(-2).join(",").trim();

  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => {
    setDias(calcularFaltante(parsearFecha(invitacion.fecha))?.d ?? 0);
  }, [invitacion.fecha]);

  const r = usarRsvp({ slug: invitacion.slug, personal });
  const { sonando, alternar } = usarMusica();
  const vecino = r.enviado && r.asiste ? (personal ? personal.nombre : r.nombre.trim().split(" ")[0]) : null;

  return (
    <main className="cd">
      <div className="cd-difuminado" aria-hidden="true" />
      <button type="button" className={`cd-musica${sonando ? " cd-musica--sonando" : ""}`} onClick={alternar} aria-label={sonando ? "Pausar la música" : "Poner música"}>
        <span className="cd-musica__barras" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {sonando ? "pausa" : "música"}
      </button>

      <article className="cd-tarjeta">
        <Ciudad agradecimiento={c.agradecimiento} invitado={vecino} />

        <div className="cd-contenido">
          {/* ── Portada: la tarjeta tal cual ── */}
          <header className="cd-portada">
            <p className="cd-caps">
              Te invitamos a acompañarnos
              <br />
              cuando {c.vinculo}
            </p>
            <h1 className="cd-nombre">{invitacion.nombres}</h1>
            <p className="cd-hebreo" lang="he" dir="rtl">
              {c.hebreo}
            </p>
            <div className="cd-grupo">
              <p className="cd-caps">es llamado a la Torá como</p>
              <p className="cd-evento">{c.evento}</p>
            </div>
            <div className="cd-grupo">
              <p className="cd-caps">{fechaLarga}</p>
              {templo && <p className="cd-caps">{templo.hora} de la mañana</p>}
            </div>
            {templo && (
              <div className="cd-grupo">
                <p className="cd-caps">{templo.titulo}</p>
                <p className="cd-caps">{barrio(templo)}</p>
              </div>
            )}
            <p className="cd-padres">{c.padres}</p>
          </header>

          {personal && (
            <Escena casita="cupula">
              <p className="cd-titulo">{personal.saludo}</p>
              {personal.nota && <p className="cd-texto">{personal.nota}</p>}
            </Escena>
          )}

          {/* ── La parashá ── */}
          <Escena casita="torre">
            <p className="cd-texto">{invitacion.nombres} va a leer</p>
            <p className="cd-titulo">Parashat {c.parasha.nombre}</p>
            <p className="cd-hebreo cd-hebreo--chico" lang="he" dir="rtl">
              {c.parasha.hebreo}
            </p>
            <p className="cd-caps cd-caps--chica">{c.parasha.fechaHebrea}</p>
          </Escena>

          {/* ── Faltan ── */}
          <Escena casita="cupula">
            <p className="cd-faltan">
              <span className="cd-caps">faltan</span>
              <span className="cd-faltan__n">{dias ?? "··"}</span>
              <span className="cd-caps">días</span>
            </p>
          </Escena>

          {/* ── El templo ── */}
          {templo && (
            <Escena casita="portal">
              <h2 className="cd-titulo">En el templo</h2>
              <p className="cd-hora">{templo.hora} hs</p>
              <p className="cd-caps">{templo.titulo}</p>
              <p className="cd-texto">{templo.direccion}</p>
              <a className="cd-boton" href={templo.mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a>
              <p className="cd-texto cd-nota">
                {c.kidush.detalle} Desde las {c.kidush.hora} hs.
              </p>
            </Escena>
          )}

          {/* ── La fiesta ── */}
          {fiesta && (
            <Escena casita="cubos">
              <h2 className="cd-titulo">La fiesta</h2>
              <p className="cd-texto">Cuando termina el Shabat, a festejar.</p>
              <p className="cd-hora">{fiesta.hora} hs</p>
              <p className="cd-caps">{fiesta.titulo}</p>
              <p className="cd-texto">{fiesta.direccion}</p>
              <a className="cd-boton" href={fiesta.mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a>
              {invitacion.logistica?.transporte && <p className="cd-texto cd-nota">{invitacion.logistica.transporte}</p>}

              {invitacion.cronograma && (
                <ul className="cd-programa">
                  {invitacion.cronograma.map((h, i) => (
                    <li key={`${h.hora}-${i}`}>
                      <span className="cd-programa__hora">{h.hora}</span>
                      <span className="cd-programa__puntos" aria-hidden="true" />
                      <span className="cd-programa__que">{h.titulo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Escena>
          )}

          {/* ── Las 13 velas ── */}
          <Escena casita="cupula">
            <h2 className="cd-titulo">Las 13 velas</h2>
            <p className="cd-texto">Una por cada persona que acompañó a {invitacion.nombres} hasta acá. Tocá una para ver de quién es.</p>
            <Velas velas={c.velas} />
          </Escena>

          {/* ── Vestimenta ── */}
          {invitacion.dressCode && (
            <Escena casita="dosAguas">
              <h2 className="cd-titulo">{invitacion.dressCode.titulo}</h2>
              <p className="cd-texto">{invitacion.dressCode.detalle}</p>
            </Escena>
          )}

          {/* ── Regalo ── */}
          {invitacion.regalo && (
            <Escena casita="plana">
              <h2 className="cd-titulo">Regalo</h2>
              <p className="cd-texto">{invitacion.regalo.mensaje}</p>
              <Copiable etiqueta="Alias" valor={invitacion.regalo.alias} />
              <Copiable etiqueta="CBU" valor={invitacion.regalo.cbu} />
              <p className="cd-texto cd-nota">
                {invitacion.regalo.titular} · {invitacion.regalo.banco}
              </p>
            </Escena>
          )}

          {/* ── Confirmación: tu casa en la ciudad ── */}
          <Escena casita="portal" className="cd-rsvp">
            <h2 className="cd-titulo">¿Venís?</h2>
            {invitacion.cierreRsvp && <p className="cd-texto">{invitacion.cierreRsvp} Al confirmar, tu casa se suma a la ciudad.</p>}

            {r.cerrado && !personal ? (
              <p className="cd-texto">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
            ) : r.enviado ? (
              <div className="cd-respuesta">
                <p className="cd-titulo cd-titulo--chico">{r.asiste ? "¡Mazal tov!" : "Gracias por avisar"}</p>
                <p className="cd-texto">
                  {r.asiste
                    ? personal
                      ? `Anotamos ${r.acompanantes === 1 ? "1 persona" : `${r.acompanantes} personas`}. Mirá abajo: ya tienen su casa en la ciudad.`
                      : `Estás en la lista${r.acompanantes > 1 ? ` con ${r.acompanantes - 1} más` : ""}. Mirá abajo: ya tenés tu casa en la ciudad.`
                    : "Te vamos a extrañar."}
                </p>
                {personal && (
                  <button type="button" className="cd-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                    cambiar la respuesta
                  </button>
                )}
              </div>
            ) : (
              <div ref={r.formRef} className="cd-formulario">
                {!personal && (
                  <label className="cd-campo">
                    <span>Tu nombre</span>
                    <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} placeholder="Nombre y apellido" autoComplete="name" maxLength={40} />
                  </label>
                )}
                <fieldset className="cd-campo">
                  <legend>{personal ? "¿Vienen?" : "¿Venís?"}</legend>
                  {[[true, "Sí, ahí estaré"], [false, "No puedo, mazal tov igual"]].map(([valor, texto]) => (
                    <button key={String(valor)} type="button" className="cd-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                      <span className="cd-casilla" aria-hidden="true" />
                      {texto as string}
                    </button>
                  ))}
                </fieldset>
                {r.asiste === true && (
                  <>
                    {(!personal || r.cupo > 1) && (
                      <label className="cd-campo">
                        <span>{personal && r.cupo > 1 ? `Cuántos vienen, de ${r.cupo}` : "Cuántos son"}</span>
                        <input type="number" inputMode="numeric" min={1} max={r.cupo} value={r.acompanantes} onChange={(e) => r.setAcompanantes(Number(e.target.value))} />
                      </label>
                    )}
                    <fieldset className="cd-campo">
                      <legend>¿Algo que no comas?</legend>
                      {COMIDAS.map((comida) => (
                        <button key={comida} type="button" className="cd-opcion" aria-pressed={r.comidas.includes(comida)} onClick={() => r.alternarComida(comida)}>
                          <span className="cd-casilla" aria-hidden="true" />
                          {comida}
                        </button>
                      ))}
                    </fieldset>
                    {!personal && (
                      <label className="cd-campo">
                        <span>La canción para la hora</span>
                        <input value={r.cancion} onChange={(e) => r.setCancion(e.target.value)} placeholder="Tema y artista" />
                      </label>
                    )}
                  </>
                )}
                {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="cd-aviso">Falta tu nombre y si venís</p>}
                {r.errorEnvio && <p role="alert" className="cd-aviso">{r.errorEnvio}</p>}
                <button type="button" className="cd-boton cd-boton--lleno" onClick={r.enviar} disabled={r.enviando}>
                  {r.enviando ? "Levantando tu casa…" : "Confirmar"}
                </button>
              </div>
            )}
          </Escena>

          {/* ── Cierre ── */}
          <Escena className="cd-cierre">
            <p className="cd-evento">Mazal tov</p>
            <p className="cd-hebreo cd-hebreo--chico" lang="he" dir="rtl">
              מזל טוב
            </p>
            <p className="cd-padres">{c.padres}</p>
          </Escena>
        </div>
      </article>
    </main>
  );
}
