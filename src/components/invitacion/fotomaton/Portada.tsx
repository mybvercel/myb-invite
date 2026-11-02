"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Marco from "./Marco";
import { sonarImpresion, tocarCajaDeMusica, type CajaDeMusica } from "./sonido";
import Tira from "./Tira";

/** Lo que tarda la tira en salir de la ranura. Va en tirones, como una cabina. */
const IMPRESION_MS = 2700;
const FUNDIDO_MS = 900;
/** Volumen de la música de fondo: tiene que acompañar, no tapar. */
const VOLUMEN_MUSICA = 0.55;

type Estado = "cerrada" | "imprimiendo" | "saliendo" | "abierta";

type Escena = {
  /** El collage espera a que la portada se vaya del todo para entrar: antes
      su animación correría escondida, o se vería a medias en el fundido. */
  abierta: boolean;
  sonando: boolean;
  alternarMusica: () => void;
};

const Contexto = createContext<Escena>({ abierta: false, sonando: false, alternarMusica: () => {} });
export const usarEscena = () => useContext(Contexto);
export const usarPortadaAbierta = () => useContext(Contexto).abierta;

/** El botón flotante de la música. Ecualizador dibujado: las barras se mueven
    mientras suena y quedan quietas y bajas cuando está en pausa. */
function BotonSonido({ sonando, alternar }: { sonando: boolean; alternar: () => void }) {
  return (
    <button
      type="button"
      onClick={alternar}
      className={`fm-sonido${sonando ? " fm-sonido--suena" : ""}`}
      aria-label={sonando ? "Pausar la música" : "Poner la música"}
      aria-pressed={sonando}
    >
      <svg viewBox="0 0 20 16" aria-hidden="true">
        {[2, 7, 12, 17].map((x, i) => (
          <rect key={x} x={x - 1.2} width="2.4" rx="1.2" y="2" height="12" className="fm-sonido__barra" style={{ animationDelay: `${i * -0.23}s` }} />
        ))}
      </svg>
    </button>
  );
}

/**
 * La portada del estilo fotomatón: terciopelo rojo, los nombres, y un marco
 * dorado con una ranura de la que asoma la tira de fotos.
 *
 * Se toca en cualquier parte: la tira termina de salir de la ranura a
 * tirones, con el ruido del motor de la cabina, y después arranca la música
 * de fondo y se desvanece hacia la invitación.
 *
 * El audio vive acá porque tiene que nacer del toque: los navegadores no
 * dejan sonar nada que no venga de un gesto del invitado.
 */
