import type { Confirmacion } from "@/lib/rsvp-comun";
import { AJUSTES_INICIALES, docVacio, type Ajustes, type Clase, type DocPanel, type Elemento, type Enlace, type Invitado, type Salon, type Tipo } from "./tipos";

/**
 * Lo que hace "inteligente" al panel, en funciones puras: cruzar las
 * confirmaciones con la lista, sentar familias, ubicar mesas en el espacio
 * libre y avisar lo que está mal antes de que se entere el salón.
 *
 * Sin estado y sin red: lo usan el servidor y el navegador por igual.
 */

/* ── Utilidades ────────────────────────────────────────────── */

/** "  José  PÉREZ " → "jose perez". Para comparar nombres escritos a mano. */
export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export const idNuevo = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

/** Id estable a partir de un nombre: la misma confirmación leída dos veces
    produce la misma fila, aunque todavía no se haya guardado. */
const idDeNombre = (n: string) => {
  let h = 0;
  for (const c of n) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  return "r" + (h >>> 0).toString(36);
};

const redondear = (n: number, paso = 0.25) => Math.round(n / paso) * paso;
const entre = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Cuántas personas se esperan de una fila: las que no vienen no cuentan. */
export const esperadas = (i: Invitado) => (i.estado === "no-viene" ? 0 : i.personas);

/* ── Confirmaciones → invitados ───────────────────────────────
   Cada confirmación que llega de la invitación se cruza con la lista por
   nombre. Si el organizador ya tenía a esa persona cargada, se actualiza su
   fila; si no, aparece una fila nueva marcada como "rsvp".

   Es idempotente: se puede correr en cada lectura sin duplicar nada. */

export function mezclarConfirmaciones(doc: DocPanel, confirmaciones: Confirmacion[]): Invitado[] {
  const invitados = doc.invitados.map((i) => ({ ...i }));
  const porAlias = new Map<string, Invitado>();
  const porToken = new Map<string, Invitado>();
  for (const i of invitados) {
    porAlias.set(norm(i.nombre), i);
    for (const a of i.alias) porAlias.set(a, i);
    if (i.enlace) porToken.set(i.enlace.token, i);
  }

  const cronologicas = [...confirmaciones].sort((a, b) => a.enviada.localeCompare(b.enviada));
  /** Filas a las que se les aplicó una confirmación nueva en esta pasada. */
  const aplicados = new Set<string>();

  for (const c of cronologicas) {
    const clave = norm(c.nombre);
    if (!clave) continue;

    // Con link personal, la fila es la del link, se llame como se llame.
    let inv = c.familia ? porToken.get(c.familia) : undefined;

    if (!inv) {
      const descartada = doc.descartes[clave];
      if (descartada && c.enviada <= descartada) continue;
      inv = porAlias.get(clave);
    }

    if (!inv) {
      inv = {
        id: idDeNombre(clave),
        nombre: c.nombre,
        grupo: "",
        personas: Math.max(1, c.acompanantes),
        estado: "pendiente",
        telefono: "",
        comidas: [],
        notas: "",
        mesa: null,
        origen: "rsvp",
        alias: [clave],
        rsvp: null,
        cancion: "",
        enlace: null,
      };
      invitados.push(inv);
      porAlias.set(clave, inv);
    }

    // Sólo manda una confirmación más nueva que la última aplicada: así una
    // corrección manual del organizador no se pisa en la próxima lectura.
    if (inv.rsvp && c.enviada <= inv.rsvp) continue;

    inv.estado = c.asiste ? "confirmado" : "no-viene";
    if (c.asiste) inv.personas = Math.max(1, c.acompanantes);
    inv.comidas = c.comidas;
    if (c.cancion) inv.cancion = c.cancion;
    inv.rsvp = c.enviada;
    if (!inv.alias.includes(clave)) inv.alias.push(clave);
    aplicados.add(inv.id);
  }

  return ubicarNuevos(invitados, doc.salon, aplicados, doc.ajustes);
}

/* ── Etiquetas de mesa ─────────────────────────────────────────
   Una mesa etiquetada "Familia Gómez" recibe a los del grupo Familia Gómez.
   Si la persona no tiene grupo (confirmó desde el link general), se prueba
   por apellido: "Juan Gómez" cae en la mesa "Familia Gómez" sólo si hay UNA
   sola mesa con ese apellido. Si hay dos, no se adivina. */

const palabras = (s: string) => norm(s).split(" ").filter((p) => p.length >= 3);

