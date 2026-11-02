import { Cormorant_Garamond, Instrument_Serif } from "next/font/google";
import "./panel.css";

/* Todo el panel va en Montserrat, la misma de la marca (la carga el layout de
   /). Las dos serif son sólo para el nombre del evento y
   se eligen desde Estilo. */

const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant-panel", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata = {
  title: "Panel del evento",
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`pnl-fuentes ${instrument.variable} ${cormorant.variable}`}>
      {children}
    </div>
  );
}
