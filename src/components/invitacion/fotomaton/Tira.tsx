/**
 * La tira de fotomatón: papel fotográfico crema, tres cuadros en blanco y
 * negro y la fecha escrita abajo, como la imprimen las cabinas.
 *
 * Las fotos ya vienen procesadas (blanco y negro, grano, viñeta): ver
 * `.claude/skills/invitacion-fotomaton/scripts/procesar-fotos.py`.
 */
export default function Tira({ fotos, fecha }: { fotos: string[]; fecha: string }) {
  return (
    <div className="fm-tira">
      {fotos.map((f, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={f} src={f} alt={i === 0 ? "Fotos de la pareja en una tira de fotomatón" : ""} loading="eager" />
      ))}
      <p className="fm-tira__fecha">{fecha}</p>
    </div>
  );
}
