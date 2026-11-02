/**
 * Humo del panel: renderiza cada pestaña con un salón armado por el asistente
 * y confirma que no explota y que muestra lo que tiene que mostrar.
 * Correr con `node scripts/probar-panel.mjs`.
 */
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(raiz, "src") }, jsx: true });

const React = await import("react");
globalThis.React = React; // jiti compila JSX con el runtime clásico
const h = React.createElement;
const { renderToString } = await import("react-dom/server");
const { interpretar } = await jiti.import("../src/panel/agente/interpretar.ts");
const { aplicar } = await jiti.import("../src/panel/agente/aplicar.ts");
const { docVacio } = await jiti.import("../src/panel/tipos.ts");

const texto = "El salón mide 30 por 20. Hay 12 mesas redondas de 10, la pista de 6 por 8 en el centro, barra al fondo a la derecha y la mesa imperial para 20 centrada frente a la pista.";
const base = docVacio();
base.invitados = [
  { id: "a", nombre: "Familia Gómez", grupo: "Familia Gómez", personas: 4, estado: "confirmado", telefono: "11 5555 1234", comidas: ["Sin TACC"], notas: "", mesa: null, origen: "manual", alias: [], rsvp: new Date().toISOString(), cancion: "", enlace: { token: "familia-gomez-ab12", saludo: "Te esperamos, Familia Gómez", nota: "", cupo: 4 } },
  { id: "b", nombre: "Caro", grupo: "", personas: 1, estado: "pendiente", telefono: "", comidas: [], notas: "", mesa: null, origen: "rsvp", alias: ["caro"], rsvp: null, cancion: "", enlace: null },
];
const doc = aplicar(base, interpretar(texto).acciones, { reiniciar: false }).doc;
const cambiar = () => {};

const pantallas = [
  ["Salón", "../src/components/panel/Salon.tsx", "Salon", { doc, cambiar }, ["Contale cómo es el salón", "Atajos", "pnl-plano"]],
  ["Mesas", "../src/components/panel/Mesas.tsx", "Mesas", { doc, cambiar, irASalon: () => {} }, ["Sentar solos", "Cuando alguien confirma", "Principal"]],
  ["Invitados", "../src/components/panel/Invitados.tsx", "Invitados", { doc, cambiar, completo: true, nombres: "Alan & Sofía", enlaceInvitacion: "/i/rosa" }, ["Familia Gómez", "Pegar lista"]],
  ["Links", "../src/components/panel/Links.tsx", "Links", { doc, cambiar, slug: "rosa", nombres: "Alan & Sofía" }, ["Evento cerrado", "Te esperamos, Familia Gómez"]],
  ["Resumen", "../src/components/panel/Resumen.tsx", "Resumen", { doc, irA: () => {} }, ["Qué falta", "Para el catering"]],
  ["Panel", "../src/components/panel/Panel.tsx", "Panel", { slug: "rosa", nombres: "Alan & Sofía", fecha: "15 de Noviembre 2026", plan: "completa-plus", inicial: doc, enlaceInvitacion: "/i/rosa" }, ["Deshacer", "respuesta nueva", "Links"]],
];

let fallas = 0;
for (const [nombre, archivo, exportado, props, esperado] of pantallas) {
  try {
    const mod = await jiti.import(archivo);
    const html = renderToString(h(mod[exportado], props));
    const faltan = esperado.filter((e) => !html.includes(e));
    if (faltan.length) throw new Error("no aparece: " + faltan.join(", "));
    console.log(`  ok    ${nombre} (${Math.round(html.length / 1024)} KB)`);
  } catch (e) {
    fallas++;
    console.log(`  FALLA ${nombre}: ${e.message.split("\n")[0]}`);
  }
}
process.exit(fallas ? 1 : 0);
