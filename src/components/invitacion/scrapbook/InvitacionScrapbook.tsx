"use client";

import { useEffect, useState } from "react";
import { calcularFaltante, parsearFecha } from "@/invitaciones/fecha";
import type { InvitacionScrapbook as Datos } from "@/invitaciones/tipos";
import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "../personal";
import { usarEnVista } from "../usarEnVista";
import { usarRsvp } from "../usarRsvp";

/**
 * Estilo "Scrapbook": la maqueta disco-scrapbook-v2 (diseño por capas, flujo
 * GPT) pasada al motor. Ocho escenas 9:16 sobre papel marfil que se va
 * tiñendo de rosa a lila; cada recorte se pega al entrar en pantalla. Al
 * confirmar, una estrella de glitter con el nombre del invitado se pega en
 * el collage. Criterios: .claude/skills/invitacion-quince/SKILL.md
 */

const A = "/invitaciones/scrapbook/";

type Adorno = "bola-disco" | "estrella-glitter" | "destello-cromo" | "beso-rosa" | "banderines" | "lazo-rosa";

/** Un recorte pegado en la escena: posición y ancho en % de la escena, como en la maqueta. */
function Recorte({ src, x, y, w, giro = 0, clase = "", alt = "" }: { src: string; x: number; y: number; w: number; giro?: number; clase?: string; alt?: string }) {
  return (
    <img
      src={src.startsWith("/") ? src : `${A}${src}.webp`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={`sb-recorte ${clase}`}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, rotate: `${giro}deg` }}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
const Pieza = (p: { a: Adorno; x: number; y: number; w: number; giro?: number; clase?: string }) => <Recorte src={p.a} {...p} />;

function Escena({ id, clase, children }: { id: string; clase: string; children: React.ReactNode }) {
  const [ref, visible] = usarEnVista<HTMLElement>("-12%");
  return (
    <section ref={ref} id={id} data-visible={visible} className={`sb-escena sb-e-${clase}`}>
      {children}
    </section>
  );
}

const Titulo = ({ chico, grande }: { chico: string; grande: string }) => (
  <header className="sb-titulo">
    <span className="sb-firma">{chico}</span>
    <h2>{grande}</h2>
  </header>
);

export default function InvitacionScrapbook({ invitacion, personal }: { invitacion: Datos; personal?: Personal }) {
  const s = invitacion.scrapbook;
  const fiesta = invitacion.lugares?.find((l) => l.tipo === "Fiesta") ?? invitacion.lugares?.[0];
  const fechaLarga = invitacion.fecha.replace(/ (\d{4})$/, " de $1").replace(/ de ([A-ZÁÉÍÓÚ])/, (_, l: string) => ` de ${l.toLowerCase()}`);

  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => setDias(calcularFaltante(parsearFecha(invitacion.fecha))?.d ?? 0), [invitacion.fecha]);

  const [copiado, setCopiado] = useState(false);
  const r = usarRsvp({ slug: invitacion.slug, personal });
  const sticker = r.enviado && r.asiste ? (personal ? personal.nombre : r.nombre.trim().split(" ")[0]) : null;

  return (
    <main className="inv-columna sb">
      {/* ── Portada ── */}
      <Escena id="portada" clase="portada">
        <Pieza a="banderines" x={-3} y={-1} w={91} />
        <Pieza a="bola-disco" x={83} y={-6} w={36} clase="sb-hamaca" />
        <Pieza a="destello-cromo" x={9} y={17} w={10} clase="sb-brillo" />
        <Recorte src={s.fotoInfancia} x={29} y={15} w={45} clase="sb-foto" alt={`${invitacion.nombres} de chiquita`} />
        <Pieza a="estrella-glitter" x={5} y={36} w={11} giro={-16} />
        <Pieza a="destello-cromo" x={80} y={35} w={12} giro={12} clase="sb-brillo" />
        <div className="sb-portada__texto">
          <span className="sb-firma sb-mis">Mis</span>
          <img src={`${A}globos-15.webp`} alt="15 años" className="sb-globos" />
          <h1 className="sb-firma sb-nombre">{invitacion.nombres}</h1>
          <p className="sb-fecha">{fechaLarga}</p>
          <p className="sb-chico">{personal ? personal.saludo : "Estás en mi lista de personas favoritas."}</p>
          {dias !== null && dias > 0 && <p className="sb-chico sb-faltan">faltan {dias} días</p>}
        </div>
        <Pieza a="beso-rosa" x={83} y={83} w={24} giro={-27} />
        <span className="sb-bola8" aria-hidden="true">
          <i>8</i>
        </span>
      </Escena>

      {/* ── Horarios ── */}
      <Escena id="horarios" clase="horarios">
        <Pieza a="bola-disco" x={-15} y={-4} w={46} />
        <Pieza a="estrella-glitter" x={79} y={9} w={16} giro={17} />
        <Titulo chico="La noche de" grande="mis 15" />
        <div className="sb-momentos sb-dato">
          {s.horarios.map((h, i) => (
            <div key={h.titulo} className="sb-momento" style={{ "--i": i } as React.CSSProperties}>
              <img src={`${A}globo-rosa.webp`} alt="" aria-hidden="true" className="sb-globo" />
              <div>
                <h3>{h.titulo}</h3>
                <p className="sb-hora">{h.hora}</p>
                <p>{h.detalle}</p>
              </div>
            </div>
          ))}
        </div>
        <span className="sb-firma sb-nota sb-nota--horarios">que no falte ni un baile</span>
        <Pieza a="destello-cromo" x={84} y={75} w={9} clase="sb-brillo" />
        <Pieza a="beso-rosa" x={4} y={85} w={17} giro={17} />
      </Escena>

      {/* ── Lugar ── */}
      {fiesta && (
        <Escena id="lugar" clase="lugar">
          <Pieza a="banderines" x={-10} y={-3} w={110} giro={4} />
          <Titulo chico="Nos vemos" grande="acá" />
          <div className="sb-lugar sb-dato">
            <span className="sb-asterisco" aria-hidden="true">✳</span>
            <h3>{fiesta.titulo}</h3>
            <p>{fiesta.direccion.replace(/, ([^,]+)$/, " · $1")}</p>
            <span className="sb-raya" />
            <p>El lugar donde vamos a hacer recuerdos nuevos.</p>
            <a className="sb-boton" href={fiesta.mapa} target="_blank" rel="noopener noreferrer">
              Ver ubicación ↗
            </a>
          </div>
          <Pieza a="destello-cromo" x={8} y={40} w={10} giro={-15} clase="sb-brillo" />
          <Pieza a="estrella-glitter" x={80} y={62} w={14} giro={25} />
          <Pieza a="bola-disco" x={77} y={79} w={37} />
          <span className="sb-firma sb-nota sb-nota--lugar">la pista nos espera</span>
        </Escena>
      )}

      {/* ── Regalos ── */}
      {invitacion.regalo && (
        <Escena id="regalos" clase="regalos">
          <Pieza a="estrella-glitter" x={11} y={9} w={12} giro={-20} />
          <Pieza a="destello-cromo" x={80} y={13} w={10} clase="sb-brillo" />
          <Titulo chico="Con mucho" grande="amor" />
          <Pieza a="lazo-rosa" x={20} y={31} w={60} />
          <div className="sb-regalo sb-dato">
            <p>{invitacion.regalo.mensaje}</p>
            <strong className="sb-alias">{invitacion.regalo.alias}</strong>
            <span className="sb-chico">
              {invitacion.regalo.titular} · {invitacion.regalo.banco}
            </span>
            <button
              type="button"
              className="sb-boton"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(invitacion.regalo!.alias);
                  setCopiado(true);
                  setTimeout(() => setCopiado(false), 2200);
                } catch {
                  // Sin portapapeles, el alias igual está a la vista.
                }
              }}
            >
              {copiado ? "¡Copiado!" : "Copiar alias ♡"}
            </button>
          </div>
          <Pieza a="beso-rosa" x={72} y={86} w={25} giro={-19} />
          <span className="sb-firma sb-nota sb-nota--regalos">con vos alcanza ♡</span>
        </Escena>
      )}

      {/* ── Comida ── */}
      <Escena id="comida" clase="comida">
        <Pieza a="bola-disco" x={82} y={-5} w={33} />
        <Titulo chico="Algo rico" grande="para compartir" />
        <div className="sb-menu sb-dato">
          <p className="sb-menu__intro">Una pausa entre canción y canción.</p>
          <span className="sb-estrellitas" aria-hidden="true">✧ ✧ ✧</span>
          <p>{s.comida}</p>
          <a className="sb-boton" href="#asistencia">
            Contar qué necesito ↓
          </a>
        </div>
        <Pieza a="lazo-rosa" x={-8} y={76} w={38} giro={15} />
        <Pieza a="estrella-glitter" x={82} y={70} w={13} giro={-20} />
        <span className="sb-firma sb-nota sb-nota--comida">y después... a bailar</span>
      </Escena>

      {/* ── Vestimenta ── */}
      {invitacion.dressCode && (
        <Escena id="vestimenta" clase="vestimenta">
          <Pieza a="destello-cromo" x={9} y={9} w={12} giro={-12} clase="sb-brillo" />
          <Titulo chico="Dress" grande="code" />
          <Recorte src="traje-elegante" x={15} y={30} w={31} giro={-9} clase="sb-prenda" alt="Propuesta: traje negro con camisa clara" />
          <Recorte src="vestido-elegante" x={51} y={28} w={32} giro={9} clase="sb-prenda sb-prenda--dos" alt="Propuesta: vestido azul noche de satén" />
          <Pieza a="estrella-glitter" x={86} y={30} w={12} giro={18} />
          <div className="sb-vestimenta sb-dato">
            <h3>{invitacion.dressCode.titulo}</h3>
            <p>{invitacion.dressCode.detalle}</p>
          </div>
          <Pieza a="destello-cromo" x={7} y={65} w={10} giro={-16} clase="sb-brillo" />
          <span className="sb-firma sb-nota sb-nota--vestimenta">tu look, tu actitud.</span>
          <Pieza a="beso-rosa" x={4} y={88} w={19} giro={12} />
        </Escena>
      )}

      {/* ── Asistencia: el sticker del invitado ── */}
      <Escena id="asistencia" clase="asistencia">
        <Pieza a="banderines" x={-5} y={-2} w={110} />
        <Titulo chico="Decime" grande="que venís" />
        {invitacion.cierreRsvp && <p className="sb-chico sb-limite">{invitacion.cierreRsvp}</p>}

        {r.cerrado && !personal ? (
          <p className="sb-chico sb-limite">Esta invitación es personal. Confirmá desde el link que te mandaron.</p>
        ) : r.enviado ? (
          <div className="sb-respuesta sb-dato">
            <h3>{r.asiste ? "¡Ya estás en la lista!" : "Gracias por avisar"}</h3>
            <p>
              {r.asiste
                ? `Tu estrella ya quedó pegada${r.acompanantes > 1 ? ` (son ${r.acompanantes})` : ""}. Nos vemos en la pista.`
                : "Te voy a extrañar. ¡Gracias por avisarme!"}
            </p>
            {personal && (
              <button type="button" className="sb-enlace" onClick={() => { r.setEnviado(false); r.abrir(); }}>
                cambiar la respuesta
              </button>
            )}
          </div>
        ) : (
          <div ref={r.formRef} className="sb-formulario sb-dato">
            {!personal && (
              <label className="sb-campo">
                <span>Nombre y apellido</span>
                <input value={r.nombre} onChange={(e) => r.setNombre(e.target.value)} placeholder="Tu nombre completo" autoComplete="name" maxLength={40} />
              </label>
            )}
            <fieldset className="sb-campo">
              <legend>¿Venís a festejar?</legend>
              {[[true, "Sí, ¡ahí voy!"], [false, "No puedo ir"]].map(([valor, texto]) => (
                <button key={String(valor)} type="button" className="sb-opcion" aria-pressed={r.asiste === valor} onClick={() => r.setAsiste(valor as boolean)}>
                  <span className="sb-casilla" aria-hidden="true" />
                  {texto as string}
                </button>
              ))}
            </fieldset>
            {r.asiste === true && (
              <>
                {(!personal || r.cupo > 1) && (
                  <label className="sb-campo">
                    <span>{personal && r.cupo > 1 ? `Cuántos vienen, de ${r.cupo}` : "Cuántos son"}</span>
                    <input type="number" inputMode="numeric" min={1} max={r.cupo} value={r.acompanantes} onChange={(e) => r.setAcompanantes(Number(e.target.value))} />
                  </label>
                )}
                <fieldset className="sb-campo">
                  <legend>Tu alimentación</legend>
                  {COMIDAS.map((c) => (
                    <button key={c} type="button" className="sb-opcion" aria-pressed={r.comidas.includes(c)} onClick={() => r.alternarComida(c)}>
                      <span className="sb-casilla" aria-hidden="true" />
                      {c}
                    </button>
                  ))}
                </fieldset>
                {!personal && (
                  <label className="sb-campo">
                    <span>El tema que no puede faltar</span>
                    <input value={r.cancion} onChange={(e) => r.setCancion(e.target.value)} placeholder="Tema y artista" />
                  </label>
                )}
              </>
            )}
            {r.falta && (!r.nombre.trim() || r.asiste === null) && <p className="sb-aviso">Falta tu nombre y si venís</p>}
            {r.errorEnvio && <p role="alert" className="sb-aviso">{r.errorEnvio}</p>}
            <button type="button" className="sb-boton sb-boton--ancho" onClick={r.enviar} disabled={r.enviando}>
              {r.enviando ? "Pegando tu estrella…" : "Confirmar asistencia ♡"}
            </button>
          </div>
        )}

        {/* La estrella del invitado: se pega en el collage al confirmar. */}
        <div className={`sb-sticker${sticker ? " sb-sticker--pegado" : ""}`} aria-hidden={!sticker}>
          <img src={`${A}estrella-glitter.webp`} alt="" />
          <span>{sticker}</span>
        </div>
      </Escena>

      {/* ── Cierre ── */}
      <Escena id="cierre" clase="cierre">
        <Pieza a="bola-disco" x={-14} y={-6} w={43} clase="sb-hamaca" />
        <Pieza a="destello-cromo" x={78} y={12} w={12} clase="sb-brillo" />
        <Recorte src={s.fotoActual} x={25} y={19} w={52} clase="sb-foto" alt={`${invitacion.nombres} hoy`} />
        <Pieza a="estrella-glitter" x={6} y={52} w={17} giro={-12} />
        <Pieza a="beso-rosa" x={76} y={53} w={22} giro={-12} />
        <div className="sb-cierre">
          <span className="sb-firma">Crecí, pero las ganas de festejar siguen intactas.</span>
          <h2>¡Te espero!</h2>
          <a className="sb-enlace" href="#asistencia">
            Yo voy ♡
          </a>
        </div>
      </Escena>
    </main>
  );
}
