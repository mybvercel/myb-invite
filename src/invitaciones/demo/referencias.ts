import type { InvitacionEscena } from "../tipos";

/**
 * Las cinco demos hechas sobre referencias. Parejas, fechas y salones son
 * inventados y las cuentas inválidas; las direcciones existen, para que el mapa
 * de Google muestre algo real. Fotos de Pexels (licencia libre), grabados del
 * Rijksmuseum y Yale (CC0), música de dominio público tocada con piano propio.
 */

const mapa = (q: string) => `https://maps.google.com/?q=${encodeURIComponent(q)}`;

const C = "/invitaciones/cupido";
export const cupido: InvitacionEscena = {
  slug: "cupido",
  origen: "demo",
  estilo: "cupido",
  plan: "completa",
  nombres: "Los novios",
  volanta: "Nos casamos",
  fecha: "26 de Junio 2027",
  musica: `${C}/musica.mp3`,
  frase: "Creemos que la felicidad se completa cuando se comparte con los que más queremos.",
  escena: {
    compartir: `${C}/compartir.jpg`,
    evento: "Nuestra boda",
    intro: [],
    fotos: {
      portada: { src: `${C}/cafe.webp`, alt: "La pareja en la mesa de un café, tomados de las manos", foco: "50% 62%" },
      mesa: { src: `${C}/mesa.webp`, alt: "Mesa de la fiesta con velas, flores y copas" },
      ellas: { src: `${C}/ellas.webp`, alt: "Amigas con vestidos largos y ramos en un parque" },
      ellos: { src: `${C}/ellos.webp`, alt: "Amigos de traje abrazados en ronda" },
    },
    paleta: [
      { nombre: "Vino", color: "#70142a", imagen: `${C}/saten-vino.webp` },
      { nombre: "Caramelo", color: "#be8c5c", imagen: `${C}/saten-caramelo.webp` },
      { nombre: "Champán", color: "#e2be86", imagen: `${C}/saten-champan.webp` },
      { nombre: "Perla", color: "#cac4be", imagen: `${C}/saten-perla.webp` },
      { nombre: "Oliva", color: "#969e58", imagen: `${C}/saten-oliva.webp` },
      { nombre: "Bosque", color: "#54623a", imagen: `${C}/saten-bosque.webp` },
    ],
    notas: ["Después de la boda nos vamos de viaje: por favor, no traigan flores.", "Nos alegra cualquier regalo. No importa en qué sobre venga."],
    bebidas: ["Vino tinto", "Vino blanco", "Champán", "Whisky", "Sin alcohol"],
    gracias: "Te esperamos",
  },
  cronograma: [
    { hora: "13:00", titulo: "Recepción", detalle: "Nos encontramos en el hotel" },
    { hora: "13:30", titulo: "Ceremonia", detalle: "En la terraza" },
    { hora: "17:00", titulo: "Cena y fiesta", detalle: "En el restaurante" },
  ],
  lugares: [
    { tipo: "Ceremonia", titulo: "Hotel Veranda", hora: "13:00", direccion: "Calle Durango 200, Roma Norte, Ciudad de México", mapa: mapa("Calle Durango 200, Roma Norte, Ciudad de México") },
    { tipo: "Fiesta", titulo: "Restaurante Sicilia", hora: "17:00", direccion: "Av. Álvaro Obregón 130, Roma Norte, Ciudad de México", mapa: mapa("Av. Álvaro Obregón 130, Roma Norte, Ciudad de México") },
  ],
  dressCode: { titulo: "Formal", detalle: "Nos encantaría que te sumes a los colores de la fiesta. Para ellos alcanza con un traje clásico." },
  regalo: { mensaje: "", banco: "Transferencia bancaria", alias: "boda.cupido", cbu: "0000000000000000000000", titular: "Los novios" },
  cierreRsvp: "26 de Mayo 2027",
  diseno: { acento: "#8c1526", fondo: "#e4e1d8", fuente: "Georgia, serif", opacidadHero: 0.15 },
};

