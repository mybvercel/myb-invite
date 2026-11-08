"use client";

import { useMemo, useState } from "react";
import { afinidadesRotas, conMiembro, metricas, miembrosDe, nombrePorEtiquetas, norm, novedades, nuevoElemento, ocupacion, ocupantes, porSentar, sentar } from "@/panel/logica";
import type { Ajustes, DocPanel, Elemento, Invitado, Miembro } from "@/panel/tipos";
import type { Cambiar } from "./Panel";
import { Cifra, EditorEtiquetas } from "./piezas";
import { Plano } from "./Plano";

/** Lo que se sienta de una vez: una familia entera, una fila suelta, o una sola persona. */
type Unidad = {
  clave: string;
  nombre: string;
  personas: number;
  ids: string[];
  nuevo: boolean;
  /** Las personas de la unidad que todavía no tienen mesa. */
  gente?: { inv: string; miembro: Miembro }[];
  /** Si es una sola persona: de qué fila es y cuál. */
  miembro?: { inv: string; id: string };
};

const iniciales = (n: string) =>
  n
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "?";

/** Una persona, como ficha chica: sus iniciales y su nombre. Se toca para elegirla o se arrastra. */
function Persona({ m, elegida, onElegir, onArrastrar, onQuitar }: { m: Miembro; elegida?: boolean; onElegir: () => void; onArrastrar: () => void; onQuitar?: () => void }) {
  return (
    <span className={`pnl-persona${elegida ? " es-elegida" : ""}${m.mesa ? " es-aparte" : ""}`}>
      <button
        className="pnl-persona__cuerpo"
        aria-pressed={!!elegida}
        draggable
        onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData("text/plain", m.id); onArrastrar(); }}
        onClick={(e) => { e.stopPropagation(); onElegir(); }}
        title={m.mesa ? "Sentada aparte de su familia" : "Tocala y después tocá una mesa"}
      >
        <span className="pnl-persona__ini" aria-hidden>{iniciales(m.nombre)}</span>
        <span className="pnl-persona__nombre">{m.nombre || "Sin nombre"}</span>
      </button>
      {onQuitar && (
        <button className="pnl-quitar" onClick={(e) => { e.stopPropagation(); onQuitar(); }} aria-label={`Volver a sentar a ${m.nombre} con su familia`} title="Volver con su familia">×</button>
      )}
    </span>
  );
}

function unidadesSinMesa(invitados: Invitado[], nuevos: Set<string>): Unidad[] {
  const mapa = new Map<string, Unidad>();
  for (const i of invitados) {
    if (i.mesa || porSentar(i) === 0) continue;
    const g = i.grupo.trim();
    const clave = g ? "g:" + norm(g) : "i:" + i.id;
    const u = mapa.get(clave) ?? { clave, nombre: g || i.nombre, personas: 0, ids: [], nuevo: false, gente: [] };
    u.personas += porSentar(i);
    u.ids.push(i.id);
    u.nuevo ||= nuevos.has(i.id);
    u.gente!.push(...miembrosDe(i).filter((m) => !m.mesa).map((miembro) => ({ inv: i.id, miembro })));
    mapa.set(clave, u);
  }
  // Los recién confirmados arriba: son los que hay que ubicar ahora.
  return [...mapa.values()].sort((a, b) => Number(b.nuevo) - Number(a.nuevo) || b.personas - a.personas);
}

/** La principal primero; el resto por número y después por nombre. */
const ordenMesas = (a: Elemento, b: Elemento) =>
  Number(!!b.principal) - Number(!!a.principal) ||
  (Number(a.nombre.match(/\d+/)?.[0] ?? 999) - Number(b.nombre.match(/\d+/)?.[0] ?? 999)) ||
  a.nombre.localeCompare(b.nombre);

