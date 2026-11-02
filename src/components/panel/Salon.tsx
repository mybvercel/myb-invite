"use client";

import { useEffect, useState } from "react";
import {
  area,
  CATALOGO,
  CLASES_ESTRUCTURA,
  CLASES_MESA,
  CLASES_ZONA,
  capacidadSugerida,
  distribuirMesas,
  encerrar,
  idNuevo,
  metricas,
  nuevoElemento,
  ocupacion,
  siguienteNumero,
  ubicarLibre,
} from "@/panel/logica";
import type { Clase, DocPanel, Elemento, Salon as TSalon } from "@/panel/tipos";
import { Asistente } from "./Asistente";
import type { Cambiar } from "./Panel";
import { Cifra, EditorEtiquetas } from "./piezas";
import { Plano } from "./Plano";

const m2 = (n: number) => `${Math.round(n)}`;
const dec = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");
const leer = (s: string) => Number(s.replace(",", "."));

/**
 * Lo copiado vive fuera del componente: sobrevive a cambiar de pestaña, así
 * se puede copiar en Salón, ir a Mesas y volver a pegar.
 */
let portapapeles: Elemento[] = [];

/** Copias listas para pegar: ids nuevos, mesas con número nuevo y sin familias. */
function clonar(els: Elemento[], salon: TSalon, dx: number, dy: number) {
  let actual = salon;
  const nuevos: Elemento[] = [];
  for (const e of els) {
    const c: Elemento = { ...e, id: idNuevo(), x: e.x + dx, y: e.y + dy };
    if (c.tipo === "mesa") {
      c.nombre = `Mesa ${siguienteNumero(actual)}`;
      c.etiquetas = [];
      c.principal = false;
    }
    const final = encerrar(c, actual);
    nuevos.push(final);
    actual = { ...actual, elementos: [...actual.elementos, final] };
  }
  // Uno solo que cae encima de algo: al lugar libre más cercano.
  if (nuevos.length === 1) {
    const libre = ubicarLibre(nuevos[0], salon);
    if (libre) nuevos[0] = libre;
  }
  return nuevos;
}

const ATAJOS: [string, string][] = [
  ["Arrastrar", "Mover (si hay varios elegidos, se mueven juntos)"],
  ["Shift / Ctrl + clic", "Sumar o sacar de la selección"],
  ["Arrastrar sobre el piso", "Elegir varios con un recuadro"],
  ["Ctrl + A", "Elegir todo"],
  ["Ctrl + C / X / V", "Copiar, cortar y pegar"],
  ["Ctrl + D", "Duplicar"],
  ["Ctrl + Z", "Deshacer"],
  ["Ctrl + Shift + Z o Ctrl + Y", "Rehacer"],
  ["Flechas", "Mover 25 cm (con Shift, 1 m)"],
  ["R", "Girar"],
  ["Supr", "Borrar"],
  ["Esc", "Soltar la selección"],
];