export function mesaEtiquetada(inv: Invitado, mesas: Elemento[]): Elemento | null {
  const conEtiqueta = mesas.filter((m) => m.etiquetas?.length);
  if (!conEtiqueta.length) return null;

  const g = norm(inv.grupo);
  if (g) {
    const exacta = conEtiqueta.find((m) => m.etiquetas!.some((e) => norm(e) === g));
    if (exacta) return exacta;
  }

  // Por apellido: el final del grupo ("Familia Gómez") o del nombre, si tiene
  // nombre y apellido. Un nombre suelto ("Caro") no alcanza para adivinar.
  const delNombre = palabras(inv.nombre);
  const apellido = palabras(inv.grupo).at(-1) ?? (delNombre.length >= 2 ? delNombre.at(-1) : undefined);
  if (!apellido) return null;
  const candidatas = conEtiqueta.filter((m) => m.etiquetas!.some((e) => palabras(e).includes(apellido)));
  return candidatas.length === 1 ? candidatas[0] : null;
}

/**
 * Ubica a los que acaban de confirmar, según los ajustes. Los que avisaron que
 * no vienen liberan su silla siempre: una silla reservada para alguien que no
 * va es un error, no una preferencia.
 */
export function ubicarNuevos(invitados: Invitado[], salon: Salon, ids: Set<string>, ajustes: Ajustes): Invitado[] {
  if (!ids.size) return invitados;
  const mesas = salon.elementos.filter((e) => e.tipo === "mesa");
  const libres = new Map(mesas.map((m) => [m.id, m.capacidad ?? 0]));
  for (const [id, n] of ocupacion(invitados)) libres.set(id, (libres.get(id) ?? 0) - n);

  for (const inv of invitados) {
    if (!ids.has(inv.id)) continue;
    if (inv.estado === "no-viene") {
      inv.mesa = null;
      continue;
    }
    if (inv.estado !== "confirmado" || inv.mesa || !mesas.length) continue;
    const n = inv.personas;
    let destino: string | null = null;

    if (ajustes.porEtiqueta) {
      const m = mesaEtiquetada(inv, mesas);
      if (m && (libres.get(m.id) ?? 0) >= n) destino = m.id;
    }

    if (!destino && ajustes.autoSentar) {
      // Primero donde ya está su familia; si no, la mesa sin etiqueta donde
      // quede más justo. Las mesas de otra familia, sólo si no queda otra.
      const g = norm(inv.grupo);
      const conFamilia = g ? invitados.find((o) => o.id !== inv.id && o.mesa && norm(o.grupo) === g)?.mesa : undefined;
      if (conFamilia && (libres.get(conFamilia) ?? 0) >= n) destino = conFamilia;
      else {
        // La principal es de los novios: ahí sólo entra quien esté etiquetado.
        const opciones = mesas
          .filter((m) => !m.principal && (libres.get(m.id) ?? 0) >= n)
          .sort((a, b) => Number(!!a.etiquetas?.length) - Number(!!b.etiquetas?.length) || (libres.get(a.id) ?? 0) - (libres.get(b.id) ?? 0));
        destino = opciones[0]?.id ?? null;
      }
    }

    if (destino) {
      inv.mesa = destino;
      libres.set(destino, (libres.get(destino) ?? 0) - n);
    }
  }
  return invitados;
}

/** Confirmaciones que el organizador todavía no vio, la más nueva primero. */
export const novedades = (doc: DocPanel) =>
  doc.invitados
    .filter((i) => i.rsvp && i.rsvp > doc.ajustes.vistoHasta)
    .sort((a, b) => (b.rsvp ?? "").localeCompare(a.rsvp ?? ""));

/** "Familia Gómez" → "familia-gomez-k3x9". Se lee en WhatsApp y no se adivina. */
export function tokenPara(nombre: string, usados: Set<string>) {
  const base = norm(nombre).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "invitado";
  let t = "";
  do t = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  while (usados.has(t));
  return t;
}

/** "Familia Gómez y Familia Pérez", para nombrar una mesa por sus etiquetas. */
export const nombrePorEtiquetas = (etiquetas: string[]) =>
  etiquetas.length <= 1 ? (etiquetas[0] ?? "") : `${etiquetas.slice(0, -1).join(", ")} y ${etiquetas.at(-1)}`;

/**
 * Posibles duplicados: alguien confirmó con un nombre corto ("Caro") y en la
 * lista ya había una persona cargada con el nombre completo que empieza igual.
 */
