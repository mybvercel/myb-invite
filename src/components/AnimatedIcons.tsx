"use client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ANIMATED ICON LIBRARY — Self-contained SVG icons with real CSS animations
//  Each icon animates itself: heartbeat, ticking clock, bouncing pin, etc.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React from "react";

type IconProps = { color?: string; size?: number; className?: string };

/* ── CSS keyframes shared (injected once per icon type via <style>) ── */

// 1. HEART — pulso real (contracción + expansión)
export function HeartAnimIcon({ color = "#d4af37", size = 32 }: IconProps) {
  const id = "anim-heart";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" overflow="visible">
      <style>{`
        @keyframes ${id} {
          0%, 100% { transform: scale(1); }
          10% { transform: scale(1.28); }
          20% { transform: scale(1.05); }
          30% { transform: scale(1.20); }
          40% { transform: scale(1); }
        }
        .${id} { transform-origin: center; animation: ${id} 1.5s ease-in-out infinite; }
      `}</style>
      <g className={id}>
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill={color}
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

// 2. CLOCK — agujas que giran (minutero rápido, horario lento)
export function ClockAnimIcon({ color = "#d4af37", size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <style>{`
        @keyframes anim-clock-min { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes anim-clock-hr  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .anim-clock-min { transform-origin: 12px 12px; animation: anim-clock-min 4s linear infinite; }
        .anim-clock-hr  { transform-origin: 12px 12px; animation: anim-clock-hr 48s linear infinite; }
      `}</style>
      {/* Círculo exterior */}
      <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.5" />
      {/* Minutero */}
      <line className="anim-clock-min" x1="12" y1="12" x2="12" y2="4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Horario */}
      <line className="anim-clock-hr" x1="12" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Centro */}
      <circle cx="12" cy="12" r="1.2" fill={color} />
    </svg>
  );
}

// 3. MAP PIN — rebota y aterriza en loop
export function PinAnimIcon({ color = "#d4af37", size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" overflow="visible">
      <style>{`
        @keyframes anim-pin-drop {
          0%, 100% { transform: translateY(0); }
          20% { transform: translateY(-7px); }
          40% { transform: translateY(-2px); }
          55% { transform: translateY(-5px); }
          70% { transform: translateY(0); }
        }
        @keyframes anim-pin-shadow {
          0%, 100% { transform: scaleX(1); opacity: 0.35; }
          20% { transform: scaleX(0.5); opacity: 0.15; }
          70% { transform: scaleX(1); opacity: 0.35; }
        }
        .anim-pin { transform-origin: 12px 21px; animation: anim-pin-drop 2s cubic-bezier(.36,.07,.19,.97) infinite; }
        .anim-pin-shadow { transform-origin: 12px 22.5px; animation: anim-pin-shadow 2s ease-in-out infinite; }
      `}</style>
      <g className="anim-pin">
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill={color}
          opacity="0.9"
        />
        <circle cx="12" cy="9" r="2.8" fill="white" opacity="0.85" />
      </g>
      {/* Sombra del pin */}
      <ellipse className="anim-pin-shadow" cx="12" cy="22.5" rx="3" ry="1" fill={color} />
    </svg>
  );
}

// 4. GIFT — tiembla / se sacude de emoción
export function GiftAnimIcon({ color = "#d4af37", size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" overflow="visible">
      <style>{`
        @keyframes anim-gift-shake {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-8deg); }
          20% { transform: rotate(8deg); }
          30% { transform: rotate(-6deg); }
          40% { transform: rotate(6deg); }
          50% { transform: rotate(-3deg); }
          60% { transform: rotate(3deg); }
          70% { transform: rotate(0deg); }
        }
        @keyframes anim-gift-bow {
          0%, 100% { transform: scaleY(1); }
          30% { transform: scaleY(1.15); }
          60% { transform: scaleY(0.9); }
        }
        .anim-gift { transform-origin: 12px 18px; animation: anim-gift-shake 2.5s ease-in-out infinite; }
        .anim-gift-bow { transform-origin: 12px 8px; animation: anim-gift-bow 2.5s ease-in-out infinite; }
      `}</style>
      <g className="anim-gift">
        {/* Caja */}
        <rect x="3" y="11" width="18" height="11" rx="2" fill={color} opacity="0.85" />
        <rect x="3" y="7" width="18" height="4" rx="1.5" fill={color} />
        {/* Línea central */}
        <line x1="12" y1="7" x2="12" y2="22" stroke="white" strokeWidth="1.5" opacity="0.7" />
        {/* Línea horizontal de la tapa */}
        <line x1="3" y1="11" x2="21" y2="11" stroke="white" strokeWidth="1" opacity="0.5" />
        {/* Moño */}
        <g className="anim-gift-bow">
          <path d="M12 7C12 7 9 3 6.5 4C4 5 5 8 8 8C9.5 8 11 7 12 7Z" fill="white" opacity="0.9" />
          <path d="M12 7C12 7 15 3 17.5 4C20 5 19 8 16 8C14.5 8 13 7 12 7Z" fill="white" opacity="0.9" />
          <circle cx="12" cy="7" r="1.5" fill={color} />
        </g>
      </g>
    </svg>
  );
}

