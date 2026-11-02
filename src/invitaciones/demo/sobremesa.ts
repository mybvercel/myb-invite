import type { InvitacionSobremesa } from "../tipos";

/**
 * Modelo Sobremesa: cena ejecutiva (Estudio Nexo). Datos ficticios de la
 * maqueta sobremesa. El jueves 19/11/2026 es día hábil.
 */
export const sobremesa: InvitacionSobremesa = {
  slug: "sobremesa-nexo",
  origen: "demo",
  estilo: "sobremesa",

  nombres: "Sobremesa",
  volanta: "Executive Dinner",
  fecha: "19 de Noviembre 2026",

  sobremesa: {
    compartir: "/invitaciones/sobremesa/compartir.jpg",
    tipo: "Executive Dinner",
    anfitrion: "Estudio Nexo",
    mensaje: "Una mesa compartida. Nuevas perspectivas. Una noche para encontrarnos fuera de la agenda.",
    agenda: [
      { hora: "19:30", titulo: "El primer brindis", detalle: "Recepción y aperitivos." },
      { hora: "20:15", titulo: "A la mesa", detalle: "Cena de tres pasos y selección de vinos." },
      { hora: "21:30", titulo: "La sobremesa", detalle: "Café, conversaciones y nuevas conexiones." },
      { hora: "22:30", titulo: "Hasta la próxima", detalle: "Cierre del encuentro." },
    ],
    menu: [
      { nombre: "Para comenzar", plato: "Burrata, tomates confitados y aceite de albahaca." },
      { nombre: "El plato principal", plato: "Risotto de hongos, parmesano y tomillo fresco." },
      { nombre: "Un final dulce", plato: "Chocolate amargo, frutos rojos y crema de vainilla." },
    ],
    bebidas: "Selección de vinos, aperitivos y alternativas sin alcohol.",
    salon: "Salón privado · primer piso",
    cupo: "Invitación individual",
    ciudad: "Buenos Aires",
  },

  lugares: [
    {
      tipo: "Fiesta",
      titulo: "Casa Umbral",
      hora: "19:30",
      direccion: "Pasaje del Olmo 1840, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
  ],

  dressCode: {
    titulo: "Business casual",
    detalle: "Un look cuidado, cómodo y con tu estilo.",
  },

  cierreRsvp: "Confirmá antes del 12 de noviembre.",

  diseno: { acento: "#652c38", fondo: "#f6f3ed", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
