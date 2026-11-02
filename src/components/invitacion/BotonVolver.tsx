"use client";

import { useEffect, useState } from "react";

/**
 * "Volver" para quien abre una demo desde el catálogo de la web. Aparece sólo
 * si el enlace trae `?v=1` (lo agrega el catálogo), así que las invitaciones
 * que reciben los invitados no lo muestran. El catálogo abre la demo en otra
 * pestaña: se intenta cerrarla y, si el navegador no lo permite, se navega.
 */
export default function BotonVolver({ catalogo }: { catalogo: string }) {
  const [ver, setVer] = useState(false);
  useEffect(() => setVer(new URLSearchParams(window.location.search).has("v")), []);
  if (!ver) return null;

  const volver = () => {
    window.close();
    // Si la pestaña no se cerró (no fue abierta por un script), vamos al catálogo.
    setTimeout(() => {
      window.location.href = catalogo;
    }, 150);
  };

  return (
    <button type="button" className="inv-volver" onClick={volver}>
      <span aria-hidden="true">←</span> Volver
    </button>
  );
}