export function posiblesDuplicados(invitados: Invitado[]) {
  const pares: { rsvp: Invitado; cargado: Invitado }[] = [];
  const cargados = invitados.filter((i) => i.origen === "manual" && !i.rsvp);

  for (const r of invitados.filter((i) => i.origen === "rsvp")) {
    const [primero, ...resto] = norm(r.nombre).split(" ");
    if (!primero) continue;
    const apellido = resto.at(-1);

    const candidato = cargados.find((c) => {
      const partes = norm(c.nombre).split(" ");
      const mismoNombre = partes[0] === primero || partes[0].startsWith(primero) || primero.startsWith(partes[0]);
      return mismoNombre && (!apellido || partes.includes(apellido));
    });
    if (candidato) pares.push({ rsvp: r, cargado: candidato });
  }
  return pares;
}

/* ── Catálogo de lo que se puede poner en el salón ─────────── */

type Ficha = { tipo: Tipo; nombre: string; ancho: number; largo: number };

export const CATALOGO: Record<Clase, Ficha> = {
  redonda: { tipo: "mesa", nombre: "Mesa redonda", ancho: 1.5, largo: 1.5 },
  rectangular: { tipo: "mesa", nombre: "Mesa rectangular", ancho: 2.4, largo: 0.9 },
  imperial: { tipo: "mesa", nombre: "Mesa imperial", ancho: 6, largo: 1.2 },

  pista: { tipo: "estructura", nombre: "Pista", ancho: 6, largo: 6 },
  escenario: { tipo: "estructura", nombre: "Escenario", ancho: 5, largo: 3 },
  dj: { tipo: "estructura", nombre: "Cabina DJ", ancho: 2.5, largo: 1.5 },
  barra: { tipo: "estructura", nombre: "Barra", ancho: 4, largo: 1.2 },
  dulce: { tipo: "estructura", nombre: "Mesa dulce", ancho: 3, largo: 1 },
  columna: { tipo: "estructura", nombre: "Columna", ancho: 0.6, largo: 0.6 },
  bano: { tipo: "estructura", nombre: "Baños", ancho: 4, largo: 3 },
  cocina: { tipo: "estructura", nombre: "Cocina", ancho: 5, largo: 4 },
  entrada: { tipo: "estructura", nombre: "Entrada", ancho: 2.5, largo: 0.6 },
  // El camino de los novios. Las mesas no se ponen encima, pero se camina.
  alfombra: { tipo: "estructura", nombre: "Alfombra", ancho: 1.4, largo: 8 },
  estructura: { tipo: "estructura", nombre: "Estructura", ancho: 2, largo: 2 },

  exterior: { tipo: "zona", nombre: "Jardín", ancho: 10, largo: 8 },
  galeria: { tipo: "zona", nombre: "Galería", ancho: 10, largo: 3 },
};

export const CLASES_MESA: Clase[] = ["redonda", "rectangular", "imperial"];
export const CLASES_ESTRUCTURA: Clase[] = ["pista", "escenario", "dj", "barra", "dulce", "alfombra", "entrada", "columna", "bano", "cocina", "estructura"];
export const CLASES_ZONA: Clase[] = ["exterior", "galeria"];

/**
 * Sillas que entran en una mesa. Redonda: una persona cada 47 cm de
 * perímetro (1,50 m → 10). Rectangular: una cada 60 cm por lado largo, más
 * las cabeceras si la mesa es lo bastante ancha.
 */
export function capacidadSugerida(clase: Clase, ancho: number, largo: number) {
  if (clase === "redonda") return Math.max(2, Math.floor((Math.PI * ancho) / 0.47));
  const largoMayor = Math.max(ancho, largo);
  const anchoMenor = Math.min(ancho, largo);
  return 2 * Math.floor(largoMayor / 0.6) + (anchoMenor >= 0.8 ? 2 : 0);
}

/* ── Geometría ───────────────────────────────────────────────── */

export type Caja = { x0: number; y0: number; x1: number; y1: number };

/** Medidas efectivas, con el giro aplicado. */
export const medidas = (e: Elemento) =>
  e.giro === 90 ? { w: e.largo, h: e.ancho } : { w: e.ancho, h: e.largo };

export function caja(e: Elemento, margen = 0): Caja {
  const { w, h } = medidas(e);
  return { x0: e.x - w / 2 - margen, y0: e.y - h / 2 - margen, x1: e.x + w / 2 + margen, y1: e.y + h / 2 + margen };
}

