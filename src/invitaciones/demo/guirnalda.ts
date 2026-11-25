import type { InvitacionGuirnalda } from "../tipos";
import { FECHA, FOTOS, cierreRsvp, cronograma, dressCode, lugares, regalo } from "./lucia-y-nicolas";

/**
 * Modelo Guirnalda: la versión formal para la pareja de las fotos del fogón.
 * Verde de noche, cálido de foco, y las dos fotos de ellos como protagonistas.
 */
export const guirnalda: InvitacionGuirnalda = {
  slug: "lucia-y-nicolas",
  origen: "demo",
  estilo: "guirnalda",
  plan: "completa",

  nombres: "Lucía & Nicolás",
  volanta: "Nos casamos",
  fecha: FECHA,

  frase: "Hay noches que se quedan encendidas para siempre. Queremos que la próxima la pasen con nosotros.",

  guirnalda: {
    compartir: "/invitaciones/guirnalda/compartir.jpg",
    portada: { src: `${FOTOS}/fogon.webp`, alt: "Lucía y Nicolás frente al fuego, tostando malvaviscos de noche, entre guirnaldas de luces" },
    arco: {
      src: `${FOTOS}/mesa.webp`,
      alt: "Lucía y Nicolás sentados detrás de una mesa decorada con globos de corazón, rosas rojas y un cartel luminoso que dice LOVE",
      pie: "Febrero nos queda bien.",
    },
    cierre: "Los esperamos con el fogón prendido.",
  },

  cronograma,
  lugares,
  dressCode,
  regalo,
  cierreRsvp,

  diseno: { acento: "#e6b865", fondo: "#0e2420", fuente: "Cormorant Garamond", opacidadHero: 0.15 },
};
