import { CATALOGO, capacidadSugerida, caja, esperadas, huella, idNuevo, medidas, norm, siguienteNumero, tocan, type Caja } from "../logica";
import type { Clase, DocPanel, Elemento, Salon } from "../tipos";
import type { Accion, Objetivo, Posicion, Ref } from "./interpretar";

/**
 * Convierte las acciones del intérprete en un plano. Es puro: recibe el
 * documento y devuelve uno nuevo, así el panel puede mostrar la vista previa
 * antes de aplicar y el cambio entero es un solo paso de "deshacer".
 *
 * Cómo ubica las cosas: cada posición ("al fondo", "centrada", "frente a la
 * pista") se traduce a un punto objetivo, y el elemento va al lugar libre más
 * cercano a ese punto, respetando pasillos de 90 cm entre mesas. Las mesas en
 * grupo se ubican en una grilla alineada alrededor de la pista (o del centro),
 * que es como se ve un salón armado de verdad.
 */

export type Resultado = { doc: DocPanel; hechos: string[]; avisos: string[] };

const MESAS: Clase[] = ["redonda", "rectangular", "imperial"];
const PASILLO = 0.9;
const r1 = (n: number) => Math.round(n * 100) / 100;
const fm = (n: number) => String(r1(n)).replace(".", ",");
const snap = (n: number, p = 0.25) => Math.round(n / p) * p;

/* ── Medidas a partir de la capacidad ──────────────────────── */

/** 10 personas → 1,50 m; 12 → 1,80 m; 8 → 1,20 m. */
const diametroPara = (cap: number) => Math.max(0.9, Math.ceil(((cap * 0.47) / Math.PI) * 10) / 10);

/** Largo de una mesa rectangular o imperial para `cap` personas con cabeceras. */
const largoPara = (cap: number) => Math.max(1.2, Math.ceil((cap - 2) / 2) * 0.6 + 0.05);

function dimensionar(e: Elemento, cap?: number): Elemento {
  if (e.tipo !== "mesa") return e;
  if (cap) {
    if (e.clase === "redonda" && capacidadSugerida("redonda", e.ancho, e.ancho) < cap) e.ancho = e.largo = diametroPara(cap);
    if (e.clase !== "redonda" && capacidadSugerida(e.clase, e.ancho, e.largo) < cap) e.ancho = r1(largoPara(cap));
    e.capacidad = cap;
  } else e.capacidad = capacidadSugerida(e.clase, e.ancho, e.largo);
  return e;
}

/* ── Buscar lugar ──────────────────────────────────────────── */

type Opciones = { pasillo: number; permitirExterior: boolean };

function obstaculos(salon: Salon, e: Elemento, o: Opciones): Caja[] {
  return salon.elementos
    .filter((x) => x.id !== e.id && (x.tipo !== "zona" || (e.tipo === "mesa" && x.clase === "exterior" && !o.permitirExterior)))
    .map((x) => (x.tipo === "zona" ? caja(x) : huella(x)));
}

function libre(e: Elemento, x: number, y: number, obs: Caja[], o: Opciones) {
  const h = huella({ ...e, x, y });
  const m = o.pasillo / 2;
  const prueba = { x0: h.x0 - m, y0: h.y0 - m, x1: h.x1 + m, y1: h.y1 + m };
  return !obs.some((c) => tocan(prueba, c));
}

/** El lugar libre más cercano al punto objetivo, en una grilla de 25 cm. */
function lugarCercano(salon: Salon, e: Elemento, tx: number, ty: number, o: Opciones): Elemento | null {
  const h = huella(e);
  const w = h.x1 - h.x0;
  const hh = h.y1 - h.y0;
  // Las posiciones se prueban ya sobre la grilla, redondeando hacia adentro:
  // redondear al final podía dejar una barra 10 cm afuera de la pared.
  const adentro = (n: number, p: number) => Math.ceil(n / p - 1e-9) * p;
  if (e.tipo === "zona") {
    return { ...e, x: clamp(snap(tx), adentro(w / 2, 0.25), salon.ancho - adentro(w / 2, 0.25)), y: clamp(snap(ty), adentro(hh / 2, 0.25), salon.largo - adentro(hh / 2, 0.25)) };
  }

  const obs = obstaculos(salon, e, o);
  const paso = salon.ancho * salon.largo > 1500 ? 0.5 : 0.25;
  let mejor: { x: number; y: number; d: number } | null = null;

  for (let y = adentro(hh / 2, paso); y <= salon.largo - hh / 2 + 1e-6; y += paso) {
    for (let x = adentro(w / 2, paso); x <= salon.ancho - w / 2 + 1e-6; x += paso) {
      const d = (x - tx) ** 2 + (y - ty) ** 2;
      if (mejor && d >= mejor.d) continue;
      if (libre(e, x, y, obs, o)) mejor = { x, y, d };
    }
  }
  return mejor ? { ...e, x: r1(mejor.x), y: r1(mejor.y) } : null;
}

