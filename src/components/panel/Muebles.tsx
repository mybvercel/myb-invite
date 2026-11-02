import { SILLA } from "@/panel/logica";
import type { Elemento } from "@/panel/tipos";

/**
 * El mobiliario del plano, dibujado en planta como en un render de
 * organizador de eventos: mantel, sillas mirando a la mesa, plato en cada
 * lugar, centro de mesa con flores, pista de baile en damero, barra con
 * banquetas, escenario de tablones, jardín con pasto y árboles.
 *
 * Todo en metros y en coordenadas locales del elemento (centro en 0,0, sin
 * girar): el plano aplica la posición y el giro por fuera. Los colores salen
 * de variables CSS, así cambian con el fondo claro u oscuro del panel.
 *
 * `frente`: hacia dónde mira el elemento, en sus coordenadas locales. Es el
 * lado del salón (la barra pone las banquetas de ese lado, el escenario los
 * escalones, la puerta abre hacia adentro).
 */

type Frente = { x: number; y: number };

/* ── Sillas y lugares ─────────────────────────────────────────── */

/** Dónde van las sillas, en coordenadas locales de la mesa. */
export function sillas(e: Elemento): [number, number][] {
  const n = e.capacidad ?? 0;
  if (!n) return [];
  if (e.clase === "redonda") {
    const r = e.ancho / 2 + SILLA / 2;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return [Math.cos(a) * r, Math.sin(a) * r];
    });
  }
  const cab = Math.min(e.ancho, e.largo) >= 0.8 && n >= 6 ? 2 : 0;
  const porLado = Math.ceil((n - cab) / 2);
  const largoEnX = e.ancho >= e.largo;
  const L = largoEnX ? e.ancho : e.largo;
  const A = largoEnX ? e.largo : e.ancho;
  const pts: [number, number][] = [];
  for (let lado = 0; lado < 2; lado++) {
    const enEste = lado === 0 ? porLado : n - cab - porLado;
    for (let k = 0; k < enEste; k++) {
      const t = -L / 2 + (L / enEste) * (k + 0.5);
      const d = (lado ? 1 : -1) * (A / 2 + SILLA / 2);
      pts.push(largoEnX ? [t, d] : [d, t]);
    }
  }
  if (cab) {
    const d = L / 2 + SILLA / 2;
    pts.push(largoEnX ? [-d, 0] : [0, -d], largoEnX ? [d, 0] : [0, d]);
  }
  return pts;
}

/** Hacia la mesa: del lugar al punto más cercano del borde. */
function haciaMesa(e: Elemento, x: number, y: number) {
  if (e.clase === "redonda") return Math.atan2(-y, -x);
  const cx = Math.max(-e.ancho / 2, Math.min(e.ancho / 2, x));
  const cy = Math.max(-e.largo / 2, Math.min(e.largo / 2, y));
  return Math.atan2(cy - y, cx - x);
}

const grados = (r: number) => (r * 180) / Math.PI;

