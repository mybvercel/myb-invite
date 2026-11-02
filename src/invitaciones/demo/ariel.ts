import type { InvitacionCiudad } from "../tipos";

/**
 * Modelo Ciudad: el Bar Mitzvá de Ariel. Familia, templo y salón inventados.
 * La fecha es real: sábado 21/08/2027 es 18 de Av de 5787, Parashat Ekev, y en
 * Buenos Aires el Shabat termina a las 19:05 (hebcal.com), por eso la fiesta
 * arranca a las 21. El CBU es inválido a propósito.
 */
export const ariel: InvitacionCiudad = {
  slug: "ariel-bar-mitzva",
  origen: "demo",
  estilo: "ciudad",

  nombres: "Ariel",
  volanta: "Bar Mitzvá",
  fecha: "21 de Agosto 2027",

  ciudad: {
    compartir: "/invitaciones/ciudad/compartir.jpg",
    evento: "Bar Mitzvá",
    hebreo: "אריאל",
    vinculo: "nuestro hijo",
    padres: "Débora y Martín Kaplan",
    agradecimiento: "Con gratitud a Hashem",
    parasha: { nombre: "Ekev", hebreo: "פרשת עקב", fechaHebrea: "18 de Av de 5787" },
    kidush: { hora: "12:00", detalle: "Al terminar la tefilá compartimos el kidush en el salón de la comunidad." },
    velas: [
      "Los abuelos Rosa y Samuel",
      "Los abuelos Ana y León",
      "Mamá y papá",
      "Su hermana Tamara",
      "Los tíos y primos Kaplan",
      "Los tíos y primos Grinberg",
      "Sus amigos del colegio",
      "Su morá y el rabino",
      "Sus amigos del club",
      "Sus padrinos",
      "La familia que viajó para estar",
      "En memoria de los que no están",
      "Ariel, por todo lo que viene",
    ],
  },

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Templo Beit Shalom",
      hora: "9:30",
      direccion: "Arcos 2150, Belgrano, Buenos Aires",
      mapa: "https://maps.google.com/?q=Arcos+2150+Belgrano+Buenos+Aires",
    },
    {
      tipo: "Fiesta",
      titulo: "Salón Alma",
      hora: "21:00",
      direccion: "Av. del Libertador 6350, Núñez, Buenos Aires",
      mapa: "https://maps.google.com/?q=Av+del+Libertador+6350+Buenos+Aires",
    },
  ],

  cronograma: [
    { hora: "21:00", titulo: "Recepción" },
    { hora: "22:00", titulo: "Entrada de Ariel" },
    { hora: "22:30", titulo: "Cena" },
    { hora: "23:30", titulo: "Las 13 velas" },
    { hora: "00:00", titulo: "La hora, con la silla en alto" },
    { hora: "01:00", titulo: "Torta y mesa dulce" },
    { hora: "03:30", titulo: "Último tema" },
  ],

  dressCode: {
    titulo: "Qué ponerse",
    detalle: "En el templo, hombros cubiertos y kipá para los varones (hay en la entrada). A la noche, elegante y cómodo: se baila mucho.",
  },

  logistica: {
    transporte: "El salón tiene estacionamiento con valet sin cargo.",
  },

  regalo: {
    mensaje: "Ariel está juntando para su viaje a Israel con el colegio. Si querés sumar, este es el alias.",
    banco: "Banco Macro",
    alias: "ariel.barmitzva",
    cbu: "0000000000000000000000",
    titular: "Débora Kaplan",
  },

  cierreRsvp: "Confirmá antes del 1 de agosto.",

  diseno: {
    acento: "#1b3a78",
    fondo: "#fbfbf8",
    fuente: "Georgia, serif",
    opacidadHero: 0.15,
  },
};
