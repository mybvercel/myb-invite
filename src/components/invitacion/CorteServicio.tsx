"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Baja de la invitación desde el dashboard de MYB. La invitación pregunta por
 * su propio link: si en el dashboard está de baja, tapa todo con el mensaje.
 * Si el dashboard no responde o no la conoce, la invitación sigue andando.
 */
const DASHBOARD = process.env.NEXT_PUBLIC_MYB_DASHBOARD || "https://myb-digitals-dashboard.vercel.app";

export default function CorteServicio() {
  // /i/<slug>/... ; la vista previa de modelos (/i/vista) no se corta
  const slug = usePathname()?.split("/")[2] || "";
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || slug === "vista") return;
    const c = new AbortController();
    fetch(`${DASHBOARD}/api/invitacion-estado?slug=${encodeURIComponent(slug)}`, { signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (s && s.activo === false) setMensaje(String(s.mensaje || "Esta invitación ya no está disponible.")); })
      .catch(() => {});
    return () => c.abort();
  }, [slug]);

  useEffect(() => {
    if (mensaje === null) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.querySelectorAll("audio, video").forEach((m) => (m as HTMLMediaElement).pause());
    return () => { document.body.style.overflow = antes; };
  }, [mensaje]);

  if (mensaje === null) return null;
  return (
    <div
      role="alert"
      style={{
        position: "fixed", inset: 0, zIndex: 2147483647, display: "grid", placeItems: "center",
        padding: "max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom))",
        background: "#f7f4ef", color: "#1c1c1c", textAlign: "center",
        font: "500 clamp(20px, 5.5vw, 25px)/1.45 var(--font-cormorant), Georgia, serif",
      }}
    >
      <p style={{ maxWidth: 420, margin: 0 }}>{mensaje}</p>
    </div>
  );
}
