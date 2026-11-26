import { DISENOS, nombreDe, whatsappPara, type Diseno, type TipoEvento } from "./invitaciones";
import { SITE_URL } from "./site";
import { consultaVista, fechaLarga, type DatosVista } from "./vista";

/** Lo que pregunta /armar. Todo el texto vive acá; la pantalla sólo lo dibuja. */

export type EventoArmar = {
  id: "boda" | "quince" | "mitzva" | "cumple" | "empresa";
  tipo: TipoEvento;
  titulo: string;
  /** Cómo se nombra en el mensaje de WhatsApp. */
  mensaje: string;
  /** Ids de DISENOS. Sin lista, todos los del tipo. Nocturna queda afuera: no
      lleva el nombre de nadie a la vista, así que no hay qué personalizar. */
  modelos?: number[];
  /** La foto de la tarjeta del primer paso. Sin foto, la miniatura del primer modelo. */
  foto?: string;
  preguntaNombre: string;
  campoA: string;
  campoB?: string;
};

export const EVENTOS: EventoArmar[] = [
  { id: "boda", foto: "/invitaciones/armar/boda.webp", tipo: "bodas", titulo: "Casamiento", mensaje: "Casamiento", preguntaNombre: "¿Quiénes se casan?", campoA: "Tu nombre", campoB: "El nombre de tu pareja" },
  { id: "mitzva", foto: "/invitaciones/armar/mitzva.webp", tipo: "cumples", titulo: "Bar o Bat Mitzvá", mensaje: "Bar Mitzvá", modelos: [6, 7, 5], preguntaNombre: "¿Qué nombre va en la invitación?", campoA: "Su nombre" },
  { id: "cumple", foto: "/invitaciones/armar/cumple.webp", tipo: "cumples", titulo: "Cumpleaños", mensaje: "Cumpleaños", modelos: [10], preguntaNombre: "¿Quién cumple?", campoA: "Su nombre" },
  { id: "empresa", foto: "/invitaciones/armar/empresa.webp", tipo: "profesional", titulo: "Evento ejecutivo", mensaje: "Evento ejecutivo", modelos: [8, 9, 12, 13, 14], preguntaNombre: "¿Quién invita?", campoA: "Tu empresa o marca" },
  { id: "quince", foto: "/invitaciones/armar/quince.webp", tipo: "cumples", titulo: "Cumpleaños de 15", mensaje: "Cumpleaños de 15", modelos: [4, 11], preguntaNombre: "¿Cómo se llama tu hija?", campoA: "Su nombre" },
];

/**
 * Cuántas fotos de las personas lleva cada modelo (por slug). En la vista
 * previa se ven las de ejemplo: hay que decirlo, si no creen que queda así.
 * Los que no están no llevan fotos: todo es ilustración o tipografía.
 */
const FOTOS: Record<string, number> = {
  "luis-y-julieta": 4, "recuerdos-rojo": 1, "renata-y-tomas": 5, cupido: 1, "hilo-rojo": 3,
  "dijo-que-si": 4, vinilo: 2, xoxo: 5, "valentina-15": 2,
};
export const fotosDe = (d: Diseno) => FOTOS[slugDe(d)] ?? 0;

/** De quién son las fotos, dicho a quien arma la invitación. */
export const deQuienFotos = (e: EventoArmar) =>
  e.id === "boda" ? "las de ustedes" : e.id === "quince" ? "las de tu hija" : "las tuyas";

export const modelosDe = (e: EventoArmar): Diseno[] =>
  e.modelos
    ? e.modelos.map((id) => DISENOS.find((d) => d.id === id)).filter((d): d is Diseno => Boolean(d))
    : DISENOS.filter((d) => d.tipo === e.tipo);

/** El slug de la vista previa es el último tramo del enlace del modelo. */
export const slugDe = (d: Diseno) => (d.enlace ?? "").split("/").at(-1) ?? "";

export const eventoDeModelo = (d: Diseno) => EVENTOS.find((e) => modelosDe(e).some((m) => m.id === d.id));

/** El modelo del catálogo con ese slug, si se puede personalizar. */
export const modeloPorSlug = (slug: string) => DISENOS.find((d) => slugDe(d) === slug && eventoDeModelo(d));

export const enlaceArmar = (d?: Diseno) => (d ? `/armar?m=${slugDe(d)}` : "/armar");

export type Preocupacion = { id: string; titulo: string; respuesta: string };

export const PREOCUPACIONES: Preocupacion[] = [
  { id: "confirmen", titulo: "Que la gente confirme", respuesta: "Cada familia recibe su link, confirma en un minuto y vos ves quién falta." },
  { id: "mesas", titulo: "Armar las mesas", respuesta: "Cargás tu salón, decís quién va con quién y quién no, y las mesas se ubican solas." },
  { id: "distinta", titulo: "Que sea linda y distinta", respuesta: "La armamos con tus fotos, tu canción y tu estilo. Nadie más la va a tener igual." },
  { id: "tecnologia", titulo: "No entiendo nada de tecnología", respuesta: "La armamos nosotros. Vos sólo mandás el link por WhatsApp." },
];

export const rutaVista = (d: Diseno, v: DatosVista, marco = false) =>
  `/i/vista/${slugDe(d)}?${consultaVista(v)}${marco ? "&marco=1" : ""}`;

export function mensajeArmar(o: {
  evento: EventoArmar;
  modelo: Diseno;
  elegidoPorNosotros: boolean;
  vista: DatosVista;
  preocupacion: Preocupacion;
}) {
  const { evento, modelo, vista } = o;
  const que = evento.id === "mitzva" && vista.t === "bat" ? "Bat Mitzvá" : evento.mensaje;
  const quien = vista.b ? `${vista.a} y ${vista.b}` : vista.a;
  const anios = vista.e ? ` (cumple ${vista.e})` : "";
  return whatsappPara(
    [
      "Hola! Armé mi invitación en la web.",
      `${que} de ${quien}${anios}`,
      `Fecha: ${vista.f ? fechaLarga(vista.f) : "todavía no la tenemos"}`,
      `Modelo: ${nombreDe(modelo)} (${modelo.nombre})${o.elegidoPorNosotros ? " (ayúdenme a elegir)" : ""}`,
      ...(fotosDe(modelo) ? [`Fotos: lleva ${fotosDe(modelo)}, se las mando por acá`] : []),
      `Lo que más me preocupa: ${o.preocupacion.titulo.toLowerCase()}`,
      `Así quedó: ${SITE_URL}${rutaVista(modelo, vista)}`,
      "¿Me pasan el valor para reservarla?",
    ].join("\n"),
  );
}