export default function Portada({
  volanta,
  nombres,
  tira,
  fecha,
  musica,
  children,
}: {
  volanta: string;
  nombres: string;
  tira: string[];
  fecha: string;
  /** La canción de la pareja. Sin ella, suena la caja de música. */
  musica?: string;
  children: React.ReactNode;
}) {
  const [estado, setEstado] = useState<Estado>("cerrada");
  const [sonando, setSonando] = useState(false);
  const [hayAudio, setHayAudio] = useState(false);
  const cubriendo = estado !== "abierta";

  const ctxRef = useRef<AudioContext | null>(null);
  const busMusica = useRef<GainNode | null>(null);
  const caja = useRef<CajaDeMusica | null>(null);
  const cancion = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!cubriendo) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [cubriendo]);

  useEffect(() => {
    if (estado === "imprimiendo") {
      const t = setTimeout(() => setEstado("saliendo"), IMPRESION_MS);
      return () => clearTimeout(t);
    }
    if (estado === "saliendo") {
      const t = setTimeout(() => setEstado("abierta"), FUNDIDO_MS);
      return () => clearTimeout(t);
    }
  }, [estado]);

  /** Sube la música de a poco: entrar de golpe asusta. */
  const arrancarMusica = useCallback(() => {
    const ctx = ctxRef.current, bus = busMusica.current;
    if (!ctx || !bus) return;
    if (!musica && !caja.current) caja.current = tocarCajaDeMusica(ctx, bus);
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setValueAtTime(0, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(VOLUMEN_MUSICA, ctx.currentTime + 2.5);
    setSonando(true);
  }, [musica]);

  const abrir = () => {
    if (estado !== "cerrada") return;
    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Todo lo de audio se crea acá, dentro del gesto.
    try {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.connect(ctx.destination);
      const bus = ctx.createGain();
      bus.gain.value = 0;
      bus.connect(master);
      ctxRef.current = ctx;
      busMusica.current = bus;
      setHayAudio(true);

      if (musica) {
        // La canción también pasa por el bus, así sube igual de suave. El
        // play va acá, en silencio, porque iOS no deja arrancarla después.
        const audio = new Audio(musica);
        audio.loop = true;
        audio.crossOrigin = "anonymous";
        ctx.createMediaElementSource(audio).connect(bus);
        audio.play().catch(() => {});
        cancion.current = audio;
      }

      if (!sinMovimiento) sonarImpresion(ctx, master);
      setTimeout(arrancarMusica, sinMovimiento ? 0 : IMPRESION_MS - 200);
    } catch {
      // Sin Web Audio la invitación se abre igual, en silencio.
    }

    if (sinMovimiento) {
      setEstado("saliendo");
      return;
    }
    // En Android, el celular tiembla al ritmo de los tirones de la tira.
    navigator.vibrate?.([25, 330, 25, 330, 25, 330, 40]);
    setEstado("imprimiendo");
  };

  const alternarMusica = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (sonando) {
      ctx.suspend();
      cancion.current?.pause();
      setSonando(false);
    } else {
      ctx.resume();
      cancion.current?.play().catch(() => {});
      setSonando(true);
    }
  }, [sonando]);

  // Si el invitado cambia de app o bloquea el celular, la música se calla y
  // vuelve cuando regresa. Nadie quiere una caja de música sonando en el bolsillo.
  useEffect(() => {
    const cambio = () => {
      const ctx = ctxRef.current;
      if (!ctx || !sonando) return;
      if (document.hidden) {
        ctx.suspend();
        cancion.current?.pause();
      } else {
        ctx.resume();
        cancion.current?.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", cambio);
    return () => document.removeEventListener("visibilitychange", cambio);
  }, [sonando]);

  useEffect(
    () => () => {
      caja.current?.detener();
      cancion.current?.pause();
      ctxRef.current?.close();
    },
    [],
  );

  return (
    <Contexto.Provider value={{ abierta: estado === "abierta", sonando, alternarMusica }}>
      {children}

      {estado === "abierta" && hayAudio && <BotonSonido sonando={sonando} alternar={alternarMusica} />}

      {cubriendo && (
        <div
          className="fm-portada"
          style={{ opacity: estado === "saliendo" ? 0 : 1, transitionDuration: `${FUNDIDO_MS}ms` }}
          aria-hidden={estado === "saliendo"}
          onClick={abrir}
        >
          <div className="fm-portada__columna fm-terciopelo">
            <p className="fm-volanta">{volanta}</p>
            <h1 className="fm-nombres">{nombres}</h1>

            <div className={`fm-cabina${estado === "imprimiendo" ? " fm-cabina--imprime" : ""}`}>
              <Marco />
              <div className="fm-salida">
                <div className={`fm-tira-mov${estado !== "cerrada" ? " fm-tira-mov--imprime" : ""}`}>
                  <Tira fotos={tira} fecha={fecha} />
                </div>
              </div>
            </div>

            {/* Toda la pantalla es el área táctil; este botón es para teclado
                y lectores de pantalla, y su clic sube hasta el contenedor. */}
            <button type="button" className="fm-abrir" style={{ opacity: estado === "cerrada" ? 1 : 0 }}>
              Abrir invitación
            </button>
          </div>
        </div>
      )}
    </Contexto.Provider>
  );
}
