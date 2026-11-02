import Ornamento from "./Ornamento";

/** Título de sección: la script y la ramita debajo. Siempre igual, para que
    las secciones se lean como capítulos de la misma pieza. */
export default function TituloSeccion({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="inv-titulo">{children}</h2>
      <Ornamento className="mt-4" />
    </div>
  );
}