/** Lo que ocupa una mesa con la gente sentada: 55 cm de silla alrededor. */
export const SILLA = 0.55;
export const huella = (e: Elemento) => caja(e, e.tipo === "mesa" ? SILLA : 0);

export const tocan = (a: Caja, b: Caja) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

export const area = (e: Elemento) =>
  e.clase === "redonda" ? Math.PI * (e.ancho / 2) ** 2 : e.ancho * e.largo;

/** Pares de elementos que se pisan. Las zonas no cuentan: son áreas, no cosas. */
export function choques(salon: Salon) {
  const solidos = salon.elementos.filter((e) => e.tipo !== "zona");
  const pares: [Elemento, Elemento][] = [];
  for (let i = 0; i < solidos.length; i++) {
    for (let j = i + 1; j < solidos.length; j++) {
      if (tocan(huella(solidos[i]), huella(solidos[j]))) pares.push([solidos[i], solidos[j]]);
    }
  }
  return pares;
}

/** Deja al elemento adentro del plano. */
export function encerrar(e: Elemento, salon: Salon): Elemento {
  const { w, h } = medidas(e);
  return {
    ...e,
    x: entre(redondear(e.x), w / 2, Math.max(w / 2, salon.ancho - w / 2)),
    y: entre(redondear(e.y), h / 2, Math.max(h / 2, salon.largo - h / 2)),
  };
}

/* ── Crear y ubicar ──────────────────────────────────────────── */

export const siguienteNumero = (salon: Salon) =>
  salon.elementos.filter((e) => e.tipo === "mesa").reduce((m, e) => Math.max(m, Number(e.nombre.match(/\d+/)?.[0] ?? 0)), 0) + 1;

export function nuevoElemento(clase: Clase, salon: Salon): Elemento {
  const f = CATALOGO[clase];
  const base: Elemento = {
    id: idNuevo(),
    tipo: f.tipo,
    clase,
    nombre: f.tipo === "mesa" ? `Mesa ${siguienteNumero(salon)}` : f.nombre,
    x: salon.ancho / 2,
    y: salon.largo / 2,
    ancho: f.ancho,
    largo: f.largo,
    giro: 0,
    ...(f.tipo === "mesa" ? { capacidad: capacidadSugerida(clase, f.ancho, f.largo) } : {}),
  };
  return ubicarLibre(base, salon) ?? encerrar(base, salon);
}

/**
 * El primer lugar libre para un elemento, barriendo el plano de arriba hacia
 * abajo. Las mesas esquivan estructuras, otras mesas y el exterior (una mesa
 * afuera se pone a mano, a propósito). Devuelve null si no entra.
 */
export function ubicarLibre(e: Elemento, salon: Salon, pasillo = 0.9): Elemento | null {
  if (e.tipo === "zona") return encerrar(e, salon);

  const otros = salon.elementos.filter((o) => o.id !== e.id);
  const obstaculos = otros
    .filter((o) => o.tipo !== "zona" || (e.tipo === "mesa" && o.clase === "exterior"))
    .map((o) => (o.tipo === "zona" ? caja(o) : huella(o)));

  const h = huella(e);
  const mw = h.x1 - h.x0;
  const mh = h.y1 - h.y0;
  const paso = 0.25;

  for (let y = mh / 2 + 0.5; y <= salon.largo - mh / 2 - 0.5 + 1e-6; y += paso) {
    for (let x = mw / 2 + 0.5; x <= salon.ancho - mw / 2 - 0.5 + 1e-6; x += paso) {
      const prueba = { x0: x - mw / 2 - pasillo / 2, y0: y - mh / 2 - pasillo / 2, x1: x + mw / 2 + pasillo / 2, y1: y + mh / 2 + pasillo / 2 };
      if (!obstaculos.some((o) => tocan(prueba, o))) return { ...e, x: redondear(x), y: redondear(y) };
    }
  }
  return null;
}

/** Agrega `cantidad` mesas en el espacio libre. Devuelve el salón nuevo y
    cuántas entraron de verdad. */
export function distribuirMesas(salon: Salon, cantidad: number, clase: Clase = "redonda") {
  let actual = salon;
  let puestas = 0;
  for (let n = 0; n < cantidad; n++) {
    const f = CATALOGO[clase];
    const e: Elemento = {
      id: idNuevo(),
      tipo: "mesa",
      clase,
      nombre: `Mesa ${siguienteNumero(actual)}`,
      x: 0,
      y: 0,
      ancho: f.ancho,
      largo: f.largo,
      giro: 0,
      capacidad: capacidadSugerida(clase, f.ancho, f.largo),
    };
    const ubicado = ubicarLibre(e, actual);
    if (!ubicado) break;
    actual = { ...actual, elementos: [...actual.elementos, ubicado] };
    puestas++;
  }
  return { salon: actual, puestas };
}

