import type { InvitacionScrapbook } from "../tipos";

/**
 * Modelo Scrapbook (quince). Datos ficticios de la maqueta disco-scrapbook-v2:
 * no atribuirlos a la persona real de las fotos. El 14/11/2026 es sábado.
 * El CBU es inválido a propósito.
 */
export const valentina: InvitacionScrapbook = {
  slug: "valentina-15",
  origen: "demo",
  estilo: "scrapbook",

  nombres: "Valentina",
  volanta: "Mis 15",
  fecha: "14 de Noviembre 2026",

  scrapbook: {
    compartir: "/invitaciones/scrapbook/compartir.jpg",
    fotoInfancia: "/invitaciones/scrapbook/recuerdo-infancia.webp",
    fotoActual: "/invitaciones/scrapbook/retrato-actual.webp",
    horarios: [
      { hora: "21:00 hs", titulo: "La previa", detalle: "Fotos, abrazos y algo rico para arrancar." },
      { hora: "22:00 hs", titulo: "Mi gran entrada", detalle: "Arranca la fiesta. ¡Te quiero ahí!" },
      { hora: "05:00 hs · domingo", titulo: "El último tema", detalle: "Un baile más antes de despedirnos." },
    ],
    comida: "Pizza party, mini hamburguesas y mesa dulce. Hay opciones vegetarianas y sin TACC: avisame al confirmar.",
  },

  lugares: [
    {
      tipo: "Fiesta",
      titulo: "Salón Bruma Rosa",
      hora: "21:00",
      direccion: "Paseo de las Estrellas 150, Córdoba",
      mapa: "https://maps.google.com/?q=Nueva+Cordoba+Cordoba",
    },
  ],

  dressCode: {
    titulo: "Elegante",
    detalle: "El rosa queda reservado para mí. Vos traé tu look favorito y ganas de bailar.",
  },

  regalo: {
    mensaje: "El mejor regalo es que estés. Si querés regalarme algo más, podés ayudarme a cumplir mi próximo sueño.",
    banco: "Banco Nación",
    alias: "vale.15.demo",
    cbu: "0000000000000000000000",
    titular: "Valentina Ríos",
  },

  cierreRsvp: "Confirmá antes del 7 de noviembre.",

  diseno: {
    acento: "#bf527d",
    fondo: "#f1ede3",
    fuente: "Georgia, serif",
    opacidadHero: 0.15,
  },
};