// 5. CAMERA — parpadeo de flash + obturador
export function CameraAnimIcon({ color = "#d4af37", size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <style>{`
        @keyframes anim-cam-flash {
          0%, 80%, 100% { opacity: 0; transform: scale(0.5); }
          40%  { opacity: 1; transform: scale(1.4); }
        }
        @keyframes anim-cam-lens {
          0%, 100% { r: 3.5; }
          40% { r: 2.8; }
          45% { r: 3.8; }
        }
        @keyframes anim-cam-body { 0%, 100% { opacity: 1; } 40% { opacity: 0.7; } }
        .anim-cam-flash { transform-origin: 18px 6px; animation: anim-cam-flash 4s ease-in-out infinite; }
        .anim-cam-body { animation: anim-cam-body 4s ease-in-out infinite; }
      `}</style>
      <g className="anim-cam-body">
        {/* Cuerpo */}
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
          stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Lente */}
        <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.8" />
        <circle cx="12" cy="13" r="1.5" fill={color} opacity="0.6" />
      </g>
      {/* Flash */}
      <polygon
        className="anim-cam-flash"
        points="18,2 20,6 16,6"
        fill={color}
        opacity="0.9"
      />
    </svg>
  );
}

// 6. QUESTION — se balancea de curiosidad
export function QuestionAnimIcon({ color = "#d4af37", size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" overflow="visible">
      <style>{`
        @keyframes anim-q-swing {
          0%, 100%  { transform: rotate(0deg); }
          20%  { transform: rotate(-12deg); }
          50%  { transform: rotate(12deg); }
          80%  { transform: rotate(-6deg); }
        }
        @keyframes anim-q-dot {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.6); }
        }
        .anim-q-swing { transform-origin: 12px 3px; animation: anim-q-swing 2s ease-in-out infinite; }
        .anim-q-dot   { transform-origin: 12px 20px; animation: anim-q-dot 1s ease-in-out infinite; }
      `}</style>
      <g className="anim-q-swing">
        <path
          d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
          stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
      <line className="anim-q-dot" x1="12" y1="17" x2="12" y2="17"
        stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.4" opacity="0.4" />
    </svg>
  );
}

// 7. MUSIC NOTE — salta y gira
export function MusicAnimIcon({ color = "#d4af37", size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" overflow="visible">
      <style>{`
        @keyframes anim-music-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(-5deg); }
          75% { transform: translateY(-3px) rotate(5deg); }
        }
        @keyframes anim-music-wave {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        .anim-music-note   { transform-origin: 12px 16px; animation: anim-music-bounce 1.4s ease-in-out infinite; }
        .anim-music-wave   { transform-origin: 20px 12px; animation: anim-music-wave 1.4s ease-in-out infinite; }
        .anim-music-wave2  { transform-origin: 22px 12px; animation: anim-music-wave 1.4s ease-in-out infinite 0.3s; }
      `}</style>
      <g className="anim-music-note">
        <path d="M9 18V5l12-2v13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="18" r="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
        <circle cx="18" cy="16" r="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
      </g>
      {/* Ondas */}
      <text className="anim-music-wave"  x="20" y="10" fontSize="5" fill={color}>♪</text>
      <text className="anim-music-wave2" x="22" y="7"  fontSize="4" fill={color}>♫</text>
    </svg>
  );
}

// 8. HOTEL / LOGÍSTICA — edificio que pulsa (ventanas que se iluminan)
export function HotelAnimIcon({ color = "#d4af37", size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <style>{`
        @keyframes anim-win-1 { 0%,100%{opacity:0.2;} 25%{opacity:1;} }
        @keyframes anim-win-2 { 0%,100%{opacity:0.2;} 50%{opacity:1;} }
        @keyframes anim-win-3 { 0%,100%{opacity:0.2;} 75%{opacity:1;} }
        .anim-win-1 { animation: anim-win-1 2.4s ease-in-out infinite; }
        .anim-win-2 { animation: anim-win-2 2.4s ease-in-out infinite; }
        .anim-win-3 { animation: anim-win-3 2.4s ease-in-out infinite; }
      `}</style>
      {/* Edificio */}
      <rect x="4" y="4" width="16" height="18" rx="1.5" stroke={color} strokeWidth="1.5" />
      <line x1="4" y1="9" x2="20" y2="9" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="4" y1="14" x2="20" y2="14" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="4" x2="12" y2="22" stroke={color} strokeWidth="1" opacity="0.5" />
      {/* Puerta */}
      <rect x="9.5" y="16" width="5" height="6" rx="0.5" stroke={color} strokeWidth="1.2" />
      {/* Ventanas animadas */}
      <rect className="anim-win-1" x="5.5" y="5.5" width="3" height="2" rx="0.5" fill={color} />
      <rect className="anim-win-2" x="10.5" y="5.5" width="3" height="2" rx="0.5" fill={color} />
      <rect className="anim-win-3" x="15.5" y="5.5" width="3" height="2" rx="0.5" fill={color} />
      <rect className="anim-win-3" x="5.5" y="10.5" width="3" height="2" rx="0.5" fill={color} />
      <rect className="anim-win-1" x="15.5" y="10.5" width="3" height="2" rx="0.5" fill={color} />
    </svg>
  );
}

