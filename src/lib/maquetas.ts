import { correr, partesFecha, reemplazador, type DatosVista } from "./vista";

/**
 * Los modelos que son HTML propio (no pasan por el motor de invitaciones).
 * Para ponerles los datos del visitante se reescribe su texto al servirlos.
 */
export type Maqueta = {
  carpeta: string;
  titulo: string;
  imagen: string;
  nombres: string[];
  fechas: (f: string) => [string, string][];
};

const sinFechas = () => [] as [string, string][];
const corta = (f: string, sep: string) => {
  const p = partesFecha(f);
  return `${p.dd}${sep}${p.mm}${sep}${p.anio}`;
};

export const MAQUETAS: Record<string, Maqueta> = {
  "mis-humanos-se-casan": {
    carpeta: "/invitaciones/demo/mis-humanos-se-casan",
    titulo: "Mis humanos se casan",
    imagen: "/invitaciones/demo/mis-humanos-se-casan/miniatura.webp",
    nombres: ["Inés", "Matías"],
    fechas: (f) => {
      const p = partesFecha(f);
      const c = partesFecha(correr(f, -14));
      const dia = p.semana[0].toUpperCase() + p.semana.slice(1);
      return [
        ["24 abril 2027", `${p.dia} ${p.mes} ${p.anio}`],
        ["24 · 04 · 2027", corta(f, " · ")],
        ["Sábado 24 de abril", `${dia} ${p.dia} de ${p.mes}`],
        ["10 de abril", `${c.dia} de ${c.mes}`],
      ];
    },
  },
  "recuerdos-rojo": {
    carpeta: "/invitaciones/recuerdos-rojo",
    titulo: "Recuerdos en rojo",
    imagen: "/invitaciones/recuerdos-rojo/miniatura.webp",
    nombres: ["Clara", "Julián"],
    fechas: (f) => {
      const p = partesFecha(f);
      const c = partesFecha(correr(f, -17));
      const compacta = f.replaceAll("-", "");
      return [
        ["18 de junio de 2027", `${p.dia} de ${p.mes} de ${p.anio}`],
        ["viernes 18 de junio", `${p.semana} ${p.dia} de ${p.mes}`],
        ["18 de junio", `${p.dia} de ${p.mes}`],
        ["1 de junio", `${c.dia} de ${c.mes}`],
        ["18.06.2027", corta(f, ".")],
        ["2027-06-18", f],
        ["20270618T203000Z", `${compacta}T203000Z`],
        ["20270619T060000Z", `${correr(f, 1).replaceAll("-", "")}T060000Z`],
      ];
    },
  },
  "cine-chateau": {
    carpeta: "/invitaciones/cine-chateau",
    titulo: "Noche de cine",
    imagen: "/invitaciones/cine-chateau/miniatura.webp",
    nombres: ["Emilia", "Nicolás"],
    fechas: (f) => {
      const p = partesFecha(f);
      const hoy = f.replaceAll("-", "");
      const sig = correr(f, 1).replaceAll("-", "");
      const c = partesFecha(correr(f, -19));
      return [
        ["20 · NOVIEMBRE · 2027", `${p.dia} · ${p.mes.toUpperCase()} · ${p.anio}`],
        ["20 · 11 · 2027", corta(f, " · ")],
        ["1 de noviembre", `${c.dia} de ${c.mes}`],
        ["2027-11-20", f],
        ["20271120T173000", `${hoy}T173000`],
        ["20271120T203000Z", `${hoy}T203000Z`],
        ["20271121T030000", `${sig}T030000`],
        ["20271121T060000Z", `${sig}T060000Z`],
      ];
    },
  },
  // No lleva nombre de empresa a la vista: se muestra tal cual, con su fecha.
  nocturna: {
    carpeta: "/invitaciones/nocturna",
    titulo: "Nocturna",
    imagen: "/invitaciones/nocturna/miniatura.webp",
    nombres: [],
    fechas: sinFechas,
  },
};

export function personalizarMaqueta(m: Maqueta, d: DatosVista) {
  const pares: [string, string][] = [];
  if (m.nombres.length === 2 && d.b) pares.push([m.nombres[0], d.a], [m.nombres[1], d.b]);
  if (d.f) pares.push(...m.fechas(d.f));
  return reemplazador(pares);
}