/** Silla en planta: asiento redondeado y respaldo del lado de afuera. */
function Silla({ x, y, angulo, ocupada }: { x: number; y: number; angulo: number; ocupada: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${grados(angulo)})`} className={`pnl-m-silla${ocupada ? " es-ocupada" : ""}`}>
      <rect x={-0.19} y={-0.19} width={0.38} height={0.38} rx={0.08} className="pnl-m-silla__asiento" />
      <rect x={-0.26} y={-0.2} width={0.09} height={0.4} rx={0.045} className="pnl-m-silla__respaldo" />
    </g>
  );
}

/** Plato con servilleta: sólo cuando la mesa es lo bastante grande para verse. */
function Plato({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="pnl-m-plato">
      <circle r={0.105} />
      <circle r={0.065} className="pnl-m-plato__centro" />
    </g>
  );
}

/** Centro de mesa: flores alrededor de la tarjeta con el número. */
function Centro({ r, x = 0, y = 0, tarjeta = true }: { r: number; x?: number; y?: number; tarjeta?: boolean }) {
  const petalos = 7;
  return (
    <g transform={`translate(${x} ${y})`} className="pnl-m-centro">
      {Array.from({ length: petalos }, (_, i) => {
        const a = (i / petalos) * Math.PI * 2;
        const d = r * 0.72;
        return (
          <g key={i}>
            <circle cx={Math.cos(a + 0.35) * d * 1.08} cy={Math.sin(a + 0.35) * d * 1.08} r={r * 0.2} className="pnl-m-centro__hoja" />
            <circle cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={r * 0.26} className={`pnl-m-centro__flor${i % 3 === 0 ? " es-clara" : ""}`} />
          </g>
        );
      })}
      {tarjeta && <circle r={r * 0.6} className="pnl-m-centro__tarjeta" />}
    </g>
  );
}

function Mesa({ e, n }: { e: Elemento; n: number }) {
  const puestos = sillas(e);
  const redonda = e.clase === "redonda";
  const conPlatos = Math.min(e.ancho, e.largo) >= 0.85;
  const largoEnX = e.ancho >= e.largo;
  const L = largoEnX ? e.ancho : e.largo;

  // Centros de mesa cada 1,8 m en las largas; uno solo en las chicas.
  const cuantos = Math.max(1, Math.round(L / 1.8));
  const centros = redonda ? [0] : Array.from({ length: cuantos }, (_, i) => -L / 2 + (L / cuantos) * (i + 0.5));

  return (
    <g className={`pnl-m-mesa${e.principal ? " es-principal" : ""}`}>
      {puestos.map(([x, y], k) => (
        <Silla key={k} x={x} y={y} angulo={haciaMesa(e, x, y)} ocupada={k < n} />
      ))}

      {/* Sombra y mantel */}
      {redonda ? (
        <>
          <circle cx={0.05} cy={0.08} r={e.ancho / 2 + 0.02} className="pnl-m-sombra" />
          <circle r={e.ancho / 2} className="pnl-m-mantel" />
          <circle r={e.ancho / 2 - 0.07} className="pnl-m-mantel__ruedo" />
        </>
      ) : (
        <>
          <rect x={-e.ancho / 2 + 0.05} y={-e.largo / 2 + 0.08} width={e.ancho + 0.02} height={e.largo + 0.02} rx={0.05} className="pnl-m-sombra" />
          <rect x={-e.ancho / 2} y={-e.largo / 2} width={e.ancho} height={e.largo} rx={0.05} className="pnl-m-mantel" />
          {/* Camino de mesa a lo largo */}
          {largoEnX ? (
            <rect x={-e.ancho / 2 + 0.12} y={-0.14} width={e.ancho - 0.24} height={0.28} className="pnl-m-camino" />
          ) : (
            <rect x={-0.14} y={-e.largo / 2 + 0.12} width={0.28} height={e.largo - 0.24} className="pnl-m-camino" />
          )}
        </>
      )}

      {conPlatos &&
        puestos.map(([x, y], k) => {
          const a = haciaMesa(e, x, y);
          const d = SILLA / 2 + 0.17;
          return <Plato key={k} x={x + Math.cos(a) * d} y={y + Math.sin(a) * d} />;
        })}

      {redonda ? (
        <Centro r={Math.min(0.36, e.ancho * 0.2)} />
      ) : (
        centros.map((c, i) => <Centro key={i} r={Math.min(0.3, Math.min(e.ancho, e.largo) * 0.28)} x={largoEnX ? c : 0} y={largoEnX ? 0 : c} tarjeta={i === Math.floor(centros.length / 2)} />)
      )}
    </g>
  );
}

/* ── Estructuras ─────────────────────────────────────────────── */

const ancho = (e: Elemento) => e.ancho;
const largo = (e: Elemento) => e.largo;

/** Pista de baile: damero con brillo, como las pistas de madera laqueada. */
function Pista({ e }: { e: Elemento }) {
  const w = ancho(e);
  const h = largo(e);
  const lado = 0.6;
  const cols = Math.max(1, Math.round(w / lado));
  const filas = Math.max(1, Math.round(h / lado));
  const cw = w / cols;
  const ch = h / filas;
  const cuadros = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < filas; j++) if ((i + j) % 2 === 0) cuadros.push(<rect key={`${i}-${j}`} x={-w / 2 + i * cw} y={-h / 2 + j * ch} width={cw} height={ch} />);
  return (
    <g className="pnl-m-pista">
      <rect x={-w / 2 - 0.08} y={-h / 2 - 0.08} width={w + 0.16} height={h + 0.16} className="pnl-m-pista__marco" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} className="pnl-m-pista__base" />
      <g className="pnl-m-pista__cuadros">{cuadros}</g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#pnlm-brillo)" />
    </g>
  );
}

function Escenario({ e, frente }: { e: Elemento; frente: Frente }) {
  const w = ancho(e);
  const h = largo(e);
  const tablones = Array.from({ length: Math.floor(h / 0.3) }, (_, i) => -h / 2 + (i + 1) * 0.3);
  // Escalones del lado del salón, centrados.
  const fx = Math.abs(frente.x) > Math.abs(frente.y) ? Math.sign(frente.x) : 0;
  const fy = fx ? 0 : Math.sign(frente.y) || 1;
  return (
    <g className="pnl-m-escenario">
      <rect x={-w / 2 + 0.06} y={-h / 2 + 0.1} width={w} height={h} className="pnl-m-sombra" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} className="pnl-m-madera" />
      {tablones.map((y, i) => <line key={i} x1={-w / 2} x2={w / 2} y1={y} y2={y} className="pnl-m-veta" />)}
      {[-1, 1].map((s) => (
        <rect key={s} x={s * (w / 2 - 0.45) - 0.3} y={-fy * (h / 2 - 0.45) - 0.3 - fx * 0} width={0.6} height={0.6} rx={0.06} className="pnl-m-parlante" />
      ))}
      {fy !== 0 ? (
        <g>
          <rect x={-0.7} y={fy > 0 ? h / 2 : -h / 2 - 0.5} width={1.4} height={0.5} className="pnl-m-escalon" />
          <line x1={-0.7} x2={0.7} y1={fy > 0 ? h / 2 + 0.25 : -h / 2 - 0.25} y2={fy > 0 ? h / 2 + 0.25 : -h / 2 - 0.25} className="pnl-m-veta" />
        </g>
      ) : (
        <rect x={fx > 0 ? w / 2 : -w / 2 - 0.5} y={-0.7} width={0.5} height={1.4} className="pnl-m-escalon" />
      )}
    </g>
  );
}

function Dj({ e }: { e: Elemento }) {
  const w = ancho(e);
  const h = largo(e);
  const r = Math.min(0.26, h * 0.22, w * 0.12);
  return (
    <g className="pnl-m-dj">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.08} className="pnl-m-oscuro" />
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * w * 0.26} 0)`}>
          <circle r={r} className="pnl-m-disco" />
          <circle r={r * 0.25} className="pnl-m-disco__centro" />
        </g>
      ))}
      <rect x={-w * 0.08} y={-h * 0.28} width={w * 0.16} height={h * 0.56} rx={0.03} className="pnl-m-consola" />
      {[-1, 1].map((s) => (
        <rect key={s} x={s * (w / 2 + 0.05) - (s > 0 ? 0 : 0.45)} y={-0.22} width={0.45} height={0.45} rx={0.05} className="pnl-m-parlante" />
      ))}
    </g>
  );
}

