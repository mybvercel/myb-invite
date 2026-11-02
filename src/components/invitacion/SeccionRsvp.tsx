"use client";

import Flores from "./Flores";
import Ornamento from "./Ornamento";
import Fondo from "./Fondo";
import TituloSeccion from "./TituloSeccion";
import { usarEnVista } from "./usarEnVista";
import { usarRsvp } from "./usarRsvp";

import { COMIDAS } from "@/lib/rsvp-comun";
import type { Personal } from "./personal";

/**
 * Círculo dibujado para elegir. Los radios y checkbox nativos traen el look
 * del sistema operativo y rompen la pieza entera.
 */
function Opcion({
  activa,
  onClick,
  children,
  redonda = true,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
  redonda?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className="flex w-full items-center gap-3 py-2.5 text-left"
    >
      <span
        aria-hidden="true"
        className={`grid h-[15px] w-[15px] shrink-0 place-items-center border transition-colors duration-500 ${
          redonda ? "rounded-full" : ""
        }`}
        style={{ borderColor: activa ? "var(--burdeos)" : "rgba(184,121,79,0.45)" }}
      >
        <span
          className={`transition-transform duration-500 ${redonda ? "rounded-full" : ""}`}
          style={{
            width: 7,
            height: 7,
            background: "var(--burdeos)",
            transform: activa ? "scale(1)" : "scale(0)",
          }}
        />
      </span>
      <span className="text-[1.0625rem] font-light text-[var(--tinta)]">{children}</span>
    </button>
  );
}

/**
 * Sección 8: confirmá tu asistencia.
 *
 * Es la razón por la que la pareja paga esto: deja de perseguir a ciento veinte
 * personas por WhatsApp.
 *
 * El lacre vuelve acá como botón. Esa rima con el sobre del principio es lo que
 * hace que la invitación se lea como una sola pieza y no como pantallas sueltas.
 */
