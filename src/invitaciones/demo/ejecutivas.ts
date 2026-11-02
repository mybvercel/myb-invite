import type { InvitacionEjecutiva } from "../tipos";

/**
 * Modelos ejecutivos de GPT: "Círculo privado" (Casa Norte) y "Entre platos"
 * (Estudio Oliva). Datos ficticios. El 26/11/2026 y el 3/12/2026 son jueves.
 */
export const privado: InvitacionEjecutiva = {
  slug: "circulo-privado",
  origen: "demo",
  estilo: "privado",

  nombres: "Círculo privado",
  volanta: "Cena · conversación · encuentro",
  fecha: "26 de Noviembre 2026",

  ejecutiva: {
    compartir: "/invitaciones/privado/compartir.jpg",
    anfitrion: "Casa Norte",
    titulo: ["Círculo", "privado."],
    enfasis: 1,
    subtitulo: "CENA · CONVERSACIÓN · ENCUENTRO",
    cita: ["Una mesa compartida.", "Una mirada hacia lo que viene."],
    sepFecha: " · ",
    introTitulo: ["La ocasión es", "encontrarnos."],
    introTexto: "Un encuentro entre colegas para conversar sin apuro, compartir una cena y cerrar el año juntos.",
    agenda: [
      { hora: "20:00", titulo: "La bienvenida", detalle: "Aperitivo y recepción." },
      { hora: "20:30", titulo: "La conversación", detalle: "Cena de tres pasos y encuentro entre invitados." },
      { hora: "22:30", titulo: "El brindis", detalle: "Una copa por los próximos proyectos." },
    ],
    cierreAgenda: "Cierre del encuentro: 23:30 h.",
    rsvpTitulo: ["Tu lugar", "en el círculo."],
    cierre: "El placer de encontrarnos.",
    sobre: "Una invitación personal",
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

  dressCode: { titulo: "Elegante informal", detalle: "Una noche especial, con comodidad." },

  cierreRsvp: "Confirmá antes del 19 de noviembre.",

  diseno: { acento: "#61333a", fondo: "#f4edde", fuente: "Georgia, serif", opacidadHero: 0.15 },
};

export const platos: InvitacionEjecutiva = {
  slug: "entre-platos",
  origen: "demo",
  estilo: "platos",

  nombres: "Entre platos",
  volanta: "Las ideas también se comparten",
  fecha: "3 de Diciembre 2026",

  ejecutiva: {
    compartir: "/invitaciones/platos/compartir.jpg",
    anfitrion: "Estudio Oliva · Encuentro ejecutivo",
    titulo: ["Entre", "platos."],
    enfasis: 0,
    subtitulo: "LAS IDEAS TAMBIÉN SE COMPARTEN",
    cita: ["Dejemos lugar", "para una buena conversación."],
    sepFecha: ".",
    introTitulo: ["El menú", "de la noche."],
    introTexto: "Tres momentos, una mesa y las personas que hacen que las ideas avancen.",
    agenda: [
      { hora: "19:30", etiqueta: "Para empezar", titulo: "Romper el hielo", detalle: "Aperitivo de bienvenida y primeras conversaciones." },
      { hora: "20:15", etiqueta: "El plato fuerte", titulo: "Compartir ideas", detalle: "Cena de temporada y nuevos puntos de vista." },
      { hora: "22:00", etiqueta: "La sobremesa", titulo: "Seguir la charla", detalle: "Café, un brindis y tiempo para conectar." },
    ],
    cierreAgenda: "Nos despedimos a las 23:00 h.",
    rsvpTitulo: ["Tenemos", "una silla para vos."],
    cierre: "Las mejores ideas se comparten.",
  },

  lugares: [
    {
      tipo: "Fiesta",
      titulo: "Mesa Oliva",
      hora: "19:30",
      direccion: "Calle de los Aromos 680, Buenos Aires",
      mapa: "https://maps.google.com/?q=Buenos+Aires+Argentina",
    },
  ],

  dressCode: { titulo: "Elegante informal", detalle: "Una noche especial, con comodidad." },

  cierreRsvp: "Confirmá antes del 26 de noviembre.",

  diseno: { acento: "#3e4a2d", fondo: "#fff1c5", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
