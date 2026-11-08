"use client";

import { useState } from "react";
import { formatearMonto, idNuevo, rubrosSinCubrir } from "@/panel/logica";
import { nombreRubro, RUBROS, type DocPanel, type EstadoProveedor, type Responsable, type Rubro } from "@/panel/tipos";
import type { Cambiar } from "./Panel";

const ESTADOS: { id: EstadoProveedor; nombre: string }[] = [
  { id: "buscando", nombre: "Buscando" },
  { id: "cotizando", nombre: "Cotizando" },
  { id: "contratado", nombre: "Contratado" },
  { id: "descartado", nombre: "Descartado" },
];

const nombreEstado = (e: EstadoProveedor) => ESTADOS.find((x) => x.id === e)?.nombre ?? e;

/** Un número de WhatsApp: sólo dígitos y, si no trae código de país, el de Argentina. */
function whatsapp(tel: string) {
  const d = tel.replace(/\D/g, "").replace(/^0+/, "");
  if (!d) return "";
  return `https://wa.me/${d.startsWith("54") ? d : `54${d}`}`;
}

const nuevo = (rubro: Rubro, nombre: string, esPersona: boolean): Responsable => ({
  id: idNuevo(),
  rubro,
  nombre: nombre.trim().slice(0, 80),
  contacto: "",
  telefono: "",
  email: "",
  estado: esPersona ? "contratado" : "cotizando",
  esPersona,
  notas: "",
});

/**
 * Quién se encarga de qué: proveedores y personas del entorno. Los rubros que
 * las tareas del checklist piden y nadie cubre aparecen arriba, para que se
 * vea de un vistazo qué falta resolver.
 */
