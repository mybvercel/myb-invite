"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const PIXEL_ID = "988182571003292";

/**
 * Meta Pixel. Se carga en la página de venta y en las invitaciones, pero NO en
 * el panel del organizador ni en los links personales de cada familia: esas
 * URLs llevan la clave o el nombre de gente real y no deben viajar a Meta.
 */
const PRIVADAS = [/^\/panel(\/|$)/, /^\/i\/[^/]+\/para(\/|$)/, /^\/i\/[^/]+\/lista(\/|$)/];

type Fbq = (...args: unknown[]) => void;

export default function MetaPixel() {
  const pathname = usePathname() ?? "/";
  const primera = useRef(true);
  const privada = PRIVADAS.some((r) => r.test(pathname));

  // El snippet ya manda el PageView de la primera carga. Las navegaciones
  // siguientes (Link de Next, sin recargar) hay que avisarlas a mano.
  useEffect(() => {
    if (privada) return;
    if (primera.current) {
      primera.current = false;
      return;
    }
    (window as unknown as { fbq?: Fbq }).fbq?.("track", "PageView");
  }, [pathname, privada]);

  // Lead: cada toque a un enlace de WhatsApp ("Quiero esta", "Escribinos",
  // "Consultar diseño"). WhatsApp abre afuera del sitio, así que no se puede
  // medir por URL: el evento sale en el momento del clic.
  useEffect(() => {
    if (privada) return;
    const alTocar = (e: MouseEvent) => {
      const enlace = (e.target as HTMLElement | null)?.closest?.("a[href*='wa.me']");
      if (!enlace) return;
      const nombre = (enlace.textContent ?? "").trim().slice(0, 60) || "WhatsApp";
      (window as unknown as { fbq?: Fbq }).fbq?.("track", "Lead", { content_name: nombre });
    };
    document.addEventListener("click", alTocar);
    return () => document.removeEventListener("click", alTocar);
  }, [privada]);

  if (privada) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
      `}</Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}
