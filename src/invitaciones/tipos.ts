/**
 * La forma de una invitación digital. Una sola fuente de verdad para las demos
 * (src/invitaciones/demo) y para las de clientes (src/invitaciones/clientes).
 *
 * Todo lo visible sale de acá: agregar una boda no debería obligar a tocar JSX.
 */

/* ── La carta ──────────────────────────────────────────────────
   La pantalla de entrada y el momento que vende el producto: un sobre cerrado
   con lacre. El invitado toca la pantalla, corre el video de apertura y al
   terminar entra la invitación.

   Son dos assets, generados con los prompts de
   .claude/skills/invitaciones-casamiento/references/prompts-gemini-carta.md   */

export type Carta = {
  /** Sobre cerrado con el lacre incluido. Es lo primero que se ve. */
  imagen: string;
  /** La apertura. Su primer fotograma es `imagen`, por eso no hay salto. */
  video: string;
  /** Iniciales que van por HTML sobre el centro del lacre. Ej: "M&T". */
  iniciales: string;
  /** Texto chiquito debajo del sello. Ej: "Tocá para abrir". */
  instruccion: string;
};

/* ── Bloques de contenido ──────────────────────────────────── */

/** Un momento del día. Ej: 21:00 · Cena. */
export type Hito = { hora: string; titulo: string };

export type Lugar = {
  tipo: "Ceremonia" | "Fiesta" | "Civil";
  titulo: string;
  hora: string;
  direccion: string;
  mapa: string;
};

export type Regalo = {
  mensaje: string;
  banco: string;
  cbu: string;
  alias: string;
  titular: string;
};

export type Pregunta = {
  q: string;
  opciones: string[];
  correcta: number;
};

export type Logistica = {
  hoteles?: string;
  transporte?: string;
};

/* ── Diseño ────────────────────────────────────────────────── */

export type Diseno = {
  /** El acento sale de la foto de la pareja, no del gusto propio. */
  acento: string;
  /** Casi blanco siempre: la invitación tiene que sentirse liviana. */
  fondo: string;
  /** Tipografía de nombres y títulos. El cuerpo va en la del sistema. */
  fuente: string;
  /** 0.08 a 0.25. Cuanto más cargada la foto, más bajo. */
  opacidadHero: number;
};

/* ── La invitación completa ────────────────────────────────── */

type InvitacionBase = {
  slug: string;
  origen: "demo" | "cliente";
  /**
   * El plan contratado. Define qué ve el organizador en su panel
   * (/panel/<slug>): Esencial y Completa, la lista de
   * invitados; Completa +, además el salón, las mesas y el estilo.
   */
  plan?: "esencial" | "completa" | "completa-plus";

  /** Como lo quieren ver escrito. Ej: "Marti & Tomi". */
  nombres: string;
  /** Volanta chiquita arriba del nombre. Ej: "Nuestra Boda". */
  volanta: string;
  /** Formato español: "15 de Noviembre 2026". Siempre a futuro. */
  fecha: string;

  /**
   * Cenefas florales de las secciones de contenido, en el orden en que se
   * usan. Van generadas sobre blanco puro y se montan con `multiply`.
   * Si está vacío, las secciones se sostienen con el lavado del fondo.
   */
  flores?: string[];
  diseno: Diseno;

  /* ── Todo lo de abajo es la presentación, que todavía no se desarrolló.
     Opcional por ahora; pasa a obligatorio cuando se arme el contenido. ── */

  fotoHero?: string;
  galeria?: string[];
  frase?: string;

  cronograma?: Hito[];
  lugares?: Lugar[];
  /** Dibujos a línea. Con alpha, se montan con `multiply` sobre el papel. */
  ilustracionLugar?: string;
  ilustracionVestimenta?: string;
  /** El lacre suelto. Vuelve como botón del RSVP: esa rima con el sobre es lo
      que hace que la invitación se sienta una sola pieza. */
  sello?: string;
  dressCode?: { titulo: string; detalle: string };
  regalo?: Regalo;
  logistica?: Logistica;

  /** Tres preguntas, siempre de esta pareja. Nunca genéricas. */
  trivia?: Pregunta[];

  musica?: string;
  instagram?: string;

  /** Hasta cuándo puede confirmar la gente. */
  cierreRsvp?: string;
  /** El mural de notas y fotos de los invitados. */
  mural?: boolean;
};

/* ── Los estilos ──────────────────────────────────────────────
   Cada estilo tiene su propia portada y su propia manera de abrirse. Las
   secciones de información (el día, dónde, regalos, RSVP) son las mismas y
   se recolorean por variables: no se duplica lógica por estilo. */

