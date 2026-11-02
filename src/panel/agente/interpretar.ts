import type { Clase } from "../tipos";
import { convertirNumeros } from "./numeros";

/**
 * El intérprete: texto o voz en castellano rioplatense → una lista de acciones
 * sobre el salón. No inventa: lo que no entiende lo devuelve aparte para que
 * el organizador vea qué quedó afuera.
 *
 * Funciona en tres pasadas:
 * 1. Normaliza (minúsculas, sin tildes, números en dígitos, unidades).
 * 2. Parte el texto en frases y cada frase en "segmentos", uno por cosa
 *    nombrada. Así entiende también la voz, que llega sin comas:
 *    "hay doce mesas de diez una pista de seis por ocho en el centro".
 * 3. De cada segmento saca qué cosa es, cuántas, medidas, capacidad, dónde va
 *    y qué se quiere hacer (agregar, sacar, mover, cambiar medidas).
 *
 * Una frase sin cosa ("y que esté en el centro") hereda la cosa de la anterior.
 */

/* ── Tipos ─────────────────────────────────────────────────── */

export type Vertical = "fondo" | "centro" | "entrada";
export type Horizontal = "izquierda" | "centro" | "derecha";
export type Objetivo = Clase | "principal";

export type Posicion = {
  v?: Vertical;
  h?: Horizontal;
  /** "en las esquinas": se reparten en las cuatro. */
  esquinas?: boolean;
  rel?: { modo: "frente" | "junto" | "detras" | "alrededor" | "dentro"; objetivo: Objetivo };
};

export type Ref = { clase?: Clase | "mesa"; numero?: number; todas?: boolean; principal?: boolean };

type Base = { texto: string };

export type Accion = Base &
  (
    | { tipo: "salon"; ancho: number; largo: number }
    | { tipo: "reiniciar" }
    | { tipo: "invitados"; cantidad: number }
    | {
        tipo: "crear";
        clase: Clase;
        nombre?: string;
        cantidad: number;
        /** Sin número explícito: "mesas redondas de 10" (cuántas, lo decide la cantidad de invitados). */
        cantidadImplicita: boolean;
        ancho?: number;
        largo?: number;
        capacidad?: number;
        pos?: Posicion;
        principal?: boolean;
        /** "la pista": si ya existe, se modifica en vez de crear otra. */
        definido: boolean;
        /** "hay 12 mesas" (total) y no "agregá 12 mesas" (suma). */
        estado: boolean;
        invitados?: number;
      }
    | { tipo: "mover"; ref: Ref; pos: Posicion }
    | { tipo: "medidas"; ref: Ref; ancho: number; largo: number }
    | { tipo: "quitar"; ref: Ref; cantidad?: number }
    | { tipo: "capacidad"; ref: Ref; capacidad: number }
    | { tipo: "nombrar"; ref: Ref; nombre: string }
    | { tipo: "etiquetar"; ref: Ref; etiquetas: string[] }
    | { tipo: "principal"; ref: Ref }
    | { tipo: "sentar"; quien: string; ref: Ref }
  );

export type Interpretacion = { acciones: Accion[]; sinEntender: string[] };

/* ── Normalización ─────────────────────────────────────────────
   Carácter por carácter, así el texto normalizado mide lo mismo que el
   original y un nombre encontrado en uno se puede recortar del otro con sus
   mayúsculas y tildes ("Familia Gómez", no "familia gomez"). */