const H = "/invitaciones/hilo-rojo";
export const hiloRojo: InvitacionEscena = {
  slug: "hilo-rojo",
  origen: "demo",
  estilo: "hilo",
  plan: "completa",
  nombres: "Olivia & Dante",
  volanta: "Nos casamos",
  fecha: "5 de Junio 2027",
  musica: `${H}/musica.mp3`,
  frase: "soñar lo mismo",
  escena: {
    compartir: `${H}/compartir.jpg`,
    evento: "Boda de Olivia y Dante",
    intro: ["¡Pasó lo increíble! Este amor sin medida nos dio la excusa para reunir a toda nuestra gente.", "Te invitamos a celebrar un día único: ¡nuestra boda!"],
    fotos: {
      abrazo: { src: `${H}/abrazo.webp`, alt: "Ella abraza a él desde atrás, los dos miran a cámara", foco: "50% 20%" },
      sentados: { src: `${H}/sentados.webp`, alt: "La pareja en un estudio, él sentado y ella apoyada en su hombro", foco: "50% 50%" },
      perfil: { src: `${H}/perfil.webp`, alt: "Retrato de la pareja en blanco y negro", foco: "50% 15%" },
      brindis: { src: `${H}/brindis.webp`, alt: "Muchas copas brindando en una fiesta" },
    },
    notas: [
      "Para tener las manos libres y abrazarte, nos hará felices un sobre liviano.",
      "Tranquilidad: nadie tendrá que dar un discurso. Habrá micrófono abierto para quien quiera.",
      "Si quieres traer flores, que sea una sola rosa blanca: juntas harán un ramo enorme.",
      "Para los más pequeños habrá un salón propio con animadores, así bailas sin apuro.",
    ],
    gracias: "Con amor",
  },
  lugares: [{ tipo: "Fiesta", titulo: "All Seasons", hora: "18:00", direccion: "Av. Alvear 1661, Recoleta, Buenos Aires", mapa: mapa("Av. Alvear 1661, Recoleta, Buenos Aires") }],
  dressCode: { titulo: "Elegante", detalle: "" },
  cierreRsvp: "5 de Mayo 2027",
  diseno: { acento: "#b8282c", fondo: "#f2ede6", fuente: "Georgia, serif", opacidadHero: 0.15 },
};

const Y = "/invitaciones/dijo-que-si";
export const dijoQueSi: InvitacionEscena = {
  slug: "dijo-que-si",
  origen: "demo",
  estilo: "dijosi",
  plan: "completa",
  nombres: "Abril & Julián",
  volanta: "¡Dijo que sí!",
  fecha: "24 de Julio 2027",
  musica: `${Y}/musica.mp3`,
  escena: {
    compartir: `${Y}/compartir.jpg`,
    evento: "Boda de Abril y Julián",
    intro: ["Es un honor invitarte a una fiesta que preparamos con todo el amor. Tienes un lugar especial en nuestro corazón y en nuestra mesa."],
    fotos: {
      tele1: { src: `${Y}/tele.webp`, alt: "Él le besa la frente mientras ella sonríe", foco: "50% 40%" },
      tele2: { src: `${Y}/canal2.webp`, alt: "Los dos riendo frente a frente", foco: "50% 35%" },
      tele3: { src: `${Y}/canal3.webp`, alt: "La pareja de noche levantando un farol", foco: "40% 45%" },
      retrato: { src: `${Y}/retrato.webp`, alt: "Retrato de la pareja sobre fondo negro", foco: "50% 30%" },
      lugar: { src: `${Y}/lugar.webp`, alt: "Mesas largas al aire libre con guirnaldas de luces" },
      cuadro1: { src: `${Y}/cuadro1.webp`, alt: "" },
      cuadro2: { src: `${Y}/cuadro2.webp`, alt: "" },
      cuadro3: { src: `${Y}/cuadro3.webp`, alt: "" },
      cuadro4: { src: `${Y}/cuadro4.webp`, alt: "" },
      cuadro5: { src: `${Y}/cuadro5.webp`, alt: "" },
    },
    notas: ["Tu sonrisa ya nos hace el día.", "Si quieres regalarnos algo, un sobre nos ayuda a cumplir un sueño."],
    gracias: "Nos vemos pronto",
  },
  cronograma: [
    { hora: "17:45", titulo: "Ceremonia" },
    { hora: "19:00", titulo: "Fotos" },
    { hora: "19:30", titulo: "Brindis" },
    { hora: "20:00", titulo: "Cena" },
    { hora: "21:30", titulo: "Pastel" },
    { hora: "22:00", titulo: "Fiesta" },
    { hora: "03:00", titulo: "Despedida" },
  ],
  lugares: [{ tipo: "Fiesta", titulo: "Restaurante Bellini", hora: "17:45", direccion: "Calle de Alcalá 42, Madrid", mapa: mapa("Calle de Alcalá 42, Madrid") }],
  dressCode: { titulo: "Etiqueta", detalle: "Para ellas, vestido largo de noche. Para ellos, traje oscuro con corbata o moño." },
  regalo: { mensaje: "", banco: "Transferencia bancaria", alias: "abril.y.julian", cbu: "0000000000000000000000", titular: "Abril Méndez" },
  cierreRsvp: "24 de Junio 2027",
  diseno: { acento: "#9c1220", fondo: "#f1ede4", fuente: "Georgia, serif", opacidadHero: 0.15 },
};