const clamp = (n: number, a: number, b: number) => Math.min(Math.max(a, b), Math.max(a, n));

/* ── Posición → punto objetivo ─────────────────────────────── */

function buscarObjetivo(salon: Salon, o: Objetivo) {
  return o === "principal"
    ? salon.elementos.find((e) => e.tipo === "mesa" && e.principal)
    : salon.elementos.find((e) => e.clase === o);
}

/** Pegado a la pared: mesas con un margen para las sillas, estructuras contra el muro. */
function margenPared(e: Elemento) {
  return e.tipo === "mesa" ? 0.5 : e.clase === "columna" ? 1 : 0;
}

function puntoPara(salon: Salon, e: Elemento, pos: Posicion | undefined, i: number): { x: number; y: number } {
  const h = huella(e);
  const w = h.x1 - h.x0;
  const hh = h.y1 - h.y0;
  const m = margenPared(e);
  const X = { izquierda: w / 2 + m, centro: salon.ancho / 2, derecha: salon.ancho - w / 2 - m };
  const Y = { fondo: hh / 2 + m, centro: salon.largo / 2, entrada: salon.largo - hh / 2 - m };

  if (pos?.esquinas) {
    const esquinas = [
      [X.izquierda, Y.fondo],
      [X.derecha, Y.fondo],
      [X.izquierda, Y.entrada],
      [X.derecha, Y.entrada],
    ];
    const [x, y] = esquinas[i % 4];
    return { x, y };
  }

  if (pos?.rel) {
    const o = buscarObjetivo(salon, pos.rel.objetivo);
    if (o) {
      const c = o.tipo === "zona" ? caja(o) : huella(o);
      const cx = (c.x0 + c.x1) / 2;
      const cy = (c.y0 + c.y1) / 2;
      if (pos.rel.modo === "dentro" || pos.rel.modo === "alrededor") return { x: cx, y: cy };

      // "Frente a" algo es del lado que mira al salón. Si está en el medio
      // (la pista, casi siempre), frente es hacia el fondo: ahí va la
      // principal, mirando a la pista con la entrada a la espalda del salón.
      let dx = salon.ancho / 2 - cx;
      let dy = salon.largo / 2 - cy;
      if (Math.hypot(dx, dy) < 1.5) {
        dx = 0;
        dy = -1;
      }
      if (pos.rel.modo === "detras") {
        dx = -dx;
        dy = -dy;
      }
      if (pos.rel.modo === "junto") {
        // "al lado de la entrada, a la derecha": manda el lado pedido.
        dx = pos.h === "derecha" ? 1 : pos.h === "izquierda" ? -1 : cx < salon.ancho / 2 ? 1 : -1;
        dy = 0;
      }
      const gap = 1.2;
      if (Math.abs(dx) > Math.abs(dy)) {
        const s = Math.sign(dx);
        return { x: cx + s * ((c.x1 - c.x0) / 2 + gap + w / 2), y: cy };
      }
      const s = Math.sign(dy) || -1;
      return { x: cx, y: cy + s * ((c.y1 - c.y0) / 2 + gap + hh / 2) };
    }
  }

  // Referencia a algo que no está en el plano: se usa dónde suele estar.
  if (pos?.rel && !buscarObjetivo(salon, pos.rel.objetivo)) {
    const tipico: Partial<Record<Objetivo, Posicion>> = { entrada: { v: "entrada" }, escenario: { v: "fondo" }, dj: { v: "fondo" }, cocina: { v: "fondo" } };
    const t = tipico[pos.rel.objetivo];
    if (t) pos = { h: pos.h, v: pos.v ?? t.v };
  }

  if (pos && (pos.h || pos.v)) return { x: X[pos.h ?? "centro"], y: Y[pos.v ?? "centro"] };

  return puntoPorDefecto(salon, e, X, Y);
}

