import type { Hito, Lugar, Regalo } from "../tipos";

/**
 * La pareja de la demo Guirnalda. Nombres, fecha y lugares son inventados; el CBU es inválido a propósito.
 *
 * Las fotos son de la pareja real que pasó el material y viven en
 * public/invitaciones/demo/lucia-y-nicolas/.
 */
export const FOTOS = "/invitaciones/demo/lucia-y-nicolas";

/** Un sábado de San Valentín: la foto de la mesa con globos de corazón lo pide. */
export const FECHA = "13 de Febrero 2027";

export const cronograma: Hito[] = [
  { hora: "18:30", titulo: "Ceremonia bajo las luces" },
  { hora: "19:30", titulo: "Brindis de bienvenida" },
  { hora: "21:00", titulo: "Cena" },
  { hora: "23:00", titulo: "Primer baile" },
  { hora: "01:30", titulo: "Mesa dulce junto al fogón" },
  { hora: "04:00", titulo: "Chocolate caliente y despedida" },
];

export const lugares: Lugar[] = [
  {
    tipo: "Ceremonia",
    titulo: "Mirador de los Aromos",
    hora: "18:30",
    direccion: "Camino a Los Reartes km 3, Villa General Belgrano, Córdoba",
    mapa: "https://maps.google.com/?q=Villa+General+Belgrano+Cordoba",
  },
  {
    tipo: "Fiesta",
    titulo: "Domos del Alba",
    hora: "19:30",
    direccion: "Camino a Los Reartes km 3,5, Villa General Belgrano, Córdoba",
    mapa: "https://maps.google.com/?q=Villa+General+Belgrano+Cordoba",
  },
];

export const dressCode = {
  titulo: "Elegante de campo",
  detalle: "De noche refresca en las sierras: traé un abrigo. Calzado cómodo para el pasto, que se baila hasta tarde. El blanco es de la novia.",
};

export const regalo: Regalo = {
  mensaje: "Lo más lindo es que estén. Si igual quieren sumar algo, nos ayuda con la luna de miel.",
  banco: "Banco Galicia",
  alias: "lucia.y.nico",
  cbu: "0000000000000000000000",
  titular: "Lucía Fernández",
};

export const cierreRsvp = "Contanos antes del 13 de enero.";