const V = "/invitaciones/vinilo";
export const vinilo: InvitacionEscena = {
  slug: "vinilo",
  origen: "demo",
  estilo: "vinilo",
  plan: "completa",
  nombres: "Mateo & Sofía",
  volanta: "Una invitación muy especial",
  fecha: "18 de Septiembre 2027",
  musica: `${V}/musica.mp3`,
  frase: "Qué rápido crecimos. Y aquí estamos, listos para formar nuestra propia familia.",
  escena: {
    compartir: `${V}/compartir.jpg`,
    evento: "Boda de Mateo y Sofía",
    intro: ["Te invitamos a celebrar uno de los momentos más importantes de nuestra vida: el día de nuestra boda.", "Queremos compartirlo contigo y sentir cerca tu cariño."],
    fotos: {
      el: { src: `${V}/el.webp`, alt: "Mateo de niño, con camisa a rayas", foco: "50% 30%" },
      ella: { src: `${V}/ella.webp`, alt: "Sofía de bebé, con vestido amarillo y vincha de flor", foco: "50% 25%" },
      mesa: { src: `${V}/mesa.webp`, alt: "Mesa de bienvenida con flores y velas" },
      look1: { src: `${V}/look1.webp`, alt: "Vestido largo color vino", foco: "45% 50%" },
      look2: { src: `${V}/look2.webp`, alt: "Vestido de satén coral", foco: "50% 30%" },
      look3: { src: `${V}/look3.webp`, alt: "Vestido negro de satén con sombrero", foco: "50% 40%" },
      grupo: { src: `${V}/grupo.webp`, alt: "Grupo de amigos vestidos de gala" },
      saten: { src: `${V}/saten.webp`, alt: "Satén color vino" },
      flores: { src: `${V}/flores.webp`, alt: "Vajilla y flores" },
    },
    paleta: [
      { nombre: "Vino", color: "#4d0d17" },
      { nombre: "Ciruela", color: "#712537" },
      { nombre: "Rosa viejo", color: "#a5656b" },
      { nombre: "Arena", color: "#d6c1ab" },
      { nombre: "Cacao", color: "#6d422c" },
    ],
    notas: ["Deja a los más pequeños en buenas manos: la noche es solo para adultos.", "Si piensas en un regalo, un sobre es la mejor idea.", "Lleva calzado para bailar: la pista no descansa."],
    gracias: "Te esperamos",
  },
  cronograma: [
    { hora: "15:30", titulo: "Bienvenida", detalle: "Un brindis y a esperar la ceremonia" },
    { hora: "16:00", titulo: "Ceremonia", detalle: "Tierna y emotiva: no vale aguantar las lágrimas" },
    { hora: "17:00", titulo: "Banquete", detalle: "Buena mesa con la gente más querida" },
    { hora: "23:00", titulo: "Pastel", detalle: "El final más dulce de un día único" },
  ],
  lugares: [{ tipo: "Fiesta", titulo: "Green House", hora: "15:30", direccion: "Malecón de la Reserva 610, Miraflores, Lima", mapa: mapa("Malecón de la Reserva 610, Miraflores, Lima") }],
  dressCode: { titulo: "Elegante", detalle: "Cuidamos cada detalle de la fiesta. Nos hará felices que tu ropa acompañe estos colores." },
  regalo: { mensaje: "", banco: "Transferencia bancaria", alias: "mateo.y.sofia", cbu: "0000000000000000000000", titular: "Sofía Rivas" },
  cierreRsvp: "18 de Agosto 2027",
  diseno: { acento: "#7a1f22", fondo: "#fdf6ec", fuente: "Georgia, serif", opacidadHero: 0.15 },
};