/** Rosa: sobre con lacre que se abre en video, y portada ilustrada. */
export type InvitacionRosa = InvitacionBase & {
  estilo?: "rosa";
  carta: Carta;
  /** La portada ilustrada. El centro va vacío: los nombres se escriben encima. */
  hero: { imagen: string; video: string };
};

/**
 * Fotomatón: terciopelo rojo, un marco dorado con una ranura, y de la ranura
 * sale la tira de fotos de la pareja como de una cabina. Todo por código:
 * no depende de video ni de assets generados, sólo de las fotos.
 */
export type Fotomaton = {
  /** De 3 a 4 cuadros, ya en blanco y negro y recortados a 4:3. */
  tira: string[];
  /** Una foto a color, para la polaroid del collage. Opcional. */
  polaroid?: string;
  /** Las iniciales que van en la etiqueta del disco. Ej: "J & L". */
  iniciales: string;
  /** La imagen que se ve al compartir el link por WhatsApp. */
  compartir: string;
};

export type InvitacionFotomaton = InvitacionBase & {
  estilo: "fotomaton";
  fotomaton: Fotomaton;
};

/**
 * Garabato: dibujado a mano, una sola tinta roja sobre papel crudo. La pareja
 * cambia de pose en cada sección. Sin fotos ni assets: todo es SVG.
 */
export type InvitacionGarabato = InvitacionBase & {
  estilo: "garabato";
  garabato: {
    /** La imagen que se ve al compartir el link por WhatsApp. */
    compartir: string;
  };
};

/**
 * Cinta: flyer de fiesta en dos tintas (rojo y naranja) sobre crema. Una cinta
 * roja se traza con el scroll y para confirmar dos manos brindan. Sin fotos.
 */
export type InvitacionCinta = InvitacionBase & {
  estilo: "cinta";
  cinta: { compartir: string };
};

/**
 * Mesa: un banquete visto desde arriba, a tinta negra. La mesa se alarga con
 * el scroll y se van sentando invitados a los costados; toda la información
 * va sobre el mantel. En la otra punta hay una silla vacía: la del invitado.
 */
export type InvitacionMesa = InvitacionBase & {
  estilo: "mesa";
  mesa: {
    compartir: string;
    /** Los pasos de la cena, como en una carta de restaurante. */
    menu: { paso: string; plato: string }[];
  };
};

/**
 * Ciudad: tarjeta blanca sobre lino, enmarcada por casitas de Jerusalén en dos
 * azules que se construyen con el scroll. Pensada para bar y bat mitzvá.
 * Al confirmar, la casa del invitado se suma a la ciudad.
 */
export type InvitacionCiudad = InvitacionBase & {
  estilo: "ciudad";
  ciudad: {
    compartir: string;
    /** "Bar Mitzvá" o "Bat Mitzvá". */
    evento: string;
    /** El nombre en hebreo, tal cual se escribe. */
    hebreo: string;
    /** "nuestro hijo" / "nuestra hija". */
    vinculo: string;
    padres: string;
    agradecimiento: string;
    /** Verificada en hebcal.com para la fecha y la ciudad del evento. */
    parasha: { nombre: string; hebreo: string; fechaHebrea: string };
    kidush: { hora: string; detalle: string };
    /** Las 13 velas de la fiesta: para quién es cada una. */
    velas: string[];
  };
};

/**
 * Scrapbook: collage de quince en rosa y plata sobre papel marfil. Bola de
 * disco, globos foil, banderines y las fotos de la quinceañera recortadas.
 * Las imágenes vienen generadas por capas (flujo GPT/Gemini), el texto es HTML.
 */
export type InvitacionScrapbook = InvitacionBase & {
  estilo: "scrapbook";
  scrapbook: {
    compartir: string;
    /** Foto de infancia, recortada y en blanco y negro: va en la portada. */
    fotoInfancia: string;
    /** Retrato actual, recortado: va en el cierre. */
    fotoActual: string;
    horarios: { hora: string; titulo: string; detalle: string }[];
    comida: string;
  };
};

/** Lo que tienen en común los Bar y Bat Mitzvá que vienen de maqueta (Cerámica, Horizonte). */
export type DatosMitzva = {
    compartir: string;
    /** Ej: "Mi Bar Mitzvá". */
    evento: string;
    apellido?: string;
    familia: string;
    mensaje: string;
    firma?: string;
    ciudad: string;
    notaCeremonia: string;
    notaFiesta: string;
    /** Ej: "01:30 hs · domingo · despedida". */
    finFiesta: string;
    comida: string;
    regalos?: string;
    /** Verificada en hebcal.com para la fecha y la ciudad. */
    parasha?: { nombre: string; hebreo: string; fechaHebrea: string };
};

