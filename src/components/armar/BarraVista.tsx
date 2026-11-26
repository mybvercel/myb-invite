"use client";

import { whatsappPara } from "@/lib/invitaciones";

/** Sobre la vista previa: volver, pedirla y el aviso de que es una muestra. */
export default function BarraVista({ fotos = 0 }: { fotos?: number }) {
  const volver = () => {
    // Quien viene de /armar vuelve a donde estaba; quien abrió el link, a la web.
    let vieneDeArmar = false;
    try {
      vieneDeArmar = Boolean(sessionStorage.getItem("myb-armar")) && window.history.length > 1;
    } catch {}
    if (vieneDeArmar) window.history.back();
    else window.location.href = "/#armar";
  };

  const pedir = () => {
    window.location.href = whatsappPara(`Hola! Quiero esta invitación: ${window.location.href}\n¿Me pasan el valor?`);
  };

  return (
    <>
      <button type="button" className="inv-volver" onClick={volver}>
        <span aria-hidden="true">←</span> Volver
      </button>
      <button type="button" className="inv-volver inv-volver--pedir" onClick={pedir}>
        Quiero esta
      </button>
      <p className="inv-vista__nota">
        <span>{fotos > 0 ? "Vista previa · fotos de ejemplo" : "Vista previa"}</span>
      </p>
    </>
  );
}
