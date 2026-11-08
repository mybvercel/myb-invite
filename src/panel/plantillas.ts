import { idNuevo, norm } from "./logica";
import type { DocPanel, Etapa, Plantilla, Rubro, Tarea } from "./tipos";

/**
 * Los checklists de arranque. El organizador no empieza con la hoja en blanco:
 * se carga una lista armada según el evento y él borra lo que no usa.
 *
 * Cargar una plantilla es idempotente: sólo agrega lo que falta (se compara por
 * título normalizado), nunca borra ni repite lo que ya está o ya se tildó.
 */

type Fila = [Etapa, string, Rubro?];

const CASAMIENTO: Fila[] = [
  ["12m", "Definir el presupuesto total"],
  ["12m", "Armar la lista tentativa de invitados"],
  ["12m", "Elegir la fecha y reservar el salón", "salon"],
  ["12m", "Sacar turno en el Registro Civil", "ceremonia"],
  ["12m", "Reservar la iglesia o el lugar de la ceremonia", "ceremonia"],
  ["12m", "Decidir si contratan organizadora", "organizacion"],
  ["9m", "Contratar el catering (si el salón no lo incluye)", "catering"],
  ["9m", "Contratar fotografía", "fotografia"],
  ["9m", "Contratar video", "video"],
  ["9m", "Contratar DJ y música", "musica"],
  ["9m", "Contratar luces y sonido", "luces"],
  ["9m", "Contratar ambientación y flores", "ambientacion"],
  ["9m", "Elegir vestido y traje", "vestuario"],
  ["9m", "Mandar el save the date"],
  ["9m", "Elegir padrinos y testigos"],
  ["6m", "Mandar la invitación digital"],
  ["6m", "Contratar torta y mesa dulce", "torta"],
  ["6m", "Elegir los souvenirs", "souvenirs"],
  ["6m", "Contratar el cotillón", "cotillon"],
  ["6m", "Reservar maquillaje y peinado", "belleza"],
  ["6m", "Elegir las alianzas"],
  ["6m", "Definir los datos para el regalo (alias o lista)"],
  ["6m", "Organizar el traslado de los invitados", "transporte"],
  ["6m", "Ver alojamiento para los que vienen de afuera", "alojamiento"],
  ["6m", "Reservar la luna de miel"],
  ["3m", "Completar los trámites del Registro Civil", "ceremonia"],
  ["3m", "Hacer la degustación del menú", "catering"],
  ["3m", "Elegir las canciones de los momentos clave", "musica"],
  ["3m", "Confirmar horarios con cada proveedor"],
  ["3m", "Hacer la prueba de maquillaje y peinado", "belleza"],
  ["1m", "Llamar a los que no confirmaron"],
  ["1m", "Pasar el número final al catering", "catering"],
  ["1m", "Armar el plano de mesas y mandarlo al salón", "salon"],
  ["1m", "Armar el cronograma del día y mandarlo a los proveedores"],
  ["1m", "Pagar los saldos pendientes"],
  ["1m", "Última prueba de vestido y traje", "vestuario"],
  ["semana", "Retirar vestido y traje", "vestuario"],
  ["semana", "Preparar los sobres para pagar el día del evento"],
  ["semana", "Armar el bolso del día"],
  ["semana", "Confirmar los traslados", "transporte"],
  ["despues", "Agradecer a los invitados"],
  ["despues", "Dejar reseñas a los proveedores"],
  ["despues", "Descargar las fotos del álbum compartido"],
];

const QUINCE: Fila[] = [
  ["12m", "Definir el presupuesto total"],
  ["12m", "Armar la lista tentativa de invitados"],
  ["12m", "Elegir la fecha y reservar el salón", "salon"],
  ["12m", "Elegir el tema o la estética de la fiesta", "ambientacion"],
  ["9m", "Contratar el catering (si el salón no lo incluye)", "catering"],
  ["9m", "Contratar fotografía", "fotografia"],
  ["9m", "Contratar video", "video"],
  ["9m", "Contratar DJ y música", "musica"],
  ["9m", "Contratar luces y sonido", "luces"],
  ["9m", "Elegir el vestido de quince y el cambio de vestido", "vestuario"],
  ["9m", "Definir los momentos de la fiesta (vals, velas, entrada)"],
  ["6m", "Mandar la invitación digital"],
  ["6m", "Contratar ambientación y flores", "ambientacion"],
  ["6m", "Contratar torta y mesa dulce", "torta"],
  ["6m", "Elegir los souvenirs", "souvenirs"],
  ["6m", "Contratar el cotillón", "cotillon"],
  ["6m", "Contratar show o animación", "show"],
  ["6m", "Reservar maquillaje y peinado", "belleza"],
  ["6m", "Armar el video de fotos de la infancia", "video"],
  ["3m", "Empezar a ensayar el vals y la coreografía"],
  ["3m", "Hacer la degustación del menú", "catering"],
  ["3m", "Elegir las canciones de los momentos clave", "musica"],
  ["3m", "Confirmar horarios con cada proveedor"],
  ["1m", "Llamar a los que no confirmaron"],
  ["1m", "Pasar el número final al catering", "catering"],
  ["1m", "Armar el plano de mesas y mandarlo al salón", "salon"],
  ["1m", "Armar el cronograma del día y mandarlo a los proveedores"],
  ["1m", "Pagar los saldos pendientes"],
  ["1m", "Última prueba del vestido", "vestuario"],
  ["semana", "Retirar el vestido", "vestuario"],
  ["semana", "Preparar los sobres para pagar el día del evento"],
  ["semana", "Confirmar los traslados", "transporte"],
  ["despues", "Agradecer a los invitados"],
  ["despues", "Dejar reseñas a los proveedores"],
  ["despues", "Descargar las fotos del álbum compartido"],
];

