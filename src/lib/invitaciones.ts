/**
 * Contenido de Tu Invitación Digital. Todo lo que se muestra en la página sale
 * de acá, para que cambiar un precio o sumar una reseña no obligue a tocar JSX.
 */

export type TipoEvento = "bodas" | "cumples" | "profesional";
export type Moneda = "ARS" | "USD";

/* ── Tipos de evento ───────────────────────────────────────── */

export type Categoria = {
  id: TipoEvento;
  titulo: string;
  gancho: string;
  /** El brillo va en verde en las tres: la categoría la distingue el icono. */
  glow: "green";
};

export const CATEGORIAS: Categoria[] = [
  { id: "bodas", titulo: "Casamiento", gancho: "Para el día que se acuerdan toda la vida", glow: "green" },
  { id: "cumples", titulo: "Cumpleaños", gancho: "Quince, Bar Mitzvá o los que sean", glow: "green" },
  { id: "profesional", titulo: "Evento profesional", gancho: "Lanzamientos, cenas y conferencias", glow: "green" },
];

/* ── Diseños ───────────────────────────────────────────────── */

export type Diseno = {
  id: number;
  tipo: TipoEvento;
  nombre: string;
  imagen: string;
  acento: string;
  /**
   * Enlace propio, para los modelos nuevos que no viven en /demo/[id].
   * Si no está, se arma el enlace al motor viejo con el id y el tipo.
   */
  enlace?: string;
};

/**
 * Sólo los modelos que mostramos. Los diseños del motor viejo (Olivar, Bruma,
 * Ocaso, Granate, Lavanda, Lino y los de cumpleaños) se sacaron del catálogo a
 * pedido: la ruta /demo/[id] sigue existiendo pero ya nadie llega a ella desde
 * la página. Un tipo sin modelos muestra "consultá tu diseño" por WhatsApp.
 */
export const DISENOS: Diseno[] = [
  // Rosa es el modelo nuevo y va primero: es el que muestra lo que sabemos
  // hacer hoy.
  {
    id: 0,
    tipo: "bodas",
    nombre: "Rosa",
    imagen: "/invitaciones/demo/rosa/carta.jpg",
    acento: "#7d2f3f",
    enlace: "/i/rosa",
  },

  {
    id: 15,
    tipo: "bodas",
    nombre: "Mis humanos se casan",
    imagen: "/invitaciones/demo/mis-humanos-se-casan/miniatura.webp",
    acento: "#764451",
    enlace: "/i/mis-humanos-se-casan",
  },
  {
    id: 1,
    tipo: "bodas",
    nombre: "Fotomatón",
    imagen: "/invitaciones/clientes/luis-y-julieta/miniatura.webp",
    acento: "#7a0f18",
    enlace: "/i/luis-y-julieta",
  },
  {
    id: 2,
    tipo: "bodas",
    nombre: "Garabato",
    imagen: "/invitaciones/garabato/miniatura.webp",
    acento: "#c41a24",
    enlace: "/i/garabato",
  },
  {
    id: 3,
    tipo: "bodas",
    nombre: "Mesa",
    imagen: "/invitaciones/mesa/miniatura.webp",
    acento: "#1d1b18",
    enlace: "/i/joaquin-y-clara",
  },
  {
    id: 4,
    tipo: "cumples",
    nombre: "Disco Scrapbook",
    imagen: "/invitaciones/scrapbook/miniatura.webp",
    acento: "#bf527d",
    enlace: "/i/valentina-15",
  },
  {
    id: 5,
    tipo: "cumples",
    nombre: "Ciudad",
    imagen: "/invitaciones/ciudad/miniatura.webp",
    acento: "#1b3a78",
    enlace: "/i/ariel-bar-mitzva",
  },
  {
    id: 10,
    tipo: "cumples",
    nombre: "Una carta",
    imagen: "/invitaciones/carta/miniatura.webp",
    acento: "#542a35",
    enlace: "/i/alejandro-50",
  },
  {
    id: 11,
    tipo: "cumples",
    nombre: "Jardín",
    imagen: "/invitaciones/jardin/miniatura.webp",
    acento: "#503550",
    enlace: "/i/emilia-15",
  },
  {
    id: 6,
    tipo: "cumples",
    nombre: "Cerámica",
    imagen: "/invitaciones/ceramica/miniatura.webp",
    acento: "#153f83",
    enlace: "/i/benjamin-bar-mitzva",
  },
  {
    id: 7,
    tipo: "cumples",
    nombre: "Horizonte",
    imagen: "/invitaciones/horizonte/miniatura.webp",
    acento: "#192b49",
    enlace: "/i/tomer-bar-mitzva",
  },
  {
    id: 8,
    tipo: "profesional",
    nombre: "Sobremesa",
    imagen: "/invitaciones/sobremesa/miniatura.webp",
    acento: "#652c38",
    enlace: "/i/sobremesa-nexo",
  },
  {
    id: 9,
    tipo: "profesional",
    nombre: "Órbita",
    imagen: "/invitaciones/orbita/miniatura.webp",
    acento: "#596144",
    enlace: "/i/orbita-nexo",
  },
  {
    id: 12,
    tipo: "profesional",
    nombre: "Círculo privado",
    imagen: "/invitaciones/privado/miniatura.webp",
    acento: "#61333a",
    enlace: "/i/circulo-privado",
  },
  {
    id: 13,
    tipo: "profesional",
    nombre: "Entre platos",
    imagen: "/invitaciones/platos/miniatura.webp",
    acento: "#3e4a2d",
    enlace: "/i/entre-platos",
  },
  {
    id: 14,
    tipo: "profesional",
    nombre: "Noir",
    imagen: "/invitaciones/noir/miniatura.webp",
    acento: "#9d282c",
    enlace: "/i/noir",
  },
];

