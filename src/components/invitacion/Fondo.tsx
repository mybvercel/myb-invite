/**
 * El fondo de una sección: el lavado de color y la textura de papel.
 *
 * Las dos capas van con `.inv-capa`, que las desvanece antes de llegar al
 * borde. Ese detalle es todo: si una capa de fondo llega opaca al final de la
 * sección, en la juntura con la siguiente aparece una línea recta.
 *
 * Por eso tampoco hay ondas ni separadores: cualquier forma pintada entre dos
 * secciones es una franja de color liso, y se ve como un corte blanco.
 */

/** El asset del papel es horizontal y compartido. Cada sección lo encuadra en
    otra parte para que las manchas no caigan siempre en el mismo lugar. */
const ENCUADRES = ["0% 0%", "100% 30%", "20% 100%", "80% 70%", "50% 15%"] as const;

export default function Fondo({
  variante = "claro",
  encuadre = 0,
  fin = false,
}: {
  variante?: "claro" | "hondo";
  encuadre?: number;
  /** La última sección de la invitación: no se desvanece abajo. */
  fin?: boolean;
}) {
  const capa = `inv-capa${fin ? " inv-capa--fin" : ""}`;

  return (
    <>
      <div
        aria-hidden="true"
        className={`${capa} ${variante === "hondo" ? "inv-lavado--hondo" : "inv-lavado"}`}
      />
      <div
        aria-hidden="true"
        className={capa}
        style={{
          backgroundImage: "url('/invitaciones/papel.jpg')",
          backgroundSize: "cover",
          backgroundPosition: ENCUADRES[encuadre % ENCUADRES.length],
          mixBlendMode: "multiply",
          opacity: 0.55,
        }}
      />
    </>
  );
}
