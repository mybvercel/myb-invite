"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionNoir as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarRsvp } from "../usarRsvp";
import Flecha from "../Flecha";

/**
 * Estilo NOIR (encuentro ejecutivo). Un sobre negro con sello rojo cuyas dos
 * hojas se abren sobre la invitación ya dibujada, y una portada que queda fija
 * 420 px de scroll mientras una botella sirve vino en la copa.
 *
 * El llenado es una composición de imágenes con máscara animada, no una
 * simulación: la copa llena se recorta con `clip-path` según el scroll y un
 * trazo SVG une la boca de la botella con el nivel del vino. Con movimiento
 * reducido (o pausado a mano) se muestra la copa llena y sin botella.
 *
 * El diseño sale de la maqueta noir-ejecutiva; el CSS está escopado bajo .nr
 * en app/i/noir.css.
 */

const A = "/invitaciones/noir/";
const limitar = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const dosCifras = (n: number) => String(n).padStart(2, "0");

/** "Pasaje del Roble 1420, Buenos Aires" → dos líneas. */
const lineas = (txt: string) => txt.split(/,\s*/);

export default function InvitacionNoir({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const n = invitacion.noir;
  const lugar = invitacion.lugares?.[0];

  const [cerrada, setCerrada] = useState(true);
  const [abriendo, setAbriendo] = useState(false);
  const [listo, setListo] = useState(false);
  const [pausado, setPausado] = useState(false);

  const raiz = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const sello = useRef<HTMLButtonElement>(null);
  const ocupado = useRef(false);
  const cuadro = useRef(0);

  /* ── Fecha ── */
  const f = parsearFecha(invitacion.fecha, 20);
  const dia = f ? f.getDate() : "";
  const mes = f ? dosCifras(f.getMonth() + 1) : "";
  const nombreMes = f ? f.toLocaleDateString("es-AR", { month: "long" }) : "";
  const diaSemana = f ? f.toLocaleDateString("es-AR", { weekday: "long" }).toUpperCase() : "";
  const limite = invitacion.cierreRsvp?.replace(/^Confirmá antes del?\s*/i, "").replace(/\.$/, "");
  const fechaLarga = invitacion.fecha.replace(/ (\d{4})$/, " de $1").replace(/ de ([A-ZÁÉÍÓÚ])/, (_, l: string) => ` de ${l.toLowerCase()}`);

  const palabras = (lugar?.titulo ?? "").split(" ");
  const corte = 1;
  const lugarA = palabras.slice(0, corte).join(" ");
  const lugarB = `${palabras.slice(corte).join(" ")}.`;

  /* ── Movimiento reducido: el estado inicial lo decide el navegador ── */
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPausado(m.matches);
    setListo(true);
    const alCambiar = () => setPausado(m.matches);
    m.addEventListener("change", alCambiar);
    return () => m.removeEventListener("change", alCambiar);
  }, []);

  /* ── Con el sobre cerrado no se scrollea ── */
  useEffect(() => {
    if (!cerrada) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [cerrada]);

  /* ── Las secciones aparecen al entrar en pantalla ── */
  useEffect(() => {
    const nodos = raiz.current?.querySelectorAll(".reveal");
    if (!nodos?.length) return;
    const ojo = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add("seen");
            ojo.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1 },
    );
    nodos.forEach((el) => ojo.observe(el));
    return () => ojo.disconnect();
  }, []);

  /* ── El vino, la botella y el resto de lo que depende del scroll ── */
  const pintar = useCallback(() => {
    cuadro.current = 0;
    const r = raiz.current;
    if (!r) return;
    const copa = r.querySelector<HTMLElement>("#glass");
    const botella = r.querySelector<HTMLElement>("#bottle");
    const chorro = r.querySelector<SVGElement>("#pour");
    const trazo = r.querySelector<SVGPathElement>("#wine-stream");
    const zona = r.querySelector<HTMLElement>("#glass-zone");
    const cena = r.querySelector<HTMLElement>(".dinner");
    const imgCena = r.querySelector<HTMLElement>(".dinner img");
    const linea = r.querySelector<HTMLElement>(".line-fill");
    const tiempos = r.querySelector<HTMLElement>(".timeline");
    if (!copa || !botella || !chorro || !trazo || !zona || !cena || !imgCena || !linea || !tiempos) return;

    const progreso = limitar(window.scrollY / 420);
    const nivel = limitar((progreso - 0.22) / 0.56);
    const llegada = Math.min(1, progreso / 0.2);
    const salida = Math.max(0, (progreso - 0.82) / 0.18);
    const k = 1 - llegada + salida;

    copa.style.setProperty("--wine-top", `${56 - nivel * 24}%`);
    copa.style.setProperty("--wine-visible", nivel > 0 ? "1" : "0");
    botella.style.opacity = progreso > 0 && progreso < 1 ? "1" : "0";
    botella.style.transform = `translateX(${k * 240}px) rotate(${k * -22}deg)`;
    chorro.style.opacity = progreso >= 0.22 && progreso <= 0.8 && !pausado ? "1" : "0";
    trazo.setAttribute("d", `M42 0 C18 22 16 45 16 75 L16 ${29 + 390 * Math.max(0.37, (56 - nivel * 24) / 100)}`);
    zona.style.transform = "none";

    if (pausado) {
      imgCena.style.transform = "translateY(-6%)";
      linea.style.transform = "scaleY(1)";
      return;
    }
    imgCena.style.transform = `translateY(${limitar(-cena.getBoundingClientRect().top * 0.03 - 10, -25, 0)}px)`;
    const tb = tiempos.getBoundingClientRect();
    linea.style.transform = `scaleY(${limitar((window.innerHeight * 0.8 - tb.top) / tb.height)})`;
  }, [pausado]);

  useEffect(() => {
    const pedir = () => {
      if (!cuadro.current) cuadro.current = requestAnimationFrame(pintar);
    };
    pedir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      cancelAnimationFrame(cuadro.current);
      cuadro.current = 0;
    };
  }, [pintar, cerrada]);

  /* ── El sobre ── */
  const abrir = async () => {
    if (ocupado.current) return;
    ocupado.current = true;
    // La portada se decodifica antes de abrir: así las hojas se corren sobre
    // una invitación ya dibujada y no hay un parpadeo.
    const imgs = Array.from(raiz.current?.querySelectorAll<HTMLImageElement>(".hero img") ?? []);
    await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
    setAbriendo(true);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(
      () => {
        setCerrada(false);
        setAbriendo(false);
        ocupado.current = false;
        window.scrollTo(0, 0);
        titulo.current?.focus({ preventScroll: true });
      },
      reducido ? 0 : 1900,
    );
  };

  const volver = () => {
    window.scrollTo(0, 0);
    setCerrada(true);
    setTimeout(() => sello.current?.focus(), 0);
  };

  /* ── Confirmación ── */
  const r = usarRsvp({ slug: invitacion.slug, personal });
  const clase = ["nr", listo && "motion-ready", pausado && "motion-paused", cerrada && "locked"].filter(Boolean).join(" ");
  const [t1, t2] = n.titulo;
  const [i1, i2, i3] = n.introTitulo;

  return (
    <div ref={raiz} className={clase}>
      <main {...(cerrada ? { inert: true } : {})}>
        {/* ── Portada ── */}
        <section className="hero" id="portada">
          <div className="hero-stage">
            <header>
              <strong>{n.anfitrion.toUpperCase()}</strong>
            </header>
            <div className="edition" aria-hidden="true" />
            <h1 ref={titulo} tabIndex={-1}>
              {t1}
              <br />
              <em>{t2}</em>
            </h1>
            <div className="hero-lower">
              <div className="hero-info">
                <p>
                  {n.tarjeta[0]}
                  <br />
                  {n.tarjeta[1]}
                  <br />
                  {n.tarjeta[2]}
                </p>
                <div className="date">
                  <strong>
                    {dia}
                    <span>{mes}</span>
                  </strong>
                  <p>
                    {diaSemana} · {lugar?.hora} H
                    <br />
                    {lugar?.titulo.toUpperCase()}
                  </p>
                </div>
                <a href="#asistencia" className="hero-cta">
                  Confirmar
                  <br />
                  asistencia <span><Flecha dir="ne" /></span>
                </a>
              </div>
              <div className="glass-zone" id="glass-zone">
                <img id="bottle" src={`${A}botella.webp`} alt="" aria-hidden="true" />
                <svg id="pour" viewBox="0 0 80 300" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="wine-tone">
                      <stop stopColor="#53111f" />
                      <stop offset=".5" stopColor="#b93447" />
                      <stop offset="1" stopColor="#6b1326" />
                    </linearGradient>
                  </defs>
                  <path id="wine-stream" d="M20 0 C18 30 16 50 16 100 L16 250" fill="none" stroke="url(#wine-tone)" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
                <div id="glass" role="img" aria-label="Copa que se llena de vino al bajar">
                  <img className="empty-glass" src={`${A}copa-vacia.webp`} alt="" />
                  <img className="wine-fill" src={`${A}copa.webp`} alt="" />
                </div>
              </div>
            </div>
            <div className="hero-bottom">
              <a href="#encuentro">Deslizá para brindar <Flecha dir="s" /></a>
              <button type="button" id="motion" aria-pressed={pausado} onClick={() => setPausado((p) => !p)}>
                {pausado ? "Activar movimiento" : "Pausar movimiento"}
              </button>
            </div>
          </div>
        </section>

        {/* ── El encuentro ── */}
        <section id="encuentro" className="encuentro">
          <div className="intro reveal">
            <p className="eyebrow">EL ENCUENTRO</p>
            <h2>
              {i1}
              <br />
              {i2}
              <br />
              <em>{i3}</em>
            </h2>
            <p>{n.introTexto}</p>
          </div>
          <figure className="dinner">
            <img src={`${A}cena.webp`} alt="Ambientación de una cena privada" loading="lazy" decoding="async" />
            <figcaption>{n.escenaPie}</figcaption>
          </figure>
          <div className="timeline">
            <div className="line-fill" aria-hidden="true" />
            {n.agenda.map((a) => (
              <article key={a.hora} className="reveal">
                <time>{a.hora}</time>
                <h3>{a.titulo}</h3>
                <p>{a.detalle}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── El lugar ── */}
        {lugar && (
          <section id="lugar" className="lugar">
            <div className="place-top reveal">
              <span>LA DIRECCIÓN DE LA NOCHE</span>
              <h2>
                {lugarA}
                <br />
                <em>{lugarB}</em>
              </h2>
              <p>
                {lineas(lugar.direccion)[0]}
                {lineas(lugar.direccion)[1] && (
                  <>
                    <br />
                    {lineas(lugar.direccion)[1]}
                  </>
                )}
              </p>
              <a className="button light" href={lugar.mapa} target="_blank" rel="noopener noreferrer">
                Cómo llegar <span><Flecha dir="ne" /></span>
              </a>
            </div>
            {invitacion.dressCode && (
              <div className="dress reveal">
                <span>EL CÓDIGO</span>
                <h3>{invitacion.dressCode.titulo}</h3>
                <p>{invitacion.dressCode.detalle}</p>
              </div>
            )}
          </section>
        )}

        {/* ── Confirmación ── */}
        <section id="asistencia" className="rsvp">
          <p className="eyebrow reveal">{limite ? `CONFIRMÁ HASTA EL ${limite.toUpperCase()}` : "CONFIRMÁ TU ASISTENCIA"}</p>
          <h2 className="reveal">
            {n.rsvpTitulo[0]}
            <br />
            <em>{n.rsvpTitulo[1]}</em>
          </h2>
          <p className="form-intro">Dejanos tu respuesta para preparar cada detalle.</p>

          {r.cerrado && !personal ? (
            <p className="form-intro">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
          ) : r.enviado ? (
            <div className="gracias" role="status">
              <h3>{r.asiste ? "Tu lugar está reservado." : "Gracias por avisarnos."}</h3>
              <p>{r.asiste ? `Te esperamos el ${fechaLarga}.` : "Esperamos verte en la próxima."}</p>
              {personal && (
                <button
                  type="button"
                  onClick={() => {
                    r.setEnviado(false);
                    r.abrir();
                  }}
                  style={{ marginTop: 16, border: 0, borderBottom: "1px solid #8c7a71", background: "none", padding: "8px 0 4px" }}
                >
                  Cambiar mi respuesta
                </button>
              )}
            </div>
          ) : (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                r.enviar();
              }}
            >
              {!personal && (
                <label>
                  Nombre y apellido
                  <input name="nombre" value={r.nombre} onChange={(ev) => r.setNombre(ev.target.value)} autoComplete="name" maxLength={80} />
                </label>
              )}
              <fieldset>
                <legend>¿Nos acompañás?</legend>
                <label>
                  <input type="radio" name="respuesta" checked={r.asiste === true} onChange={() => r.setAsiste(true)} /> Sí, voy a estar
                </label>
                <label>
                  <input type="radio" name="respuesta" checked={r.asiste === false} onChange={() => r.setAsiste(false)} /> No podré asistir
                </label>
              </fieldset>
              {r.asiste === true && (
                <fieldset id="diet">
                  <legend>
                    Alimentación o accesibilidad <small>(opcional)</small>
                  </legend>
                  {COMIDAS.map((c) => (
                    <label key={c}>
                      <input type="checkbox" checked={r.comidas.includes(c)} onChange={() => r.alternarComida(c)} /> {c}
                    </label>
                  ))}
                </fieldset>
              )}
              {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="aviso">Falta tu nombre y si vas a venir.</p>}
              {r.errorEnvio && (
                <p role="alert" className="aviso">
                  {r.errorEnvio}
                </p>
              )}
              <button className="button" type="submit" disabled={r.enviando}>
                {r.enviando ? "Reservando tu lugar…" : "Enviar mi respuesta"} <span><Flecha dir="ne" /></span>
              </button>
            </form>
          )}

          <footer>
            <span>{n.anfitrion.toUpperCase()}</span>
            <em>{n.cierre}</em>
            <button type="button" id="replay" onClick={volver}>
              Volver a abrir la invitación
            </button>
            <small>Diseño de MyB Digitals</small>
          </footer>
        </section>
      </main>

      {/* ── El sobre: dos hojas que se abren sobre la invitación ── */}
      {cerrada && (
        <div id="cover" className={`cover${abriendo ? " opening" : ""}`}>
          <div className="panel panel-left">
            <img src={`${A}sobre-negro.webp`} alt="" />
          </div>
          <div className="panel panel-right">
            <img src={`${A}sobre-negro.webp`} alt="" />
          </div>
          <div className="cover-type">
            <span>{n.sobre.arriba}</span>
            <strong>{n.sobre.marca}</strong>
            <em>{n.sobre.frase}</em>
          </div>
          <button ref={sello} type="button" id="open" aria-label="Abrir la invitación" onClick={abrir} disabled={abriendo}>
            <img src={`${A}sello-rojo.webp`} alt="Sello de lacre rojo" />
          </button>
          <div className="cover-bottom">
            <span>
              {invitacion.volanta.toUpperCase()} · {dia} {nombreMes.toUpperCase()}
            </span>
            <p>{n.sobre.pista}</p>
          </div>
        </div>
      )}
    </div>
  );
}
