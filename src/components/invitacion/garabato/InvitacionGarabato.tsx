"use client";

import { useEffect, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionGarabato as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";
import { Anillo, Brindis, Cartel, Comiendo, Festejo, Flecha, Monio, Rulito, Sobre } from "./Dibujos";

/**
 * Estilo "Garabato": una invitación dibujada a mano, con una sola tinta roja
 * sobre papel crudo y un marco de pinceladas.
 *
 * La pareja acompaña todo el recorrido y cambia en cada parte: brinda arriba
 * de la torta, se pone el anillo, comparte un fideo y, al final, sostiene un
 * cartel donde se escribe en vivo el nombre de quien confirma. Cada dibujo se
 * traza solo, como con lapicera, cuando entra en pantalla.
 *
 * Criterios: .claude/skills/invitacion-garabato/SKILL.md
 */

function Escena({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-8%");
  return (
    <section ref={ref} data-visible={visible} className={`gb-escena ${className}`}>
      {children}
    </section>
  );
}

/** Una nota al margen, en birome, con su flechita. */
function Nota({ texto, lado }: { texto: string; lado: "izq" | "der" }) {
  return (
    <p className={`gb-nota gb-nota--${lado}`}>
      {texto}
      <Flecha girar={lado === "izq" ? 20 : 160} />
    </p>
  );
}

function Copiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <p className="gb-dato">
      <span className="gb-datos">{etiqueta}</span>
      <span className="gb-dato__valor">{valor}</span>
      <button
        type="button"
        className="gb-copiar"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(valor);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2200);
          } catch {
            // Sin permiso de portapapeles el dato igual está a la vista.
          }
        }}
      >
        {copiado ? "¡copiado!" : "copiar"}
      </button>
    </p>
  );
}

