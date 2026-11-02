"use client";

import { useState } from "react";
import { parsearFecha } from "@/invitaciones/fecha";

/**
 * Las dos fechas que manejan todo: el día del evento y el límite para
 * confirmar. Van grandes al lado de los nombres porque son lo primero que el
 * organizador necesita tener presente cada vez que entra.
 *
 * El límite se puede cambiar desde acá. Si nunca se tocó, sale del texto que
 * dice la invitación ("antes del 15 de octubre").
 */

const DIA = 86_400_000;

const aISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** "AAAA-MM-DD" → fecha local al final de ese día. */
const deISO = (s: string) => {
  const [a, m, d] = s.split("-").map(Number);
  return new Date(a, m - 1, d, 23, 59);
};

function falta(f: Date) {
  const dias = Math.ceil((f.getTime() - Date.now()) / DIA);
  if (dias > 1) return { texto: `faltan ${dias} días`, vencido: false };
  if (dias === 1) return { texto: "es mañana", vencido: false };
  if (dias === 0) return { texto: "es hoy", vencido: false };
  return { texto: `pasó hace ${-dias} ${dias === -1 ? "día" : "días"}`, vencido: true };
}

function Bloque({ rotulo, fecha, extra, vencido, onCambiar }: { rotulo: string; fecha: Date; extra: string; vencido?: boolean; onCambiar?: () => void }) {
  const mes = fecha.toLocaleDateString("es-AR", { month: "short" }).replace(".", "");
  return (
    <div className={`pnl-fecha${vencido ? " es-vencida" : ""}`}>
      <span className="pnl-fecha__rotulo">{rotulo}</span>
      <span className="pnl-fecha__cuerpo">
        <span className="pnl-fecha__dia">{fecha.getDate()}</span>
        <span className="pnl-fecha__mes">
          {mes}
          <span className="pnl-fecha__anio">{fecha.getFullYear()}</span>
        </span>
      </span>
      <span className="pnl-fecha__resta">
        {fecha.toLocaleDateString("es-AR", { weekday: "long" })} · {extra}
        {onCambiar && (
          <>
            {" · "}
            <button className="pnl-enlace pnl-fecha__cambiar" onClick={onCambiar}>cambiar</button>
          </>
        )}
      </span>
    </div>
  );
}

export function Fechas({
  fecha,
  cierre,
  limite,
  pendientes,
  onLimite,
}: {
  fecha: string;
  cierre?: string;
  limite: string;
  pendientes: number;
  onLimite: (iso: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const evento = parsearFecha(fecha);

  // El texto de la invitación no dice el año: si queda después del evento,
  // es del año anterior ("antes del 15 de octubre" para un casamiento en noviembre).
  let tope = limite ? deISO(limite) : cierre ? parsearFecha(cierre, 23) : null;
  if (tope && evento && !limite && tope > evento) tope = new Date(tope.getFullYear() - 1, tope.getMonth(), tope.getDate(), 23);

  const f = tope ? falta(tope) : null;

  return (
    <div className="pnl-fechas">
      {evento && <Bloque rotulo="El evento" fecha={evento} extra={falta(evento).texto} />}

      {tope && !editando ? (
        <Bloque
          rotulo="Confirman hasta"
          fecha={tope}
          vencido={f?.vencido}
          extra={f!.vencido && pendientes ? `${f!.texto} · ${pendientes} sin responder` : f!.texto}
          onCambiar={() => setEditando(true)}
        />
      ) : (
        <div className="pnl-fecha pnl-fecha--vacia">
          <span className="pnl-fecha__rotulo">Confirman hasta</span>
          <input
            type="date"
            className="pnl-fecha__input"
            value={limite || (tope ? aISO(tope) : "")}
            max={evento ? aISO(evento) : undefined}
            onChange={(e) => e.target.value && onLimite(e.target.value)}
            aria-label="Fecha límite para confirmar"
            autoFocus={editando}
          />
          <span className="pnl-fecha__resta">
            {editando ? (
              <button className="pnl-enlace" onClick={() => setEditando(false)}>Listo</button>
            ) : (
              "Poné hasta cuándo pueden confirmar"
            )}
          </span>
        </div>
      )}
    </div>
  );
}
