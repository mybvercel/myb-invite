"use client";

import { useActionState } from "react";
import { ingresar, type EstadoIngreso } from "./acciones";

export function Ingreso({ slug, nombres }: { slug: string; nombres: string }) {
  const [estado, enviar, enviando] = useActionState<EstadoIngreso, FormData>(ingresar.bind(null, slug), null);

  return (
    <main className="pnl pnl--base-papel pnl-ingreso">
      <form action={enviar} className="pnl-ingreso__caja">
        <p className="pnl-rotulo">Panel del evento</p>
        <h1 className="pnl-ingreso__titulo">{nombres}</h1>
        <label className="pnl-campo">
          <span>Clave</span>
          <input name="clave" type="password" autoComplete="current-password" required autoFocus />
        </label>
        {estado?.error && <p className="pnl-error" role="alert">{estado.error}</p>}
        <button className="pnl-btn pnl-btn--lleno" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        <p className="pnl-nota">La clave te la pasamos con la invitación. Si la perdiste, escribinos.</p>
      </form>
    </main>
  );
}
