"use client";

import { useEffect, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionCinta as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";
import { Anillos, Brindis, Cinta, Copas, Corazon, Disco, Estrella, Lazo, Pegatina, Pizza, Sobre } from "./Dibujos";

/**
 * Estilo "Cinta": un flyer de fiesta dibujado a mano, en dos tintas (rojo
 * cereza y naranja azafrán) sobre crema, con un marco de pinceladas gruesas.
 *
 * Una cinta roja ondulada acompaña toda la página y se traza sola a medida
 * que se baja. Los doodles caen como pegatinas, la bola de disco se balancea
 * (y al tocarla llueven corazones) y, para confirmar, dos manos con copas se
 * acercan y brindan. Criterios: .claude/skills/invitacion-cinta/SKILL.md
 */

function Escena({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-8%");
  return (
    <section ref={ref} data-visible={visible} className={`cn-escena ${className}`}>
      {children}
    </section>
  );
}

/** Lluvia de corazones y estrellas al tocar la bola de disco. */
function Lluvia({ ronda }: { ronda: number }) {
  if (!ronda) return null;
  return (
    <div key={ronda} className="cn-lluvia" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          style={{ "--x": `${(i * 53) % 100}%`, "--r": `${((i * 37) % 60) - 30}deg`, "--t": `${1.6 + ((i * 7) % 10) / 8}s`, "--d": `${(i % 6) * 90}ms` } as React.CSSProperties}
        >
          {i % 3 ? "♥" : "✦"}
        </span>
      ))}
    </div>
  );
}

function Copiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <p className="cn-dato">
      <span className="cn-chico">{etiqueta}</span>
      <span className="cn-dato__valor">{valor}</span>
      <button
        type="button"
        className="cn-enlace"
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
  const brindan = r.enviado && r.asiste === true;

  return (
    <Escena className="cn-rsvp">
      <h2 className="cn-titulo">¿Brindamos?</h2>
      {cierre && <p className="cn-texto cn-angosto">{cierre}</p>}

      <div className="cn-brindis">
        <Brindis juntos={brindan} />
      </div>

      {r.cerrado && !personal ? (
        <p className="cn-texto cn-angosto">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
      ) : r.enviado ? (
        <div className="cn-respuesta">
          <p className="cn-script">{r.asiste ? "¡Salud!" : "Gracias por avisar"}</p>
          <p className="cn-texto">
            {r.asiste
              ? personal
                ? `Anotamos ${r.acompanantes === 1 ? "1 persona" : `${r.acompanantes} personas`}. Falta poco.`
                : `Ya estás en la lista${r.acompanantes > 1 ? ` con ${r.acompanantes - 1} más` : ""}. Falta poco.`
              : "Te vamos a extrañar."}
          </p>
          {personal && (
            <button type="button" className="cn-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
              cambiar la respuesta
            </button>
          )}
        </div>
      ) : (
        <div ref={r.formRef} className="cn-formulario">
          {!personal && (
            <label className="cn-campo">
              <span className="cn-chico">Tu nombre</span>
              <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} placeholder="Nombre y apellido" autoComplete="name" maxLength={40} />
            </label>
          )}

          <fieldset className="cn-campo">
            <legend className="cn-chico">{personal ? "¿Vienen?" : "¿Venís?"}</legend>
            {[[true, "¡Obvio, ahí estoy!"], [false, "No puedo, los quiero igual"]].map(([valor, texto]) => (
              <button key={String(valor)} type="button" className="cn-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                <span className="cn-casilla" aria-hidden="true" />
                {texto as string}
              </button>
            ))}
          </fieldset>

          {r.asiste === true && (
            <>
              {(!personal || r.cupo > 1) && (
                <label className="cn-campo">
                  <span className="cn-chico">{personal && r.cupo > 1 ? `Cuántos van, de ${r.cupo}` : "Cuántos son"}</span>
                  <input type="number" inputMode="numeric" min={1} max={r.cupo} value={r.acompanantes} onChange={(e) => r.setAcompanantes(Number(e.target.value))} />
                </label>
              )}
              <fieldset className="cn-campo">
                <legend className="cn-chico">¿Algo que no comas?</legend>
                {COMIDAS.map((c) => (
                  <button key={c} type="button" className="cn-opcion" aria-pressed={r.comidas.includes(c)} onClick={() => r.alternarComida(c)}>
                    <span className="cn-casilla" aria-hidden="true" />
                    {c}
                  </button>
                ))}
              </fieldset>
              {!personal && (
                <label className="cn-campo">
                  <span className="cn-chico">El tema que no puede faltar</span>
                  <input value={r.cancion} onChange={(e) => r.setCancion(e.target.value)} placeholder="Tema y artista" />
                </label>
              )}
            </>
          )}

          {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="cn-aviso">Falta tu nombre y si venís</p>}
          {r.errorEnvio && <p role="alert" className="cn-aviso">{r.errorEnvio}</p>}

          <button type="button" className="cn-boton" onClick={r.enviar} disabled={r.enviando}>
            {r.enviando ? "brindando…" : "¡confirmo!"}
          </button>
        </div>
      )}
    </Escena>
  );
}