/** Donde va cada cosa si no se dice: lo que haría un organizador de eventos. */
function puntoPorDefecto(salon: Salon, e: Elemento, X: Record<string, number>, Y: Record<string, number>) {
  const pista = salon.elementos.find((x) => x.clase === "pista");
  switch (e.clase) {
    case "pista":
    case "columna":
      return { x: X.centro, y: Y.centro };
    case "escenario":
    case "dj":
      return { x: X.centro, y: Y.fondo };
    case "barra":
      return { x: X.derecha, y: Y.centro };
    case "dulce":
    case "estructura":
      return { x: X.izquierda, y: Y.centro };
    case "bano":
      return { x: X.derecha, y: Y.entrada };
    case "cocina":
      return { x: X.derecha, y: Y.fondo };
    case "entrada":
      return { x: X.centro, y: Y.entrada };
    case "alfombra": {
      // Desde la entrada hacia la principal (o la pista): el camino de los novios.
      const entrada = salon.elementos.find((x) => x.clase === "entrada");
      const x = entrada?.x ?? X.centro;
      const arriba = salon.elementos.find((m) => m.principal) ?? pista;
      const desde = entrada ? entrada.y - medidas(entrada).h / 2 : salon.largo;
      const hasta = arriba ? huella(arriba).y1 + 0.3 : salon.largo * 0.35;
      return { x, y: (desde + hasta) / 2 };
    }
    case "exterior":
      return { x: X.derecha, y: Y.centro };
    case "galeria":
      return { x: X.centro, y: Y.entrada };
  }
  if (e.principal) {
    if (pista) return puntoPara(salon, e, { rel: { modo: "frente", objetivo: "pista" } }, 0);
    return { x: X.centro, y: Y.fondo };
  }
  return pista ? { x: pista.x, y: pista.y } : { x: X.centro, y: Y.centro };
}

/** Una barra o un escenario contra una pared lateral va a lo largo de la pared. */
function girarContraPared(e: Elemento, pos: Posicion | undefined) {
  if (e.tipo !== "estructura" || e.ancho <= e.largo) return e;
  const lateral = pos ? (pos.h === "izquierda" || pos.h === "derecha") && (!pos.v || pos.v === "centro") && !pos.rel : e.clase === "barra" || e.clase === "dulce";
  return lateral ? { ...e, giro: 90 as const } : e;
}

/* ── Mesas en grupo ────────────────────────────────────────────
   Primero una grilla alineada con el foco, con el paso justo de una mesa
   más su pasillo: quedan filas prolijas. Lo que no entra ahí va al lugar
   libre más cercano. */

function ubicarGrupo(salon: Salon, plantilla: Elemento, n: number, fx: number, fy: number, o: Opciones) {
  const h = huella(plantilla);
  const pw = h.x1 - h.x0 + o.pasillo;
  const ph = h.y1 - h.y0 + o.pasillo;
  const w = h.x1 - h.x0;
  const hh = h.y1 - h.y0;

  const puntos: { x: number; y: number; d: number }[] = [];
  const kx = Math.ceil(salon.ancho / pw) + 1;
  const ky = Math.ceil(salon.largo / ph) + 1;
  for (let j = -ky; j <= ky; j++) {
    for (let k = -kx; k <= kx; k++) {
      const x = fx + k * pw;
      const y = fy + j * ph;
      if (x < w / 2 || x > salon.ancho - w / 2 || y < hh / 2 || y > salon.largo - hh / 2) continue;
      puntos.push({ x, y, d: (x - fx) ** 2 + ((y - fy) * 1.05) ** 2 });
    }
  }
  puntos.sort((a, b) => a.d - b.d || a.y - b.y || a.x - b.x);

  let actual = salon;
  const puestas: Elemento[] = [];
  for (const p of puntos) {
    if (puestas.length >= n) break;
    const e = { ...plantilla, id: idNuevo(), nombre: `Mesa ${siguienteNumero(actual)}`, x: r1(p.x), y: r1(p.y) };
    if (!libre(e, e.x, e.y, obstaculos(actual, e, o), o)) continue;
    puestas.push(e);
    actual = { ...actual, elementos: [...actual.elementos, e] };
  }
  while (puestas.length < n) {
    const base = { ...plantilla, id: idNuevo(), nombre: `Mesa ${siguienteNumero(actual)}` };
    const e = lugarCercano(actual, base, fx, fy, o);
    if (!e) break;
    puestas.push(e);
    actual = { ...actual, elementos: [...actual.elementos, e] };
  }
  return { salon: actual, puestas };
}

