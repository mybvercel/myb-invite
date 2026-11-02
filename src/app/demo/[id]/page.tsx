"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Clock, Map, MapPin, Pause, Play, ChevronDown, ChevronLeft, ChevronRight, ImagePlus, CheckCircle, Heart } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import CumplesTemplate from "@/components/CumplesTemplate";
import {
  HeartAnimIcon,
  ClockAnimIcon,
  PinAnimIcon,
  GiftAnimIcon,
  CameraAnimIcon,
  QuestionAnimIcon,
  HotelAnimIcon,
  DressAnimIcon,
  SuitAnimIcon,
  GemAnimIcon,
  SparkleAnimIcon,
} from "@/components/AnimatedIcons";

// ── BASE CONTENIDO POR TIPO ──

const baseBodasContent = {
  historyLine: "Hay recuerdos que no voy a borrar, personas que no voy a olvidar y lugares donde siempre voy a querer estar...",
  gallery: [
     "/fotos_boda/foto1.jpg",
     "/fotos_boda/foto2.jpg",
     "/fotos_boda/foto3.jpg",
     "/fotos_boda/foto4.jpg",
     "/fotos_boda/foto5.jpg",
  ],
  locations: [
    { type: "Ceremonia", title: "Catedral Nuestra Señora", time: "18:00 hs", link: "https://maps.google.com/?q=Catedral", address: "Av. Principal 123", icon: MapPin },
    { type: "Fiesta", title: "Salón La Perla", time: "20:00 hs", link: "https://maps.google.com/?q=Salon", address: "Ruta 9, Km 13", icon: Map }
  ],
  dressCode: { title: "Elegante Formal", info: "Por favor, reservá el color blanco para la novia." },
  gifts: {
     message: "El mejor regalo es tu presencia. Pero si querés sumarte a nuestra luna de miel, podés hacerlo acá:",
     bank: "XXXXXXXXXX", cbu: "XXXXXXXXXXXXXXXXXXXXXX", alias: "XXXXX.XXXXX", name: "XXXXXXXXXX"
  },
  mural: true,
  music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
  instagram: "nuestraboda2026",
  logistics: {
     hotels: "Contamos con tarifas especiales en el Hotel Principal (10% OFF mencionando el casamiento).",
     transport: "Saldrán micros desde Plaza Centro a las 17:30 hs puntuales."
  }
};

const baseCumplesContent = {
  historyLine: "Los momentos más lindos son los que compartimos con las personas que queremos...",
  gallery: [
     "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1600&q=90",
     "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=90",
     "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=90",
     "https://images.unsplash.com/photo-1516054575922-f0b8eeadec1a?auto=format&fit=crop&w=1600&q=90",
     "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=90",
  ],
  locations: [
    { type: "Fiesta", title: "Salón Crystal", time: "21:30 hs", link: "https://maps.google.com/?q=Salon", address: "Calle Soñada 456", icon: Map }
  ],
  dressCode: { title: "Gala Inolvidable", info: "Un detalle brillante o rosa pálido." },
  gifts: {
     message: "Tu presencia es mi mejor regalo. Si querés hacerlo especial aún más, podés dejarme un detalle acá:",
     bank: "XXXXXXXXXX", cbu: "XXXXXXXXXXXXXXXXXXXXXX", alias: "XXXXX.XXXXX", name: "XXXXXXXXXX"
  },
  mural: true,
  music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
  instagram: "mis15party",
  logistics: {
     transport: "Micros disponibles desde el centro a las 20:30."
  }
};

// ── TRIVIA PERSONALIZADA POR DISEÑO ──

const triviaBodas: Record<string, {q: string; options: string[]; correct: number}[]> = {
  "1": [
    { q: "¿Dónde se conocieron Marti y Tomi?", options: ["En la uni", "En el trabajo", "Por amigos en común"], correct: 2 },
    { q: "¿Quién propuso el primer plan?", options: ["Marti", "Tomi", "Los dos a la vez"], correct: 1 },
    { q: "¿Cuál es su comida favorita juntos?", options: ["Pizza", "Sushi", "Asado del domingo"], correct: 2 },
  ],
  "2": [
    { q: "¿Cuántos años llevan juntos Julieta y Marcos?", options: ["2 años", "5 años", "8 años"], correct: 1 },
    { q: "¿Cuál es el destino soñado de luna de miel?", options: ["Europa", "Caribe", "Patagonia"], correct: 0 },
    { q: "¿Quién cocina mejor en la pareja?", options: ["Julieta", "Marcos", "Piden delivery siempre"], correct: 0 },
  ],
  "3": [
    { q: "¿Dónde fue la primera cita de Lisa y Hernán?", options: ["Un café", "Un parque", "Un concierto"], correct: 2 },
    { q: "¿Cuál es la mascota de la pareja?", options: ["Un gato", "Un perro", "No tienen"], correct: 0 },
    { q: "¿Cuál es su película favorita juntos?", options: ["El padrino", "Titanic", "La La Land"], correct: 2 },
  ],
  "4": [
    { q: "¿En qué ciudad se conocieron Candela y Elías?", options: ["Buenos Aires", "Córdoba", "Rosario"], correct: 1 },
    { q: "¿Cuál es el hobby compartido de la pareja?", options: ["Senderismo", "Fotografía", "Cocinar"], correct: 1 },
    { q: "¿Quién es más madrugador?", options: ["Candela", "Elías", "Ninguno, son nocturnos"], correct: 2 },
  ],
  "5": [
    { q: "¿Cuál es la canción del primer baile de Georgina y Joaquín?", options: ["Un bolero", "Un tango", "Una cumbia romántica"], correct: 1 },
    { q: "¿Cuántos años tiene la pareja junta?", options: ["3 años", "6 años", "9 años"], correct: 1 },
    { q: "¿Cuál es el destino favorito para escapadas?", options: ["El mar", "La montaña", "La ciudad"], correct: 1 },
  ],
  "6": [
    { q: "¿Quién propuso primero en la pareja?", options: ["Stefi", "Nico", "Fue sorpresa para los dos"], correct: 1 },
    { q: "¿Cuál es el plan preferido del finde?", options: ["Salir de noche", "Día de campo", "Películas en casa"], correct: 2 },
    { q: "¿A quién de los dos le gusta más el café?", options: ["Stefi", "Nico", "Los dos son adictos"], correct: 2 },
  ],
  "7": [
    { q: "¿Cuánto tiempo llevan juntos Anto y Fer?", options: ["1 año", "4 años", "7 años"], correct: 1 },
    { q: "¿Cuál es su lugar favorito para comer?", options: ["En casa", "Bodegón del barrio", "Restaurante fancy"], correct: 1 },
    { q: "¿Cuál fue el primer viaje juntos?", options: ["Mar del Plata", "Mendoza", "Iguazú"], correct: 0 },
  ],
  "8": [
    { q: "¿Qué deporte practican juntos Valentina y Lucas?", options: ["Tenis", "Running", "Ciclismo"], correct: 1 },
    { q: "¿Cuál es el lugar ideal para sus vacaciones?", options: ["Playa tropical", "Ciudad europea", "Parque nacional"], correct: 0 },
    { q: "¿Quién es más ordenado en la pareja?", options: ["Valentina", "Lucas", "Es complejo..."], correct: 0 },
  ],
};