export default function InvitacionCinta({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const [uno, dos] = invitacion.nombres.split("&").map((n) => n.trim());
  const ceremonia = invitacion.lugares?.find((l) => l.tipo === "Ceremonia" || l.tipo === "Civil");
  const fiesta = invitacion.lugares?.find((l) => l.tipo === "Fiesta");
  const principal = fiesta ?? ceremonia;
  const fechaLarga = invitacion.fecha.replace(/ (\d{4})$/, " de $1");

  const [dias, setDias] = useState<number | null>(null);
  const [ronda, setRonda] = useState(0);
  useEffect(() => {
    setDias(calcularFaltante(parsearFecha(invitacion.fecha))?.d ?? 0);
  }, [invitacion.fecha]);

  return (
    <main className="inv-columna cn">
      {/* Pincel seco: come los bordes de las letras, como una brocha casi sin
          pintura. Se define una vez y lo usan los nombres y los títulos. */}
      <svg width="0" height="0" className="cn-defs" aria-hidden="true">
        <filter id="cn-seco" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="2" seed="6" result="r" />
          <feColorMatrix in="r" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.7" result="manchas" />
          <feComposite in="SourceGraphic" in2="manchas" operator="in" />
        </filter>
      </svg>
      <Cinta />
      <Lluvia ronda={ronda} />

      {/* ── Portada ── */}
      <Escena className="cn-portada">
        <Pegatina className="cn-anillos" giro={-8} retardo={500}><Anillos /></Pegatina>
        <button type="button" className="cn-disco" onClick={() => setRonda((n) => n + 1)} aria-label="Tocá la bola de disco">
          <Pegatina giro={0} retardo={650}><Disco /></Pegatina>
        </button>

        <h1 className="cn-pareja">
          <span className="cn-nombre cn-nombre--uno">{uno}</span>
          <span className="cn-amper">&amp;</span>
          <span className="cn-nombre cn-nombre--dos">{dos}</span>
        </h1>

        <Pegatina className="cn-copas" giro={4} retardo={800}><Copas /></Pegatina>

        <p className="cn-script cn-invitan">te invitamos a nuestra fiesta de casamiento</p>
        <Pegatina className="cn-chiquito" giro={10} retardo={900}><Corazon /></Pegatina>

        <p className="cn-serif cn-fecha">{fechaLarga}</p>
        {principal && (
          <>
            <p className="cn-serif">{principal.hora} hs en adelante</p>
            <p className="cn-serif">{principal.titulo}, {principal.direccion.split(",").slice(-2).join(",").trim()}</p>
          </>
        )}
      </Escena>

      {personal && (
        <Escena className="cn-saludo">
          <p className="cn-script cn-grande">{personal.saludo}</p>
          {personal.nota && <p className="cn-texto cn-angosto">{personal.nota}</p>}
        </Escena>
      )}

      {/* ── Faltan ── */}
      <Escena className="cn-faltan">
        <Pegatina giro={-6}><Estrella /></Pegatina>
        <p className="cn-faltan__fila">
          <span className="cn-script">faltan</span>
          <span className="cn-faltan__n">{dias ?? "··"}</span>
          <span className="cn-script">días</span>
        </p>
      </Escena>

      {/* ── Ceremonia ── */}
      {ceremonia && (
        <Escena>
          <Pegatina className="cn-doodle" giro={-5}><Anillos /></Pegatina>
          <h2 className="cn-titulo">El sí</h2>
          <p className="cn-hora">{ceremonia.hora}</p>
          <p className="cn-chico">{ceremonia.titulo}</p>
          <p className="cn-texto cn-angosto">{ceremonia.direccion}</p>
          <a className="cn-boton" href={ceremonia.mapa} target="_blank" rel="noopener noreferrer">cómo llegar</a>
        </Escena>
      )}

      {/* ── La fiesta ── */}
      {(fiesta || invitacion.cronograma) && (
        <Escena>
          <button type="button" className="cn-disco cn-disco--chico" onClick={() => setRonda((n) => n + 1)} aria-label="Tocá la bola de disco">
            <Pegatina giro={0}><Disco /></Pegatina>
          </button>
          <h2 className="cn-titulo">La fiesta</h2>
          {invitacion.cronograma && (
            <ul className="cn-programa">
              {invitacion.cronograma.map((h, i) => (
                <li key={`${h.hora}-${h.titulo}-${i}`}>
                  <span className="cn-programa__hora">{h.hora}</span>
                  <span className="cn-script">{h.titulo}</span>
                </li>
              ))}
            </ul>
          )}
          {fiesta && fiesta !== ceremonia && (
            <>
              <p className="cn-chico">{fiesta.titulo}</p>
              <p className="cn-texto cn-angosto">{fiesta.direccion}</p>
              <a className="cn-boton" href={fiesta.mapa} target="_blank" rel="noopener noreferrer">cómo llegar</a>
            </>
          )}
          <Pegatina className="cn-pizza" giro={14}><Pizza /></Pegatina>
        </Escena>
      )}

      {/* ── Vestimenta ── */}
      {invitacion.dressCode && (
        <Escena>
          <Pegatina className="cn-doodle cn-doodle--chico" giro={-4}><Lazo /></Pegatina>
          <h2 className="cn-titulo">{invitacion.dressCode.titulo}</h2>
          <p className="cn-texto cn-angosto">{invitacion.dressCode.detalle}</p>
        </Escena>
      )}

      {/* ── Regalos ── */}
      {invitacion.regalo && (
        <Escena>
          <Pegatina className="cn-doodle cn-doodle--chico" giro={5}><Sobre /></Pegatina>
          <h2 className="cn-titulo">Regalos</h2>
          <p className="cn-texto cn-angosto">{invitacion.regalo.mensaje}</p>
          <Copiable etiqueta="Alias" valor={invitacion.regalo.alias} />
          <Copiable etiqueta="CBU" valor={invitacion.regalo.cbu} />
          <p className="cn-chico cn-titular">{invitacion.regalo.titular} · {invitacion.regalo.banco}</p>
        </Escena>
      )}

      <Rsvp slug={invitacion.slug} cierre={invitacion.cierreRsvp} personal={personal} />

      {/* ── Cierre ── */}
      <Escena className="cn-cierre">
        <h2 className="cn-script cn-grande">¡nos vemos en la pista!</h2>
        <p className="cn-pareja cn-pareja--chica">
          <span className="cn-nombre">{uno}</span>
          <span className="cn-amper">&amp;</span>
          <span className="cn-nombre">{dos}</span>
        </p>
        <p className="cn-serif">{fechaLarga}</p>
      </Escena>
    </main>
  );
}
