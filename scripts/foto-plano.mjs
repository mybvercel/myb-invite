/**
 * Arma una página con el plano que genera el asistente para una frase y el
 * encabezado del panel, con el CSS real, para sacarle una captura con un
 * navegador headless:
 *   node scripts/foto-plano.mjs salida.html "frase" [papel|blanco|noche]
 */
import { createJiti } from "jiti";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(raiz, "src") }, jsx: true });
const React = await import("react");
globalThis.React = React;
const { renderToStaticMarkup } = await import("react-dom/server");

const { interpretar } = await jiti.import("../src/panel/agente/interpretar.ts");
const { aplicar } = await jiti.import("../src/panel/agente/aplicar.ts");
const { ocupacion } = await jiti.import("../src/panel/logica.ts");
const { docVacio } = await jiti.import("../src/panel/tipos.ts");
const { Plano } = await jiti.import("../src/components/panel/Plano.tsx");
const { Fechas } = await jiti.import("../src/components/panel/Fechas.tsx");

const [salida, frase, base = "papel"] = process.argv.slice(2);
const doc = aplicar(docVacio("#7d2f3f"), interpretar(frase).acciones, { reiniciar: false }).doc;

// Algunos invitados sentados, para ver sillas ocupadas.
const mesas = doc.salon.elementos.filter((e) => e.tipo === "mesa");
doc.invitados = mesas.slice(0, 5).map((m, i) => ({ id: "i" + i, nombre: "x", grupo: "", personas: 6 + i, estado: "confirmado", telefono: "", comidas: [], notas: "", mesa: m.id, origen: "manual", alias: [], rsvp: null, cancion: "", enlace: null }));

const h = React.createElement;
const cuerpo = renderToStaticMarkup(
  h("div", { className: `pnl pnl--base-${base}`, style: { "--acento": "#7d2f3f", "--sobre-acento": "#fff", "--display": "'Instrument Serif', Georgia, serif", padding: "24px" } },
    h("div", { className: "pnl-encabezado" },
      h("h1", { className: "pnl-titulo" }, "Alan & Sofía"),
      h(Fechas, { fecha: "15 de Noviembre 2026", cierre: "antes del 15 de octubre", limite: "", pendientes: 12, onLimite: () => {} })),
    h("div", { style: { marginTop: 24, border: "1px solid var(--linea)" } }, h(Plano, { salon: doc.salon, ocupacion: ocupacion(doc.invitados), seleccion: mesas[2]?.id }))),
);

const css = readFileSync(path.join(raiz, "src/app/panel/panel.css"), "utf8");
writeFileSync(
  salida,
  `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Instrument+Serif&display=swap" rel="stylesheet">
<style>:root{--font-montserrat:Montserrat}body{margin:0}${css}</style></head><body>${cuerpo}</body></html>`,
);
console.log("listo", doc.salon.elementos.length, "elementos");
