"use client";

import { useMemo, useState } from "react";
import { hoyISO, idNuevo, progresoChecklist, venceTarea } from "@/panel/logica";
import { aplicarPlantilla, PLANTILLAS } from "@/panel/plantillas";
import { ETAPAS, nombreRubro, RUBROS, type DocPanel, type Etapa, type Plantilla, type Responsable, type Rubro, type Tarea } from "@/panel/tipos";
import type { Cambiar } from "./Panel";

type Filtro = "todas" | "pendientes" | "atrasadas";

/** "2026-09-15" → "15 sep". Con año si no es el actual. */
function corta(iso: string) {
  if (!iso) return "";
  const [a, m, d] = iso.split("-").map(Number);
  const f = new Date(a, m - 1, d);
  const t = f.toLocaleDateString("es-AR", { day: "numeric", month: "short", ...(a !== new Date().getFullYear() ? { year: "2-digit" } : {}) });
  return t.replace(/\./g, "");
}

export function Checklist({ doc, cambiar, evento }: { doc: DocPanel; cambiar: Cambiar; evento: Date | null }) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [abierta, setAbierta] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [etapaNueva, setEtapaNueva] = useState<Etapa>("3m");

  const hoy = hoyISO();
  const nombreResp = useMemo(() => new Map(doc.equipo.map((r) => [r.id, r.nombre])), [doc.equipo]);
  const p = progresoChecklist(doc.tareas);

  const vence = (t: Tarea) => venceTarea(t, evento);
  const atrasada = (t: Tarea) => !t.hecha && vence(t) !== "" && vence(t) < hoy;
  const cuantasAtrasadas = doc.tareas.filter(atrasada).length;

  const editar = (id: string, cambio: Partial<Tarea>, clave?: string) =>
    cambiar((d) => ({ ...d, tareas: d.tareas.map((t) => (t.id === id ? { ...t, ...cambio } : t)) }), clave);

  const tildar = (t: Tarea) =>
    editar(t.id, { hecha: !t.hecha, hechaEl: t.hecha ? "" : new Date().toISOString() });

  const agregar = () => {
    const t = titulo.trim();
    if (!t) return;
    const nueva: Tarea = { id: idNuevo(), titulo: t.slice(0, 140), hecha: false, hechaEl: "", etapa: etapaNueva, vence: "", responsableId: null, rubro: null, notas: "", origen: "manual" };
    cambiar((d) => ({ ...d, tareas: [...d.tareas, nueva] }));
    setTitulo("");
  };

  const borrar = (id: string) => {
    cambiar((d) => ({ ...d, tareas: d.tareas.filter((t) => t.id !== id) }));
    setAbierta(null);
  };

  const cargar = (id: Plantilla) => cambiar((d) => aplicarPlantilla(d, id));

  /* ── Todavía no armaron el checklist ─────────────────────── */

  if (doc.tareas.length === 0) {
    return (
      <div className="pnl-seccion">
        <section className="pnl-resumen__bloque">
          <h2 className="pnl-h2">Armá tu checklist</h2>
          <p className="pnl-nota">
            Elegí qué evento organizás y te cargo una lista de arranque, con lo que suele hacer falta y cuándo. Después
            borrás lo que no uses y agregás lo tuyo.
          </p>
          <ul className="pnl-plantillas">
            {PLANTILLAS.map((x) => (
              <li key={x.id}>
                <button className="pnl-plantilla" onClick={() => cargar(x.id)}>
                  <span className="pnl-plantilla__nombre">{x.nombre}</span>
                  <span className="pnl-tenue">{x.detalle}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <form
          className="pnl-checklist__alta"
          onSubmit={(e) => {
            e.preventDefault();
            agregar();
          }}
        >
          <input className="pnl-buscar" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="O empezá con una tarea propia" maxLength={140} aria-label="Nueva tarea" />
          <button className="pnl-btn pnl-btn--lleno" type="submit" disabled={!titulo.trim()}>Agregar</button>
        </form>
      </div>
    );
  }

  /* ── La lista ─────────────────────────────────────────────── */

  const visibles = doc.tareas.filter((t) => (filtro === "todas" ? true : filtro === "pendientes" ? !t.hecha : atrasada(t)));
  const grupos = ETAPAS.map((e) => ({ etapa: e, tareas: visibles.filter((t) => t.etapa === e.id) })).filter((g) => g.tareas.length > 0);

  return (
    <div className="pnl-seccion pnl-checklist">
      <section className="pnl-checklist__progreso">
        <div className="pnl-h2-fila">
          <p className="pnl-checklist__cuenta">
            <b className="pnl-num">{p.hechas}</b> de <span className="pnl-num">{p.total}</span> hechas
          </p>
          <span className="pnl-num pnl-tenue">{p.pct}%</span>
        </div>
        <div className="pnl-barra" role="img" aria-label={`${p.pct}% del checklist hecho`}>
          <span className="pnl-barra__si" style={{ width: `${p.pct}%` }} />
        </div>
      </section>

      <div className="pnl-checklist__barra">
        <div className="pnl-filtros" role="group" aria-label="Filtrar tareas">
          <button aria-pressed={filtro === "todas"} onClick={() => setFiltro("todas")}>Todas</button>
          <button aria-pressed={filtro === "pendientes"} onClick={() => setFiltro("pendientes")}>Pendientes</button>
          <button aria-pressed={filtro === "atrasadas"} onClick={() => setFiltro("atrasadas")} disabled={!cuantasAtrasadas}>
            Atrasadas{cuantasAtrasadas ? ` ${cuantasAtrasadas}` : ""}
          </button>
        </div>
        <label className="pnl-checklist__plantilla">
          <span className="pnl-tenue">Sumar tareas de</span>
          <select
            className="pnl-select"
            value=""
            onChange={(e) => e.target.value && cargar(e.target.value as Plantilla)}
            aria-label="Sumar las tareas de una plantilla"
          >
            <option value="">una plantilla…</option>
            {PLANTILLAS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        </label>
      </div>

      <form
        className="pnl-checklist__alta"
        onSubmit={(e) => {
          e.preventDefault();
          agregar();
        }}
      >
        <input className="pnl-buscar" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Agregar una tarea" maxLength={140} aria-label="Nueva tarea" />
        <select className="pnl-select" value={etapaNueva} onChange={(e) => setEtapaNueva(e.target.value as Etapa)} aria-label="Cuándo hay que hacerla">
          {ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        <button className="pnl-btn pnl-btn--lleno" type="submit" disabled={!titulo.trim()}>Agregar</button>
      </form>

      {grupos.length === 0 && <p className="pnl-nota pnl-nota--centro">No hay tareas en este filtro.</p>}

      {grupos.map(({ etapa, tareas }) => {
        const hechas = doc.tareas.filter((t) => t.etapa === etapa.id && t.hecha).length;
        const total = doc.tareas.filter((t) => t.etapa === etapa.id).length;
        return (
          <section key={etapa.id} className="pnl-etapa" aria-label={etapa.nombre}>
            <div className="pnl-h2-fila">
              <h2 className="pnl-h2">{etapa.nombre}</h2>
              <span className="pnl-num pnl-tenue">{hechas}/{total}</span>
            </div>
            <ul className="pnl-tareas">
              {tareas.map((t) => {
                const v = vence(t);
                const tarde = atrasada(t);
                const quien = t.responsableId ? nombreResp.get(t.responsableId) : "";
                return (
                  <li key={t.id} className={`pnl-tarea${t.hecha ? " es-hecha" : ""}${abierta === t.id ? " es-abierta" : ""}`}>
                    <div className="pnl-tarea__fila">
                      <label className="pnl-tarea__check">
                        <input type="checkbox" checked={t.hecha} onChange={() => tildar(t)} aria-label={`Hecha: ${t.titulo}`} />
                      </label>
                      <button className="pnl-tarea__cuerpo" onClick={() => setAbierta(abierta === t.id ? null : t.id)} aria-expanded={abierta === t.id}>
                        <span className="pnl-tarea__titulo">{t.titulo || "Sin título"}</span>
                        <span className="pnl-tarea__meta">
                          {t.rubro && <span>{nombreRubro(t.rubro)}</span>}
                          <span className={quien ? "" : "pnl-tenue"}>{quien || "Sin responsable"}</span>
                        </span>
                      </button>
                      <span className={`pnl-tarea__fecha pnl-num${tarde ? " es-tarde" : ""}`}>
                        {t.hecha && t.hechaEl ? `hecha ${corta(t.hechaEl.slice(0, 10))}` : v ? corta(v) : ""}
                        {tarde && <span className="pnl-tarea__tarde"> atrasada</span>}
                      </span>
                    </div>
                    {abierta === t.id && (
                      <Ficha
                        t={t}
                        evento={evento}
                        equipo={doc.equipo}
                        editar={(c, clave) => editar(t.id, c, clave)}
                        nuevoResponsable={(r) => cambiar((d) => ({ ...d, equipo: [...d.equipo, r], tareas: d.tareas.map((x) => (x.id === t.id ? { ...x, responsableId: r.id } : x)) }))}
                        borrar={() => borrar(t.id)}
                        cerrar={() => setAbierta(null)}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Ficha({
  t,
  evento,
  equipo,
  editar,
  nuevoResponsable,
  borrar,
  cerrar,
}: {
  t: Tarea;
  evento: Date | null;
  equipo: Responsable[];
  editar: (c: Partial<Tarea>, clave?: string) => void;
  nuevoResponsable: (r: Responsable) => void;
  borrar: () => void;
  cerrar: () => void;
}) {
  const [seguro, setSeguro] = useState(false);
  const [alta, setAlta] = useState(false);
  const [nombre, setNombre] = useState("");
  const [persona, setPersona] = useState(false);
  const calculada = !t.vence ? venceTarea(t, evento) : "";

  const crear = () => {
    const n = nombre.trim();
    if (!n) return;
    nuevoResponsable({
      id: idNuevo(),
      rubro: t.rubro ?? "otro",
      nombre: n.slice(0, 80),
      contacto: "",
      telefono: "",
      email: "",
      estado: persona ? "contratado" : "cotizando",
      esPersona: persona,
      notas: "",
    });
    setAlta(false);
    setNombre("");
    setPersona(false);
  };

  return (
    <div className="pnl-ficha pnl-ficha--tarea">
      <div className="pnl-ficha__campos pnl-ficha__campos--tarea">
        <label className="pnl-campo pnl-campo--ancho">
          <span>Tarea</span>
          <input value={t.titulo} maxLength={140} onChange={(e) => editar({ titulo: e.target.value }, `tarea:${t.id}:titulo`)} />
        </label>
        <label className="pnl-campo">
          <span>Cuándo</span>
          <select className="pnl-select" value={t.etapa} onChange={(e) => editar({ etapa: e.target.value as Etapa })}>
            {ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </label>
        <label className="pnl-campo">
          <span>Fecha límite</span>
          <input type="date" value={t.vence} onChange={(e) => editar({ vence: e.target.value })} />
          {calculada && <small className="pnl-tenue">Sin fecha propia: se toma {corta(calculada)}</small>}
        </label>
        <label className="pnl-campo">
          <span>Rubro</span>
          <select className="pnl-select" value={t.rubro ?? ""} onChange={(e) => editar({ rubro: (e.target.value || null) as Rubro | null })}>
            <option value="">Ninguno</option>
            {RUBROS.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </label>
        <label className="pnl-campo">
          <span>Quién se encarga</span>
          <select
            className="pnl-select"
            value={alta ? "__nuevo" : (t.responsableId ?? "")}
            onChange={(e) => {
              if (e.target.value === "__nuevo") setAlta(true);
              else {
                setAlta(false);
                editar({ responsableId: e.target.value || null });
              }
            }}
          >
            <option value="">Sin asignar</option>
            {equipo.map((r) => <option key={r.id} value={r.id}>{r.nombre} · {nombreRubro(r.rubro)}</option>)}
            <option value="__nuevo">Agregar a alguien nuevo…</option>
          </select>
        </label>
      </div>

      {alta && (
        <div className="pnl-ficha__nuevo">
          <label className="pnl-campo">
            <span>Nombre del proveedor o de la persona</span>
            <input value={nombre} maxLength={80} onChange={(e) => setNombre(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && crear()} />
          </label>
          <label className="pnl-check">
            <input type="checkbox" checked={persona} onChange={(e) => setPersona(e.target.checked)} />
            Es alguien del entorno, no un proveedor
          </label>
          <div className="pnl-ficha__botones">
            <button className="pnl-btn" onClick={() => setAlta(false)}>Cancelar</button>
            <button className="pnl-btn pnl-btn--lleno" onClick={crear} disabled={!nombre.trim()}>Agregar y asignar</button>
          </div>
        </div>
      )}

      <label className="pnl-campo">
        <span>Notas</span>
        <textarea className="pnl-textarea" rows={2} value={t.notas} maxLength={400} onChange={(e) => editar({ notas: e.target.value }, `tarea:${t.id}:notas`)} placeholder="Ej: pedir presupuesto con y sin barra libre" />
      </label>

      <div className="pnl-ficha__pie">
        <div className="pnl-ficha__botones">
          {seguro ? (
            <>
              <span className="pnl-nota">¿Seguro?</span>
              <button className="pnl-btn pnl-btn--peligro" onClick={borrar}>Sí, borrar</button>
              <button className="pnl-btn" onClick={() => setSeguro(false)}>No</button>
            </>
          ) : (
            <button className="pnl-enlace pnl-enlace--peligro" onClick={() => setSeguro(true)}>Borrar tarea</button>
          )}
          <button className="pnl-btn" onClick={cerrar}>Listo</button>
        </div>
      </div>
    </div>
  );
}