const plano = (s: string) =>
  [...s].map((c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().charAt(0) || " ").join("");

/** Unidades y signos a una sola forma: "6x8 mts" → "6 por 8 m". */
function unidades(t: string) {
  return convertirNumeros(t)
    .replace(/(\d+(?:\.\d+)?)\s*cm\b/g, (_, n: string) => `${Number(n) / 100} m`)
    .replace(/(\d)\s*(?:m2|mts2|mt2|m²|metros cuadrados|metros2)\b/g, "$1 m2")
    .replace(/(\d)\s*(?:metros|metro|mts|mt|mtrs)\b\.?/g, "$1 m")
    .replace(/(\d(?:\.\d+)?)\s*(?:m\s*)?(?:x|×|\*)\s*(\d)/g, "$1 por $2")
    .replace(/\s+/g, " ")
    .trim();
}

/* ── Vocabulario ─────────────────────────────────────────────── */

type Cosa = { clase: Clase | "salon"; nombre?: string; principal?: boolean };

/** Del más específico al más general: "mesa dulce" antes que "mesa". */
const COSAS: [RegExp, Cosa][] = [
  [/\b(?:mesas? dulces?|candy(?: bar)?|mesas? de postres?|postres)\b/g, { clase: "dulce" }],
  [/\b(?:mesas? (?:del? )?dj|cabinas? (?:del? )?dj|\bdj\b|disc ?jockey|consola)\b/g, { clase: "dj" }],
  [/\b(?:cabinas? de fotos?|photo ?booth|espejo magico)\b/g, { clase: "estructura", nombre: "Cabina de fotos" }],
  [/\b(?:mesas? (?:principal(?:es)?|de (?:los )?novios|de honor|presidencial)|principal)\b/g, { clase: "imperial", principal: true }],
  [/\b(?:mesas? imperial(?:es)?|mesas? (?:largas?|corridas?|de banquete)|imperial(?:es)?|tablones?)\b/g, { clase: "imperial" }],
  [/\b(?:mesas? rectangular(?:es)?|mesas? cuadrad[oa]s?|rectangular(?:es)?)\b/g, { clase: "rectangular" }],
  [/\b(?:mesas? redond[oa]s?|redond[oa]s|mesitas?|mesas?)\b/g, { clase: "redonda" }],
  [/\b(?:pistas?(?: de baile)?|dance ?floor)\b/g, { clase: "pista" }],
  [/\b(?:alfombras?(?: roja)?|camino de (?:los )?novios|pasillo central|pasarela)\b/g, { clase: "alfombra" }],
  [/\b(?:escenarios?|tarimas?|banda|musicos)\b/g, { clase: "escenario" }],
  [/\b(?:barras?(?: de tragos| libre)?|bar|tragos)\b/g, { clase: "barra" }],
  [/\b(?:banos?|sanitarios|toilettes?)\b/g, { clase: "bano" }],
  [/\b(?:cocinas?|catering|office)\b/g, { clase: "cocina" }],
  [/\b(?:entradas?|puertas?|accesos?|recepcion)\b/g, { clase: "entrada" }],
  [/\b(?:columnas?|pilar(?:es)?)\b/g, { clase: "columna" }],
  [/\b(?:livings?|sillones|lounge|puffs?)\b/g, { clase: "estructura", nombre: "Living" }],
  [/\b(?:guardarropas?)\b/g, { clase: "estructura", nombre: "Guardarropa" }],
  [/\b(?:jardin(?:es)?|parque|exterior|patio|deck|parquizado|afuera)\b/g, { clase: "exterior" }],
  [/\b(?:galerias?|terrazas?|semicubierto|pergola|glorieta)\b/g, { clase: "galeria" }],
  [/\b(?:salon|lugar|espacio|local|quincho|galpon|terreno|predio|plano)\b/g, { clase: "salon" }],
];

const MESAS: Clase[] = ["redonda", "rectangular", "imperial"];

/** Una cosa nombrada DESPUÉS de estas palabras es una referencia, no algo nuevo. */
const PREVIO_RELATIVO =
  /(?:frente|enfrente|delante|adelante|lado|junto|cerca|detras|atras|alrededor|pegad[oa]s?|entre|contra|mirando|hacia|en|dentro)\s+(?:a|de|del|al|con)?\s*(?:l[oa]s?\s+|el\s+)?(?:\d+\s+)?$/;

const VERBO =
  /^(?:hay|y|que|quiero|queremos|necesito|necesitamos|tambien|ademas|agrega\w*|suma\w*|anade\w*|pone\w*|pon|poneme|coloca\w*|ubica\w*|mete\w*|saca\w*|borra\w*|quita\w*|elimina\w*|move\w*|mueve\w*|corre\w*|lleva\w*|agranda\w*|achica\w*|cambia\w*|hace\w*|arma\w*|el|la|los|las|un|una|unos|unas|otra|otro|otras|otros|\d+(?:\.\d+)?)$/;

const QUITAR = /\b(?:saca\w*|saque\w*|borra\w*|quita\w*|elimina\w*|remove\w*|sin)\b/;
const MOVER = /\b(?:move\w*|mueve\w*|corre(?:la|lo|las|los|r)?|lleva\w*|desplaza\w*|cambia\w* de lugar|reubica\w*)\b/;
const REDIMENSIONAR = /\b(?:agranda\w*|achica\w*|amplia\w*|reduci\w*|cambia\w*|modifica\w*|hace\w* (?:la|el) \w+ de)\b/;
const SUMAR = /\b(?:agrega\w*|suma\w*|anade\w*|pone\w*|pon|coloca\w*|ubica\w*|mete\w*|otras?|otros?|mas|extra)\b/;

/* ── Extractores ─────────────────────────────────────────────── */

const num = (s: string | undefined) => (s === undefined ? undefined : Number(s));

function medidasDe(t: string): { ancho: number; largo: number } | { area: number } | { lado: number; de?: string } | null {
  const par = t.match(/(\d+(?:\.\d+)?)\s*m?\s*por\s*(\d+(?:\.\d+)?)/);
  if (par) return { ancho: Number(par[1]), largo: Number(par[2]) };
  const area = t.match(/(\d+(?:\.\d+)?)\s*m2\b/);
  if (area) return { area: Number(area[1]) };
  const diam = t.match(/diametro\s+(?:de\s+)?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*m?\s+de\s+diametro/);
  if (diam) return { lado: Number(diam[1] ?? diam[2]), de: "diametro" };
  const lado = t.match(/(\d+(?:\.\d+)?)\s*m\b(?:\s+de\s+(largo|ancho|diametro|lado))?/);
  if (lado) return { lado: Number(lado[1]), de: lado[2] };
  return null;
}

/** Capacidad de mesa: "de 10", "para 10 personas", "con 8 sillas", "10 cada una". */
function capacidadDe(t: string) {
  const m =
    t.match(/(\d+)\s*(?:personas|invitados|lugares|sillas|comensales|pax)?\s+(?:cada una|c\/u|por mesa)/) ??
    t.match(/\bde a\s+(\d+)\b/) ??
    t.match(/\b(?:de|para|con)\s+(\d+)\s*(?:personas|invitados|lugares|sillas|comensales|pax)\b/) ??
    t.match(/\b(?:de|para)\s+(\d+)\b(?!\s*(?:m\b|m2|por|\.\d))/);
  const n = num(m?.[1]);
  return n && n >= 2 && n <= 40 ? n : undefined;
}

/** Invitados totales: "para 150 invitados", "somos 120". */
function invitadosDe(t: string) {
  const m =
    t.match(/(\d+)\s*(?:invitados|personas|comensales)\b(?!\s*cada)/) ??
    t.match(/\b(?:somos|seremos|vienen|van a venir|son)\s+(\d+)\b/);
  const n = num(m?.[1]);
  return n && n > 12 ? n : undefined;
}

function posicionDe(t: string): Posicion | undefined {
  const pos: Posicion = {};

  const rel = t.match(
    /\b(frente|enfrente|delante|adelante|mirando|al lado|junto|cerca|pegad[oa]s?|detras|atras|alrededor|dentro|adentro|en)\s+(?:a|de|del|al|con)?\s*(?:l[oa]s?\s+|el\s+)?(mesa principal|mesa de (?:los )?novios|principal|pista|escenario|tarima|barra|bar|dj|cabina|mesa dulce|banos?|cocina|entrada|puerta|jardin|parque|patio|exterior|galeria|terraza|deck)\b/,
  );
  if (rel) {
    const objetivo = objetivoDe(rel[2]);
    const palabra = rel[1];
    const modo: NonNullable<Posicion["rel"]>["modo"] =
      /^(frente|enfrente|delante|adelante|mirando)$/.test(palabra) ? "frente"
      : /^(detras|atras)$/.test(palabra) ? "detras"
      : palabra === "alrededor" ? "alrededor"
      : /^(dentro|adentro|en)$/.test(palabra) ? "dentro"
      : "junto";
    // "en la pista" no tiene sentido como lugar para poner algo, salvo zonas.
    if (objetivo && (modo !== "dentro" || objetivo === "exterior" || objetivo === "galeria")) pos.rel = { modo, objetivo };
  }

  const sinRel = rel ? t.replace(rel[0], " ") : t;

  if (/\besquinas\b/.test(sinRel)) pos.esquinas = true;
  if (/\b(?:centrad[oa]s?|centro|medio|mitad|central)\b/.test(sinRel)) {
    pos.h = "centro";
    pos.v = "centro";
  }
  if (/\b(?:fondo|atras|arriba|pared del fondo|al final)\b/.test(sinRel)) pos.v = "fondo";
  if (/\b(?:adelante|abajo|al frente|la entrada|la puerta|el ingreso)\b/.test(sinRel)) pos.v = "entrada";
  if (/\bizquierd[oa]s?\b/.test(sinRel)) pos.h = "izquierda";
  if (/\bderech[oa]s?\b/.test(sinRel)) pos.h = "derecha";
  // "centrada al fondo": centrada en horizontal, al fondo en vertical.
  if (pos.v && pos.v !== "centro" && /\bcentrad[oa]s?\b/.test(sinRel)) pos.h = pos.h ?? "centro";
  if (pos.h && pos.h !== "centro" && pos.v === "centro" && !/\b(?:centro|medio|mitad)\b/.test(sinRel)) delete pos.v;

  return pos.v || pos.h || pos.rel || pos.esquinas ? pos : undefined;
}

function objetivoDe(palabra: string): Objetivo | undefined {
  for (const [re, cosa] of COSAS) {
    re.lastIndex = 0;
    if (re.test(palabra)) {
      if (cosa.principal) return "principal";
      return cosa.clase === "salon" ? undefined : cosa.clase;
    }
  }
  return undefined;
}

/* ── Nombres propios (con sus mayúsculas) ──────────────────── */

const CORTE = /\s(?:y (?:que|hay|la|el|las|los|una|un|\d)|hay|la pista|el escenario|la barra|\d+ mesas?)\b|[,.;]/;

function recortarNombre(original: string, desde: number, base: string) {
  let resto = base.slice(desde);
  const corte = resto.match(CORTE);
  if (corte?.index !== undefined) resto = resto.slice(0, corte.index);
  let texto = original.slice(desde, desde + resto.length).trim();
  texto = texto.replace(/^(?:la|el|los|las|a la|a los|a)\s+/i, "").replace(/["“”']/g, "").trim();
  return texto
    .split(/\s+/)
    .map((p, i) => (i > 0 && /^(de|del|y|la|los|las|el)$/i.test(p) ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ")
    .slice(0, 40);
}

const REF_MESA = /mesa\s+(?:n(?:ro|umero)?\.?\s*)?(\d+|[a-z]+)/;

function refMesa(texto: string): Ref | null {
  if (/\bmesa (?:principal|de (?:los )?novios|de honor)\b/.test(texto)) return { clase: "mesa", principal: true };
  const m = texto.match(REF_MESA);
  if (!m) return null;
  const n = Number(convertirNumeros(m[1]));
  return Number.isFinite(n) && n > 0 ? { clase: "mesa", numero: n } : null;
}

/**
 * Órdenes sobre mesas que ya existen: nombrar, etiquetar, principal, sentar.
 * Se buscan antes de partir en segmentos porque llevan nombres adentro
 * ("Mesa Familia Gómez" tiene la palabra mesa y rompería el corte).
 */
function ordenesDeMesa(original: string, base: string, acciones: Accion[]): string {
  let resto = base;
  const consumir = (desde: number, hasta: number) => {
    resto = resto.slice(0, desde) + " ".repeat(hasta - desde) + resto.slice(hasta);
  };

  const principal = resto.match(/\b(?:la\s+)?mesa\s+(?:n(?:ro|umero)?\.?\s*)?(\d+|[a-z]+)\s+(?:es|sea|sera|va a ser|queda como|como)\s+(?:la\s+)?(?:principal|de (?:los )?novios|de honor)\b/);
  if (principal?.index !== undefined) {
    const ref = refMesa(principal[0]);
    if (ref) {
      acciones.push({ tipo: "principal", ref, texto: principal[0].trim() });
      consumir(principal.index, principal.index + principal[0].length);
    }
  }

  const nombrar =
    /\b(?:la\s+)?mesa\s+(?:n(?:ro|umero)?\.?\s*)?(\d+|[a-z]+)\s+(?:se llama|se va a llamar|se llamara|que se llame|llamala|ponele de nombre|ponele)\s+/.exec(resto) ??
    /\b(?:renombra\w*|llama\w*|nombra\w*|ponele (?:de )?nombre)\s+(?:a\s+)?(?:la\s+)?mesa\s+(?:n(?:ro|umero)?\.?\s*)?(\d+|[a-z]+)\s+(?:como|a|con)\s+/.exec(resto);
  if (nombrar) {
    const ref = refMesa(nombrar[0].replace(/^.*?(mesa)/, "$1"));
    const inicio = nombrar.index + nombrar[0].length;
    const nombre = recortarNombre(original, inicio, base);
    if (ref && nombre) {
      acciones.push({ tipo: "nombrar", ref, nombre, texto: (nombrar[0] + nombre).trim() });
      const fin = base.slice(inicio).search(CORTE);
      consumir(nombrar.index, fin >= 0 ? inicio + fin : base.length);
    }
  }

  let etiquetar =
    /\b(?:la\s+)?mesa\s+(?:n(?:ro|umero)?\.?\s*)?(\d+|[a-z]+)\s+(?:es|sera|va a ser|queda|va)\s+(?:para|de)\s+/.exec(resto) ??
    /\betiqueta\w*\s+(?:la\s+)?mesa\s+(?:n(?:ro|umero)?\.?\s*)?(\d+|[a-z]+)\s+(?:como|con|para)\s+/.exec(resto);
  // "la mesa 2 es de 12" es capacidad, no una familia llamada "12".
  if (etiquetar && /^\d/.test(convertirNumeros(resto.slice(etiquetar.index + etiquetar[0].length).trim()))) etiquetar = null;
  if (etiquetar) {
    const ref = refMesa(etiquetar[0].replace(/^.*?(mesa)/, "$1"));
    const inicio = etiquetar.index + etiquetar[0].length;
    const fin = base.slice(inicio).search(/[,.;]|\s(?:hay|la pista|el escenario|la barra|\d+ mesas?)\b/);
    const hasta = fin >= 0 ? inicio + fin : base.length;
    const etiquetas = original
      .slice(inicio, hasta)
      .split(/\s+y\s+|\s*,\s*/i)
      .map((p) => recortarNombre(p, 0, plano(p)))
      .filter((e) => e.length > 1);
    if (ref && etiquetas.length) {
      acciones.push({ tipo: "etiquetar", ref, etiquetas, texto: base.slice(etiquetar.index, hasta).trim() });
      consumir(etiquetar.index, hasta);
    }
  }

  const sentar = /\b(?:senta\w*|sienta\w*|ubica\w*|pone\w*|pon|mete\w*|manda\w*)\s+a\s+(.+?)\s+en\s+(?:la\s+)?mesa\s+(?:n(?:ro|umero)?\.?\s*)?(\d+|[a-z]+)\b/.exec(resto);
  if (sentar) {
    const ref = refMesa(sentar[0].slice(sentar[0].lastIndexOf("mesa")));
    const inicioQuien = sentar.index + sentar[0].indexOf(sentar[1], sentar[0].indexOf(" a ") + 1);
    const quien = recortarNombre(original, inicioQuien, base).replace(/\s+[Ee]n\s+.*$/, "");
    if (ref && quien) {
      acciones.push({ tipo: "sentar", quien, ref, texto: sentar[0].trim() });
      consumir(sentar.index, sentar.index + sentar[0].length);
    }
  }

  const capacidad = resto.match(/\b(?:todas las mesas|las mesas|cada mesa)\s+(?:son|sean|van|tienen|tengan|de|para|con)\s+(?:de\s+|para\s+|con\s+)?(\d+|[a-z]+)\b(?!\s*(?:m\b|metros|por|x\b))/);
  if (capacidad?.index !== undefined) {
    const n = Number(convertirNumeros(capacidad[1]));
    if (n >= 2 && n <= 40) {
      acciones.push({ tipo: "capacidad", ref: { clase: "mesa", todas: true }, capacidad: n, texto: capacidad[0].trim() });
      consumir(capacidad.index, capacidad.index + capacidad[0].length);
    }
  }

  return resto;
}

/* ── Partir en frases y segmentos ──────────────────────────── */

function frases(base: string) {
  // Punto, punto y coma, salto de línea y coma que no sea decimal.
  const cortes: [number, number][] = [];
  let desde = 0;
  const re = /[.;\n!?]+(?!\d)|,(?!\d)/g;
  for (let m = re.exec(base); m; m = re.exec(base)) {
    if (m[0] === "." && /\d$/.test(base.slice(0, m.index)) && /^\d/.test(base.slice(m.index + 1))) continue;
    cortes.push([desde, m.index]);
    desde = m.index + m[0].length;
  }
  cortes.push([desde, base.length]);
  return cortes.filter(([a, b]) => base.slice(a, b).trim());
}

type Segmento = { texto: string; cosa?: Cosa; inicioCosa: number; finCosa: number };

/** Parte una frase ya normalizada en un segmento por cada cosa nombrada. */
function segmentos(t: string): Segmento[] {
  const tomadas: { a: number; b: number; cosa: Cosa }[] = [];
  for (const [re, cosa] of COSAS) {
    re.lastIndex = 0;
    for (let m = re.exec(t); m; m = re.exec(t)) {
      const a = m.index;
      const b = a + m[0].length;
      if (tomadas.some((x) => a < x.b && x.a < b)) continue;
      // Referencias ("alrededor de la pista", "en el salón") no abren segmento.
      if (PREVIO_RELATIVO.test(t.slice(Math.max(0, a - 40), a))) continue;
      tomadas.push({ a, b, cosa });
    }
  }
  tomadas.sort((x, y) => x.a - y.a);

  if (!tomadas.length) return [{ texto: t, inicioCosa: -1, finCosa: -1 }];

  // Cada segmento arranca en las palabras que presentan a la cosa: "hay",
  // "una", "12", "sacá la". Lo que va antes de la primera cosa queda con ella.
  const inicios = tomadas.map((x, i) => {
    if (i === 0) return 0;
    const palabras = t.slice(0, x.a).trimEnd().split(" ");
    let j = palabras.length;
    const limite = tomadas[i - 1].b;
    let pos = t.slice(0, x.a).trimEnd().length;
    while (j > 0 && VERBO.test(palabras[j - 1]) && pos - palabras[j - 1].length > limite) {
      // Un número pegado a "por", "de", "mide"... es una medida o una
      // capacidad de la cosa anterior: ahí se corta.
      if (/^\d/.test(palabras[j - 1]) && /^(?:por|de|para|mide|miden|mida|x|m)$/.test(palabras[j - 2] ?? "")) break;
      pos -= palabras[j - 1].length + 1;
      j--;
    }
    return Math.max(limite, pos);
  });

  return tomadas.map((x, i) => {
    let a = inicios[i];
    while (t[a] === " ") a++;
    const b = i + 1 < tomadas.length ? inicios[i + 1] : t.length;
    return { texto: t.slice(a, b).trim(), cosa: x.cosa, inicioCosa: x.a - a, finCosa: x.b - a };
  });
}

/* ── Un segmento → acción ──────────────────────────────────── */

function contarAntes(t: string, inicioCosa: number) {
  const ultima = t.slice(0, Math.max(0, inicioCosa)).trim().split(" ").at(-1) ?? "";
  return /^\d+$/.test(ultima) ? Number(ultima) : undefined;
}

function accionDe(seg: Segmento, previo: Cosa | undefined, sin: string[]): { accion?: Accion; cosa?: Cosa } {
  const t = seg.texto;
  const cosa = seg.cosa ?? previo;
  const pos = posicionDe(seg.cosa ? t.slice(0, seg.inicioCosa) + " " + t.slice(seg.finCosa) : t);
  const medidas = medidasDe(t);
  const texto = t;

  // Sin cosa y sin nada que heredar.
  if (!cosa) {
    const inv = invitadosDe(t);
    if (inv) return { accion: { tipo: "invitados", cantidad: inv, texto } };
    const util = t.replace(/\b(?:hola|quiero|queremos|que|por favor|gracias|y|el|la|los|las|de|en|un|una|con|todo|bien|asi|ok|dale|listo)\b/g, "").trim();
    if (util.length > 3) sin.push(t);
    return {};
  }

  if (cosa.clase === "salon") {
    if (medidas && "ancho" in medidas) return { accion: { tipo: "salon", ancho: medidas.ancho, largo: medidas.largo, texto }, cosa };
    if (medidas && "area" in medidas) {
      const ancho = Math.round(Math.sqrt((medidas.area * 4) / 3) * 2) / 2;
      return { accion: { tipo: "salon", ancho, largo: Math.round((medidas.area / ancho) * 2) / 2, texto }, cosa };
    }
    const inv = invitadosDe(t);
    if (inv) return { accion: { tipo: "invitados", cantidad: inv, texto } };
    return { cosa };
  }

  const clase = cosa.clase;
  const esMesa = MESAS.includes(clase);
  const definido = /\b(?:el|la|los|las|esa|ese|esas|esos)\s*$/.test(t.slice(0, Math.max(0, seg.inicioCosa)).trim() + " ") ||
    /\b(?:el|la|los|las)\s+$/.test(t.slice(0, Math.max(0, seg.inicioCosa)));
  const plural = /s\b/.test(t.slice(seg.inicioCosa, seg.finCosa).split(" ")[0] ?? "");
  const cuenta = contarAntes(t, seg.inicioCosa);
  const ref: Ref = { clase: esMesa && !cosa.principal ? "mesa" : clase, principal: cosa.principal, todas: definido && plural };

  // "la mesa 3": una mesa que ya existe, por número.
  const numeroMesa = esMesa
    ? t.slice(seg.inicioCosa).match(/^mesas?\s+(?:n(?:ro|umero)?\.?\s*)?(\d+)\b(?!\s*(?:m\b|m2|por|personas|invitados|lugares|sillas|comensales))/)
    : null;
  if (numeroMesa) {
    const r: Ref = { clase: "mesa", numero: Number(numeroMesa[1]) };
    const resto = t.slice(seg.inicioCosa + numeroMesa[0].length);
    if (QUITAR.test(t)) return { accion: { tipo: "quitar", ref: r, texto }, cosa };
    if (medidas && "ancho" in medidas) return { accion: { tipo: "medidas", ref: r, ancho: medidas.ancho, largo: medidas.largo, texto }, cosa };
    const cap = capacidadDe(resto);
    if (cap) return { accion: { tipo: "capacidad", ref: r, capacidad: cap, texto }, cosa };
    const p = posicionDe(resto);
    if (p) return { accion: { tipo: "mover", ref: r, pos: p, texto }, cosa };
    sin.push(t);
    return { cosa };
  }

  // Heredado de la frase anterior: sólo mueve o cambia medidas.
  if (!seg.cosa) {
    if (medidas && "ancho" in medidas) return { accion: { tipo: "medidas", ref, ancho: medidas.ancho, largo: medidas.largo, texto }, cosa };
    if (pos) return { accion: { tipo: "mover", ref, pos, texto }, cosa };
    const cap = esMesa ? capacidadDe(t) : undefined;
    if (cap) return { accion: { tipo: "capacidad", ref, capacidad: cap, texto }, cosa };
    const inv = invitadosDe(t);
    if (inv) return { accion: { tipo: "invitados", cantidad: inv, texto } };
    if (t.replace(/\b(?:y|que|este|esten|esta|estan|va|van|sea|sean)\b/g, "").trim().length > 3) sin.push(t);
    return { cosa };
  }

  if (QUITAR.test(t)) return { accion: { tipo: "quitar", ref: { ...ref, todas: plural && !cuenta }, cantidad: cuenta, texto }, cosa };
  if (MOVER.test(t) && pos) return { accion: { tipo: "mover", ref, pos, texto }, cosa };
  if (REDIMENSIONAR.test(t) && medidas && "ancho" in medidas) {
    return { accion: { tipo: "medidas", ref, ancho: medidas.ancho, largo: medidas.largo, texto }, cosa };
  }

  // Crear (o, si ya existe y se nombra con artículo, ajustar: lo decide aplicar).
  let ancho: number | undefined;
  let largo: number | undefined;
  if (medidas && "ancho" in medidas) ({ ancho, largo } = medidas);
  else if (medidas && "area" in medidas) ancho = largo = Math.round(Math.sqrt(medidas.area) * 10) / 10;
  else if (medidas && "lado" in medidas) {
    if (clase === "redonda" || medidas.de === "diametro" || !medidas.de) ancho = largo = medidas.lado;
    if (clase !== "redonda" && medidas.de === "largo") ancho = medidas.lado;
    if (clase !== "redonda" && medidas.de === "ancho") largo = medidas.lado;
  }

  const capacidad = esMesa ? capacidadDe(t.slice(seg.inicioCosa)) : undefined;
  const invitados = esMesa ? invitadosDe(t) : undefined;
  const nombre = cosa.nombre ?? (cosa.principal ? "Principal" : undefined);

  return {
    accion: {
      tipo: "crear",
      clase,
      nombre,
      cantidad: cuenta ?? (plural && esMesa && !cosa.principal ? 0 : 1),
      cantidadImplicita: cuenta === undefined && plural && esMesa,
      ancho,
      largo,
      capacidad,
      pos,
      principal: cosa.principal,
      definido,
      estado: !SUMAR.test(t),
      invitados: invitados && capacidad !== invitados ? invitados : undefined,
      texto,
    },
    cosa,
  };
}

/* ── Entrada ─────────────────────────────────────────────────── */

const REINICIAR =
  /\b(?:de (?:nuevo|cero)|desde cero|empeza\w*(?: todo)? (?:de nuevo|otra vez)|borra\w* todo|limpia\w* (?:todo|el plano)|rehace\w* todo|vaciar el plano|vacia\w* el plano)\b/;

export function interpretar(texto: string): Interpretacion {
  const acciones: Accion[] = [];
  const sinEntender: string[] = [];
  const original = texto.slice(0, 4000);
  const base = plano(original);

  if (REINICIAR.test(base)) acciones.push({ tipo: "reiniciar", texto: base.match(REINICIAR)![0] });

  let previo: Cosa | undefined;

  for (const [a, b] of frases(base)) {
    const baseFrase = base.slice(a, b).replace(REINICIAR, " ");
    const origFrase = original.slice(a, b);
    const antes = acciones.length;

    const resto = ordenesDeMesa(origFrase, baseFrase, acciones);

    // "Familia B y Familia C" que quedaron sueltas después de una coma se
    // suman a las etiquetas de la orden anterior.
    const ultima = acciones.at(-1);
    if (acciones.length === antes && ultima?.tipo === "etiquetar" && !segmentos(unidades(resto))[0].cosa && !/\d/.test(resto)) {
      const extra = origFrase.split(/\s+y\s+/i).map((p) => recortarNombre(p, 0, plano(p))).filter((e) => e.length > 1);
      if (extra.length) {
        ultima.etiquetas.push(...extra);
        continue;
      }
    }

    const t = unidades(resto);
    if (!t.replace(/[^a-z0-9]/g, "")) continue;

    // La "y" también separa frases, salvo en medidas y números ("6 por 8 y
    // medio" ya se convirtió antes).
    for (const parte of t.split(/\s+(?:y|e|ademas|tambien|despues|luego)\s+(?=(?:hay|que|la|el|los|las|un|una|\d|esta|estan|va|van|sea|sean|poner|pone|agrega|saca|move|quiero|mide|miden|tiene)\b)/)) {
      for (const seg of segmentos(parte)) {
        const r = accionDe(seg, previo, sinEntender);
        const ultimaAccion = acciones.at(-1);
        // "la pista mide 6 por 8 y está en el centro": la segunda parte
        // completa a la pista que se está creando, no mueve otra.
        if (!seg.cosa && r.accion && ultimaAccion?.tipo === "crear" && previo === r.cosa) {
          if (r.accion.tipo === "mover") {
            ultimaAccion.pos = { ...ultimaAccion.pos, ...r.accion.pos };
            continue;
          }
          if (r.accion.tipo === "medidas") {
            ultimaAccion.ancho = r.accion.ancho;
            ultimaAccion.largo = r.accion.largo;
            continue;
          }
          if (r.accion.tipo === "capacidad") {
            ultimaAccion.capacidad = r.accion.capacidad;
            continue;
          }
        }
        if (r.accion) acciones.push(r.accion);
        if (r.cosa) previo = r.cosa;
      }
    }
  }

  return { acciones, sinEntender };
}