// 9. SPARKLE / ESTRELLA — destella y rota
export function SparkleAnimIcon({ color = "#d4af37", size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" overflow="visible">
      <style>{`
        @keyframes anim-sparkle-main {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25%  { transform: rotate(90deg) scale(1.1); }
          50%  { transform: rotate(180deg) scale(0.9); }
          75%  { transform: rotate(270deg) scale(1.1); }
        }
        @keyframes anim-sparkle-small {
          0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(45deg); }
        }
        .anim-sparkle-main  { transform-origin: 12px 12px; animation: anim-sparkle-main 3s ease-in-out infinite; }
        .anim-sparkle-s1    { transform-origin: 5px 5px; animation: anim-sparkle-small 3s ease-in-out infinite 0s; }
        .anim-sparkle-s2    { transform-origin: 19px 5px; animation: anim-sparkle-small 3s ease-in-out infinite 1s; }
        .anim-sparkle-s3    { transform-origin: 19px 19px; animation: anim-sparkle-small 3s ease-in-out infinite 2s; }
      `}</style>
      {/* Estrella principal */}
      <g className="anim-sparkle-main">
        <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
          fill={color} opacity="0.9" />
      </g>
      {/* Estrellas pequeñas */}
      <g className="anim-sparkle-s1">
        <path d="M5 5 L5.5 7 L7 7 L5.5 8 L5 10 L4.5 8 L3 7 L4.5 6 Z" fill={color} opacity="0.7" />
      </g>
      <g className="anim-sparkle-s2">
        <path d="M19 5 L19.5 7 L21 7 L19.5 8 L19 10 L18.5 8 L17 7 L18.5 6 Z" fill={color} opacity="0.7" />
      </g>
      <g className="anim-sparkle-s3">
        <path d="M19 14 L19.5 16 L21 16 L19.5 17 L19 19 L18.5 17 L17 16 L18.5 15 Z" fill={color} opacity="0.6" />
      </g>
    </svg>
  );
}

// 10. DRESS CODE — vestido que se mece suavemente
export function DressAnimIcon({ color = "#d4af37", size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" overflow="visible">
      <style>{`
        @keyframes anim-dress-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-4deg); }
          75% { transform: rotate(4deg); }
        }
        .anim-dress { transform-origin: 12px 4px; animation: anim-dress-sway 3s ease-in-out infinite; }
      `}</style>
      <g className="anim-dress">
        <path d="M8 3h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 3C8 5 6 7 4 8l2 13h12l2-13c-2-1-4-3-5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill={color} fillOpacity="0.12"/>
        <path d="M9 3l3 5 3-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 14h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5"/>
      </g>
    </svg>
  );
}

// 11. SUIT / TRAJE — levitación con oscilación
export function SuitAnimIcon({ color = "#d4af37", size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" overflow="visible">
      <style>{`
        @keyframes anim-suit-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .anim-suit { animation: anim-suit-float 2.5s ease-in-out infinite; }
      `}</style>
      <g className="anim-suit">
        <path d="M8 3H6L4 8l4 3V21h8V11l4-3-2-5h-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1"/>
        <path d="M8 3c0 2 1.5 4 4 5 2.5-1 4-3 4-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8v5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5"/>
        <path d="M10 10l2 2 2-2" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5"/>
      </g>
    </svg>
  );
}

// 12. GEM / JOYA — brilla y rota suavemente
export function GemAnimIcon({ color = "#d4af37", size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" overflow="visible">
      <style>{`
        @keyframes anim-gem-shine {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 0px transparent); }
          50% { transform: scale(1.08) rotate(5deg); filter: drop-shadow(0 0 6px currentColor); }
        }
        @keyframes anim-gem-glint {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
        .anim-gem-shine { transform-origin: 12px 12px; animation: anim-gem-shine 2s ease-in-out infinite; }
        .anim-gem-glint { animation: anim-gem-glint 2s ease-in-out infinite; }
      `}</style>
      <g className="anim-gem-shine" style={{ color }}>
        <path d="M6 3h12l4 6-10 12L2 9z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.15"/>
        <path d="M2 9h20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 3l4 6m4 0l4-6" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.45"/>
      </g>
      {/* Destello */}
      <line className="anim-gem-glint" x1="10" y1="4" x2="8" y2="2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line className="anim-gem-glint" x1="14" y1="3" x2="16" y2="1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
