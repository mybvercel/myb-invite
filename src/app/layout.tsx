import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import "./invitaciones.css";
import "./bento.css";
import MetaPixel from "@/components/MetaPixel";
import { MARCA, SITE_URL } from "@/lib/site";
import { GOOGLE_ESCRIBIR } from "@/lib/invitaciones";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

/* Montserrat, con todo el rango de pesos: los títulos van en 300 y los
   remates en 600, y ese contraste es lo que sostiene la elegancia. */
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], display: "swap" });

// Nunca se deshabilita el zoom: accesibilidad.
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MyB Invite | Invitaciones digitales para casamientos, cumpleaños y eventos",
    template: "%s · MyB Invite",
  },
  description:
    "MyB Invite: invitaciones digitales interactivas para casamientos, cumpleaños y eventos profesionales. Cuenta regresiva, ubicación con mapa, confirmación de asistencia automática y álbum de fotos. Pago único, entrega en 3 días.",
  keywords: [
    "MyB Invite",
    "mybinvite",
    "invitaciones digitales",
    "invitaciones web casamiento",
    "tarjetas digitales cumpleaños",
    "invitaciones para eventos profesionales",
    "confirmación de asistencia online",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "MyB Invite",
    // La vista previa de WhatsApp: un sobre con el sello de MyB.
    images: [{ url: "/og-myb.jpg", width: 1200, height: 630, alt: "MyB Invitation, invitaciones digitales" }],
    title: "MyB Invite | Invitaciones digitales para casamientos, cumpleaños y eventos",
    description:
      "La invitación que tus invitados abren en el celular: cuenta regresiva, mapa, confirmación automática y álbum de fotos compartido.",
  },
  twitter: { card: "summary_large_image", images: ["/og-myb.jpg"] },
  robots: { index: true, follow: true },
};

/**
 * Todo el sitio es Tu Invitación Digital. El contenedor .tid aísla sus
 * estilos y carga la tipografía y los tokens. La barra y el pie los pone el
 * grupo (sitio), para que las demos de /demo y las invitaciones de /i se vean
 * como la real: a pantalla completa y sin nada alrededor.
 */
/**
 * Le dice a Google cómo se llama el sitio y la empresa. Sin esto "MyB Invite"
 * se confunde con "My Invite", que es otra marca.
 */
const DATOS_ESTRUCTURADOS = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#sitio`,
      url: SITE_URL,
      name: MARCA,
      alternateName: ["MyB Invite", "MyBInvite", "mybinvite.com", "Tu Invitación Digital"],
      inLanguage: "es-AR",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#empresa`,
      name: MARCA,
      alternateName: ["MyB Invite", "Tu Invitación Digital", "MyB Digitals"],
      url: SITE_URL,
      logo: `${SITE_URL}/LogoMyB.png`,
      description: "Invitaciones digitales para casamientos, cumpleaños y eventos, con confirmación de asistencia y panel de invitados.",
      areaServed: "AR",
      address: { "@type": "PostalAddress", addressLocality: "Córdoba", addressCountry: "AR" },
      sameAs: [GOOGLE_ESCRIBIR.replace("/review", "")],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <div className={`tid ${montserrat.variable}`}>{children}</div>
        <MetaPixel />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(DATOS_ESTRUCTURADOS) }}
        />
      </body>
    </html>
  );
}
