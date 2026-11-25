"use client";

import { useEffect, useRef, useState } from "react";
import { calcularFaltante, parsearFecha, type Faltante } from "@/invitaciones/fecha";
import type { InvitacionRasgado as Datos, Lugar } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarRsvp } from "../usarRsvp";
import { Abierta, usarVisible } from "./abierta";
import { Emblema, Malvaviscos } from "./Fuego";
import Foto from "./Foto";
import Monograma from "./Monograma";
import Papelitos from "./Papelitos";
import Tapa from "./Tapa";

/**
 * Estilo "Rasgado": crema y azul polvo, con las fotos entre papeles rasgados.
 * Criterios: .claude/skills/invitacion-rasgado/SKILL.md
 */

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const dos = (v: number) => String(v).padStart(2, "0");

function enlaceCalendario(d: Datos, lugar?: Lugar) {
  const [h, m] = (lugar?.hora ?? "20:00").split(":").map(Number);
  const inicio = parsearFecha(d.fecha, h);
  if (!inicio) return null;
  inicio.setMinutes(m || 0);
  const fin = new Date(inicio.getTime() + 9 * 3_600_000);
  const f = (x: Date) => `${x.getFullYear()}${dos(x.getMonth() + 1)}${dos(x.getDate())}T${dos(x.getHours())}${dos(x.getMinutes())}00`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: d.rasgado.evento,
    dates: `${f(inicio)}/${f(fin)}`,
    location: lugar ? `${lugar.titulo}, ${lugar.direccion}` : "",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function Escena({ children, azul, className = "" }: { children: React.ReactNode; azul?: boolean; className?: string }) {
  const [ref, visible] = usarVisible<HTMLElement>("-10%");
  return (
    <section ref={ref} data-visible={visible} className={`rg-escena ${azul ? "rg-escena--azul" : ""} ${className}`}>
      {children}
    </section>
  );
}

/** Los títulos se escriben de izquierda a derecha al llegar a ellos. */
function Titulo({ children, as: T = "h2", className = "" }: { children: React.ReactNode; as?: "h2" | "p"; className?: string }) {
  const [ref, visible] = usarVisible<HTMLHeadingElement>("-8%");
  return <T ref={ref} data-visible={visible} className={`rg-titulo ${className}`}>{children}</T>;
}

/** Los nombres, o las dos palabras del título cuando la invitación va sin nombres. */
function Pareja({ uno, otro, y, as: T = "h1", enLinea }: { uno: string; otro: string; y: boolean; as?: "h1" | "p"; enLinea?: boolean }) {
  const [ref, visible] = usarVisible<HTMLHeadingElement>("-6%");
  return (
    <T ref={ref} data-visible={visible} className={`rg-pareja ${enLinea ? "rg-pareja--linea" : ""}`}>
      <span className="rg-pareja__uno">{uno}</span>{" "}
      <span className="rg-pareja__dos">{y && <><span className="rg-pareja__y">&amp;</span>{" "}</>}<span>{otro}</span></span>
    </T>
  );
}

/* ── Cuenta regresiva ──────────────────────────────────────── */

function Cuenta({ fecha }: { fecha: string }) {
  const [f, setF] = useState<Faltante | null>(null);
  useEffect(() => {
    // En el servidor no existe "ahora": la cuenta arranca en el navegador.
    const medir = () => setF(calcularFaltante(parsearFecha(fecha)));
    const cuadro = requestAnimationFrame(medir);
    const t = setInterval(medir, 1000);
    return () => { cancelAnimationFrame(cuadro); clearInterval(t); };
  }, [fecha]);

  const cajas: [string, number | undefined][] = [["Días", f?.d], ["Horas", f?.h], ["Min", f?.m], ["Seg", f?.s]];
  return (
    <div className="rg-cuenta" role="timer" aria-label={f ? `Faltan ${f.d} días` : undefined}>
      {cajas.map(([nombre, v]) => (
        <div key={nombre} className="rg-cuenta__caja" aria-hidden="true">
          <span className="rg-cuenta__n"><span key={v}>{v ?? "··"}</span></span>
          <span className="rg-cuenta__que">{nombre}</span>
        </div>
      ))}
    </div>
  );
}

function Copiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <p className="rg-dato">
      <span>{etiqueta}</span>
      <strong>{valor}</strong>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(valor);
            navigator.vibrate?.(10);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2200);
          } catch {
            // Sin permiso de portapapeles el dato igual está a la vista.
          }
        }}
      >
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </p>
  );
}

/* ── Confirmación ──────────────────────────────────────────── */

