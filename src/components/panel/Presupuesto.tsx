"use client";

import { useMemo, useState } from "react";
import { formatearMonto, hoyISO, idNuevo, pagoVencido, proximosPagos, totalesPresupuesto } from "@/panel/logica";
import { MONEDAS, nombreRubro, RUBROS, type Cotizacion, type DocPanel, type Moneda, type Pago, type Rubro } from "@/panel/tipos";
import type { Cambiar } from "./Panel";

const NOMBRE_MONEDA: Record<Moneda, string> = { ARS: "Pesos", USD: "Dólares" };

/** "2026-09-15" → "15 sep". */
function corta(iso: string) {
  if (!iso) return "sin fecha";
  const [a, m, d] = iso.split("-").map(Number);
  const t = new Date(a, m - 1, d).toLocaleDateString("es-AR", { day: "numeric", month: "short", ...(a !== new Date().getFullYear() ? { year: "2-digit" } : {}) });
  return t.replace(/\./g, "");
}

const numero = (v: string) => Math.max(0, Number(v.replace(/\D/g, "")) || 0);

/** 6500000 → "6.500.000", para leer los montos de un vistazo. Sin monto, vacío. */
const miles = (n: number) => (n ? n.toLocaleString("es-AR") : "");

/**
 * Cuánto cuesta todo. Cada rubro junta las cotizaciones que pidieron, se elige
 * una, y de ahí salen los pagos con su vencimiento. Pesos y dólares se llevan
 * por separado; el dólar de referencia es opcional.
 */