const triviaCumples: Record<string, {q: string; options: string[]; correct: number}[]> = {
  "1": [
    { q: "¿Cuál es la comida favorita de Mía?", options: ["Sushi", "Milanesa con papas", "Pasta"], correct: 0 },
    { q: "¿Qué música no puede faltar en la fiesta de Mía?", options: ["Reggaetón", "Pop", "Cumbia"], correct: 0 },
    { q: "¿Cuál es el color favorito de Mía?", options: ["Violeta", "Rosa", "Azul"], correct: 0 },
  ],
  "2": [
    { q: "¿Qué destino sueña visitar Delfina?", options: ["Japón", "París", "Nueva York"], correct: 1 },
    { q: "¿Cuál es la serie favorita de Delfina?", options: ["Stranger Things", "Élite", "Gossip Girl"], correct: 2 },
    { q: "¿Qué tipo de fiesta le encanta a Delfina?", options: ["Tranquila y íntima", "Épica con muchos amigos", "Solo con la familia"], correct: 1 },
  ],
  "3": [
    { q: "¿Cuál es el postre favorito de Valentina?", options: ["Cheesecake", "Tiramisu", "Alfajores"], correct: 0 },
    { q: "¿Qué hobby tiene Valentina?", options: ["Pintura", "Baile", "Fotografía"], correct: 1 },
    { q: "¿Cuántos amigos tiene Valentina en su grupo close?", options: ["3 o 4", "Entre 8 y 10", "Es muy sociable, más de 15"], correct: 1 },
  ],
  "4": [
    { q: "¿Cuál es el género musical que más escucha Camila?", options: ["Pop en español", "K-pop", "Trap latino"], correct: 1 },
    { q: "¿Qué hace Camila cuando está sola en casa?", options: ["Ve series", "Cocina", "Sale igual"], correct: 0 },
    { q: "¿Cuál es el animal favorito de Camila?", options: ["Gato", "Perro", "Conejo"], correct: 0 },
  ],
  "5": [
    { q: "¿Cuál es el deporte favorito de Martina?", options: ["Vóley", "Natación", "Tenis"], correct: 0 },
    { q: "¿Qué le regalarías a Martina si pudieras?", options: ["Un viaje", "Ropa de marca", "Una cena especial"], correct: 0 },
    { q: "¿Cuál es la película favorita de Martina?", options: ["Mamma Mia", "El diablo viste a la moda", "Crepúsculo"], correct: 0 },
  ],
  "6": [
    { q: "¿En qué barrio vive Luna?", options: ["El centro", "Las afueras", "Cerca de la playa"], correct: 2 },
    { q: "¿Cuál es el snack favorito de Luna?", options: ["Palomitas", "Papas fritas", "Oreos"], correct: 2 },
    { q: "¿Qué hace Luna los domingos?", options: ["Duerme hasta tarde", "Sale a caminar", "Visita a la familia"], correct: 0 },
  ],
  "7": [
    { q: "¿Cuál es la estación del año favorita de Sol?", options: ["Verano", "Primavera", "Otoño"], correct: 0 },
    { q: "¿Qué tipo de música suele escuchar Sol?", options: ["Indie pop", "Cumbia", "Clásica"], correct: 0 },
    { q: "¿Cuál es el superpoder que le gustaría tener a Sol?", options: ["Volar", "Ser invisible", "Teletransportarse"], correct: 2 },
  ],
  "8": [
    { q: "¿Cuál es la comida favorita de Renata?", options: ["Tacos", "Pizza", "Empanadas"], correct: 2 },
    { q: "¿Qué plan elige Renata para su cumple?", options: ["Viaje sorpresa", "Fiesta épica", "Cena íntima"], correct: 1 },
    { q: "¿Cuál es el emoji que más usa Renata?", options: ["😂", "🌸", "🔥"], correct: 1 },
  ],
};

