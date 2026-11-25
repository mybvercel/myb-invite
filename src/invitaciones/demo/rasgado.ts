import type { InvitacionRasgado } from "../tipos";

const R = "/invitaciones/rasgado";

/**
 * Modelo Rasgado. Las fotos son de Jonathan Borba en Pexels (licencia libre) y
 * la música es un arreglo propio del Canon de Pachelbel, que es de dominio
 * público. Todo lo demás es de muestra y la cuenta es inválida a propósito.
 */
export const rasgado: InvitacionRasgado = {
  slug: "renata-y-tomas",
  origen: "demo",
  estilo: "rasgado",
  plan: "completa",

  nombres: "Renata & Tomás",
  volanta: "Nos casamos",
  fecha: "16 de Abril 2027",
  musica: `${R}/musica.mp3`,

  frase: "Lo mejor que nos pasó fue encontrarnos. Lo que sigue queremos vivirlo con ustedes.",

  rasgado: {
    compartir: `${R}/compartir.jpg`,
    evento: "Boda de Renata y Tomás",
    monograma: ["R", "T"],
    fotos: {
      portada: { src: `${R}/abrazo.webp`, alt: "Renata y Tomás abrazados, frente con frente, al atardecer", proporcion: 0.88, foco: "50% 0%" },
      lugar: { src: `${R}/lugar.webp`, alt: "Los novios de espaldas, de la mano, mirando las sierras junto a un árbol", proporcion: 0.9, foco: "50% 70%" },
      vestimenta: { src: `${R}/vestimenta.webp`, alt: "Ella con el vestido blanco volando en el viento y él mirándola", proporcion: 0.86, foco: "50% 60%" },
      pausa: { src: `${R}/pausa.webp`, alt: "Los novios abrazados delante de una puerta de madera", proporcion: 0.74, foco: "50% 60%" },
      cierre: { src: `${R}/novios.webp`, alt: "Los novios de pie, abrazados, con las sierras de fondo", proporcion: 0.64, foco: "50% 30%" },
    },
    bendicion: "Con la bendición de Dios y el amor de nuestros padres, queremos que nos acompañes en nuestra boda.",
    padres: [
      { titulo: "Padres de la novia", nombres: ["Adriana Peralta Ríos", "Guillermo Salas Vega"] },
      { titulo: "Padres del novio", nombres: ["Lorena Ibarra Funes", "Esteban Quiroga Paz"] },
    ],
    listaRegalos: { titulo: "Lista de regalos", boton: "Ver la lista", enlace: "https://www.amazon.com/wedding" },
    sobres: { titulo: "Lluvia de sobres", detalle: "Habrá un buzón el día de la fiesta" },
    pase: { invitado: "Familia Cortés Luna", lugares: 2 },
    soloAdultos: "Con cariño, pensamos la fiesta sin niños. Gracias por comprenderlo.",
    gracias: "Por ser parte de este día. Será un honor celebrarlo contigo.",
  },

  cronograma: [
    { hora: "18:00", titulo: "Ceremonia" },
    { hora: "19:00", titulo: "Brindis" },
    { hora: "20:30", titulo: "Cena" },
    { hora: "22:30", titulo: "Primer baile" },
    { hora: "03:00", titulo: "Despedida" },
  ],

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Capilla de los Cerros",
      hora: "18:00",
      direccion: "Camino del Cerro 120, Valle Sereno",
      mapa: "https://maps.google.com/?q=Capilla+de+los+Cerros",
    },
    {
      tipo: "Fiesta",
      titulo: "Estancia Cielo Alto",
      hora: "19:00",
      direccion: "Camino del Cerro 340, Valle Sereno",
      mapa: "https://maps.google.com/?q=Estancia+Cielo+Alto",
    },
  ],

  dressCode: { titulo: "Formal", detalle: "El blanco está reservado para la novia" },

  regalo: {
    mensaje: "Tu presencia es nuestro mejor regalo. Si además quieres tener un detalle:",
    banco: "Transferencia bancaria",
    alias: "renata.y.tomas",
    cbu: "0000000000000000000000",
    titular: "Renata Salas",
  },

  cierreRsvp: "16 de Marzo 2027",

  diseno: { acento: "#3b476f", fondo: "#fffdf0", fuente: "Georgia, serif", opacidadHero: 0.15 },
};
