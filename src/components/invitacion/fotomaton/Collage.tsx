"use client";

import { useEffect, useId, useState } from "react";
import { calcularFaltante, parsearFecha, type Faltante } from "@/invitaciones/fecha";
import Marco from "./Marco";
import { usarEscena } from "./Portada";
import Tira from "./Tira";

/** Papel crema arrancado a mano. El borde se come con turbulencia (nada de
    contorno liso), y la superficie lleva fibra: ruido fino con luz rasante,
    que es lo que distingue un papel de algodón de un recuadro color crema. */
function Papel() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 240 170" className="fm-pieza__svg" aria-hidden="true">
      <defs>
        <filter id={`rasgado-${id}`} x="-10%" y="-10%" width="120%" height="125%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="4" result="borde" />
          <feDisplacementMap in="SourceGraphic" in2="borde" scale="9" xChannelSelector="R" yChannelSelector="G" result="forma" />
          {/* Fibra: relieve de ruido fino iluminado de costado. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="8" result="fibra" />
          <feDiffuseLighting in="fibra" surfaceScale="1.4" diffuseConstant="1.05" lightingColor="#fffaf0" result="luzFibra">
            <feDistantLight azimuth="225" elevation="58" />
          </feDiffuseLighting>
          {/* La luz de la fibra se comprime a 0.91-1: si no, el multiply la
              vuelve gris y el papel parece lija. */}
          <feComponentTransfer in="luzFibra" result="luzSuave">
            <feFuncR type="linear" slope="0.09" intercept="0.91" />
            <feFuncG type="linear" slope="0.09" intercept="0.91" />
            <feFuncB type="linear" slope="0.09" intercept="0.9" />
          </feComponentTransfer>
          <feComposite in="luzSuave" in2="forma" operator="in" result="fibraIn" />
          <feBlend in="forma" in2="fibraIn" mode="multiply" result="conFibra" />
          {/* El canto arrancado queda un poco más oscuro: ahí asoman las fibras sueltas. */}
          <feMorphology in="forma" operator="erode" radius="2.2" result="adentro" />
          <feComposite in="forma" in2="adentro" operator="out" result="canto" />
          <feColorMatrix in="canto" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0.35 0" result="cantoOscuro" />
          <feMerge result="papel">
            <feMergeNode in="conFibra" />
            <feMergeNode in="cantoOscuro" />
          </feMerge>
          <feDropShadow dx="1.5" dy="4" stdDeviation="3" floodColor="#1c0205" floodOpacity="0.5" />
        </filter>
      </defs>
      <g filter={`url(#rasgado-${id})`} fill="#efe2cb">
        <circle cx="62" cy="92" r="50" />
        <circle cx="112" cy="66" r="58" />
        <circle cx="170" cy="82" r="52" />
        <circle cx="198" cy="114" r="36" />
        <circle cx="142" cy="118" r="46" />
        <circle cx="84" cy="124" r="40" />
        <circle cx="38" cy="116" r="30" />
      </g>
    </svg>
  );
}

/** Corazón de raso rojo con borde de puntilla.
    El raso es relieve acolchado (la silueta muy desenfocada da una panza
    redonda) con un brillo especular ancho y suave, más la trama fina de la
    tela. La puntilla es una fila de óvalos calados, no una línea punteada. */
