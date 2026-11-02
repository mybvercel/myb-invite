import type { InvitacionCincuenta } from "../tipos";

/**
 * Modelo Una carta, cincuenta historias: cumpleaños de 50 de Alejandro.
 * Datos ficticios de la maqueta cincuenta-carta. El 21/11/2026 es sábado.
 */
export const cincuenta: InvitacionCincuenta = {
  slug: "alejandro-50",
  origen: "demo",
  estilo: "cincuenta",

  nombres: "Alejandro",
  volanta: "Mis 50",
  fecha: "21 de Noviembre 2026",

  cincuenta: {
    compartir: "/invitaciones/carta/compartir.jpg",
    inicial: "A",
    anios: "50",
    frase: ["Tengo muchas historias.", "Esta quiero compartirla con vos."],
    brindis: "Brindemos",
    detalleBrindis: ["POR TODO LO VIVIDO.", "Y POR LO QUE VIENE."],
    intro: "Una cena, nuestras canciones y esas conversaciones que siempre se alargan.",
    agenda: [
      { hora: "20:30", titulo: "El reencuentro", detalle: "Recepción y aperitivo" },
      { hora: "21:15", titulo: "A la mesa", detalle: "Cena y sobremesa" },
      { hora: "23:00", titulo: "Una más…", detalle: "Brindis, música y baile" },
    ],
    sigla: "CO",
    regalo: ["El mejor regalo:", "volver a encontrarnos."],
    despedida: "50 años. Y la historia sigue.",
    cupo: 2,
  },

  lugares: [
    {
      tipo: "Fiesta",
      titulo: "Casa Oliva",
      hora: "20:30",
      direccion: "Pasaje de las Acacias 1250, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
  ],

  dressCode: {
    titulo: "Elegante informal",
    detalle: "Vení cómodo y con ganas de celebrar.",
  },

  cierreRsvp: "Confirmá antes del 14 de noviembre.",

  diseno: { acento: "#542a35", fondo: "#f3eee5", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
