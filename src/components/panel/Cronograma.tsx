"use client";

import { useMemo, useState } from "react";
import { formatearMonto, hoyISO, horaSiguiente, idNuevo, ordenarMomentos, venceTarea } from "@/panel/logica";
import { momentosDe, PLANTILLAS } from "@/panel/plantillas";
import { nombreRubro, type DocPanel, type Momento, type Plantilla } from "@/panel/tipos";
import type { Cambiar } from "./Panel";

type Vista = "preparacion" | "dia";

type Ir = (v: "checklist" | "presupuesto") => void;

type Item = {
  clave: string;
  fecha: string;
  tipo: "tarea" | "pago" | "evento";
  titulo: string;
  quien: string;
  hecho: boolean;
  /** Para marcarla desde acá. */
  id?: string;
  monto?: string;
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const nombreMes = (iso: string) => `${MESES[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
const dia = (iso: string) => String(Number(iso.slice(8, 10)));
const corto = (iso: string) => MESES[Number(iso.slice(5, 7)) - 1].slice(0, 3);

const aISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * El cronograma, en dos tiempos: lo que hay que ir resolviendo (tareas y
 * pagos, con su fecha, en una línea de tiempo) y el día del evento minuto a
 * minuto, listo para imprimir y pasarle a cada proveedor.
 */
export function Cronograma({ doc, cambiar, evento, nombres, fechaTexto, irA }: { doc: DocPanel; cambiar: Cambiar; evento: Date | null; nombres: string; fechaTexto: string; irA: Ir }) {
  const [vista, setVista] = useState<Vista>("preparacion");

  return (
    <div className="pnl-seccion pnl-cronograma">
      <div className="pnl-filtros pnl-cronograma__vistas" role="group" aria-label="Qué cronograma ver">
        <button aria-pressed={vista === "preparacion"} onClick={() => setVista("preparacion")}>Preparación</button>
        <button aria-pressed={vista === "dia"} onClick={() => setVista("dia")}>El día</button>
      </div>
      {vista === "preparacion" ? (
        <Preparacion doc={doc} cambiar={cambiar} evento={evento} irA={irA} />
      ) : (
        <Dia doc={doc} cambiar={cambiar} nombres={nombres} fechaTexto={fechaTexto} />
      )}
    </div>
  );
}

/* ── Preparación ─────────────────────────────────────────────── */

function Preparacion({ doc, cambiar, evento, irA }: { doc: DocPanel; cambiar: Cambiar; evento: Date | null; irA: Ir }) {
  const [conHecho, setConHecho] = useState(false);
  const hoy = hoyISO();
  const nombreResp = useMemo(() => new Map(doc.equipo.map((r) => [r.id, r.nombre])), [doc.equipo]);

  const items = useMemo(() => {
    const l: Item[] = [];
    for (const t of doc.tareas) {
      const v = venceTarea(t, evento);
      if (!v) continue;
      l.push({
        clave: `t${t.id}`,
        fecha: v,
        tipo: "tarea",
        titulo: t.titulo,
        quien: t.responsableId ? (nombreResp.get(t.responsableId) ?? "") : "",
        hecho: t.hecha,
        id: t.id,
      });
    }
    for (const p of doc.pagos) {
      if (!p.vence) continue;
      l.push({
        clave: `p${p.id}`,
        fecha: p.vence,
        tipo: "pago",
        titulo: `${p.concepto || "Pago"} · ${p.responsableId ? (nombreResp.get(p.responsableId) ?? nombreRubro(p.rubro)) : nombreRubro(p.rubro)}`,
        quien: "",
        hecho: p.pagado,
        id: p.id,
        monto: formatearMonto(p.monto, p.moneda),
      });
    }
    if (evento) l.push({ clave: "evento", fecha: aISO(evento), tipo: "evento", titulo: "El evento", quien: "", hecho: false });
    return l.filter((i) => conHecho || !i.hecho).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.tipo.localeCompare(b.tipo));
  }, [doc.tareas, doc.pagos, evento, conHecho, nombreResp]);

  const tildarTarea = (id: string) =>
    cambiar((d) => ({ ...d, tareas: d.tareas.map((t) => (t.id === id ? { ...t, hecha: !t.hecha, hechaEl: t.hecha ? "" : new Date().toISOString() } : t)) }));
  const tildarPago = (id: string) =>
    cambiar((d) => ({ ...d, pagos: d.pagos.map((p) => (p.id === id ? { ...p, pagado: !p.pagado, pagadoEl: p.pagado ? "" : hoy } : p)) }));

  if (doc.tareas.length === 0 && doc.pagos.length === 0) {
    return (
      <section className="pnl-resumen__bloque">
        <h2 className="pnl-h2">Todavía no hay nada para ordenar en el tiempo</h2>
        <p className="pnl-nota">
          Acá aparecen, en orden, las tareas del checklist y los pagos con su fecha. Armá el checklist o cargá lo que cotizaron y se va llenando solo.
        </p>
        <div className="pnl-ficha__botones pnl-ficha__botones--izq">
          <button className="pnl-btn pnl-btn--lleno" onClick={() => irA("checklist")}>Armar checklist</button>
          <button className="pnl-btn" onClick={() => irA("presupuesto")}>Ir al presupuesto</button>
        </div>
      </section>
    );
  }

  // La línea de "Hoy" va antes del primer ítem de hoy en adelante.
  const iHoy = items.findIndex((i) => i.fecha >= hoy);
  const meses: { mes: string; items: { i: Item; n: number }[] }[] = [];
  items.forEach((i, n) => {
    const mes = nombreMes(i.fecha);
    const g = meses[meses.length - 1];
    if (g && g.mes === mes) g.items.push({ i, n });
    else meses.push({ mes, items: [{ i, n }] });
  });

  const lineaHoy = (
    <li className="pnl-linea-hoy" aria-label="Hoy">
      <span>Hoy</span>
    </li>
  );

  return (
    <>
      <div className="pnl-checklist__barra">
        <p className="pnl-nota">
          {items.filter((i) => !i.hecho && i.fecha < hoy).length > 0
            ? `${items.filter((i) => !i.hecho && i.fecha < hoy).length} cosas atrasadas`
            : "Todo al día"}
        </p>
        <label className="pnl-check">
          <input type="checkbox" checked={conHecho} onChange={(e) => setConHecho(e.target.checked)} />
          Mostrar lo ya hecho
        </label>
      </div>

      {meses.map((g) => (
        <section key={g.mes} className="pnl-mes" aria-label={g.mes}>
          <h2 className="pnl-h2">{g.mes}</h2>
          <ul className="pnl-linea">
            {g.items.map(({ i, n }) => (
              <ItemFila key={i.clave} item={i} atrasado={!i.hecho && i.fecha < hoy} antes={n === iHoy ? lineaHoy : null} onTildar={() => (i.tipo === "tarea" ? tildarTarea(i.id!) : tildarPago(i.id!))} onIr={() => irA(i.tipo === "tarea" ? "checklist" : "presupuesto")} />
            ))}
          </ul>
        </section>
      ))}
      {iHoy === -1 && items.length > 0 && <ul className="pnl-linea">{lineaHoy}</ul>}
    </>
  );
}

function ItemFila({ item, atrasado, antes, onTildar, onIr }: { item: Item; atrasado: boolean; antes: React.ReactNode; onTildar: () => void; onIr: () => void }) {
  return (
    <>
      {antes}
      <li className={`pnl-linea__item pnl-linea__item--${item.tipo}${item.hecho ? " es-hecho" : ""}`}>
        <span className={`pnl-linea__fecha pnl-num${atrasado ? " es-tarde" : ""}`}>
          <b>{dia(item.fecha)}</b> {corto(item.fecha)}
        </span>
        {item.tipo === "evento" ? (
          <span className="pnl-linea__evento">{item.titulo}</span>
        ) : (
          <>
            <label className="pnl-linea__check">
              <input type="checkbox" checked={item.hecho} onChange={onTildar} aria-label={`${item.tipo === "tarea" ? "Hecha" : "Pagado"}: ${item.titulo}`} />
            </label>
            <button className="pnl-linea__texto" onClick={onIr}>
              <span className="pnl-linea__titulo">{item.titulo}</span>
              <span className="pnl-linea__meta">
                {item.tipo === "tarea" ? "Tarea" : "Pago"}
                {item.quien && ` · ${item.quien}`}
                {atrasado && <span className="pnl-error"> · atrasada</span>}
              </span>
            </button>
            {item.monto && <span className="pnl-num pnl-linea__monto">{item.monto}</span>}
          </>
        )}
      </li>
    </>
  );
}

/* ── El día ──────────────────────────────────────────────────── */

function Dia({ doc, cambiar, nombres, fechaTexto }: { doc: DocPanel; cambiar: Cambiar; nombres: string; fechaTexto: string }) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const nombreResp = useMemo(() => new Map(doc.equipo.map((r) => [r.id, r.nombre])), [doc.equipo]);

  const editar = (id: string, c: Partial<Momento>, clave?: string) =>
    cambiar((d) => ({ ...d, momentos: d.momentos.map((m) => (m.id === id ? { ...m, ...c } : m)) }), clave);

  const ordenar = () => cambiar((d) => {
    const o = ordenarMomentos(d.momentos);
    return o.every((m, i) => m === d.momentos[i]) ? d : { ...d, momentos: o };
  });

  const agregar = () => {
    const m: Momento = { id: idNuevo(), hora: horaSiguiente(doc.momentos), titulo: "", lugar: "", responsables: [], notas: "" };
    cambiar((d) => ({ ...d, momentos: [...d.momentos, m] }));
    setAbierto(m.id);
  };

  const cargar = (id: Plantilla) => cambiar((d) => ({ ...d, momentos: ordenarMomentos([...d.momentos, ...momentosDe(id)]) }));

  if (doc.momentos.length === 0) {
    return (
      <section className="pnl-resumen__bloque">
        <h2 className="pnl-h2">Armá el día minuto a minuto</h2>
        <p className="pnl-nota">
          Es la hoja que se le pasa al DJ, al fotógrafo, al catering y al salón: qué pasa a cada hora y quién tiene que estar atento. Empezá con un esquema y ajustalo.
        </p>
        <ul className="pnl-plantillas">
          {PLANTILLAS.map((x) => (
            <li key={x.id}>
              <button className="pnl-plantilla" onClick={() => cargar(x.id)}>
                <span className="pnl-plantilla__nombre">{x.nombre}</span>
                <span className="pnl-tenue">Con los momentos típicos</span>
              </button>
            </li>
          ))}
        </ul>
        <button className="pnl-enlace" onClick={agregar}>O empezá desde cero</button>
      </section>
    );
  }

  return (
    <>
      <div className="pnl-checklist__barra pnl-cronograma__barra">
        <p className="pnl-nota pnl-num">{doc.momentos.length} momentos · de {doc.momentos[0] && ordenarMomentos(doc.momentos)[0].hora} a {ordenarMomentos(doc.momentos)[doc.momentos.length - 1].hora}</p>
        <div className="pnl-ficha__botones">
          <button className="pnl-btn" onClick={() => window.print()}>Imprimir</button>
          <button className="pnl-btn pnl-btn--lleno" onClick={agregar}>Agregar momento</button>
        </div>
      </div>

      <ul className="pnl-dia pnl-dia--pantalla">
        {doc.momentos.map((m) => (
          <li key={m.id} className={`pnl-momento${abierto === m.id ? " es-abierta" : ""}`}>
            <div className="pnl-momento__fila">
              <input type="time" className="pnl-momento__hora pnl-num" value={m.hora} onChange={(e) => e.target.value && editar(m.id, { hora: e.target.value }, `mom:${m.id}:h`)} onBlur={ordenar} aria-label="Hora" />
              <input className="pnl-momento__titulo" value={m.titulo} maxLength={100} placeholder="Qué pasa en este momento" autoFocus={abierto === m.id && !m.titulo} onChange={(e) => editar(m.id, { titulo: e.target.value }, `mom:${m.id}:t`)} aria-label="Momento" />
              <button className="pnl-enlace" onClick={() => setAbierto(abierto === m.id ? null : m.id)} aria-expanded={abierto === m.id}>
                {abierto === m.id ? "Cerrar" : "Detalle"}
              </button>
            </div>
            {abierto !== m.id && (m.lugar || m.responsables.length > 0) && (
              <p className="pnl-momento__resumen pnl-tenue">
                {[m.lugar, m.responsables.map((r) => nombreResp.get(r)).filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
              </p>
            )}
            {abierto === m.id && (
              <div className="pnl-ficha pnl-ficha--momento">
                <label className="pnl-campo">
                  <span>Lugar</span>
                  <input value={m.lugar} maxLength={60} onChange={(e) => editar(m.id, { lugar: e.target.value }, `mom:${m.id}:l`)} placeholder="Ej: Jardín, Pista, Salón principal" />
                </label>
                <div className="pnl-campo">
                  <span>Quién tiene que estar atento</span>
                  <div className="pnl-etiquetas">
                    {m.responsables.map((r) => (
                      <span key={r} className="pnl-etiqueta">
                        {nombreResp.get(r)}
                        <button onClick={() => editar(m.id, { responsables: m.responsables.filter((x) => x !== r) })} aria-label={`Quitar a ${nombreResp.get(r)}`}>×</button>
                      </span>
                    ))}
                    <select
                      className="pnl-select"
                      value=""
                      onChange={(e) => e.target.value && editar(m.id, { responsables: [...m.responsables, e.target.value] })}
                      aria-label="Sumar a alguien del equipo"
                    >
                      <option value="">{doc.equipo.length ? "+ sumar del equipo" : "Cargá gente en Equipo"}</option>
                      {doc.equipo.filter((r) => !m.responsables.includes(r.id) && r.estado !== "descartado").map((r) => <option key={r.id} value={r.id}>{r.nombre} · {nombreRubro(r.rubro)}</option>)}
                    </select>
                  </div>
                </div>
                <label className="pnl-campo">
                  <span>Notas para el equipo</span>
                  <textarea className="pnl-textarea" rows={2} value={m.notas} maxLength={300} onChange={(e) => editar(m.id, { notas: e.target.value }, `mom:${m.id}:n`)} placeholder="Ej: canción de entrada, luces bajas, fuegos en la pista" />
                </label>
                <div className="pnl-ficha__botones">
                  <button className="pnl-enlace pnl-enlace--peligro" onClick={() => { cambiar((d) => ({ ...d, momentos: d.momentos.filter((x) => x.id !== m.id) })); setAbierto(null); }}>Borrar momento</button>
                  <button className="pnl-btn" onClick={() => setAbierto(null)}>Listo</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Lo que sale en papel: sólo se ve al imprimir. */}
      <div className="pnl-impresion">
        <h2>Cronograma del día · {nombres}</h2>
        <p>{fechaTexto}</p>
        <table>
          <thead>
            <tr><th>Hora</th><th>Momento</th><th>Lugar</th><th>Quién</th><th>Notas</th></tr>
          </thead>
          <tbody>
            {ordenarMomentos(doc.momentos).map((m) => (
              <tr key={m.id}>
                <td>{m.hora}</td>
                <td>{m.titulo}</td>
                <td>{m.lugar}</td>
                <td>{m.responsables.map((r) => nombreResp.get(r)).filter(Boolean).join(", ")}</td>
                <td>{m.notas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
