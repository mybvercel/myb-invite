import type { InvitacionCeramica } from "../tipos";

/**
 * Modelo Cerámica: Bar Mitzvá de Benjamín Levin. Datos ficticios de la maqueta
 * azul-ceramica. Fecha verificada en hebcal.com: sábado 12/12/2026 es el 2 de
 * Tevet de 5787 (Shabat Janucá, Parashat Miketz) y en Buenos Aires el Shabat
 * termina a las 20:45, por eso la fiesta arranca a las 21:00. CBU no aplica.
 */
export const benjamin: InvitacionCeramica = {
  slug: "benjamin-bar-mitzva",
  origen: "demo",
  estilo: "ceramica",

  nombres: "Benjamín",
  volanta: "Mi Bar Mitzvá",
  fecha: "12 de Diciembre 2026",

  ceramica: {
    compartir: "/invitaciones/ceramica/compartir.jpg",
    evento: "Mi Bar Mitzvá",
    apellido: "Levin",
    familia: "Con mis papás, Clara y Gabriel, y mi hermana Emma",
    mensaje: "Hay momentos que se vuelven recuerdos para siempre. Quiero compartir este con vos.",
    firma: "Benja",
    ciudad: "Buenos Aires",
    notaCeremonia: "Nos encontramos para compartir una mañana muy especial en familia.",
    notaFiesta: "Una noche para brindar, bailar y celebrar juntos.",
    finFiesta: "01:30 hs · domingo · despedida",
    comida: "Cena, mesa dulce y algo rico para cerrar la noche. Contanos en el formulario si tenés alguna alergia o necesidad alimentaria.",
    parasha: { nombre: "Miketz", hebreo: "פרשת מקץ", fechaHebrea: "2 de Tevet de 5787 · Shabat Janucá" },
  },

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Comunidad Or Hadar",
      hora: "10:00",
      direccion: "Pasaje de los Olivos 128, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
    {
      tipo: "Fiesta",
      titulo: "Casa del Olivar",
      hora: "21:00",
      direccion: "Camino de las Acacias 640, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
  ],

  dressCode: {
    titulo: "Elegante sport",
    detalle: "Camisa, pantalón de vestir, vestido o un conjunto que te guste. Lo más importante: que estés cómodo para celebrar.",
  },

  cierreRsvp: "Confirmá antes del 1 de diciembre.",

  diseno: { acento: "#153f83", fondo: "#f5f1e7", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
