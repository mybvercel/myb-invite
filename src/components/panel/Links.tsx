"use client";

import { useState } from "react";
import { tokenPara } from "@/panel/logica";
import type { DocPanel, Enlace, Invitado } from "@/panel/tipos";
import { nuevo } from "./Invitados";
import type { Cambiar } from "./Panel";
import { Cifra } from "./piezas";

type Props = {
  doc: DocPanel;
  cambiar: Cambiar;
  slug: string;
  nombres: string;
};

const saludoPara = (nombre: string) => `Te esperamos, ${nombre}`;

/**
 * Las invitaciones personales: la misma invitación, con un link por familia
 * que dice "Te esperamos, Familia Gómez" y sólo pregunta si vienen, cuántos
 * (hasta el cupo) y qué comen. Cada link es una fila de la lista de invitados:
 * lo que confirman cae directo en esa fila.
 */
export function Links({ doc, cambiar, slug, nombres }: Props) {
  const [para, setPara] = useState("");
  const [cupo, setCupo] = useState(2);
  const [telefono, setTelefono] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  const conLink = doc.invitados.filter((i) => i.enlace);
  const sinLink = doc.invitados.filter((i) => !i.enlace);
  const usados = () => new Set(doc.invitados.flatMap((i) => (i.enlace ? [i.enlace.token] : [])));

  const origen = typeof window !== "undefined" ? window.location.origin : "";
  const url = (e: Enlace) => `${origen}/i/${slug}/para/${e.token}`;

  const enlaceNuevo = (i: Pick<Invitado, "nombre" | "personas">, tokens: Set<string>): Enlace => {
    const token = tokenPara(i.nombre, tokens);
    tokens.add(token);
    return { token, saludo: saludoPara(i.nombre), nota: "", cupo: Math.max(1, i.personas) };
  };

  const crear = (e: React.FormEvent) => {
    e.preventDefault();
    const nombre = para.trim();
    if (nombre.length < 2) return;
    const fila = nuevo({ nombre, grupo: nombre, personas: cupo, telefono: telefono.trim() });
    fila.enlace = enlaceNuevo(fila, usados());
    cambiar((d) => ({ ...d, invitados: [...d.invitados, fila] }));
    setPara("");
    setCupo(2);
    setTelefono("");
    setAbierto(fila.id);
  };

  const crearParaTodos = () => {
    const tokens = usados();
    cambiar((d) => ({ ...d, invitados: d.invitados.map((i) => (i.enlace ? i : { ...i, enlace: enlaceNuevo(i, tokens) })) }));
  };

  const editar = (id: string, c: Partial<Enlace>) =>
    cambiar((d) => ({ ...d, invitados: d.invitados.map((i) => (i.id === id && i.enlace ? { ...i, enlace: { ...i.enlace, ...c } } : i)) }));

  const quitar = (id: string) => cambiar((d) => ({ ...d, invitados: d.invitados.map((i) => (i.id === id ? { ...i, enlace: null } : i)) }));

  const copiar = async (i: Invitado) => {
    try {
      await navigator.clipboard.writeText(url(i.enlace!));
      setCopiado(i.id);
      setTimeout(() => setCopiado((c) => (c === i.id ? null : c)), 1800);
    } catch {
      setAbierto(i.id); // Sin portapapeles, se muestra el link para copiarlo a mano.
    }
  };

  const whatsapp = (i: Invitado) => {
    const e = i.enlace!;
    const texto = `${e.saludo}! Les dejamos la invitación de ${nombres}. Confirmen desde acá, es un minuto: ${url(e)}`;
    const tel = i.telefono.replace(/[^\d]/g, "");
    const numero = tel.length >= 7 ? (tel.startsWith("54") ? tel : `549${tel.replace(/^0/, "")}`) : "";
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  };

  const respondieron = conLink.filter((i) => i.estado !== "pendiente").length;

  return (
    <div className="pnl-seccion">
      <div className="pnl-cifras">
        <Cifra valor={conLink.length} etiqueta="Links creados" fuerte />
        <Cifra valor={respondieron} de={conLink.length} etiqueta="Respondieron" />
        <Cifra valor={conLink.reduce((t, i) => t + (i.enlace?.cupo ?? 0), 0)} etiqueta="Lugares invitados" />
      </div>

      <label className="pnl-interruptor">
        <input type="checkbox" checked={doc.ajustes.cerrado} onChange={(e) => cambiar((d) => ({ ...d, ajustes: { ...d.ajustes, cerrado: e.target.checked } }))} />
        <span>
          <b>Evento cerrado.</b> Sólo confirma quien tiene su link. La invitación general se puede ver, pero en vez del
          formulario dice que es personal.
        </span>
      </label>

      <form className="pnl-alta pnl-alta--links" onSubmit={crear}>
        <label className="pnl-campo pnl-alta__nombre">
          <span>Para</span>
          <input value={para} onChange={(e) => setPara(e.target.value)} placeholder="Ej: Familia Gómez" maxLength={80} />
        </label>
        <label className="pnl-campo pnl-alta__corto">
          <span>Hasta</span>
          <input type="number" min={1} max={30} value={cupo} onChange={(e) => setCupo(Math.min(30, Math.max(1, Number(e.target.value) || 1)))} aria-label="Hasta cuántas personas" />
        </label>
        <label className="pnl-campo">
          <span>Teléfono</span>
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="tel" placeholder="Para mandarlo por WhatsApp" maxLength={30} />
        </label>
        <div className="pnl-alta__botones">
          <button className="pnl-btn pnl-btn--lleno" type="submit">Crear link</button>
        </div>
      </form>

      {sinLink.length > 0 && (
        <div className="pnl-banda-suave">
          <span>
            {sinLink.length} {sinLink.length === 1 ? "fila de tu lista no tiene" : "filas de tu lista no tienen"} link. Se crea uno por fila, con su
            cantidad de personas como tope.
          </span>
          <button className="pnl-btn" onClick={crearParaTodos}>Crear para {sinLink.length === 1 ? "esa" : "todas"}</button>
        </div>
      )}

      {conLink.length === 0 ? (
        <div className="pnl-vacio">
          <p className="pnl-vacio__titulo">Una invitación para cada familia.</p>
          <p>
            Es la misma invitación, pero abajo de la portada dice &ldquo;Te esperamos, Familia Gómez&rdquo; y el formulario ya sabe quiénes son:
            sólo marcan si van, cuántos y si tienen alguna restricción de comida. Lo que respondan aparece en su fila de la lista.
          </p>
        </div>
      ) : (
        <ul className="pnl-links">
          {conLink.map((i) => {
            const e = i.enlace!;
            const estado =
              i.estado === "confirmado" ? `Vienen ${i.personas} de ${e.cupo}` : i.estado === "no-viene" ? "No vienen" : "Sin respuesta";
            return (
              <li key={i.id} className="pnl-link">
                <div className="pnl-link__fila">
                  <button className="pnl-link__quien" onClick={() => setAbierto(abierto === i.id ? null : i.id)} aria-expanded={abierto === i.id}>
                    <span className={`pnl-punto pnl-punto--${i.estado}`} aria-hidden />
                    <span>
                      <span className="pnl-link__nombre">{i.nombre}</span>
                      <span className="pnl-link__saludo">{e.saludo}</span>
                    </span>
                  </button>
                  <span className="pnl-link__estado">{estado}</span>
                  <span className="pnl-link__acciones">
                    <button className="pnl-btn" onClick={() => copiar(i)}>{copiado === i.id ? "Copiado" : "Copiar link"}</button>
                    <a className="pnl-btn" href={whatsapp(i)} target="_blank" rel="noreferrer">WhatsApp</a>
                  </span>
                </div>

                {abierto === i.id && (
                  <div className="pnl-ficha">
                    <label className="pnl-campo">
                      <span>Link</span>
                      <input readOnly value={url(e)} onFocus={(ev) => ev.target.select()} />
                    </label>
                    <div className="pnl-ficha__campos pnl-ficha__campos--links">
                      <label className="pnl-campo">
                        <span>Saludo, debajo de la portada</span>
                        <input value={e.saludo} onChange={(ev) => editar(i.id, { saludo: ev.target.value.slice(0, 80) })} placeholder={saludoPara(i.nombre)} />
                      </label>
                      <label className="pnl-campo pnl-alta__corto">
                        <span>Hasta</span>
                        <input type="number" min={1} max={30} value={e.cupo} onChange={(ev) => editar(i.id, { cupo: Math.min(30, Math.max(1, Number(ev.target.value) || 1)) })} />
                      </label>
                    </div>
                    <label className="pnl-campo">
                      <span>Una línea más (opcional)</span>
                      <input value={e.nota} onChange={(ev) => editar(i.id, { nota: ev.target.value.slice(0, 200) })} placeholder="Ej: Los esperamos también en la ceremonia" />
                    </label>
                    <div className="pnl-ficha__pie">
                      <a className="pnl-enlace" href={url(e)} target="_blank" rel="noreferrer">Ver cómo la ven ellos</a>
                      <div className="pnl-ficha__botones">
                        <button className="pnl-enlace pnl-enlace--peligro" onClick={() => { quitar(i.id); setAbierto(null); }}>Quitar el link</button>
                        <button className="pnl-btn" onClick={() => setAbierto(null)}>Listo</button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