const X = "/invitaciones/xoxo";
export const xoxo: InvitacionEscena = {
  slug: "xoxo",
  origen: "demo",
  estilo: "xoxo",
  plan: "completa",
  nombres: "Ana & Leo",
  volanta: "Nos casamos",
  fecha: "31 de Julio 2027",
  musica: `${X}/musica.mp3`,
  escena: {
    compartir: `${X}/compartir.jpg`,
    evento: "Boda de Ana y Leo",
    intro: ["¡Nos casamos!", "Con todo el corazón te invitamos a nuestra boda, que va a ser increíble."],
    fotos: {
      portada: { src: `${X}/besito.webp`, alt: "Ana y Leo besándose en el sofá", foco: "50% 45%" },
      cerca: { src: `${X}/de-cerca.webp`, alt: "Ana y Leo besándose de cerca", foco: "50% 40%" },
      piso: { src: `${X}/juntos.webp`, alt: "Ana y Leo sentados en el piso, besándose", foco: "50% 30%" },
      sofa: { src: `${X}/sillon.webp`, alt: "Ana y Leo recostados en el sofá", foco: "60% 50%" },
      fondo: { src: `${X}/fondo.webp`, alt: "Ana y Leo charlando en el sofá, en blanco y negro", foco: "55% 50%" },
    },
    palabras: ["cantar", "mucho", "brindar", "vino", "bailar", "♥", "fotos", "reír", "comer", "abrazos", "escribir", "♥", "pastel", "chistes", "muchos", "sonreír", "intentar", "no llorar…"],
    notas: ["Sin código de vestimenta. ¡Solo queremos tenerte cerca!"],
    gracias: "Con amor, Ana y Leo",
  },
  cronograma: [
    { hora: "16:00", titulo: "Llegada" },
    { hora: "17:00", titulo: "Ceremonia" },
    { hora: "18:00", titulo: "Banquete" },
    { hora: "21:00", titulo: "Baile y fuegos artificiales" },
  ],
  lugares: [{ tipo: "Fiesta", titulo: "Casa del Robledal", hora: "16:00", direccion: "Echeverría 2800, Belgrano, Buenos Aires", mapa: mapa("Echeverría 2800, Belgrano, Buenos Aires") }],
  regalo: { mensaje: "", banco: "Transferencia bancaria", alias: "ana.y.leo", cbu: "0000000000000000000000", titular: "Ana Duarte" },
  cierreRsvp: "1 de Julio 2027",
  diseno: { acento: "#b5141e", fondo: "#f1ede6", fuente: "Georgia, serif", opacidadHero: 0.15 },
};

export const referencias = [cupido, hiloRojo, dijoQueSi, vinilo, xoxo];
