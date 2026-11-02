import { Alfa_Slab_One, Arvo, Bodoni_Moda, DM_Sans, DM_Serif_Display, Mrs_Saint_Delafield, Frank_Ruhl_Libre, Cormorant_Garamond, DM_Mono, Cedarville_Cursive, Fraunces, Instrument_Serif, Kaushan_Script, Newsreader, La_Belle_Aurore, Pinyon_Script, Shadows_Into_Light_Two } from "next/font/google";
import "./invitacion.css";
import "./fotomaton.css";
import "./funcion.css";
import "./garabato.css";
import "./cinta.css";
import "./mesa.css";
import "./ciudad.css";
import "./scrapbook.css";
import "./ceramica.css";
import "./horizonte.css";
import "./sobremesa.css";

/* Dos familias y ninguna más.
   Pinyon es una spenceriana de verdad: Dancing Script y Great Vibes son las
   dos scripts de Canva y se reconocen al instante. */
const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/* Cormorant tiene la x chica y mucho contraste: se ve a Garamond impreso.
   Se cargan los pesos bajos nada más, porque en la invitación no hay negritas. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Las del estilo fotomatón. Sin precarga: Rosa no las usa, y precargarlas
   en todas las invitaciones sería bajar fuentes que nadie ve. */
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  preload: false,
});

const mono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

/* Las del estilo garabato: mayúsculas de marcador y birome. Sin precarga. */
const mano = Shadows_Into_Light_Two({
  variable: "--font-mano",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const firma = La_Belle_Aurore({
  variable: "--font-firma",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

/* Las del estilo cinta: pincel para los nombres, birome y un serif blando. */
const pincel = Kaushan_Script({ variable: "--font-pincel", subsets: ["latin"], weight: "400", display: "swap", preload: false });
const birome = Cedarville_Cursive({ variable: "--font-birome", subsets: ["latin"], weight: "400", display: "swap", preload: false });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap", preload: false });

/* Las del estilo mesa: un serif de revista para los títulos y uno de libro para leer. */
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap", preload: false });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });

/* Las del estilo ciudad: slab de imprenta como la tarjeta de referencia, y una
   serif hebrea de verdad para los nombres en hebreo. */
const arvo = Arvo({ variable: "--font-arvo", subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false });
const alfa = Alfa_Slab_One({ variable: "--font-alfa", subsets: ["latin"], weight: "400", display: "swap", preload: false });
const frank = Frank_Ruhl_Libre({ variable: "--font-frank", subsets: ["hebrew"], weight: ["700"], display: "swap", preload: false });

/* Las del estilo scrapbook (quince): firma manuscrita, serif de revista y sans para datos. */
const delafield = Mrs_Saint_Delafield({ variable: "--font-delafield", subsets: ["latin"], weight: "400", display: "swap", preload: false });
const dmSerif = DM_Serif_Display({ variable: "--font-dmserif", subsets: ["latin"], weight: "400", display: "swap", preload: false });
const dmSans = DM_Sans({ variable: "--font-dmsans", subsets: ["latin"], display: "swap", preload: false });

export default function InvitacionLayout({ children }: { children: React.ReactNode }) {
  return <div className={`inv ${pinyon.variable} ${cormorant.variable} ${bodoni.variable} ${mono.variable} ${mano.variable} ${firma.variable} ${pincel.variable} ${birome.variable} ${fraunces.variable} ${instrument.variable} ${newsreader.variable} ${arvo.variable} ${alfa.variable} ${frank.variable} ${delafield.variable} ${dmSerif.variable} ${dmSans.variable}`}>{children}</div>;
}
