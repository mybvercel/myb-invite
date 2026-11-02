import type { InvitacionCinta } from "../tipos";

/**
 * Modelo Cinta. Pareja, lugares y datos inventados para la demo.
 * El CBU es inválido a propósito: no puede mandar plata a ninguna cuenta.
 */
export const cinta: InvitacionCinta = {
  slug: "carlos-y-elsa",
  origen: "demo",
  estilo: "cinta",

  nombres: "Carlos & Elsa",
  volanta: "Nos casamos",
  fecha: "6 de Noviembre 2027",

  cinta: { compartir: "/invitaciones/cinta/compartir.jpg" },

  cronograma: [
    { hora: "20:30", titulo: "llegada y brindis" },
    { hora: "21:30", titulo: "cena" },
    { hora: "23:00", titulo: "primer baile" },
    { hora: "00:30", titulo: "a la pista" },
    { hora: "03:00", titulo: "pizza de madrugada" },
  ],

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Parroquia San Antonio",
      hora: "19:00",
      direccion: "Obispo Trejo 565, Nueva Córdoba, Córdoba",
      mapa: "https://maps.google.com/?q=Obispo+Trejo+565+Cordoba",
    },
    {
      tipo: "Fiesta",
      titulo: "Casa Mandarina",
      hora: "20:30",
      direccion: "Av. Hipólito Yrigoyen 380, Nueva Córdoba, Córdoba",
      mapa: "https://maps.google.com/?q=Hipolito+Yrigoyen+380+Cordoba",
    },
  ],

  dressCode: {
    titulo: "Elegante, con onda",
    detalle: "Colores alegres bienvenidos. El blanco es de la novia. Traé calzado cómodo: se baila hasta que salga el sol.",
  },

  regalo: {
    mensaje: "Estar ahí ya es un regalazo. Si igual querés sumar algo, nos ayuda con el viaje.",
    banco: "Banco Santander",
    alias: "carlos.y.elsa",
    cbu: "0000000000000000000000",
    titular: "Elsa Moreno",
  },

  cierreRsvp: "Contanos antes del 6 de octubre.",

  diseno: {
    acento: "#b3131d",
    fondo: "#fcf7ea",
    fuente: "Georgia, serif",
    opacidadHero: 0.15,
  },
};