const CUMPLE: Fila[] = [
  ["3m", "Definir el presupuesto y la cantidad de invitados"],
  ["3m", "Elegir la fecha y reservar el salón o armar el lugar", "salon"],
  ["3m", "Elegir el tema de la fiesta", "ambientacion"],
  ["3m", "Contratar el catering o definir el menú", "catering"],
  ["3m", "Contratar música o DJ", "musica"],
  ["1m", "Mandar la invitación digital"],
  ["1m", "Encargar la torta", "torta"],
  ["1m", "Elegir ambientación y decoración", "ambientacion"],
  ["1m", "Elegir los souvenirs", "souvenirs"],
  ["1m", "Contratar fotografía", "fotografia"],
  ["1m", "Llamar a los que no confirmaron"],
  ["semana", "Pasar el número final al catering", "catering"],
  ["semana", "Armar el cronograma del día"],
  ["semana", "Confirmar horarios con cada proveedor"],
  ["dia", "Llevar la torta, los souvenirs y la decoración"],
  ["despues", "Agradecer a los invitados"],
  ["despues", "Descargar las fotos del álbum compartido"],
];

const EMPRESA: Fila[] = [
  ["3m", "Definir objetivo, público y presupuesto"],
  ["3m", "Elegir fecha y reservar el lugar", "salon"],
  ["3m", "Contratar el catering", "catering"],
  ["3m", "Armar la agenda y confirmar a los oradores"],
  ["1m", "Mandar la invitación digital"],
  ["1m", "Contratar sonido, pantalla y proyector", "luces"],
  ["1m", "Contratar fotografía", "fotografia"],
  ["1m", "Contratar video", "video"],
  ["1m", "Definir el registro y la acreditación en la puerta", "organizacion"],
  ["1m", "Encargar el merchandising", "souvenirs"],
  ["1m", "Llamar a los que no confirmaron"],
  ["semana", "Pasar el número final al catering", "catering"],
  ["semana", "Confirmar horarios con cada proveedor"],
  ["semana", "Probar la técnica en el lugar", "luces"],
  ["dia", "Acreditación y bienvenida"],
  ["despues", "Mandar el agradecimiento y el material a los asistentes"],
  ["despues", "Armar el informe del evento"],
];

export const PLANTILLAS: { id: Plantilla; nombre: string; detalle: string; filas: Fila[] }[] = [
  { id: "casamiento", nombre: "Casamiento", detalle: `${CASAMIENTO.length} tareas, desde un año antes`, filas: CASAMIENTO },
  { id: "quince", nombre: "Quince", detalle: `${QUINCE.length} tareas, desde un año antes`, filas: QUINCE },
  { id: "cumple", nombre: "Cumpleaños", detalle: `${CUMPLE.length} tareas, desde tres meses antes`, filas: CUMPLE },
  { id: "empresa", nombre: "Evento de empresa", detalle: `${EMPRESA.length} tareas, desde tres meses antes`, filas: EMPRESA },
];

/** Agrega las tareas de la plantilla que todavía no estén. No toca nada más. */
export function aplicarPlantilla(doc: DocPanel, id: Plantilla): DocPanel {
  const p = PLANTILLAS.find((x) => x.id === id);
  if (!p) return doc;
  const hay = new Set(doc.tareas.map((t) => norm(t.titulo)));
  const nuevas: Tarea[] = p.filas
    .filter(([, titulo]) => !hay.has(norm(titulo)))
    .map(([etapa, titulo, rubro]) => ({
      id: idNuevo(),
      titulo,
      hecha: false,
      hechaEl: "",
      etapa,
      vence: "",
      responsableId: null,
      rubro: rubro ?? null,
      notas: "",
      origen: "plantilla",
    }));
  return { ...doc, plantilla: id, tareas: [...doc.tareas, ...nuevas] };
}