function Barra({ e, frente }: { e: Elemento; frente: Frente }) {
  const w = ancho(e);
  const h = largo(e);
  const largoEnX = w >= h;
  const L = largoEnX ? w : h;
  const lado = largoEnX ? Math.sign(frente.y) || 1 : Math.sign(frente.x) || 1;
  const banquetas = Math.max(1, Math.floor(L / 0.65));
  const botellas = Math.max(2, Math.floor(L / 0.22));
  const colores = ["a", "b", "c", "d"];
  return (
    <g className="pnl-m-barra">
      <rect x={-w / 2 + 0.05} y={-h / 2 + 0.08} width={w} height={h} rx={0.12} className="pnl-m-sombra" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.12} className="pnl-m-madera pnl-m-madera--oscura" />
      {/* Mostrador del lado del salón */}
      {largoEnX ? (
        <rect x={-w / 2 + 0.06} y={lado > 0 ? h / 2 - 0.42 : -h / 2 + 0.06} width={w - 0.12} height={0.36} rx={0.06} className="pnl-m-mostrador" />
      ) : (
        <rect x={lado > 0 ? w / 2 - 0.42 : -w / 2 + 0.06} y={-h / 2 + 0.06} width={0.36} height={h - 0.12} rx={0.06} className="pnl-m-mostrador" />
      )}
      {/* Botellas contra la pared */}
      {Array.from({ length: botellas }, (_, i) => {
        const t = -L / 2 + (L / botellas) * (i + 0.5);
        const d = -lado * (Math.min(w, h) / 2 - 0.16);
        return <circle key={i} cx={largoEnX ? t : d} cy={largoEnX ? d : t} r={0.06} className={`pnl-m-botella pnl-m-botella--${colores[i % 4]}`} />;
      })}
      {/* Banquetas afuera */}
      {Array.from({ length: banquetas }, (_, i) => {
        const t = -L / 2 + (L / banquetas) * (i + 0.5);
        const d = lado * (Math.min(w, h) / 2 + 0.32);
        return <circle key={i} cx={largoEnX ? t : d} cy={largoEnX ? d : t} r={0.18} className="pnl-m-banqueta" />;
      })}
    </g>
  );
}

