/**
 * Números escritos en palabras → dígitos. La voz del navegador a veces
 * devuelve "doce mesas" y a veces "12 mesas": el intérprete trabaja siempre
 * con dígitos.
 *
 * Recibe texto ya normalizado (minúsculas, sin tildes).
 */

const UNIDADES: Record<string, number> = {
  cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
  dieciocho: 18, diecinueve: 19, veinte: 20, veintiun: 21, veintiuno: 21, veintiuna: 21, veintidos: 22,
  veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28,
  veintinueve: 29,
};

const DECENAS: Record<string, number> = {
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
};

const CENTENAS: Record<string, number> = {
  cien: 100, ciento: 100, doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300,
  cuatrocientos: 400, cuatrocientas: 400, quinientos: 500, quinientas: 500, seiscientos: 600,
  seiscientas: 600, setecientos: 700, setecientas: 700, ochocientos: 800, ochocientas: 800,
  novecientos: 900, novecientas: 900,
};

const VALOR: Record<string, number> = { ...UNIDADES, ...DECENAS, ...CENTENAS };
const PALABRA = Object.keys(VALOR).concat("mil").sort((a, b) => b.length - a.length).join("|");

/**
 * Una corrida de palabras numéricas → uno o más números. "ciento veinte" es
 * uno solo, pero "diez una" (de "mesas de diez, una pista") son dos: una
 * unidad no puede seguir a otra, así que ahí se corta.
 */
function numerosDe(palabras: string[]): number[] {
  const salida: number[] = [];
  let total = 0;
  let actual = 0;
  let ultimo: "centena" | "decena" | "unidad" | "mil" | null = null;

  const cerrar = () => {
    if (ultimo !== null) salida.push(total + actual);
    total = 0;
    actual = 0;
    ultimo = null;
  };

  for (const p of palabras) {
    if (p === "mil") {
      total += (actual || 1) * 1000;
      actual = 0;
      ultimo = "mil";
      continue;
    }
    const tipo = p in CENTENAS ? "centena" : p in DECENAS ? "decena" : "unidad";
    const sigue =
      ultimo === null ||
      ultimo === "mil" ||
      (ultimo === "centena" && tipo !== "centena");
    if (!sigue) cerrar();
    actual += VALOR[p] ?? 0;
    ultimo = tipo;
  }
  cerrar();
  return salida;
}

export function convertirNumeros(t: string): string {
  return (
    t
      // 2,5 → 2.5 (la coma decimal no puede partir la frase después)
      .replace(/(\d),(\d)/g, "$1.$2")
      // "treinta y dos" antes que nada: la "y" de ahí no separa frases.
      .replace(new RegExp(`\\b(${Object.keys(DECENAS).join("|")}) y (${Object.keys(UNIDADES).filter((u) => UNIDADES[u] > 0 && UNIDADES[u] < 10).join("|")})\\b`, "g"), (_, d: string, u: string) => ` ${DECENAS[d] + UNIDADES[u]} `)
      .replace(/\bmedia docena\b/g, " 6 ")
      .replace(/\b(?:una )?docena\b/g, " 12 ")
      .replace(new RegExp(`\\b(?:${PALABRA})(?:\\s+(?:${PALABRA}))*\\b`, "g"), (corrida) => ` ${numerosDe(corrida.trim().split(/\s+/)).join(" ")} `)
      // "2 y medio", "1 metro y medio" → 2.5, 1.5 metros
      .replace(/(\d+(?:\.\d+)?)\s+(metros?|m)\s+y\s+medio\b/g, (_, n: string, m: string) => `${Number(n) + 0.5} ${m}`)
      .replace(/(\d+(?:\.\d+)?)\s+y\s+medi[oa]\b/g, (_, n: string) => `${Number(n) + 0.5}`)
      .replace(/\s+/g, " ")
      .trim()
  );
}