/* ── Sentar ──────────────────────────────────────────────────────
   Las familias se sientan juntas. Se ordenan de más grande a más chica y cada
   una va a la mesa donde queda más justa (best fit): así las mesas se llenan
   parejas y no quedan huecos de 1 que después no sirven a nadie.

   Si una familia no entra entera en ninguna mesa, se reparte fila por fila
   empezando por la mesa más vacía, y queda avisado. */

export function ocupacion(invitados: Invitado[]) {
  const porMesa = new Map<string, number>();
  for (const i of invitados) if (i.mesa) porMesa.set(i.mesa, (porMesa.get(i.mesa) ?? 0) + esperadas(i));
  return porMesa;
}

export function sentar(invitados: Invitado[], salon: Salon, rehacer = false, porEtiqueta = true) {
  const mesas = salon.elementos.filter((e) => e.tipo === "mesa");
  const idsMesa = new Set(mesas.map((m) => m.id));

  const resultado = invitados.map((i) => ({
    ...i,
    mesa: i.estado === "no-viene" ? null : rehacer || !i.mesa || !idsMesa.has(i.mesa) ? null : i.mesa,
  }));

  const libres = new Map(mesas.map((m) => [m.id, m.capacidad ?? 0]));
  for (const [id, n] of ocupacion(resultado)) libres.set(id, (libres.get(id) ?? 0) - n);

  // Los grupos a sentar. Sin grupo, cada fila es su propio grupo.
  const grupos = new Map<string, typeof resultado>();
  for (const i of resultado) {
    if (i.mesa || esperadas(i) === 0) continue;
    const clave = i.grupo.trim() ? "g:" + norm(i.grupo) : "i:" + i.id;
    grupos.set(clave, [...(grupos.get(clave) ?? []), i]);
  }

  const orden = [...grupos.values()].sort(
    (a, b) => b.reduce((t, i) => t + esperadas(i), 0) - a.reduce((t, i) => t + esperadas(i), 0),
  );

  let partidos = 0;
  let sinLugar = 0;

  for (const grupo of orden) {
    const total = grupo.reduce((t, i) => t + esperadas(i), 0);

    // Si parte del grupo ya está sentada, se intenta primero esa mesa.
    const yaSentado = resultado.find((r) => r.mesa && grupo[0].grupo.trim() && norm(r.grupo) === norm(grupo[0].grupo))?.mesa;

    let destino: string | null = null;
    const etiquetada = porEtiqueta ? mesaEtiquetada(grupo[0], mesas) : null;

    if (etiquetada && (libres.get(etiquetada.id) ?? 0) >= total) destino = etiquetada.id;
    else if (yaSentado && (libres.get(yaSentado) ?? 0) >= total) destino = yaSentado;
    else {
      // Best fit, pero las mesas etiquetadas para otra familia van al final.
      const conEtiqueta = new Set(mesas.filter((m) => m.etiquetas?.length).map((m) => m.id));
      const principal = new Set(mesas.filter((m) => m.principal).map((m) => m.id));
      destino =
        [...libres.entries()]
          .filter(([id, l]) => l >= total && !principal.has(id))
          .sort((a, b) => Number(conEtiqueta.has(a[0])) - Number(conEtiqueta.has(b[0])) || a[1] - b[1])[0]?.[0] ?? null;
    }

    if (destino) {
      for (const i of grupo) i.mesa = destino;
      libres.set(destino, (libres.get(destino) ?? 0) - total);
      continue;
    }

    // No entra entero: fila por fila, a la mesa más vacía donde quepa.
    partidos++;
    for (const i of [...grupo].sort((a, b) => esperadas(b) - esperadas(a))) {
      const n = esperadas(i);
      const opcion = [...libres.entries()].filter(([id, l]) => l >= n && !mesas.find((m) => m.id === id)?.principal).sort((a, b) => b[1] - a[1])[0];
      if (!opcion) {
        sinLugar += n;
        continue;
      }
      i.mesa = opcion[0];
      libres.set(opcion[0], opcion[1] - n);
    }
  }

  return { invitados: resultado, partidos, sinLugar };
}

/* ── Números y avisos ────────────────────────────────────────── */

