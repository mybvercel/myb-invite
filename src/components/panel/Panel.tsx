"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parsearFecha } from "@/invitaciones/fecha";
import { esperadas, metricas, novedades, pagoVencido, progresoChecklist, totalesPresupuesto, venceTarea } from "@/panel/logica";
import { esPlanCompleto, ETAPAS, MONEDAS, nombreRubro, NOMBRE_PLAN, type DocPanel, type Plan, type Tema } from "@/panel/tipos";
import { descargarXlsx, type Hoja } from "@/panel/xlsx";
import { Checklist } from "./Checklist";
import { Equipo } from "./Equipo";
import { Estilo } from "./Estilo";
import { Fechas, falta } from "./Fechas";
import { Invitados } from "./Invitados";
import { Links } from "./Links";
import { Menu, type ItemMenu } from "./Menu";
import { Mesas } from "./Mesas";
import { Presupuesto } from "./Presupuesto";
import { Resumen } from "./Resumen";
import { Salon } from "./Salon";

/** `clave`: cambios seguidos con la misma clave se deshacen de una vez. */
export type Cambiar = (f: (d: DocPanel) => DocPanel, clave?: string) => void;

type Vista = "resumen" | "checklist" | "equipo" | "presupuesto" | "invitados" | "links" | "mesas" | "salon" | "estilo";

const TITULO_VISTA: Record<Vista, string> = {
  resumen: "Resumen",
  checklist: "Checklist",
  equipo: "Equipo",
  presupuesto: "Presupuesto",
  invitados: "Invitados",
  links: "Links personales",
  mesas: "Mesas",
  salon: "Salón",
  estilo: "Estilo",
};

type Props = {
  slug: string;
  nombres: string;
  fecha: string;
  /** El texto de la invitación sobre el límite para confirmar. */
  cierre?: string;
  plan: Plan;
  inicial: DocPanel;
  enlaceInvitacion: string;
};

type EstadoGuardado = "guardado" | "pendiente" | "guardando" | "error" | "conflicto";

/** El plan básico no se personaliza: grafito sobre blanco, sin serif. */
const TEMA_SOBRIO: Tema = { acento: "#34403a", base: "blanco", fuente: "montserrat" };

/** Texto blanco o tinta sobre el acento, según cuál se lea mejor. */
function tintaSobre(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const canal = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const l = 0.2126 * canal(n >> 16) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
  return l > 0.42 ? "#16140f" : "#ffffff";
}

const FUENTES: Record<Tema["fuente"], string> = {
  instrument: "var(--font-instrument), Georgia, serif",
  cormorant: "var(--font-cormorant-panel), Georgia, serif",
  montserrat: "var(--font-montserrat), system-ui, sans-serif",
};

