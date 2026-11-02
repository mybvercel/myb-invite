"use client";

import { useEffect, useRef, useState } from "react";
import type { Personal } from "./personal";

/**
 * Toda la lógica del RSVP, sin piel.
 *
 * La usan todos los estilos: Rosa la muestra con el lacre y renglones, el
 * fotomatón como una entrada de función. Lo delicado vive acá una sola vez:
 * links personales por familia, la respuesta previa, el cupo, el evento
 * cerrado y el "sólo decir listo si de verdad se guardó".
 */
export function usarRsvp({ slug, personal, invitado }: { slug: string; personal?: Personal; invitado?: string }) {
  const formRef = useRef<HTMLDivElement>(null);

  const previa = personal?.respuesta ?? null;
  const [abierto, setAbierto] = useState(false);
  // Si la familia ya había respondido, se le muestra su respuesta, no el sello.
  const [enviado, setEnviado] = useState(Boolean(previa));
  const [cerrado, setCerrado] = useState(false);

  const [nombre, setNombre] = useState(personal?.nombre ?? invitado ?? "");
  const [asiste, setAsiste] = useState<boolean | null>(previa ? previa.asiste : null);
  const [acompanantes, setAcompanantes] = useState(previa?.asiste ? previa.personas : (personal?.cupo ?? 1));
  const [comidas, setComidas] = useState<string[]>(previa?.comidas ?? []);
  const [cancion, setCancion] = useState("");
  const [falta, setFalta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");

  // La invitación general es estática: si el evento es cerrado, se entera
  // acá, antes de que alguien llene el formulario para nada.
  useEffect(() => {
    if (personal) return;
    fetch(`/api/rsvp/cerrado?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : { cerrado: false }))
      .then((d: { cerrado?: boolean }) => setCerrado(Boolean(d.cerrado)))
      .catch(() => {});
  }, [personal, slug]);

  const cupo = personal?.cupo ?? 12;

  const abrir = () => {
    setAbierto(true);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  };

  const alternarComida = (c: string) =>
    setComidas((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const enviar = async () => {
    if (!nombre.trim() || asiste === null) {
      setFalta(true);
      return;
    }

    setEnviando(true);
    setErrorEnvio("");

    try {
      const r = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          nombre,
          asiste,
          acompanantes: Math.min(cupo, Math.max(1, acompanantes || 1)),
          comidas,
          cancion,
          familia: personal?.token ?? "",
        }),
      });

      // Sólo se le dice "listo" al invitado si de verdad quedó guardado: dar
      // por confirmada a alguien que no entró a la lista es peor que el error.
      if (!r.ok) {
        const { error } = await r.json().catch(() => ({ error: "" }));
        setErrorEnvio(error || "No pudimos guardar tu confirmación. Probá de nuevo.");
        return;
      }

      setEnviado(true);
    } catch {
      setErrorEnvio("Parece que te quedaste sin señal. Probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return { abierto, setAbierto, enviado, setEnviado, cerrado, setCerrado, nombre, setNombre, asiste, setAsiste, acompanantes, setAcompanantes, comidas, setComidas, cancion, setCancion, falta, setFalta, enviando, setEnviando, errorEnvio, setErrorEnvio, formRef, previa, cupo, abrir, alternarComida, enviar };
}
