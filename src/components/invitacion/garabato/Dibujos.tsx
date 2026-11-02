import { useId } from "react";

/**
 * La pareja, dibujada a mano en SVG, en cuatro momentos.
 *
 * El lenguaje sale de la referencia: él es mancha llena (traje y rulos en
 * rojo pleno), ella es sólo contorno (vestido blanco). Ese contraste lleno /
 * vacío es todo el recurso gráfico; nunca se rellena el vestido.
 *
 * Cada trazo lleva `pathLength=1` y un índice `--i`: el CSS lo dibuja como
 * una lapicera, uno detrás de otro, cuando la sección entra en pantalla. Los
 * rellenos aparecen después de su contorno. Todo pasa por un filtro de
 * temblor leve, para que la línea no sea perfecta de computadora.
 *
 * viewBox de 300 × 300 en todos, así se pueden intercambiar.
 */

type Lapiz = {
  t: (d: string, ancho?: number) => React.ReactElement;
  f: (d: string) => React.ReactElement;
  c: (cx: number, cy: number, r: number) => string;
};

/** Crea las herramientas de dibujo con un contador propio para el orden. */
function lapiz(): Lapiz {
  let k = 0;
  return {
    t: (d, ancho = 2.6) => (
      <path key={k} d={d} pathLength={1} className="gb-t" strokeWidth={ancho} style={{ "--i": k++ } as React.CSSProperties} />
    ),
    f: (d) => <path key={k} d={d} className="gb-f" style={{ "--i": k++ } as React.CSSProperties} />,
    c: (cx, cy, r) => `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`,
  };
}

function Lienzo({ children, titulo }: { children: React.ReactNode; titulo: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 300 300" className="gb-svg" role="img" aria-label={titulo}>
      <defs>
        {/* Temblor de pulso: la línea se corre una fracción de píxel, como tinta. */}
        <filter id={`pulso-${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="r" />
          <feDisplacementMap in="SourceGraphic" in2="r" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#pulso-${id})`}>{children}</g>
    </svg>
  );
}

/** Rulos del novio: un racimo de círculos llenos. */
const rulos = (l: Lapiz, puntos: [number, number, number][]) => puntos.map(([x, y, r]) => l.f(l.c(x, y, r)));

/* ── 1 · Brindando sentados sobre la torta ─────────────────────── */
export function Brindis() {
  const l = lapiz();
  return (
    <Lienzo titulo="Bruno y Martina brindando, sentados arriba de la torta">
      {/* La torta */}
      {l.t("M80 248 C 110 240, 190 240, 220 248 C 205 258, 95 258, 80 248 Z")}
      {l.t("M128 256 C 124 270, 112 272, 112 282 C 112 289, 121 289, 121 283")}
      {l.t("M172 256 C 176 270, 188 272, 188 282 C 188 289, 179 289, 179 283")}
      {l.t("M98 246 L100 206 C 130 198, 170 198, 200 206 L202 246")}
      {l.t("M112 202 L114 171 C 135 165, 165 165, 186 171 L188 202")}
      {l.t("M126 167 L127 143 C 140 139, 160 139, 173 143 L174 167")}

      {/* Él: pierna estirada a la izquierda, saco lleno, rulos, copa arriba */}
      {l.f("M152 139 L116 141 C 108 142, 104 148, 106 154 L112 156 C 120 150, 132 151, 152 150 Z")}
      {l.f("M98 154 C 101 151, 109 151, 112 155 L111 160 L99 160 C 96 159, 96 156, 98 154 Z")}
      {l.f("M155 140 L126 140 L129 109 C 133 99, 146 98, 152 106 Z")}
      {l.t(l.c(138, 87, 11))}
      {rulos(l, [[131, 78, 5], [137, 75, 5.5], [144, 77, 5], [148, 83, 4], [129, 84, 4]])}
      {l.f(l.c(133, 89, 1.3))}
      {l.t("M130 93 Q133 96 137 93", 1.8)}
      {l.t("M131 108 C 124 100, 118 92, 114 83", 7)}
      {l.t(l.c(113, 79, 3.5), 2)}
      {l.t("M103 62 L121 62 L112 72 Z", 2)}
      {l.f("M106 64 L118 64 L112 70 Z")}
      {l.t("M112 72 L112.5 76", 2)}
      {l.t("M100 53 L96 47", 1.8)}
      {l.t("M108 50 L108 43", 1.8)}
      {l.t("M117 52 L120 46", 1.8)}

      {/* Ella: contorno, pelo largo, velo, falda que cae por el borde */}
      {l.t("M156 104 C 162 101, 170 102, 172 106 L169 124 L157 124 Z")}
      {l.t("M157 124 C 175 128, 192 138, 204 152 C 206 158, 198 162, 190 159 C 176 154, 160 150, 148 145 C 150 136, 153 128, 157 124")}
      {l.f("M204 153 L213 154 L212 159 L203 158 Z")}
      {l.t(l.c(166, 87, 10.5))}
      {l.t("M156 84 C 157 73, 172 71, 176 81", 2.2)}
      {l.t("M157 84 C 153 94, 152 105, 155 115", 2)}
      {l.t("M160 80 C 156 90, 156 101, 158 110", 2)}
      {l.t("M158 79 C 147 92, 146 112, 150 128", 1.4)}
      {l.f(l.c(170, 87, 1.2))}
      {l.t("M168 92 Q171 94 174 91", 1.8)}
      {l.t("M171 108 C 178 100, 184 90, 188 81", 2.4)}
      {l.t(l.c(189, 78, 3), 2)}
      {l.t("M180 60 L198 60 L189 70 Z", 2)}
      {l.f("M183 62 L195 62 L189 68 Z")}
      {l.t("M189 70 L189 74", 2)}
      {l.t("M201 52 L205 46", 1.8)}
      {l.t("M192 49 L192 42", 1.8)}
      {l.t("M184 51 L181 45", 1.8)}
    </Lienzo>
  );
}