function Dulce({ e }: { e: Elemento }) {
  const w = ancho(e);
  const h = largo(e);
  const largoEnX = w >= h;
  const L = largoEnX ? w : h;
  const extras = Math.max(2, Math.floor(L / 0.45));
  return (
    <g className="pnl-m-dulce">
      <rect x={-w / 2 + 0.05} y={-h / 2 + 0.08} width={w} height={h} rx={0.05} className="pnl-m-sombra" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.05} className="pnl-m-mantel" />
      {Array.from({ length: extras }, (_, i) => {
        const t = -L / 2 + (L / extras) * (i + 0.5);
        if (Math.abs(t) < 0.45) return null;
        return <circle key={i} cx={largoEnX ? t : 0} cy={largoEnX ? 0 : t} r={0.1} className={`pnl-m-postre${i % 2 ? " es-claro" : ""}`} />;
      })}
      <circle r={Math.min(0.4, Math.min(w, h) * 0.42)} className="pnl-m-torta" />
      <circle r={Math.min(0.28, Math.min(w, h) * 0.3)} className="pnl-m-torta pnl-m-torta--2" />
      <circle r={Math.min(0.15, Math.min(w, h) * 0.16)} className="pnl-m-torta pnl-m-torta--3" />
    </g>
  );
}

function Banos({ e, frente }: { e: Elemento; frente: Frente }) {
  const w = ancho(e);
  const h = largo(e);
  const n = Math.max(1, Math.min(4, Math.floor(w / 1.1)));
  const atras = -(Math.sign(frente.y) || 1);
  return (
    <g className="pnl-m-bano">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} className="pnl-m-azulejo" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#pnlm-azulejos)" />
      {Array.from({ length: n }, (_, i) => {
        const x = -w / 2 + (w / n) * (i + 0.5);
        const y = atras * (h / 2 - 0.35);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(1 ${atras > 0 ? -1 : 1})`}>
            <rect x={-0.2} y={-0.3} width={0.4} height={0.16} rx={0.03} className="pnl-m-loza" />
            <ellipse cy={0.05} rx={0.17} ry={0.22} className="pnl-m-loza" />
          </g>
        );
      })}
      {Array.from({ length: n - 1 }, (_, i) => {
        const x = -w / 2 + (w / n) * (i + 1);
        return <line key={i} x1={x} x2={x} y1={atras > 0 ? h / 2 : -h / 2} y2={atras > 0 ? h / 2 - 1 : -h / 2 + 1} className="pnl-m-tabique" />;
      })}
    </g>
  );
}

function Cocina({ e, frente }: { e: Elemento; frente: Frente }) {
  const w = ancho(e);
  const h = largo(e);
  const atras = -(Math.sign(frente.y) || 1);
  const y = atras * (h / 2 - 0.35);
  return (
    <g className="pnl-m-cocina">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} className="pnl-m-azulejo" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#pnlm-azulejos)" />
      <rect x={-w / 2 + 0.1} y={y - 0.3} width={w - 0.2} height={0.6} className="pnl-m-mesada" />
      {[-0.22, 0.22].flatMap((dx) => [-0.15, 0.15].map((dy) => <circle key={`${dx}${dy}`} cx={dx - w * 0.15} cy={y + dy} r={0.1} className="pnl-m-hornalla" />))}
      <rect x={w * 0.1} y={y - 0.2} width={0.6} height={0.4} rx={0.05} className="pnl-m-pileta" />
      <rect x={-0.6} y={-0.35} width={1.2} height={0.7} className="pnl-m-mesada" />
    </g>
  );
}

function Entrada({ e, frente }: { e: Elemento; frente: Frente }) {
  const w = Math.max(ancho(e), largo(e));
  const largoEnX = ancho(e) >= largo(e);
  // La puerta abre hacia el salón.
  const s = largoEnX ? Math.sign(frente.y) || -1 : Math.sign(frente.x) || -1;
  const hoja = w / 2;
  const p = (x: number, y: number) => (largoEnX ? `${x} ${y}` : `${y} ${x}`);
  return (
    <g className="pnl-m-entrada">
      <rect x={-ancho(e) / 2} y={-largo(e) / 2} width={ancho(e)} height={largo(e)} className="pnl-m-umbral" />
      <path d={`M${p(-w / 2, 0)} L${p(-w / 2, s * hoja)} A${hoja} ${hoja} 0 0 ${s > 0 ? 0 : 1} ${p(0, 0)}`} className="pnl-m-hoja" />
      <path d={`M${p(w / 2, 0)} L${p(w / 2, s * hoja)} A${hoja} ${hoja} 0 0 ${s > 0 ? 1 : 0} ${p(0, 0)}`} className="pnl-m-hoja" />
    </g>
  );
}

function Columna({ e }: { e: Elemento }) {
  const w = ancho(e);
  const h = largo(e);
  return Math.abs(w - h) < 0.05 ? (
    <g className="pnl-m-columna">
      <circle cx={0.04} cy={0.06} r={w / 2} className="pnl-m-sombra" />
      <circle r={w / 2} fill="url(#pnlm-columna)" className="pnl-m-columna__cuerpo" />
    </g>
  ) : (
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#pnlm-columna)" className="pnl-m-columna__cuerpo" />
  );
}

function Alfombra({ e }: { e: Elemento }) {
  const w = ancho(e);
  const h = largo(e);
  const largoEnX = w >= h;
  const flecos = Math.floor((largoEnX ? h : w) / 0.07);
  const extremos = largoEnX ? [-w / 2, w / 2] : [-h / 2, h / 2];
  return (
    <g className="pnl-m-alfombra">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} className="pnl-m-alfombra__base" />
      <rect x={-w / 2 + 0.1} y={-h / 2 + 0.1} width={Math.max(0, w - 0.2)} height={Math.max(0, h - 0.2)} className="pnl-m-alfombra__guarda" />
      {extremos.map((ext, j) =>
        Array.from({ length: flecos }, (_, i) => {
          const t = (largoEnX ? -h / 2 : -w / 2) + 0.035 + i * 0.07;
          const d = j ? 0.12 : -0.12;
          return largoEnX ? (
            <line key={`${j}${i}`} x1={ext} x2={ext + d} y1={t} y2={t} className="pnl-m-fleco" />
          ) : (
            <line key={`${j}${i}`} y1={ext} y2={ext + d} x1={t} x2={t} className="pnl-m-fleco" />
          );
        }),
      )}
    </g>
  );
}

function Living({ e }: { e: Elemento }) {
  const w = ancho(e);
  const h = largo(e);
  const sw = Math.min(w * 0.8, 2.2);
  return (
    <g className="pnl-m-living">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.1} className="pnl-m-alfombrita" />
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(0 ${s * (h / 2 - 0.45)})`}>
          <rect x={-sw / 2} y={-0.4} width={sw} height={0.8} rx={0.14} className="pnl-m-sillon" />
          <rect x={-sw / 2 + 0.08} y={s > 0 ? 0.12 : -0.36} width={sw - 0.16} height={0.24} rx={0.08} className="pnl-m-sillon__respaldo" />
        </g>
      ))}
      <rect x={-0.45} y={-0.28} width={0.9} height={0.56} rx={0.06} className="pnl-m-madera" />
    </g>
  );
}