/**
 * Las mesas. Son las mismas del plano del salón: agregar una acá la pone en el
 * plano, y ponerla en el plano la trae acá.
 *
 * Se sienta tocando una familia y después la mesa (en la lista o en el plano),
 * o arrastrando en la compu. Todo lo automático es opcional.
 */
export function Mesas({ doc, cambiar, irASalon }: { doc: DocPanel; cambiar: Cambiar; irASalon: (id?: string) => void }) {
  const [elegida, setElegida] = useState<Unidad | null>(null);
  const [sobre, setSobre] = useState<string | null>(null);
  const [resaltada, setResaltada] = useState<string | null>(null);
  const [verPlano, setVerPlano] = useState(true);
  const [resultado, setResultado] = useState("");
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());

  const m = metricas(doc);
  const mesas = doc.salon.elementos.filter((e) => e.tipo === "mesa").sort(ordenMesas);
  const ocup = ocupacion(doc.invitados);
  const nuevos = useMemo(() => new Set(novedades(doc).map((i) => i.id)), [doc]);
  const unidades = unidadesSinMesa(doc.invitados, nuevos);
  const rotas = afinidadesRotas(doc);
  const nombreMesaDe = (id: string | null) => mesas.find((x) => x.id === id)?.nombre ?? "la misma mesa";
  const grupos = [...new Set(doc.invitados.map((i) => i.grupo.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const asignar = (ids: string[], mesa: string | null) =>
    cambiar((d) => ({ ...d, invitados: d.invitados.map((i) => (ids.includes(i.id) ? { ...i, mesa } : i)) }));

  /** Una sola persona a una mesa, aparte de su familia. Con null vuelve con ella. */
  const asignarPersona = (inv: string, miembro: string, mesa: string | null) =>
    cambiar((d) => ({ ...d, invitados: d.invitados.map((i) => (i.id === inv ? conMiembro(i, miembro, { mesa }) : i)) }));

  const unidadDePersona = (inv: Invitado, m: Miembro): Unidad => ({
    clave: "p:" + m.id,
    nombre: m.nombre || inv.nombre,
    personas: 1,
    ids: [inv.id],
    nuevo: false,
    miembro: { inv: inv.id, id: m.id },
  });

  const alternar = (clave: string) =>
    setAbiertas((a) => {
      const n = new Set(a);
      if (n.has(clave)) n.delete(clave);
      else n.add(clave);
      return n;
    });

  const editarMesa = (id: string, c: Partial<Elemento>) =>
    cambiar((d) => ({
      ...d,
      salon: {
        ...d.salon,
        // Una sola principal: marcar otra desmarca la anterior.
        elementos: d.salon.elementos.map((e) => (e.id === id ? { ...e, ...c } : c.principal && e.tipo === "mesa" ? { ...e, principal: false } : e)),
      },
    }));

  const ponerAjuste = (a: Partial<Ajustes>) => cambiar((d) => ({ ...d, ajustes: { ...d.ajustes, ...a } }));

  const soltarEn = (mesa: string, u: Unidad | null) => {
    if (!u) return;
    if (u.miembro) asignarPersona(u.miembro.inv, u.miembro.id, mesa);
    else asignar(u.ids, mesa);
    setElegida(null);
    setResaltada(mesa);
  };

  const automatico = (rehacer: boolean) => {
    const r = sentar(doc.invitados, doc.salon, rehacer, doc.ajustes.porEtiqueta, doc.afinidades);
    cambiar((d) => ({ ...d, invitados: r.invitados }));
    const partes = [
      r.partidos ? `${r.partidos} ${r.partidos === 1 ? "familia no entraba entera y quedó repartida" : "familias no entraban enteras y quedaron repartidas"}` : "",
      r.sinLugar ? `${r.sinLugar} ${r.sinLugar === 1 ? "persona sigue" : "personas siguen"} sin lugar: faltan mesas` : "",
    ].filter(Boolean);
    setResultado(partes.length ? partes.join(". ") + "." : "Todos sentados, cada familia en su mesa.");
  };

  const agregarMesa = () => {
    const nueva = nuevoElemento("redonda", doc.salon);
    cambiar((d) => ({ ...d, salon: { ...d.salon, elementos: [...d.salon.elementos, nueva] } }));
    setResaltada(nueva.id);
  };

  /** Tocar una mesa en el plano: si hay familia elegida, la sienta; si no, la busca en la lista. */
  const tocarEnPlano = (id: string | null) => {
    if (!id) return setResaltada(null);
    const e = doc.salon.elementos.find((x) => x.id === id);
    if (e?.tipo !== "mesa") return;
    if (elegida) soltarEn(id, elegida);
    else {
      setResaltada(id);
      document.getElementById(`pnl-mesa-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const ajustes = (
    <fieldset className="pnl-ajustes">
      <legend className="pnl-rotulo">Cuando alguien confirma</legend>
      <label className="pnl-check">
        <input type="checkbox" checked={doc.ajustes.porEtiqueta} onChange={(e) => ponerAjuste({ porEtiqueta: e.target.checked })} />
        <span>Si es de una familia con mesa etiquetada, sentarlo en esa mesa</span>
      </label>
      <label className="pnl-check">
        <input type="checkbox" checked={doc.ajustes.autoSentar} onChange={(e) => ponerAjuste({ autoSentar: e.target.checked })} />
        <span>Si no, buscarle solo una mesa con lugar</span>
      </label>
      <p className="pnl-nota">
        {doc.ajustes.porEtiqueta || doc.ajustes.autoSentar
          ? "Igual te aviso quién se anotó y dónde quedó, y lo podés mover."
          : "Apagado: te aviso quién se anotó y lo ubicás vos."}
      </p>
    </fieldset>
  );

  if (!mesas.length) {
    return (
      <div className="pnl-seccion">
        <div className="pnl-vacio">
          <p className="pnl-vacio__titulo">Todavía no hay mesas.</p>
          <p>
            Las mesas son las del plano del salón: lo que agregues acá aparece allá y al revés.
            {m.esperados > 0 && ` Para ${m.esperados} personas hacen falta unas ${Math.ceil(m.esperados / 10)} redondas de 10.`}
          </p>
          <div className="pnl-ficha__botones pnl-ficha__botones--izq">
            <button className="pnl-btn pnl-btn--lleno" onClick={() => irASalon()}>Armar el salón</button>
            <button className="pnl-btn" onClick={agregarMesa}>Agregar una mesa</button>
          </div>
        </div>
        {ajustes}
      </div>
    );
  }

  return (
    <div className="pnl-seccion">
      <div className="pnl-mesas__arriba">
        <div className="pnl-cifras">
          <Cifra valor={m.sentados} de={m.esperados} etiqueta="Personas sentadas" fuerte />
          <Cifra valor={m.lugares} etiqueta="Sillas" />
          <Cifra valor={m.mesas} etiqueta="Mesas" />
          <Cifra valor={Math.max(0, m.lugares - m.esperados)} etiqueta="Sillas de sobra" />
        </div>
        <div className="pnl-ficha__botones pnl-ficha__botones--izq">
          <button className="pnl-btn pnl-btn--lleno" onClick={() => automatico(false)} disabled={!unidades.length}>Sentar solos a los que faltan</button>
          <button className="pnl-btn" onClick={() => automatico(true)}>Rehacer todo</button>
          <button className="pnl-btn" onClick={agregarMesa}>+ Mesa</button>
          <button className="pnl-btn" onClick={() => setVerPlano(!verPlano)} aria-pressed={verPlano}>{verPlano ? "Ocultar plano" : "Ver plano"}</button>
        </div>
      </div>
      {resultado && <p className="pnl-nota" role="status">{resultado}</p>}
      {rotas.length > 0 && (
        <ul className="pnl-avisos" aria-label="Afinidades que no se cumplen">
          {rotas.map((r) => (
            <li key={r.af.id} className={`pnl-aviso pnl-aviso--${r.af.tipo === "separados" ? "alerta" : "consejo"}`}>
              <span className="pnl-aviso__marca" aria-hidden>{r.af.tipo === "separados" ? "!" : "→"}</span>
              <span>
                {r.af.tipo === "separados"
                  ? `${r.a.nombre} y ${r.b.nombre} están juntos en ${nombreMesaDe(r.mesa)} y marcaste que no.`
                  : `${r.a.nombre} y ${r.b.nombre} querían sentarse juntos y están en mesas distintas.`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="pnl-mesas">
        <aside className="pnl-mesas__espera" aria-label="Sin mesa">
          <p className="pnl-rotulo">Sin mesa · {unidades.reduce((t, u) => t + u.personas, 0)}</p>
          {unidades.length === 0 ? (
            <p className="pnl-nota">Todos tienen lugar.</p>
          ) : (
            <>
              <p className="pnl-nota">{elegida ? `Ahora tocá la mesa para ${elegida.nombre}, en la lista o en el plano.` : "Tocá una familia y después su mesa."}</p>
              <ul className="pnl-mesas__unidades">
                {unidades.map((u) => (
                  <li key={u.clave}>
                    <div className="pnl-unidad__fila">
                    <button
                      className="pnl-unidad"
                      aria-pressed={elegida?.clave === u.clave}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", u.clave); setElegida(u); }}
                      onDragEnd={() => setSobre(null)}
                      onClick={() => setElegida(elegida?.clave === u.clave ? null : u)}
                    >
                      <span>
                        {u.nombre}
                        {u.nuevo && <span className="pnl-marca pnl-unidad__nuevo">nuevo</span>}
                      </span>
                      <span className="pnl-num">{u.personas}</span>
                    </button>
                    {u.personas > 1 && (
                      <button className="pnl-enlace pnl-unidad__ver" onClick={() => alternar(u.clave)} aria-expanded={abiertas.has(u.clave)}>
                        {abiertas.has(u.clave) ? "Ocultar" : "Personas"}
                      </button>
                    )}
                    </div>
                    {abiertas.has(u.clave) && (
                      <div className="pnl-personas">
                        {u.gente!.map(({ inv, miembro }) => {
                          const fila = doc.invitados.find((x) => x.id === inv)!;
                          const unidad = unidadDePersona(fila, miembro);
                          return (
                            <Persona
                              key={miembro.id}
                              m={miembro}
                              elegida={elegida?.clave === unidad.clave}
                              onElegir={() => setElegida(elegida?.clave === unidad.clave ? null : unidad)}
                              onArrastrar={() => setElegida(unidad)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          {ajustes}
        </aside>

        <div className="pnl-mesas__derecha">
          {verPlano && (
            <div className="pnl-mesas__plano">
              <Plano salon={doc.salon} ocupacion={ocup} seleccion={resaltada} onSeleccionar={tocarEnPlano} />
              <div className="pnl-salon__barra">
                <span className="pnl-nota">Mismo plano que en Salón. Para mover mesas, andá a Salón.</span>
                <button className="pnl-enlace" onClick={() => irASalon(resaltada ?? undefined)}>Editar plano</button>
              </div>
            </div>
          )}

          <ul className="pnl-mesas__grilla">
            {mesas.map((mesa) => {
              const n = ocup.get(mesa.id) ?? 0;
              const cap = mesa.capacidad ?? 0;
              const aca = ocupantes(doc.invitados, mesa.id);
              const entra = elegida ? cap - n >= elegida.personas : true;
              const etiquetas = mesa.etiquetas ?? [];
              const sugerido = nombrePorEtiquetas(etiquetas);

              return (
                <li
                  key={mesa.id}
                  id={`pnl-mesa-${mesa.id}`}
                  className={[
                    "pnl-mesa",
                    n > cap && "es-pasada",
                    sobre === mesa.id && "es-sobre",
                    resaltada === mesa.id && "es-resaltada",
                    mesa.principal && "es-principal",
                    elegida && (entra ? "es-destino" : "es-no-entra"),
                  ].filter(Boolean).join(" ")}
                  onDragOver={(e) => { e.preventDefault(); setSobre(mesa.id); }}
                  onDragLeave={() => setSobre(null)}
                  onDrop={(e) => { e.preventDefault(); setSobre(null); soltarEn(mesa.id, elegida); }}
                  onClick={() => elegida && soltarEn(mesa.id, elegida)}
                >
                  <div className="pnl-mesa__cabeza">
                    <input
                      className="pnl-mesa__nombre"
                      value={mesa.nombre}
                      onChange={(e) => editarMesa(mesa.id, { nombre: e.target.value.slice(0, 40) })}
                      onClick={(e) => elegida && e.stopPropagation()}
                      aria-label="Nombre de la mesa"
                    />
                    <span className="pnl-num">{n}/{cap}</span>
                  </div>
                  <div className="pnl-mesa__barra" aria-hidden>
                    <span style={{ width: `${Math.min(100, cap ? (n / cap) * 100 : 0)}%` }} />
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <EditorEtiquetas etiquetas={etiquetas} grupos={grupos} onCambiar={(e) => editarMesa(mesa.id, { etiquetas: e })} />
                  </div>

                  {aca.length === 0 ? (
                    <p className="pnl-nota">{elegida ? (entra ? "Tocá para sentarlos acá" : "No entran") : "Vacía"}</p>
                  ) : (
                    <ul className="pnl-mesa__lista">
                      {aca.map(({ inv: i, miembros, entera }) => {
                        const conLaFamilia = i.mesa === mesa.id;
                        return (
                          <li key={i.id} className="pnl-mesa__ocupante">
                            <div className="pnl-mesa__ocupante-fila">
                              <span>
                                {i.nombre}
                                {entera
                                  ? i.personas > 1 && <span className="pnl-tenue"> ×{i.personas}</span>
                                  : <span className="pnl-tenue"> · {miembros.length} de {i.personas}</span>}
                                {nuevos.has(i.id) && <span className="pnl-marca pnl-unidad__nuevo">nuevo</span>}
                                {i.grupo && norm(i.grupo) !== norm(i.nombre) && <span className="pnl-mesa__grupo">{i.grupo}</span>}
                              </span>
                              {conLaFamilia && (
                                <button className="pnl-quitar" onClick={(e) => { e.stopPropagation(); asignar([i.id], null); }} aria-label={`Sacar a ${i.nombre} de ${mesa.nombre}`}>×</button>
                              )}
                            </div>
                            {i.personas > 1 && (
                              <div className="pnl-personas pnl-personas--mesa">
                                {miembros.map((mi) => {
                                  const unidad = unidadDePersona(i, mi);
                                  return (
                                    <Persona
                                      key={mi.id}
                                      m={mi}
                                      elegida={elegida?.clave === unidad.clave}
                                      onElegir={() => setElegida(elegida?.clave === unidad.clave ? null : unidad)}
                                      onArrastrar={() => setElegida(unidad)}
                                      onQuitar={mi.mesa === mesa.id ? () => asignarPersona(i.id, mi.id, null) : undefined}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="pnl-mesa__pie" onClick={(e) => e.stopPropagation()}>
                    <label className="pnl-check pnl-check--chico">
                      <input type="checkbox" checked={!!mesa.principal} onChange={(e) => editarMesa(mesa.id, { principal: e.target.checked })} />
                      Principal
                    </label>
                    {sugerido && sugerido !== mesa.nombre && (
                      <button className="pnl-enlace" onClick={() => editarMesa(mesa.id, { nombre: sugerido.slice(0, 40) })}>Nombrarla así</button>
                    )}
                    <button className="pnl-enlace" onClick={() => irASalon(mesa.id)}>En el plano</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
