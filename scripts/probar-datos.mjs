/**
 * Prueba de los datos del panel: que un documento viejo se normalice, que el
 * servidor corte lo que no corresponde y que las plantillas no se dupliquen.
 * Correr con `node scripts/probar-datos.mjs`.
 */
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(raiz, "src") } });

const { docVacio } = await jiti.import("../src/panel/tipos.ts");
const { normalizar, sanearDoc, venceTarea, tareasAtrasadas, progresoChecklist } = await jiti.import("../src/panel/logica.ts");
const { aplicarPlantilla, PLANTILLAS } = await jiti.import("../src/panel/plantillas.ts");

let fallas = 0;
const igual = (nombre, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) fallas++;
  console.log(`${ok ? "ok   " : "FALLA"} ${nombre}${ok ? "" : `  → ${JSON.stringify(real)} (esperaba ${JSON.stringify(esperado)})`}`);
};

// 1. Un panel guardado antes de que existieran el checklist y el equipo.
const viejo = { version: 3, actualizado: new Date().toISOString(), invitados: [], salon: { ancho: 20, largo: 10, elementos: [] }, tema: {}, ajustes: {}, descartes: {} };
const n = normalizar(viejo, "#2e6f4e");
igual("doc viejo: sin tareas ni equipo", [n.tareas.length, n.equipo.length, n.plantilla], [0, 0, ""]);

// 2. Plantilla: carga todo y una segunda vez no duplica.
let d = docVacio();
d = aplicarPlantilla(d, "casamiento");
const total = PLANTILLAS.find((p) => p.id === "casamiento").filas.length;
igual("casamiento carga todas las tareas", d.tareas.length, total);
igual("la plantilla queda anotada", d.plantilla, "casamiento");
const dos = aplicarPlantilla(d, "casamiento");
igual("aplicar dos veces no duplica", dos.tareas.length, total);
const mezcla = aplicarPlantilla(d, "quince");
igual("otra plantilla suma sin repetir lo común", mezcla.tareas.length > total && mezcla.tareas.length < total + PLANTILLAS.find((p) => p.id === "quince").filas.length, true);

// 3. El servidor corta y limpia.
const sucio = {
  ...d,
  equipo: [{ id: "e1", rubro: "inventado", nombre: "Estudio Luz", estado: "x", telefono: "1".repeat(100) }, { id: "e2", nombre: "  " }],
  tareas: [
    { id: "t1", titulo: "Contratar fotógrafo", etapa: "9m", responsableId: "e1", rubro: "fotografia", vence: "2026-09-15", hecha: true, hechaEl: "no es fecha" },
    { id: "t2", titulo: "Tarea huérfana", etapa: "mil años", responsableId: "no-existe", vence: "mañana" },
    { id: "t1", titulo: "Id repetido" },
    { titulo: "" },
  ],
  plantilla: "boda-inventada",
};
const s = sanearDoc(sucio, docVacio());
igual("rubro inválido pasa a 'otro'", s.equipo[0].rubro, "otro");
igual("estado inválido pasa a 'contratado'", s.equipo[0].estado, "contratado");
igual("teléfono cortado a 30", s.equipo[0].telefono.length, 30);
igual("equipo sin nombre se descarta", s.equipo.length, 1);
igual("tareas vacías se descartan", s.tareas.length, 3);
igual("responsable existente se conserva", s.tareas[0].responsableId, "e1");
igual("hechaEl inválida se limpia", s.tareas[0].hechaEl, "");
igual("etapa inválida pasa a 3m", s.tareas[1].etapa, "3m");
igual("responsable inexistente pasa a null", s.tareas[1].responsableId, null);
igual("fecha inválida se limpia", s.tareas[1].vence, "");
igual("ids repetidos se rehacen", new Set(s.tareas.map((t) => t.id)).size, 3);
igual("plantilla inventada se limpia", s.plantilla, "");

// 4. Fechas por etapa.
const evento = new Date(2027, 5, 18, 20);
const t = (etapa, vence = "") => ({ etapa, vence, hecha: false });
igual("12m: un año antes", venceTarea(t("12m"), evento), "2026-06-18");
igual("1m: 30 días antes", venceTarea(t("1m"), evento), "2027-05-19");
igual("el día", venceTarea(t("dia"), evento), "2027-06-18");
igual("después: 14 días", venceTarea(t("despues"), evento), "2027-07-02");
igual("fecha propia gana", venceTarea(t("1m", "2027-01-01"), evento), "2027-01-01");
igual("sin evento ni fecha: nunca vence", venceTarea(t("1m"), null), "");
const pasado = new Date(2020, 0, 1);
igual("atrasadas: las no hechas y vencidas", tareasAtrasadas([t("1m"), { ...t("1m"), hecha: true }], pasado).length, 1);

// 5. Progreso.
igual("progreso", progresoChecklist([{ hecha: true }, { hecha: false }, { hecha: true }, { hecha: false }]), { hechas: 2, total: 4, pct: 50 });
igual("progreso vacío", progresoChecklist([]), { hechas: 0, total: 0, pct: 0 });

console.log(fallas ? `\n${fallas} fallas` : "\nTodo bien");
process.exit(fallas ? 1 : 0);
