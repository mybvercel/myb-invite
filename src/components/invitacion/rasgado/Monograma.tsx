/** Dos iniciales entrelazadas: una caligráfica sobre una romana. */
export default function Monograma({ letras, grande }: { letras: [string, string]; grande?: boolean }) {
  return (
    <span className={`rg-mono ${grande ? "rg-mono--grande" : ""}`} aria-hidden="true">
      <span className="rg-mono__romana">{letras[1]}</span>
      <span className="rg-mono__script">{letras[0]}</span>
    </span>
  );
}