function Generica({ e }: { e: Elemento }) {
  const w = ancho(e);
  const h = largo(e);
  const nombre = e.nombre.toLowerCase();
  if (nombre.includes("living")) return <Living e={e} />;
  const esFotos = nombre.includes("foto");
  const esRopa = nombre.includes("ropa");
  return (
    <g className="pnl-m-generica">
      <rect x={-w / 2 + 0.05} y={-h / 2 + 0.08} width={w} height={h} rx={0.06} className="pnl-m-sombra" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.06} className="pnl-m-bloque" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.06} fill="url(#pnlm-rayado)" />
      {esFotos && (
        <g className="pnl-m-icono">
          <rect x={-0.3} y={-0.2} width={0.6} height={0.42} rx={0.06} />
          <circle r={0.12} cy={0.01} />
        </g>
      )}
      {esRopa &&
        Array.from({ length: Math.max(2, Math.floor(w / 0.25)) }, (_, i) => {
          const x = -w / 2 + (w / Math.max(2, Math.floor(w / 0.25))) * (i + 0.5);
          return <line key={i} x1={x} x2={x} y1={-h * 0.3} y2={h * 0.3} className="pnl-m-perchas" />;
        })}
    </g>
  );
}

/* ── Zonas ─────────────────────────────────────────────────────── */

