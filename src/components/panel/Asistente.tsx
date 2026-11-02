"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { aplicar } from "@/panel/agente/aplicar";
import { interpretar } from "@/panel/agente/interpretar";
import { ocupacion } from "@/panel/logica";
import type { DocPanel } from "@/panel/tipos";
import type { Cambiar } from "./Panel";
import { Plano } from "./Plano";

/**
 * El asistente del salón: se le cuenta cómo es el lugar, escribiendo o
 * hablando, y arma el plano. Muestra lo que entendió y cómo va a quedar
 * ANTES de tocar nada; aplicar es un solo paso, así Ctrl+Z lo deshace entero.
 *
 * Todo corre en el navegador: el intérprete es código propio (sin API, sin
 * costo, sin esperar a un servidor). La voz usa el reconocimiento que trae el
 * navegador (Chrome, Edge y Safari), que también es gratis.
 */

/* ── Reconocimiento de voz del navegador ─────────────────────── */

type Reconocimiento = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type ConVoz = { SpeechRecognition?: new () => Reconocimiento; webkitSpeechRecognition?: new () => Reconocimiento };

const claseVoz = () => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as ConVoz;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

const crearReconocimiento = (): Reconocimiento | null => {
  const Clase = claseVoz();
  return Clase ? new Clase() : null;
};

const nada = () => () => {};

const EJEMPLOS = [
  "El salón mide 30 por 20. Hay 12 mesas redondas de 10, una pista de 6 por 8 en el centro y la mesa imperial para 20 centrada frente a la pista.",
  "Barra al fondo a la derecha, mesa dulce a la izquierda y la cabina del DJ al lado de la pista.",
  "Somos 150 invitados, mesas redondas de 10 alrededor de la pista.",
  "La mesa 3 se llama Familia Gómez y la mesa 4 es para la familia Pérez.",
];

