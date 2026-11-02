/**
 * Muestra cómo interpreta y arma el asistente una frase:
 *   node scripts/depurar-agente.mjs "hay 12 mesas redondas de 10 y una pista de 6x6"
 */
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(raiz, "src") } });
const { interpretar } = await jiti.import("../src/panel/agente/interpretar.ts");
const { aplicar } = await jiti.import("../src/panel/agente/aplicar.ts");
const { huella } = await jiti.import("../src/panel/logica.ts");
const { docVacio } = await jiti.import("../src/panel/tipos.ts");

const r = interpretar(process.argv.slice(2).join(" "));
console.log("ACCIONES");
for (const a of r.acciones) console.log(" ", JSON.stringify(a));
if (r.sinEntender.length) console.log("SIN ENTENDER:", r.sinEntender);

const { doc, hechos, avisos } = aplicar(docVacio(), r.acciones, { reiniciar: false });
console.log("HECHOS", hechos, "\nAVISOS", avisos);
console.log(`PLANO ${doc.salon.ancho} x ${doc.salon.largo}`);
for (const e of doc.salon.elementos) {
  const h = huella(e);
  const fuera = h.x0 < -0.01 || h.y0 < -0.01 || h.x1 > doc.salon.ancho + 0.01 || h.y1 > doc.salon.largo + 0.01;
  console.log(fuera ? "  FUERA" : "       ", e.nombre.padEnd(14), e.clase.padEnd(11), `(${e.x}, ${e.y})`, `${e.ancho}x${e.largo}`, e.giro ? "girada" : "", e.capacidad ?? "");
}
