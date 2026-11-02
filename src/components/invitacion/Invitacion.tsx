import type { Invitacion as Datos } from "@/invitaciones/tipos";
import Carta from "./Carta";
import InvitacionFotomaton from "./fotomaton/InvitacionFotomaton";
import InvitacionCinta from "./cinta/InvitacionCinta";
import InvitacionMesa from "./mesa/InvitacionMesa";
import InvitacionCiudad from "./ciudad/InvitacionCiudad";
import InvitacionScrapbook from "./scrapbook/InvitacionScrapbook";
import InvitacionCeramica from "./ceramica/InvitacionCeramica";
import InvitacionHorizonte from "./horizonte/InvitacionHorizonte";
import InvitacionSobremesa from "./sobremesa/InvitacionSobremesa";
import InvitacionGarabato from "./garabato/InvitacionGarabato";
import Hero from "./Hero";
import type { Personal } from "./personal";
import SeccionCierre from "./SeccionCierre";
import SeccionCronograma from "./SeccionCronograma";
import SeccionFrase from "./SeccionFrase";
import SeccionLugares from "./SeccionLugares";
import SeccionRegalos from "./SeccionRegalos";
import SeccionRsvp from "./SeccionRsvp";
import SeccionSaludo from "./SeccionSaludo";
import SeccionVestimenta from "./SeccionVestimenta";

/**
 * La invitación entera. La usan la general (/i/<slug>) y las personales
 * (/i/<slug>/para/<token>): son la misma pieza, la personal suma el saludo
 * debajo de la portada y un formulario que ya sabe quién es.
 */
export default function Invitacion({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  if (invitacion.estilo === "fotomaton") {
    return <InvitacionFotomaton invitacion={invitacion} personal={personal} />;
  }
  if (invitacion.estilo === "ceramica") {
    return <InvitacionCeramica invitacion={invitacion} personal={personal} />;
  }
  if (invitacion.estilo === "horizonte") {
    return <InvitacionHorizonte invitacion={invitacion} personal={personal} />;
  }
  if (invitacion.estilo === "sobremesa") {
    return <InvitacionSobremesa invitacion={invitacion} personal={personal} />;
  }
  if (invitacion.estilo === "scrapbook") {
    return <InvitacionScrapbook invitacion={invitacion} personal={personal} />;
  }
  if (invitacion.estilo === "ciudad") {
    return <InvitacionCiudad invitacion={invitacion} personal={personal} />;
  }
  if (invitacion.estilo === "mesa") {
    return <InvitacionMesa invitacion={invitacion} personal={personal} />;
  }
  if (invitacion.estilo === "cinta") {
    return <InvitacionCinta invitacion={invitacion} personal={personal} />;
  }
  if (invitacion.estilo === "garabato") {
    return <InvitacionGarabato invitacion={invitacion} personal={personal} />;
  }

  return (
    <Carta datos={invitacion.carta}>
      <main className="inv-columna inv-grano">
        <Hero invitacion={invitacion} />

        {personal && <SeccionSaludo saludo={personal.saludo} nota={personal.nota} />}

        {invitacion.frase && (
          <SeccionFrase frase={invitacion.frase} fecha={invitacion.fecha} flores={invitacion.flores?.[0]} />
        )}

        {invitacion.cronograma && (
          <SeccionCronograma hitos={invitacion.cronograma} flores={invitacion.flores?.[1] ?? invitacion.flores?.[0]} />
        )}

        {invitacion.lugares && (
          <SeccionLugares
            lugares={invitacion.lugares}
            ilustracion={invitacion.ilustracionLugar}
            flores={invitacion.flores?.[2] ?? invitacion.flores?.[0]}
          />
        )}

        {invitacion.dressCode && (
          <SeccionVestimenta
            titulo={invitacion.dressCode.titulo}
            detalle={invitacion.dressCode.detalle}
            ilustracion={invitacion.ilustracionVestimenta}
            flores={invitacion.flores?.[0]}
          />
        )}

        {invitacion.regalo && <SeccionRegalos regalo={invitacion.regalo} flores={invitacion.flores?.[1]} />}

        <SeccionRsvp
          slug={invitacion.slug}
          sello={invitacion.sello}
          cierre={invitacion.cierreRsvp}
          flores={invitacion.flores?.[2]}
          personal={personal}
        />

        {/* La galería queda fuera de este modelo a propósito: Rosa se sostiene
            con el diseño y no con fotos de la pareja. */}
        <SeccionCierre nombres={invitacion.nombres} fecha={invitacion.fecha} flores={invitacion.flores?.[0]} />
      </main>
    </Carta>
  );
}
