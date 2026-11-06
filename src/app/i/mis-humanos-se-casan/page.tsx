import type { Metadata } from "next";
import BotonVolver from "@/components/invitacion/BotonVolver";

const recursos = "/invitaciones/demo/mis-humanos-se-casan";

export const metadata: Metadata = {
  title: "Mis humanos se casan · Inés y Matías",
  description: "Dos testigos de cuatro patas abren la invitación de Inés y Matías.",
  openGraph: {
    title: "Mis humanos se casan",
    description: "La invitación de Inés y Matías.",
    images: [recursos + "/miniatura.webp"],
  },
};

export default function MisHumanosSeCasan() {
  return (
    <>
      <BotonVolver catalogo="/" />
      <iframe
        title="Invitación de casamiento de Inés y Matías"
        src={recursos + "/index.html"}
        style={{ display: "block", width: "100%", height: "100dvh", border: 0 }}
      />
    </>
  );
}