/** Número estable a partir del id: los árboles no cambian de lugar al redibujar. */
const semilla = (id: string, k: number) => {
  let h = 2166136261 ^ k;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 1000) / 1000;
};

function Jardin({ e }: { e: Elemento }) {
  const w = ancho(e);
  const h = largo(e);
  const cuantos = Math.max(2, Math.min(9, Math.round((w * h) / 22)));
  // Pegados al borde (el centro queda libre para usar) y sin encimarse.
  const arboles: { x: number; y: number; r: number }[] = [];
  for (let i = 0; arboles.length < cuantos && i < cuantos * 4; i++) {
    const borde = i % 4;
    const t = semilla(e.id, i);
    const m = 0.9;
    const x = borde === 0 || borde === 2 ? -w / 2 + m + t * (w - 2 * m) : borde === 1 ? w / 2 - m : -w / 2 + m;
    const y = borde === 1 || borde === 3 ? -h / 2 + m + t * (h - 2 * m) : borde === 0 ? -h / 2 + m : h / 2 - m;
    const r = 0.55 + semilla(e.id, i + 50) * 0.35;
    if (arboles.every((a) => Math.hypot(a.x - x, a.y - y) > a.r + r + 0.3)) arboles.push({ x, y, r });
  }
  return (
    <g className="pnl-m-jardin">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.2} className="pnl-m-pasto" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.2} fill="url(#pnlm-pasto)" />
      {arboles.map(({ x, y, r }, i) => {
        return (
          <g key={i} transform={`translate(${x} ${y})`} className="pnl-m-arbol">
            <circle cx={0.12} cy={0.16} r={r} className="pnl-m-sombra" />
            <circle r={r} className="pnl-m-arbol__copa" />
            <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.45} className="pnl-m-arbol__luz" />
          </g>
        );
      })}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.2} className="pnl-m-zona__borde" />
    </g>
  );
}