export function Panel({ slug, nombres, fecha, cierre, plan, inicial, enlaceInvitacion }: Props) {
  const completo = esPlanCompleto(plan);
  const [doc, setDoc] = useState(inicial);
  const [vista, setVista] = useState<Vista>(completo ? "resumen" : "invitados");
  const [guardado, setGuardado] = useState<EstadoGuardado>("guardado");
  const [docServidor, setDocServidor] = useState<DocPanel | null>(null);
  const [selSalon, setSelSalon] = useState<string | undefined>();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const irASalon = (id?: string) => {
    setSelSalon(id);
    setVista("salon");
  };

  /* ── Autoguardado ───────────────────────────────────────────
     Cada cambio espera 900 ms de calma y se manda el documento entero con la
     versión leída. Si mientras viaja el pedido hubo más cambios, no se pisa
     lo local: se vuelve a guardar después. */

  const version = useRef(inicial.version);
  const docRef = useRef(doc);
  const sucio = useRef(false);
  const enVuelo = useRef(false);

  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  /* ── Deshacer y rehacer ─────────────────────────────────────
     Cada cambio guarda el documento anterior. Los cambios seguidos con la
     misma `clave` en menos de 700 ms son un solo paso: arrastrar una mesa
     por el plano se deshace de una vez, no centímetro por centímetro. */

  const pasado = useRef<DocPanel[]>([]);
  const futuro = useRef<DocPanel[]>([]);
  const ultimo = useRef<{ clave?: string; t: number }>({ t: 0 });
  const [pilas, setPilas] = useState({ atras: 0, adelante: 0 });
  const contarPilas = () => setPilas({ atras: pasado.current.length, adelante: futuro.current.length });

  const poner = useCallback((n: DocPanel) => {
    docRef.current = n;
    setDoc(n);
    sucio.current = true;
    setGuardado("pendiente");
  }, []);

  const cambiar: Cambiar = useCallback(
    (f, clave) => {
      const d = docRef.current;
      const n = f(d);
      if (n === d) return;
      const ahora = Date.now();
      const mismo = clave !== undefined && clave === ultimo.current.clave && ahora - ultimo.current.t < 700;
      if (!mismo) {
        pasado.current.push(d);
        if (pasado.current.length > 150) pasado.current.shift();
      }
      ultimo.current = { clave, t: ahora };
      futuro.current = [];
      contarPilas();
      poner(n);
    },
    [poner],
  );

  const deshacer = useCallback(() => {
    const previo = pasado.current.pop();
    if (!previo) return;
    futuro.current.push(docRef.current);
    ultimo.current = { t: 0 };
    contarPilas();
    poner(previo);
  }, [poner]);

  const rehacer = useCallback(() => {
    const siguiente = futuro.current.pop();
    if (!siguiente) return;
    pasado.current.push(docRef.current);
    ultimo.current = { t: 0 };
    contarPilas();
    poner(siguiente);
  }, [poner]);

  // Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y en todo el panel. Dentro de un campo de
  // texto manda el deshacer propio del navegador.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        deshacer();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        rehacer();
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [deshacer, rehacer]);

  const guardar = useCallback(async () => {
    if (enVuelo.current || !sucio.current) return;
    enVuelo.current = true;
    setGuardado("guardando");
    const enviado = docRef.current;

    try {
      const r = await fetch(`/api/panel/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: version.current, doc: enviado }),
      });

      if (r.status === 409) {
        const { doc: delServidor } = (await r.json()) as { doc: DocPanel };
        setDocServidor(delServidor);
        setGuardado("conflicto");
        return;
      }
      if (!r.ok) throw new Error(String(r.status));

      const nuevo = (await r.json()) as DocPanel;
      version.current = nuevo.version;

      if (docRef.current === enviado) {
        // Nada cambió mientras tanto: se toma lo del servidor, que trae las
        // confirmaciones nuevas ya cruzadas.
        sucio.current = false;
        setDoc(nuevo);
        setGuardado("guardado");
      } else {
        setGuardado("pendiente");
      }
    } catch {
      setGuardado("error");
    } finally {
      enVuelo.current = false;
    }
  }, [slug]);

  useEffect(() => {
    if (guardado !== "pendiente") return;
    const t = setTimeout(guardar, 900);
    return () => clearTimeout(t);
  }, [doc, guardado, guardar]);

  /* Traer confirmaciones nuevas al volver a la pestaña y cada 45 s, siempre
     que no haya cambios locales sin guardar. */
  const refrescar = useCallback(async () => {
    if (sucio.current || enVuelo.current || document.visibilityState !== "visible") return;
    try {
      const r = await fetch(`/api/panel/${slug}`, { cache: "no-store" });
      if (!r.ok || sucio.current) return;
      const nuevo = (await r.json()) as DocPanel;
      version.current = nuevo.version;
      setDoc(nuevo);
    } catch {
      /* Sin red: se reintenta en la próxima vuelta. */
    }
  }, [slug]);

  useEffect(() => {
    const t = setInterval(refrescar, 45_000);
    document.addEventListener("visibilitychange", refrescar);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", refrescar);
    };
  }, [refrescar]);

  useEffect(() => {
    const avisar = (e: BeforeUnloadEvent) => {
      if (sucio.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, []);

  const traerLoUltimo = () => {
    if (!docServidor) return;
    version.current = docServidor.version;
    sucio.current = false;
    pasado.current = [];
    futuro.current = [];
    contarPilas();
    setDoc(docServidor);
    setDocServidor(null);
    setGuardado("guardado");
  };

  /* ── Excel ─────────────────────────────────────────────────── */

  const exportar = useCallback(() => {
    const m = metricas(doc);
    const mesas = doc.salon.elementos.filter((e) => e.tipo === "mesa");
    const nombreMesa = new Map(mesas.map((x) => [x.id, x.nombre]));
    const estado = { confirmado: "Confirmado", pendiente: "Sin respuesta", "no-viene": "No viene" } as const;

    const orden = [...doc.invitados].sort((a, b) => (a.grupo || "~").localeCompare(b.grupo || "~") || a.nombre.localeCompare(b.nombre));

    const hojas: Hoja[] = [
      {
        nombre: "Invitados",
        columnas: [
          { titulo: "Nombre", ancho: 28 },
          { titulo: "Grupo", ancho: 22 },
          { titulo: "Personas", ancho: 10 },
          { titulo: "Estado", ancho: 15 },
          ...(completo ? [{ titulo: "Mesa", ancho: 12 }] : []),
          { titulo: "Teléfono", ancho: 16 },
          { titulo: "Comidas", ancho: 26 },
          { titulo: "Canción", ancho: 28 },
          { titulo: "Notas", ancho: 30 },
          ...(completo ? [{ titulo: "Link personal", ancho: 50 }] : []),
        ],
        filas: orden.map((i) => [
          i.nombre,
          i.grupo,
          i.personas,
          estado[i.estado],
          ...(completo ? [i.mesa ? (nombreMesa.get(i.mesa) ?? "") : ""] : []),
          i.telefono,
          i.comidas.join(", "),
          i.cancion,
          i.notas,
          ...(completo ? [i.enlace ? `${window.location.origin}/i/${slug}/para/${i.enlace.token}` : ""] : []),
        ]),
      },
    ];

    if (completo && mesas.length) {
      hojas.push({
        nombre: "Mesas",
        columnas: [
          { titulo: "Mesa", ancho: 14 },
          { titulo: "Sillas", ancho: 8 },
          { titulo: "Sentados", ancho: 10 },
          { titulo: "Invitados", ancho: 80 },
        ],
        filas: mesas.map((x) => {
          const aca = doc.invitados.filter((i) => i.mesa === x.id && esperadas(i) > 0);
          return [
            x.nombre,
            x.capacidad ?? 0,
            aca.reduce((t, i) => t + esperadas(i), 0),
            aca.map((i) => (i.personas > 1 ? `${i.nombre} (${i.personas})` : i.nombre)).join(", "),
          ];
        }),
      });
    }

    if (doc.tareas.length) {
      const ev = parsearFecha(fecha);
      const resp = new Map(doc.equipo.map((r) => [r.id, r.nombre]));
      hojas.push({
        nombre: "Checklist",
        columnas: [
          { titulo: "Tarea", ancho: 52 },
          { titulo: "Cuándo", ancho: 22 },
          { titulo: "Vence", ancho: 12 },
          { titulo: "Estado", ancho: 10 },
          { titulo: "Quién se encarga", ancho: 24 },
          { titulo: "Notas", ancho: 36 },
        ],
        filas: doc.tareas.map((t) => [
          t.titulo,
          ETAPAS.find((e) => e.id === t.etapa)?.nombre ?? "",
          venceTarea(t, ev).split("-").reverse().join("/"),
          t.hecha ? "Hecha" : "Falta",
          t.responsableId ? (resp.get(t.responsableId) ?? "") : "",
          t.notas,
        ]),
      });
    }

    if (doc.equipo.length) {
      hojas.push({
        nombre: "Equipo",
        columnas: [
          { titulo: "Rubro", ancho: 22 },
          { titulo: "Nombre", ancho: 28 },
          { titulo: "Estado", ancho: 12 },
          { titulo: "Contacto", ancho: 24 },
          { titulo: "Teléfono", ancho: 16 },
          { titulo: "Email", ancho: 28 },
          { titulo: "Notas", ancho: 36 },
        ],
        filas: doc.equipo.map((r) => [nombreRubro(r.rubro), r.nombre, r.estado, r.contacto, r.telefono, r.email, r.notas]),
      });
    }

    if (doc.cotizaciones.length || doc.pagos.length) {
      const resp = new Map(doc.equipo.map((r) => [r.id, r.nombre]));
      const tot = totalesPresupuesto(doc);
      hojas.push({
        nombre: "Presupuesto",
        columnas: [
          { titulo: "Rubro", ancho: 22 },
          { titulo: "Proveedor", ancho: 26 },
          { titulo: "Detalle", ancho: 36 },
          { titulo: "Monto", ancho: 14 },
          { titulo: "Moneda", ancho: 9 },
          { titulo: "Elegida", ancho: 9 },
        ],
        filas: [
          ...doc.cotizaciones.map((c): (string | number)[] => [nombreRubro(c.rubro), c.responsableId ? (resp.get(c.responsableId) ?? "") : "", c.descripcion, c.monto, c.moneda, c.elegida ? "Sí" : ""]),
          ...MONEDAS.filter((mo) => tot[mo].hay).flatMap((mo): (string | number)[][] => [
            ["", "", `Total comprometido ${mo}`, tot[mo].comprometido, mo, ""],
            ["", "", `Pagado ${mo}`, tot[mo].pagado, mo, ""],
            ["", "", `Falta pagar ${mo}`, tot[mo].falta, mo, ""],
          ]),
        ],
      });
      hojas.push({
        nombre: "Pagos",
        columnas: [
          { titulo: "Rubro", ancho: 22 },
          { titulo: "Proveedor", ancho: 26 },
          { titulo: "Concepto", ancho: 24 },
          { titulo: "Monto", ancho: 14 },
          { titulo: "Moneda", ancho: 9 },
          { titulo: "Vence", ancho: 12 },
          { titulo: "Pagado", ancho: 9 },
        ],
        filas: doc.pagos.map((p) => [nombreRubro(p.rubro), p.responsableId ? (resp.get(p.responsableId) ?? "") : "", p.concepto, p.monto, p.moneda, p.vence.split("-").reverse().join("/"), p.pagado ? "Sí" : ""]),
      });
    }

    hojas.push({
      nombre: "Catering",
      columnas: [{ titulo: "Restricción", ancho: 26 }, { titulo: "Personas", ancho: 10 }],
      filas: m.comidas.length ? m.comidas : [["Sin restricciones cargadas", 0]],
    });

    hojas.push({
      nombre: "Resumen",
      columnas: [{ titulo: "Dato", ancho: 28 }, { titulo: "Valor", ancho: 12 }],
      filas: [
        ["Personas confirmadas", m.confirmados],
        ["Sin respuesta", m.pendientes],
        ["No vienen", m.noVienen],
        ["Personas esperadas", m.esperados],
        ...(completo
          ? ([
              ["Mesas", m.mesas],
              ["Lugares", m.lugares],
              ["Superficie (m²)", Math.round(m.areaTotal)],
            ] as [string, number][])
          : []),
      ],
    });

    void descargarXlsx(`invitados-${slug}.xlsx`, hojas);
  }, [doc, completo, slug, fecha]);

  /* ── Estilo ─────────────────────────────────────────────────── */

  const tema = completo ? doc.tema : TEMA_SOBRIO;
  const estiloTema = {
    "--acento": tema.acento,
    "--sobre-acento": tintaSobre(tema.acento),
    "--display": FUENTES[tema.fuente],
  } as React.CSSProperties;


  const m = metricas(doc);
  const nuevas = novedades(doc);
  const nuevasSinMesa = completo ? nuevas.filter((i) => i.estado === "confirmado" && !i.mesa).length : 0;
  const nombreMesa = new Map(doc.salon.elementos.filter((e) => e.tipo === "mesa").map((e) => [e.id, e.nombre]));

  const marcarVisto = () =>
    cambiar((d) => ({ ...d, ajustes: { ...d.ajustes, vistoHasta: novedades(d)[0]?.rsvp ?? d.ajustes.vistoHasta } }));

  const evento = parsearFecha(fecha);
  const prog = progresoChecklist(doc.tareas);
  const vencidos = doc.pagos.filter(pagoVencido).length;
  const detalleEvento = evento
    ? `${evento.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "")} · ${falta(evento).texto}`
    : undefined;

  const grupos: ItemMenu[][] = completo
    ? [
        [
          { id: "resumen", nombre: "Resumen" },
          { id: "checklist", nombre: "Checklist", dato: prog.total ? `${prog.hechas}/${prog.total}` : undefined },
        ],
        [
          { id: "invitados", nombre: "Invitados", dato: String(doc.invitados.length) },
          { id: "links", nombre: "Links", dato: String(doc.invitados.filter((i) => i.enlace).length) },
          { id: "mesas", nombre: "Mesas", dato: nuevasSinMesa ? `${nuevasSinMesa} por ubicar` : m.mesas ? `${m.sentados}/${m.esperados}` : undefined },
          { id: "salon", nombre: "Salón", dato: `${Math.round(m.areaTotal)} m²` },
        ],
        [
          { id: "equipo", nombre: "Equipo", dato: doc.equipo.length ? String(doc.equipo.length) : undefined },
          { id: "presupuesto", nombre: "Presupuesto", dato: vencidos ? `${vencidos} ${vencidos === 1 ? "vencido" : "vencidos"}` : undefined },
        ],
        [{ id: "estilo", nombre: "Estilo" }],
      ]
    : [];

  const elegir = (id: string) => {
    setVista(id as Vista);
    setMenuAbierto(false);
    window.scrollTo({ top: 0 });
  };

  const textoGuardado: Record<EstadoGuardado, string> = {
    guardado: "Guardado",
    pendiente: "Cambios sin guardar",
    guardando: "Guardando…",
    error: "No se pudo guardar",
    conflicto: "Editado en otro dispositivo",
  };

  const acciones = (
    <div className="pnl-cabecera__acciones">
            <span className={`pnl-guardado pnl-guardado--${guardado}`} aria-live="polite">
              {textoGuardado[guardado]}
              {guardado === "error" && (
                <button className="pnl-enlace" onClick={() => { setGuardado("pendiente"); }}>
                  Reintentar
                </button>
              )}
            </span>
            <span className="pnl-historial" role="group" aria-label="Historial">
              <button className="pnl-btn pnl-btn--icono" onClick={deshacer} disabled={!pilas.atras} title="Deshacer (Ctrl+Z)" aria-label="Deshacer">
                <svg viewBox="0 0 16 16" aria-hidden><path d="M5 3 2 6l3 3M2.5 6H10a4 4 0 0 1 0 8H7" /></svg>
              </button>
              <button className="pnl-btn pnl-btn--icono" onClick={rehacer} disabled={!pilas.adelante} title="Rehacer (Ctrl+Shift+Z)" aria-label="Rehacer">
                <svg viewBox="0 0 16 16" aria-hidden><path d="m11 3 3 3-3 3M13.5 6H6a4 4 0 0 0 0 8h3" /></svg>
              </button>
            </span>
            <a className="pnl-btn" href={enlaceInvitacion} target="_blank" rel="noreferrer">
              Ver<span className="pnl-solo-ancho"> invitación</span>
            </a>
            <button className="pnl-btn pnl-btn--lleno" onClick={exportar}>
              <span className="pnl-solo-ancho">Bajar </span>Excel
            </button>
          </div>
  );

  const bandas = (
    <>
      {guardado === "conflicto" && (
        <div className="pnl-banda" role="alert">
          <p>Alguien editó el panel desde otro dispositivo mientras lo tenías abierto.</p>
          <button className="pnl-btn pnl-btn--lleno" onClick={traerLoUltimo}>
            Traer lo último
          </button>
        </div>
      )}

      {nuevas.length > 0 && (
        <section className="pnl-novedades" aria-label="Novedades">
          <div className="pnl-novedades__cabeza">
            <p className="pnl-h2">
              {nuevas.length === 1 ? "1 respuesta nueva" : `${nuevas.length} respuestas nuevas`} desde tu última visita
            </p>
            <div className="pnl-ficha__botones">
              {nuevasSinMesa > 0 && vista !== "mesas" && (
                <button className="pnl-btn pnl-btn--lleno" onClick={() => setVista("mesas")}>
                  Ubicar {nuevasSinMesa === 1 ? "en su mesa" : "en mesas"}
                </button>
              )}
              <button className="pnl-btn" onClick={marcarVisto}>Listo, ya las vi</button>
            </div>
          </div>
          <ul className="pnl-novedades__lista">
            {nuevas.slice(0, 6).map((i) => (
              <li key={i.id}>
                <span className={`pnl-punto pnl-punto--${i.estado}`} aria-hidden />
                <span className="pnl-novedades__nombre">{i.nombre}</span>
                <span className="pnl-tenue">
                  {i.estado === "confirmado" ? `confirmó ${i.personas}` : "no viene"}
                  {completo && i.estado === "confirmado" && (i.mesa ? ` · ${nombreMesa.get(i.mesa)}` : " · sin mesa")}
                </span>
              </li>
            ))}
            {nuevas.length > 6 && <li className="pnl-tenue">y {nuevas.length - 6} más</li>}
          </ul>
        </section>
      )}

    </>
  );

  /* El plan básico no tiene menú: una sola sección, como siempre. */
  if (!completo) {
    return (
      <div className={`pnl pnl--base-${tema.base} pnl--sobrio`} style={estiloTema}>
        <header className="pnl-cabecera">
          <div className="pnl-cabecera__fila">
            <p className="pnl-rotulo">
              Panel del evento <span aria-hidden>·</span> Plan {NOMBRE_PLAN[plan]}
            </p>
            {acciones}
          </div>
          <div className="pnl-encabezado">
            <h1 className="pnl-titulo">{nombres}</h1>
            <Fechas
              fecha={fecha}
              cierre={cierre}
              limite={doc.ajustes.limite}
              pendientes={m.pendientes}
              onLimite={(limite) => cambiar((d) => ({ ...d, ajustes: { ...d.ajustes, limite } }), "limite")}
            />
          </div>
        </header>
        {bandas}
        <main className="pnl-cuerpo">
          <Invitados doc={doc} cambiar={cambiar} completo={false} nombres={nombres} enlaceInvitacion={enlaceInvitacion} />
        </main>
      </div>
    );
  }

  return (
    <div className={`pnl pnl--base-${tema.base}`} style={estiloTema}>
      <div className="pnl-app">
        <Menu
          nombres={nombres}
          detalle={detalleEvento}
          plan={NOMBRE_PLAN[plan]}
          grupos={grupos}
          actual={vista}
          abierto={menuAbierto}
          onElegir={elegir}
          onCerrar={() => setMenuAbierto(false)}
        />
        <div className="pnl-app__col" inert={menuAbierto}>
          <header className="pnl-tope">
            <button className="pnl-btn pnl-tope__menu" onClick={() => setMenuAbierto(true)} aria-expanded={menuAbierto}>
              Menú
            </button>
            <h1 className="pnl-tope__titulo">{TITULO_VISTA[vista]}</h1>
            {acciones}
          </header>
          {bandas}
          <main className="pnl-cuerpo">
        {vista === "resumen" && (
          <>
            {completo && (
              <div className="pnl-resumen-fechas">
                <Fechas
                  fecha={fecha}
                  cierre={cierre}
                  limite={doc.ajustes.limite}
                  pendientes={m.pendientes}
                  onLimite={(limite) => cambiar((d) => ({ ...d, ajustes: { ...d.ajustes, limite } }), "limite")}
                />
              </div>
            )}
            <Resumen doc={doc} irA={setVista} evento={evento} />
          </>
        )}
        {vista === "checklist" && completo && <Checklist doc={doc} cambiar={cambiar} evento={evento} />}
        {vista === "equipo" && completo && <Equipo doc={doc} cambiar={cambiar} />}
        {vista === "presupuesto" && completo && <Presupuesto doc={doc} cambiar={cambiar} />}
        {vista === "invitados" && (
          <Invitados doc={doc} cambiar={cambiar} completo={completo} nombres={nombres} enlaceInvitacion={enlaceInvitacion} />
        )}
        {vista === "links" && completo && <Links doc={doc} cambiar={cambiar} slug={slug} nombres={nombres} />}
        {vista === "mesas" && completo && <Mesas doc={doc} cambiar={cambiar} irASalon={irASalon} />}
        {vista === "salon" && completo && <Salon doc={doc} cambiar={cambiar} seleccionInicial={selSalon} />}
        {vista === "estilo" && completo && <Estilo tema={doc.tema} nombres={nombres} cambiar={cambiar} />}
          </main>
        </div>
      </div>
    </div>
  );
}
