import type { InvitacionJardin } from "../tipos";

/**
 * Modelo Jardín al anochecer: quince años de Emilia. Datos ficticios de la
 * maqueta quince-jardin-anochecer. El sábado 12/12/2026 es sábado.
 */
export const jardin: InvitacionJardin = {
  slug: "emilia-15",
  origen: "demo",
  estilo: "jardin",

  nombres: "Emilia",
  volanta: "Mis quince años",
  fecha: "12 de Diciembre 2026",

  jardin: {
    compartir: "/invitaciones/jardin/compartir.jpg",
    inicial: "E",
    frase: ["Hay noches que soñamos.", "Esta quiero vivirla con vos."],
    agenda: [
      { hora: "21:00", titulo: "Bienvenidos", detalle: "Recepción y primeras fotos." },
      { hora: "21:45", titulo: "A la mesa", detalle: "Una cena para compartir." },
      { hora: "23:00", titulo: "Mi momento", detalle: "Vals y brindis con ustedes." },
      { hora: "23:30", titulo: "Que siga la noche", detalle: "Música, baile y mucha fiesta." },
    ],
    cierre: "Nos despedimos a las 04:00.",
    paleta: ["#252226", "#c6b59c", "#3f5147"],
    regalo: "Si querés sumar un detalle, habrá un espacio para sobres durante la fiesta.",
    despedida: ["Nos vemos bajo", "el mismo cielo."],
  },

  lugares: [
    {
      tipo: "Fiesta",
      titulo: "Jardín de las Lunas",
      hora: "21:00",
      direccion: "Camino de las Acacias 1250, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
  ],

  dressCode: {
    titulo: "Elegante",
    detalle: "El lila lo guardamos para Emilia.",
  },

  cierreRsvp: "Confirmá antes del 1 de diciembre.",

  diseno: { acento: "#503550", fondo: "#f6f0e9", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
