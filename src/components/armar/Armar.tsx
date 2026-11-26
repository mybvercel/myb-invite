"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Maximize2, MessageCircle } from "lucide-react";
import {
  EVENTOS,
  deQuienFotos,
  fotosDe,
  PREOCUPACIONES,
  eventoDeModelo,
  mensajeArmar,
  modeloPorSlug,
  modelosDe,
  rutaVista,
  slugDe,
  type EventoArmar,
  type Preocupacion,
} from "@/lib/armar";
import { WHATSAPP, nombreDe, type Diseno } from "@/lib/invitaciones";
import {
  LARGO_EMPRESA,
  LARGO_NOMBRE,
  fechaLarga,
  fechaLocal,
  limpiarFecha,
  limpiarNombre,
  partesFecha,
  type DatosVista,
} from "@/lib/vista";
import "./armar.css";

/**
 * Armá tu invitación: cinco toques y la persona ve SU invitación, con sus
 * nombres y su fecha, antes de escribirnos. El valor no se muestra acá: se
 * pasa por WhatsApp, con todo lo que cargó ya escrito en el mensaje.
 */

type Paso = 0 | 1 | 2 | 3 | 4 | 5;

type Estado = {
  paso: Paso;
  evento: EventoArmar["id"];
  modelo: string;
  porNosotros: boolean;
  a: string;
  b: string;
  f: string;
  e: string;
  bat: boolean;
  preocupa: string;
};

const INICIAL: Estado = {
  paso: 0, evento: "boda", modelo: "rosa", porNosotros: false,
  a: "", b: "", f: "", e: "", bat: false, preocupa: "confirmen",
};
const CLAVE = "myb-armar";

type Fbq = (...a: unknown[]) => void;
const avisar = (...a: unknown[]) => (window as unknown as { fbq?: Fbq }).fbq?.(...a);

const hoyIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const faltan = (iso: string) => Math.round((fechaLocal(iso).getTime() - fechaLocal(hoyIso()).getTime()) / 864e5);

