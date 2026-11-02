import { fechaConPuntos } from "@/invitaciones/fecha";
import type { InvitacionFotomaton as Datos } from "@/invitaciones/tipos";
import type { Personal } from "../personal";
import Collage from "./Collage";
import Funcion from "./Funcion";
import Portada from "./Portada";

/**
 * La invitación en estilo fotomatón.
 *
 * La portada con la cabina, el collage con la cuenta regresiva, y "La
 * función": la información como objetos de papel sobre el mismo terciopelo.
 * Todo comparte un único fondo (`.fm-fondo`), así no hay junturas.
 *
 * La lógica del RSVP es la misma de Rosa (`usarRsvp`): cambia la piel, no el
 * cerebro. Los links personales y el panel andan igual en todos los estilos.
 */
export default function InvitacionFotomaton({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const { fotomaton: fm } = invitacion;
  const fechaPuntos = fechaConPuntos(invitacion.fecha);

  return (
    <Portada volanta={invitacion.volanta} nombres={invitacion.nombres} tira={fm.tira} fecha={fechaPuntos} musica={invitacion.musica}>
      <main className="inv-columna inv-grano fm fm-fondo">
        <Collage
          nombres={invitacion.nombres}
          tira={fm.tira}
          fecha={invitacion.fecha}
          fechaPuntos={fechaPuntos}
          iniciales={fm.iniciales}
        />

        <Funcion invitacion={invitacion} personal={personal} />
      </main>
    </Portada>
  );
}