export function Equipo({ doc, cambiar }: { doc: DocPanel; cambiar: Cambiar }) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const [alta, setAlta] = useState<{ rubro: Rubro } | null>(null);

  const orden = (r: Rubro) => RUBROS.findIndex((x) => x.id === r);
  const lista = [...doc.equipo].sort((a, b) => orden(a.rubro) - orden(b.rubro) || a.nombre.localeCompare(b.nombre));
  const sinCubrir = rubrosSinCubrir(doc);
  const cuenta = (e: EstadoProveedor) => doc.equipo.filter((r) => r.estado === e).length;

  const editar = (id: string, c: Partial<Responsable>, clave?: string) =>
    cambiar((d) => ({ ...d, equipo: d.equipo.map((r) => (r.id === id ? { ...r, ...c } : r)) }), clave);

  const agregar = (r: Responsable) => {
    cambiar((d) => ({ ...d, equipo: [...d.equipo, r] }));
    setAlta(null);
    setAbierto(r.id);
  };

  const borrar = (id: string) => {
    cambiar((d) => ({
      ...d,
      equipo: d.equipo.filter((r) => r.id !== id),
      tareas: d.tareas.map((t) => (t.responsableId === id ? { ...t, responsableId: null } : t)),
      cotizaciones: d.cotizaciones.map((c) => (c.responsableId === id ? { ...c, responsableId: null } : c)),
      pagos: d.pagos.map((p) => (p.responsableId === id ? { ...p, responsableId: null } : p)),
    }));
    setAbierto(null);
  };

  return (
    <div className="pnl-seccion">
      <section className="pnl-equipo__cabeza">
        <p className="pnl-nota pnl-num">
          {cuenta("contratado")} contratados · {cuenta("cotizando")} cotizando · {cuenta("buscando")} buscando
        </p>
        <button className="pnl-btn pnl-btn--lleno" onClick={() => setAlta({ rubro: sinCubrir[0] ?? "fotografia" })}>
          Agregar
        </button>
      </section>

      {alta && <Alta rubro={alta.rubro} onAgregar={agregar} onCancelar={() => setAlta(null)} />}

      {sinCubrir.length > 0 && (
        <section className="pnl-resumen__bloque">
          <h2 className="pnl-h2">Sin cubrir</h2>
          <p className="pnl-nota">Tu checklist tiene tareas de estos rubros y todavía no cargaste a nadie.</p>
          <ul className="pnl-sincubrir">
            {sinCubrir.map((r) => (
              <li key={r}>
                <span>{nombreRubro(r)}</span>
                <button className="pnl-enlace" onClick={() => setAlta({ rubro: r })}>Asignar</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lista.length === 0 && !alta ? (
        <p className="pnl-nota pnl-nota--centro">
          Todavía no cargaste a nadie. Sumá al fotógrafo, al DJ, al catering o a quien te ayude con los souvenirs.
        </p>
      ) : (
        <ul className="pnl-equipo">
          {lista.map((r, i) => {
            const nuevaSeccion = i === 0 || lista[i - 1].rubro !== r.rubro;
            return (
              <li key={r.id} className={`pnl-miembro${abierto === r.id ? " es-abierta" : ""}${r.estado === "descartado" ? " es-descartado" : ""}`}>
                <button className="pnl-miembro__fila" onClick={() => setAbierto(abierto === r.id ? null : r.id)} aria-expanded={abierto === r.id}>
                  <span className="pnl-miembro__rubro">{nuevaSeccion ? nombreRubro(r.rubro) : ""}</span>
                  <span className="pnl-miembro__quien">
                    <span className="pnl-miembro__nombre">{r.nombre || "Sin nombre"}{r.esPersona ? <span className="pnl-tenue"> · del entorno</span> : null}</span>
                    {(r.contacto || r.telefono) && <span className="pnl-tenue pnl-miembro__contacto">{[r.contacto, r.telefono].filter(Boolean).join(" · ")}</span>}
                  </span>
                  <span className={`pnl-estado pnl-estado--${r.estado}`}>{nombreEstado(r.estado)}</span>
                </button>
                {abierto === r.id && <Ficha r={r} doc={doc} editar={(c, k) => editar(r.id, c, k)} borrar={() => borrar(r.id)} cerrar={() => setAbierto(null)} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Alta({ rubro, onAgregar, onCancelar }: { rubro: Rubro; onAgregar: (r: Responsable) => void; onCancelar: () => void }) {
  const [r, setR] = useState<Rubro>(rubro);
  const [nombre, setNombre] = useState("");
  const [persona, setPersona] = useState(false);

  return (
    <form
      className="pnl-ficha pnl-ficha--alta"
      onSubmit={(e) => {
        e.preventDefault();
        if (nombre.trim()) onAgregar(nuevo(r, nombre, persona));
      }}
    >
      <div className="pnl-ficha__campos pnl-ficha__campos--equipo">
        <label className="pnl-campo">
          <span>Rubro</span>
          <select className="pnl-select" value={r} onChange={(e) => setR(e.target.value as Rubro)}>
            {RUBROS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        </label>
        <label className="pnl-campo pnl-campo--ancho">
          <span>Nombre del proveedor o de la persona</span>
          <input value={nombre} maxLength={80} onChange={(e) => setNombre(e.target.value)} autoFocus placeholder="Ej: Estudio Luz, o Tía Marta" />
        </label>
      </div>
      <label className="pnl-check">
        <input type="checkbox" checked={persona} onChange={(e) => setPersona(e.target.checked)} />
        Es alguien del entorno, no un proveedor
      </label>
      <div className="pnl-ficha__botones">
        <button type="button" className="pnl-btn" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="pnl-btn pnl-btn--lleno" disabled={!nombre.trim()}>Agregar</button>
      </div>
    </form>
  );
}

function Ficha({ r, doc, editar, borrar, cerrar }: { r: Responsable; doc: DocPanel; editar: (c: Partial<Responsable>, clave?: string) => void; borrar: () => void; cerrar: () => void }) {
  const [seguro, setSeguro] = useState(false);
  const tareas = doc.tareas.filter((t) => t.responsableId === r.id);
  const cots = doc.cotizaciones.filter((c) => c.responsableId === r.id);
  const pagos = doc.pagos.filter((p) => p.responsableId === r.id);
  const wa = whatsapp(r.telefono);

  return (
    <div className="pnl-ficha pnl-ficha--equipo">
      <div className="pnl-ficha__campos pnl-ficha__campos--equipo">
        <label className="pnl-campo pnl-campo--ancho">
          <span>Nombre</span>
          <input value={r.nombre} maxLength={80} onChange={(e) => editar({ nombre: e.target.value }, `eq:${r.id}:nombre`)} />
        </label>
        <label className="pnl-campo">
          <span>Rubro</span>
          <select className="pnl-select" value={r.rubro} onChange={(e) => editar({ rubro: e.target.value as Rubro })}>
            {RUBROS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        </label>
        <label className="pnl-campo">
          <span>Estado</span>
          <select className="pnl-select" value={r.estado} onChange={(e) => editar({ estado: e.target.value as EstadoProveedor })}>
            {ESTADOS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        </label>
        <label className="pnl-campo">
          <span>Persona de contacto</span>
          <input value={r.contacto} maxLength={80} onChange={(e) => editar({ contacto: e.target.value }, `eq:${r.id}:contacto`)} />
        </label>
        <label className="pnl-campo">
          <span>Teléfono</span>
          <input value={r.telefono} inputMode="tel" maxLength={30} onChange={(e) => editar({ telefono: e.target.value }, `eq:${r.id}:tel`)} />
        </label>
        <label className="pnl-campo pnl-campo--ancho">
          <span>Email</span>
          <input type="email" value={r.email} maxLength={120} onChange={(e) => editar({ email: e.target.value }, `eq:${r.id}:email`)} />
        </label>
      </div>

      <label className="pnl-check">
        <input type="checkbox" checked={r.esPersona} onChange={(e) => editar({ esPersona: e.target.checked })} />
        Es alguien del entorno, no un proveedor
      </label>

      <label className="pnl-campo">
        <span>Notas</span>
        <textarea className="pnl-textarea" rows={2} value={r.notas} maxLength={400} onChange={(e) => editar({ notas: e.target.value }, `eq:${r.id}:notas`)} placeholder="Ej: pide la seña con 30 días de anticipación" />
      </label>

      {(r.telefono || r.email) && (
        <div className="pnl-ficha__botones pnl-ficha__botones--izq">
          {r.telefono && <a className="pnl-btn" href={`tel:${r.telefono.replace(/[^\d+]/g, "")}`}>Llamar</a>}
          {wa && <a className="pnl-btn" href={wa} target="_blank" rel="noreferrer">WhatsApp</a>}
          {r.email && <a className="pnl-btn" href={`mailto:${r.email}`}>Escribir</a>}
        </div>
      )}

      {(tareas.length > 0 || cots.length > 0 || pagos.length > 0) && (
        <div className="pnl-miembro__detalle">
          {tareas.length > 0 && (
            <div>
              <h3 className="pnl-h3">Tareas a su cargo</h3>
              <ul className="pnl-lista-simple">
                {tareas.map((t) => (
                  <li key={t.id}>
                    <span className={t.hecha ? "pnl-tenue" : ""}>{t.titulo}</span>
                    <span className="pnl-tenue">{t.hecha ? "hecha" : "falta"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cots.length > 0 && (
            <div>
              <h3 className="pnl-h3">Cotizaciones</h3>
              <ul className="pnl-lista-simple">
                {cots.map((c) => (
                  <li key={c.id}>
                    <span>{c.descripcion || nombreRubro(c.rubro)}{c.elegida ? " · elegida" : ""}</span>
                    <span className="pnl-num">{formatearMonto(c.monto, c.moneda)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {pagos.length > 0 && (
            <div>
              <h3 className="pnl-h3">Pagos</h3>
              <ul className="pnl-lista-simple">
                {pagos.map((p) => (
                  <li key={p.id}>
                    <span>{p.concepto || "Pago"}</span>
                    <span className={`pnl-num ${p.pagado ? "pnl-tenue" : ""}`}>{formatearMonto(p.monto, p.moneda)}{p.pagado ? " · pagado" : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="pnl-ficha__pie">
        <div className="pnl-ficha__botones">
          {seguro ? (
            <>
              <span className="pnl-nota">¿Seguro? Sus tareas, cotizaciones y pagos quedan sin responsable.</span>
              <button className="pnl-btn pnl-btn--peligro" onClick={borrar}>Sí, borrar</button>
              <button className="pnl-btn" onClick={() => setSeguro(false)}>No</button>
            </>
          ) : (
            <button className="pnl-enlace pnl-enlace--peligro" onClick={() => setSeguro(true)}>Borrar</button>
          )}
          <button className="pnl-btn" onClick={cerrar}>Listo</button>
        </div>
      </div>
    </div>
  );
}
