/**
 * Las cenefas florales de una sección.
 *
 * Van en dos esquinas opuestas y nunca en las cuatro: cuatro esquinas iguales
 * es marco de diploma. La de abajo va espejada, así la misma imagen se lee
 * como dos ornamentos distintos.
 *
 * Si la invitación todavía no tiene el asset cargado, no se rompe nada: la
 * sección se sostiene con el lavado de acuarela del fondo.
 */
export default function Flores({ src }: { src?: string }) {
  if (!src) return null;

  return (
    // Sin `overflow-hidden`: recortaba las flores al ras del borde de la
    // sección y ese corte recto sobre un pétalo era otra de las líneas que se
    // veían. Lo que se desborda hacia abajo pasa a la sección siguiente, que
    // es justo lo que hace que la hoja se lea continua. El corte lateral lo
    // resuelve el `overflow-x: clip` de la columna.
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* eslint-disable @next/next/no-img-element */}
      <img src={src} alt="" className="inv-flor -top-8 -left-5" />

      {/* Rotada 180°: la guirnalda queda del lado derecho y sube desde abajo,
          que es el espejo real de la de arriba. Un scaleX la dejaría con las
          flores del lado equivocado del recuadro. Más chica y más tenue para
          que no se lea como la misma imagen repetida. */}
      <img
        src={src}
        alt=""
        className="inv-flor -right-5 -bottom-6"
        style={{ transform: "rotate(180deg)", opacity: 0.62, width: "clamp(7rem,36%,11rem)" }}
      />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}