function Rsvp({ slug, cierre, personal }: { slug: string; cierre?: string; personal?: Personal }) {
  const r = usarRsvp({ slug, personal });
  const quien = (personal?.nombre ?? r.nombre).trim();

  // Lo que dice el cartel: el nombre en vivo mientras se escribe, y el
  // festejo cuando la confirmación quedó guardada.
  const cartel = r.enviado
    ? r.asiste
      ? `¡${quien || "Vos"} viene!`
      : `¡Te vamos a extrañar, ${quien || "che"}!`
    : quien || "tu nombre acá";

  return (
    <Escena className="gb-rsvp">
      <h2 className="gb-titulo">¿Venís?</h2>
      {cierre && <p className="gb-texto gb-angosto">{cierre}</p>}

      <div className="gb-dibujo gb-dibujo--cartel">
        <Nota texto="escribí tu nombre y lo levantamos nosotros" lado="izq" />
        <Cartel>
          <span className={`gb-cartel__nombre${quien || r.enviado ? "" : " gb-cartel__nombre--vacio"}`}>{cartel}</span>
        </Cartel>
        {r.enviado && r.asiste && (
          <div className="gb-festejo-capa" data-visible="true">
            <Festejo />
          </div>
        )}
      </div>

      {r.cerrado && !personal ? (
        <p className="gb-texto gb-angosto">Esta invitación es personal. Confirmá desde el link que te mandaron los novios.</p>
      ) : r.enviado ? (
        <div className="gb-respuesta">
          <p className="gb-texto">
            {r.asiste
              ? personal
                ? `Anotamos ${r.acompanantes === 1 ? "1 persona" : `${r.acompanantes} personas`}. Falta poco.`
                : `Ya estás en la lista${r.acompanantes > 1 ? ` con ${r.acompanantes - 1} más` : ""}. Falta poco.`
              : "Gracias por avisar."}
          </p>
          {personal && (
            <button
              type="button"
              className="gb-enlace"
              onClick={() => {
                r.setEnviado(false);
                r.abrir();
              }}
            >
              cambiar la respuesta
            </button>
          )}
        </div>
      ) : (
        <div ref={r.formRef} className="gb-formulario">
          {!personal && (
            <label className="gb-campo">
              <span className="gb-datos">Tu nombre</span>
              <input
                value={r.nombre}
                onChange={(e) => r.setNombre(e.target.value)}
                placeholder="Nombre y apellido"
                autoComplete="name"
                maxLength={40}
              />
            </label>
          )}

          <fieldset className="gb-campo">
            <legend className="gb-datos">{personal ? "¿Vienen?" : "¿Venís?"}</legend>
            {[
              [true, "¡Sí, ahí estoy!"],
              [false, "No puedo, los quiero igual"],
            ].map(([valor, texto]) => (
              <button
                key={String(valor)}
                type="button"
                className="gb-opcion"
                aria-pressed={r.asiste === valor}
                onClick={() => r.setAsiste(valor as boolean)}
              >
                <span className="gb-circulo" aria-hidden="true" />
                {texto as string}
              </button>
            ))}
          </fieldset>

          {r.asiste === true && (
            <>
              {(!personal || r.cupo > 1) && (
                <label className="gb-campo">
                  <span className="gb-datos">{personal && r.cupo > 1 ? `Cuántos van, de ${r.cupo}` : "Cuántos son"}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={r.cupo}
                    value={r.acompanantes}
                    onChange={(e) => r.setAcompanantes(Number(e.target.value))}
                  />
                </label>
              )}

              <fieldset className="gb-campo">
                <legend className="gb-datos">¿Algo que no comas?</legend>
                {COMIDAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="gb-opcion"
                    aria-pressed={r.comidas.includes(c)}
                    onClick={() => r.alternarComida(c)}
                  >
                    <span className="gb-circulo" aria-hidden="true" />
                    {c}
                  </button>
                ))}
              </fieldset>

              {!personal && (
                <label className="gb-campo">
                  <span className="gb-datos">Un tema para bailar</span>
                  <input value={r.cancion} onChange={(e) => r.setCancion(e.target.value)} placeholder="Tema y artista" />
                </label>
              )}
            </>
          )}

          {r.falta && (!r.nombre.trim() || r.asiste === null) && (
            <p className="gb-aviso">Falta tu nombre y si venís</p>
          )}
          {r.errorEnvio && (
            <p role="alert" className="gb-aviso">
              {r.errorEnvio}
            </p>
          )}

          <button type="button" className="gb-boton" onClick={r.enviar} disabled={r.enviando}>
            {r.enviando ? "anotando…" : "¡me anoto!"}
          </button>
        </div>
      )}
    </Escena>
  );
}

