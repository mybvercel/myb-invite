"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dispara la entrada de una sección cuando entra en pantalla, una sola vez.
 *
 * Es a nivel sección y no por elemento a propósito: animar cada párrafo por
 * separado es lo que hace que una web se lea como plantilla.
 */
export function usarEnVista<T extends HTMLElement>(margen = "-12%") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    // Con menos movimiento pedido, se muestra sin esperar nada.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setVisible(true);
        observador.disconnect();
      },
      { rootMargin: `0px 0px ${margen} 0px` },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, [margen]);

  return [ref, visible] as const;
}
