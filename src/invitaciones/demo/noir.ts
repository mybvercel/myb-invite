import type { InvitacionNoir } from "../tipos";

/**
 * Modelo Noir: encuentro ejecutivo (Casa Norte). Datos ficticios de la
 * maqueta noir-ejecutiva. El jueves 26/11/2026 es día hábil.
 */
export const noir: InvitacionNoir = {
  slug: "noir",
  origen: "demo",
  estilo: "noir",

  nombres: "Casa Norte",
  volanta: "Encuentro privado",
  fecha: "26 de Noviembre 2026",

  noir: {
    compartir: "/invitaciones/noir/compartir.jpg",
    anfitrion: "Casa Norte",
    sobre: {
      arriba: "CASA NORTE TIENE EL GUSTO DE INVITARTE",
      marca: "NOIR",
      frase: "Una noche para encontrarnos.",
      pista: "Tocá el sello para descubrir la noche",
    },
    titulo: ["La noche", "nos reúne."],
    tarjeta: ["Una invitación", "a conversar,", "compartir y brindar."],
    introTitulo: ["Las mejores", "conversaciones", "no miran el reloj."],
    introTexto: "Dejamos la agenda de todos los días para compartir una mesa, nuevas perspectivas y una buena copa.",
    escenaPie: "Una mesa. Nuevas conexiones.",
    agenda: [
      { hora: "20:00", titulo: "El primer encuentro", detalle: "Aperitivo de bienvenida." },
      { hora: "20:30", titulo: "La mesa compartida", detalle: "Cena de tres pasos y conversación." },
      { hora: "22:30", titulo: "Por lo que viene", detalle: "Brindis y sobremesa hasta las 23:30." },
    ],
    rsvpTitulo: ["La noche está lista.", "Faltás vos."],
    cierre: "Que sea una gran noche.",
  },

  lugares: [
    {
      tipo: "Fiesta",
      titulo: "Salón de la Cava",
      hora: "20:00",
      direccion: "Pasaje del Roble 1420, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
  ],

  dressCode: {
    titulo: "Elegante, a tu manera.",
    detalle: "Vestimenta elegante informal. La comodidad también está invitada.",
  },

  cierreRsvp: "Confirmá antes del 19 de noviembre.",

  diseno: { acento: "#9d282c", fondo: "#eee9de", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
