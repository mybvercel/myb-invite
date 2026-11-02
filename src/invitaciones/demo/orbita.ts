import type { InvitacionOrbita } from "../tipos";

/**
 * Modelo Órbita: encuentro ejecutivo (Estudio Nexo). Datos ficticios de la
 * maqueta orbita-ejecutiva. El jueves 19/11/2026 es día hábil.
 */
export const orbita: InvitacionOrbita = {
  slug: "orbita-nexo",
  origen: "demo",
  estilo: "orbita",

  nombres: "NEXO",
  volanta: "Encuentro ejecutivo",
  fecha: "19 de Noviembre 2026",

  orbita: {
    compartir: "/invitaciones/orbita/compartir.jpg",
    anfitrion: "Estudio Nexo",
    tipo: "Encuentro ejecutivo",
    ciudad: "Buenos Aires",
    marca: "NEXO",
    mensaje: "Una noche para encontrarnos, intercambiar ideas y brindar por lo que viene.",
    agenda: [
      { hora: "19:30", titulo: "Nos encontramos", detalle: "Recepción y aperitivo." },
      { hora: "20:00", titulo: "Abrimos la conversación", detalle: "Bienvenida de Estudio Nexo." },
      { hora: "20:30", titulo: "Compartimos la mesa", detalle: "Cena de autor y networking." },
      { hora: "23:00", titulo: "Hasta la próxima", detalle: "Cierre del encuentro." },
    ],
    cupo: "Invitación individual",
  },

  lugares: [
    {
      tipo: "Fiesta",
      titulo: "Casa Umbral",
      hora: "19:30",
      direccion: "Pasaje del Olivo 1840, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
  ],

  dressCode: {
    titulo: "Elegante informal",
    detalle: "Sentite cómodo. La ocasión la compartimos.",
  },

  cierreRsvp: "Confirmá antes del 12 de noviembre.",

  diseno: { acento: "#596144", fondo: "#f3f2ec", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
