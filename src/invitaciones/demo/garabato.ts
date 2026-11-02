import type { InvitacionGarabato } from "../tipos";

/**
 * Modelo Garabato. Pareja, lugares y datos inventados para la demo.
 * El CBU es inválido a propósito: no puede mandar plata a ninguna cuenta.
 */
export const garabato: InvitacionGarabato = {
  slug: "garabato",
  origen: "demo",
  estilo: "garabato",

  nombres: "Bruno & Martina",
  volanta: "Nos casamos",
  fecha: "13 de Marzo 2027",

  garabato: { compartir: "/invitaciones/garabato/compartir.jpg" },

  cronograma: [
    { hora: "18:30", titulo: "el sí" },
    { hora: "19:30", titulo: "brindis" },
    { hora: "21:00", titulo: "cena" },
    { hora: "23:30", titulo: "a bailar" },
    { hora: "05:00", titulo: "chau" },
  ],

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Capilla de la bodega",
      hora: "18:30",
      direccion: "Bodega Los Álamos, Calle Cobos 8260, Luján de Cuyo, Mendoza",
      mapa: "https://maps.google.com/?q=Lujan+de+Cuyo+Mendoza",
    },
    {
      tipo: "Fiesta",
      titulo: "Bodega Los Álamos",
      hora: "19:30",
      direccion: "Calle Cobos 8260, Luján de Cuyo, Mendoza",
      mapa: "https://maps.google.com/?q=Lujan+de+Cuyo+Mendoza",
    },
  ],

  dressCode: {
    titulo: "Elegante",
    detalle: "El blanco es de la novia. Hay viñedo y pasto: tacos anchos, que se baila hasta tarde.",
  },

  regalo: {
    mensaje: "Lo más lindo es que estés. Si además querés regalarnos algo, nos ayuda con la luna de miel.",
    banco: "Banco Galicia",
    alias: "bruno.y.martina",
    cbu: "0000000000000000000000",
    titular: "Martina Ruiz",
  },

  cierreRsvp: "Avisanos antes del 13 de febrero.",

  diseno: {
    acento: "#c41a24",
    fondo: "#f4f0ea",
    fuente: "Georgia, serif",
    opacidadHero: 0.15,
  },
};