export default function InvitacionGarabato({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const [uno, dos] = invitacion.nombres.split("&").map((n) => n.trim());
  const ceremonia = invitacion.lugares?.find((l) => l.tipo === "Ceremonia" || l.tipo === "Civil");
  const fiesta = invitacion.lugares?.find((l) => l.tipo === "Fiesta");
  const lugarPortada = fiesta ?? ceremonia;

  // Sólo días: un dibujo no cuenta segundos.
  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => {
    setDias(calcularFaltante(parsearFecha(invitacion.fecha))?.d ?? 0);
  }, [invitacion.fecha]);

  return (
    <main className="inv-columna gb">
      {/* ── Portada ── */}
      <Escena className="gb-portada">
        <span className="gb-borde gb-borde--arriba" aria-hidden="true" />
        <h1 className="gb-pareja">
          <span className="gb-nombre">{uno}</span>
          <span className="gb-y">y</span>
          <span className="gb-nombre">{dos}</span>
        </h1>
        <p className="gb-datos gb-volanta">{invitacion.volanta}</p>
        <div className="gb-dibujo gb-dibujo--portada">
          <Brindis />
        </div>
        <p className="gb-datos gb-fecha">{invitacion.fecha.replace(/ (\d{4})$/, " de $1")}</p>
        {lugarPortada && (
          <p className="gb-datos gb-lugar">
            {lugarPortada.titulo}
            <br />
            {lugarPortada.direccion.split(",").slice(-2).join(",").trim()}
          </p>
        )}
      </Escena>

      {personal && (
        <Escena className="gb-saludo">
          <p className="gb-firma-grande">{personal.saludo}</p>
          {personal.nota && <p className="gb-texto gb-angosto">{personal.nota}</p>}
        </Escena>
      )}

      {/* ── Cuenta regresiva: sólo días ── */}
      <Escena className="gb-faltan">
        <Rulito />
        <p className="gb-faltan__texto">
          <span className="gb-firma">faltan</span>
          <span className="gb-faltan__n">{dias ?? "··"}</span>
          <span className="gb-firma">días</span>
        </p>
        <Rulito />
      </Escena>

      {/* ── Ceremonia: el anillo ── */}
      {ceremonia && (
        <Escena>
          <h2 className="gb-titulo">El sí</h2>
          <div className="gb-dibujo">
            <Nota texto="acá nos ponemos los anillos" lado="der" />
            <Anillo />
          </div>
          <p className="gb-hora">{ceremonia.hora}</p>
          <p className="gb-datos">{ceremonia.titulo}</p>
          <p className="gb-texto gb-angosto">{ceremonia.direccion}</p>
          <a className="gb-boton" href={ceremonia.mapa} target="_blank" rel="noopener noreferrer">
            cómo llegar
          </a>
        </Escena>
      )}

      {/* ── Fiesta: comiendo ── */}
      {(fiesta || invitacion.cronograma) && (
        <Escena>
          <h2 className="gb-titulo">La fiesta</h2>
          <div className="gb-dibujo">
            <Nota texto="compartimos hasta el último fideo" lado="izq" />
            <Comiendo />
          </div>

          {invitacion.cronograma && (
            <ul className="gb-programa">
              {invitacion.cronograma.map((h, i) => (
                <li key={`${h.hora}-${h.titulo}-${i}`}>
                  <span className="gb-programa__hora">{h.hora}</span>
                  <span className="gb-programa__que">{h.titulo}</span>
                </li>
              ))}
            </ul>
          )}

          {fiesta && fiesta !== ceremonia && (
            <>
              <p className="gb-datos">{fiesta.titulo}</p>
              <p className="gb-texto gb-angosto">{fiesta.direccion}</p>
              <a className="gb-boton" href={fiesta.mapa} target="_blank" rel="noopener noreferrer">
                cómo llegar
              </a>
            </>
          )}
        </Escena>
      )}

      {/* ── Vestimenta ── */}
      {invitacion.dressCode && (
        <Escena>
          <div className="gb-dibujo gb-dibujo--mini">
            <Monio />
          </div>
          <h2 className="gb-titulo">{invitacion.dressCode.titulo}</h2>
          <p className="gb-texto gb-angosto">{invitacion.dressCode.detalle}</p>
        </Escena>
      )}

      {/* ── Regalos ── */}
      {invitacion.regalo && (
        <Escena>
          <div className="gb-dibujo gb-dibujo--mini">
            <Sobre />
          </div>
          <h2 className="gb-titulo">Regalos</h2>
          <p className="gb-texto gb-angosto">{invitacion.regalo.mensaje}</p>
          <div className="gb-regalo">
            <Copiable etiqueta="Alias" valor={invitacion.regalo.alias} />
            <Copiable etiqueta="CBU" valor={invitacion.regalo.cbu} />
            <p className="gb-datos gb-regalo__titular">
              {invitacion.regalo.titular} · {invitacion.regalo.banco}
            </p>
          </div>
        </Escena>
      )}

      {/* ── RSVP: el cartel ── */}
      <Rsvp slug={invitacion.slug} cierre={invitacion.cierreRsvp} personal={personal} />

      {/* ── Cierre ── */}
      <Escena className="gb-cierre">
        <h2 className="gb-titulo">¡Nos vemos!</h2>
        <p className="gb-pareja gb-pareja--chica">
          <span className="gb-nombre">{uno}</span>
          <span className="gb-y">y</span>
          <span className="gb-nombre">{dos}</span>
        </p>
        <p className="gb-datos">{invitacion.fecha.replace(/ (\d{4})$/, " de $1")}</p>
        <span className="gb-borde gb-borde--abajo" aria-hidden="true" />
      </Escena>
    </main>
  );
}