function Corazon() {
  const id = useId().replace(/:/g, "");
  const d =
    "M110 180 C 50 135, 10 105, 10 65 C 10 32, 35 10, 65 10 C 85 10, 102 22, 110 38 C 118 22, 135 10, 155 10 C 185 10, 210 32, 210 65 C 210 105, 170 135, 110 180 Z";
  return (
    <svg viewBox="0 0 220 195" className="fm-pieza__svg" aria-hidden="true">
      <defs>
        <radialGradient id={`raso-${id}`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#c2202f" />
          <stop offset="0.6" stopColor="#8c0f1b" />
          <stop offset="1" stopColor="#56060e" />
        </radialGradient>
        <filter id={`tela-${id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="14" result="panza" />
          <feSpecularLighting in="panza" surfaceScale="9" specularConstant="0.9" specularExponent="30" lightingColor="#ffffff" result="brillo">
            <feDistantLight azimuth="230" elevation="38" />
          </feSpecularLighting>
          <feComposite in="brillo" in2="SourceAlpha" operator="in" result="brilloIn" />
          <feDiffuseLighting in="panza" surfaceScale="9" diffuseConstant="1.05" lightingColor="#fff" result="volumen">
            <feDistantLight azimuth="230" elevation="50" />
          </feDiffuseLighting>
          {/* El volumen sólo sombrea (0.55-1): no aclara, así el rojo no se lava. */}
          <feComponentTransfer in="volumen" result="volumenSuave">
            <feFuncR type="linear" slope="0.3" intercept="0.7" />
            <feFuncG type="linear" slope="0.3" intercept="0.7" />
            <feFuncB type="linear" slope="0.3" intercept="0.7" />
          </feComponentTransfer>
          <feComposite in="volumenSuave" in2="SourceAlpha" operator="in" result="volumenIn" />
          <feBlend in="SourceGraphic" in2="volumenIn" mode="multiply" result="acolchado" />
          <feComposite in="acolchado" in2="brilloIn" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" result="raso" />
          {/* Trama: ruido muy fino y alargado, la tela del raso. */}
          <feTurbulence type="fractalNoise" baseFrequency="1.6 0.35" numOctaves="1" seed="2" result="trama" />
          <feColorMatrix in="trama" type="saturate" values="0" result="tramaGris" />
          <feComposite in="tramaGris" in2="SourceAlpha" operator="in" result="tramaIn" />
          <feBlend in="raso" in2="tramaIn" mode="soft-light" result="tejido" />
          {/* El raso es un rojo saturado: la luz y la trama lo apagan un poco
              y acá se le devuelve, si no queda malva. */}
          <feColorMatrix in="tejido" type="saturate" values="1.45" />
        </filter>
        <filter id={`sombra-${id}`} x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="1.5" dy="5" stdDeviation="3.5" floodColor="#1c0205" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter={`url(#sombra-${id})`}>
        {/* Puntilla: óvalos crema con un agujerito, como el festón de un encaje. */}
        <path d={d} fill="none" stroke="#efe3d0" strokeWidth="15" strokeDasharray="0.1 9" strokeLinecap="round" />
        <path d={d} fill="none" stroke="#b9a58a" strokeWidth="4" strokeDasharray="0.1 9" strokeLinecap="round" transform="translate(0.3 0.4)" />
        <path d={d} fill="none" stroke="#efe3d0" strokeWidth="6" />
        <path d={d} fill={`url(#raso-${id})`} filter={`url(#tela-${id})`} />
        {/* Costura del borde del raso. */}
        <path d={d} fill="none" stroke="#3d050b" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 2.5"
          transform="translate(110 97) scale(0.93) translate(-110 -97)" />
      </g>
    </svg>
  );
}

/**
 * La pantalla que queda al abrir: el mismo marco dorado, ahora con las piezas
 * pegadas encima como un collage (el papel con "Guardá la fecha", la tira, el
 * corazón con la fecha y el disco), y la cuenta regresiva debajo.
 */
export default function Collage({
  nombres,
  tira,
  fecha,
  fechaPuntos,
  iniciales,
}: {
  nombres: string;
  tira: string[];
  fecha: string;
  fechaPuntos: string;
  iniciales: string;
}) {
  const { abierta, sonando, alternarMusica } = usarEscena();
  const [faltante, setFaltante] = useState<Faltante | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const objetivo = parsearFecha(fecha);
    setMontado(true);
    setFaltante(calcularFaltante(objetivo));
    const reloj = setInterval(() => setFaltante(calcularFaltante(objetivo)), 1000);
    return () => clearInterval(reloj);
  }, [fecha]);

  const pieza = (retardo: number) =>
    ({ "--d": `${retardo}ms` }) as React.CSSProperties;

  const numeros = faltante
    ? [faltante.d, faltante.h, faltante.m, faltante.s].map((n, i) => (i === 0 ? String(n) : String(n).padStart(2, "0")))
    : ["––", "––", "––", "––"];

  return (
    <section className="fm-collage">
      <div className="fm-cabina fm-cabina--collage" data-abierta={abierta}>
        <Marco ranura={false} />

        {/* Los nombres grabados en la placa: llenan el centro, que sin esto
            quedaba como un hueco dorado, y las piezas se pegan alrededor. */}
        <p className="fm-grabado" aria-label={nombres}>
          {nombres.split("&").map((n, i) => (
            <span key={n} className={i ? "fm-grabado__dos" : undefined}>
              {i > 0 && <span className="fm-grabado__amper">&amp;</span>}
              {n.trim()}
            </span>
          ))}
        </p>

        <div className="fm-pieza fm-pieza--papel" style={pieza(150)}>
          <Papel />
          <p className="fm-pieza__guarda">
            Guardá
            <br />
            la fecha
          </p>
        </div>

        <div className="fm-pieza fm-pieza--tira" style={pieza(420)}>
          <Tira fotos={tira} fecha={fechaPuntos} />
        </div>

        <div className="fm-pieza fm-pieza--corazon" style={pieza(680)}>
          <Corazon />
          {/* Sólo la fecha. Partida en dos para que pueda ser grande sin
              salirse del corazón: día y mes arriba, el año más chico. */}
          <p className="fm-pieza__corazon-texto" aria-label={fechaPuntos}>
            <span className="fm-corazon__dia">{fechaPuntos.split(".").slice(0, 2).join(".")}</span>
            <span className="fm-corazon__anio">{fechaPuntos.split(".")[2]}</span>
          </p>
        </div>

        <div className="fm-pieza fm-pieza--disco" style={pieza(920)}>
          {/* El disco gira mientras suena la música, como en un tocadiscos.
              Tocarlo la pausa o la vuelve a poner. */}
          <button
            type="button"
            className={`fm-disco${sonando ? " fm-disco--gira" : ""}`}
            onClick={alternarMusica}
            aria-label={sonando ? "Pausar la música" : "Poner la música"}
            aria-pressed={sonando}
          >
            <span className="fm-disco__etiqueta">{iniciales}</span>
          </button>
        </div>
      </div>

      <div className="fm-cuenta" data-abierta={abierta}>
        <p className="fm-volanta">{montado && !faltante ? "Llegó el día" : "Empieza la cuenta regresiva"}</p>
        {!(montado && !faltante) && (
          <div className="fm-cuenta__numeros">
            {numeros.map((n, i) => (
              <div key={i} className="fm-cuenta__unidad">
                <span key={n} className="fm-cuenta__n inv-digito">{n}</span>
                <span className="fm-cuenta__etiqueta">{["Días", "Horas", "Min", "Seg"][i]}</span>
              </div>
            ))}
          </div>
        )}
        <p className="fm-deslizar">Deslizá, que sigue</p>
      </div>
    </section>
  );
}
