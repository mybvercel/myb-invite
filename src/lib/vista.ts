/**
 * La vista previa: los datos que el visitante carga en /armar y que viajan en
 * el link de /i/vista/<slug>. Todo lo que llega acá lo escribió alguien de
 * afuera y termina en una página con nuestro dominio, por eso se limpia fuerte.
 */

export type DatosVista = {
  /** El nombre principal: uno de los novios, quien cumple o la empresa. */
  a: string;
  /** El segundo nombre, sólo en casamientos. */
  b?: string;
  /** Fecha ISO: "2027-03-14". */
  f?: string;
  /** Años que cumple. */
  e?: string;
  /** "bat" para un Bat Mitzvá. */
  t?: "bat";
};

export const LARGO_NOMBRE = 14;
export const LARGO_EMPRESA = 24;

export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** Sólo letras, números y puntuación de nombre: nada que cierre una etiqueta o un string. */
export function limpiarNombre(valor: unknown, max = LARGO_EMPRESA): string {
  if (typeof valor !== "string") return "";
  return valor
    .replace(/['`´]/g, "’")
    .replace(/[^\p{L}\p{M}\p{N} ’.+-]/gu, "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, max);
}

export function limpiarFecha(valor: unknown): string | undefined {
  if (typeof valor !== "string" || !/^20\d\d-\d\d-\d\d$/.test(valor)) return undefined;
  const d = fechaLocal(valor);
  return d.getMonth() + 1 === Number(valor.slice(5, 7)) ? valor : undefined;
}

/** Null si no hay nombre: entonces se muestra el modelo tal cual. */
export function leerVista(leer: (clave: string) => unknown): DatosVista | null {
  const a = limpiarNombre(leer("a")).trim();
  if (!a) return null;
  const b = limpiarNombre(leer("b")).trim();
  const e = String(leer("e") ?? "").replace(/\D/g, "").slice(0, 3);
  return {
    a,
    ...(b && { b }),
    ...(limpiarFecha(leer("f")) && { f: limpiarFecha(leer("f")) }),
    ...(e && { e }),
    ...(leer("t") === "bat" && { t: "bat" as const }),
  };
}

export function consultaVista(d: DatosVista): string {
  const q = new URLSearchParams();
  q.set("a", d.a);
  if (d.b) q.set("b", d.b);
  if (d.f) q.set("f", d.f);
  if (d.e) q.set("e", d.e);
  if (d.t) q.set("t", d.t);
  return q.toString();
}

/** Nombres que a tamaño de portada se salen de la pantalla. */
export const esLargo = (d: DatosVista) =>
  d.a.length > 9 || (d.b?.length ?? 0) > 9 || d.a.length + (d.b?.length ?? 0) > 16;

/* ── Fechas ────────────────────────────────────────────────── */

/** Al mediodía, para que ningún huso la corra de día. */
export const fechaLocal = (iso: string) => new Date(`${iso}T12:00:00`);

/** Todo lo que se puede escribir con una fecha, ya separado. */
export function partesFecha(iso: string) {
  const d = fechaLocal(iso);
  return {
    dia: String(d.getDate()),
    dd: iso.slice(8, 10),
    mm: iso.slice(5, 7),
    anio: iso.slice(0, 4),
    mes: MESES[d.getMonth()],
    Mes: MESES[d.getMonth()][0].toUpperCase() + MESES[d.getMonth()].slice(1),
    semana: DIAS[d.getDay()],
  };
}

export const fechaLarga = (iso: string) => {
  const p = partesFecha(iso);
  return `${p.dia} de ${p.mes} de ${p.anio}`;
};

/** La misma fecha corrida `dias`. La usa el cierre de confirmaciones. */
export function correr(iso: string, dias: number): string {
  const d = fechaLocal(iso);
  d.setDate(d.getDate() + dias);
  const n = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${n(d.getMonth() + 1)}-${n(d.getDate())}`;
}

/* ── Reemplazo de texto ────────────────────────────────────── */

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Cambia palabras enteras en una sola pasada. De a una, "Ana" por "Leo" y
 * después "Leo" por "Ana" se pisarían entre sí.
 */
export function reemplazador(pares: [string, string][]) {
  const validos = pares.filter(([de]) => de);
  if (!validos.length) return (s: string) => s;
  const mapa = new Map(validos);
  const claves = [...mapa.keys()].sort((x, y) => y.length - x.length).map(escapar);
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${claves.join("|")})(?![\\p{L}\\p{N}])`, "gu");
  return (s: string) => s.replace(re, (x) => mapa.get(x) ?? x);
}
