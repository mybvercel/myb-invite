"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionGuirnalda as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";

/**
 * Estilo "Guirnalda": una noche de luces cálidas sobre verde profundo.
 *
 * La foto de la pareja es la portada entera. Una guirnalda de focos se
 * enciende de a uno cuando el invitado llega a ella, y en el cronograma cada
 * hora es un foco que se prende al llegar: el orden de la noche se lee
 * encendiéndose. Criterios: .claude/skills/invitacion-guirnalda/SKILL.md
 */

function Escena({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-8%");
  return (
    <section ref={ref} data-visible={visible} className={`lz-escena ${className}`}>
      {children}
    </section>
  );
}

/* ── Los focos ─────────────────────────────────────────────── */

const FOCOS = 9;

/** Los focos cuelgan de una curva; se calcula dónde cae cada uno sobre ella. */
const COLGADOS = Array.from({ length: FOCOS }, (_, i) => {
  const t = (i + 0.5) / FOCOS;
  const u = 1 - t;
  return {
    x: u * u * -4 + 2 * u * t * 200 + t * t * 404,
    y: u * u * 6 + 2 * u * t * 74 + t * t * 6,
  };
});

/** Una guirnalda de ancho completo. Se enciende cuando entra en pantalla. */
function Guirnalda({ className = "" }: { className?: string }) {
  const [ref, visible] = usarEnVista<HTMLDivElement>("-4%");
  return (
    <div ref={ref} data-visible={visible} className={`lz-guirnalda ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 92" preserveAspectRatio="xMidYMin meet">
        <path className="lz-cable" d="M -4 6 Q 200 74 404 6" />
        {COLGADOS.map((c, i) => (
          <g key={i} className="lz-foco" style={{ "--i": i } as React.CSSProperties}>
            <line x1={c.x} y1={c.y} x2={c.x} y2={c.y + 7} className="lz-cable" />
            <rect x={c.x - 2.6} y={c.y + 7} width="5.2" height="5" rx="1" className="lz-casquillo" />
            <circle cx={c.x} cy={c.y + 21} r="15" className="lz-halo" />
            <ellipse cx={c.x} cy={c.y + 21} rx="6.4" ry="8.6" className="lz-bulbo" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** El foco de un renglón del cronograma: se prende al llegar a él. */
function Hito({ hora, titulo, indice }: { hora: string; titulo: string; indice: number }) {
  const [ref, visible] = usarEnVista<HTMLLIElement>("-14%");
  return (
    <li ref={ref} data-visible={visible} className="lz-hito" style={{ "--i": indice } as React.CSSProperties}>
      <svg className="lz-hito__foco" viewBox="0 0 24 34" aria-hidden="true">
        <circle cx="12" cy="20" r="11" className="lz-halo" />
        <rect x="9.4" y="3" width="5.2" height="5" rx="1" className="lz-casquillo" />
        <ellipse cx="12" cy="20" rx="6.4" ry="8.6" className="lz-bulbo" />
      </svg>
      <p className="lz-hito__hora">{hora}</p>
      <p className="lz-hito__titulo">{titulo}</p>
    </li>
  );
}

function Copiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <p className="lz-dato">
      <span className="lz-chico">{etiqueta}</span>
      <span className="lz-dato__valor">{valor}</span>
      <button
        type="button"
        className="lz-enlace"
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
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </p>
  );
}

/* ── Confirmación ──────────────────────────────────────────── */

function Rsvp({ slug, cierre, personal }: { slug: string; cierre?: string; personal?: Personal }) {
  const r = usarRsvp({ slug, personal });

  return (
    <Escena className="lz-rsvp">
      <h2 className="lz-titulo">Confirmá tu lugar</h2>
      {cierre && <p className="lz-texto lz-angosto">{cierre}</p>}

      {r.cerrado && !personal ? (
        <p className="lz-texto lz-angosto">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
      ) : r.enviado ? (
        <div className="lz-respuesta">
          <Guirnalda className="lz-guirnalda--corta" />
          <p className="lz-script">{r.asiste ? "Ya estás en la lista" : "Gracias por avisar"}</p>
          <p className="lz-texto lz-angosto">
            {r.asiste
              ? personal
                ? `Anotamos ${r.acompanantes === 1 ? "1 persona" : `${r.acompanantes} personas`}. Nos vemos en febrero.`
                : `Te esperamos${r.acompanantes > 1 ? ` a vos y a ${r.acompanantes - 1} más` : ""}. Nos vemos en febrero.`
              : "Te vamos a extrañar."}
          </p>
          {personal && (
            <button type="button" className="lz-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
              Cambiar la respuesta
            </button>
          )}
        </div>
      ) : (
        <div ref={r.formRef} className="lz-formulario">
          {!personal && (
            <label className="lz-campo">
              <span className="lz-chico">Tu nombre</span>
              <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} placeholder="Nombre y apellido" autoComplete="name" maxLength={40} />
            </label>
          )}

          <fieldset className="lz-campo">
            <legend className="lz-chico">{personal ? "¿Vienen?" : "¿Venís?"}</legend>
            {[[true, "Sí, ahí estaré"], [false, "No puedo acompañarlos"]].map(([valor, texto]) => (
              <button key={String(valor)} type="button" className="lz-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                <span className="lz-casilla" aria-hidden="true" />
                {texto as string}
              </button>
            ))}
          </fieldset>

          {r.asiste === true && (
            <>
              {(!personal || r.cupo > 1) && (
                <label className="lz-campo">
                  <span className="lz-chico">{personal && r.cupo > 1 ? `Cuántos van, de ${r.cupo}` : "Cuántos son"}</span>
                  <input type="number" inputMode="numeric" min={1} max={r.cupo} value={r.acompanantes} onChange={(e) => r.setAcompanantes(Number(e.target.value))} />
                </label>
              )}
              <fieldset className="lz-campo">
                <legend className="lz-chico">¿Algo que no comas?</legend>
                {COMIDAS.map((c) => (
                  <button key={c} type="button" className="lz-opcion" aria-pressed={r.comidas.includes(c)} onClick={() => r.alternarComida(c)}>
                    <span className="lz-casilla" aria-hidden="true" />
                    {c}
                  </button>
                ))}
              </fieldset>
              {!personal && (
                <label className="lz-campo">
                  <span className="lz-chico">El tema que no puede faltar</span>
                  <input value={r.cancion} onChange={(e) => r.setCancion(e.target.value)} placeholder="Tema y artista" />
                </label>
              )}
            </>
          )}

          {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="lz-aviso">Falta tu nombre y si venís</p>}
          {r.errorEnvio && <p role="alert" className="lz-aviso">{r.errorEnvio}</p>}

          <button type="button" className="lz-boton lz-boton--lleno" onClick={r.enviar} disabled={r.enviando}>
            {r.enviando ? "Enviando…" : "Confirmar"}
          </button>
        </div>
      )}
    </Escena>
  );
}

/* ── La invitación ─────────────────────────────────────────── */

export default function InvitacionGuirnalda({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const [uno, dos] = invitacion.nombres.split("&").map((n) => n.trim());
  const g = invitacion.guirnalda;
  const fechaLarga = invitacion.fecha.replace(/ (\d{4})$/, " de $1");

  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => {
    // En el servidor no existe "ahora": la cuenta se calcula ya en el navegador.
    const cuadro = requestAnimationFrame(() => setDias(calcularFaltante(parsearFecha(invitacion.fecha))?.d ?? 0));
    return () => cancelAnimationFrame(cuadro);
  }, [invitacion.fecha]);

  return (
    <main className="inv-columna lz">
      {/* ── Portada: la foto, y los nombres sobre su parte baja ── */}
      <header className="lz-portada">
        <div className="lz-portada__foto">
          <Image
            src={g.portada.src}
            alt={g.portada.alt}
            fill
            priority
            sizes="(min-width: 30rem) 480px, 100vw"
            className="lz-portada__img"
          />
        </div>
        <div className="lz-portada__texto">
          <h1 className="lz-pareja">
            <span className="lz-nombre">{uno}</span>
            <span className="lz-amper">&amp;</span>
            <span className="lz-nombre">{dos}</span>
          </h1>
          <p className="lz-volanta">{invitacion.volanta}</p>
          <p className="lz-fecha">{fechaLarga}</p>
        </div>
      </header>

      {personal && (
        <Escena className="lz-saludo">
          <p className="lz-script">{personal.saludo}</p>
          {personal.nota && <p className="lz-texto lz-angosto">{personal.nota}</p>}
        </Escena>
      )}

      {/* ── Faltan ── */}
      <Escena className="lz-faltan">
        <Guirnalda />
        <p className="lz-faltan__fila">
          <span className="lz-italica">faltan</span>
          <span className="lz-faltan__n">{dias ?? "··"}</span>
          <span className="lz-italica">días</span>
        </p>
      </Escena>

      {/* ── Frase ── */}
      {invitacion.frase && (
        <Escena className="lz-frase">
          <p className="lz-cita">{invitacion.frase}</p>
        </Escena>
      )}

      {/* ── La noche, hora por hora ── */}
      {invitacion.cronograma && (
        <Escena className="lz-dia">
          <h2 className="lz-titulo">La noche</h2>
          <ol className="lz-hitos">
            {invitacion.cronograma.map((h, i) => (
              <Hito key={`${h.hora}-${h.titulo}`} hora={h.hora} titulo={h.titulo} indice={i} />
            ))}
          </ol>
        </Escena>
      )}

      {/* ── Dónde ── */}
      {invitacion.lugares && (
        <Escena className="lz-lugares">
          <h2 className="lz-titulo">Dónde</h2>
          {invitacion.lugares.map((l) => (
            <article key={`${l.tipo}-${l.titulo}`} className="lz-lugar">
              <h3 className="lz-script lz-lugar__tipo">{l.tipo}</h3>
              <p className="lz-lugar__titulo">{l.titulo}</p>
              <p className="lz-hora">{l.hora} hs</p>
              <p className="lz-texto lz-angosto">{l.direccion}</p>
              <a className="lz-boton" href={l.mapa} target="_blank" rel="noopener noreferrer">
                Cómo llegar
              </a>
            </article>
          ))}
        </Escena>
      )}

      {/* ── La segunda foto, en un arco ── */}
      <Escena className="lz-arco">
        <figure className="lz-arco__figura">
          <div className="lz-arco__marco">
            <Image src={g.arco.src} alt={g.arco.alt} fill sizes="(min-width: 30rem) 380px, 82vw" className="lz-arco__img" />
          </div>
          <figcaption className="lz-script lz-arco__pie">{g.arco.pie}</figcaption>
        </figure>
      </Escena>

      {/* ── Vestimenta ── */}
      {invitacion.dressCode && (
        <Escena>
          <h2 className="lz-titulo">{invitacion.dressCode.titulo}</h2>
          <p className="lz-texto lz-angosto">{invitacion.dressCode.detalle}</p>
        </Escena>
      )}

      {/* ── Regalos ── */}
      {invitacion.regalo && (
        <Escena>
          <h2 className="lz-titulo">Regalos</h2>
          <p className="lz-texto lz-angosto">{invitacion.regalo.mensaje}</p>
          <Copiable etiqueta="Alias" valor={invitacion.regalo.alias} />
          <Copiable etiqueta="CBU" valor={invitacion.regalo.cbu} />
          <p className="lz-chico lz-titular">{invitacion.regalo.titular} · {invitacion.regalo.banco}</p>
        </Escena>
      )}

      <Rsvp slug={invitacion.slug} cierre={invitacion.cierreRsvp} personal={personal} />

      {/* ── Cierre ── */}
      <Escena className="lz-cierre">
        <p className="lz-cierre__frase">{g.cierre}</p>
        <p className="lz-pareja lz-pareja--chica">
          <span className="lz-nombre">{uno}</span>
          <span className="lz-amper">&amp;</span>
          <span className="lz-nombre">{dos}</span>
        </p>
        <p className="lz-fecha">{fechaLarga}</p>
        <Guirnalda className="lz-guirnalda--pie" />
      </Escena>
    </main>
  );
}
