import Image from "next/image";
import Link from "next/link";
import { WHATSAPP } from "@/lib/invitaciones";

/**
 * La barra y el pie de Tu Invitación Digital. Viven en el grupo (sitio) y no
 * en el layout de arriba a propósito: las demos de /demo tienen que verse como
 * la invitación de verdad, sin chrome alrededor.
 */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="tid-fondo" aria-hidden="true" />

      <div className="tid-capa">
        <header className="tid-barra">
          <div className="tid-marco tid-barra__interior">
            <Link href="/" className="tid-logo">
              <Image
                src="/LogoMyB.png"
                alt=""
                width={28}
                height={28}
                className="tid-logo__marca"
                priority
              />
              Tu Invitación Digital
            </Link>

            <a
              className="tid-boton tid-boton--linea tid-barra__cta"
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribinos
            </a>
          </div>
        </header>

        <main>{children}</main>

        <footer className="tid-pie">
          <div className="tid-marco tid-pie__interior">
            <p className="tid-nota">
              © {new Date().getFullYear()} Tu Invitación Digital · Córdoba, Argentina
            </p>
            <p className="tid-nota">
              Un producto de{" "}
              <a href="https://www.mybdigitals.com" className="tid-pie__enlace">
                MYB Digitals
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