function Galeria({ e }: { e: Elemento }) {
  const w = ancho(e);
  const h = largo(e);
  const largoEnX = w >= h;
  const L = largoEnX ? w : h;
  const vigas = Math.max(2, Math.floor(L / 0.8));
  return (
    <g className="pnl-m-galeria">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} className="pnl-m-laja" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#pnlm-lajas)" />
      {Array.from({ length: vigas + 1 }, (_, i) => {
        const t = -L / 2 + (L / vigas) * i;
        return largoEnX ? <line key={i} x1={t} x2={t} y1={-h / 2} y2={h / 2} className="pnl-m-viga" /> : <line key={i} y1={t} y2={t} x1={-w / 2} x2={w / 2} className="pnl-m-viga" />;
      })}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sy) => <rect key={`${sx}${sy}`} x={sx * (w / 2 - 0.15) - 0.12} y={sy * (h / 2 - 0.15) - 0.12} width={0.24} height={0.24} className="pnl-m-poste" />))}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} className="pnl-m-zona__borde" />
    </g>
  );
}

/* ── Entrada única ─────────────────────────────────────────────── */

export function Mueble({ e, n, frente }: { e: Elemento; n: number; frente: Frente }) {
  if (e.tipo === "mesa") return <Mesa e={e} n={n} />;
  switch (e.clase) {
    case "pista":
      return <Pista e={e} />;
    case "escenario":
      return <Escenario e={e} frente={frente} />;
    case "dj":
      return <Dj e={e} />;
    case "barra":
      return <Barra e={e} frente={frente} />;
    case "dulce":
      return <Dulce e={e} />;
    case "bano":
      return <Banos e={e} frente={frente} />;
    case "cocina":
      return <Cocina e={e} frente={frente} />;
    case "entrada":
      return <Entrada e={e} frente={frente} />;
    case "columna":
      return <Columna e={e} />;
    case "alfombra":
      return <Alfombra e={e} />;
    case "exterior":
      return <Jardin e={e} />;
    case "galeria":
      return <Galeria e={e} />;
    default:
      return <Generica e={e} />;
  }
}

/** Patrones y degradés que usan los muebles. Van una vez por plano. */
export function DefsMuebles() {
  return (
    <>
      <linearGradient id="pnlm-brillo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0.02" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.1" />
      </linearGradient>
      <radialGradient id="pnlm-columna" cx="0.35" cy="0.35" r="0.75">
        <stop offset="0" className="pnl-m-columna__luz" />
        <stop offset="1" className="pnl-m-columna__sombra" />
      </radialGradient>
      <pattern id="pnlm-rayado" width="0.35" height="0.35" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="0.35" className="pnl-m-raya" />
      </pattern>
      <pattern id="pnlm-azulejos" width="0.3" height="0.3" patternUnits="userSpaceOnUse">
        <path d="M0.3 0H0V0.3" className="pnl-m-junta" />
      </pattern>
      <pattern id="pnlm-lajas" width="0.8" height="0.4" patternUnits="userSpaceOnUse">
        <path d="M0 0H0.8M0.4 0V0.2M0 0.2H0.8M0 0.2V0.4" className="pnl-m-junta" />
      </pattern>
      <pattern id="pnlm-pasto" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
        <path d="M0.08 0.14l0.03-0.08M0.3 0.36l0.02-0.08M0.4 0.1l-0.03-0.07M0.18 0.42l0.03-0.07" className="pnl-m-brizna" />
      </pattern>
    </>
  );
}