/** `pedido` llega cuando tocan "Verla con mis datos" en un modelo de la misma página. */
export default function Armar({ pedido }: { pedido?: { m: string; n: number } }) {
  const busqueda = useSearchParams();
  const raizRef = useRef<HTMLElement>(null);
  const [s, setS] = useState<Estado>(INICIAL);
  const [listo, setListo] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const primera = useRef(true);

  // Lo que ya había cargado (vuelve de ver su invitación) o el modelo del enlace.
  useEffect(() => {
    let guardado: Partial<Estado> = {};
    try {
      guardado = JSON.parse(sessionStorage.getItem(CLAVE) ?? "{}") as Partial<Estado>;
    } catch {}
    const pedidoModelo = modeloPorSlug(pedido?.m ?? busqueda.get("m") ?? "");
    const cuadro = requestAnimationFrame(() => {
      const base = { ...INICIAL, ...guardado };
      const eventoPedido = pedidoModelo && eventoDeModelo(pedidoModelo);
      if (pedidoModelo && eventoPedido && (slugDe(pedidoModelo) !== base.modelo || base.paso < 2)) {
        const mismo = base.evento === eventoPedido.id;
        setS({
          ...base,
          evento: eventoPedido.id,
          modelo: slugDe(pedidoModelo),
          porNosotros: false,
          // Si ya había cargado todo, va directo a ver el otro diseño.
          paso: mismo && base.paso === 5 ? 5 : 2,
          ...(mismo ? {} : { a: "", b: "" }),
        });
      } else {
        setS(base);
      }
      setListo(true);
    });
    return () => cancelAnimationFrame(cuadro);
  }, [busqueda, pedido]);

  useEffect(() => {
    if (!listo) return;
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(s));
    } catch {}
  }, [s, listo]);

  // Cada paso empieza arriba y con el foco en su pregunta.
  useEffect(() => {
    if (!listo) return;
    if (primera.current) {
      primera.current = false;
      return;
    }
    // Vive en la home: cada paso vuelve al principio de la sección, no de la página.
    const raiz = raizRef.current;
    if (raiz && raiz.getBoundingClientRect().top < 0) raiz.scrollIntoView({ behavior: "smooth", block: "start" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [s.paso, listo]);

  const evento = EVENTOS.find((e) => e.id === s.evento) ?? EVENTOS[0];
  const modelos = modelosDe(evento);
  const modelo = modelos.find((m) => slugDe(m) === s.modelo) ?? modelos[0];
  const preocupacion = PREOCUPACIONES.find((p) => p.id === s.preocupa) ?? PREOCUPACIONES[0];
  const vista: DatosVista = {
    a: limpiarNombre(s.a).trim(),
    ...(evento.campoB && { b: limpiarNombre(s.b).trim() }),
    ...(limpiarFecha(s.f) && { f: s.f }),
    ...(evento.id === "cumple" && s.e && { e: s.e }),
    ...(evento.id === "mitzva" && s.bat && { t: "bat" as const }),
  };

  const ir = (paso: Paso, cambios: Partial<Estado> = {}) => {
    if (paso > s.paso) avisar("trackCustom", "ArmarPaso", { paso });
    if (paso === 5 && s.paso === 4) {
      avisar("track", "Lead", { content_name: "Armó su invitación", content_category: evento.mensaje });
    }
    setS((v) => ({ ...v, ...cambios, paso }));
  };

  const elegirEvento = (e: EventoArmar) =>
    ir(1, e.id === s.evento ? {} : { evento: e.id, modelo: slugDe(modelosDe(e)[0]), porNosotros: false, a: "", b: "" });

  const pedir = () => {
    avisar("track", "Contact", { content_name: "Quiero esta" });
    const url = mensajeArmar({ evento, modelo, elegidoPorNosotros: s.porNosotros, vista, preocupacion });
    // Sin <a href>: el mensaje lleva nombres y no tiene que quedar en la página.
    const pestana = window.matchMedia("(pointer: fine)").matches ? window.open(url, "_blank") : null;
    if (pestana) Object.assign(pestana, { opener: null });
    else window.location.assign(url);
  };

  return (
    <section ref={raizRef} className="ar" data-listo={listo || undefined}>
      {/* Carátula fija: mismo ancho y mismo alto en todos los pasos, nada salta. */}
      <div className="ar-marco">
      {s.paso < 5 && (
        <div className="ar-avance" role="progressbar" aria-label="Avance" aria-valuemin={1} aria-valuemax={5} aria-valuenow={s.paso + 1}>
          {[0, 1, 2, 3, 4].map((n) => (
            <i key={n} data-hecho={n <= s.paso || undefined} />
          ))}
        </div>
      )}

      <div className="ar-paso" key={s.paso}>
        {s.paso === 0 && (
          <>
            <h2 ref={tituloRef} tabIndex={-1} className="tid-titulo ar-titulo">¿Qué van a festejar?</h2>
            <p className="tid-plomo ar-bajada">Cinco toques y ves tu invitación terminada.</p>
            <ul className="ar-eventos">
              {EVENTOS.map((e) => (
                <li key={e.id}>
                  <button type="button" className="ar-evento" onClick={() => elegirEvento(e)}>
                    <span className="ar-evento__foto">
                      <Image src={e.foto ?? modelosDe(e)[0].imagen} alt="" fill sizes="92px" />
                    </span>
                    <span className="ar-evento__texto">{e.titulo}</span>
                    <ArrowRight size={18} aria-hidden="true" className="ar-evento__flecha" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {s.paso === 1 && (
          <>
            <h2 ref={tituloRef} tabIndex={-1} className="tid-titulo ar-titulo">¿Cuál abrirías primero?</h2>
            <p className="tid-plomo ar-bajada">Después la ves con tus datos y la podés cambiar.</p>
            {modelos.length > 1 && (
              <button type="button" className="tid-boton tid-boton--linea ar-boton" onClick={() => ir(2, { modelo: slugDe(modelos[0]), porNosotros: true })}>
                No me decido, elijan por mí
              </button>
            )}
            <Modelos modelos={modelos} elegir={(m) => ir(2, { modelo: slugDe(m), porNosotros: false })} />
          </>
        )}

        {s.paso === 2 && (
          <Nombres
            evento={evento}
            modelo={modelo}
            s={s}
            tituloRef={tituloRef}
            cambiar={(c) => setS((v) => ({ ...v, ...c }))}
            seguir={() => ir(3)}
          />
        )}

        {s.paso === 3 && (
          <Fecha
            modelo={modelo}
            vista={vista}
            f={s.f}
            tituloRef={tituloRef}
            cambiar={(f) => setS((v) => ({ ...v, f }))}
            seguir={(f) => ir(4, { f })}
          />
        )}

        {s.paso === 4 && (
          <>
            <h2 ref={tituloRef} tabIndex={-1} className="tid-titulo ar-titulo">¿Qué es lo que más te preocupa?</h2>
            <p className="tid-plomo ar-bajada">Es la última.</p>
            <ul className="ar-opciones">
              {PREOCUPACIONES.map((p) => (
                <li key={p.id}>
                  <button type="button" className="ar-opcion" onClick={() => ir(5, { preocupa: p.id })}>
                    {p.titulo}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {s.paso === 5 && (
          <Resultado
            evento={evento}
            modelo={modelo}
            vista={vista}
            preocupacion={preocupacion}
            tituloRef={tituloRef}
            pedir={pedir}
            cambiarModelo={() => ir(1)}
            cambiarDatos={() => ir(2)}
          />
        )}
      </div>

      {s.paso > 0 && s.paso < 5 && (
        <button type="button" className="ar-atras" onClick={() => ir((s.paso - 1) as Paso)}>
          <ArrowLeft size={16} aria-hidden="true" /> Volver
        </button>
      )}
      </div>
      <p className="ar-directo">
        ¿Preferís hablar?{" "}
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">Escribinos por WhatsApp</a>
      </p>
    </section>
  );
}

/* ── Modelos en carrusel ───────────────────────────────────── */

/** Pasa solo cada 7 segundos hasta que la persona lo toca; ahí queda quieto. */
function Modelos({ modelos, elegir }: { modelos: Diseno[]; elegir: (m: Diseno) => void }) {
  const pista = useRef<HTMLUListElement>(null);
  const [pag, setPag] = useState({ actual: 0, total: 1, porVista: 1 });
  const pagRef = useRef(pag);
  const [quieto, setQuieto] = useState(false);
  const pausa = useRef(false);

  const medir = useCallback(() => {
    const el = pista.current;
    const item = el?.firstElementChild as HTMLElement | null;
    if (!el || !item) return;
    const paso = item.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
    const porVista = Math.max(1, Math.round((el.clientWidth + paso - item.offsetWidth) / paso));
    const total = Math.ceil(modelos.length / porVista);
    const alFinal = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
    const actual = alFinal ? total - 1 : Math.min(total - 1, Math.round(el.scrollLeft / (paso * porVista)));
    const p = pagRef.current;
    if (p.actual === actual && p.total === total && p.porVista === porVista) return;
    pagRef.current = { actual, total, porVista };
    setPag(pagRef.current);
  }, [modelos.length]);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    el.addEventListener("scroll", medir, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", medir);
    };
  }, [medir]);

  const irA = (n: number) => {
    const el = pista.current;
    const { total, porVista } = pagRef.current;
    const destino = el?.children[((n % total) + total) % total * porVista] as HTMLElement | undefined;
    if (el && destino) el.scrollTo({ left: destino.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (quieto || pag.total < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!pausa.current && !document.hidden) irA(pagRef.current.actual + 1);
    }, 7000);
    return () => window.clearInterval(id);
  }, [quieto, pag.total]);

  const frenar = () => setQuieto(true);
  const flecha = (d: number) => {
    frenar();
    irA(pagRef.current.actual + d);
  };

  return (
    <div className="ar-carrusel" aria-roledescription="carrusel" aria-label="Modelos">
      <ul
        ref={pista}
        className="ar-pista"
        onPointerDown={frenar}
        onWheel={frenar}
        onKeyDown={frenar}
        onPointerEnter={(e) => e.pointerType === "mouse" && (pausa.current = true)}
        onPointerLeave={() => (pausa.current = false)}
        onFocus={() => (pausa.current = true)}
        onBlur={() => (pausa.current = false)}
      >
        {modelos.map((m) => (
          <li key={m.id}>
            <button type="button" className="ar-modelo" onClick={() => elegir(m)}>
              <span className="ar-modelo__foto">
                <Image src={m.imagen} alt="" fill sizes="(max-width: 40rem) 45vw, 200px" />
              </span>
              <span className="ar-modelo__nombre">{nombreDe(m)}</span>
              <span className="ar-modelo__fotos">{fotosDe(m) ? `Lleva ${fotosDe(m)} ${fotosDe(m) === 1 ? "foto" : "fotos"}` : "Sin fotos"}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="ar-carrusel__mando" data-oculto={pag.total < 2 || undefined}>
        <button type="button" onClick={() => flecha(-1)} aria-label="Ver los anteriores">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <span aria-live={quieto ? "polite" : "off"}>{pag.actual + 1} de {pag.total}</span>
        <button type="button" onClick={() => flecha(1)} aria-label="Ver más modelos">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ── La tarjeta que se va completando ──────────────────────── */

function Tarjeta({ modelo, vista }: { modelo: Diseno; vista: DatosVista }) {
  const dias = vista.f ? faltan(vista.f) : 0;
  return (
    <div className="ar-tarjeta" style={{ ["--acento" as string]: modelo.acento }}>
      <p className="ar-tarjeta__nombres" data-vacio={!vista.a || undefined}>
        {vista.a || "…"}
        {vista.b !== undefined && (
          <>
            <span> & </span>
            {vista.b || "…"}
          </>
        )}
      </p>
      {vista.f && (
        <p className="ar-tarjeta__fecha">
          {partesFecha(vista.f).semana} {fechaLarga(vista.f)}
        </p>
      )}
      {dias > 0 && <p className="ar-tarjeta__faltan">{dias === 1 ? "Falta 1 día" : `Faltan ${dias} días`}</p>}
    </div>
  );
}

type RefTitulo = React.RefObject<HTMLHeadingElement | null>;

function Nombres({ evento, modelo, s, tituloRef, cambiar, seguir }: {
  evento: EventoArmar;
  modelo: Diseno;
  s: Estado;
  tituloRef: RefTitulo;
  cambiar: (c: Partial<Estado>) => void;
  seguir: () => void;
}) {
  const [falta, setFalta] = useState(false);
  const max = evento.id === "empresa" ? LARGO_EMPRESA : LARGO_NOMBRE;
  const incompleto = !s.a.trim() || (Boolean(evento.campoB) && !s.b.trim());

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    if (incompleto) setFalta(true);
    else seguir();
  };

  return (
    <form className="ar-form" onSubmit={enviar} noValidate>
      <h2 ref={tituloRef} tabIndex={-1} className="tid-titulo ar-titulo">{evento.preguntaNombre}</h2>
      <Tarjeta modelo={modelo} vista={{ a: s.a, ...(evento.campoB && { b: s.b }) }} />
      <div className="ar-campos">
        <label className="ar-campo">
          <span>{evento.campoA}</span>
          <input
            id="ar-a" value={s.a} maxLength={max} autoComplete="off" autoCapitalize="words" enterKeyHint="next"
            aria-invalid={(falta && !s.a.trim()) || undefined}
            onChange={(e) => cambiar({ a: limpiarNombre(e.target.value, max) })}
          />
        </label>
        {evento.campoB && (
          <label className="ar-campo">
            <span>{evento.campoB}</span>
            <input
              id="ar-b" value={s.b} maxLength={max} autoComplete="off" autoCapitalize="words" enterKeyHint="done"
              aria-invalid={(falta && !s.b.trim()) || undefined}
              onChange={(e) => cambiar({ b: limpiarNombre(e.target.value, max) })}
            />
          </label>
        )}
        {evento.id === "cumple" && (
          <label className="ar-campo">
            <span>¿Cuántos cumple?</span>
            <input
              id="ar-e" value={s.e} inputMode="numeric" maxLength={3} autoComplete="off"
              onChange={(e) => cambiar({ e: e.target.value.replace(/\D/g, "") })}
            />
          </label>
        )}
        {evento.id === "mitzva" && (
          <div className="ar-par" role="group" aria-label="Tipo de festejo">
            <button type="button" aria-pressed={!s.bat} onClick={() => cambiar({ bat: false })}>Bar Mitzvá</button>
            <button type="button" aria-pressed={s.bat} onClick={() => cambiar({ bat: true })}>Bat Mitzvá</button>
          </div>
        )}
      </div>
      {falta && incompleto && (
        <p className="ar-error" role="alert">
          {evento.campoB ? "Nos faltan los dos nombres para mostrártela." : "Nos falta el nombre para mostrártela."}
        </p>
      )}
      <button type="submit" className="tid-boton tid-boton--lleno ar-boton">
        Seguir <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}

function Fecha({ modelo, vista, f, tituloRef, cambiar, seguir }: {
  modelo: Diseno;
  vista: DatosVista;
  f: string;
  tituloRef: RefTitulo;
  cambiar: (f: string) => void;
  seguir: (f: string) => void;
}) {
  const [error, setError] = useState("");
  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    if (!limpiarFecha(f)) setError("Elegí el día o tocá la opción de abajo.");
    else if (faltan(f) < 0) setError("Esa fecha ya pasó. Revisá el año.");
    else seguir(f);
  };
  return (
    <form className="ar-form" onSubmit={enviar} noValidate>
      <h2 ref={tituloRef} tabIndex={-1} className="tid-titulo ar-titulo">¿Qué día es?</h2>
      <Tarjeta modelo={modelo} vista={vista} />
      <label className="ar-campo">
        <span>Fecha del festejo</span>
        <input
          id="ar-f" type="date" min={hoyIso()} value={f} aria-invalid={Boolean(error) || undefined}
          onChange={(e) => {
            setError("");
            cambiar(e.target.value);
          }}
        />
      </label>
      {error && <p className="ar-error" role="alert">{error}</p>}
      <button type="submit" className="tid-boton tid-boton--lleno ar-boton">
        Seguir <ArrowRight size={18} aria-hidden="true" />
      </button>
      <button type="button" className="tid-boton tid-boton--linea ar-boton" onClick={() => seguir("")}>
        Todavía no tenemos fecha
      </button>
    </form>
  );
}

/* ── El final: la invitación de verdad ─────────────────────── */

function Resultado({ evento, modelo, vista, preocupacion, tituloRef, pedir, cambiarModelo, cambiarDatos }: {
  evento: EventoArmar;
  modelo: Diseno;
  vista: DatosVista;
  preocupacion: Preocupacion;
  tituloRef: RefTitulo;
  pedir: () => void;
  cambiarModelo: () => void;
  cambiarDatos: () => void;
}) {
  const [cargada, setCargada] = useState(false);
  const fotos = fotosDe(modelo);

  // Si la vista tarda de más, se muestra igual: nunca queda trabada esperando.
  useEffect(() => {
    const t = setTimeout(() => setCargada(true), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="ar-resultado">
      <div className="ar-tel-caja">
      <div className="ar-tel" data-cargada={cargada || undefined}>
        <iframe
          title="Tu invitación"
          src={rutaVista(modelo, vista, true)}
          tabIndex={-1}
          onLoad={() => setTimeout(() => setCargada(true), 700)}
        />
        <p className="ar-tel__espera" aria-hidden={cargada}>Escribiendo tus datos…</p>
        <a className="ar-tel__abrir" href={rutaVista(modelo, vista)}>
          <span><Maximize2 size={18} aria-hidden="true" /> Tocá para abrirla</span>
        </a>
      </div>
      {fotos > 0 && <p className="ar-tel__aviso">Las fotos son de ejemplo</p>}
      </div>

      <div className="ar-cierre">
        <h2 ref={tituloRef} tabIndex={-1} className="tid-titulo ar-titulo">
          Así la van a abrir <span className="tid-fuerte">tus invitados.</span>
        </h2>
        <Tarjeta modelo={modelo} vista={vista} />
        <p className="ar-respuesta">{preocupacion.respuesta}</p>
        <button type="button" className="tid-boton tid-boton--lleno ar-boton" onClick={pedir}>
          <MessageCircle size={18} aria-hidden="true" /> Quiero esta
        </button>
        <p className="ar-nota">Se abre WhatsApp con todo cargado y te pasamos el valor.</p>
        <div className="ar-aviso">
          {fotos > 0 && (
            <p>
              <strong>Las fotos son de ejemplo.</strong> En la tuya van {deQuienFotos(evento)}: este diseño lleva{" "}
              {fotos === 1 ? "una" : fotos}. Nos las mandás por WhatsApp cuando la reserves.
            </p>
          )}
          <p>
            <strong>Todo se personaliza.</strong> Textos, colores, música, lugar, horarios y qué secciones lleva.
          </p>
        </div>
        <div className="ar-cambios">
          <button type="button" onClick={cambiarModelo}>Probar otro diseño</button>
          <button type="button" onClick={cambiarDatos}>Cambiar los datos</button>
        </div>
      </div>
    </div>
  );
}