export function Salon({ doc, cambiar, seleccionInicial }: { doc: DocPanel; cambiar: Cambiar; seleccionInicial?: string }) {
  const [sel, setSel] = useState<Set<string>>(() => new Set(seleccionInicial ? [seleccionInicial] : []));
  const [zoom, setZoom] = useState(1);
  const [aviso, setAviso] = useState("");
  const [estado, setEstado] = useState("");
  const [verAtajos, setVerAtajos] = useState(false);
  const { salon } = doc;
  const m = metricas(doc);
  const elegidos = salon.elementos.filter((e) => sel.has(e.id));
  const elegido = elegidos.length === 1 ? elegidos[0] : null;

  const faltanLugares = Math.max(0, m.esperados - m.lugares);
  const [cuantas, setCuantas] = useState(Math.max(1, Math.ceil(faltanLugares / 10)) || 1);
  const [forma, setForma] = useState<Clase>("redonda");

  const elegir = (ids: string[]) => setSel(new Set(ids));
  const avisar = (t: string) => {
    setEstado(t);
    window.setTimeout(() => setEstado((e) => (e === t ? "" : e)), 2200);
  };

  const ponerSalon = (s: Partial<TSalon>) =>
    cambiar((d) => {
      const nuevo = { ...d.salon, ...s };
      // Si el salón se achica, nada queda afuera.
      return { ...d, salon: { ...nuevo, elementos: nuevo.elementos.map((e) => encerrar(e, nuevo)) } };
    }, "salon-medidas");

  const ponerElementos = (els: Elemento[], clave?: string) => {
    const porId = new Map(els.map((e) => [e.id, e]));
    cambiar((d) => ({ ...d, salon: { ...d.salon, elementos: d.salon.elementos.map((x) => porId.get(x.id) ?? x) } }), clave);
  };

  const editar = (cambios: Partial<Elemento>, campo: string) => {
    if (!elegido) return;
    const e = { ...elegido, ...cambios };
    if (e.clase === "redonda") e.largo = e.ancho;
    ponerElementos([encerrar(e, salon)], `campo:${elegido.id}:${campo}`);
  };

  const sumar = (nuevos: Elemento[]) => {
    cambiar((d) => ({ ...d, salon: { ...d.salon, elementos: [...d.salon.elementos, ...nuevos] } }));
    elegir(nuevos.map((e) => e.id));
  };

  const agregar = (clase: Clase) => sumar([nuevoElemento(clase, salon)]);

  const quitar = (ids: Set<string>) => {
    if (!ids.size) return;
    cambiar((d) => ({
      ...d,
      salon: { ...d.salon, elementos: d.salon.elementos.filter((e) => !ids.has(e.id)) },
      // Los que estaban en esas mesas quedan sin lugar, no en una mesa fantasma.
      invitados: d.invitados.map((i) => (i.mesa && ids.has(i.mesa) ? { ...i, mesa: null } : i)),
    }));
    setSel(new Set());
  };

  const copiar = () => {
    if (!elegidos.length) return false;
    portapapeles = elegidos.map((e) => ({ ...e }));
    avisar(`${elegidos.length === 1 ? "Copiado" : `${elegidos.length} copiados`}`);
    return true;
  };

  const pegar = () => {
    if (!portapapeles.length) return;
    sumar(clonar(portapapeles, salon, 1, 1));
    // La próxima vez se pega un poco más allá, no encima de la anterior.
    portapapeles = portapapeles.map((e) => ({ ...e, x: e.x + 1, y: e.y + 1 }));
  };

  const duplicar = () => elegidos.length && sumar(clonar(elegidos, salon, 1, 1));

  const girar = () => ponerElementos(elegidos.map((e) => encerrar({ ...e, giro: e.giro ? 0 : 90 }, salon)));

  /** Alinear en fila, en columna, o repartir parejo entre los extremos. */
  const acomodar = (modo: "fila" | "columna" | "repartir") => {
    if (elegidos.length < 2) return;
    const prom = (f: (e: Elemento) => number) => elegidos.reduce((t, e) => t + f(e), 0) / elegidos.length;
    if (modo === "fila") return ponerElementos(elegidos.map((e) => encerrar({ ...e, y: prom((x) => x.y) }, salon)));
    if (modo === "columna") return ponerElementos(elegidos.map((e) => encerrar({ ...e, x: prom((x) => x.x) }, salon)));
    const xs = elegidos.map((e) => e.x);
    const ys = elegidos.map((e) => e.y);
    const horizontal = Math.max(...xs) - Math.min(...xs) >= Math.max(...ys) - Math.min(...ys);
    const orden = [...elegidos].sort((a, b) => (horizontal ? a.x - b.x : a.y - b.y));
    const a = horizontal ? orden[0].x : orden[0].y;
    const b = horizontal ? orden.at(-1)!.x : orden.at(-1)!.y;
    ponerElementos(orden.map((e, i) => {
      const v = a + ((b - a) * i) / (orden.length - 1);
      return encerrar(horizontal ? { ...e, x: v } : { ...e, y: v }, salon);
    }));
  };

  const distribuir = () => {
    const r = distribuirMesas(salon, cuantas, forma);
    cambiar((d) => ({ ...d, salon: r.salon }));
    setAviso(r.puestas === cuantas ? `Listo: ${r.puestas} mesas ubicadas en el espacio libre.` : `Entraron ${r.puestas} de ${cuantas}. No queda lugar libre con pasillos de 90 cm.`);
  };

  // Atajos del plano. Deshacer y rehacer los maneja el panel entero.
  useEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      const ctrl = ev.ctrlKey || ev.metaKey;
      const k = ev.key.toLowerCase();

      if (ctrl && k === "a") {
        ev.preventDefault();
        elegir(salon.elementos.map((e) => e.id));
      } else if (ctrl && k === "c") {
        if (copiar()) ev.preventDefault();
      } else if (ctrl && k === "x") {
        if (copiar()) {
          ev.preventDefault();
          quitar(new Set(sel));
        }
      } else if (ctrl && k === "v") {
        if (portapapeles.length) {
          ev.preventDefault();
          pegar();
        }
      } else if (ctrl && k === "d") {
        ev.preventDefault();
        duplicar();
      } else if (!ctrl && ev.key === "?") {
        setVerAtajos((v) => !v);
      } else if (!elegidos.length || ctrl) {
        return;
      } else if (ev.key.startsWith("Arrow")) {
        ev.preventDefault();
        const p = ev.shiftKey ? 1 : 0.25;
        const [dx, dy] = { ArrowLeft: [-p, 0], ArrowRight: [p, 0], ArrowUp: [0, -p], ArrowDown: [0, p] }[ev.key] ?? [0, 0];
        ponerElementos(elegidos.map((e) => encerrar({ ...e, x: e.x + dx, y: e.y + dy }, salon)), "flechas");
      } else if (k === "r") {
        girar();
      } else if (ev.key === "Delete" || ev.key === "Backspace") {
        ev.preventDefault();
        quitar(new Set(sel));
      } else if (ev.key === "Escape") {
        setSel(new Set());
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  const porPersona = m.esperados ? m.areaInterior / m.esperados : 0;

  return (
    <div className="pnl-seccion">
      <Asistente doc={doc} cambiar={cambiar} />

      <div className="pnl-salon__medidas">
        <label className="pnl-campo pnl-alta__corto">
          <span>Ancho (m)</span>
          <input type="number" min={4} max={200} step={0.5} value={salon.ancho} onChange={(e) => ponerSalon({ ancho: Math.min(200, Math.max(4, leer(e.target.value) || 4)) })} />
        </label>
        <span className="pnl-salon__por" aria-hidden>×</span>
        <label className="pnl-campo pnl-alta__corto">
          <span>Largo (m)</span>
          <input type="number" min={4} max={200} step={0.5} value={salon.largo} onChange={(e) => ponerSalon({ largo: Math.min(200, Math.max(4, leer(e.target.value) || 4)) })} />
        </label>
        <div className="pnl-cifras pnl-cifras--chicas">
          <Cifra valor={m2(m.areaTotal)} etiqueta="m² totales" fuerte />
          <Cifra valor={m2(m.areaInterior)} etiqueta="m² adentro" />
          <Cifra valor={m2(m.areaExterior)} etiqueta="m² afuera" />
          <Cifra valor={m2(m.areaEstructuras)} etiqueta="m² ocupados" />
          <Cifra valor={m2(m.areaLibre)} etiqueta="m² libres" />
          <Cifra valor={porPersona ? dec(porPersona) : "—"} etiqueta="m² por persona" />
        </div>
      </div>

      <div className="pnl-salon">
        <aside className="pnl-salon__paleta" aria-label="Agregar al plano">
          <Grupo titulo="Mesas" clases={CLASES_MESA} onAgregar={agregar} />
          <Grupo titulo="Estructuras" clases={CLASES_ESTRUCTURA} onAgregar={agregar} />
          <Grupo titulo="Zonas" clases={CLASES_ZONA} onAgregar={agregar} />

          <div className="pnl-salon__auto">
            <p className="pnl-rotulo">Ubicar mesas solas</p>
            <p className="pnl-nota">
              {m.esperados ? `Esperás ${m.esperados} personas y hay ${m.lugares} lugares.` : "Cuando cargues invitados, te digo cuántas hacen falta."}
            </p>
            <div className="pnl-salon__auto-fila">
              <input className="pnl-input-chico" type="number" min={1} max={80} value={cuantas} onChange={(e) => setCuantas(Math.min(80, Math.max(1, Number(e.target.value) || 1)))} aria-label="Cantidad de mesas" />
              <select className="pnl-select" value={forma} onChange={(e) => setForma(e.target.value as Clase)} aria-label="Forma">
                {CLASES_MESA.map((c) => <option key={c} value={c}>{CATALOGO[c].nombre.replace("Mesa ", "")}</option>)}
              </select>
              <button className="pnl-btn pnl-btn--lleno" onClick={distribuir}>Ubicar</button>
            </div>
            {aviso && <p className="pnl-nota" role="status">{aviso}</p>}
          </div>
        </aside>

        <div className="pnl-salon__lienzo">
          <div className="pnl-salon__barra">
            <span className="pnl-nota" role="status">
              {estado || (elegidos.length > 1 ? `${elegidos.length} elegidos: arrastrá uno y se mueven todos` : "Arrastrá para mover · Shift+clic o recuadro para elegir varios")}
            </span>
            <div className="pnl-salon__barra-der">
              <button className="pnl-enlace" onClick={() => setVerAtajos((v) => !v)} aria-expanded={verAtajos}>Atajos</button>
              <div className="pnl-filtros" role="group" aria-label="Zoom">
                {[1, 1.5, 2].map((z) => (
                  <button key={z} className="pnl-filtro" aria-pressed={zoom === z} onClick={() => setZoom(z)}>
                    {String(z).replace(".", ",")}×
                  </button>
                ))}
              </div>
            </div>
          </div>
          {verAtajos && (
            <dl className="pnl-atajos">
              {ATAJOS.map(([k, v]) => (
                <div key={k}>
                  <dt><kbd>{k}</kbd></dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="pnl-salon__marco">
            <div style={{ width: `${zoom * 100}%` }}>
              <Plano
                salon={salon}
                ocupacion={ocupacion(doc.invitados)}
                seleccion={sel}
                onSeleccionar={(id, sumando) => {
                  if (!id) return setSel(new Set());
                  if (!sumando) return elegir([id]);
                  const s = new Set(sel);
                  if (s.has(id)) s.delete(id);
                  else s.add(id);
                  setSel(s);
                }}
                onSeleccionarVarios={(ids, sumando) => setSel(new Set(sumando ? [...sel, ...ids] : ids))}
                onMover={(e) => ponerElementos([e], `mover:${e.id}`)}
                onMoverVarios={(els) => ponerElementos(els, "mover-grupo")}
              />
            </div>
          </div>
          {salon.elementos.length === 0 && (
            <p className="pnl-nota pnl-nota--centro">
              Contale al asistente cómo es el salón, o empezá por las medidas, después lo que no se mueve (pista, barra, escenario, baños) y al final las mesas.
            </p>
          )}
        </div>

        {elegidos.length > 1 && (
          <aside className="pnl-salon__props" aria-label="Varios elegidos">
            <div className="pnl-pegar__cabeza">
              <p className="pnl-rotulo">{elegidos.length} elegidos</p>
              <button className="pnl-enlace" onClick={() => setSel(new Set())}>Soltar</button>
            </div>
            <p className="pnl-nota">
              {elegidos.filter((e) => e.tipo === "mesa").length} mesas · {elegidos.reduce((t, e) => t + (e.capacidad ?? 0), 0)} sillas
            </p>
            <div className="pnl-salon__botones">
              <button className="pnl-btn" onClick={() => acomodar("fila")}>Alinear en fila</button>
              <button className="pnl-btn" onClick={() => acomodar("columna")}>Alinear en columna</button>
              <button className="pnl-btn" onClick={() => acomodar("repartir")}>Repartir parejo</button>
            </div>
            <div className="pnl-ficha__botones">
              <button className="pnl-btn" onClick={girar}>Girar</button>
              <button className="pnl-btn" onClick={() => copiar()}>Copiar</button>
              <button className="pnl-btn" onClick={duplicar}>Duplicar</button>
              <button className="pnl-btn pnl-btn--peligro" onClick={() => quitar(new Set(sel))}>Quitar</button>
            </div>
          </aside>
        )}

        {elegido && (
          <aside className="pnl-salon__props" aria-label={`Editar ${elegido.nombre}`}>
            <div className="pnl-pegar__cabeza">
              <p className="pnl-rotulo">{CATALOGO[elegido.clase].nombre}</p>
              <button className="pnl-enlace" onClick={() => setSel(new Set())}>Cerrar</button>
            </div>
            <label className="pnl-campo">
              <span>Nombre</span>
              <input value={elegido.nombre} onChange={(e) => editar({ nombre: e.target.value }, "nombre")} maxLength={40} />
            </label>
            <div className="pnl-salon__dos">
              <label className="pnl-campo">
                <span>{elegido.clase === "redonda" ? "Diámetro (m)" : "Ancho (m)"}</span>
                <input type="number" min={0.3} step={0.1} value={elegido.ancho} onChange={(e) => editar({ ancho: Math.max(0.3, leer(e.target.value) || 0.3) }, "ancho")} />
              </label>
              {elegido.clase !== "redonda" && (
                <label className="pnl-campo">
                  <span>Largo (m)</span>
                  <input type="number" min={0.3} step={0.1} value={elegido.largo} onChange={(e) => editar({ largo: Math.max(0.3, leer(e.target.value) || 0.3) }, "largo")} />
                </label>
              )}
            </div>
            {elegido.tipo === "mesa" && (
              <>
                <label className="pnl-campo">
                  <span>
                    Sillas <span className="pnl-tenue">· entran {capacidadSugerida(elegido.clase, elegido.ancho, elegido.largo)}</span>
                  </span>
                  <input type="number" min={1} max={60} value={elegido.capacidad ?? 0} onChange={(e) => editar({ capacidad: Math.min(60, Math.max(1, Number(e.target.value) || 1)) }, "capacidad")} />
                </label>
                <div className="pnl-campo">
                  <span>Familias de esta mesa</span>
                  <EditorEtiquetas
                    etiquetas={elegido.etiquetas ?? []}
                    grupos={[...new Set(doc.invitados.map((i) => i.grupo.trim()).filter(Boolean))]}
                    onCambiar={(e) => editar({ etiquetas: e }, "etiquetas")}
                  />
                </div>
                <label className="pnl-check">
                  <input
                    type="checkbox"
                    checked={!!elegido.principal}
                    onChange={(e) =>
                      cambiar((d) => ({
                        ...d,
                        salon: {
                          ...d.salon,
                          elementos: d.salon.elementos.map((x) =>
                            x.id === elegido.id ? { ...x, principal: e.target.checked } : e.target.checked && x.tipo === "mesa" ? { ...x, principal: false } : x,
                          ),
                        },
                      }))
                    }
                  />
                  Mesa principal
                </label>
                {(() => {
                  const aca = doc.invitados.filter((i) => i.mesa === elegido.id && i.estado !== "no-viene");
                  return aca.length ? (
                    <ul className="pnl-mesa__lista">
                      {aca.map((i) => (
                        <li key={i.id}>
                          <span>{i.nombre}{i.personas > 1 && <span className="pnl-tenue"> ×{i.personas}</span>}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null;
                })()}
              </>
            )}
            <p className="pnl-nota">
              {dec(area(elegido))} m² {elegido.tipo === "mesa" && `· ${ocupacion(doc.invitados).get(elegido.id) ?? 0} sentados`}
            </p>
            <div className="pnl-ficha__botones">
              {elegido.clase !== "redonda" && <button className="pnl-btn" onClick={girar}>Girar</button>}
              <button className="pnl-btn" onClick={() => copiar()}>Copiar</button>
              <button className="pnl-btn" onClick={duplicar}>Duplicar</button>
              <button className="pnl-btn pnl-btn--peligro" onClick={() => quitar(new Set([elegido.id]))}>Quitar</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Grupo({ titulo, clases, onAgregar }: { titulo: string; clases: Clase[]; onAgregar: (c: Clase) => void }) {
  return (
    <div className="pnl-salon__grupo">
      <p className="pnl-rotulo">{titulo}</p>
      <div className="pnl-salon__botones">
        {clases.map((c) => (
          <button key={c} className="pnl-chip" onClick={() => onAgregar(c)}>
            + {CATALOGO[c].nombre.replace(/^Mesa (redonda|rectangular|imperial)$/, (_, f: string) => f[0].toUpperCase() + f.slice(1))}
          </button>
        ))}
      </div>
    </div>
  );
}
