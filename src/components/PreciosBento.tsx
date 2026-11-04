"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { enlaceDemo, whatsappPara, type Diseno, type Plan } from "@/lib/invitaciones";

/**
 * El plan, armado como una vitrina: a la izquierda el plan con lo
 * que más pesa en la decisión, y a la derecha dos tarjetas que muestran
 * las dos mitades del producto — lo que ven los invitados y lo que ve quien
 * organiza.
 *
 * Por qué así: el precio solo no vende, vende lo que se imagina el que
 * compra. Arriba se ve la invitación que van a recibir sus invitados, abajo
 * el panel que le ahorra perseguir gente por WhatsApp. El ancla (precio
 * anterior tachado + cuánto ahorra) y el CTA en primera persona van pegados
 * al precio, que es donde se decide.
 */

const DESTACADOS = [
  "Diseño personalizado con tus fotos y tu estilo",
  "Confirmación de asistencia automática",
  "Panel con la lista de invitados en vivo",
  "Plano del salón y mesas ubicadas solas",
  "Entrega en 3 días hábiles",
];

const PASOS = [
  "Nos escribís por WhatsApp",
  "Armamos tu diseño con tus fotos y datos",
  "En 3 días hábiles te pasamos el link para compartir",
];

const VEN = [
  "Animación de apertura",
  "Cuenta regresiva",
  "Mapa del lugar",
  "Dress code",
  "Datos del regalo",
  "Música de fondo",
  "Trivia",
  "Confirmar en 1 minuto",
];

const VOS = [
  "Quién confirmó, en vivo",
  "Lista de invitados",
  "Un link por familia",
  "Plano y mesas, con voz o texto",
];

const FILAS = [
  { quien: "Familia Gómez", dato: "4 personas", mesa: "Mesa 3", estado: "si" },
  { quien: "Tía Marta", dato: "2 personas", mesa: "Mesa 3", estado: "si" },
  { quien: "Juan Pérez", dato: "sin respuesta", mesa: "—", estado: "no" },
];

type Props = {
  plan: Plan;
  evento: string;
  modelos: Diseno[];
};

export default function PreciosBento({ plan, evento, modelos }: Props) {
  const mensaje = whatsappPara(`Hola! Quiero mi invitación digital para ${evento}. ¿Me pasan el valor?`);

  return (
    <div className="tid-bento">
      {/* ── El plan: el cuadrado grande ── */}
      <article className="tid-bento__plan">
        <h3 className="tid-bento__nombre">{plan.nombre}</h3>

        {/* El precio no se publica: se consulta, así se responde con el
            diseño y las fechas del evento a la vista. */}
        <p className="tid-bento__consulta">Tu invitación, lista para mandar.</p>
        <p className="tid-bento__consulta-sub">El valor te lo pasamos por WhatsApp, en minutos.</p>

        <p className="tid-bento__unico">Un solo pago. Sin mensualidad. Un año publicada.</p>

        <ul className="tid-bento__lista">
          {DESTACADOS.map((d) => (
            <li key={d}>
              <Check size={16} aria-hidden="true" />
              {d}
            </li>
          ))}
        </ul>

        <p className="tid-bento__sub">Así de simple</p>
        <ol className="tid-bento__pasos">
          {PASOS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>

        <a href={mensaje} target="_blank" rel="noopener noreferrer" className="tid-bento__cta">
          Quiero mi invitación
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <p className="tid-bento__micro">Te respondemos por WhatsApp y te mostramos cómo quedaría. Sin compromiso.</p>
      </article>

      {/* ── Lo que ven los invitados ── */}
      <article className="tid-bento__ven">
        <h3 className="tid-bento__titulo">Lo que ven tus invitados</h3>
        <p className="tid-bento__bajada">Un link que se abre en el celular, con tu diseño. Sin descargar nada.</p>

        {modelos.length > 0 && (
          <ul className="tid-bento__fotos">
            {modelos.slice(0, 3).map((m) => (
              <li key={`${m.tipo}-${m.id}`}>
                <Link href={enlaceDemo(m)} className="tid-bento__foto" aria-label={`Abrir la demo ${m.nombre}`}>
                  <Image src={m.imagen} alt="" fill sizes="(max-width: 48rem) 28vw, 10vw" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <ul className="tid-bento__chips">
          {VEN.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </article>

      {/* ── Lo que ves vos ── */}
      <article className="tid-bento__vos">
        <h3 className="tid-bento__titulo">Lo que ves vos</h3>
        <p className="tid-bento__bajada">Dejás de perseguir gente por WhatsApp: todo llega solo a tu panel.</p>

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
    </div>
  );
}