export function Asistente({ doc, cambiar }: { doc: DocPanel; cambiar: Cambiar }) {
  const [texto, setTexto] = useState("");
  const [interino, setInterino] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [errorVoz, setErrorVoz] = useState("");
  const [deCero, setDeCero] = useState<boolean | null>(null);
  const [listo, setListo] = useState("");
  const reco = useRef<Reconocimiento | null>(null);

  // El soporte de voz se mira recién en el navegador: el servidor no lo sabe.
  const hayVoz = useSyncExternalStore(nada, () => Boolean(claseVoz()), () => false);
  useEffect(() => () => reco.current?.stop(), []);

  const diferido = useDeferredValue(texto);
  const interpretacion = useMemo(() => interpretar(diferido), [diferido]);

  /* ¿Arma de cero o suma a lo que hay? Si describe el salón entero (medidas
     más varias cosas) y ya hay un plano, lo lógico es rehacerlo. El
     organizador lo puede cambiar. */
  const pareceCompleto =
    interpretacion.acciones.some((a) => a.tipo === "reiniciar") ||
    (interpretacion.acciones.some((a) => a.tipo === "salon") && interpretacion.acciones.filter((a) => a.tipo === "crear").length >= 2);
  const reiniciar = doc.salon.elementos.length > 0 && (deCero ?? pareceCompleto);

  const resultado = useMemo(
    () => (interpretacion.acciones.length ? aplicar(doc, interpretacion.acciones, { reiniciar }) : null),
    [doc, interpretacion, reiniciar],
  );

  const hayAlgo = Boolean(resultado && (resultado.hechos.length || resultado.avisos.length));

  const aplicarAhora = () => {
    if (!resultado || !resultado.hechos.length) return;
    const nuevo = resultado.doc;
    cambiar(() => nuevo);
    setListo(`Listo: ${resultado.hechos.length} ${resultado.hechos.length === 1 ? "cambio" : "cambios"}. Ctrl+Z lo deshace.`);
    setTexto("");
    setDeCero(null);
  };

  const escuchar = () => {
    if (escuchando) {
      reco.current?.stop();
      return;
    }
    const r = crearReconocimiento();
    if (!r) return;
    r.lang = "es-AR";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let final = "";
      let parcial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else parcial += t;
      }
      if (final) setTexto((prev) => (prev ? prev.replace(/\s*$/, " ") : "") + final.trim());
      setInterino(parcial);
    };
    r.onerror = (e) => {
      setErrorVoz(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "El navegador no tiene permiso para usar el micrófono."
          : e.error === "no-speech"
            ? "No escuché nada. Probá de nuevo más cerca del micrófono."
            : "Se cortó el dictado. Probá de nuevo.",
      );
    };
    r.onend = () => {
      setEscuchando(false);
      setInterino("");
    };
    reco.current = r;
    setErrorVoz("");
    setListo("");
    setEscuchando(true);
    r.start();
  };

  return (
    <section className="pnl-asistente" aria-label="Asistente del salón">
      <div className="pnl-asistente__cabeza">
        <div>
          <p className="pnl-h2">Contale cómo es el salón</p>
          <p className="pnl-nota">Escribilo o dictalo como se lo dirías a alguien. Te muestro cómo queda antes de cambiar nada.</p>
        </div>
      </div>

      <div className={`pnl-asistente__entrada${escuchando ? " es-escuchando" : ""}`}>
        <textarea
          className="pnl-textarea pnl-asistente__texto"
          rows={3}
          value={texto + (interino ? (texto ? " " : "") + interino : "")}
          onChange={(e) => {
            setTexto(e.target.value);
            setListo("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              aplicarAhora();
            }
          }}
          placeholder="Ej: el salón mide 25 por 18, hay 12 mesas redondas de 10, la pista de 6 por 8 en el centro y la mesa imperial para 20 centrada frente a la pista"
          aria-label="Descripción del salón"
        />
        {hayVoz && (
          <button
            className={`pnl-mic${escuchando ? " es-escuchando" : ""}`}
            onClick={escuchar}
            aria-pressed={escuchando}
            aria-label={escuchando ? "Dejar de escuchar" : "Dictar por voz"}
            title={escuchando ? "Dejar de escuchar" : "Dictar por voz"}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              {escuchando ? <rect x="7" y="7" width="10" height="10" rx="1" /> : <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3" />}
            </svg>
          </button>
        )}
      </div>

      {escuchando && <p className="pnl-nota pnl-asistente__escucha">Escuchando… hablá con naturalidad; cuando termines, tocá el cuadrado.</p>}
      {errorVoz && <p className="pnl-error">{errorVoz}</p>}
      {!hayVoz && <p className="pnl-nota">Para dictar por voz, abrí el panel en Chrome, Edge o Safari.</p>}
      {listo && <p className="pnl-nota pnl-asistente__listo" role="status">{listo}</p>}

      {!texto && !escuchando && (
        <div className="pnl-asistente__ejemplos">
          <span className="pnl-rotulo">Probá con</span>
          {EJEMPLOS.map((e) => (
            <button key={e} className="pnl-chip pnl-chip--texto" onClick={() => setTexto(e)}>
              {e}
            </button>
          ))}
        </div>
      )}

      {texto.trim() && resultado && (
        <div className="pnl-asistente__vista">
          <div className="pnl-asistente__plano">
            <Plano salon={resultado.doc.salon} ocupacion={ocupacion(resultado.doc.invitados)} soloLectura />
          </div>
          <div className="pnl-asistente__informe">
            <p className="pnl-rotulo">Entendí</p>
            {resultado.hechos.length ? (
              <ul className="pnl-asistente__lista">
                {resultado.hechos.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            ) : (
              <p className="pnl-nota">Nada para cambiar todavía.</p>
            )}
            {resultado.avisos.length > 0 && (
              <ul className="pnl-asistente__lista pnl-asistente__lista--avisos">
                {resultado.avisos.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
            {interpretacion.sinEntender.length > 0 && (
              <p className="pnl-nota">
                No entendí: {interpretacion.sinEntender.map((s) => `"${s}"`).join(", ")}. Probá decirlo con medidas o lugares
                (al fondo, a la izquierda, frente a la pista).
              </p>
            )}
            {doc.salon.elementos.length > 0 && (
              <label className="pnl-check">
                <input type="checkbox" checked={reiniciar} onChange={(e) => setDeCero(e.target.checked)} />
                Rehacer el plano de cero (si no, se suma a lo que ya hay)
              </label>
            )}
            <div className="pnl-ficha__botones pnl-ficha__botones--izq">
              <button className="pnl-btn pnl-btn--lleno" onClick={aplicarAhora} disabled={!hayAlgo || !resultado.hechos.length}>
                Aplicar al plano
              </button>
              <button className="pnl-btn" onClick={() => { setTexto(""); setDeCero(null); }}>Borrar</button>
              <span className="pnl-tenue pnl-asistente__tecla">Ctrl + Enter</span>
            </div>
          </div>
        </div>
      )}
      {texto.trim() && !resultado && (
        <p className="pnl-nota">
          Todavía no reconozco nada para armar. Nombrá cosas del salón: mesas, pista, barra, escenario, DJ, mesa dulce, baños, entrada, jardín…
        </p>
      )}
    </section>
  );
}