/**
 * Cerámica: Bar Mitzvá en marfil y azul cobalto, con una guarda de cerámica
 * impresa que se descubre al bajar. Diseño por capas (flujo GPT) pasado al motor.
 */
export type InvitacionCeramica = InvitacionBase & { estilo: "ceramica"; ceramica: DatosMitzva };

/**
 * Horizonte: Bar Mitzvá en azul noche y acuarela, con un panorama dibujado que
 * se descubre y un sobre que se abre al entrar. Diseño por capas (flujo GPT).
 */
export type InvitacionHorizonte = InvitacionBase & { estilo: "horizonte"; horizonte: DatosMitzva };

/**
 * Sobremesa: cena ejecutiva en blanco cálido y borgoña, con una copa a gran
 * escala y tipografía editorial. Diseño por capas (flujo GPT).
 */
export type InvitacionSobremesa = InvitacionBase & {
  estilo: "sobremesa";
  sobremesa: {
    compartir: string;
    /** Ej: "Executive Dinner". */
    tipo: string;
    anfitrion: string;
    mensaje: string;
    agenda: { hora: string; titulo: string; detalle: string }[];
    menu: { nombre: string; plato: string }[];
    bebidas: string;
    /** Ej: "Salón privado · primer piso". */
    salon: string;
    /** Ej: "Invitación individual". */
    cupo: string;
    ciudad: string;
  };
};

/**
 * Órbita: encuentro ejecutivo con una rueda de fotografías que gira sobre
 * papel claro. Diseño por capas (flujo GPT).
 */
export type InvitacionOrbita = InvitacionBase & {
  estilo: "orbita";
  orbita: {
    compartir: string;
    anfitrion: string;
    /** Ej: "Encuentro ejecutivo". */
    tipo: string;
    ciudad: string;
    marca: string;
    mensaje: string;
    agenda: { hora: string; titulo: string; detalle: string }[];
    cupo: string;
  };
};

/** Datos comunes de las invitaciones de apertura (Jardín y Cincuenta). */
type Agenda = { hora: string; titulo: string; detalle: string }[];

/**
 * Jardín al anochecer: quince años en lila y ciruela, con dos hojas de papel
 * que se abren al tocar el sello. Diseño por capas (flujo GPT).
 */
export type InvitacionJardin = InvitacionBase & {
  estilo: "jardin";
  jardin: {
    compartir: string;
    inicial: string;
    frase: [string, string];
    agenda: Agenda;
    /** Ej: "Nos despedimos a las 04:00." */
    cierre: string;
    /** Tres colores de inspiración para la vestimenta. */
    paleta: string[];
    regalo: string;
    despedida: [string, string];
  };
};

/**
 * Una carta, cincuenta historias: carta borgoña y marfil dentro de un sobre
 * con sello. Diseño por capas (flujo GPT).
 */
export type InvitacionCincuenta = InvitacionBase & {
  estilo: "cincuenta";
  cincuenta: {
    compartir: string;
    inicial: string;
    anios: string;
    frase: [string, string];
    brindis: string;
    detalleBrindis: [string, string];
    intro: string;
    agenda: Agenda;
    sigla: string;
    regalo: [string, string];
    despedida: string;
    cupo: number;
  };
};

export type Invitacion =
  | InvitacionRosa
  | InvitacionFotomaton
  | InvitacionGarabato
  | InvitacionCinta
  | InvitacionMesa
  | InvitacionCiudad
  | InvitacionScrapbook
  | InvitacionCeramica
  | InvitacionHorizonte
  | InvitacionSobremesa
  | InvitacionOrbita
  | InvitacionJardin
  | InvitacionCincuenta;

/** La imagen de la previsualización en WhatsApp, sea cual sea el estilo. */
export const imagenCompartir = (inv: Invitacion) =>
  inv.estilo === "fotomaton"
    ? inv.fotomaton.compartir
    : inv.estilo === "garabato"
      ? inv.garabato.compartir
      : inv.estilo === "cinta"
        ? inv.cinta.compartir
        : inv.estilo === "mesa"
          ? inv.mesa.compartir
          : inv.estilo === "ciudad"
            ? inv.ciudad.compartir
            : inv.estilo === "scrapbook"
              ? inv.scrapbook.compartir
              : inv.estilo === "ceramica"
                ? inv.ceramica.compartir
                : inv.estilo === "horizonte"
                  ? inv.horizonte.compartir
                  : inv.estilo === "sobremesa"
                    ? inv.sobremesa.compartir
                    : inv.estilo === "orbita"
                      ? inv.orbita.compartir
                      : inv.estilo === "jardin"
                        ? inv.jardin.compartir
                        : inv.estilo === "cincuenta"
                          ? inv.cincuenta.compartir
                          : inv.carta.imagen;
