import type { InvitacionFotomaton } from "../tipos";

/**
 * Luis y Julieta. Estilo fotomatón.
 *
 * Las fotos son las reales de la pareja (Plataforma Invitaciones/Clientes/
 * Luis y Julieta/Fotos), procesadas con el script de la skill
 * `invitacion-fotomaton`.
 *
 * La fecha, los lugares, los horarios y los datos del regalo son de ejemplo,
 * completados para poder mostrar la invitación. Antes de mandarla se
 * reemplazan por los de la pareja. El CBU es inválido a propósito.
 */
const BASE = "/invitaciones/clientes/luis-y-julieta";

export const luisYJulieta: InvitacionFotomaton = {
  slug: "luis-y-julieta",
  origen: "cliente",
  plan: "completa",
  estilo: "fotomaton",

  nombres: "Luis & Julieta",
  volanta: "Nos casamos",
  fecha: "20 de Marzo 2027",

  fotomaton: {
    // El último cuadro es el que asoma primero de la ranura: por eso va la
    // foto con velo, que es la que dice "casamiento" sin leer nada.
    tira: [`${BASE}/tira-1.webp`, `${BASE}/tira-2.webp`, `${BASE}/tira-3.webp`],
    polaroid: `${BASE}/polaroid.webp`,
    iniciales: "L & J",
    compartir: `${BASE}/compartir.jpg`,
  },

  cronograma: [
    { hora: "17:30", titulo: "Recepción" },
    { hora: "18:00", titulo: "Ceremonia" },
    { hora: "19:30", titulo: "Brindis" },
    { hora: "21:00", titulo: "Cena" },
    { hora: "23:30", titulo: "Fiesta" },
    { hora: "04:30", titulo: "Cierre" },
  ],

  lugares: [
    {
      tipo: "Ceremonia",
      titulo: "Capilla San Roque",
      hora: "18:00 hs",
      direccion: "Av. San Martín 450, Alta Gracia, Córdoba",
      mapa: "https://maps.google.com/?q=Capilla+San+Roque+Alta+Gracia",
    },
    {
      tipo: "Fiesta",
      titulo: "Estancia La Paloma",
      hora: "19:30 hs",
      direccion: "Camino a Los Paredones km 3, Alta Gracia, Córdoba",
      mapa: "https://maps.google.com/?q=Estancia+La+Paloma+Alta+Gracia",
    },
  ],

  dressCode: {
    titulo: "Elegante sport",
    detalle: "El blanco queda para la novia. La fiesta es en un parque: mejor tacos anchos o chatitas.",
  },

  regalo: {
    mensaje: "Que estés ese día ya es el regalo. Si igual querés hacernos uno, esto nos ayuda con la luna de miel.",
    banco: "Banco Nación",
    alias: "luis.julieta.boda",
    // CBU de relleno, inválido a propósito (dígitos verificadores en cero):
    // no puede mandar plata a ninguna cuenta real. Reemplazar por el de la pareja.
    cbu: "0000000000000000000000",
    titular: "Luis Fernández",
  },

  cierreRsvp: "Confirmanos tu asistencia antes del 20 de febrero, así cerramos la lista con el salón.",

  diseno: {
    acento: "#7a0f18",
    fondo: "#fcf3ef",
    fuente: "Georgia, serif",
    opacidadHero: 0.15,
  },
};
