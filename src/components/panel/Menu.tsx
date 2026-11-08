"use client";

import { useEffect, useRef } from "react";

export type ItemMenu = { id: string; nombre: string; dato?: string };

type Props = {
  nombres: string;
  /** Una línea chica bajo los nombres: la fecha y cuánto falta. */
  detalle?: string;
  plan: string;
  /** Los grupos se separan sólo con una línea fina, sin títulos. */
  grupos: ItemMenu[][];
  actual: string;
  abierto: boolean;
  onElegir: (id: string) => void;
  onCerrar: () => void;
};

/**
 * El menú del panel, al costado. En pantalla grande es una columna fija; en
 * el celular es un cajón que se abre con el botón "Menú" de la barra de
 * arriba y se cierra con Escape, tocando afuera o eligiendo una sección.
 */
export function Menu({ nombres, detalle, plan, grupos, actual, abierto, onElegir, onCerrar }: Props) {
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    raiz.current?.querySelector<HTMLElement>("[aria-current]")?.focus();
    return () => window.removeEventListener("keydown", tecla);
  }, [abierto, onCerrar]);

  return (
    <>
      <button className="pnl-menu__velo" data-abierto={abierto || undefined} onClick={onCerrar} tabIndex={-1} aria-hidden />
      <aside ref={raiz} className="pnl-menu" data-abierto={abierto || undefined} aria-label="Menú del panel">
        <div className="pnl-menu__marca">
          <p className="pnl-menu__nombres">{nombres}</p>
          {detalle && <p className="pnl-menu__detalle">{detalle}</p>}
          <p className="pnl-menu__plan">Plan {plan}</p>
        </div>
        <nav aria-label="Secciones del panel">
          {grupos.map((g, i) => (
            <ul key={i} className="pnl-menu__grupo">
              {g.map((it) => (
                <li key={it.id}>
                  <button className="pnl-menu__item" aria-current={actual === it.id ? "page" : undefined} onClick={() => onElegir(it.id)}>
                    <span>{it.nombre}</span>
                    {it.dato && <span className="pnl-menu__dato">{it.dato}</span>}
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </nav>
      </aside>
    </>
  );
}