export const enlaceDemo = (d: Diseno) =>
  d.enlace ?? `/demo/${d.id}?t=${d.tipo}`;

/* ── Qué incluye ───────────────────────────────────────────── */

export const INCLUYE: Record<TipoEvento, string[]> = {
  bodas: [
    "Cuenta regresiva hasta la hora de la fiesta",
    "Ceremonia y salón, cada uno con su mapa",
    "Confirmación de asistencia automática",
    "Restricciones de comida por invitado",
    "Alias y CBU para el regalo",
    "Álbum de fotos con QR para las mesas",
    "Dress code, hoteles y horario del micro",
    "Tu canción sonando de fondo",
  ],
  cumples: [
    "Cuenta regresiva hasta la hora de la fiesta",
    "Ubicación con botón al mapa",
    "Confirmación de asistencia automática",
    "Lista de invitados en vivo",
    "Álbum de fotos con QR para las mesas",
    "Galería de fotos y música",
    "Dress code y datos para el regalo",
    "Un link por invitado, con su nombre",
  ],
  profesional: [
    "Cuenta regresiva hasta el inicio",
    "Sede y accesos con mapa",
    "Registro de asistentes automático",
    "Agenda del evento por bloques",
    "Logos y colores de tu marca",
    "Restricciones alimentarias del catering",
    "Acreditación con QR en la puerta",
  ],
};

/* ── Precios ───────────────────────────────────────────────── */

export type Plan = {
  nombre: string;
  precio: Record<Moneda, number>;
  /** Precio de lista tachado, si el plan está en oferta. */
  antes?: Record<Moneda, number>;
  items: string[];
  destacado: boolean;
};

/**
 * Un solo plan, en oferta: $99.000 tachado y $75.000 hoy (ARS). Los USD son
 * de referencia (79 y 60): revisarlos antes de vender en dólares.
 */
export const PLANES: Plan[] = [
  {
    nombre: "Invitación completa",
    precio: { ARS: 75000, USD: 60 },
    antes: { ARS: 99000, USD: 79 },
    items: [
      "Diseño personalizado",
      "Cuenta regresiva y mapa",
      "Datos del regalo",
      "Confirmación dentro de la invitación",
      "Lista de invitados en vivo",
      "Restricciones de comida",
      "Galería y música",
      "Plano del salón con tus medidas",
      "Mesas y familias, ubicadas solas",
      "Panel con tus colores",
      "Un link por invitado",
      "Trivia para los invitados",
    ],
    destacado: true,
  },
];

export function formatearPrecio(valor: number, moneda: Moneda) {
  return new Intl.NumberFormat(moneda === "ARS" ? "es-AR" : "en-US", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(valor);
}

/**
 * La moneda sale de la zona horaria del navegador: no pide permisos, no hace
 * pedidos de red y no obliga al visitante a elegir país. Argentina paga en
 * pesos; el resto del mundo, en dólares.
 */
export function detectarMoneda(): Moneda {
  try {
    const zona = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    return zona.startsWith("America/Argentina") || zona === "America/Buenos_Aires" ? "ARS" : "USD";
  } catch {
    return "ARS";
  }
}

/* ── Reseñas ───────────────────────────────────────────────── */

export type Resena = { nombre: string; evento: string; texto: string };

/**
 * Vacío a propósito: no se inventan reseñas de un negocio real. Cargá acá las
 * de clientes que te hayan dado el OK y la sección aparece sola.
 */
export const RESENAS: Resena[] = [];

/* ── Preguntas ─────────────────────────────────────────────── */

export const PREGUNTAS = [
  {
    p: "¿Mis invitados tienen que descargar algo?",
    r: "No. Es un link que se abre en el navegador del celular, igual que cualquier página. Anda en Android y en iPhone.",
  },
  {
    p: "¿Cómo sé quién confirmó?",
    r: "Cada confirmación entra a una lista que ves en vivo desde el celular, con el nombre, cuántos vienen y las restricciones de comida. La bajás en Excel cuando se la pasás al salón.",
  },
  {
    p: "¿Puedo cambiar cosas después de mandarla?",
    r: "Sí. Como es una web, se edita cuando quieras y el link no cambia. Si se corre el horario, todos ven la versión nueva.",
  },
  {
    p: "¿Cuánto tarda?",
    r: "Tres días hábiles desde que nos pasás los datos y las fotos.",
  },
  {
    p: "¿Se paga todos los meses?",
    r: "No. Es un pago único e incluye el año de publicación.",
  },
];

/* ── Contacto ──────────────────────────────────────────────── */

export const WHATSAPP_NUMERO = "5493513781063";

export const whatsappPara = (texto: string) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;

export const WHATSAPP = whatsappPara("Hola! Quiero info sobre las invitaciones digitales");
