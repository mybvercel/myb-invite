import type { Invitacion } from "../tipos";

/**
 * Modelo Rosa — la primera invitación super producida.
 *
 * Por ahora sólo tiene la carta: la presentación que se ve al abrirla está sin
 * desarrollar a propósito. Los datos de la pareja son inventados.
 */
export const rosa: Invitacion = {
  slug: "rosa",
  origen: "demo",
  // La demo muestra el panel entero: es el que se vende.
  plan: "completa-plus",

  nombres: "Alan & Sofía",
  volanta: "Nos casamos",
  fecha: "15 de Noviembre 2026",

  carta: {
    imagen: "/invitaciones/demo/rosa/carta.jpg",
    video: "/invitaciones/demo/rosa/apertura.mp4",
    iniciales: "A & S",
    instruccion: "Tocá para abrir",
  },

  hero: {
    imagen: "/invitaciones/demo/rosa/hero.jpg",
    video: "/invitaciones/demo/rosa/hero.mp4",
  },

  // Una cenefa por sección, rotando entre las tres: así ninguna sección repite
  // la botánica de la anterior.
  flores: [
    "/invitaciones/demo/rosa/flores-a.png",
    "/invitaciones/demo/rosa/flores-b.png",
    "/invitaciones/demo/rosa/flores-c.png",
  ],

  ilustracionLugar: "/invitaciones/demo/rosa/lugar.png",
  ilustracionVestimenta: "/invitaciones/demo/rosa/vestimenta.png",
  sello: "/invitaciones/demo/rosa/sello.png",

  frase:
    "Elegimos el mismo día, el mismo lugar y las mismas ganas de festejar. Sólo falta que estés.",

  cronograma: [
    { hora: "18:00", titulo: "Ceremonia" },
    { hora: "19:30", titulo: "Recepción" },
    { hora: "21:00", titulo: "Cena" },
    { hora: "00:00", titulo: "Fiesta" },
    { hora: "05:00", titulo: "Cierre" },
  ],

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Capilla Santa Rosa",
      hora: "18:00 hs",
      direccion: "Camino de los Robles 2400, Villa Allende",
      mapa: "https://maps.google.com/?q=Capilla+Santa+Rosa+Villa+Allende",
    },
    {
      tipo: "Fiesta",
      titulo: "Estancia La Alameda",
      hora: "19:30 hs",
      direccion: "Ruta 20 km 14, Córdoba",
      mapa: "https://maps.google.com/?q=Estancia+La+Alameda+Cordoba",
    },
  ],

  dressCode: {
    titulo: "Elegante",
    detalle:
      "El blanco queda para la novia. Y ojo con los tacos: hay pasto desde la ceremonia hasta la pista.",
  },

  regalo: {
    mensaje:
      "Que estés ese día ya es el regalo. Pero si tenías ganas de algo más, esto nos empuja la luna de miel.",
    banco: "Banco Galicia",
    alias: "alan.sofia.boda",
    cbu: "0070XXXX30004XXXXXXXX8",
    titular: "Alan Ferreyra",
  },

  cierreRsvp: "Necesitamos saberlo antes del 15 de octubre para cerrar la mesa con el salón.",

  diseno: {
    acento: "#8d3b4a",
    fondo: "#fdf6f4",
    fuente: "Georgia, serif",
    opacidadHero: 0.15,
  },
};
