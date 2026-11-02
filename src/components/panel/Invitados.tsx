"use client";

import { useMemo, useRef, useState } from "react";
import { COMIDAS } from "@/lib/rsvp-comun";
import { avisos, esperadas, idNuevo, metricas, norm, ocupacion, posiblesDuplicados } from "@/panel/logica";
import { ESTADOS, type DocPanel, type Estado, type Invitado } from "@/panel/tipos";
import type { Cambiar } from "./Panel";
import { Avisos, Cifra } from "./piezas";

type Props = {
  doc: DocPanel;
  cambiar: Cambiar;
  completo: boolean;
  nombres: string;
  enlaceInvitacion: string;
};

type Filtro = "todos" | Estado | "sin-mesa";
type Orden = "grupo" | "nombre" | "estado" | "reciente";

export const nuevo = (datos: Partial<Invitado> & { nombre: string }): Invitado => ({
  id: idNuevo(),
  grupo: "",
  personas: 1,
  estado: "pendiente",
  telefono: "",
  comidas: [],
  notas: "",
  mesa: null,
  origen: "manual",
  alias: [],
  rsvp: null,
  cancion: "",
  enlace: null,
  ...datos,
});

/**
 * Entiende una lista pegada de WhatsApp, Excel o Notas. Una persona o familia
 * por renglón; lo demás se deduce:
 *   "Tía Marta, Familia Gómez, 4"   "Juan Pérez ; 11 5555 1234"   "Los Ruiz (5)"
 */
export function parsearLista(texto: string, grupoPorDefecto: string) {
  return texto
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-•*·]|\d+[.)])\s*/, "").trim())
    .filter((l) => l && !/^nombre\b/i.test(l))
    .map((linea) => {
      const partes = linea.split(/\t|;|,/).map((p) => p.trim()).filter(Boolean);
      let nombre = partes.shift() ?? "";
      let personas = 1;
      let telefono = "";
      let grupo = grupoPorDefecto;

      const enNombre = nombre.match(/\s*(?:\((\d{1,2})\)|x\s?(\d{1,2}))\s*$/i);
      if (enNombre) {
        personas = Number(enNombre[1] ?? enNombre[2]);
        nombre = nombre.slice(0, enNombre.index).trim();
      }

      for (const p of partes) {
        const digitos = p.replace(/[^\d]/g, "");
        if (/^\d{1,2}$/.test(p)) personas = Number(p);
        else if (digitos.length >= 7 && /^[\d\s+()-]+$/.test(p)) telefono = p;
        else grupo = p;
      }

      return nuevo({ nombre: nombre.slice(0, 80), personas: Math.min(30, Math.max(1, personas)), telefono, grupo });
    })
    .filter((i) => i.nombre.length > 1);
}

