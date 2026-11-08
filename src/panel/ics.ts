/**
 * Un archivo de calendario (.ics) con las fechas del panel, para llevarlas al
 * calendario del celular: tareas que vencen, pagos y el día del evento.
 *
 * Son eventos de día completo. Los pagos llevan un recordatorio un día antes,
 * que es lo que evita perder una seña por pasarse de fecha.
 */

export type EventoIcs = {
  uid: string;
  /** "AAAA-MM-DD". */
  fecha: string;
  titulo: string;
  detalle?: string;
  /** Recordatorio un día antes. */
  aviso?: boolean;
};

const escapar = (t: string) => t.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

const sinGuiones = (iso: string) => iso.replace(/-/g, "");

/** El día siguiente, que es donde termina un evento de día completo. */
function diaSiguiente(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  const f = new Date(Date.UTC(a, m - 1, d + 1));
  return `${f.getUTCFullYear()}${String(f.getUTCMonth() + 1).padStart(2, "0")}${String(f.getUTCDate()).padStart(2, "0")}`;
}

/** El texto del archivo. Las líneas terminan en CRLF, como pide el formato. */
export function generarIcs(eventos: EventoIcs[], calendario: string, ahora = new Date()): string {
  const sello = ahora.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lineas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MyB Invite//Panel//ES", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${escapar(calendario)}`];

  for (const e of eventos) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.fecha)) continue;
    lineas.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@mybinvite.com`,
      `DTSTAMP:${sello}`,
      `DTSTART;VALUE=DATE:${sinGuiones(e.fecha)}`,
      `DTEND;VALUE=DATE:${diaSiguiente(e.fecha)}`,
      `SUMMARY:${escapar(e.titulo)}`,
    );
    if (e.detalle) lineas.push(`DESCRIPTION:${escapar(e.detalle)}`);
    if (e.aviso) lineas.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapar(e.titulo)}`, "TRIGGER:-P1D", "END:VALARM");
    lineas.push("END:VEVENT");
  }

  lineas.push("END:VCALENDAR");
  return lineas.join("\r\n") + "\r\n";
}
