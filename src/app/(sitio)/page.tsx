"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Briefcase, Cake, Check, Heart, MessageCircle } from "lucide-react";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  CATEGORIAS,
  DISENOS,
  INCLUYE,
  PLANES,
  PREGUNTAS,
  RESENAS,
  WHATSAPP,
  detectarMoneda,
  enlaceDemo,
  formatearPrecio,
  whatsappPara,
  type Categoria,
  type Moneda,
  type TipoEvento,
} from "@/lib/invitaciones";

const ICONO: Record<TipoEvento, typeof Heart> = {
  bodas: Heart,
  cumples: Cake,
  profesional: Briefcase,
};

/* ─────────────────────────────────────────────────────────────
   Moneda
   ───────────────────────────────────────────────────────────── */

/**
 * Arranca en pesos, que es lo que ve la mayoría, y el navegador corrige a
 * dólares después del montaje si la zona horaria no es argentina. Así la
 * página sigue siendo estática y nadie tiene que elegir su país.
 */
function useMoneda() {
  const [moneda, setMoneda] = useState<Moneda>("ARS");

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setMoneda(detectarMoneda()));
    return () => cancelAnimationFrame(cuadro);
  }, []);

  return [moneda, setMoneda] as const;
}

/* ─────────────────────────────────────────────────────────────
   Elección de evento
   ───────────────────────────────────────────────────────────── */