function Rsvp({ datos, personal }: { datos: Datos; personal?: Personal }) {
  const r = usarRsvp({ slug: datos.slug, personal });
  const limite = datos.cierreRsvp ? parsearFecha(datos.cierreRsvp) : null;
  const plural = personal && r.cupo > 1;

  return (
    <Escena className="rg-rsvp">
      <Titulo>Confirmación de Asistencia</Titulo>
      <p className="rg-texto">Te agradecemos responder antes del</p>
      {limite && <p className="rg-clave rg-limite">{limite.getDate()} <i>|</i> {MESES[limite.getMonth()]} <i>|</i> {limite.getFullYear()}</p>}

      <div className="rg-ficha">
        {r.cerrado && !personal ? (
          <p className="rg-texto">Esta invitación es personal. Confirma desde el enlace que te enviaron.</p>
        ) : r.enviado ? (
          <div className="rg-listo" role="status">
            {r.asiste && <Papelitos />}
            {r.asiste && datos.rasgado.tema === "fogata" && <Malvaviscos />}
            <p className="rg-titulo rg-titulo--fijo">{r.asiste ? "¡Nos vemos pronto!" : "Gracias por avisar"}</p>
            <p className="rg-texto">
              {r.asiste
                ? `Guardamos ${r.acompanantes === 1 ? "tu lugar" : `${r.acompanantes} lugares`}. Qué alegría que vengas.`
                : "Te vamos a extrañar ese día."}
            </p>
            {personal && (
              <button type="button" className="rg-enlace" onClick={() => r.setEnviado(false)}>Cambiar la respuesta</button>
            )}
          </div>
        ) : (
          <div ref={r.formRef} className="rg-form">
            <label className="rg-campo">
              <span>Nombre del invitado</span>
              {personal
                ? <strong>{personal.nombre}</strong>
                : <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} placeholder="Nombre y apellido" autoComplete="name" maxLength={40} />}
            </label>

            {plural && (
              <p className="rg-pases">Esta invitación cuenta con <b>{r.cupo} pases</b>. Una sola persona confirma por todos.</p>
            )}

            <label className="rg-campo">
              <span>Confirmación</span>
              <select value={r.asiste === null ? "" : r.asiste ? "si" : "no"} onChange={(e) => r.setAsiste(e.target.value === "" ? null : e.target.value === "si")}>
                <option value="">Selecciona una opción</option>
                <option value="si">{plural ? "Sí, asistiremos" : "Sí, asistiré"}</option>
                <option value="no">{plural ? "No podremos asistir" : "No podré asistir"}</option>
              </select>
            </label>

            <div className="rg-pliegue" data-abierto={r.asiste === true} inert={r.asiste !== true}>
              <div>
                {r.cupo > 1 && (
                  <label className="rg-campo">
                    <span>Personas que asisten</span>
                    <select value={r.acompanantes} onChange={(e) => r.setAcompanantes(Number(e.target.value))}>
                      {Array.from({ length: r.cupo }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                    </select>
                  </label>
                )}
                <label className="rg-campo">
                  <span>Alimentación</span>
                  <select value={r.comidas[0] ?? ""} onChange={(e) => r.setComidas(e.target.value ? [e.target.value] : [])}>
                    <option value="">Selecciona una opción</option>
                    {COMIDAS.map((c) => <option key={c} value={c}>{c === "Sin TACC" ? "Sin gluten" : c}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <label className="rg-campo">
              <span>Mensaje para los novios</span>
              <textarea rows={3} maxLength={400} value={r.mensaje} onChange={(e) => r.setMensaje(e.target.value)} />
            </label>

            {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="rg-aviso">Falta tu nombre o si asistes</p>}
            {r.errorEnvio && <p role="alert" className="rg-aviso">{r.errorEnvio}</p>}

            <button type="button" className="rg-enviar" onClick={r.enviar} disabled={r.enviando}>
              {r.enviando ? "Enviando…" : "Enviar"}
            </button>
          </div>
        )}
      </div>
    </Escena>
  );
}

/* ── La invitación ─────────────────────────────────────────── */

export default function InvitacionRasgado({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const conNombres = invitacion.nombres.includes("&");
  const [uno, otro] = invitacion.nombres.split(conNombres ? "&" : " ").map((x) => x.trim());
  const g = invitacion.rasgado;
  const fecha = parsearFecha(invitacion.fecha);
  const ceremonia = invitacion.lugares?.[0];
  const fechaCorta = fecha ? `${dos(fecha.getDate())} · ${dos(fecha.getMonth() + 1)} · ${fecha.getFullYear()}` : "";
  const calendario = enlaceCalendario(invitacion, ceremonia);
  const fuego = g.tema === "fogata";
  const marca = (grande?: boolean) => (g.monograma ? <Monograma letras={g.monograma} grande={grande} /> : <Emblema grande={grande} />);
  const pase = personal ? { invitado: personal.nombre, lugares: personal.cupo } : g.pase;

  const [abierta, setAbierta] = useState(false);
  const [verBanco, setVerBanco] = useState(false);

  /* La música nace del toque que abre la tapa: los navegadores no dejan que
     suene sola. Si el invitado se va de la pestaña, se calla. */
  const audio = useRef<HTMLAudioElement>(null);
  const [suena, setSuena] = useState(false);

  const tocar = () => {
    const a = audio.current;
    if (!a) return;
    a.volume = 0;
    a.play()
      .then(() => {
        const desde = performance.now();
        const subir = () => {
          const v = Math.min(1, (performance.now() - desde) / 2600);
          a.volume = v * 0.75;
          if (v < 1 && !a.paused) requestAnimationFrame(subir);
        };
        subir();
      })
      .catch(() => setSuena(false));
  };

  useEffect(() => {
    const alCambiar = () => { if (document.hidden) audio.current?.pause(); };
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  }, []);

  return (
    <Abierta.Provider value={abierta}>
      <main className="inv-columna rg" data-abierta={abierta} data-tema={g.tema}>
        <Tapa
          nombres={invitacion.nombres}
          marca={marca(true)}
          quemado={fuego}
          saludo={personal?.saludo ?? invitacion.fecha.replace(/ (\d{4})$/, " de $1").toLowerCase()}
          alAbrir={() => { setAbierta(true); tocar(); }}
        >
          <Papelitos />
        </Tapa>

        {invitacion.musica && (
          <>
            <audio ref={audio} src={invitacion.musica} loop preload="auto" onPlay={() => setSuena(true)} onPause={() => setSuena(false)} />
            <button
              type="button"
              className="rg-musica"
              data-suena={suena}
              aria-label={suena ? "Pausar la música" : "Reproducir la música"}
              onClick={() => (suena ? audio.current?.pause() : tocar())}
            >
              <span className="rg-musica__barras" aria-hidden="true"><i /><i /><i /><i /></span>
              <svg className="rg-musica__play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
            </button>
          </>
        )}

        {/* ── Portada ── */}
        <header className="rg-portada">
          {marca()}
          <Foto foto={g.fotos.portada} semilla={11} arriba="crema" abajo="crema" prioridad quemado={fuego} chispas={fuego} />
        </header>

        <Escena className="rg-inicio">
          {invitacion.frase && <p className="rg-frase">“{invitacion.frase}”</p>}
          <Pareja uno={uno} otro={otro} y={conNombres} />
          {personal && (
            <div className="rg-saludo">
              <p className="rg-script">{personal.saludo}</p>
              {personal.nota && <p className="rg-texto">{personal.nota}</p>}
            </div>
          )}
          <p className="rg-texto">{g.bendicion}</p>
          {g.padres.map((p) => (
            <div key={p.titulo} className="rg-padres">
              <h2 className="rg-script">{p.titulo}</h2>
              {p.nombres.map((nombre) => <p key={nombre}>{nombre}</p>)}
            </div>
          ))}
        </Escena>

        {/* ── El gran día ── */}
        <Escena azul className="rg-dia">
          <h2 className="rg-mayus">Nuestro gran día</h2>
          {fecha && (
            <div className="rg-fecha">
              <p className="rg-fecha__mes">{MESES[fecha.getMonth()]}</p>
              <p className="rg-fecha__lado">{DIAS[fecha.getDay()]}</p>
              <p className="rg-fecha__n"><span>{fecha.getDate()}</span></p>
              <p className="rg-fecha__lado">{ceremonia?.hora ?? "20:00"} hs</p>
              <p className="rg-fecha__anio">{fecha.getFullYear()}</p>
            </div>
          )}
          {calendario && (
            <a className="rg-enlace" href={calendario} target="_blank" rel="noopener noreferrer">Añadir al calendario</a>
          )}
          <Titulo as="p">Solo faltan…</Titulo>
          <Cuenta fecha={invitacion.fecha} />
        </Escena>

        <Foto foto={g.fotos.lugar} semilla={23} arriba="azul" abajo="crema" quemado={fuego} />

        {/* ── Dónde ── */}
        <Escena className="rg-lugares">
          <Titulo>Lugar del Evento</Titulo>
          {invitacion.lugares?.map((l) => (
            <article key={l.titulo} className="rg-lugar">
              <h3 className="rg-script">{l.tipo}</h3>
              <p className="rg-clave">{l.titulo}</p>
              <p className="rg-lugar__hora">{l.hora} <small>hs</small></p>
              <p className="rg-texto">{l.direccion}</p>
              <a className="rg-boton" href={l.mapa} target="_blank" rel="noopener noreferrer">Ver ubicación</a>
            </article>
          ))}
        </Escena>

        {invitacion.cronograma && (
          <Escena className="rg-orden">
            <Titulo>Itinerario</Titulo>
            <ol className="rg-hitos">
              {invitacion.cronograma.map((h, i) => (
                <li key={h.hora} style={{ "--i": i } as React.CSSProperties}>
                  <span className="rg-hitos__hora">{h.hora}</span>
                  <span className="rg-hitos__que">{h.titulo}</span>
                </li>
              ))}
            </ol>
          </Escena>
        )}

        <Foto foto={g.fotos.vestimenta} semilla={37} arriba="crema" abajo="azul" quemado={fuego} />

        {/* ── Vestimenta y regalos ── */}
        <Escena azul className="rg-regalos">
          {invitacion.dressCode && (
            <>
              <Titulo>Código de Vestimenta</Titulo>
              <div className="rg-ropa" aria-hidden="true">
                <span className="rg-ropa__traje" />
                <span className="rg-ropa__vestido" />
              </div>
              <h3 className="rg-clave">{invitacion.dressCode.titulo}</h3>
              <p className="rg-texto rg-italica">{invitacion.dressCode.detalle}</p>
            </>
          )}

          {invitacion.regalo && (
            <>
              <Titulo className="rg-titulo--aire">Mesa de Regalos</Titulo>
              <p className="rg-texto">{invitacion.regalo.mensaje}</p>
              {g.listaRegalos && (
                <div className="rg-opcion">
                  <h3 className="rg-mayus">{g.listaRegalos.titulo}</h3>
                  <a className="rg-boton" href={g.listaRegalos.enlace} target="_blank" rel="noopener noreferrer">{g.listaRegalos.boton}</a>
                </div>
              )}
              <div className="rg-opcion">
                <h3 className="rg-mayus">{invitacion.regalo.banco}</h3>
                <button type="button" className="rg-boton" aria-expanded={verBanco} onClick={() => setVerBanco(!verBanco)}>
                  {verBanco ? "Ocultar datos" : "Ver datos bancarios"}
                </button>
                <div className="rg-pliegue" data-abierto={verBanco} inert={!verBanco}>
                  <div className="rg-banco">
                    <p className="rg-banco__titular">{invitacion.regalo.titular}</p>
                    <Copiable etiqueta="Alias" valor={invitacion.regalo.alias} />
                    <Copiable etiqueta="Cuenta" valor={invitacion.regalo.cbu} />
                  </div>
                </div>
              </div>
              {g.sobres && (
                <div className="rg-opcion">
                  <h3 className="rg-mayus">{g.sobres.titulo}</h3>
                  <p className="rg-texto rg-italica">{g.sobres.detalle}</p>
                </div>
              )}
            </>
          )}
          <div className="rg-firma">
            {marca()}
            <p className="rg-mayus">{conNombres ? `${uno} + ${otro}` : fechaCorta}</p>
          </div>
        </Escena>

        {/* ── Pase ── */}
        <Escena className="rg-accesos">
          <div className="rg-pase">
            <h2 className="rg-mayus rg-pase__titulo">Accesos</h2>
            <p className="rg-clave rg-pase__quien">{pase.invitado}</p>
            <p className="rg-texto">Hemos reservado</p>
            <p className="rg-pase__n">{pase.lugares}</p>
            <p className="rg-texto">{pase.lugares === 1 ? "lugar para ti" : "lugares para ustedes"}</p>
          </div>
          {g.soloAdultos && (
            <>
              <h2 className="rg-clave rg-adultos">Solo adultos</h2>
              <p className="rg-texto">{g.soloAdultos}</p>
            </>
          )}
        </Escena>

        <Foto foto={g.fotos.pausa} semilla={58} arriba="crema" abajo="crema" quemado={fuego} />

        <Rsvp datos={invitacion} personal={personal} />

        <Escena className="rg-gracias">
          <Titulo as="p">Muchas Gracias</Titulo>
          <p className="rg-texto">{g.gracias}</p>
        </Escena>

        <Foto foto={g.fotos.cierre} semilla={61} arriba="crema" abajo="crema" quemado={fuego} chispas={fuego} />

        <footer className="rg-pie">
          <Pareja as="p" uno={uno} otro={otro} y={conNombres} enLinea />
          {marca()}
        </footer>
      </main>
    </Abierta.Provider>
  );
}
