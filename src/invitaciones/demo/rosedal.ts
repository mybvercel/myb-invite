import type { InvitacionRosedal } from "../tipos";
import { FECHA } from "./lucia-y-nicolas";

const R = "/invitaciones/rosedal";

/**
 * Modelo Rosedal: el sobre, el papel y las flores de Rosa, con las fotos de la
 * pareja. En español neutro y sin nombres, para que sirva en cualquier país.
 * Las fotos son reales; todo lo demás es de muestra y la cuenta es inválida.
 */
export const rosedal: InvitacionRosedal = {
  slug: "rosedal",
  origen: "demo",
  estilo: "rosedal",
  plan: "completa",

  nombres: "Nuestra boda",
  volanta: "Nos casamos",
  fecha: FECHA,

  carta: {
    imagen: `${R}/carta.jpg`,
    video: `${R}/apertura.mp4`,
    iniciales: "",
    instruccion: "Toca para abrir",
  },

  rosedal: {
    compartir: `${R}/compartir.jpg`,
    evento: "Nuestra boda",
    arco: `${R}/arco.webp`,
    flores: [`${R}/flores-a.webp`, `${R}/flores-c.webp`],
    sello: `${R}/sello.webp`,
    portada: {
      src: `${R}/portada.webp`,
      alt: "Ella y él sentados frente a una fogata, mirándose, con malvaviscos en la mano",
    },
    foto: {
      src: `${R}/mesa.webp`,
      alt: "Ella y él detrás de una mesa con rosas rojas, globos de corazón y un cartel luminoso que dice LOVE",
      pie: "Empezó con una mesa para dos. Ahora queremos una donde quepan todos.",
    },
    paleta: [
      { nombre: "Granate", color: "#7a1f2c" },
      { nombre: "Verde bosque", color: "#39513f" },
      { nombre: "Azul noche", color: "#26324a" },
      { nombre: "Champán", color: "#d8bd90" },
    ],
  },

  frase: "Hay noches que uno quisiera repetir. Esta la celebramos con las personas que más queremos.",

  cronograma: [
    { hora: "18:30", titulo: "Ceremonia al aire libre" },
    { hora: "19:30", titulo: "Brindis de bienvenida" },
    { hora: "21:00", titulo: "Cena" },
    { hora: "23:00", titulo: "Primer baile" },
    { hora: "01:30", titulo: "Mesa de dulces y fogata" },
    { hora: "04:00", titulo: "Despedida" },
  ],

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Mirador de los Aromos",
      hora: "18:30",
      direccion: "Camino del Mirador 3, Valle Alto",
      mapa: "https://maps.google.com/?q=Mirador+de+los+Aromos",
    },
    {
      tipo: "Fiesta",
      titulo: "Domos del Alba",
      hora: "19:30",
      direccion: "Camino del Mirador 12, Valle Alto",
      mapa: "https://maps.google.com/?q=Domos+del+Alba",
    },
  ],

  ilustracionLugar: "/invitaciones/demo/rosa/lugar.png",
  ilustracionVestimenta: "/invitaciones/demo/rosa/vestimenta.png",

  dressCode: {
    titulo: "Formal",
    detalle: "El blanco queda para la novia. De noche refresca, así que trae un abrigo, y mejor un tacón ancho: hay césped.",
  },

  regalo: {
    mensaje: "Tu presencia es el mejor regalo. Si además quieres darnos algo, nos ayuda con la luna de miel.",
    banco: "Transferencia bancaria",
    alias: "nuestra.boda.2027",
    cbu: "0000000000000000000000",
    titular: "Los novios",
  },

  cierreRsvp: "Por favor, responde antes del 13 de enero para reservar tu lugar.",

  diseno: { acento: "#8f1d2b", fondo: "#fbf4ec", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
