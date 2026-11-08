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

/**
 * Una persona dentro de una fila de invitados. Una familia de cuatro es una
 * fila con cuatro miembros. Sólo hace falta guardarlos cuando tienen nombre
 * propio o se sientan aparte; el resto se deduce de `personas`.
 */
export type Miembro = {
  id: string;
  nombre: string;
  /** null: se sienta con su fila (`Invitado.mesa`). Con valor: en esa mesa, aparte. */
  mesa: string | null;
};

/** Dos filas que se sientan juntas o que se tienen que sentar lejos. */
export type Afinidad = {
  id: string;
  a: string;
  b: string;
  tipo: "juntos" | "separados";
};

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
  /** Las personas de la fila, con su nombre y, si se sientan aparte, su mesa. */
  miembros: Miembro[];
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

/* ── Equipo: quién se encarga de qué ─────────────────────────── */

export type Rubro =
  | "salon"
  | "catering"
  | "fotografia"
  | "video"
  | "musica"
  | "luces"
  | "ambientacion"
  | "torta"
  | "vestuario"
  | "belleza"
  | "ceremonia"
  | "show"
  | "cotillon"
  | "souvenirs"
  | "transporte"
  | "alojamiento"
  | "organizacion"
  | "otro";

export const RUBROS: { id: Rubro; nombre: string }[] = [
  { id: "salon", nombre: "Salón" },
  { id: "catering", nombre: "Catering" },
  { id: "fotografia", nombre: "Fotografía" },
  { id: "video", nombre: "Video" },
  { id: "musica", nombre: "DJ y música" },
  { id: "luces", nombre: "Luces y sonido" },
  { id: "ambientacion", nombre: "Ambientación y flores" },
  { id: "torta", nombre: "Torta y mesa dulce" },
  { id: "vestuario", nombre: "Vestuario" },
  { id: "belleza", nombre: "Maquillaje y peinado" },
  { id: "ceremonia", nombre: "Ceremonia" },
  { id: "show", nombre: "Show y animación" },
  { id: "cotillon", nombre: "Cotillón" },
  { id: "souvenirs", nombre: "Souvenirs" },
  { id: "transporte", nombre: "Traslados" },
  { id: "alojamiento", nombre: "Alojamiento" },
  { id: "organizacion", nombre: "Organización" },
  { id: "otro", nombre: "Otro" },
];

export const nombreRubro = (r: Rubro | null) => RUBROS.find((x) => x.id === r)?.nombre ?? "";

export type EstadoProveedor = "buscando" | "cotizando" | "contratado" | "descartado";

/** Un proveedor o alguien del entorno (la tía que hace los souvenirs). */
export type Responsable = {
  id: string;
  rubro: Rubro;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  estado: EstadoProveedor;
  /** true si es alguien del entorno y no un proveedor que cobra. */
  esPersona: boolean;
  notas: string;
};

/* ── Checklist ─────────────────────────────────────────────── */

export type Etapa = "12m" | "9m" | "6m" | "3m" | "1m" | "semana" | "dia" | "despues";

/** Cuántos días antes del evento vence cada etapa (negativo: después). */
export const ETAPAS: { id: Etapa; nombre: string; dias: number }[] = [
  { id: "12m", nombre: "Un año antes o más", dias: 365 },
  { id: "9m", nombre: "Nueve meses antes", dias: 270 },
  { id: "6m", nombre: "Seis meses antes", dias: 180 },
  { id: "3m", nombre: "Tres meses antes", dias: 90 },
  { id: "1m", nombre: "El último mes", dias: 30 },
  { id: "semana", nombre: "La última semana", dias: 7 },
  { id: "dia", nombre: "El día", dias: 0 },
  { id: "despues", nombre: "Después", dias: -14 },
];

export type Plantilla = "casamiento" | "quince" | "cumple" | "empresa";

export type Tarea = {
  id: string;
  titulo: string;
  hecha: boolean;
  /** ISO de cuándo se tildó. */
  hechaEl: string;
  etapa: Etapa;
  /** "AAAA-MM-DD". Vacío: sale de la etapa y la fecha del evento. */
  vence: string;
  responsableId: string | null;
  rubro: Rubro | null;
  notas: string;
  origen: "plantilla" | "manual";
};

/* ── Presupuesto ─────────────────────────────────────────────
   Pesos y dólares conviven: cada cotización y cada pago lleva su moneda y se
   suman por separado. El dólar de referencia es opcional y sólo sirve para
   mostrar un total en pesos. */

export type Moneda = "ARS" | "USD";

export const MONEDAS: Moneda[] = ["ARS", "USD"];

/** Una cotización que pasó un proveedor. Una sola por rubro es la elegida. */
export type Cotizacion = {
  id: string;
  rubro: Rubro;
  responsableId: string | null;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  elegida: boolean;
  notas: string;
};

export type Pago = {
  id: string;
  rubro: Rubro;
  responsableId: string | null;
  concepto: string;
  monto: number;
  moneda: Moneda;
  /** "AAAA-MM-DD" o "". */
  vence: string;
  pagado: boolean;
  /** "AAAA-MM-DD" o "". */
  pagadoEl: string;
};

export type Presupuesto = {
  /** Lo máximo que quieren gastar, por moneda. 0 = sin tope. */
  tope: Record<Moneda, number>;
  /** Cuántos pesos vale un dólar para sumar todo en pesos. 0 = no se suma. */
  dolar: number;
};

/* ── Cronograma del día ──────────────────────────────────────── */

/** Un momento de la fiesta, minuto a minuto. Es lo que se le pasa al DJ, al fotógrafo y al salón. */
export type Momento = {
  id: string;
  /** "HH:MM". */
  hora: string;
  titulo: string;
  lugar: string;
  /** Ids del equipo que tienen que estar atentos a este momento. */
  responsables: string[];
  notas: string;
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
  /** Proveedores y personas que se encargan de algo. */
  equipo: Responsable[];
  tareas: Tarea[];
  /** Qué plantilla de checklist se cargó. Vacío: todavía no eligieron. */
  plantilla: Plantilla | "";
  cotizaciones: Cotizacion[];
  pagos: Pago[];
  presupuesto: Presupuesto;
  momentos: Momento[];
  afinidades: Afinidad[];
};

export const docVacio = (acento = "#2e6f4e"): DocPanel => ({
  version: 0,
  actualizado: new Date(0).toISOString(),
  invitados: [],
  salon: { ancho: 24, largo: 16, elementos: [] },
  tema: { acento, base: "papel", fuente: "instrument" },
  ajustes: { ...AJUSTES_INICIALES },
  descartes: {},
  equipo: [],
  tareas: [],
  plantilla: "",
  cotizaciones: [],
  pagos: [],
  presupuesto: { tope: { ARS: 0, USD: 0 }, dolar: 0 },
  momentos: [],
  afinidades: [],
});