/* ── Referencias ("la barra", "la mesa 3", "las mesas") ───────── */

function resolver(salon: Salon, ref: Ref): Elemento[] {
  const els = salon.elementos;
  if (ref.principal) return els.filter((e) => e.tipo === "mesa" && e.principal);
  if (ref.clase === "mesa") {
    const mesas = els.filter((e) => e.tipo === "mesa");
    if (ref.numero !== undefined) {
      const re = new RegExp(`(^|\\D)${ref.numero}(\\D|$)`);
      return mesas.filter((m) => re.test(m.nombre)).slice(0, 1);
    }
    return ref.todas ? mesas.filter((m) => !m.principal) : mesas.filter((m) => !m.principal).slice(-1);
  }
  const deClase = els.filter((e) => e.clase === ref.clase);
  return ref.todas ? deClase : deClase.slice(0, 1);
}

const ARTICULO: Partial<Record<Clase, string>> = { escenario: "el", exterior: "el", bano: "los", estructura: "el", dj: "la" };
const articulo = (c: Clase) => ARTICULO[c] ?? "la";
const contraer = (s: string) => s.replace(/\bde el\b/g, "del").replace(/\ba el\b/g, "al");
const nombreDe = (e: Elemento) => (e.tipo === "mesa" ? e.nombre : `${articulo(e.clase)} ${e.nombre.toLowerCase()}`);

const PLURAL: Partial<Record<Clase, string>> = { redonda: "redondas", rectangular: "rectangulares", imperial: "imperiales" };

function describirPos(pos?: Posicion) {
  if (!pos) return "";
  if (pos.esquinas) return " en las esquinas";
  if (pos.rel) {
    const o = pos.rel.objetivo === "principal" ? "la mesa principal" : `${articulo(pos.rel.objetivo)} ${CATALOGO[pos.rel.objetivo].nombre.toLowerCase()}`;
    return contraer({ frente: ` frente a ${o}`, junto: ` al lado de ${o}`, detras: ` detrás de ${o}`, alrededor: ` alrededor de ${o}`, dentro: ` en ${o}` }[pos.rel.modo]);
  }
  if (pos.h === "centro" && pos.v === "centro") return " en el centro";
  const partes = [pos.v === "fondo" ? "al fondo" : pos.v === "entrada" ? "cerca de la entrada" : pos.v === "centro" ? "al medio" : "", pos.h === "izquierda" ? "a la izquierda" : pos.h === "derecha" ? "a la derecha" : pos.h === "centro" ? "centrada" : ""];
  return " " + partes.filter(Boolean).join(" y ");
}

/* ── Aplicar ─────────────────────────────────────────────────── */