/* ── 2 · Él le pone el anillo a ella ───────────────────────────── */
export function Anillo() {
  const l = lapiz();
  return (
    <Lienzo titulo="Bruno le pone el anillo a Martina">
      {l.t("M58 262 C 110 257, 190 266, 242 259", 2)}

      {/* Él */}
      {l.t(l.c(112, 70, 12))}
      {rulos(l, [[104, 61, 5.5], [111, 57, 6], [119, 59, 5.5], [124, 65, 4.5], [102, 68, 4.5]])}
      {l.f(l.c(118, 71, 1.4))}
      {l.t("M115 77 Q118 80 122 76", 1.8)}
      {l.f("M98 90 C 104 86, 120 86, 126 90 L128 160 L96 160 Z")}
      {l.f("M97 158 L127 158 L126 248 L115 248 L112 180 L109 248 L98 248 Z")}
      {l.f("M96 246 L111 246 L111 254 L91 254 C 91 250, 93 247, 96 246 Z")}
      {l.f("M114 246 L127 246 C 130 247, 133 250, 133 254 L114 254 Z")}
      {l.t("M100 96 C 96 118, 96 134, 98 150", 9)}
      {l.t("M124 96 C 132 110, 138 120, 145 126", 9)}
      {l.t(l.c(148, 127, 4), 2)}

      {/* Ella */}
      {l.t(l.c(189, 72, 11))}
      {l.t("M178 70 C 178 58, 198 56, 200 68", 2.2)}
      {l.t("M199 66 C 205 80, 206 96, 202 110", 2)}
      {l.t("M196 64 C 202 80, 201 96, 198 106", 2)}
      {l.t("M197 60 C 216 74, 226 120, 232 190", 1.4)}
      {l.t("M199 63 C 214 90, 220 140, 222 200", 1.4)}
      {l.f(l.c(184, 73, 1.3))}
      {l.t("M180 78 Q183 81 186 77", 1.8)}
      {l.t("M180 90 C 185 87, 194 87, 199 90 L197 122 L182 122 Z")}
      {l.t("M182 122 C 172 160, 166 210, 160 250 C 185 256, 205 256, 228 250 C 220 210, 208 160, 197 122")}
      {l.t("M182 96 C 172 108, 162 120, 153 127", 2.4)}
      {l.t(l.c(152, 128, 3.5), 2)}
      {l.t("M198 96 C 205 110, 205 124, 200 132", 2.4)}
      {l.t(l.c(200, 138, 4.5), 1.8)}
      {l.t(l.c(208, 134, 4), 1.8)}
      {l.t(l.c(206, 143, 3.5), 1.8)}

      {/* El anillo, con su brillo */}
      {l.t(l.c(150, 120, 3.4), 1.8)}
      {l.t("M150 111 L150 105", 1.8)}
      {l.t("M143 113 L139 109", 1.8)}
      {l.t("M157 113 L161 109", 1.8)}
      {l.t("M150 44 C 140 34, 128 44, 150 58 C 172 44, 160 34, 150 44 Z", 2.2)}
    </Lienzo>
  );
}