// ── BASE DE DATOS DEMOS (fechas 2026/2027 para countdown funcional) ──
const demoDataBase: Record<string, any> = {
  // BODAS — todas con fechas futuras para que el countdown funcione
  "bodas-1": { ...baseBodasContent, trivia: triviaBodas["1"], names: "Marti & Tomi", gateTitle: "Nuestra Boda", decorGate: "/fotos_boda/foto1.jpg", bgHero: "/fotos_boda/foto1.jpg", date: "15 de Noviembre 2026", font: "Georgia, serif", colorAccent: "#e11d48", colorBg: "#faf8f6", styleType: "photo", opacityHero: 0.15 },
  "bodas-2": { ...baseBodasContent, trivia: triviaBodas["2"], names: "Julieta & Marcos", gateTitle: "Nos Casamos", decorGate: "/fotos_boda/foto2.jpg", bgHero: "/fotos_boda/foto2.jpg", date: "22 de Marzo 2027", font: "Arial, sans-serif", colorAccent: "#60a5fa", colorBg: "#f0f4f8", styleType: "photo", opacityHero: 0.2 },
  "bodas-3": { ...baseBodasContent, trivia: triviaBodas["3"], names: "Lisa & Hernán", gateTitle: "Celebramos", decorGate: "https://images.unsplash.com/photo-1596431940984-7eaf9bd80de5?auto=format&fit=crop&w=1200&q=90", bgHero: "https://images.unsplash.com/photo-1596431940984-7eaf9bd80de5?auto=format&fit=crop&w=1920&q=90", date: "16 de Septiembre 2026", font: "Geist Sans, sans-serif", colorAccent: "#4b5548", colorBg: "#fdfbf7", styleType: "watercolor", opacityHero: 0.1 },
  "bodas-4": { ...baseBodasContent, trivia: triviaBodas["4"], names: "Candela & Elías", gateTitle: "Gran Día", decorGate: "/fotos_boda/foto3.jpg", bgHero: "/fotos_boda/foto3.jpg", date: "08 de Junio 2026", font: "Courier New, monospace", colorAccent: "#4b5563", colorBg: "#f3f4f6", styleType: "photo", opacityHero: 0.2 },
  "bodas-5": { ...baseBodasContent, trivia: triviaBodas["5"], names: "Georgina & Joaquín", gateTitle: "Sunset Boho", decorGate: "/fotos_boda/foto4.jpg", bgHero: "/fotos_boda/foto4.jpg", date: "30 de Agosto 2026", font: "Palatino, serif", colorAccent: "#f0a58f", colorBg: "#fff6f5", styleType: "photo", opacityHero: 0.15 },
  "bodas-6": { ...baseBodasContent, trivia: triviaBodas["6"], names: "Stefi & Nico", gateTitle: "Monograma Elegante", decorGate: "https://images.unsplash.com/photo-1579549321487-3cb83e5a5960?auto=format&fit=crop&w=1200&q=90", bgHero: "https://images.unsplash.com/photo-1579549321487-3cb83e5a5960?auto=format&fit=crop&w=1920&q=90", date: "20 de Diciembre 2026", font: "Georgia, serif", colorAccent: "#611a28", colorBg: "#ffffff", styleType: "watercolor", opacityHero: 0.1 },
  "bodas-7": { ...baseBodasContent, trivia: triviaBodas["7"], names: "Anto & Fer", gateTitle: "Lavanda Clásica", decorGate: "https://images.unsplash.com/photo-1543362143-6c84b1ebac1d?auto=format&fit=crop&w=1200&q=90", bgHero: "https://images.unsplash.com/photo-1543362143-6c84b1ebac1d?auto=format&fit=crop&w=1920&q=90", date: "14 de Octubre 2026", font: "Arial, sans-serif", colorAccent: "#a78bfa", colorBg: "#fcfcff", styleType: "watercolor", opacityHero: 0.08 },
  "bodas-8": { ...baseBodasContent, trivia: triviaBodas["8"], names: "Valentina & Lucas", gateTitle: "El Gran Día", decorGate: "/fotos_boda/foto5.jpg", bgHero: "/fotos_boda/foto5.jpg", date: "11 de Octubre 2026", font: "Arial, sans-serif", colorAccent: "#64748b", colorBg: "#fafafa", styleType: "photo", opacityHero: 0.15 },

  // CUMPLES
  "cumples-1": { ...baseCumplesContent, trivia: triviaCumples["1"], names: "Mía", gateTitle: "Mis 15 Años", decorGate: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=90", bgHero: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1920&q=90", date: "10 Diciembre 2026", font: "Arial, sans-serif", colorAccent: "#a855f7", styleType: "photo", opacityHero: 0.25 },
  "cumples-2": { ...baseCumplesContent, trivia: triviaCumples["2"], names: "Delfina", gateTitle: "Mis 15", decorGate: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=90", bgHero: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=90", date: "24 Mayo 2026", font: "Georgia, serif", colorAccent: "#eaac8b", styleType: "watercolor", opacityHero: 0.1 },
  "cumples-3": { ...baseCumplesContent, trivia: triviaCumples["3"], names: "Valentina", gateTitle: "Golden Sweet", bgHero: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=90", date: "15 de Agosto 2026", font: "Palatino, serif", colorAccent: "#eab308", styleType: "photo", opacityHero: 0.15 },
  "cumples-4": { ...baseCumplesContent, trivia: triviaCumples["4"], names: "Camila", gateTitle: "Gala Rosa", bgHero: "https://images.unsplash.com/photo-1516054575922-f0b8eeadec1a?auto=format&fit=crop&w=1920&q=90", date: "20 Septiembre 2026", font: "Courier New, monospace", colorAccent: "#f43f5e", styleType: "photo", opacityHero: 0.2 },
  "cumples-5": { ...baseCumplesContent, trivia: triviaCumples["5"], names: "Martina", gateTitle: "Mis XV", bgHero: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1920&q=90", date: "05 Febrero 2027", font: "Trebuchet MS, sans-serif", colorAccent: "#3b82f6", styleType: "photo", opacityHero: 0.25 },
  "cumples-6": { ...baseCumplesContent, trivia: triviaCumples["6"], names: "Luna", gateTitle: "Party", bgHero: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=90", date: "18 de Octubre 2026", font: "Inter, sans-serif", colorAccent: "#818cf8", styleType: "photo", opacityHero: 0.2 },
  "cumples-7": { ...baseCumplesContent, trivia: triviaCumples["7"], names: "Sol", gateTitle: "15 Años", bgHero: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1920&q=90", date: "12 Enero 2027", font: "Georgia, serif", colorAccent: "#db2777", styleType: "watercolor", opacityHero: 0.1 },
  "cumples-8": { ...baseCumplesContent, trivia: triviaCumples["8"], names: "Renata", gateTitle: "Mis XV", bgHero: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=1920&q=90", date: "28 Noviembre 2026", font: "Arial, sans-serif", colorAccent: "#ea580c", styleType: "photo", opacityHero: 0.2 },
};

// ── Parsea fechas en español como "10 Diciembre 2025" o "15 de Noviembre 2025" ──
function parseEventDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const monthMap: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  };
  const lower = dateStr.toLowerCase();
  const dayMatch = lower.match(/(\d{1,2})/);
  const yearMatch = lower.match(/(202[0-9]|203[0-9])/);
  let monthNum = -1;
  for (const [name, num] of Object.entries(monthMap)) {
    if (lower.includes(name)) { monthNum = num; break; }
  }
  if (!dayMatch || monthNum === -1) return null;
  const day = parseInt(dayMatch[1], 10);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear() + 1;
  return new Date(year, monthNum, day, 20, 0, 0);
}

function calcTimeLeft(target: Date | null) {
  if (!target) return { d: 0, h: 0, m: 0, s: 0 };
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    s: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

// AnimIcon eliminado — usando AnimatedIcons.tsx con SVG animados reales

// ── Colores por sección (alternancia elegante) ──
// isAccent=true → fondo de color, texto blanco
// isAccent=false → fondo blanco/neutro, color en texto
function sectionStyle(isAccent: boolean, accent: string, bg: string) {
  if (isAccent) {
    return {
      section: { backgroundColor: accent },
      title: { color: "#ffffff" },
      text: { color: "rgba(255,255,255,0.85)" },
      sub: { color: "rgba(255,255,255,0.7)" },
      card: { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" },
      btnBorder: { borderColor: "rgba(255,255,255,0.5)", color: "#fff" },
    };
  }
  return {
    section: { backgroundColor: bg },
    title: { color: accent },
    text: { color: "#374151" },
    sub: { color: "#6b7280" },
    card: { background: "#ffffff", border: "1px solid #e5e7eb" },
    btnBorder: { borderColor: "#d1d5db", color: accent },
  };
}

function SectionTitle({ title, font, style }: { title: string; font: string; style: React.CSSProperties }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="text-4xl text-center mb-10"
      style={{ fontFamily: font, ...style }}
    >
      {title}
    </motion.h2>
  );
}

export default function DemoInvitationPage() {
  const router = useRouter();
  const params = useParams();

  const [data, setData] = useState<any>(null);
  const [guestName, setGuestName] = useState<string>("");
  const [invType, setInvType] = useState<string>("bodas");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const t = urlParams.get("t") || "bodas";
      const id = params?.id || "1";
      const n = urlParams.get("n") || "";
      const key = `${t}-${id}`;
      setData(demoDataBase[key] || demoDataBase["bodas-1"]);
      setGuestName(n);
      setInvType(t);
    }
  }, [params]);

  const [isEntered, setIsEntered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [showGifts, setShowGifts] = useState(false);
  const [triviaIdx, setTriviaIdx] = useState(0);
  const [triviaAns, setTriviaAns] = useState<Record<number, number | null>>({});

  // ── RSVP STATE ──
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpAttending, setRsvpAttending] = useState<"yes" | "no" | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState<number>(1);
  const [rsvpDiet, setRsvpDiet] = useState<Set<string>>(new Set());
  const [rsvpSong, setRsvpSong] = useState("");

  const dietOptions = [
    { id: "ninguna", label: "Sin restricciones" },
    { id: "vegetariano", label: "Vegetariano / Vegano" },
    { id: "sinTacc", label: "Sin TACC (Celíaco)" },
    { id: "lactosa", label: "Intolerante a la lactosa" },
  ];

  const toggleDiet = (id: string) => {
    setRsvpDiet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  type MuralNote = { id: number; type: "note" | "photo"; text?: string; name?: string; color?: string; rotation: number; x: number | string; y: number | string; imageUrl?: string };
  const [notes, setNotes] = useState<MuralNote[]>([
    { id: 1, type: "note", text: "¡Muchas felicidades! Que sea una noche increíble", name: "Tía Marta", color: "#fef08a", rotation: -5, x: "10%", y: "15%" },
    { id: 2, type: "note", text: "Los quiero mucho, a romper la pista", name: "Sofi", color: "#fbcfe8", rotation: 3, x: "45%", y: "15%" },
    { id: 3, type: "photo", name: "Fede y Cami", imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80", rotation: -2, x: "20%", y: "45%" },
  ]);
  const [newNote, setNewNote] = useState("");
  const [newName, setNewName] = useState("");
  const muralRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (guestName && !newName) setNewName(guestName);
  }, [guestName]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const colors = ["#fef08a", "#fbcfe8", "#bbf7d0", "#bfdbfe", "#e9d5ff"];
    setNotes((prev) => [...prev, {
      id: Date.now(), type: "note", text: newNote,
      name: newName || "Invitado",
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.floor(Math.random() * 10) - 5,
      x: "40%", y: "40%",
    }]);
    setNewNote("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setNotes((prev) => [...prev, {
      id: Date.now(), type: "photo", imageUrl: url,
      name: newName || "Invitado",
      rotation: Math.floor(Math.random() * 10) - 5,
      x: "30%", y: "30%",
    }]);
  };

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  // ── COUNTDOWN: corre cada segundo en cuanto data está disponible ──
  useEffect(() => {
    if (!data) return;
    const target = parseEventDate(data.date);
    // Actualizar inmediatamente
    setTimeLeft(calcTimeLeft(target));
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [data]);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);

  if (!data) return <div className="min-h-svh flex items-center justify-center bg-stone-50 text-stone-500 text-sm">Cargando demo...</div>;

  const handleEnter = () => {
    setIsEntered(true);
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  const handleRsvpSubmit = () => {
    if (!rsvpAttending || !rsvpName.trim()) return;
    setRsvpSubmitted(true);
  };

  // ── INYECCIÓN DEL MOTOR NUEVO DE CUMPLES ──
  if (invType === "cumples") {
    return <CumplesTemplate data={data} guestName={guestName} />;
  }

  const accent = data.colorAccent || "#d4af37";
  const bgBase = data.colorBg || "#ffffff";
  const rsvpDeadlineLabel = `Por favor confirmá antes del 1° del mes anterior a la boda.`;

  // Estilos pre-calculados por sección (alternando)
  const s1 = sectionStyle(false, accent, bgBase);       // Historia: fondo blanco, titulo de color
  const s2 = sectionStyle(true,  accent, bgBase);       // Countdown: fondo accent, texto blanco
  const s3 = sectionStyle(false, accent, bgBase);       // Galeria: fondo blanco
  const s4 = sectionStyle(true,  accent, bgBase);       // Ubicación: fondo accent, texto blanco
  const s5 = sectionStyle(false, accent, bgBase);       // Dress + Logística: fondo blanco
  const s6 = sectionStyle(true,  accent, bgBase);       // Regalos: fondo accent, texto blanco
  const s7 = sectionStyle(false, accent, bgBase);       // Trivia: fondo blanco

  return (
    <div className="min-h-svh text-stone-800 font-sans selection:bg-rose-200 overflow-x-hidden relative" style={{ backgroundColor: bgBase }}>
      {/* Textura sutil global para dar efecto "papel texturizado / piedritas" a los fondos lisos */}
      <div 
        className="fixed inset-0 pointer-events-none mix-blend-multiply opacity-[0.04] z-0"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stucco.png')" }} 
      />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <audio ref={audioRef} src={data.music} loop hidden />

      {/* ── 1. PANTALLA DE INGRESO (Gatekeeper) ── */}
      <AnimatePresence>
        {!isEntered && (
          <motion.div
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#fbfbfb] flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none flex flex-col items-center justify-center">
              <Image src={data.decorGate || data.bgHero} alt="Decor" fill className="object-cover scale-105 opacity-40 blur-sm" sizes="100vw" quality={90} priority />
              <div className="absolute inset-0 bg-stone-50/50 mix-blend-color" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="relative z-10 flex flex-col items-center text-center w-full max-w-md mx-auto px-4"
            >
              {/* ── Foto de la Pareja ── */}
              <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden mb-8 border-4 shadow-xl" style={{ borderColor: `${accent}40` }}>
                <Image
                  src={data.decorGate || data.bgHero}
                  alt="Pareja"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 500px, 500px"
                  priority
                  quality={100}
                />
                {/* Brillo sutil en el borde */}
                <div className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 20px ${accent}15` }} />
              </div>

              <p className="text-[10px] tracking-[0.35em] font-bold uppercase mb-4" style={{ color: accent }}>
                {data.gateTitle}
              </p>

              <h1
                style={{ fontFamily: "'Dancing Script', 'Georgia', cursive", fontSize: "clamp(2.8rem, 10vw, 4.5rem)", lineHeight: 1, color: "#374151" }}
                className="mb-3 max-w-sm"
              >
                {data.names}
              </h1>

              <p className="text-stone-400 text-xs tracking-[0.15em] mb-8 uppercase">{data.date}</p>

              {guestName && (
                <div className="mb-6 text-stone-600 bg-white/80 px-5 py-2 rounded-full backdrop-blur-md border border-stone-200/60 text-xs tracking-widest font-semibold uppercase shadow-sm">
                  Tu lugar está reservado, <span style={{ color: accent }}>{guestName}</span>
                </div>
              )}

              <motion.div 
                className="relative cursor-pointer group flex flex-col items-center mt-6" 
                onClick={() => {
                  if (isOpening) return;
                  setIsOpening(true);
                  setTimeout(() => handleEnter(), 1000);
                }}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                animate={isOpening ? "open" : undefined}
              >
                {/* Envelope Container */}
                <div className="relative w-40 h-28 bg-stone-100 rounded-md shadow-md border border-stone-200 flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
                  
                  {/* Layer 2: Flap Back (Inside of the top flap, standing up) */}
                  <motion.svg 
                     className="absolute bottom-[100%] left-0 w-full h-[56px] z-10 pointer-events-none" 
                     viewBox="0 0 160 56" 
                     fill="none" 
                     style={{ transform: "rotate(180deg)" }}
                     variants={{
                        idle: { opacity: 0 },
                        hover: { opacity: 1 },
                        tap: { opacity: 1 },
                        open: { opacity: 1 }
                     }}
                     transition={{ duration: 0.1, delay: 0.15 }}
                  >
                     <path d="M0 0 L80 56 L160 0 Z" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" strokeLinejoin="round" />
                  </motion.svg>

                  {/* Layer 3: Letter */}
                  <motion.div 
                    className="absolute w-36 h-24 bg-white border border-stone-200 rounded-sm flex flex-col items-center justify-center shadow-sm z-20"
                    variants={{
                      idle: { y: 0 },
                      hover: { y: -40 },
                      tap: { y: -44, scale: 1.05 },
                      open: { y: -80, scale: 1.15 }
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                     <p className="text-xs font-serif italic mb-1" style={{ color: accent }}>Para ti</p>
                     <Heart size={14} fill={accent} color={accent} className="opacity-70" />
                  </motion.div>

                  {/* Layer 4: Front Flaps (Bottom, Left, Right) */}
                  <svg className="absolute inset-0 w-full h-full z-30 pointer-events-none drop-shadow-sm" viewBox="0 0 160 112" fill="none">
                     <path d="M0 0 L80 56 L160 0 L160 112 L0 112 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" strokeLinejoin="round" />
                  </svg>

                  {/* Layer 5: Top Flap Front (Animated opening) */}
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full z-40 origin-top pointer-events-none"
                    variants={{
                       idle: { rotateX: 0, opacity: 1 },
                       hover: { rotateX: 110, opacity: 0 },
                       tap: { rotateX: 110, opacity: 0 },
                       open: { rotateX: 120, opacity: 0 }
                    }}
                    transition={{ duration: 0.3, ease: "easeIn" }}
                  >
                     <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 160 112" fill="none">
                        <path d="M0 0 L80 56 L160 0 Z" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" strokeLinejoin="round" />
                     </svg>
                  </motion.div>
                  
                  {/* Layer 6: Seal (Sello de cera en forma de Corazón) */}
                  <motion.div 
                    className="absolute top-[56px] left-1/2 z-50 flex items-center justify-center"
                    style={{ x: "-50%", y: "-50%", filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.1)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))" }}
                    variants={{
                      idle: { opacity: 1, scale: 1 },
                      hover: { opacity: 0, scale: 0.5 },
                      tap: { opacity: 0, scale: 0.5 },
                      open: { opacity: 0, scale: 0.2 }
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    <Heart size={36} fill={accent} color={accent} />
                    <div className="absolute inset-0 flex items-center justify-center -mt-0.5">
                       <Heart size={14} fill="rgba(255,255,255,0.15)" color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                    </div>
                  </motion.div>
                </div>

                {/* Text below */}
                <motion.p 
                   className="mt-8 text-xs font-bold tracking-[0.2em] uppercase text-stone-500 transition-colors"
                   variants={{ hover: { color: accent, y: -2 }, open: { opacity: 0 } }}
                >
                  Abrir Invitación
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTÓN VOLVER ── */}
      <motion.button
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-40 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-stone-200 text-stone-600 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-stone-50 transition-colors shadow-sm"
      >
        <ArrowLeft size={12} strokeWidth={2.5} /> Catálogo
      </motion.button>

      {/* ── BOTÓN MÚSICA ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }}
        onClick={() => setIsPlaying(!isPlaying)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-stone-100/50 text-stone-700 hover:scale-110 transition-transform"
      >
        <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-2 border-[1.5px] border-dashed border-stone-300 rounded-full" />
        {isPlaying ? <Pause size={16} fill="currentColor" strokeWidth={0} /> : <Play size={16} fill="currentColor" className="ml-1" strokeWidth={0} />}
      </motion.button>

      {/* ── 2. HERO — Foto pareja de fondo + degradé ── */}
      {/* svh y no vh: con 100vh la barra de direcciones del celular corta la
          foto y aparece un salto al scrollear. svh es el alto mínimo garantizado. */}
      <section className="relative min-h-svh flex flex-col items-center justify-end overflow-hidden pb-20">
        {/* Foto de la pareja como fondo completo */}
        <div className="absolute inset-0 z-0">
          <Image
            src={data.bgHero}
            alt="Pareja"
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
            quality={100}
          />
          {/* Degradé inferior: la foto se funde hacia el color base de la invitación */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-current" style={{ color: bgBase }} />
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-b from-transparent" style={{ background: `linear-gradient(to bottom, transparent 0%, ${bgBase}80 40%, ${bgBase} 100%)` }} />
          {/* Overlay sutil para que el texto sea legible */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Contenido: NOS CASAMOS + Nombres + Fecha */}
        <div className="relative z-10 flex flex-col items-center px-4 w-full text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="text-2xl sm:text-3xl md:text-4xl tracking-[0.3em] font-bold uppercase mb-6"
            style={{ color: accent, textShadow: "0 0 20px rgba(255,255,255,0.9), 0 0 40px rgba(255,255,255,0.7)" }}
          >
            Nos Casamos
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            style={{ fontFamily: data.font, color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.6)" }}
            className="text-4xl md:text-6xl lg:text-7xl uppercase tracking-widest mb-6"
          >
            {data.names}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="text-5xl md:text-7xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: accent, textShadow: "0 0 20px rgba(255,255,255,0.9)" }}>
              {data.date.split(" ")[0]}
            </div>
            <div className="w-16 h-[1px] my-2" style={{ backgroundColor: `${accent}80`, boxShadow: "0 0 10px rgba(255,255,255,0.8)" }} />
            <div className="text-lg md:text-xl tracking-[0.4em] font-semibold uppercase" style={{ color: accent, textShadow: "0 0 15px rgba(255,255,255,0.9)" }}>
              {data.date.split(" ").slice(1).join(" ")}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-6 text-white/60"
        >
          <ChevronDown size={24} strokeWidth={1} />
        </motion.div>
      </section>

      {/* ── HISTORIA / FRASE ── SECCIÓN 1: fondo blanco, accents de color */}
      {data.historyLine && (
        <section className="relative py-20 px-6 text-center overflow-hidden border-b border-stone-100" style={s1.section}>
          {/* Fondo floral visible pero sin tapar texto */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1490750967868-88df5691cc6e?auto=format&fit=crop&w=1600&q=90"
              alt=""
              fill
              className="object-cover"
              style={{ opacity: 0.12 }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" style={{ '--tw-gradient-from': `${bgBase}/90`, '--tw-gradient-to': `${bgBase}/90` } as any} />
          </div>

          {/* Ramas SVG — ocultas en mobile para evitar superposición */}
          <div className="absolute left-0 top-0 h-full w-32 md:w-48 pointer-events-none hidden sm:block" style={{ color: accent, opacity: 0.55 }}>
            <svg viewBox="0 0 180 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M25 520 C35 420 15 365 50 290 C70 235 28 178 58 115 C78 72 45 35 68 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M48 400 C72 378 108 388 132 365" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M42 310 C66 285 100 300 124 275" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M52 225 C76 202 112 218 140 195" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <ellipse cx="80" cy="390" rx="18" ry="9" fill="currentColor" opacity="0.3" transform="rotate(-25 80 390)"/>
              <ellipse cx="72" cy="300" rx="16" ry="8" fill="currentColor" opacity="0.3" transform="rotate(-30 72 300)"/>
              <circle cx="132" cy="365" r="5" fill="currentColor" opacity="0.7"/>
              <circle cx="124" cy="275" r="4" fill="currentColor" opacity="0.7"/>
              <circle cx="140" cy="195" r="3.5" fill="currentColor" opacity="0.7"/>
              <circle cx="68" cy="5" r="5" fill="currentColor" opacity="0.55"/>
            </svg>
          </div>

          <div className="absolute right-0 top-0 h-full w-32 md:w-48 pointer-events-none hidden sm:block" style={{ color: accent, opacity: 0.55 }}>
            <svg viewBox="0 0 180 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transform: "scaleX(-1)" }}>
              <path d="M25 520 C35 420 15 365 50 290 C70 235 28 178 58 115 C78 72 45 35 68 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M48 400 C72 378 108 388 132 365" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M42 310 C66 285 100 300 124 275" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M52 225 C76 202 112 218 140 195" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <ellipse cx="80" cy="390" rx="18" ry="9" fill="currentColor" opacity="0.3" transform="rotate(-25 80 390)"/>
              <ellipse cx="72" cy="300" rx="16" ry="8" fill="currentColor" opacity="0.3" transform="rotate(-30 72 300)"/>
              <circle cx="132" cy="365" r="5" fill="currentColor" opacity="0.7"/>
              <circle cx="124" cy="275" r="4" fill="currentColor" opacity="0.7"/>
              <circle cx="140" cy="195" r="3.5" fill="currentColor" opacity="0.7"/>
              <circle cx="68" cy="5" r="5" fill="currentColor" opacity="0.55"/>
            </svg>
          </div>

          {/* Texto centrado con padding lateral para no chocar con ramas */}
          <div className="relative z-10 max-w-md sm:max-w-xl mx-auto px-4 sm:px-12 md:px-4">
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-stone-300" />
              <HeartAnimIcon color={accent} size={22} />
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-stone-300" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-xl md:text-2xl font-light italic leading-relaxed"
              style={{ fontFamily: "Georgia, serif", color: "#4b5563" }}
            >
              &ldquo;{data.historyLine}&rdquo;
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center gap-3 mt-8"
            >
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-stone-300" />
              <div className="flex gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accent, opacity: 0.5 }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent, opacity: 0.7 }} />
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accent, opacity: 0.5 }} />
              </div>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-stone-300" />
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CUENTA REGRESIVA ── SECCIÓN 2: fondo de COLOR (accent), texto blanco */}
      <section className="py-20 px-6 flex flex-col items-center justify-center" style={s2.section}>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center">
          <ClockAnimIcon color="rgba(255,255,255,0.85)" size={40} />
          <p className="text-xs uppercase tracking-widest font-semibold mt-4 mb-8" style={s2.sub}>Cuenta Regresiva</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="flex gap-3 md:gap-6">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="w-16 h-20 md:w-24 md:h-28 rounded-2xl flex flex-col items-center justify-center shadow-lg" style={s2.card}>
              <motion.span
                key={value}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl md:text-4xl font-bold"
                style={s2.title}
              >
                {value.toString().padStart(2, "0")}
              </motion.span>
              <span className="text-[8px] md:text-[11px] uppercase tracking-widest mt-2 font-semibold" style={s2.sub}>
                {{ d: "Días", h: "Hs", m: "Min", s: "Seg" }[unit]}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 text-xs tracking-widest uppercase font-semibold" style={s2.sub}>
          {data.date}
        </motion.p>
      </section>

      {/* ── GALERÍA DE FOTOS ── SECCIÓN 3: fondo blanco */}
      {data.gallery && data.gallery.length > 0 && (
        <section className="py-20 overflow-hidden relative border-b border-stone-100" style={s3.section}>
          <div className="flex items-center justify-center gap-3 mb-10">
            <CameraAnimIcon color={accent} size={36} />
          </div>
          <SectionTitle title="Nuestros Momentos" font={data.font} style={s3.title} />
          <div className="relative flex w-[200%] gap-4" style={{ WebkitMaskImage: "linear-gradient(90deg, transparent, white 10%, white 90%, transparent)" }}>
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex gap-4 min-w-max"
            >
              {[...data.gallery, ...data.gallery].map((img: string, i: number) => (
                <div key={i} className="relative w-64 h-80 md:w-80 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-stone-200">
                  <Image src={img} alt="Galería" fill className="object-cover" sizes="(max-width: 768px) 256px, 320px" />
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── UBICACIÓN ── SECCIÓN 4: fondo de COLOR (accent), texto blanco */}
      {data.locations && (
        <section className="py-24 px-6" style={s4.section}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-10">
              <PinAnimIcon color="rgba(255,255,255,0.9)" size={40} />
            </div>
            <SectionTitle title="Dónde y Cuándo" font={data.font} style={s4.title} />
            <div className="grid md:grid-cols-2 gap-8">
              {data.locations.map((loc: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="p-8 rounded-3xl text-center flex flex-col items-center shadow-lg" style={s4.card}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(255,255,255,0.2)" }}>
                    <PinAnimIcon color="rgba(255,255,255,0.9)" size={28} />
                  </div>
                  <h3 className="text-xl tracking-wider uppercase mb-2 font-bold" style={s4.title}>{loc.type}</h3>
                  <p className="font-serif text-2xl mb-1" style={s4.text}>{loc.title}</p>
                  <div className="flex items-center gap-2 text-sm mb-6" style={s4.sub}>
                    <Clock size={14} /> <span>{loc.time}</span>
                  </div>
                  <p className="text-sm mb-8" style={s4.sub}>{loc.address}</p>
                  <a href={loc.link} target="_blank" rel="noopener noreferrer"
                    className="border px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors w-full hover:opacity-80"
                    style={s4.btnBorder}>
                    Cómo Llegar
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DRESS CODE Y LOGÍSTICA ── SECCIÓN 5: fondo blanco */}
      {(data.dressCode || data.logistics) && (
        <section className="py-20 px-6 flex flex-col md:flex-row gap-10 justify-center items-center md:items-start text-center border-y border-stone-100" style={s5.section}>
          {data.dressCode && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center max-w-sm">
              <div className="flex gap-4 mb-6">
                {/* Vestido — SVG animado real (oscila) */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                  <DressAnimIcon color={accent} size={36} />
                </div>
                {/* Traje — SVG animado real (levita) */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                  <SuitAnimIcon color={accent} size={36} />
                </div>
                {/* Gema — SVG animado real (brilla con destello) */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                  <GemAnimIcon color={accent} size={36} />
                </div>
              </div>
              <h3 className="text-lg uppercase tracking-widest font-semibold mb-2" style={s5.title}>Dress Code</h3>
              <p className="font-serif text-xl mb-2" style={s5.text}>{data.dressCode.title}</p>
              <p className="text-sm" style={s5.sub}>{data.dressCode.info}</p>
            </motion.div>
          )}

          {data.logistics && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center max-w-sm mt-10 md:mt-0">
              <HotelAnimIcon color={accent} size={40} />
              <h3 className="text-lg uppercase tracking-widest font-semibold mb-2 mt-4" style={s5.title}>Logística</h3>
              {data.logistics.hotels && <p className="text-sm mb-3" style={s5.sub}>{data.logistics.hotels}</p>}
              {data.logistics.hotels && <div className="h-px w-10 bg-stone-300 my-2" />}
              <p className="text-sm" style={s5.sub}>{data.logistics.transport}</p>
            </motion.div>
          )}
        </section>
      )}

      {/* ── REGALOS ── SECCIÓN 6: fondo de COLOR (accent), texto blanco */}
      {data.gifts && (
        <section className="py-24 px-6" style={s6.section}>
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <GiftAnimIcon color="rgba(255,255,255,0.95)" size={44} />
            </div>
            <SectionTitle title="Mesa de Regalos" font={data.font} style={s6.title} />
            <p className="mb-8 leading-relaxed text-sm" style={s6.text}>{data.gifts.message}</p>

            <button
              onClick={() => setShowGifts(!showGifts)}
              className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:opacity-80"
              style={s6.btnBorder}
            >
              Datos Bancarios
            </button>

            <AnimatePresence>
              {showGifts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-6"
                >
                  <div className="rounded-2xl p-6 text-sm flex flex-col gap-3 shadow-inner" style={s6.card}>
                    <p style={s6.text}><strong style={s6.title}>Banco:</strong> {data.gifts.bank}</p>
                    <p style={s6.text}><strong style={s6.title}>Alias:</strong> {data.gifts.alias}</p>
                    <p style={s6.text}><strong style={s6.title}>CBU:</strong> <span className="font-mono">{data.gifts.cbu}</span></p>
                    <p style={s6.text}><strong style={s6.title}>Titular:</strong> {data.gifts.name}</p>
                    <button
                      onClick={() => navigator.clipboard?.writeText(data.gifts.cbu)}
                      className="mt-4 px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-wider transition hover:opacity-80"
                      style={s6.btnBorder}
                    >
                      Copiar CBU
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ── TRIVIA ── SECCIÓN 7: fondo blanco */}
      {data.trivia && Array.isArray(data.trivia) && data.trivia.length > 0 && (() => {
        const currentTrivia = data.trivia[triviaIdx];
        const currentAns = triviaAns[triviaIdx] ?? null;
        return (
          <section className="py-24 px-6 flex flex-col items-center" style={s7.section}>
            <QuestionAnimIcon color={accent} size={40} />
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] mb-4 mt-2" style={s7.title}>Mini Juego</p>

            <div className="flex items-center gap-4 w-full justify-center max-w-lg mb-8">
              <button onClick={() => setTriviaIdx((p) => Math.max(p - 1, 0))} disabled={triviaIdx === 0} className="text-stone-400 disabled:opacity-30 hover:text-stone-700 transition p-2">
                <ChevronLeft size={24} />
              </button>

              <div className="flex-1 overflow-x-hidden">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={triviaIdx}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    className="font-serif text-2xl md:text-3xl text-center min-h-[100px] flex items-center justify-center leading-tight px-1"
                    style={s7.text}
                  >
                    {currentTrivia.q}
                  </motion.h3>
                </AnimatePresence>
              </div>

              <button onClick={() => setTriviaIdx((p) => Math.min(p + 1, data.trivia.length - 1))} disabled={triviaIdx === data.trivia.length - 1} className="text-stone-400 disabled:opacity-30 hover:text-stone-700 transition p-2">
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs relative z-10">
              {currentTrivia.options.map((opt: string, i: number) => {
                const isSelected = currentAns === i;
                const isCorrect = i === currentTrivia.correct;
                let bg = "bg-white border-stone-200 text-stone-600";
                if (currentAns !== null) {
                  if (isSelected && !isCorrect) bg = "bg-red-50 border-red-200 text-red-600";
                  if (isCorrect) bg = "bg-green-50 border-green-200 text-green-700";
                }
                return (
                  <button
                    key={`${triviaIdx}-${i}`}
                    disabled={currentAns !== null}
                    onClick={() => setTriviaAns((p) => ({ ...p, [triviaIdx]: i }))}
                    className={`border px-6 py-4 rounded-xl text-sm font-medium transition-all ${bg}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="h-10 mt-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {currentAns !== null && (
                  <motion.p key={`ans-${triviaIdx}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-bold text-stone-500">
                    {currentAns === currentTrivia.correct ? "¡Acertaste! Los conocés de memoria. 🎉" : "¡Casi! Pero no... 😅"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {data.trivia.map((_: any, i: number) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === triviaIdx ? "" : "bg-stone-300"}`} style={{ backgroundColor: i === triviaIdx ? accent : undefined }} />
              ))}
            </div>
          </section>
        );
      })()}

      {/* ── INSTAGRAM / HASHTAG ── */}
      {data.instagram && (
        <section className="py-20 px-6 max-w-lg mx-auto text-center flex flex-col items-center" style={{ backgroundColor: bgBase }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ background: `${accent}15` }}>
            <CameraAnimIcon color={accent} size={28} />
          </div>
          <SectionTitle title="Compartí tus fotos" font={data.font} style={{ color: accent }} />
          <p className="text-stone-500 text-sm mb-6 leading-relaxed">
            Etiquetanos en tus fotos y videos de la fiesta usando el hashtag oficial.
          </p>
          <p className="font-bold text-2xl tracking-widest uppercase mb-8" style={{ color: accent }}>
            #{data.instagram}
          </p>
        </section>
      )}

      {/* ── MURAL INTERACTIVO ── */}
      {data.mural && (
        <section className="py-24 px-6 border-y border-stone-100 flex flex-col lg:flex-row gap-10 items-center justify-center overflow-hidden" style={{ backgroundColor: bgBase }}>
          <div className="w-full max-w-sm flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex justify-center mb-4"><SparkleAnimIcon color={accent} size={32} /></div>
            <SectionTitle title="Mural de Deseos" font={data.font} style={{ color: accent }} />
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              Dejá tu marca en el mural virtual. Escribí un mensaje y arrastrá tu notita donde más te guste.
            </p>
            <div className="w-full flex flex-col gap-3 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative z-20">
              <input
                type="text" placeholder="Tu nombre" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none"
              />
              <textarea
                placeholder="Escribí un deseo o mensaje corto..." value={newNote} onChange={(e) => setNewNote(e.target.value)}
                maxLength={60} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none resize-none h-24"
              />
              <div className="flex gap-2 mt-2 w-full">
                <button onClick={addNote} style={{ backgroundColor: accent }}
                  className="flex-1 text-white px-2 py-3 rounded-xl text-[11px] font-bold tracking-widest uppercase shadow-lg hover:brightness-110 transition flex items-center justify-center whitespace-nowrap">
                  Colgar Nota
                </button>
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-[42px] bg-stone-100 border border-stone-200 text-stone-600 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-colors shadow-sm self-center" title="Añadir Foto">
                  <ImagePlus size={18} />
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handlePhotoUpload} />
              </div>
            </div>
          </div>

          <div ref={muralRef} className="w-full max-w-xl h-[450px] border-[10px] border-white bg-[#f8f7f5] rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/handmade-paper.png')" }} />

            {notes.map((note) => {
              if (note.type === "photo") {
                return (
                  <motion.div
                    key={note.id} drag dragConstraints={muralRef} dragElastic={0} dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.5, left: note.x, top: note.y }}
                    animate={{ opacity: 1, scale: 1, left: note.x, top: note.y }}
                    style={{ rotate: note.rotation }}
                    className="absolute p-3 pb-8 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] cursor-grab active:cursor-grabbing border border-stone-100 flex flex-col items-center z-10"
                  >
                    {/* Washi Tape */}
                    <div className="w-12 h-5 bg-stone-100/90 shadow-sm absolute -top-2 left-1/2 -translate-x-1/2 z-20" style={{ transform: "rotate(-3deg)" }} />
                    <div className="w-28 h-28 md:w-36 md:h-36 relative bg-stone-50 overflow-hidden mb-2 pointer-events-none">
                      <Image src={note.imageUrl!} alt="Foto" fill className="object-cover" />
                    </div>
                    <p className="font-serif text-[11px] text-stone-600 text-center uppercase tracking-widest">{note.name}</p>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={note.id} drag dragConstraints={muralRef} dragElastic={0} dragMomentum={false}
                  initial={{ opacity: 0, scale: 0.5, left: note.x, top: note.y }}
                  animate={{ opacity: 1, scale: 1, left: note.x, top: note.y }}
                  style={{ rotate: note.rotation }}
                  className="absolute w-36 min-h-[140px] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex flex-col gap-2 cursor-grab active:cursor-grabbing z-10 bg-white border border-stone-100"
                >
                  {/* Washi Tape Dorado/Plateado sutil */}
                  <div className="w-10 h-4 bg-[#f3f0ea] shadow-sm absolute -top-2 left-1/2 -translate-x-1/2" style={{ transform: "rotate(2deg)" }} />
                  <p className="font-serif italic text-[14px] text-stone-600 leading-relaxed break-words flex-1 mt-2 pointer-events-none text-center">{note.text}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 text-center pointer-events-none mt-2">— {note.name} —</p>
                </motion.div>
              );
            })}

            {notes.length === 0 && <p className="text-stone-400 font-serif italic relative z-10 pointer-events-none">Mural vacío...</p>}
          </div>
        </section>
      )}

      {/* ── RSVP ── */}
      <section style={{ backgroundColor: "#1c1917" }} className="text-stone-300 py-32 px-6 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 w-full max-w-lg flex flex-col items-center">
          <HeartAnimIcon color={accent} size={36} />
          <SectionTitle title="RSVP" font={data.font} style={{ color: "#ffffff" }} />

          <AnimatePresence mode="wait">
            {rsvpSubmitted ? (
              <motion.div
                key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-6 py-10"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${accent}22`, border: `2px solid ${accent}` }}
                >
                  <CheckCircle size={40} style={{ color: accent }} strokeWidth={1.5} />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-light text-white mb-2" style={{ fontFamily: data.font }}>¡Confirmado!</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    {rsvpAttending === "yes"
                      ? `Ya estás anotado, ${rsvpName}. ¡Nos vemos en el gran día!`
                      : `Recibimos tu respuesta, ${rsvpName}. Gracias por avisarnos.`}
                  </p>
                </div>
                {rsvpAttending === "yes" && (
                  <p className="text-[11px] tracking-widest uppercase text-stone-500 border border-stone-700 rounded-full px-4 py-2">
                    {data.date}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0 }} className="w-full">
                <p className="text-stone-400 mb-10 font-light leading-relaxed text-sm">{rsvpDeadlineLabel}</p>

                <div className="bg-stone-800/50 border border-stone-700 rounded-3xl p-6 md:p-8 w-full text-left flex flex-col gap-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Tu nombre completo</label>
                    <input
                      type="text" placeholder="Escribí tu nombre..." value={rsvpName} onChange={(e) => setRsvpName(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-200 outline-none focus:border-stone-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Asistencia</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setRsvpAttending("yes")}
                        className={`border rounded-xl px-4 py-3 text-sm transition-all ${rsvpAttending === "yes" ? "border-transparent text-white" : "border-stone-500 text-stone-300 hover:bg-stone-700"}`}
                        style={rsvpAttending === "yes" ? { backgroundColor: accent, borderColor: accent } : {}}>
                        Sí, asisto ✓
                      </button>
                      <button onClick={() => setRsvpAttending("no")}
                        className={`border rounded-xl px-4 py-3 text-sm transition-all ${rsvpAttending === "no" ? "border-stone-400 bg-stone-700 text-white" : "border-stone-700 text-stone-500 hover:bg-stone-800"}`}>
                        No asisto
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {rsvpAttending === "yes" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block pt-2">Cantidad de invitados</label>
                        <select 
                          value={rsvpGuests} onChange={(e) => setRsvpGuests(Number(e.target.value))}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-200 outline-none focus:border-stone-500 transition-colors appearance-none"
                        >
                          <option value={1}>1 persona (Solo yo)</option>
                          <option value={2}>2 personas</option>
                          <option value={3}>3 personas</option>
                          <option value={4}>4 personas</option>
                          <option value={5}>5 personas (Familia)</option>
                          <option value={6}>6 personas o más (Familia grande)</option>
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Menú / Restricciones dietarias</label>
                    <div className="flex flex-col gap-2">
                      {dietOptions.map(opt => {
                        const checked = rsvpDiet.has(opt.id);
                        return (
                          <button key={opt.id} type="button" onClick={() => toggleDiet(opt.id)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-sm text-left transition-all ${checked ? "border-transparent text-white" : "border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-300"}`}
                            style={checked ? { backgroundColor: `${accent}33`, borderColor: accent, color: "#fff" } : {}}>
                            <span className="w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all"
                              style={checked ? { backgroundColor: accent, borderColor: accent } : { borderColor: "#57534e" }}>
                              {checked && (
                                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                  <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">Canción sugerida 🎵</label>
                    <input type="text" placeholder="Esa que no puede faltar..." value={rsvpSong} onChange={(e) => setRsvpSong(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-300 outline-none focus:border-stone-500 transition-colors"
                    />
                  </div>

                  <button onClick={handleRsvpSubmit} disabled={!rsvpAttending || !rsvpName.trim()}
                    style={{ backgroundColor: (rsvpAttending && rsvpName.trim()) ? accent : undefined }}
                    className="mt-4 w-full text-white px-10 py-4 rounded-xl text-[11px] font-bold tracking-[0.25em] uppercase shadow-lg hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed bg-stone-700">
                    Confirmar asistencia
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
