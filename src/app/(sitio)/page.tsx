"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Briefcase, Cake, Heart, MessageCircle } from "lucide-react";
import ResenasGoogle from "@/components/ResenasGoogle";
import PreciosBento from "@/components/PreciosBento";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  CATEGORIAS,
  DISENOS,
  INCLUYE,
  INCLUYE_GENERAL,
  PLANES,
  PREGUNTAS,
  WHATSAPP,
  enlaceDemo,
  whatsappPara,
  type Categoria,
  type TipoEvento,
} from "@/lib/invitaciones";

const ICONO: Record<TipoEvento, typeof Heart> = {
  bodas: Heart,
  cumples: Cake,
  profesional: Briefcase,
};

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
            <div className="tid-hero__acciones">
              <a
                href={whatsappPara("Hola! Quiero mi invitación digital. ¿Me ayudan a elegir?")}
                target="_blank"
                rel="noopener noreferrer"
                className="tid-boton tid-boton--lleno"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Quiero mi invitación
              </a>
              <p className="tid-hero__nota">¿No sabés cuál elegir? Te ayudamos por WhatsApp.</p>
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
                        <Link href={`${enlaceDemo(d)}${enlaceDemo(d).includes("?") ? "&" : "?"}v=1`} target="_blank" rel="opener" className="tid-modelo">
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
                        <a
                          href={whatsappPara(
                            `Hola! Quiero la invitación "${d.nombre}" para ${categoria.titulo.toLowerCase()}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tid-boton tid-boton--lleno tid-modelo__pedir"
                        >
                          Quiero este
                        </a>
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
                    Quiero un diseño a medida
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Precios: siempre a la vista, sin tener que elegir un evento */}
            <section className="tid-seccion">
              <div className="tid-marco">
                <div className="tid-encabezado tid-encabezado--centro">
                  <h2 className="tid-titulo tid-h2">Un pago, todo incluido.</h2>
                  <p className="tid-plomo">
                    La invitación que reciben tus invitados y el panel con el que organizás todo.
                  </p>
                </div>

                <PreciosBento
                  plan={PLANES[0]}
                  evento={categoria ? categoria.titulo.toLowerCase() : "mi evento"}
                  incluye={categoria ? INCLUYE[categoria.id] : INCLUYE_GENERAL}
                  modelos={modelos.length > 0 ? modelos : DISENOS.slice(0, 3)}
                />
              </div>
            </section>

        {/* Reseñas de Google: sólo si hay reseñas reales cargadas */}
        <ResenasGoogle />

        {/* Preguntas: valen para cualquier evento, así que están siempre */}
        <section className="tid-seccion tid-seccion--tenue">
          <div className="tid-marco tid-marco--angosto">
            <div className="tid-encabezado tid-encabezado--centro">
              <h2 className="tid-titulo tid-h2">Lo que todos preguntan.</h2>
            </div>
            <Preguntas />
          </div>
        </section>

        {/* Cierre: quien llegó hasta acá ya tiene el botón a mano */}
        <section className="tid-seccion tid-cierre">
          <div className="tid-marco tid-marco--angosto">
            <h2 className="tid-titulo tid-h2">Tu lista se arma sola. Empezá hoy.</h2>
            <p className="tid-plomo">Escribinos y en minutos te mostramos cómo quedaría tu invitación.</p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="tid-boton tid-boton--lleno tid-boton--grande"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Quiero mi invitación
            </a>
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
        <span className="tid-globo__barra">Quiero mi invitación</span>
      </a>
    </>
  );
}
