"use client";

import { avisos, metricas, ocupacion } from "@/panel/logica";
import type { DocPanel } from "@/panel/tipos";
import { Avisos, Cifra } from "./piezas";
import { Plano } from "./Plano";

type Ir = (v: "invitados" | "mesas" | "salon") => void;

export function Resumen({ doc, irA }: { doc: DocPanel; irA: Ir }) {
  const m = metricas(doc);
  const lista = avisos(doc, "completo");
  const total = m.confirmados + m.pendientes + m.noVienen;
  const pct = (n: number) => (total ? (n / total) * 100 : 0);

  const ultimas = doc.invitados
    .filter((i) => i.rsvp)
    .sort((a, b) => (b.rsvp ?? "").localeCompare(a.rsvp ?? ""))
    .slice(0, 6);
  const canciones = doc.invitados.filter((i) => i.cancion).slice(0, 12);

  return (
    <div className="pnl-seccion pnl-resumen">
      <section className="pnl-resumen__bloque pnl-resumen__ancho">
        <div className="pnl-cifras">
          <Cifra valor={m.confirmados} etiqueta="Personas confirmadas" fuerte />
          <Cifra valor={m.pendientes} etiqueta="Sin respuesta" />
          <Cifra valor={m.noVienen} etiqueta="No vienen" />
          <Cifra valor={m.lugares} de={m.esperados} etiqueta="Sillas / esperados" />
        </div>
        {total > 0 && (
          <div className="pnl-barra" role="img" aria-label={`${Math.round(pct(m.confirmados))}% confirmado`}>
            <span className="pnl-barra__si" style={{ width: `${pct(m.confirmados)}%` }} />
            <span className="pnl-barra__no" style={{ width: `${pct(m.noVienen)}%` }} />
          </div>
        )}
      </section>

      <section className="pnl-resumen__bloque">
        <h2 className="pnl-h2">Qué falta</h2>
        {lista.length ? <Avisos lista={lista} /> : <p className="pnl-nota">Nada pendiente. Todo cierra.</p>}
      </section>

      <section className="pnl-resumen__bloque">
        <div className="pnl-h2-fila">
          <h2 className="pnl-h2">Salón</h2>
          <button className="pnl-enlace" onClick={() => irA("salon")}>Editar plano</button>
        </div>
        {doc.salon.elementos.length ? (
          <button className="pnl-resumen__plano" onClick={() => irA("salon")} aria-label="Abrir el plano">
            <Plano salon={doc.salon} ocupacion={ocupacion(doc.invitados)} soloLectura />
          </button>
        ) : (
          <p className="pnl-nota">Todavía no armaste el plano. Con las medidas del lugar te digo si entran todos.</p>
        )}
        <p className="pnl-nota pnl-num">
          {Math.round(m.areaTotal)} m² · {m.mesas} mesas · {m.lugares} sillas
        </p>
      </section>

      <section className="pnl-resumen__bloque">
        <div className="pnl-h2-fila">
          <h2 className="pnl-h2">Últimas confirmaciones</h2>
          <button className="pnl-enlace" onClick={() => irA("invitados")}>Ver lista</button>
        </div>
        {ultimas.length ? (
          <ul className="pnl-lista-simple">
            {ultimas.map((i) => (
              <li key={i.id}>
                <span>
                  <span className={`pnl-punto pnl-punto--${i.estado}`} aria-hidden /> {i.nombre}
                </span>
                <span className="pnl-tenue pnl-num">
                  {i.estado === "no-viene" ? "no viene" : `${i.personas} pers.`} ·{" "}
                  {new Date(i.rsvp!).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pnl-nota">Cuando alguien confirme desde la invitación, aparece acá.</p>
        )}
      </section>

      <section className="pnl-resumen__bloque">
        <h2 className="pnl-h2">Para el catering</h2>
        {m.comidas.length ? (
          <ul className="pnl-lista-simple">
            {m.comidas.map(([c, n]) => (
              <li key={c}>
                <span>{c}</span>
                <span className="pnl-num">{n}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pnl-nota">Nadie pidió menú especial todavía.</p>
        )}
      </section>

      {canciones.length > 0 && (
        <section className="pnl-resumen__bloque">
          <h2 className="pnl-h2">Para el DJ</h2>
          <ul className="pnl-lista-simple">
            {canciones.map((i) => (
              <li key={i.id}>
                <i>{i.cancion}</i>
                <span className="pnl-tenue">{i.nombre.split(" ")[0]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