export function metricas(doc: DocPanel) {
  const { invitados, salon } = doc;
  const mesas = salon.elementos.filter((e) => e.tipo === "mesa");
  const estructuras = salon.elementos.filter((e) => e.tipo === "estructura");
  const zonas = salon.elementos.filter((e) => e.tipo === "zona");

  const sumar = (f: (i: Invitado) => boolean) => invitados.filter(f).reduce((t, i) => t + i.personas, 0);

  const comidas = new Map<string, number>();
  for (const i of invitados) {
    if (i.estado !== "confirmado") continue;
    for (const c of i.comidas) if (c !== "Sin restricciones") comidas.set(c, (comidas.get(c) ?? 0) + 1);
  }

  const areaTotal = salon.ancho * salon.largo;
  const areaExterior = zonas.filter((z) => z.clase === "exterior").reduce((t, z) => t + area(z), 0);
  // La alfombra se camina: no cuenta como superficie ocupada.
  const areaEstructuras = estructuras.filter((e) => e.clase !== "alfombra").reduce((t, e) => t + area(e), 0);
  const areaMesas = mesas.reduce((t, m) => {
    const h = huella(m);
    return t + (h.x1 - h.x0) * (h.y1 - h.y0);
  }, 0);

  return {
    filas: invitados.length,
    confirmados: sumar((i) => i.estado === "confirmado"),
    pendientes: sumar((i) => i.estado === "pendiente"),
    noVienen: sumar((i) => i.estado === "no-viene"),
    esperados: invitados.reduce((t, i) => t + esperadas(i), 0),
    sentados: invitados.filter((i) => i.mesa).reduce((t, i) => t + esperadas(i), 0),
    grupos: new Set(invitados.map((i) => norm(i.grupo)).filter(Boolean)).size,
    mesas: mesas.length,
    lugares: mesas.reduce((t, m) => t + (m.capacidad ?? 0), 0),
    comidas: [...comidas.entries()].sort((a, b) => b[1] - a[1]),
    areaTotal,
    areaInterior: areaTotal - areaExterior,
    areaExterior,
    areaEstructuras,
    areaMesas,
    areaLibre: Math.max(0, areaTotal - areaExterior - areaEstructuras - areaMesas),
    pista: estructuras.filter((e) => e.clase === "pista").reduce((t, e) => t + area(e), 0),
  };
}

export type Aviso = { nivel: "alerta" | "consejo"; texto: string };

const m2 = (n: number) => `${Math.round(n)} m²`;

/**
 * Los avisos del panel. Reglas del oficio de salones, no adornos:
 * - Cena sentada con pista: 1,3 m² por persona como mínimo en el interior.
 * - Pista: 0,28 m² por invitado (la mitad baila, 0,55 m² cada uno).
 * - Mesa redonda de 1,50 m: 10 personas.
 */
