/** Cuánto tarda el asistente en interpretar y armar salones de distintos tamaños. */
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(raiz, "src") } });
const { interpretar } = await jiti.import("../src/panel/agente/interpretar.ts");
const { aplicar } = await jiti.import("../src/panel/agente/aplicar.ts");
const { docVacio } = await jiti.import("../src/panel/tipos.ts");

const casos = [
  "El salón mide 30 por 20. Hay 12 mesas redondas de 10, la pista de 6 por 8 en el centro, barra al fondo a la derecha, mesa dulce a la izquierda, escenario al fondo y la mesa imperial para 20 centrada frente a la pista.",
  "Salón de 50 por 35, somos 300 invitados, mesas redondas de 10 alrededor de la pista, pista de 10 por 10, dos barras, escenario al fondo y un jardín de 15 por 35 a la derecha",
];
for (const t of casos) {
  aplicar(docVacio(), interpretar(t).acciones, { reiniciar: false });
  const n = 10;
  const t0 = performance.now();
  for (let i = 0; i < n; i++) aplicar(docVacio(), interpretar(t).acciones, { reiniciar: false });
  const ms = (performance.now() - t0) / n;
  const r = aplicar(docVacio(), interpretar(t).acciones, { reiniciar: false });
  console.log(`${ms.toFixed(1)} ms · ${r.doc.salon.elementos.length} elementos · ${r.avisos.length} avisos`);
}