/* ── 3 · Comiendo: el mismo fideo, de punta a punta ─────────────── */
export function Comiendo() {
  const l = lapiz();
  // Mantel con festón: diez ondas a lo ancho de la mesa.
  let festón = "M44 170 L44 196";
  for (let x = 44; x < 256; x += 21.2) festón += ` Q${x + 10.6} 206 ${x + 21.2} 196`;
  festón += " L256 170";

  return (
    <Lienzo titulo="Bruno y Martina comiendo el mismo fideo">
      {/* Él */}
      {l.t(l.c(112, 92, 12))}
      {rulos(l, [[104, 83, 5.5], [111, 79, 6], [119, 81, 5.5], [124, 87, 4.5], [102, 90, 4.5]])}
      {l.f(l.c(118, 92, 1.4))}
      {l.f("M92 112 C 98 106, 118 106, 124 112 L128 170 L88 170 Z")}
      {l.t("M120 120 C 128 134, 132 144, 134 150", 9)}
      {l.t(l.c(135, 153, 4), 2)}
      {l.t("M136 156 L141 165", 2)}

      {/* Ella */}
      {l.t(l.c(188, 93, 11))}
      {l.t("M177 91 C 177 79, 197 77, 199 89", 2.2)}
      {l.t("M198 87 C 204 100, 205 114, 201 126", 2)}
      {l.t("M195 85 C 201 100, 200 112, 197 122", 2)}
      {l.f(l.c(183, 94, 1.3))}
      {l.t("M176 112 C 182 108, 196 108, 202 112 L206 170 L172 170 Z")}
      {l.t("M178 118 C 172 132, 168 144, 166 150", 2.4)}
      {l.t(l.c(165, 153, 3.5), 2)}
      {l.t("M164 156 L159 165", 2)}

      {/* El fideo: sale de la boca de él, baja al plato y sube a la de ella */}
      {l.t("M123 99 C 132 122, 140 150, 150 158 C 160 150, 168 122, 177 99", 1.6)}
      {l.t("M150 66 C 144 60, 136 66, 150 76 C 164 66, 156 60, 150 66 Z", 1.8)}

      {/* La mesa */}
      {l.t("M40 170 L260 170")}
      {l.t(festón, 2)}
      {l.t("M72 204 L68 250", 2.4)}
      {l.t("M228 204 L232 250", 2.4)}
      {l.t("M120 166 C 120 158, 180 158, 180 166 C 180 172, 120 172, 120 166 Z", 2)}
      {l.t("M132 163 C 138 154, 146 166, 152 156 C 158 166, 164 154, 168 163", 1.6)}
      {l.t("M76 134 L92 134 C 92 146, 76 146, 76 134 Z", 2)}
      {l.f("M77 137 L91 137 C 90 143, 78 143, 77 137 Z")}
      {l.t("M84 145 L84 168", 2)}
      {l.t("M208 134 L224 134 C 224 146, 208 146, 208 134 Z", 2)}
      {l.f("M209 137 L223 137 C 222 143, 210 143, 209 137 Z")}
      {l.t("M216 145 L216 168", 2)}
    </Lienzo>
  );
}

/* ── 4 · Sosteniendo el cartel con el nombre del invitado ──────── */
export function Cartel({ children }: { children?: React.ReactNode }) {
  const l = lapiz();
  return (
    <div className="gb-cartel">
      <Lienzo titulo="Bruno y Martina sosteniendo un cartel">
        {/* Cabezas asomando por arriba del cartel */}
        {l.t(l.c(112, 66, 13))}
        {rulos(l, [[103, 56, 6], [111, 52, 6.5], [120, 54, 6], [126, 61, 5], [100, 64, 5]])}
        {l.f(l.c(108, 68, 1.4))}
        {l.f(l.c(116, 68, 1.4))}
        {l.t("M107 74 Q112 78 117 74", 1.8)}
        {l.t(l.c(190, 66, 12))}
        {l.t("M178 64 C 178 52, 200 50, 202 62", 2.2)}
        {l.t("M201 60 C 208 74, 210 88, 207 98", 2)}
        {l.t("M179 62 C 172 74, 171 86, 174 96", 2)}
        {l.f(l.c(186, 68, 1.3))}
        {l.f(l.c(194, 68, 1.3))}
        {l.t("M185 74 Q190 78 195 74", 1.8)}

        {/* Brazos que agarran el cartel por los costados */}
        {l.t("M72 146 C 58 132, 64 106, 82 93", 9)}
        {l.t(l.c(84, 91, 5), 2)}
        {l.t("M230 146 C 242 130, 238 106, 219 93", 2.6)}
        {l.t(l.c(217, 91, 4.5), 2)}

        {/* El cartel */}
        {l.t("M64 92 L236 90 L238 196 L62 198 Z", 3)}

        {/* Abajo: piernas de él, falda de ella */}
        {l.f("M90 198 L122 198 L120 250 L108 250 L106 214 L103 250 L91 250 Z")}
        {l.f("M88 248 L103 248 L103 255 L84 255 C 84 251, 86 249, 88 248 Z")}
        {l.f("M108 248 L120 248 C 123 249, 126 252, 126 255 L108 255 Z")}
        {l.t("M172 198 C 168 220, 164 240, 160 252 C 182 258, 206 258, 228 252 C 224 238, 220 220, 216 198")}
      </Lienzo>
      {/* El nombre del invitado, escrito encima del cartel. */}
      <div className="gb-cartel__texto">{children}</div>
    </div>
  );
}

