import type { InvitacionHorizonte } from "../tipos";

/**
 * Modelo Horizonte: Bar Mitzvá de Tomer. Datos ficticios de la maqueta
 * tomer-horizonte. Fecha verificada en hebcal.com: sábado 19/12/2026 es el 9 de
 * Tevet de 5787 (Parashat Vayigash) y en Buenos Aires el Shabat termina a las
 * 20:49, por eso la fiesta arranca a las 21:00.
 */
export const tomer: InvitacionHorizonte = {
  slug: "tomer-bar-mitzva",
  origen: "demo",
  estilo: "horizonte",

  nombres: "Tomer",
  volanta: "Mi Bar Mitzvá",
  fecha: "19 de Diciembre 2026",

  horizonte: {
    compartir: "/invitaciones/horizonte/compartir.jpg",
    evento: "Mi Bar Mitzvá",
    familia: "Junto a mis papás, Daniela y Ariel, y mi hermana, Emma",
    mensaje: "Estoy por vivir un día muy importante. Y entre todas las cosas que imagino, hay una que no puede faltar: compartirlo con vos.",
    ciudad: "Buenos Aires",
    notaCeremonia: "Una mañana para compartir con mi familia y las personas que me acompañan.",
    notaFiesta: "Después de una mañana especial, nos espera una noche de música, amigos y mucha alegría.",
    finFiesta: "02:00 hs · domingo · último baile",
    comida: "Recepción, cena y mesa dulce. Contanos al confirmar si tenés alergias o necesidades alimentarias.",
    regalos: "Lo que más quiero es compartir este día con vos. Tu presencia es mi mejor regalo.",
    parasha: { nombre: "Vayigash", hebreo: "פרשת ויגש", fechaHebrea: "9 de Tevet de 5787" },
  },

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Comunidad Beit Horizonte",
      hora: "10:00",
      direccion: "Pasaje de los Cedros 218, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
    {
      tipo: "Fiesta",
      titulo: "Espacio Azur",
      hora: "21:00",
      direccion: "Paseo de las Acacias 730, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
  ],

  dressCode: {
    titulo: "Elegante sport",
    detalle: "Elegí un look que te guste y te deje bailar toda la noche.",
  },

  cierreRsvp: "Confirmá antes del 8 de diciembre.",

  diseno: { acento: "#192b49", fondo: "#fdfdfc", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
