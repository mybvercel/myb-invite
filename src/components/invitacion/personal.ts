/**
 * Lo que una invitación personal ("Te esperamos, Familia Gómez") le pasa a la
 * página. Sale del panel del organizador; ver `Enlace` en src/panel/tipos.ts.
 */
export type Personal = {
  token: string;
  nombre: string;
  saludo: string;
  nota: string;
  cupo: number;
  /** Lo que ya respondieron, para no hacerles llenar todo de nuevo. */
  respuesta: { asiste: boolean; personas: number; comidas: string[] } | null;
};
