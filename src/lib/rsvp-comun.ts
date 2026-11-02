/**
 * Lo que comparten el formulario (cliente) y el almacén (servidor).
 *
 * Vive aparte a propósito: `rsvp.ts` importa `node:fs`, y si el formulario
 * importara de ahí, Next intentaría meter el módulo de disco en el bundle del
 * navegador y la página rompe en tiempo de ejecución. `tsc` no lo detecta.
 */

export const COMIDAS = [
  "Sin restricciones",
  "Vegetariano o vegano",
  "Sin TACC",
  "Sin lactosa",
] as const;

export type Confirmacion = {
  nombre: string;
  asiste: boolean;
  acompanantes: number;
  comidas: string[];
  cancion: string;
  /** ISO. Sirve para ordenar y para saber si alguien cambió de idea. */
  enviada: string;
  /** Token del link personal con el que confirmó, o "" si fue el general. */
  familia?: string;
};