function TarjetaEvento({
  categoria,
  elegida,
  onElegir,
}: {
  categoria: Categoria;
  elegida: boolean;
  onElegir: () => void;
}) {
  const Icono = ICONO[categoria.id];

  return (
    <button
      type="button"
      onClick={onElegir}
      className="tid-tarjeta"
      aria-pressed={elegida}
    >
      {/* La tarjeta es el bloque verde de una página blanca: el spotlight
          necesita fondo oscuro para leerse, y ahí es donde entra el negro. */}
      <GlowCard
        glowColor={categoria.glow}
        customSize
        backdrop="#16301f"
        className="h-full w-full"
      >
        <div className="tid-tarjeta__cara">
          <span className="tid-tarjeta__icono">
            <Icono size={20} strokeWidth={1.6} aria-hidden="true" />
          </span>

          <span>
            <span className="tid-tarjeta__titulo">{categoria.titulo}</span>
            <span className="tid-tarjeta__gancho">{categoria.gancho}</span>
          </span>

          <span className="tid-tarjeta__pie">
            {elegida ? "Elegido" : "Ver modelos"}
            <ArrowRight size={14} className="tid-tarjeta__flecha" aria-hidden="true" />
          </span>
        </div>
      </GlowCard>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Preguntas
   ───────────────────────────────────────────────────────────── */

function Preguntas() {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <ul>
      {PREGUNTAS.map((f, i) => {
        const activa = abierta === i;
        return (
          <li key={f.p} className="tid-faq__item">
            <button
              type="button"
              className="tid-faq__boton"
              onClick={() => setAbierta(activa ? null : i)}
              aria-expanded={activa}
            >
              <span className="tid-faq__pregunta">{f.p}</span>
              <span
                className={`tid-faq__signo${activa ? " tid-faq__signo--abierto" : ""}`}
                aria-hidden="true"
              />
            </button>
            {activa && <p className="tid-faq__respuesta">{f.r}</p>}
          </li>
        );
      })}
    </ul>
  );
}

/* ─────────────────────────────────────────────────────────────
   Página
   ───────────────────────────────────────────────────────────── */

export default function Invitaciones() {
  const [elegido, setElegido] = useState<TipoEvento | null>(null);
  const [moneda, setMoneda] = useMoneda();
  const resultadoRef = useRef<HTMLDivElement>(null);

  const categoria = CATEGORIAS.find((c) => c.id === elegido);
  const modelos = DISENOS.filter((d) => d.tipo === elegido);

  // Llevar la vista al resultado: sin esto el cambio ocurre fuera de pantalla.
  useEffect(() => {
    if (!elegido) return;
    const nodo = resultadoRef.current;
    if (!nodo) return;
    const cuadro = requestAnimationFrame(() =>
      nodo.scrollIntoView({ behavior: "smooth", block: "start" })
    );
    return () => cancelAnimationFrame(cuadro);
  }, [elegido]);

  return (
    <>
      {/* ── Encabezado y elección ── */}
      <section className="tid-seccion tid-hero">
        <div className="tid-marco tid-hero__interior">
          <h1 className="tid-titulo tid-h1 tid-hero__titulo">
            La invitación que nadie olvida.{" "}
            <span className="tid-fuerte">La lista que se arma sola.</span>
          </h1>
          <p className="tid-plomo tid-hero__bajada">
            Elegís el diseño, la mandás por WhatsApp y cada confirmación entra sola a tu lista.
            Sin perseguir a nadie.
          </p>

          <div className="tid-eleccion">
            <div className="tid-eleccion__grilla">
              {CATEGORIAS.map((c) => (
                <TarjetaEvento
                  key={c.id}
                  categoria={c}
                  elegida={elegido === c.id}
                  onElegir={() => setElegido(c.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Todo lo que sigue depende de lo que eligieron ── */}
      <div ref={resultadoRef}>
        {categoria && (
          <div className="tid-resultado" key={categoria.id}>
            {/* Modelos */}
            <section className="tid-seccion">
              <div className="tid-marco">
                <div className="tid-encabezado">
                  <h2 className="tid-titulo tid-h2">
                    Modelos para {categoria.titulo.toLowerCase()}.
                  </h2>
                  <p className="tid-plomo">
                    Son demos de verdad. Abrí cualquiera y recorrela desde el celular.
                  </p>
                </div>

                {modelos.length > 0 && (
                  <ul className="tid-modelos">
                    {modelos.map((d) => (
                      <li key={`${d.tipo}-${d.id}`}>
                        <Link href={enlaceDemo(d)} className="tid-modelo">
                          <span className="tid-modelo__marco">
                            <Image
                              src={d.imagen}
                              alt={`Modelo ${d.nombre}`}
                              fill
                              sizes="(max-width: 48rem) 45vw, 22vw"
                              className="tid-modelo__img"
                            />
                            <span className="tid-modelo__abrir">Abrir demo</span>
                          </span>
                          <span className="tid-modelo__nombre">{d.nombre}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Con o sin modelos publicados, el diseño a medida se consulta:
                    para cumpleaños y eventos profesionales es la única vía. */}
                <div className="tid-vacio">
                  <p className="tid-plomo">
                    {modelos.length > 0
                      ? "¿Querés otro estilo? Consultanos y lo diseñamos para vos."
                      : `Armamos cada diseño para ${categoria.titulo.toLowerCase()} a medida. Contanos qué imaginás y te lo mostramos por WhatsApp.`}
                  </p>
                  <a
                    href={whatsappPara(
                      `Hola! Quiero consultar un diseño de invitación digital para ${categoria.titulo.toLowerCase()}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tid-boton tid-boton--lleno"
                  >
                    Consultar diseño
                  </a>
                </div>
              </div>
            </section>

            {/* Qué incluye */}
            <section className="tid-seccion tid-seccion--tenue">
              <div className="tid-marco">
                <div className="tid-encabezado">
                  <h2 className="tid-titulo tid-h2">Todo esto, en un link.</h2>
                </div>
                <ul className="tid-incluye">
                  {INCLUYE[categoria.id].map((x) => (
                    <li key={x}>
                      <Check size={16} className="tid-incluye__tilde" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Precios */}
            <section className="tid-seccion">
              <div className="tid-marco">
                <div className="tid-encabezado tid-encabezado--centro">
                  <h2 className="tid-titulo tid-h2">Un pago y listo.</h2>
                  <p className="tid-moneda">
                    Precios en {moneda}
                    <button
                      type="button"
                      className="tid-moneda__boton"
                      onClick={() => setMoneda(moneda === "ARS" ? "USD" : "ARS")}
                    >
                      Ver en {moneda === "ARS" ? "USD" : "ARS"}
                    </button>
                  </p>
                </div>

                <ul className="tid-planes">
                  {PLANES.map((p) => (
                    <li
                      key={p.nombre}
                      className={`tid-plan${p.destacado ? " tid-plan--destacado" : ""}`}
                    >
                      {p.destacado && <span className="tid-plan__cinta">La más elegida</span>}
                      <h3 className="tid-plan__nombre">{p.nombre}</h3>
                      <p className="tid-plan__precio">
                        <span className="tid-plan__monto">
                          {formatearPrecio(p.precio[moneda], moneda)}
                        </span>
                        <span className="tid-plan__moneda">{moneda}</span>
                      </p>
                      <p className="tid-plan__unico">Pago único, sin mensualidad</p>

                      <ul className="tid-plan__items">
                        {p.items.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>

                      <a
                        href={whatsappPara(
                          `Hola! Quiero la invitación digital para ${categoria.titulo.toLowerCase()}, plan ${p.nombre}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`tid-boton ${
                          p.destacado ? "tid-boton--lleno" : "tid-boton--linea"
                        } tid-plan__cta`}
                      >
                        Quiero esta
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Reseñas: sólo si hay reseñas reales cargadas */}
            {RESENAS.length > 0 && (
              <section className="tid-seccion">
                <div className="tid-marco">
                  <div className="tid-encabezado tid-encabezado--centro">
                    <h2 className="tid-titulo tid-h2">Lo que dicen.</h2>
                  </div>
                  <ul className="tid-resenas">
                    {RESENAS.map((r) => (
                      <li key={r.nombre} className="tid-resena">
                        <p className="tid-resena__texto">{r.texto}</p>
                        <p className="tid-resena__quien">{r.nombre}</p>
                        <p className="tid-resena__evento">{r.evento}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Preguntas: valen para cualquier evento, así que están siempre */}
        <section className="tid-seccion tid-seccion--tenue">
          <div className="tid-marco tid-marco--angosto">
            <div className="tid-encabezado tid-encabezado--centro">
              <h2 className="tid-titulo tid-h2">Lo que todos preguntan.</h2>
            </div>
            <Preguntas />
          </div>
        </section>
      </div>

      {/* ── Contacto ── */}
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="tid-globo"
        aria-label="Escribinos por WhatsApp"
      >
        <MessageCircle size={20} strokeWidth={2} aria-hidden="true" />
        <span className="tid-globo__texto">Escribinos</span>
      </a>
    </>
  );
}
