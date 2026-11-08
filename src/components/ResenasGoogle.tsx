import { GOOGLE_ESCRIBIR, GOOGLE_RESUMEN, GOOGLE_VER, RESENAS } from "@/lib/invitaciones";

/**
 * Reseñas con el formato de Google: avatar de color con la inicial, nombre,
 * cuándo la dejó, estrellas y el texto. Sólo se muestran reseñas reales,
 * cargadas a mano en RESENAS; sin reseñas la sección no aparece.
 */

const COLORES = ["#1a73e8", "#d93025", "#188038", "#e37400", "#9334e6", "#007b83"];

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function Estrellas({ n }: { n: number }) {
  return (
    <span className="tid-gr__estrellas" role="img" aria-label={`${n} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className={i <= n ? "" : "tid-gr__vacia"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function ResenasGoogle() {
  if (RESENAS.length === 0) return null;

  return (
    <section className="tid-seccion">
      <div className="tid-marco">
        <div className="tid-gr__cabeza">
          <div className="tid-gr__marca">
            <GoogleG size={30} />
            <div>
              <h2 className="tid-gr__titulo">Reseñas de Google</h2>
              {GOOGLE_RESUMEN && (
                <p className="tid-gr__resumen">
                  <b>{GOOGLE_RESUMEN.puntaje.toFixed(1).replace(".", ",")}</b>
                  <Estrellas n={Math.round(GOOGLE_RESUMEN.puntaje)} />
                  <span>{GOOGLE_RESUMEN.cantidad} reseñas</span>
                </p>
              )}
            </div>
          </div>
          <div className="tid-gr__acciones">
            <a href={GOOGLE_VER} target="_blank" rel="noopener noreferrer" className="tid-gr__boton">
              Ver todas en Google
            </a>
            <a href={GOOGLE_ESCRIBIR} target="_blank" rel="noopener noreferrer" className="tid-gr__boton tid-gr__boton--lleno">
              Escribir una reseña
            </a>
          </div>
        </div>

        <ul className="tid-gr__lista">
          {RESENAS.map((r, i) => (
            <li key={r.nombre} className="tid-gr__tarjeta">
              <div className="tid-gr__quien">
                <span className="tid-gr__avatar" style={{ background: COLORES[i % COLORES.length] }} aria-hidden="true">
                  {r.nombre.trim().charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="tid-gr__nombre">{r.nombre}</p>
                  <p className="tid-gr__evento">{r.evento}</p>
                </div>
                <span className="tid-gr__g">
                  <GoogleG size={18} />
                </span>
              </div>
              <div className="tid-gr__linea">
                <Estrellas n={r.estrellas ?? 5} />
                {r.cuando && <span className="tid-gr__cuando">{r.cuando}</span>}
              </div>
              <p className="tid-gr__texto">{r.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
