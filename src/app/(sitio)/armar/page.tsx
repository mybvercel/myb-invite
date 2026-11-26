import { redirect } from "next/navigation";

/** El formulario vive en la home. Este camino queda para los enlaces viejos. */
export default async function PaginaArmar({ searchParams }: { searchParams: Promise<{ m?: string | string[] }> }) {
  const { m } = await searchParams;
  const modelo = typeof m === "string" && /^[a-z0-9-]{1,40}$/.test(m) ? m : "";
  redirect(modelo ? `/?m=${modelo}#armar` : "/#armar");
}