export default function SeccionRsvp({
  slug,
  sello,
  cierre,
  invitado,
  flores,
  personal,
}: {
  slug: string;
  sello?: string;
  cierre?: string;
  invitado?: string;
  flores?: string;
  /** Link personal: ya se sabe quién es, sólo se pregunta si vienen y qué comen. */
  personal?: Personal;
}) {
  const [seccion, visible] = usarEnVista<HTMLElement>();
  const { abierto, setAbierto, enviado, setEnviado, cerrado, setCerrado, nombre, setNombre, asiste, setAsiste, acompanantes, setAcompanantes, comidas, setComidas, cancion, setCancion, falta, setFalta, enviando, setEnviando, errorEnvio, setErrorEnvio, formRef, previa, cupo, abrir, alternarComida, enviar } = usarRsvp({ slug, personal, invitado });

  return (
    <section
      ref={seccion}
      className="relative px-[clamp(2rem,9vw,3.5rem)] pt-[clamp(5rem,15vw,8rem)] pb-[clamp(5rem,14vw,7rem)]"
    >
      <Fondo variante="hondo" encuadre={2} />
      <Flores src={flores} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          className="inv-sube"
          data-visible={visible}
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <TituloSeccion>Confirmá tu asistencia</TituloSeccion>
        </div>

        {enviado ? (
          <div className="inv-entra mt-[clamp(3rem,10vw,4.5rem)] flex flex-col items-center">
            <p className="inv-titulo text-[clamp(1.8rem,7vw,2.3rem)]">
              {asiste ? "¡Nos vemos ahí!" : "Gracias por avisar"}
            </p>
            <Ornamento className="mt-5" />
            <p className="mt-6 max-w-[26ch] text-[1.0625rem] leading-relaxed font-light text-[var(--tinta-tenue)]">
              {personal
                ? asiste
                  ? `Anotamos ${acompanantes === 1 ? "1 persona" : `${acompanantes} personas`} por ${personal.nombre}. Falta poco.`
                  : "Los vamos a extrañar. Gracias por avisar."
                : asiste
                  ? `Ya te anotamos${acompanantes > 1 ? ` y a ${acompanantes - 1} más` : ""}. Falta poco.`
                  : "Te vamos a extrañar. Gracias por tomarte el momento de contestar."}
            </p>
            {personal && (
              <button
                type="button"
                onClick={() => {
                  setEnviado(false);
                  abrir();
                }}
                className="inv-versalita mt-8 text-[0.58rem] underline decoration-[var(--cobre)]/40 underline-offset-4"
              >
                Cambiar la respuesta
              </button>
            )}
          </div>
        ) : cerrado ? (
          <p className="inv-entra mt-[clamp(2.5rem,9vw,4rem)] max-w-[26ch] text-[1.0625rem] leading-relaxed font-light text-[var(--tinta-tenue)]">
            Esta invitación es personal. Confirmá desde el link que te mandaron los novios.
          </p>
        ) : (
          <>
            {cierre && (
              <p
                className="inv-sube mt-[clamp(1.75rem,6vw,2.5rem)] max-w-[28ch] text-[1.0625rem] leading-relaxed font-light text-[var(--tinta-tenue)]"
                data-visible={visible}
                style={{ "--d": "160ms" } as React.CSSProperties}
              >
                {cierre}
              </p>
            )}

            {/* ── El lacre ── */}
            {!abierto && (
              <div
                className="inv-sube mt-[clamp(2.5rem,9vw,4rem)] flex flex-col items-center"
                data-visible={visible}
                style={{ "--d": "320ms" } as React.CSSProperties}
              >
                <button
                  type="button"
                  onClick={abrir}
                  className="relative grid place-items-center transition-transform duration-700 active:scale-95"
                  style={{ width: "clamp(7.5rem,34vw,9.5rem)" }}
                  aria-label="Abrir el formulario para confirmar"
                >
                  {sello ? (
                    // Sin multiply: el lacre tiene brillos claros en el borde
                    // de cobre que el multiply ensuciaría contra el papel.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sello} alt="" aria-hidden="true" className="w-full" />
                  ) : (
                    <span className="block aspect-square w-full rounded-full bg-[var(--burdeos)]" />
                  )}

                  {/* El centro del lacre se generó vacío justamente para esto. */}
                  <span
                    className="inv-versalita absolute text-[0.6rem]"
                    style={{ color: "#f0d4bd" }}
                  >
                    RSVP
                  </span>
                </button>

                <p
                  className="inv-versalita mt-5 text-[0.58rem]"
                  style={{ animation: "inv-respira 3.2s ease-in-out infinite" }}
                >
                  Tocá el sello
                </p>
              </div>
            )}

            {/* ── El formulario ── */}
            {abierto && (
              <div
                ref={formRef}
                className="inv-entra mt-[clamp(2.5rem,9vw,4rem)] w-full max-w-[20rem] text-left"
              >
                {personal ? (
                  <p className="text-center text-[1.0625rem] font-light text-[var(--tinta-tenue)]">
                    Confirman por <span className="text-[var(--tinta)]">{personal.nombre}</span>
                  </p>
                ) : (
                  <label className="block">
                    <span className="inv-versalita text-[0.58rem]">Tu nombre</span>
                    <input
                      className="inv-campo mt-1"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre y apellido"
                      autoComplete="name"
                    />
                  </label>
                )}

                <fieldset className="mt-9">
                  <legend className="inv-versalita text-[0.58rem]">{personal ? "¿Vienen?" : "¿Vas a venir?"}</legend>
                  <div className="mt-2">
                    <Opcion activa={asiste === true} onClick={() => setAsiste(true)}>
                      Ahí voy a estar
                    </Opcion>
                    <Opcion activa={asiste === false} onClick={() => setAsiste(false)}>
                      Esta vez no puedo
                    </Opcion>
                  </div>
                </fieldset>

                {/* Lo que sigue sólo tiene sentido si viene. */}
                {asiste === true && (
                  <div className="inv-entra">
                    {(!personal || cupo > 1) && (
                    <label className="mt-9 block">
                      <span className="inv-versalita text-[0.58rem]">
                        {personal && cupo > 1 ? `Cuántos van, de ${cupo}` : "Cuántos son"}
                      </span>
                      <input
                        className="inv-campo mt-1"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={cupo}
                        value={acompanantes}
                        onChange={(e) => setAcompanantes(Number(e.target.value))}
                      />
                    </label>
                    )}

                    <fieldset className="mt-9">
                      <legend className="inv-versalita text-[0.58rem]">
                        Restricciones de comida
                      </legend>
                      <div className="mt-2">
                        {COMIDAS.map((c) => (
                          <Opcion
                            key={c}
                            redonda={false}
                            activa={comidas.includes(c)}
                            onClick={() => alternarComida(c)}
                          >
                            {c}
                          </Opcion>
                        ))}
                      </div>
                    </fieldset>

                    {!personal && (
                    <label className="mt-9 block">
                      <span className="inv-versalita text-[0.58rem]">
                        Una canción que no puede faltar
                      </span>
                      <input
                        className="inv-campo mt-1"
                        value={cancion}
                        onChange={(e) => setCancion(e.target.value)}
                        placeholder="Tema y artista"
                      />
                    </label>
                    )}
                  </div>
                )}

                {falta && (!nombre.trim() || asiste === null) && (
                  <p className="inv-versalita mt-7 text-center text-[0.56rem] text-[var(--burdeos)]">
                    Falta tu nombre y si venís
                  </p>
                )}

                {errorEnvio && (
                  <p
                    role="alert"
                    className="mt-7 text-center text-[0.95rem] font-light text-[var(--burdeos)]"
                  >
                    {errorEnvio}
                  </p>
                )}

                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={enviar}
                    disabled={enviando}
                    className="inv-versalita border border-[var(--cobre)]/45 px-9 py-3.5 text-[0.62rem] text-[var(--tinta)] transition-colors duration-500 hover:bg-[var(--cobre)]/10 disabled:opacity-50"
                  >
                    {enviando ? "Enviando" : "Enviar"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
