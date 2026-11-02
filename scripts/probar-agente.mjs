/**
 * Pruebas del asistente del salón: frases reales → qué entiende y cómo queda
 * el plano. Correr con `npm run probar-agente` (con -v muestra el detalle).
 *
 * Usa jiti (ya viene con Tailwind) para cargar el TypeScript tal cual, con el
 * alias "@/" del proyecto.
 */
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(raiz, "src") } });

const { interpretar } = await jiti.import("../src/panel/agente/interpretar.ts");
const { aplicar } = await jiti.import("../src/panel/agente/aplicar.ts");
const { choques, huella } = await jiti.import("../src/panel/logica.ts");
const { docVacio } = await jiti.import("../src/panel/tipos.ts");

let fallas = 0;
let total = 0;
const verbose = process.argv.includes("-v");

function caso(nombre, fn) {
  total++;
  try {
    fn();
    console.log(`  ok    ${nombre}`);
  } catch (e) {
    fallas++;
    console.log(`  FALLA ${nombre}\n        ${e.message}`);
  }
}
const igual = (a, b, que) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${que}: esperaba ${JSON.stringify(b)}, dio ${JSON.stringify(a)}`);
};
const cierto = (c, que) => {
  if (!c) throw new Error(que);
};

function armar(texto, doc = docVacio(), reiniciar = false) {
  const i = interpretar(texto);
  const r = aplicar(doc, i.acciones, { reiniciar });
  if (verbose) {
    console.log("        >", texto);
    console.log("         ", i.acciones.map((a) => `${a.tipo}:${a.clase ?? a.ref?.clase ?? ""}${a.cantidad ?? ""}`).join(" "));
    console.log("         ", r.hechos.join(" | "), r.avisos.length ? "AVISOS " + r.avisos.join(" | ") : "", i.sinEntender.length ? "SIN " + i.sinEntender.join(" | ") : "");
  }
  return { ...r, ...i };
}
const de = (doc, clase) => doc.salon.elementos.filter((e) => e.clase === clase);
const mesas = (doc) => doc.salon.elementos.filter((e) => e.tipo === "mesa");
const dentro = (doc) =>
  doc.salon.elementos.every((e) => {
    const h = huella(e);
    return h.x0 >= -0.01 && h.y0 >= -0.01 && h.x1 <= doc.salon.ancho + 0.01 && h.y1 <= doc.salon.largo + 0.01;
  });

console.log("\nNúmeros y medidas");

caso("salón con palabras", () => {
  const { doc } = armar("El salón mide veinticinco por dieciocho metros");
  igual([doc.salon.ancho, doc.salon.largo], [25, 18], "medidas");
});
caso("salón con x y decimales", () => {
  const { doc } = armar("salon de 22,5x16 mts");
  igual([doc.salon.ancho, doc.salon.largo], [22.5, 16], "medidas");
});
caso("salón por superficie", () => {
  const { doc } = armar("el salón tiene 300 m2");
  cierto(Math.abs(doc.salon.ancho * doc.salon.largo - 300) < 12, `área ${doc.salon.ancho}x${doc.salon.largo}`);
});
caso("metro y medio", () => {
  const { doc } = armar("una mesa redonda de un metro y medio");
  igual(mesas(doc)[0]?.ancho, 1.5, "diámetro");
  igual(mesas(doc)[0]?.capacidad, 10, "capacidad");
});

console.log("\nLo que pidió Benja");

caso("descripción completa en una frase", () => {
  const { doc, avisos, sinEntender } = armar(
    "El salón mide 30 por 20. Hay 12 mesas redondas de 10, la pista mide 6 por 8 y está en el centro, una barra al fondo a la derecha y quiero la mesa imperial centrada para 20 personas frente a la pista.",
  );
  igual([doc.salon.ancho, doc.salon.largo], [30, 20], "salón");
  igual(de(doc, "redonda").length, 12, "redondas");
  cierto(de(doc, "redonda").every((m) => m.capacidad === 10), "capacidad 10");
  const pista = de(doc, "pista")[0];
  igual([pista?.ancho, pista?.largo], [6, 8], "pista");
  cierto(Math.abs(pista.x - 15) < 0.6 && Math.abs(pista.y - 10) < 0.6, `pista centrada (${pista.x},${pista.y})`);
  const barra = de(doc, "barra")[0];
  cierto(barra && barra.x > 20 && barra.y < 5, `barra al fondo a la derecha (${barra?.x},${barra?.y})`);
  const imp = de(doc, "imperial")[0];
  cierto(imp?.capacidad === 20, `imperial para 20 (${imp?.capacidad})`);
  cierto(Math.abs(imp.x - pista.x) < 1, `imperial centrada con la pista (${imp.x})`);
  cierto(imp.y < pista.y, "imperial del lado del fondo, frente a la pista");
  igual(choques(doc.salon).length, 0, "choques");
  cierto(dentro(doc), "todo adentro del salón");
  igual(avisos, [], "avisos");
  igual(sinEntender, [], "sin entender");
});

caso("dictado por voz, sin comas ni puntos", () => {
  const { doc, sinEntender } = armar(
    "el salon mide veinticinco por dieciocho hay diez mesas redondas de diez una pista de seis por seis en el centro una barra a la izquierda y la mesa principal frente a la pista",
  );
  igual(de(doc, "redonda").length, 10, "redondas");
  igual(de(doc, "pista").length, 1, "pista");
  igual(de(doc, "barra").length, 1, "barra");
  cierto(de(doc, "barra")[0].x < 5, "barra a la izquierda");
  cierto(de(doc, "barra")[0].giro === 90, "barra contra la pared lateral, girada");
  cierto(mesas(doc).some((m) => m.principal), "mesa principal");
  igual(choques(doc.salon).length, 0, "choques");
  igual(sinEntender, [], "sin entender");
});

caso("mesas por cantidad de invitados", () => {
  const { doc } = armar("somos 150 invitados, mesas redondas de 10 y una pista de 7x7");
  igual(de(doc, "redonda").length, 15, "15 mesas");
});

caso("solo invitados arma mesas de 10", () => {
  const { doc } = armar("salón de 30 por 25, vienen 120 personas");
  igual(mesas(doc).length, 12, "12 mesas");
});

caso("estructuras varias con posiciones", () => {
  const { doc } = armar(
    "salón de 28 x 20. escenario al fondo, dj al lado del escenario, mesa dulce a la izquierda, baños cerca de la entrada a la derecha, entrada abajo al medio, 4 columnas en las esquinas, un jardín de 10 por 8 a la derecha",
  );
  cierto(de(doc, "escenario")[0]?.y < 4, "escenario al fondo");
  const dj = de(doc, "dj")[0];
  cierto(dj && Math.abs(dj.y - de(doc, "escenario")[0].y) < 3, "dj al lado del escenario");
  cierto(de(doc, "dulce")[0]?.x < 4, "mesa dulce a la izquierda");
  const entrada = de(doc, "entrada")[0];
  cierto(entrada && entrada.y > 18, "entrada contra la pared de abajo");
  cierto(de(doc, "bano")[0]?.x > entrada.x && de(doc, "bano")[0].y > 14, "baños al lado de la entrada, a la derecha");
  igual(de(doc, "columna").length, 4, "4 columnas");
  igual(de(doc, "exterior").length, 1, "jardín");
  cierto(dentro(doc), "todo adentro");
});

caso("mesas en el jardín", () => {
  const { doc } = armar("salón de 30 por 20, un jardín de 10 por 20 a la derecha, 3 mesas redondas de 10 en el jardín");
  const j = de(doc, "exterior")[0];
  cierto(de(doc, "redonda").length === 3 && de(doc, "redonda").every((m) => m.x > j.x - j.ancho / 2), "las 3 dentro del jardín");
});

console.log("\nCambios sobre un plano armado");

const baseDoc = () => armar("salón de 25 por 18, 10 mesas redondas de 10, pista de 6x6 en el centro, barra a la derecha").doc;

caso("hay 12 mesas con 10 puestas suma 2", () => {
  const { doc } = armar("hay 12 mesas", baseDoc());
  igual(mesas(doc).length, 12, "12 mesas");
});
caso("agregá 2 mesas suma 2", () => {
  const { doc } = armar("agregá 2 mesas más", baseDoc());
  igual(mesas(doc).length, 12, "12 mesas");
});
caso("sacá 3 mesas", () => {
  const { doc } = armar("sacá 3 mesas", baseDoc());
  igual(mesas(doc).length, 7, "7 mesas");
});
caso("borrá la barra", () => {
  const { doc } = armar("borrá la barra", baseDoc());
  igual(de(doc, "barra").length, 0, "sin barra");
});
caso("mové la pista al fondo", () => {
  const b = baseDoc();
  const { doc } = armar("mové la pista al fondo", b);
  cierto(de(doc, "pista")[0].y < de(b, "pista")[0].y, "más arriba");
  igual(de(doc, "pista").length, 1, "sigue siendo una");
});
caso("la pista mide 8 por 8 ajusta la existente", () => {
  const { doc } = armar("la pista mide 8 por 8", baseDoc());
  igual(de(doc, "pista").length, 1, "una pista");
  igual([de(doc, "pista")[0].ancho, de(doc, "pista")[0].largo], [8, 8], "medidas");
});
caso("todas las mesas de 12", () => {
  const { doc } = armar("todas las mesas son de 12", baseDoc());
  cierto(mesas(doc).every((m) => m.capacidad === 12 && m.ancho >= 1.8), "12 y más grandes");
});
caso("nombrar, etiquetar y principal", () => {
  const { doc } = armar("la mesa 3 se llama Familia Gómez. La mesa 4 es para la familia Pérez y la familia Ruiz. La mesa 1 es la principal", baseDoc());
  const m = mesas(doc);
  cierto(m.some((x) => x.nombre === "Familia Gómez"), "nombre con tilde y mayúscula: " + m.map((x) => x.nombre).join(","));
  const cuatro = m.find((x) => x.nombre === "Mesa 4");
  igual(cuatro?.etiquetas, ["Familia Pérez", "Familia Ruiz"], "etiquetas");
  cierto(m.find((x) => x.nombre === "Mesa 1")?.principal, "principal");
});
caso("sentar a una familia", () => {
  const b = baseDoc();
  b.invitados = [{ id: "a", nombre: "Tía Marta", grupo: "Familia Gómez", personas: 4, estado: "confirmado", telefono: "", comidas: [], notas: "", mesa: null, origen: "manual", alias: [], rsvp: null, cancion: "", enlace: null }];
  const { doc } = armar("sentá a la familia Gómez en la mesa 2", b);
  const m2 = mesas(doc).find((m) => m.nombre === "Mesa 2");
  igual(doc.invitados[0].mesa, m2?.id, "sentada en la 2");
});
caso("empezar de cero", () => {
  const { doc } = armar("empezá de nuevo: 5 mesas rectangulares para 8", baseDoc());
  igual(doc.salon.elementos.length, 5, "sólo las 5");
  cierto(mesas(doc).every((m) => m.clase === "rectangular" && m.capacidad === 8), "rectangulares de 8");
});
caso("salón chico avisa lo que no entra", () => {
  const { doc, avisos } = armar("salón de 10 por 8 con 20 mesas redondas de 10");
  cierto(mesas(doc).length < 20 && avisos.some((a) => /Entraron/.test(a)), "aviso de que no entra");
  igual(choques(doc.salon).length, 0, "sin choques");
});
caso("lo que no entiende lo devuelve", () => {
  const { sinEntender } = armar("12 mesas redondas, con luces cálidas colgando del techo");
  cierto(sinEntender.length === 1, JSON.stringify(sinEntender));
});

console.log("\nOtras formas de decirlo");

caso("rectangulares con medidas y capacidad", () => {
  const { doc } = armar("necesito 8 mesas rectangulares de 2 por 1 para 8 personas");
  igual(de(doc, "rectangular").length, 8, "8 rectangulares");
  cierto(de(doc, "rectangular").every((m) => m.capacidad === 8), "de 8");
});
caso("pista por superficie", () => {
  const { doc } = armar("una pista de baile de 36 m2");
  igual([de(doc, "pista")[0]?.ancho, de(doc, "pista")[0]?.largo], [6, 6], "6x6");
});
caso("mesa principal para 12 al fondo", () => {
  const { doc } = armar("salón de 20 por 15, quiero una mesa principal para 12 al fondo");
  const p = mesas(doc).find((m) => m.principal);
  cierto(p && p.capacidad === 12 && p.y < 3, `principal de 12 al fondo (${p?.capacidad}, ${p?.y})`);
});
caso("imperial con largo y capacidad", () => {
  const { doc } = armar("la mesa imperial de 8 metros para 26");
  const m = de(doc, "imperial")[0];
  cierto(m && m.ancho === 8 && m.capacidad === 26, `8 m para 26 (${m?.ancho}, ${m?.capacidad})`);
});
caso("redondas de 1,80 para 12 cada una alrededor de la pista", () => {
  const { doc } = armar("salón de 30 por 22. Pista de 7 por 7. Hay 15 mesas redondas de 1,80 para 12 personas cada una alrededor de la pista");
  igual(de(doc, "redonda").length, 15, "15");
  cierto(de(doc, "redonda").every((m) => m.ancho === 1.8 && m.capacidad === 12), "1,80 para 12");
  igual(choques(doc.salon).length, 0, "sin choques");
});
caso("escenario centrado al fondo", () => {
  const { doc } = armar("salón de 24 por 16, el escenario de 6 por 4 al fondo centrado");
  const e = de(doc, "escenario")[0];
  cierto(e && e.ancho === 6 && e.largo === 4 && Math.abs(e.x - 12) < 0.5 && e.y <= 2.5, `(${e?.x}, ${e?.y})`);
});
caso("referencia a algo que se nombra después", () => {
  const { doc } = armar("Salón de 20x15. Mesa dulce junto a la barra. Barra a la derecha.");
  const d = de(doc, "dulce")[0];
  const b = de(doc, "barra")[0];
  cierto(d && b && Math.abs(d.x - b.x) < 5, `dulce (${d?.x}) cerca de barra (${b?.x})`);
});
caso("mover la barra que ya está", () => {
  const { doc } = armar("poné la barra a la izquierda", baseDoc());
  igual(de(doc, "barra").length, 1, "una sola barra");
  cierto(de(doc, "barra")[0].x < 4, "a la izquierda");
});
caso("mover una mesa por número", () => {
  const b = baseDoc();
  const { doc } = armar("mové la mesa 5 a la izquierda", b);
  const antes = mesas(b).find((m) => m.nombre === "Mesa 5");
  const despues = mesas(doc).find((m) => m.nombre === "Mesa 5");
  cierto(despues.x <= antes.x && despues.x < 6, `x ${antes.x} → ${despues.x}`);
});
caso("capacidad de una mesa", () => {
  const { doc } = armar("la mesa 2 es de 12", baseDoc());
  igual(mesas(doc).find((m) => m.nombre === "Mesa 2")?.capacidad, 12, "12");
});
caso("agrandar la pista", () => {
  const { doc } = armar("agrandá la pista a 8 por 10", baseDoc());
  igual([de(doc, "pista")[0].ancho, de(doc, "pista")[0].largo], [8, 10], "8x10");
});
caso("sacar algo que no hay avisa", () => {
  const { avisos } = armar("sacá la cabina de fotos", baseDoc());
  cierto(avisos.length === 1, JSON.stringify(avisos));
});
caso("volver a decir lo mismo no duplica", () => {
  const texto = "salón de 25 por 18, hay 10 mesas redondas de 10, una pista de 6x6 en el centro y una barra a la derecha";
  const primero = armar(texto).doc;
  const { doc } = armar(texto, primero);
  igual(doc.salon.elementos.length, primero.salon.elementos.length, "mismos elementos");
});

caso("alfombra de la entrada a la pista", () => {
  const { doc } = armar("salón de 24 por 18, entrada abajo al medio, pista de 6x6 en el centro, 8 mesas redondas de 10 y una alfombra roja");
  const a = de(doc, "alfombra")[0];
  const e = de(doc, "entrada")[0];
  const p = de(doc, "pista")[0];
  cierto(a && Math.abs(a.x - e.x) < 0.3, `alineada con la entrada (${a?.x} vs ${e?.x})`);
  cierto(a.y + a.largo / 2 >= e.y - 0.6 && a.y - a.largo / 2 <= p.y + p.largo / 2 + 0.6, "va de la entrada a la pista");
  igual(choques(doc.salon).filter(([x, y]) => x.tipo === "mesa" || y.tipo === "mesa").length, 0, "ninguna mesa encima");
});

console.log(`\n${total - fallas}/${total} bien${fallas ? `, ${fallas} fallas` : ""}\n`);
process.exit(fallas ? 1 : 0);