export function avisos(doc: DocPanel, plan: "basico" | "completo"): Aviso[] {
  const m = metricas(doc);
  const lista: Aviso[] = [];

  if (m.pendientes > 0 && m.filas > 0) {
    lista.push({
      nivel: "consejo",
      texto: `${m.pendientes} ${m.pendientes === 1 ? "persona no respondió" : "personas no respondieron"} todavía. Filtrá por "Sin respuesta" y mandales el recordatorio por WhatsApp.`,
    });
  }

  const dup = posiblesDuplicados(doc.invitados);
  if (dup.length) {
    lista.push({
      nivel: "alerta",
      texto: `"${dup[0].rsvp.nombre}" confirmó y en tu lista está "${dup[0].cargado.nombre}". Si es la misma persona, uní las filas desde la lista.${dup.length > 1 ? ` Hay ${dup.length - 1} caso${dup.length > 2 ? "s" : ""} más.` : ""}`,
    });
  }

  if (plan === "basico") return lista;

  if (m.mesas === 0 && m.esperados > 0) {
    lista.push({ nivel: "consejo", texto: `Para ${m.esperados} personas necesitás unas ${Math.ceil(m.esperados / 10)} mesas redondas de 10. Las podés ubicar solas desde Salón.` });
  } else if (m.lugares < m.esperados) {
    const faltan = m.esperados - m.lugares;
    lista.push({ nivel: "alerta", texto: `Faltan ${faltan} lugares: sumá ${Math.ceil(faltan / 10)} ${Math.ceil(faltan / 10) === 1 ? "mesa" : "mesas"} de 10.` });
  }

  const sinSentar = m.esperados - m.sentados;
  if (m.mesas > 0 && sinSentar > 0) {
    lista.push({ nivel: "consejo", texto: `${sinSentar} ${sinSentar === 1 ? "persona" : "personas"} sin mesa. "Sentar solos" los ubica respetando las familias.` });
  }

  const ocup = ocupacion(doc.invitados);
  for (const mesa of doc.salon.elementos.filter((e) => e.tipo === "mesa")) {
    const n = ocup.get(mesa.id) ?? 0;
    if (n > (mesa.capacidad ?? 0)) lista.push({ nivel: "alerta", texto: `${mesa.nombre} tiene ${n} personas y ${mesa.capacidad} sillas.` });
  }

  // Familias partidas en más de una mesa.
  const mesasDeGrupo = new Map<string, Set<string>>();
  for (const i of doc.invitados) {
    if (!i.mesa || !i.grupo.trim()) continue;
    const g = i.grupo.trim();
    mesasDeGrupo.set(g, (mesasDeGrupo.get(g) ?? new Set()).add(i.mesa));
  }
  for (const [g, set] of mesasDeGrupo) {
    if (set.size > 1) lista.push({ nivel: "consejo", texto: `${g} quedó repartida en ${set.size} mesas.` });
  }

  for (const [a, b] of choques(doc.salon).slice(0, 3)) {
    lista.push({ nivel: "alerta", texto: `${a.nombre} y ${b.nombre} se pisan: no queda lugar para las sillas.` });
  }

  if (m.esperados > 0) {
    const pistaIdeal = m.esperados * 0.28;
    const tienePista = doc.salon.elementos.some((e) => e.clase === "pista");
    if (!tienePista && doc.salon.elementos.length > 0) {
      lista.push({ nivel: "consejo", texto: `No hay pista en el plano. Para ${m.esperados} personas conviene una de ${m2(pistaIdeal)} (unos ${Math.ceil(Math.sqrt(pistaIdeal))} × ${Math.ceil(Math.sqrt(pistaIdeal))} m).` });
    } else if (tienePista && m.pista < pistaIdeal * 0.8) {
      lista.push({ nivel: "consejo", texto: `La pista tiene ${m2(m.pista)}; para ${m.esperados} personas lo cómodo son ${m2(pistaIdeal)}.` });
    }

    const porPersona = m.areaInterior / m.esperados;
    if (porPersona < 1.3) {
      lista.push({ nivel: "alerta", texto: `Quedan ${porPersona.toFixed(1).replace(".", ",")} m² por persona adentro. Con cena y pista, lo mínimo es 1,3: el salón queda chico.` });
    }
  }

  return lista;
}

/* ── Validación de lo que llega al servidor ──────────────────────
   Todo lo que manda el navegador se revisa acá: tipos, largos y topes. Un
   documento mal formado no puede romper el panel de nadie. */

const txt = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown, min: number, max: number, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
const color = (v: unknown, def: string) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : def);

const TIPOS: Tipo[] = ["mesa", "estructura", "zona"];