export function aplicar(doc: DocPanel, acciones: Accion[], opciones: { reiniciar: boolean }): Resultado {
  const hechos: string[] = [];
  const avisos: string[] = [];
  let salon: Salon = { ...doc.salon, elementos: doc.salon.elementos.map((e) => ({ ...e })) };
  let invitados = doc.invitados;
  const o: Opciones = { pasillo: PASILLO, permitirExterior: false };

  const poner = (e: Elemento) => (salon = { ...salon, elementos: [...salon.elementos, e] });
  const reemplazar = (e: Elemento) => (salon = { ...salon, elementos: salon.elementos.map((x) => (x.id === e.id ? e : x)) });

  // 1. Medidas del salón.
  for (const a of acciones) {
    if (a.tipo !== "salon") continue;
    salon.ancho = clamp(r1(a.ancho), 4, 200);
    salon.largo = clamp(r1(a.largo), 4, 200);
    hechos.push(`Salón de ${fm(salon.ancho)} × ${fm(salon.largo)} m (${Math.round(salon.ancho * salon.largo)} m²)`);
  }

  // 2. De cero.
  const reiniciar = opciones.reiniciar || acciones.some((a) => a.tipo === "reiniciar");
  if (reiniciar && salon.elementos.length) {
    salon.elementos = [];
    hechos.push("Plano vacío para arrancar de cero");
  }

  const totalInvitados =
    [...acciones].reverse().find((a): a is Extract<Accion, { tipo: "invitados" }> => a.tipo === "invitados")?.cantidad ??
    (invitados.reduce((t, i) => t + esperadas(i), 0) || undefined);

  // 3. Sacar.
  for (const a of acciones) {
    if (a.tipo !== "quitar") continue;
    let objetivo = resolver(salon, { ...a.ref, todas: a.ref.todas || (a.cantidad ?? 0) > 1 });
    if (a.cantidad) objetivo = objetivo.slice(-a.cantidad);
    if (!objetivo.length) {
      avisos.push(`No encontré qué sacar en "${a.texto}".`);
      continue;
    }
    const ids = new Set(objetivo.map((e) => e.id));
    salon.elementos = salon.elementos.filter((e) => !ids.has(e.id));
    hechos.push(objetivo.length === 1 ? `Saqué ${nombreDe(objetivo[0])}` : `Saqué ${objetivo.length} ${objetivo[0].tipo === "mesa" ? "mesas" : "elementos"}`);
  }

  // 4. Estructuras y zonas; 5. después las mesas sueltas; 6. al final los grupos.
  const crear = acciones.filter((a): a is Extract<Accion, { tipo: "crear" }> => a.tipo === "crear");
  // Lo que es referencia de otro va primero: la entrada antes que "los
  // baños cerca de la entrada".
  const referidas = new Set(crear.map((a) => a.pos?.rel?.objetivo).filter(Boolean));
  const estructuras = crear.filter((a) => !MESAS.includes(a.clase));
  const orden = [
    ...estructuras.filter((a) => referidas.has(a.clase)),
    ...estructuras.filter((a) => !referidas.has(a.clase)),
    ...crear.filter((a) => MESAS.includes(a.clase) && (a.principal || (a.cantidad === 1 && !a.cantidadImplicita))),
    ...crear.filter((a) => MESAS.includes(a.clase) && !a.principal && !(a.cantidad === 1 && !a.cantidadImplicita)),
  ];

  // Los cambios sobre cosas existentes van entre medio: primero lo que ya
  // está, así "mové la pista al fondo" pasa antes de ubicar las mesas.
  const ajustes = acciones.filter((a) => a.tipo === "mover" || a.tipo === "medidas");

  const ajustar = (a: Extract<Accion, { tipo: "mover" | "medidas" }>) => {
    const objetivo = resolver(salon, a.ref);
    if (!objetivo.length) {
      avisos.push(`No encontré ${a.ref.numero ? `la mesa ${a.ref.numero}` : "a qué te referís"} en "${a.texto}".`);
      return;
    }
    objetivo.forEach((e, i) => {
      let nuevo = { ...e };
      if (a.tipo === "medidas") {
        nuevo.ancho = r1(a.ancho);
        nuevo.largo = e.clase === "redonda" ? r1(a.ancho) : r1(a.largo);
        if (nuevo.tipo === "mesa") nuevo.capacidad = capacidadSugerida(nuevo.clase, nuevo.ancho, nuevo.largo);
        const ubicado = lugarCercano({ ...salon, elementos: salon.elementos.filter((x) => x.id !== e.id) }, nuevo, e.x, e.y, o) ?? nuevo;
        reemplazar(ubicado);
        hechos.push(`${nombreDe(e)}: ahora ${fm(nuevo.ancho)} × ${fm(nuevo.largo)} m`);
      } else {
        nuevo = girarContraPared({ ...nuevo, giro: 0 }, a.pos);
        const p = puntoPara({ ...salon, elementos: salon.elementos.filter((x) => x.id !== e.id) }, nuevo, a.pos, i);
        const ubicado = lugarCercano({ ...salon, elementos: salon.elementos.filter((x) => x.id !== e.id) }, nuevo, p.x, p.y, { ...o, permitirExterior: a.pos.rel?.modo === "dentro" });
        if (ubicado) {
          reemplazar(ubicado);
          hechos.push(`Moví ${nombreDe(e)}${describirPos(a.pos)}`);
        } else avisos.push(`${nombreDe(e)} no entra${describirPos(a.pos)}.`);
      }
    });
  };

  const mesasSueltas = (a: Extract<Accion, { tipo: "crear" }>) => MESAS.includes(a.clase) && (a.principal || (a.cantidad === 1 && !a.cantidadImplicita));
  let ajustesHechos = false;

  for (const a of orden) {
    // Los ajustes se aplican justo antes de la primera mesa.
    if (!ajustesHechos && MESAS.includes(a.clase)) {
      ajustes.forEach(ajustar);
      ajustesHechos = true;
    }

    const f = CATALOGO[a.clase];
    const existentes = salon.elementos.filter((e) =>
      a.principal ? e.tipo === "mesa" && e.principal : e.clase === a.clase && !e.principal && (!a.nombre || e.nombre === a.nombre),
    );

    // "La pista mide 8 por 8" con la pista ya puesta: se ajusta, no se duplica.
    if (!reiniciar && existentes.length && (a.definido || (a.estado && !MESAS.includes(a.clase)) || a.principal) && (a.cantidad <= 1 || a.principal)) {
      const e = existentes[0];
      if (a.ancho || a.largo) ajustar({ tipo: "medidas", ref: a.principal ? { principal: true } : { clase: a.clase }, ancho: a.ancho ?? a.largo!, largo: a.largo ?? a.ancho!, texto: a.texto });
      if (a.pos) ajustar({ tipo: "mover", ref: a.principal ? { principal: true } : { clase: a.clase }, pos: a.pos, texto: a.texto });
      if (a.capacidad && e.tipo === "mesa") {
        const actual = salon.elementos.find((x) => x.id === e.id)!;
        reemplazar(dimensionar({ ...actual }, a.capacidad));
        hechos.push(`${nombreDe(e)}: ${a.capacidad} lugares`);
      }
      if (!a.ancho && !a.largo && !a.pos && !a.capacidad) hechos.push(`${nombreDe(e)} ya estaba`);
      continue;
    }

    // Cuántas.
    let cantidad = a.cantidad;
    if (MESAS.includes(a.clase) && !a.principal && (a.cantidadImplicita || cantidad === 0)) {
      const cap = a.capacidad ?? capacidadSugerida(a.clase, a.ancho ?? f.ancho, a.largo ?? f.largo);
      const invitadosGrupo = a.invitados ?? totalInvitados;
      if (!invitadosGrupo) {
        avisos.push(`No sé cuántas ${f.nombre.toLowerCase()}s poner: decime la cantidad o cuántos invitados son.`);
        continue;
      }
      const yaHay = salon.elementos.filter((e) => e.tipo === "mesa").reduce((t, e) => t + (e.capacidad ?? 0), 0);
      cantidad = Math.max(0, Math.ceil((invitadosGrupo - yaHay) / cap));
      if (cantidad) hechos.push(`Para ${invitadosGrupo} invitados hacen falta ${cantidad} mesas más de ${cap}`);
    } else if (a.estado && !reiniciar && !a.principal && existentes.length) {
      // "Hay 12 mesas" con 8 puestas: se suman 4, no 12.
      const faltan = Math.max(0, cantidad - existentes.length);
      if (faltan < cantidad) hechos.push(`Ya había ${existentes.length}; ${faltan ? `sumo ${faltan}` : "no hace falta sumar"}`);
      cantidad = faltan;
    }
    if (!cantidad) continue;

    // La plantilla.
    let plantilla: Elemento = {
      id: idNuevo(),
      tipo: f.tipo,
      clase: a.clase,
      nombre: a.nombre ?? (f.tipo === "mesa" ? "" : f.nombre),
      x: 0,
      y: 0,
      ancho: r1(a.ancho ?? f.ancho),
      largo: r1(a.clase === "redonda" ? (a.ancho ?? f.largo) : (a.largo ?? f.largo)),
      giro: 0,
      ...(a.principal ? { principal: true } : {}),
    };
    if (plantilla.clase === "redonda") plantilla.largo = plantilla.ancho;
    // La principal para más de 12 es imperial; para menos, rectangular.
    if (a.principal && a.capacidad && a.capacidad <= 10 && !a.ancho) plantilla = { ...plantilla, clase: "rectangular", largo: 0.9 };
    if (a.principal && !a.capacidad && !a.ancho) plantilla = { ...plantilla, clase: "rectangular", ancho: 2.4, largo: 0.9 };
    plantilla = dimensionar(plantilla, a.capacidad);
    plantilla = girarContraPared(plantilla, a.pos);
    if (plantilla.clase === "alfombra" && !a.ancho && !a.pos) {
      const entrada = salon.elementos.find((x) => x.clase === "entrada");
      const arriba = salon.elementos.find((m) => m.principal) ?? salon.elementos.find((x) => x.clase === "pista");
      const desde = entrada ? entrada.y - medidas(entrada).h / 2 : salon.largo;
      const hasta = arriba ? huella(arriba).y1 + 0.3 : salon.largo * 0.35;
      plantilla = { ...plantilla, ancho: 1.4, largo: r1(Math.max(3, desde - hasta)) };
    }

    // La alfombra arranca pegada a la entrada: no deja pasillo propio (las
    // mesas sí se lo dejan a ella).
    const ops = { ...o, permitirExterior: a.pos?.rel?.modo === "dentro", pasillo: plantilla.clase === "alfombra" ? 0 : o.pasillo };

    if (MESAS.includes(a.clase) && !mesasSueltas(a)) {
      // Grupo de mesas alrededor del foco.
      const foco = puntoPara(salon, plantilla, a.pos, 0);
      const r = ubicarGrupo(salon, plantilla, cantidad, foco.x, foco.y, ops);
      salon = r.salon;
      if (r.puestas.length) {
        const cual = r.puestas.length === 1 ? f.nombre.toLowerCase() : `mesas ${PLURAL[a.clase]}`;
        hechos.push(`${r.puestas.length} ${cual} de ${plantilla.capacidad}${describirPos(a.pos)}`);
      }
      if (r.puestas.length < cantidad) avisos.push(`Entraron ${r.puestas.length} de ${cantidad} mesas: no queda más lugar libre con pasillos de 90 cm.`);
      continue;
    }

    for (let i = 0; i < cantidad; i++) {
      const e = { ...plantilla, id: idNuevo() };
      if (e.tipo === "mesa" && !e.nombre) e.nombre = a.principal ? "Principal" : `Mesa ${siguienteNumero(salon)}`;
      if (cantidad > 1 && e.tipo !== "mesa" && e.clase !== "columna") e.nombre = `${plantilla.nombre} ${i + 1}`;
      const p = puntoPara(salon, e, a.pos, i);
      const ubicado = lugarCercano(salon, e, p.x, p.y, ops);
      if (!ubicado) {
        avisos.push(`${e.nombre || f.nombre} no entra${describirPos(a.pos)}: no hay lugar libre.`);
        break;
      }
      poner(ubicado);
    }
    const unidad = a.principal ? "Mesa principal" : f.nombre;
    const medida = plantilla.clase === "redonda" ? `de ${fm(plantilla.ancho)} m` : `de ${fm(plantilla.ancho)} × ${fm(plantilla.largo)} m`;
    const lugares = plantilla.tipo === "mesa" ? ` para ${plantilla.capacidad}` : "";
    hechos.push(`${cantidad > 1 ? `${cantidad} × ` : ""}${unidad} ${medida}${lugares}${describirPos(a.pos)}`);
  }
  if (!ajustesHechos) ajustes.forEach(ajustar);

  // Invitados sin ninguna mesa pedida: se arman redondas de 10.
  if (!crear.some((a) => MESAS.includes(a.clase) && !a.principal) && acciones.some((a) => a.tipo === "invitados") && totalInvitados) {
    const lugares = salon.elementos.filter((e) => e.tipo === "mesa").reduce((t, e) => t + (e.capacidad ?? 0), 0);
    const faltan = Math.ceil(Math.max(0, totalInvitados - lugares) / 10);
    if (faltan) {
      const plantilla = dimensionar({ id: "", tipo: "mesa", clase: "redonda", nombre: "", x: 0, y: 0, ancho: 1.5, largo: 1.5, giro: 0 }, 10);
      const pista = salon.elementos.find((e) => e.clase === "pista");
      const r = ubicarGrupo(salon, plantilla, faltan, pista?.x ?? salon.ancho / 2, pista?.y ?? salon.largo / 2, o);
      salon = r.salon;
      hechos.push(`Para ${totalInvitados} invitados: ${r.puestas.length} mesas redondas de 10`);
      if (r.puestas.length < faltan) avisos.push(`Entraron ${r.puestas.length} de ${faltan} mesas: no queda más lugar libre.`);
    }
  }

  // 7. Capacidad, nombres, etiquetas, principal.
  for (const a of acciones) {
    if (a.tipo === "capacidad") {
      const mesas = resolver(salon, a.ref);
      if (!mesas.length) avisos.push(`No encontré las mesas de "${a.texto}".`);
      for (const m of mesas) reemplazar(dimensionar({ ...m }, a.capacidad));
      if (mesas.length) hechos.push(mesas.length === 1 ? `${mesas[0].nombre}: ${a.capacidad} lugares` : `Todas las mesas de ${a.capacidad}`);
    }
    if (a.tipo === "nombrar" || a.tipo === "etiquetar" || a.tipo === "principal") {
      const [m] = resolver(salon, a.ref);
      if (!m) {
        avisos.push(`No encontré la mesa ${a.ref.numero ?? ""} de "${a.texto}".`.replace("  ", " "));
        continue;
      }
      if (a.tipo === "nombrar") {
        reemplazar({ ...m, nombre: a.nombre });
        hechos.push(`${m.nombre} ahora se llama "${a.nombre}"`);
      } else if (a.tipo === "etiquetar") {
        const etiquetas = [...new Set([...(m.etiquetas ?? []), ...a.etiquetas])].slice(0, 8);
        reemplazar({ ...m, etiquetas });
        hechos.push(`${m.nombre}: para ${a.etiquetas.join(" y ")}`);
      } else {
        salon = { ...salon, elementos: salon.elementos.map((e) => (e.tipo === "mesa" ? { ...e, principal: e.id === m.id } : e)) };
        hechos.push(`${m.nombre} es la principal`);
      }
    }
  }

  // 8. Sentar.
  for (const a of acciones) {
    if (a.tipo !== "sentar") continue;
    const [m] = resolver(salon, a.ref);
    const q = norm(a.quien).replace(/^(?:la|los|el|las)\s+/, "");
    const quienes = invitados.filter((i) => i.estado !== "no-viene" && (norm(i.grupo) === q || norm(i.nombre) === q || (q.length > 3 && (norm(i.grupo).includes(q) || norm(i.nombre).includes(q)))));
    if (!m || !quienes.length) {
      avisos.push(!m ? `No encontré la mesa de "${a.texto}".` : `No encontré a "${a.quien}" en la lista de invitados.`);
      continue;
    }
    const ids = new Set(quienes.map((i) => i.id));
    invitados = invitados.map((i) => (ids.has(i.id) ? { ...i, mesa: m.id } : i));
    hechos.push(`${a.quien} → ${m.nombre} (${quienes.reduce((t, i) => t + esperadas(i), 0)} personas)`);
  }

  // Invitados sentados en mesas que ya no existen.
  const idsMesa = new Set(salon.elementos.filter((e) => e.tipo === "mesa").map((e) => e.id));
  const sueltos = invitados.filter((i) => i.mesa && !idsMesa.has(i.mesa));
  if (sueltos.length) {
    invitados = invitados.map((i) => (i.mesa && !idsMesa.has(i.mesa) ? { ...i, mesa: null } : i));
    avisos.push(`${sueltos.length} ${sueltos.length === 1 ? "invitado quedó" : "invitados quedaron"} sin mesa porque su mesa ya no está.`);
  }

  return { doc: { ...doc, salon, invitados }, hechos, avisos };
}

