/** Parseo de las fechas en español que se cargan en cada invitación. */

const MESES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9,
  noviembre: 10, diciembre: 11,
};

/**
 * Entiende "15 de Noviembre 2026" y "10 Diciembre 2026".
 * La hora por defecto es 20:00, que es cuando empieza una fiesta acá: la
 * cuenta regresiva tiene que llegar a cero cuando arranca el evento, no a
 * medianoche del día anterior.
 */
export function parsearFecha(texto: string, hora = 20): Date | null {
  const limpio = texto.toLowerCase();
  const dia = limpio.match(/\b(\d{1,2})\b/);
  const anio = limpio.match(/\b(20\d{2})\b/);
  const mes = Object.keys(MESES).find((m) => limpio.includes(m));

  if (!dia || !mes) return null;

  return new Date(
    anio ? Number(anio[1]) : new Date().getFullYear() + 1,
    MESES[mes],
    Number(dia[1]),
    hora,
  );
}

export type Faltante = { d: number; h: number; m: number; s: number };

export function calcularFaltante(objetivo: Date | null): Faltante | null {
  if (!objetivo) return null;

  const resto = objetivo.getTime() - Date.now();
  if (resto <= 0) return null;

  return {
    d: Math.floor(resto / 86_400_000),
    h: Math.floor((resto % 86_400_000) / 3_600_000),
    m: Math.floor((resto % 3_600_000) / 60_000),
    s: Math.floor((resto % 60_000) / 1000),
  };
}

/** "15 de Noviembre 2026" → "15.11.2026", como lo escribe una cabina de fotos. */
export function fechaConPuntos(texto: string) {
  const f = parsearFecha(texto);
  if (!f) return texto;
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${dos(f.getDate())}.${dos(f.getMonth() + 1)}.${f.getFullYear()}`;
}