export function Invitados({ doc, cambiar, completo, nombres, enlaceInvitacion }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [orden, setOrden] = useState<Orden>("grupo");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [pegando, setPegando] = useState(false);

  const m = metricas(doc);
  const mesas = doc.salon.elementos.filter((e) => e.tipo === "mesa");
  const ocup = ocupacion(doc.invitados);
  const grupos = useMemo(
    () => [...new Set(doc.invitados.map((i) => i.grupo.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [doc.invitados],
  );
  const duplicados = posiblesDuplicados(doc.invitados);

  const visibles = useMemo(() => {
    const q = norm(busqueda);
    const lista = doc.invitados.filter((i) => {
      if (filtro === "sin-mesa" ? i.mesa || i.estado === "no-viene" : filtro !== "todos" && i.estado !== filtro) return false;
      return !q || norm(`${i.nombre} ${i.grupo} ${i.telefono}`).includes(q);
    });
    const rango: Record<Estado, number> = { pendiente: 0, confirmado: 1, "no-viene": 2 };
    return lista.sort((a, b) => {
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre);
      if (orden === "estado") return rango[a.estado] - rango[b.estado] || a.nombre.localeCompare(b.nombre);
      if (orden === "reciente") return (b.rsvp ?? "").localeCompare(a.rsvp ?? "");
      return (a.grupo.trim() || "~").localeCompare(b.grupo.trim() || "~") || a.nombre.localeCompare(b.nombre);
    });
  }, [doc.invitados, busqueda, filtro, orden]);

  /* ── Acciones ──────────────────────────────────────────────── */

  const editar = (id: string, cambios: Partial<Invitado>) =>
    cambiar((d) => ({ ...d, invitados: d.invitados.map((i) => (i.id === id ? { ...i, ...cambios } : i)) }));

  const agregar = (lista: Invitado[]) => cambiar((d) => ({ ...d, invitados: [...d.invitados, ...lista] }));

  const borrar = (inv: Invitado) =>
    cambiar((d) => {
      // Si confirmó por la invitación, se recuerda para que no vuelva a aparecer.
      const descartes = { ...d.descartes };
      if (inv.rsvp) for (const a of [...inv.alias, norm(inv.nombre)]) descartes[a] = inv.rsvp;
      return { ...d, descartes, invitados: d.invitados.filter((i) => i.id !== inv.id) };
    });

  /** Une la fila que llegó por la invitación con la que ya estaba cargada. */
  const unir = (desdeRsvp: Invitado, destino: Invitado) =>
    cambiar((d) => ({
      ...d,
      invitados: d.invitados
        .filter((i) => i.id !== desdeRsvp.id)
        .map((i) =>
          i.id === destino.id
            ? {
                ...i,
                estado: desdeRsvp.estado,
                personas: desdeRsvp.estado === "confirmado" ? desdeRsvp.personas : i.personas,
                comidas: desdeRsvp.comidas,
                cancion: desdeRsvp.cancion || i.cancion,
                rsvp: desdeRsvp.rsvp,
                alias: [...new Set([...i.alias, ...desdeRsvp.alias, norm(desdeRsvp.nombre)])],
              }
            : i,
        ),
    }));

  const whatsapp = (i: Invitado) => {
    const tel = i.telefono.replace(/[^\d]/g, "");
    if (tel.length < 7) return null;
    const url = typeof window !== "undefined" ? window.location.origin + enlaceInvitacion : enlaceInvitacion;
    const texto =
      i.estado === "pendiente"
        ? `Hola ${i.nombre.split(" ")[0]}! Te recordamos confirmar si venís a lo de ${nombres}. Se hace en un minuto desde acá: ${url}`
        : `Hola ${i.nombre.split(" ")[0]}! Te dejamos la invitación de ${nombres}: ${url}`;
    // Sin código de país, se asume Argentina.
    const numero = tel.startsWith("54") ? tel : `549${tel.replace(/^0/, "")}`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  };

  const filtros: { id: Filtro; nombre: string; n: number }[] = [
    { id: "todos", nombre: "Todos", n: doc.invitados.length },
    { id: "confirmado", nombre: "Confirmados", n: doc.invitados.filter((i) => i.estado === "confirmado").length },
    { id: "pendiente", nombre: "Sin respuesta", n: doc.invitados.filter((i) => i.estado === "pendiente").length },
    { id: "no-viene", nombre: "No vienen", n: doc.invitados.filter((i) => i.estado === "no-viene").length },
    ...(completo && mesas.length ? [{ id: "sin-mesa" as Filtro, nombre: "Sin mesa", n: doc.invitados.filter((i) => !i.mesa && i.estado !== "no-viene").length }] : []),
  ];

  return (
    <div className="pnl-seccion">
      {!completo && (
        <>
          <div className="pnl-cifras">
            <Cifra valor={m.confirmados} etiqueta="Personas confirmadas" fuerte />
            <Cifra valor={m.pendientes} etiqueta="Sin respuesta" />
            <Cifra valor={m.noVienen} etiqueta="No vienen" />
            <Cifra valor={m.esperados} etiqueta="Esperadas en total" />
          </div>
          <Avisos lista={avisos(doc, "basico")} />
        </>
      )}

      {duplicados.length > 0 && (
        <ul className="pnl-duplicados">
          {duplicados.slice(0, 4).map(({ rsvp, cargado }) => (
            <li key={rsvp.id}>
              <span>
                <b>{rsvp.nombre}</b> confirmó por la invitación. ¿Es <b>{cargado.nombre}</b>?
              </span>
              <button className="pnl-btn" onClick={() => unir(rsvp, cargado)}>
                Sí, unir
              </button>
            </li>
          ))}
        </ul>
      )}

      <Alta grupos={grupos} onAgregar={(i) => agregar([i])} onPegar={() => setPegando(true)} />

      {pegando && <Pegar onCerrar={() => setPegando(false)} onAgregar={(l) => { agregar(l); setPegando(false); }} />}

      <div className="pnl-herramientas">
        <div className="pnl-filtros" role="group" aria-label="Filtrar por estado">
          {filtros.map((f) => (
            <button key={f.id} className="pnl-filtro" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.nombre} <span className="pnl-num">{f.n}</span>
            </button>
          ))}
        </div>
        <div className="pnl-herramientas__der">
          <input
            className="pnl-buscar"
            type="search"
            placeholder="Buscar nombre, grupo o teléfono"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar"
          />
          <select className="pnl-select" value={orden} onChange={(e) => setOrden(e.target.value as Orden)} aria-label="Ordenar">
            <option value="grupo">Por grupo</option>
            <option value="nombre">Por nombre</option>
            <option value="estado">Por estado</option>
            <option value="reciente">Últimas confirmaciones</option>
          </select>
        </div>
      </div>

      {doc.invitados.length === 0 ? (
        <div className="pnl-vacio">
          <p className="pnl-vacio__titulo">Todavía no hay nadie en la lista.</p>
          <p>
            Cargá a mano o pegá la lista que ya tenés en WhatsApp o Excel. Los que confirmen por la invitación aparecen
            solos, y si ya estaban cargados se actualiza su fila.
          </p>
        </div>
      ) : visibles.length === 0 ? (
        <p className="pnl-nota pnl-nota--centro">Nadie coincide con ese filtro.</p>
      ) : (
        <div className={`pnl-tabla${completo ? " pnl-tabla--mesa" : ""}`} role="table" aria-label="Invitados">
          <div className="pnl-tabla__cabeza" role="row">
            <span role="columnheader">Nombre</span>
            <span role="columnheader">Grupo</span>
            <span role="columnheader" className="pnl-der">Pers.</span>
            <span role="columnheader">Estado</span>
            {completo && <span role="columnheader">Mesa</span>}
            <span role="columnheader">Contacto</span>
          </div>

          {visibles.map((i, n) => {
            const g = i.grupo.trim();
            const cabecera = orden === "grupo" && (n === 0 || visibles[n - 1].grupo.trim() !== g);
            const totalGrupo = cabecera ? visibles.filter((x) => x.grupo.trim() === g).reduce((t, x) => t + esperadas(x), 0) : 0;
            const wa = whatsapp(i);

            return (
              <div key={i.id} className="pnl-tabla__bloque">
                {cabecera && (
                  <div className="pnl-tabla__grupo" role="row">
                    <span>{g || "Sin grupo"}</span>
                    <span className="pnl-num">{totalGrupo} {totalGrupo === 1 ? "persona" : "personas"}</span>
                  </div>
                )}

                <div className={`pnl-tabla__fila pnl-tabla__fila--${i.estado}`} role="row" aria-expanded={abierto === i.id}>
                  <button className="pnl-tabla__nombre" role="cell" onClick={() => setAbierto(abierto === i.id ? null : i.id)}>
                    <span className={`pnl-punto pnl-punto--${i.estado}`} aria-hidden />
                    <span className="pnl-tabla__nombre-texto">{i.nombre}</span>
                    {i.origen === "rsvp" && <span className="pnl-marca" title="Llegó confirmando por la invitación">invitación</span>}
                    {i.comidas.some((c) => c !== "Sin restricciones") && (
                      <span className="pnl-marca pnl-marca--suave" title={i.comidas.join(", ")}>
                        {i.comidas.filter((c) => c !== "Sin restricciones").length > 1 ? "menús" : i.comidas.find((c) => c !== "Sin restricciones")}
                      </span>
                    )}
                  </button>
                  <span role="cell" className="pnl-tabla__grupo-celda">{g || <span className="pnl-tenue">—</span>}</span>
                  <span role="cell" className="pnl-der pnl-num">{i.personas}</span>
                  <span role="cell">
                    <select
                      className={`pnl-estado pnl-estado--${i.estado}`}
                      value={i.estado}
                      onChange={(e) => editar(i.id, { estado: e.target.value as Estado, ...(e.target.value === "no-viene" ? { mesa: null } : {}) })}
                      aria-label={`Estado de ${i.nombre}`}
                    >
                      {ESTADOS.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </span>
                  {completo && (
                    <span role="cell">
                      <select
                        className="pnl-estado"
                        value={i.mesa ?? ""}
                        disabled={i.estado === "no-viene"}
                        onChange={(e) => editar(i.id, { mesa: e.target.value || null })}
                        aria-label={`Mesa de ${i.nombre}`}
                      >
                        <option value="">{mesas.length ? "Sin mesa" : "—"}</option>
                        {mesas.map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.nombre} · {ocup.get(x.id) ?? 0}/{x.capacidad}
                          </option>
                        ))}
                      </select>
                    </span>
                  )}
                  <span role="cell" className="pnl-tabla__contacto">
                    {wa ? (
                      <a className="pnl-enlace" href={wa} target="_blank" rel="noreferrer">
                        {i.estado === "pendiente" ? "Recordar" : "WhatsApp"}
                      </a>
                    ) : (
                      <button className="pnl-enlace pnl-tenue" onClick={() => setAbierto(i.id)}>
                        + teléfono
                      </button>
                    )}
                  </span>
                </div>

                {abierto === i.id && (
                  <Ficha
                    inv={i}
                    candidatos={doc.invitados.filter((x) => x.id !== i.id && x.origen === "manual" && !x.rsvp)}
                    editar={(c) => editar(i.id, c)}
                    borrar={() => { borrar(i); setAbierto(null); }}
                    unirCon={(destino) => { unir(i, destino); setAbierto(null); }}
                    cerrar={() => setAbierto(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Alta rápida ──────────────────────────────────────────────────
   Pensada para cargar una familia entera de corrido: después de agregar, el
   foco vuelve al nombre y el grupo queda puesto. */

function Alta({ grupos, onAgregar, onPegar }: { grupos: string[]; onAgregar: (i: Invitado) => void; onPegar: () => void }) {
  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState("");
  const [personas, setPersonas] = useState(1);
  const [telefono, setTelefono] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 2) return;
    onAgregar(nuevo({ nombre: nombre.trim(), grupo: grupo.trim(), personas, telefono: telefono.trim() }));
    setNombre("");
    setPersonas(1);
    setTelefono("");
    ref.current?.focus();
  };

  return (
    <form className="pnl-alta" onSubmit={enviar}>
      <label className="pnl-campo pnl-alta__nombre">
        <span>Nombre</span>
        <input ref={ref} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Tía Marta" maxLength={80} />
      </label>
      <label className="pnl-campo">
        <span>Grupo o familia</span>
        <input value={grupo} onChange={(e) => setGrupo(e.target.value)} list="pnl-grupos" placeholder="Ej: Familia Gómez" maxLength={60} />
        <datalist id="pnl-grupos">
          {grupos.map((g) => <option key={g} value={g} />)}
        </datalist>
      </label>
      <label className="pnl-campo pnl-alta__corto">
        <span>Personas</span>
        <input type="number" min={1} max={30} value={personas} onChange={(e) => setPersonas(Math.max(1, Number(e.target.value) || 1))} />
      </label>
      <label className="pnl-campo">
        <span>Teléfono</span>
        <input value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="tel" placeholder="Opcional" maxLength={30} />
      </label>
      <div className="pnl-alta__botones">
        <button className="pnl-btn pnl-btn--lleno" type="submit">Agregar</button>
        <button className="pnl-btn" type="button" onClick={onPegar}>Pegar lista</button>
      </div>
    </form>
  );
}

function Pegar({ onCerrar, onAgregar }: { onCerrar: () => void; onAgregar: (l: Invitado[]) => void }) {
  const [texto, setTexto] = useState("");
  const [grupo, setGrupo] = useState("");
  const lista = parsearLista(texto, grupo.trim());
  const personas = lista.reduce((t, i) => t + i.personas, 0);

  return (
    <div className="pnl-pegar">
      <div className="pnl-pegar__cabeza">
        <p className="pnl-pegar__titulo">Pegar una lista</p>
        <button className="pnl-enlace" onClick={onCerrar}>Cerrar</button>
      </div>
      <p className="pnl-nota">
        Una persona o familia por renglón. Si al lado va el grupo, la cantidad o el teléfono, separalos con coma:
        <code> Tía Marta, Familia Gómez, 4</code>. También entiende <code>Los Ruiz (5)</code>.
      </p>
      <textarea className="pnl-textarea" rows={8} value={texto} onChange={(e) => setTexto(e.target.value)} autoFocus placeholder={"Juan Pérez\nTía Marta, Familia Gómez, 4\nLos Ruiz (5), 11 5555 1234"} />
      <div className="pnl-pegar__pie">
        <label className="pnl-campo">
          <span>Grupo para los que no traen</span>
          <input value={grupo} onChange={(e) => setGrupo(e.target.value)} list="pnl-grupos" placeholder="Opcional" />
        </label>
        <button className="pnl-btn pnl-btn--lleno" disabled={!lista.length} onClick={() => onAgregar(lista)}>
          {lista.length ? `Agregar ${lista.length} ${lista.length === 1 ? "fila" : "filas"} · ${personas} pers.` : "Agregar"}
        </button>
      </div>
    </div>
  );
}

/* ── Ficha de un invitado ──────────────────────────────────── */

type FichaProps = {
  inv: Invitado;
  candidatos: Invitado[];
  editar: (c: Partial<Invitado>) => void;
  borrar: () => void;
  unirCon: (destino: Invitado) => void;
  cerrar: () => void;
};

function Ficha({ inv, candidatos, editar, borrar, unirCon, cerrar }: FichaProps) {
  const [seguro, setSeguro] = useState(false);

  return (
    <div className="pnl-ficha">
      <div className="pnl-ficha__campos">
        <label className="pnl-campo">
          <span>Nombre</span>
          <input value={inv.nombre} onChange={(e) => editar({ nombre: e.target.value })} maxLength={80} />
        </label>
        <label className="pnl-campo">
          <span>Grupo o familia</span>
          <input value={inv.grupo} onChange={(e) => editar({ grupo: e.target.value })} list="pnl-grupos" maxLength={60} />
        </label>
        <label className="pnl-campo pnl-alta__corto">
          <span>Personas</span>
          <input type="number" min={1} max={30} value={inv.personas} onChange={(e) => editar({ personas: Math.max(1, Number(e.target.value) || 1) })} />
        </label>
        <label className="pnl-campo">
          <span>Teléfono</span>
          <input value={inv.telefono} onChange={(e) => editar({ telefono: e.target.value })} inputMode="tel" maxLength={30} />
        </label>
      </div>

      <fieldset className="pnl-ficha__comidas">
        <legend>Comidas</legend>
        {COMIDAS.map((c) => (
          <label key={c} className="pnl-check">
            <input
              type="checkbox"
              checked={inv.comidas.includes(c)}
              onChange={(e) => editar({ comidas: e.target.checked ? [...inv.comidas, c] : inv.comidas.filter((x) => x !== c) })}
            />
            {c}
          </label>
        ))}
      </fieldset>

      <label className="pnl-campo">
        <span>Notas</span>
        <textarea className="pnl-textarea" rows={2} value={inv.notas} onChange={(e) => editar({ notas: e.target.value })} maxLength={300} placeholder="Ej: va con silla de ruedas, llega después de la ceremonia" />
      </label>

      {(inv.cancion || inv.rsvp) && (
        <p className="pnl-nota">
          {inv.rsvp && <>Confirmó por la invitación el {new Date(inv.rsvp).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}. </>}
          {inv.cancion && <>Pidió: <i>{inv.cancion}</i></>}
        </p>
      )}

      <div className="pnl-ficha__pie">
        {inv.origen === "rsvp" && candidatos.length > 0 && (
          <label className="pnl-campo pnl-ficha__unir">
            <span>Es alguien que ya tenía cargado</span>
            <select className="pnl-select" value="" onChange={(e) => { const d = candidatos.find((c) => c.id === e.target.value); if (d) unirCon(d); }}>
              <option value="">Unir con…</option>
              {candidatos.map((c) => <option key={c.id} value={c.id}>{c.nombre}{c.grupo ? ` · ${c.grupo}` : ""}</option>)}
            </select>
          </label>
        )}
        <div className="pnl-ficha__botones">
          {seguro ? (
            <>
              <span className="pnl-nota">¿Seguro?</span>
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
