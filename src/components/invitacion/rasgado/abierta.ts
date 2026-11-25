"use client";

import { createContext, useContext } from "react";
import { usarEnVista } from "../usarEnVista";

/** Si la tapa ya se rasgó. Hasta entonces nada de lo que hay debajo se anima. */
export const Abierta = createContext(false);

export function usarVisible<T extends HTMLElement>(margen?: string) {
  const abierta = useContext(Abierta);
  const [ref, enVista] = usarEnVista<T>(margen);
  return [ref, enVista && abierta] as const;
}
