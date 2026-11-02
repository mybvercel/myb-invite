import type { InvitacionMesa } from "../tipos";

/**
 * Modelo Mesa. Pareja, lugares y datos inventados para la demo.
 * El CBU es inválido a propósito: no puede mandar plata a ninguna cuenta.
 */
export const mesa: InvitacionMesa = {
  slug: "joaquin-y-clara",
  origen: "demo",
  estilo: "mesa",

  nombres: "Joaquín & Clara",
  volanta: "Nos casamos",
  fecha: "17 de Abril 2027",

  mesa: {
    compartir: "/invitaciones/mesa/compartir.jpg",
    menu: [
      { paso: "para recibir", plato: "Empanadas cortadas a cuchillo y vermut con soda" },
      { paso: "de entrada", plato: "Burrata, tomates asados y pan de campo" },
      { paso: "el principal", plato: "Ojo de bife al disco con papas rústicas" },
      { paso: "de postre", plato: "Panqueques de dulce de leche quemados al momento" },
    ],
  },

  cronograma: [
    { hora: "19:30", titulo: "Copas en el jardín" },
    { hora: "21:00", titulo: "A la mesa" },
    { hora: "22:30", titulo: "Primer baile" },
    { hora: "23:00", titulo: "Fiesta" },
    { hora: "02:30", titulo: "Mesa dulce" },
    { hora: "04:30", titulo: "Último tema" },
  ],

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Capilla Santa Teresita",
      hora: "18:00",
      direccion: "Los Espinillos 120, Ascochinga, Córdoba",
      mapa: "https://maps.google.com/?q=Ascochinga+Cordoba",
    },
    {
      tipo: "Fiesta",
      titulo: "Estancia Los Talas",
      hora: "19:30",
      direccion: "Ruta E-53 km 41, Ascochinga, Córdoba",
      mapa: "https://maps.google.com/?q=Ruta+E53+Ascochinga+Cordoba",
    },
  ],

  dressCode: {
    titulo: "Elegante de noche",
    detalle: "Tonos tierra, verdes y azules bienvenidos. El blanco es de la novia. Hay pasto: tacos anchos o cuña.",
  },

  logistica: {
    transporte: "Sale un micro desde Plaza España a las 17:00 y vuelve a las 3:00 y a las 5:00. Reservá tu lugar al confirmar.",
    hoteles: "Tenemos tarifa especial en Posada del Monte, a 4 km. Pedila a nombre de Joaquín y Clara.",
  },

  regalo: {
    mensaje: "Lo más lindo es que estés en la mesa. Si igual querés regalarnos algo, nos ayuda con la luna de miel.",
    banco: "Banco Galicia",
    alias: "joaquin.y.clara",
    cbu: "0000000000000000000000",
    titular: "Clara Ibáñez",
  },

  cierreRsvp: "Confirmá antes del 17 de marzo.",

  diseno: {
    acento: "#1d1b18",
    fondo: "#f1ebdf",
    fuente: "Georgia, serif",
    opacidadHero: 0.15,
  },
};