export function sanearDoc(bruto: unknown, previo: DocPanel): DocPanel | null {
  if (typeof bruto !== "object" || bruto === null) return null;
  const d = bruto as Record<string, unknown>;
  const s = (d.salon ?? {}) as Record<string, unknown>;
  const t = (d.tema ?? {}) as Record<string, unknown>;

  const salon: Salon = {
    ancho: num(s.ancho, 4, 200, 24),
    largo: num(s.largo, 4, 200, 16),
    elementos: (Array.isArray(s.elementos) ? s.elementos : []).slice(0, 400).flatMap((x): Elemento[] => {
      const e = x as Record<string, unknown>;
      const clase = e.clase as Clase;
      if (!(clase in CATALOGO)) return [];
      const tipo = CATALOGO[clase].tipo;
      if (!TIPOS.includes(e.tipo as Tipo) || e.tipo !== tipo) return [];
      return [
        {
          id: txt(e.id, 24) || idNuevo(),
          tipo,
          clase,
          nombre: txt(e.nombre, 40),
          x: num(e.x, -50, 250, 0),
          y: num(e.y, -50, 250, 0),
          ancho: num(e.ancho, 0.3, 200, 1),
          largo: num(e.largo, 0.3, 200, 1),
          giro: e.giro === 90 ? 90 : 0,
          ...(tipo === "mesa"
            ? {
                capacidad: Math.round(num(e.capacidad, 1, 60, 10)),
                etiquetas: (Array.isArray(e.etiquetas) ? e.etiquetas : []).slice(0, 8).map((x) => txt(x, 60).trim()).filter(Boolean),
                principal: e.principal === true,
              }
            : {}),
        },
      ];
    }),
  };

  const idsMesa = new Set(salon.elementos.filter((e) => e.tipo === "mesa").map((e) => e.id));

  const tokens = new Set<string>();
  const enlace = (v: unknown): Enlace | null => {
    if (typeof v !== "object" || v === null) return null;
    const e = v as Record<string, unknown>;
    const token = txt(e.token, 48);
    if (!/^[a-z0-9-]{3,48}$/.test(token) || tokens.has(token)) return null;
    tokens.add(token);
    return { token, saludo: txt(e.saludo, 80), nota: txt(e.nota, 200), cupo: Math.round(num(e.cupo, 1, 30, 1)) };
  };

  const invitados: Invitado[] = (Array.isArray(d.invitados) ? d.invitados : []).slice(0, 3000).flatMap((x): Invitado[] => {
    const i = x as Record<string, unknown>;
    const nombre = txt(i.nombre, 80).trim();
    if (!nombre) return [];
    const estado = i.estado === "confirmado" || i.estado === "no-viene" ? i.estado : "pendiente";
    const mesa = typeof i.mesa === "string" && idsMesa.has(i.mesa) ? i.mesa : null;
    return [
      {
        id: txt(i.id, 24) || idNuevo(),
        nombre,
        grupo: txt(i.grupo, 60),
        personas: Math.round(num(i.personas, 1, 30, 1)),
        estado,
        telefono: txt(i.telefono, 30),
        comidas: (Array.isArray(i.comidas) ? i.comidas : []).slice(0, 8).map((c) => txt(c, 40)).filter(Boolean),
        notas: txt(i.notas, 300),
        mesa,
        origen: i.origen === "rsvp" ? "rsvp" : "manual",
        alias: (Array.isArray(i.alias) ? i.alias : []).slice(0, 10).map((a) => txt(a, 80)).filter(Boolean),
        rsvp: typeof i.rsvp === "string" && !Number.isNaN(Date.parse(i.rsvp)) ? i.rsvp : null,
        cancion: txt(i.cancion, 120),
        enlace: enlace(i.enlace),
      },
    ];
  });

  const a = (d.ajustes ?? {}) as Record<string, unknown>;
  const ajustes: Ajustes = {
    autoSentar: typeof a.autoSentar === "boolean" ? a.autoSentar : AJUSTES_INICIALES.autoSentar,
    porEtiqueta: typeof a.porEtiqueta === "boolean" ? a.porEtiqueta : AJUSTES_INICIALES.porEtiqueta,
    cerrado: a.cerrado === true,
    vistoHasta: typeof a.vistoHasta === "string" && !Number.isNaN(Date.parse(a.vistoHasta)) ? a.vistoHasta : AJUSTES_INICIALES.vistoHasta,
    limite: typeof a.limite === "string" && /^\d{4}-\d{2}-\d{2}$/.test(a.limite) ? a.limite : "",
  };

  const descartes: Record<string, string> = {};
  if (typeof d.descartes === "object" && d.descartes !== null) {
    for (const [k, v] of Object.entries(d.descartes).slice(0, 2000)) {
      if (typeof v === "string" && !Number.isNaN(Date.parse(v))) descartes[k.slice(0, 80)] = v;
    }
  }

  return {
    version: previo.version,
    actualizado: previo.actualizado,
    invitados,
    salon,
    tema: {
      acento: color(t.acento, previo.tema.acento),
      base: t.base === "blanco" || t.base === "noche" ? t.base : "papel",
      // "plex" era la tercera letra antes de pasar todo a Montserrat.
      fuente: t.fuente === "cormorant" ? "cormorant" : t.fuente === "montserrat" || t.fuente === "plex" ? "montserrat" : "instrument",
    },
    ajustes,
    descartes,
  };
}

/** Un documento leído de la base, llevado a la forma actual. Los paneles
    guardados antes de que existiera un campo lo reciben con su valor inicial. */
export function normalizar(bruto: unknown, acento: string): DocPanel {
  const vacio = docVacio(acento);
  const d = (bruto ?? {}) as Partial<DocPanel>;
  const previo = { ...vacio, version: Number(d.version) || 0, actualizado: String(d.actualizado ?? vacio.actualizado), tema: { ...vacio.tema, ...(d.tema ?? {}) } };
  return sanearDoc(bruto, previo) ?? previo;
}