export function Presupuesto({ doc, cambiar }: { doc: DocPanel; cambiar: Cambiar }) {
  const [abierto, setAbierto] = useState<Rubro | null>(null);
  const [extra, setExtra] = useState<Rubro[]>([]);

  const t = totalesPresupuesto(doc);
  const monedas = MONEDAS.filter((m) => t[m].hay);
  const mostrar = monedas.length ? monedas : (["ARS"] as Moneda[]);
  const nombreResp = useMemo(() => new Map(doc.equipo.map((r) => [r.id, r.nombre])), [doc.equipo]);
  const vencimientos = proximosPagos(doc.pagos);

  const rubros = useMemo(() => {
    const s = new Set<Rubro>(extra);
    doc.cotizaciones.forEach((c) => s.add(c.rubro));
    doc.pagos.forEach((p) => s.add(p.rubro));
    doc.equipo.filter((r) => r.estado !== "descartado").forEach((r) => s.add(r.rubro));
    doc.tareas.forEach((x) => x.rubro && x.rubro !== "otro" && s.add(x.rubro));
    return RUBROS.map((r) => r.id).filter((r) => s.has(r));
  }, [doc.cotizaciones, doc.pagos, doc.equipo, doc.tareas, extra]);

  const tope = (m: Moneda, v: number) =>
    cambiar((d) => ({ ...d, presupuesto: { ...d.presupuesto, tope: { ...d.presupuesto.tope, [m]: v } } }), `tope:${m}`);

  const marcarPagado = (id: string) =>
    cambiar((d) => ({ ...d, pagos: d.pagos.map((p) => (p.id === id ? { ...p, pagado: !p.pagado, pagadoEl: p.pagado ? "" : hoyISO() } : p)) }));

  const enPesos = doc.presupuesto.dolar > 0 ? t.ARS.comprometido + t.USD.comprometido * doc.presupuesto.dolar : 0;
  const faltaEnPesos = doc.presupuesto.dolar > 0 ? t.ARS.falta + t.USD.falta * doc.presupuesto.dolar : 0;

  return (
    <div className="pnl-seccion pnl-presupuesto">
      {mostrar.map((m) => {
        const x = t[m];
        const pct = x.comprometido ? Math.min(100, Math.round((x.pagado / x.comprometido) * 100)) : 0;
        const delTope = x.tope ? Math.round((x.comprometido / x.tope) * 100) : 0;
        return (
          <section key={m} className="pnl-moneda" aria-label={NOMBRE_MONEDA[m]}>
            <div className="pnl-h2-fila">
              <h2 className="pnl-h2">{NOMBRE_MONEDA[m]}</h2>
              <label className="pnl-moneda__tope">
                <span className="pnl-tenue">Tope</span>
                <input
                  className="pnl-input-chico pnl-num"
                  inputMode="numeric"
                  value={miles(x.tope)}
                  placeholder="Sin tope"
                  onChange={(e) => tope(m, numero(e.target.value))}
                  aria-label={`Tope en ${NOMBRE_MONEDA[m].toLowerCase()}`}
                />
              </label>
            </div>
            <div className="pnl-cifras pnl-cifras--chicas pnl-cifras--tres">
              <div className="pnl-cifra"><span className="pnl-cifra__valor">{formatearMonto(x.comprometido, m)}</span><span className="pnl-cifra__etiqueta">Comprometido</span></div>
              <div className="pnl-cifra pnl-cifra--fuerte"><span className="pnl-cifra__valor">{formatearMonto(x.pagado, m)}</span><span className="pnl-cifra__etiqueta">Pagado</span></div>
              <div className="pnl-cifra"><span className="pnl-cifra__valor">{formatearMonto(x.falta, m)}</span><span className="pnl-cifra__etiqueta">Falta pagar</span></div>
            </div>
            {x.comprometido > 0 && (
              <div className="pnl-barra" role="img" aria-label={`${pct}% pagado`}>
                <span className="pnl-barra__si" style={{ width: `${pct}%` }} />
              </div>
            )}
            {x.tope > 0 && (
              <p className={`pnl-nota pnl-num${delTope > 100 ? " pnl-error" : ""}`}>
                {delTope > 100 ? `Te pasás del tope por ${formatearMonto(x.comprometido - x.tope, m)}` : `Usás el ${delTope}% del tope · quedan ${formatearMonto(x.tope - x.comprometido, m)}`}
              </p>
            )}
          </section>
        );
      })}

      <section className="pnl-resumen__bloque">
        <div className="pnl-h2-fila">
          <h2 className="pnl-h2">Dólar de referencia</h2>
          <input
            className="pnl-input-chico pnl-num"
            inputMode="numeric"
            value={miles(doc.presupuesto.dolar)}
            placeholder="No sumar"
            onChange={(e) => cambiar((d) => ({ ...d, presupuesto: { ...d.presupuesto, dolar: numero(e.target.value) } }), "dolar")}
            aria-label="Cuántos pesos vale un dólar"
          />
        </div>
        <p className="pnl-nota pnl-num">
          {enPesos > 0
            ? `Todo en pesos: ${formatearMonto(enPesos, "ARS")} comprometidos · ${formatearMonto(faltaEnPesos, "ARS")} por pagar`
            : "Si cargás cuántos pesos vale un dólar, te muestro el total de todo en pesos."}
        </p>
      </section>

      <section className="pnl-resumen__bloque">
        <h2 className="pnl-h2">Próximos pagos</h2>
        {vencimientos.length === 0 ? (
          <p className="pnl-nota">No hay pagos pendientes. Cuando elijas una cotización, armá su plan de pagos.</p>
        ) : (
          <ul className="pnl-vencimientos">
            {vencimientos.slice(0, 6).map((p) => (
              <li key={p.id}>
                <span className={`pnl-vencimientos__fecha pnl-num${pagoVencido(p) ? " es-tarde" : ""}`}>{corta(p.vence)}</span>
                <span className="pnl-vencimientos__que">
                  {p.concepto || "Pago"}
                  <span className="pnl-tenue"> · {p.responsableId ? nombreResp.get(p.responsableId) : nombreRubro(p.rubro)}</span>
                </span>
                <span className="pnl-num">{formatearMonto(p.monto, p.moneda)}</span>
                <button className="pnl-enlace" onClick={() => marcarPagado(p.id)}>Marcar pagado</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="pnl-resumen__bloque">
        <div className="pnl-h2-fila">
          <h2 className="pnl-h2">Por rubro</h2>
          <label className="pnl-checklist__plantilla">
            <span className="pnl-tenue">Sumar rubro</span>
            <select
              className="pnl-select"
              value=""
              onChange={(e) => {
                const r = e.target.value as Rubro;
                if (!r) return;
                setExtra((x) => [...x, r]);
                setAbierto(r);
              }}
              aria-label="Sumar un rubro"
            >
              <option value="">elegir…</option>
              {RUBROS.filter((r) => !rubros.includes(r.id)).map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </label>
        </div>

        {rubros.length === 0 ? (
          <p className="pnl-nota">Sumá un rubro (fotografía, catering, salón…) y cargá lo que te cotizaron.</p>
        ) : (
          <ul className="pnl-rubros">
            {rubros.map((r) => (
              <FilaRubro
                key={r}
                rubro={r}
                doc={doc}
                cambiar={cambiar}
                abierto={abierto === r}
                alternar={() => setAbierto(abierto === r ? null : r)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FilaRubro({ rubro, doc, cambiar, abierto, alternar }: { rubro: Rubro; doc: DocPanel; cambiar: Cambiar; abierto: boolean; alternar: () => void }) {
  const cots = doc.cotizaciones.filter((c) => c.rubro === rubro);
  const pagos = doc.pagos.filter((p) => p.rubro === rubro);
  const elegida = cots.find((c) => c.elegida);
  const equipo = doc.equipo.filter((r) => r.estado !== "descartado");

  const pagadoDe = (m: Moneda) => pagos.filter((p) => p.pagado && p.moneda === m).reduce((s, p) => s + p.monto, 0);

  const cotizar = (id: string, c: Partial<Cotizacion>, clave?: string) =>
    cambiar((d) => ({ ...d, cotizaciones: d.cotizaciones.map((x) => (x.id === id ? { ...x, ...c } : x)) }), clave);
  const pagar = (id: string, c: Partial<Pago>, clave?: string) =>
    cambiar((d) => ({ ...d, pagos: d.pagos.map((x) => (x.id === id ? { ...x, ...c } : x)) }), clave);

  const sumarCotizacion = () =>
    cambiar((d) => ({
      ...d,
      cotizaciones: [...d.cotizaciones, { id: idNuevo(), rubro, responsableId: null, descripcion: "", monto: 0, moneda: "ARS", elegida: false, notas: "" }],
    }));

  /** Elegir la cotización pone al proveedor como contratado; volver a tocarla la suelta. */
  const elegir = (c: Cotizacion) =>
    cambiar((d) => ({
      ...d,
      cotizaciones: d.cotizaciones.map((x) => (x.rubro === rubro ? { ...x, elegida: x.id === c.id ? !c.elegida : false } : x)),
      equipo: !c.elegida && c.responsableId ? d.equipo.map((r) => (r.id === c.responsableId ? { ...r, estado: "contratado" } : r)) : d.equipo,
    }));

  const sumarPago = (p?: Partial<Pago>) =>
    cambiar((d) => ({
      ...d,
      pagos: [
        ...d.pagos,
        { id: idNuevo(), rubro, responsableId: elegida?.responsableId ?? null, concepto: "", monto: 0, moneda: elegida?.moneda ?? "ARS", vence: "", pagado: false, pagadoEl: "", ...p },
      ],
    }));

  /** Seña del 30% y saldo del 70%: el esquema más común, editable después. */
  const armarPlan = () => {
    if (!elegida) return;
    const sena = Math.round(elegida.monto * 0.3);
    const base = { rubro, responsableId: elegida.responsableId, moneda: elegida.moneda, vence: "", pagado: false, pagadoEl: "" };
    cambiar((d) => ({
      ...d,
      pagos: [
        ...d.pagos,
        { id: idNuevo(), ...base, concepto: "Seña", monto: sena },
        { id: idNuevo(), ...base, concepto: "Saldo", monto: elegida.monto - sena },
      ],
    }));
  };

  return (
    <li className={`pnl-rubro${abierto ? " es-abierta" : ""}`}>
      <button className="pnl-rubro__fila" onClick={alternar} aria-expanded={abierto}>
        <span className="pnl-rubro__nombre">{nombreRubro(rubro)}</span>
        <span className="pnl-rubro__datos">
          {elegida ? (
            <>
              <span>{elegida.responsableId ? (doc.equipo.find((r) => r.id === elegida.responsableId)?.nombre ?? "Elegida") : "Elegida"}</span>
              <span className="pnl-num">{formatearMonto(elegida.monto, elegida.moneda)}</span>
              <span className="pnl-tenue pnl-num">pagado {formatearMonto(pagadoDe(elegida.moneda), elegida.moneda)}</span>
            </>
          ) : (
            <span className="pnl-tenue">{cots.length ? `${cots.length} ${cots.length === 1 ? "cotización" : "cotizaciones"}, falta elegir` : "Sin cotizaciones"}</span>
          )}
        </span>
      </button>

      {abierto && (
        <div className="pnl-ficha pnl-ficha--rubro">
          <div>
            <h3 className="pnl-h3">Cotizaciones</h3>
            {cots.length === 0 && <p className="pnl-nota">Cargá lo que te pasó cada proveedor y elegí la que te cierre.</p>}
            <ul className="pnl-cotizaciones">
              {cots.map((c) => (
                <li key={c.id} className={`pnl-cotizacion${c.elegida ? " es-elegida" : ""}`}>
                  <div className="pnl-cotizacion__campos">
                    <label className="pnl-campo">
                      <span>Quién</span>
                      <select className="pnl-select" value={c.responsableId ?? ""} onChange={(e) => cotizar(c.id, { responsableId: e.target.value || null })}>
                        <option value="">Sin asignar</option>
                        {equipo.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                      </select>
                    </label>
                    <label className="pnl-campo pnl-campo--ancho">
                      <span>Qué incluye</span>
                      <input value={c.descripcion} maxLength={140} onChange={(e) => cotizar(c.id, { descripcion: e.target.value }, `cot:${c.id}:d`)} placeholder="Ej: foto y video, 8 horas" />
                    </label>
                    <label className="pnl-campo">
                      <span>Monto</span>
                      <input inputMode="numeric" className="pnl-num" value={miles(c.monto)} placeholder="0" onChange={(e) => cotizar(c.id, { monto: numero(e.target.value) }, `cot:${c.id}:m`)} />
                    </label>
                    <label className="pnl-campo pnl-campo--chico">
                      <span>Moneda</span>
                      <select className="pnl-select" value={c.moneda} onChange={(e) => cotizar(c.id, { moneda: e.target.value as Moneda })}>
                        {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="pnl-cotizacion__pie">
                    <button className={`pnl-btn${c.elegida ? " pnl-btn--lleno" : ""}`} onClick={() => elegir(c)} aria-pressed={c.elegida} disabled={!c.monto && !c.elegida}>
                      {c.elegida ? "Elegida" : "Elegir esta"}
                    </button>
                    <button className="pnl-enlace pnl-enlace--peligro" onClick={() => cambiar((d) => ({ ...d, cotizaciones: d.cotizaciones.filter((x) => x.id !== c.id) }))}>
                      Borrar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button className="pnl-enlace" onClick={sumarCotizacion}>Agregar cotización</button>
          </div>

          <div>
            <h3 className="pnl-h3">Pagos</h3>
            {pagos.length === 0 && (
              <p className="pnl-nota">
                {elegida ? "Armá cuándo se paga: seña, cuotas y saldo, cada uno con su fecha." : "Elegí una cotización para armar el plan de pagos, o cargá un pago suelto."}
              </p>
            )}
            <ul className="pnl-pagos">
              {pagos.map((p) => (
                <li key={p.id} className={`pnl-pago${p.pagado ? " es-pagado" : ""}`}>
                  <label className="pnl-pago__check">
                    <input type="checkbox" checked={p.pagado} onChange={() => pagar(p.id, { pagado: !p.pagado, pagadoEl: p.pagado ? "" : hoyISO() })} aria-label={`Pagado: ${p.concepto || "pago"}`} />
                  </label>
                  <input className="pnl-pago__concepto" value={p.concepto} maxLength={80} placeholder="Concepto (seña, saldo…)" onChange={(e) => pagar(p.id, { concepto: e.target.value }, `pago:${p.id}:c`)} aria-label="Concepto" />
                  <input className="pnl-pago__monto pnl-num" inputMode="numeric" value={miles(p.monto)} placeholder="Monto" onChange={(e) => pagar(p.id, { monto: numero(e.target.value) }, `pago:${p.id}:m`)} aria-label="Monto" />
                  <select className="pnl-select pnl-pago__moneda" value={p.moneda} onChange={(e) => pagar(p.id, { moneda: e.target.value as Moneda })} aria-label="Moneda">
                    {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input className="pnl-pago__vence" type="date" value={p.vence} onChange={(e) => pagar(p.id, { vence: e.target.value })} aria-label="Vence" />
                  <button className="pnl-enlace pnl-enlace--peligro" onClick={() => cambiar((d) => ({ ...d, pagos: d.pagos.filter((x) => x.id !== p.id) }))} aria-label="Borrar pago">Borrar</button>
                </li>
              ))}
            </ul>
            <div className="pnl-ficha__botones pnl-ficha__botones--izq">
              <button className="pnl-enlace" onClick={() => sumarPago()}>Agregar pago</button>
              {elegida && pagos.length === 0 && <button className="pnl-btn" onClick={armarPlan}>Armar seña y saldo</button>}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
