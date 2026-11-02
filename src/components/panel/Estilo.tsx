"use client";

import type { Base, Fuente, Tema } from "@/panel/tipos";
import type { Cambiar } from "./Panel";

/* Acentos elegidos a mano, apagados: ningún violeta eléctrico ni degradé. */
const ACENTOS = [
  { nombre: "Verde", valor: "#2e6f4e" },
  { nombre: "Burdeos", valor: "#7d2f3f" },
  { nombre: "Terracota", valor: "#b0623f" },
  { nombre: "Cobre", valor: "#8a5a2b" },
  { nombre: "Petróleo", valor: "#2f4858" },
  { nombre: "Salvia", valor: "#6b7f62" },
  { nombre: "Grafito", valor: "#2b2b2b" },
];

const BASES: { id: Base; nombre: string; detalle: string }[] = [
  { id: "papel", nombre: "Papel", detalle: "Cálido, como una libreta" },
  { id: "blanco", nombre: "Blanco", detalle: "Limpio, para mucha tabla" },
  { id: "noche", nombre: "Noche", detalle: "Oscuro, para la madrugada" },
];

const FUENTES: { id: Fuente; nombre: string }[] = [
  { id: "instrument", nombre: "Instrument" },
  { id: "cormorant", nombre: "Cormorant" },
  { id: "montserrat", nombre: "Montserrat" },
];

export function Estilo({ tema, nombres, cambiar }: { tema: Tema; nombres: string; cambiar: Cambiar }) {
  const poner = (t: Partial<Tema>) => cambiar((d) => ({ ...d, tema: { ...d.tema, ...t } }));

  return (
    <div className="pnl-seccion pnl-estilo">
      <p className="pnl-nota">Es tu panel: los cambios se ven al instante y se guardan solos.</p>

      <section>
        <h2 className="pnl-h2">Color</h2>
        <div className="pnl-estilo__colores">
          {ACENTOS.map((a) => (
            <button
              key={a.valor}
              className="pnl-color"
              style={{ "--c": a.valor } as React.CSSProperties}
              aria-pressed={tema.acento.toLowerCase() === a.valor}
              onClick={() => poner({ acento: a.valor })}
            >
              <span className="pnl-color__muestra" />
              {a.nombre}
            </button>
          ))}
          <label className="pnl-color">
            <input type="color" value={tema.acento} onChange={(e) => poner({ acento: e.target.value })} className="pnl-color__input" />
            Otro
          </label>
        </div>
      </section>

      <section>
        <h2 className="pnl-h2">Fondo</h2>
        <div className="pnl-estilo__bases">
          {BASES.map((b) => (
            <button key={b.id} className={`pnl-base pnl-base--${b.id}`} aria-pressed={tema.base === b.id} onClick={() => poner({ base: b.id })}>
              <span className="pnl-base__muestra" aria-hidden>
                <span />
                <span />
                <span />
              </span>
              <span className="pnl-base__nombre">{b.nombre}</span>
              <span className="pnl-tenue">{b.detalle}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="pnl-h2">Letra del título</h2>
        <div className="pnl-estilo__bases">
          {FUENTES.map((f) => (
            <button key={f.id} className="pnl-base" aria-pressed={tema.fuente === f.id} onClick={() => poner({ fuente: f.id })}>
              <span className={`pnl-muestra pnl-muestra--${f.id}`}>{nombres}</span>
              <span className="pnl-tenue">{f.nombre}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