/* ── Garabatos chicos ──────────────────────────────────────────── */

/** Papel picado dibujado: aparece cuando alguien confirma. */
export function Festejo() {
  const l = lapiz();
  return (
    <svg viewBox="0 0 300 300" className="gb-festejo" aria-hidden="true">
      {l.t("M40 60 L48 50", 2.4)}
      {l.t("M262 54 L254 44", 2.4)}
      {l.t("M30 130 L40 128", 2.4)}
      {l.t("M270 120 L260 124", 2.4)}
      {l.t("M70 30 C 64 22, 54 30, 70 40 C 86 30, 76 22, 70 30 Z", 2)}
      {l.t("M232 28 C 226 20, 216 28, 232 38 C 248 28, 238 20, 232 28 Z", 2)}
      {l.t(l.c(150, 22, 4), 2)}
      {l.t("M20 200 L30 196", 2.4)}
      {l.t("M280 196 L270 192", 2.4)}
      {l.t("M100 18 L104 10", 2)}
      {l.t("M200 16 L196 8", 2)}
    </svg>
  );
}

/** Moñito, para la vestimenta. */
export function Monio() {
  const l = lapiz();
  return (
    <svg viewBox="0 0 120 60" className="gb-mini" role="img" aria-label="Un moño">
      {l.f("M60 30 L22 12 C 16 10, 12 14, 12 20 L12 40 C 12 46, 16 50, 22 48 Z")}
      {l.f("M60 30 L98 12 C 104 10, 108 14, 108 20 L108 40 C 108 46, 104 50, 98 48 Z")}
      {l.t("M52 22 L68 22 L68 38 L52 38 Z", 2.4)}
    </svg>
  );
}

/** Un sobre con corazón, para los regalos. */
export function Sobre() {
  const l = lapiz();
  return (
    <svg viewBox="0 0 120 80" className="gb-mini" role="img" aria-label="Un sobre">
      {l.t("M12 14 L108 12 L110 70 L10 72 Z", 2.4)}
      {l.t("M12 14 L60 46 L108 12", 2.4)}
      {l.f("M60 40 C 55 34, 46 38, 60 50 C 74 38, 65 34, 60 40 Z")}
    </svg>
  );
}

/** Flechita hecha a mano, para las notas al margen. */
export function Flecha({ girar = 0 }: { girar?: number }) {
  return (
    <svg viewBox="0 0 80 50" className="gb-flecha" style={{ transform: `rotate(${girar}deg)` }} aria-hidden="true">
      <path d="M6 10 C 24 6, 52 12, 66 36" pathLength={1} className="gb-t" strokeWidth={2.2} style={{ "--i": 0 } as React.CSSProperties} />
      <path d="M56 32 L67 38 L69 26" pathLength={1} className="gb-t" strokeWidth={2.2} style={{ "--i": 1 } as React.CSSProperties} />
    </svg>
  );
}

/** Rayita ondulada que separa secciones, como un subrayado a mano. */
export function Rulito() {
  return (
    <svg viewBox="0 0 160 20" className="gb-rulito" aria-hidden="true">
      <path
        d="M4 12 C 18 2, 26 20, 40 10 C 54 0, 62 20, 78 10 C 92 1, 100 20, 116 10 C 130 2, 140 18, 156 9"
        pathLength={1}
        className="gb-t"
        strokeWidth={2.2}
        style={{ "--i": 0 } as React.CSSProperties}
      />
    </svg>
  );
}
