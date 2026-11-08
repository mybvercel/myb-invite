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
const { normalizar, sanearDoc, venceTarea, tareasAtrasadas, progresoChecklist, totalesPresupuesto, proximosPagos, rubrosSinCubrir, formatearMonto, ordenarMomentos, horaSiguiente } = await jiti.import("../src/panel/logica.ts");
const { aplicarPlantilla, momentosDe, PLANTILLAS } = await jiti.import("../src/panel/plantillas.ts");

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
igual("una fila con id y sin nombre se conserva", s.equipo.length, 2);
igual("una fila sin id ni nombre se descarta", sanearDoc({ ...d, equipo: [{ nombre: "" }], tareas: [{ titulo: "" }], momentos: [{ titulo: "" }] }, docVacio()).equipo.length, 0);
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

// 6. Presupuesto: pesos y dólares por separado.
const base = docVacio();
base.equipo = [{ id: "e1", rubro: "fotografia", nombre: "Estudio Luz", contacto: "", telefono: "", email: "", estado: "contratado", esPersona: false, notas: "" }];
base.cotizaciones = [
  { id: "c1", rubro: "fotografia", responsableId: "e1", descripcion: "", monto: 1200, moneda: "USD", elegida: true, notas: "" },
  { id: "c2", rubro: "fotografia", responsableId: null, descripcion: "", monto: 1500, moneda: "USD", elegida: false, notas: "" },
  { id: "c3", rubro: "catering", responsableId: null, descripcion: "", monto: 6500000, moneda: "ARS", elegida: true, notas: "" },
];
base.pagos = [
  { id: "p1", rubro: "fotografia", responsableId: "e1", concepto: "Seña", monto: 360, moneda: "USD", vence: "2026-10-01", pagado: true, pagadoEl: "2026-10-01" },
  { id: "p2", rubro: "fotografia", responsableId: "e1", concepto: "Saldo", monto: 840, moneda: "USD", vence: "2026-11-20", pagado: false, pagadoEl: "" },
  { id: "p3", rubro: "catering", responsableId: null, concepto: "Seña", monto: 1950000, moneda: "ARS", vence: "", pagado: true, pagadoEl: "2026-10-05" },
];
base.presupuesto = { tope: { ARS: 12000000, USD: 0 }, dolar: 0 };
const tot = totalesPresupuesto(base);
igual("USD comprometido sólo cuenta la elegida", tot.USD.comprometido, 1200);
igual("USD falta pagar", tot.USD.falta, 840);
igual("ARS no se mezcla con USD", [tot.ARS.comprometido, tot.ARS.pagado, tot.ARS.falta], [6500000, 1950000, 4550000]);
igual("tope por moneda", [tot.ARS.tope, tot.USD.tope], [12000000, 0]);
igual("próximos pagos: sólo los no pagados", proximosPagos(base.pagos).map((p) => p.id), ["p2"]);
igual("formato en pesos", formatearMonto(6500000, "ARS").replace(/\s/g, " "), "$ 6.500.000");

const sucio2 = {
  ...base,
  cotizaciones: [
    { id: "x1", rubro: "fotografia", monto: 100, moneda: "EUR", elegida: true, responsableId: "no-existe" },
    { id: "x2", rubro: "fotografia", monto: -50, moneda: "USD", elegida: true },
    { id: "x3", rubro: "salon", monto: "mucho", moneda: "ARS" },
  ],
  pagos: [{ id: "y1", rubro: "otro", monto: 5, moneda: "USD", vence: "pronto", pagado: false, pagadoEl: "2026-01-01" }],
  presupuesto: { tope: { ARS: -1, USD: "x" }, dolar: 1e12 },
};
const s2 = sanearDoc(sucio2, docVacio());
igual("moneda inválida pasa a ARS", s2.cotizaciones[0].moneda, "ARS");
igual("responsable inexistente pasa a null", s2.cotizaciones[0].responsableId, null);
igual("una sola elegida por rubro", s2.cotizaciones.filter((c) => c.elegida).length, 1);
igual("monto negativo pasa a 0", s2.cotizaciones[1].monto, 0);
igual("monto inválido pasa a 0", s2.cotizaciones[2].monto, 0);
igual("fecha de pago inválida se limpia", s2.pagos[0].vence, "");
igual("pagadoEl se limpia si no está pagado", s2.pagos[0].pagadoEl, "");
igual("tope y dólar acotados", [s2.presupuesto.tope.ARS, s2.presupuesto.tope.USD, s2.presupuesto.dolar], [0, 0, 1e7]);
igual("viejo sin presupuesto", normalizar(viejo, "#2e6f4e").presupuesto, { tope: { ARS: 0, USD: 0 }, dolar: 0 });

// 6b. Momentos del día.
const dia = sanearDoc({ ...docVacio(), equipo: [{ id: "e1", nombre: "DJ" }], momentos: [
  { id: "m1", hora: "25:99", titulo: "Hora mala", responsables: ["e1", "fantasma"] },
  { id: "m2", hora: "01:30", titulo: "Madrugada" },
  { id: "m3", hora: "23:00", titulo: "Noche" },
] }, docVacio());
igual("hora inválida pasa a 20:00", dia.momentos[0].hora, "20:00");
igual("responsables filtrados contra el equipo", dia.momentos[0].responsables, ["e1"]);
igual("la madrugada va después de la noche", ordenarMomentos(dia.momentos).map((m) => m.id), ["m1", "m3", "m2"]);
igual("hora siguiente: media hora después de la última", horaSiguiente(dia.momentos), "02:00");
igual("hora siguiente sin momentos", horaSiguiente([]), "20:00");
igual("plantilla del día: casamiento", momentosDe("casamiento").length > 5 && momentosDe("casamiento").every((m) => /^\d\d:\d\d$/.test(m.hora)), true);

// 7. Rubros sin cubrir.
const sc = docVacio();
sc.tareas = [{ id: "t", titulo: "a", rubro: "luces" }, { id: "u", titulo: "b", rubro: "fotografia" }, { id: "v", titulo: "c", rubro: "otro" }];
sc.equipo = [{ id: "e", rubro: "fotografia", nombre: "x", estado: "contratado" }];
igual("rubros pedidos sin nadie", rubrosSinCubrir(sc), ["luces"]);
sc.equipo[0].estado = "descartado";
igual("un descartado no cubre", rubrosSinCubrir(sc), ["fotografia", "luces"]);

console.log(fallas ? `\n${fallas} fallas` : "\nTodo bien");
process.exit(fallas ? 1 : 0);
