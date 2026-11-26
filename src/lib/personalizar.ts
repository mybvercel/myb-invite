import type { Invitacion } from "@/invitaciones/tipos";
import { MESES, correr, partesFecha, reemplazador, type DatosVista } from "./vista";

/**
 * Toma un modelo del catálogo y le pone los datos del visitante, para que vea
 * SU invitación antes de escribirnos. El modelo original no se toca.
 */

/** Claves que son rutas, enlaces o identificadores: no son texto visible. */
const INTOCABLES = new Set(["slug", "estilo", "origen", "plan", "src", "mapa", "compartir", "imagen", "video", "musica", "enlace", "fuente", "acento", "fondo", "cbu", "color", "paleta"]);

function recorrer<T>(valor: T, f: (s: string) => string, clave = ""): T {
  if (INTOCABLES.has(clave)) return valor;
  if (typeof valor === "string") return (/^(\/|https?:)/.test(valor) ? valor : f(valor)) as T;
  if (Array.isArray(valor)) return valor.map((v) => recorrer(v, f, clave)) as T;
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, recorrer(v, f, k)])) as T;
  }
  return valor;
}

const inicial = (s: string) => [...s][0]?.toUpperCase() ?? "";

/** El prefijo del slug que le avisa a /api/rsvp que no hay nada que guardar. */
export const PREFIJO_VISTA = "vista-";

/**
 * Sin fecha cargada se usa la del modelo, pero nunca una que ya pasó: la cuenta
 * regresiva quedaría en cero.
 */
function fechaDeEjemplo(fecha: string): string | undefined {
  const m = /^(\d{1,2}) de (\p{L}+) (\d{4})$/u.exec(fecha);
  const mes = m ? MESES.indexOf(m[2].toLowerCase()) + 1 : 0;
  if (!m || !mes) return undefined;
  const dosCifras = (x: number | string) => String(x).padStart(2, "0");
  const desde = correr(new Date().toISOString().slice(0, 10), 60);
  let anio = Number(m[3]);
  const iso = () => `${anio}-${dosCifras(mes)}-${dosCifras(m[1])}`;
  while (iso() < desde) anio++;
  return iso();
}

export function personalizar(original: Invitacion, datos: DatosVista): Invitacion {
  const d: DatosVista = { ...datos, f: datos.f ?? fechaDeEjemplo(original.fecha) };
  const b = d.b ?? "";
  const boda = original.nombres.includes("&") || original.nombres === "Los novios";
  const empresa = ["sobremesa", "orbita", "privado", "platos", "noir"].includes(original.estilo ?? "");

  const nombres = boda && b ? `${d.a} & ${b}` : d.a;
  const [viejoA, viejoB] = original.nombres.split("&").map((s) => s.trim());

  const pares: [string, string][] = [];
  if (boda && viejoB && b) pares.push([viejoA, d.a], [viejoB, b]);
  else if (original.nombres === "Los novios") pares.push(["Los novios", nombres]);
  else if (!empresa) pares.push([viejoA, d.a]);
  if (empresa) {
    for (const marca of ["Estudio Nexo", "Casa Norte", "Estudio Oliva"]) {
      pares.push([marca, d.a], [marca.toUpperCase(), d.a.toUpperCase()]);
    }
  }
  if (d.t === "bat") pares.push(["Bar Mitzvá", "Bat Mitzvá"], ["BAR MITZVÁ", "BAT MITZVÁ"]);
  if (d.e && "cincuenta" in original) pares.push(["50", d.e]);

  const cambiar = reemplazador(pares);
  // Los nombres van aparte: hay modelos donde la empresa no es el título.
  const inv = { ...recorrer(original, cambiar) } as Invitacion;
  if (!empresa) inv.nombres = nombres;

  if (d.f) {
    const p = partesFecha(d.f);
    inv.fecha = `${p.dia} de ${p.Mes} ${p.anio}`;
    if (inv.cierreRsvp) {
      const c = partesFecha(correr(d.f, -30));
      inv.cierreRsvp = inv.cierreRsvp.replace(
        /\d{1,2} de (\p{L}+)( \d{4})?/u,
        (_, mes: string, anio?: string) =>
          `${c.dia} de ${mes[0] === mes[0].toUpperCase() ? c.Mes : c.mes}${anio ? ` ${c.anio}` : ""}`,
      );
    }
  }

  if (inv.regalo) {
    inv.regalo = {
      ...inv.regalo,
      titular: nombres.replace("&", "y"),
      alias: nombres.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "."),
    };
  }

  /* Lo propio de cada estilo: iniciales, y los datos de familia del modelo,
     que no son de quien está mirando. */
  const iniciales = `${inicial(d.a)} & ${inicial(b)}`;
  if ("carta" in inv && b) inv.carta = { ...inv.carta, iniciales };
  if (inv.estilo === "fotomaton" && b) inv.fotomaton = { ...inv.fotomaton, iniciales };
  if (inv.estilo === "rasgado") {
    inv.rasgado = {
      ...inv.rasgado,
      monograma: b ? [inicial(d.a), inicial(b)] : undefined,
      padres: [
        { titulo: `La familia de ${d.a}`, nombres: ["Sus papás"] },
        { titulo: `La familia de ${b || d.a}`, nombres: ["Sus papás"] },
      ],
    };
  }
  if (inv.estilo === "jardin") inv.jardin = { ...inv.jardin, inicial: inicial(d.a) };
  if (inv.estilo === "cincuenta") inv.cincuenta = { ...inv.cincuenta, inicial: inicial(d.a), sigla: inicial(d.a) };
  if (inv.estilo === "orbita") inv.orbita = { ...inv.orbita, marca: d.a };
  if (inv.estilo === "ceramica") {
    inv.ceramica = { ...inv.ceramica, apellido: undefined, firma: d.a, familia: "Con mi familia", parasha: undefined };
  }
  if (inv.estilo === "horizonte") {
    inv.horizonte = { ...inv.horizonte, familia: "Junto a mi familia", parasha: undefined };
  }
  if (inv.estilo === "ciudad") {
    inv.ciudad = {
      ...inv.ciudad,
      // El nombre en hebreo y la parashá se verifican a mano al hacerla.
      hebreo: "",
      padres: "Con su familia",
      vinculo: d.t === "bat" ? "nuestra hija" : inv.ciudad.vinculo,
      velas: inv.ciudad.velas.map((v) => v.replace(/ (Kaplan|Grinberg)$/, "").replace(/ (Rosa y Samuel|Ana y León)$/, "")),
      parasha: { nombre: "Hashavua", hebreo: "פרשת השבוע", fechaHebrea: d.f ? fechaHebrea(d.f) : inv.ciudad.parasha.fechaHebrea },
    };
  }

  return { ...inv, slug: PREFIJO_VISTA + original.slug };
}

function fechaHebrea(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric" })
      .format(new Date(`${iso}T12:00:00`))
      .replace(/ A\.?\s?M\.?$/i, "");
  } catch {
    return "";
  }
}
