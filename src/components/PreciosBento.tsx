"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { enlaceDemo, nombreDe, type Diseno, type Plan } from "@/lib/invitaciones";

/**
 * Lo que incluye, en una fila de tres tarjetas que entra en una pantalla:
 * lo que ven los invitados, lo que ve quien organiza y el cierre con el botón.
 * Nada se repite entre tarjetas: cada dato aparece una sola vez.
 */

/** Lo que pesa en la decisión, al lado del botón. */
const CLAVES = ["Un solo pago, sin mensualidad", "Lista en 3 días hábiles"];

const VOS = ["Quién confirmó, en vivo", "Comidas por invitado", "Plano y mesas"];

const FILAS = [
  { quien: "Familia Gómez", dato: "4 personas", mesa: "Mesa 3", estado: "si" },
  { quien: "Juan Pérez", dato: "sin respuesta", mesa: "—", estado: "no" },
];

type Props = {
  plan: Plan;
  /** Lo que trae la invitación para este tipo de evento, en etiquetas cortas. */
  incluye: string[];
  modelos: Diseno[];
};

export default function PreciosBento({ plan, incluye, modelos }: Props) {
  return (
    <div className="tid-bento">
      {/* ── Lo que ven los invitados ── */}
      <article className="tid-bento__ven">
        <h3 className="tid-bento__titulo">Lo que ven tus invitados</h3>
        <p className="tid-bento__bajada">Un link que se abre en el celular. Sin descargar nada.</p>

        {modelos.length > 0 && (
          <ul className="tid-bento__fotos">
            {modelos.slice(0, 3).map((m) => (
              <li key={`${m.tipo}-${m.id}`}>
                <Link href={enlaceDemo(m)} className="tid-bento__foto" aria-label={`Abrir la demo ${nombreDe(m)}`}>
                  <Image src={m.imagen} alt="" fill sizes="(max-width: 40rem) 28vw, 9vw" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <ul className="tid-bento__chips">
          {incluye.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </article>

      {/* ── Lo que ves vos ── */}
      <article className="tid-bento__vos">
        <h3 className="tid-bento__titulo">Lo que ves vos</h3>
        <p className="tid-bento__bajada">Todo llega solo a tu panel. Sin perseguir a nadie por WhatsApp.</p>

        <div className="tid-mock" aria-hidden="true">
          <div className="tid-mock__cifras">
            <p>
              <b>112</b>
              <span>confirmaron</span>
            </p>
            <p>
              <b>26</b>
              <span>sin responder</span>
            </p>
            <p>
              <b>14</b>
              <span>mesas</span>
            </p>
          </div>
          <div className="tid-mock__barra">
            <span />
          </div>
          <ul className="tid-mock__filas">
            {FILAS.map((f) => (
              <li key={f.quien}>
                <span className={`tid-mock__punto tid-mock__punto--${f.estado}`} />
                <b>{f.quien}</b>
                <span>{f.dato}</span>
                <em>{f.mesa}</em>
              </li>
            ))}
          </ul>
          <span className="tid-mock__ej">Ejemplo</span>
        </div>

        <ul className="tid-bento__chips tid-bento__chips--vos">
          {VOS.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </article>

      {/* ── El cierre: el plan y el botón ── */}
      <article className="tid-bento__plan">
        <h3 className="tid-bento__nombre">{plan.nombre}</h3>
        {/* El precio no se publica: se pasa por WhatsApp con el diseño y la fecha a la vista. */}
        <p className="tid-bento__consulta">Tu invitación, lista para mandar.</p>

        <ul className="tid-bento__claves">
          {CLAVES.map((d) => (
            <li key={d}>
              <Check size={16} aria-hidden="true" />
              {d}
            </li>
          ))}
        </ul>

        <a href="#armar" className="tid-bento__cta">
          Ver la mía con mis datos
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <p className="tid-bento__micro">La ves terminada antes de escribirnos. El valor te lo pasamos por WhatsApp.</p>
      </article>
    </div>
  );
}
