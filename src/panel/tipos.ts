/**
 * La forma del panel del organizador: invitados, salón, mesas y estilo.
 *
 * Todo el estado de un evento es UN documento. Se guarda entero cada vez, con
 * número de versión: si dos personas editan a la vez desde dos celulares, el
 * servidor rechaza la versión vieja en vez de pisar cambios en silencio.
 *
 * Este módulo lo importan el servidor y el navegador: nada de `node:` acá.
 */

/* ── Planes ────────────────────────────────────────────────────
   Esencial y Completa llevan la lista de invitados sola. Completa + suma el
   salón, las mesas y el estilo del panel. */

export type Plan = "esencial" | "completa" | "completa-plus";

export const NOMBRE_PLAN: Record<Plan, string> = {
  esencial: "Esencial",
  completa: "Completa",
  "completa-plus": "Completa +",
};

export const esPlanCompleto = (p: Plan) => p === "completa-plus";

/* ── Invitados ─────────────────────────────────────────────── */

export type Estado = "pendiente" | "confirmado" | "no-viene";

export const ESTADOS: { id: Estado; nombre: string }[] = [
  { id: "pendiente", nombre: "Sin respuesta" },
  { id: "confirmado", nombre: "Confirmado" },
  { id: "no-viene", nombre: "No viene" },
];

export type Invitado = {
  id: string;
  nombre: string;
  /** Familia o grupo: "Familia Pérez", "Amigos de la facu". Se sientan juntos. */
  grupo: string;
  /** Cuántas personas representa esta fila. Una familia puede ser una fila. */
  personas: number;
  estado: Estado;
  telefono: string;
  comidas: string[];
  notas: string;
  /** Id de la mesa (un elemento del salón) o null si todavía no tiene lugar. */
  mesa: string | null;
  /** "manual" si lo cargó el organizador; "rsvp" si apareció al confirmar. */
  origen: "manual" | "rsvp";
  /**
   * Nombres normalizados con los que este invitado confirmó o puede confirmar.
   * Así, si "Caro" confirma y el organizador la renombra a "Carolina Gómez",
   * la próxima confirmación sigue cayendo en la misma fila.
   */
  alias: string[];
  /** ISO de la última confirmación aplicada. Las más viejas se ignoran. */
  rsvp: string | null;
  cancion: string;
  /** Su invitación personal, si tiene. Ver `Enlace`. */
  enlace: Enlace | null;
};

/**
 * Una invitación personal: la misma invitación, con un link propio que dice
 * "Te esperamos, Familia Gómez" y sólo pregunta si vienen, cuántos y qué
 * comen. El token es el final de la URL: /i/<slug>/para/<token>.
 */
export type Enlace = {
  token: string;
  /** La línea grande. Ej: "Te esperamos, Familia Gómez". */
  saludo: string;
  /** Una línea chica opcional debajo. Ej: "Los esperamos también en la ceremonia". */
  nota: string;
  /** Hasta cuántas personas pueden confirmar con este link. */
  cupo: number;
};

/* ── Salón ─────────────────────────────────────────────────────
   Todo en metros. Las posiciones son del CENTRO del elemento: una mesa
   redonda se ubica por su centro y girar un rectángulo no lo desplaza. */

export type Clase =
  // Mesas
  | "redonda"
  | "rectangular"
  | "imperial"
  // Estructuras: ocupan lugar y no se pueden poner mesas encima
  | "pista"
  | "escenario"
  | "dj"
  | "barra"
  | "dulce"
  | "columna"
  | "bano"
  | "cocina"
  | "entrada"
  | "alfombra"
  | "estructura"
  // Zonas: áreas del lugar, no bloquean
  | "exterior"
  | "galeria";

export type Tipo = "mesa" | "estructura" | "zona";

export type Elemento = {
  id: string;
  tipo: Tipo;
  clase: Clase;
  nombre: string;
  /** Centro, en metros desde la esquina superior izquierda del plano. */
  x: number;
  y: number;
  /** En redondas, ancho = largo = diámetro. */
  ancho: number;
  largo: number;
  giro: 0 | 90;
  /** Sólo mesas. */
  capacidad?: number;
  /**
   * Sólo mesas: las familias o grupos de esta mesa ("Familia Gómez"). Si está
   * prendido `porEtiqueta`, quien confirme siendo de ese grupo cae acá solo.
   */
  etiquetas?: string[];
  /** Sólo mesas: la de los novios. Va primera y se marca distinto. */
  principal?: boolean;
};

export type Salon = {
  /** Metros. El plano completo del lugar, interior y exterior. */
  ancho: number;
  largo: number;
  elementos: Elemento[];
};

/* ── Estilo del panel ──────────────────────────────────────── */

export type Base = "papel" | "blanco" | "noche";
export type Fuente = "instrument" | "cormorant" | "montserrat";

export type Tema = {
  acento: string;
  base: Base;
  fuente: Fuente;
};

/* ── Ajustes ─────────────────────────────────────────────────
   Todo lo automático es opcional: hay parejas que quieren decidir silla por
   silla, y el panel no puede decidir por ellas sin permiso. */

export type Ajustes = {
  /** Quien confirma va solo a una mesa con lugar. */
  autoSentar: boolean;
  /** Quien confirma y es de un grupo etiquetado va a la mesa de ese grupo. */
  porEtiqueta: boolean;
  /** Evento cerrado: sólo confirma quien tiene su link personal. */
  cerrado: boolean;
  /** ISO. Las confirmaciones posteriores son "novedades" sin ver. */
  vistoHasta: string;
  /** "AAAA-MM-DD": hasta cuándo pueden confirmar. Vacío: sale del texto de la invitación. */
  limite: string;
};

export const AJUSTES_INICIALES: Ajustes = {
  autoSentar: false,
  porEtiqueta: true,
  cerrado: false,
  vistoHasta: new Date(0).toISOString(),
  limite: "",
};

/* ── El documento ──────────────────────────────────────────── */

export type DocPanel = {
  version: number;
  actualizado: string;
  invitados: Invitado[];
  salon: Salon;
  tema: Tema;
  ajustes: Ajustes;
  /**
   * Confirmaciones descartadas: nombre normalizado → ISO. Las confirmaciones
   * de ese nombre hasta esa fecha no vuelven a aparecer. Sin esto, borrar a
   * alguien que confirmó sería inútil: reaparecería en la próxima lectura.
   */
  descartes: Record<string, string>;
};

export const docVacio = (acento = "#2e6f4e"): DocPanel => ({
  version: 0,
  actualizado: new Date(0).toISOString(),
  invitados: [],
  salon: { ancho: 24, largo: 16, elementos: [] },
  tema: { acento, base: "papel", fuente: "instrument" },
  ajustes: { ...AJUSTES_INICIALES },
  descartes: {},
});
