import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Play, Pause, ChevronDown, MapPin, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Gift, Shirt, Gem, Camera, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

/* ── DECORACIÓN FLORAL REALISTA Y PROFESIONAL (Line Art + Watercolor) ── */
function FloralCorner({ position, accent }: { position: string, accent: string }) {
  const isTop = position.includes('top');
  const isLeft = position.includes('left');
  
  return (
    <div className={`absolute pointer-events-none select-none z-0 ${isTop ? 'top-[-5%]' : 'bottom-[-5%]'} ${isLeft ? 'left-[-5%]' : 'right-[-5%]'} w-[350px] h-[350px] md:w-[500px] md:h-[500px] opacity-80`} style={{ transform: `${isTop ? '' : 'scaleY(-1)'} ${isLeft ? '' : 'scaleX(-1)'}` }}>
      <svg className="w-full h-full mix-blend-multiply dark:mix-blend-screen" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="watercolorBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="35" />
          </filter>
        </defs>

        {/* MANCHAS DE ACUARELA REALISTAS (FONDO) */}
        <g filter="url(#watercolorBlur)">
          <path d="M-50 -50 C 150 -20, 350 150, 150 350 C -50 200, -100 -50, -50 -50 Z" fill={accent} opacity="0.3" />
          <path d="M-20 80 C 120 50, 280 280, 50 420 C -150 300, -100 80, -20 80 Z" fill={accent} opacity="0.25" />
          <path d="M 50 -80 C 250 -40, 400 150, 250 300 C 50 150, 0 0, 50 -80 Z" fill={accent} opacity="0.15" />
        </g>

        {/* LINE ART BOTÁNICO DETALLADO */}
        <g stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9">
          
          {/* Ramas principales entrelazadas */}
          <path d="M-20 -20 Q 150 100 350 380" strokeWidth="1.8" opacity="0.8" />
          <path d="M 50 20 Q 250 180 420 250" strokeWidth="1.2" opacity="0.7" />
          <path d="M 120 250 Q 250 320 310 440" strokeWidth="1.2" opacity="0.6" />
          
          {/* Ramo de Hojas Finas 1 */}
          <g>
            <path d="M 100 130 C 160 80, 250 130, 260 170 C 200 190, 120 180, 100 130 Z" fill="#ffffff" fillOpacity="0.2" />
            <path d="M 100 130 Q 180 140 260 170" strokeWidth="0.8" opacity="0.5"/>
            
            <path d="M 150 170 C 200 150, 250 200, 240 240 C 180 230, 160 200, 150 170 Z" fill="#ffffff" fillOpacity="0.2" />
            <path d="M 150 170 Q 200 180 240 240" strokeWidth="0.8" opacity="0.5"/>
          </g>

          {/* Ramo de Hojas Finas 2 */}
          <g transform="translate(100, -40) rotate(25)">
            <path d="M 100 130 C 160 80, 250 130, 260 170 C 200 190, 120 180, 100 130 Z" fill="#ffffff" fillOpacity="0.15" />
            <path d="M 100 130 Q 180 140 260 170" strokeWidth="0.8" opacity="0.4"/>
            <path d="M 160 110 C 200 60, 300 100, 310 140 C 240 160, 180 150, 160 110 Z" fill="#ffffff" fillOpacity="0.15" />
          </g>
          
          {/* FLOR PRINCIPAL (Pétalos superpuestos, estilo Peonía) */}
          <g transform="translate(180, 120) scale(1.45) rotate(-15)">
            {/* Pétalos traseros */}
            <path d="M0,0 C-40,-60 -90,-40 -70,10 C-40,50 -10,40 0,0 Z" fill="#ffffff" fillOpacity="0.5" strokeWidth="1" />
            <path d="M0,0 C30,-70 80,-50 60,0 C40,40 10,30 0,0 Z" fill="#ffffff" fillOpacity="0.5" strokeWidth="1" />
            
            {/* Pétalos medios con pliegues */}
            <path d="M0,0 C-60,-20 -70,50 -20,70 C0,60 10,20 0,0 Z" fill="#ffffff" fillOpacity="0.65" strokeWidth="1.2" />
            <path d="M0,0 C50,-10 70,40 20,60 C10,50 5,20 0,0 Z" fill="#ffffff" fillOpacity="0.65" strokeWidth="1.2" />
            
            {/* Pétalo frontal arrugado (realismo) */}
            <path d="M0,0 C-30,40 -50,70 -10,80 C20,90 40,60 0,0 Z" fill="#ffffff" fillOpacity="0.8" strokeWidth="1.2" />
            <path d="M-10,80 Q 0,70 5,75 Q 15,60 0,0" strokeWidth="0.6" opacity="0.5"/>
            
            {/* Centro de la flor: Estambres ultra-realistas */}
            <path d="M0,0 Q-6,-12 -20,-18 M0,0 Q8,-12 15,-22 M0,0 Q-15,0 -30,8 M0,0 Q18,8 25,5" strokeWidth="0.6" opacity="0.8"/>
            <circle cx="-20" cy="-18" r="2" fill={accent} opacity="0.9"/>
            <circle cx="15" cy="-22" r="2" fill={accent} opacity="0.9"/>
            <circle cx="-30" cy="8" r="1.5" fill={accent} opacity="0.8"/>
            <circle cx="25" cy="5" r="1.5" fill={accent} opacity="0.8"/>
            <circle cx="-5" cy="-8" r="2.5" fill={accent} opacity="0.7"/>
          </g>

          {/* FLOR SECUNDARIA (Capullo / Bud) */}
          <g transform="translate(300, 240) scale(0.9) rotate(40)">
            <path d="M0,0 C-25,-50 -60,-25 -50,15 C-25,35 -10,25 0,0 Z" fill="#ffffff" fillOpacity="0.5" />
            <path d="M0,0 C25,-50 60,-25 50,15 C25,35 10,25 0,0 Z" fill="#ffffff" fillOpacity="0.5" />
            <path d="M0,0 C-35,25 -25,60 0,50 C25,60 35,25 0,0 Z" fill="#ffffff" fillOpacity="0.7" />
          </g>
          
        </g>
      </svg>
    </div>
  );
}

// ── Parsea fechas en español como "10 Diciembre 2025" o "Sábado 10 de Mayo 2026" ──
function parseEventDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const monthMap: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  };
  const lower = dateStr.toLowerCase();
  // Buscar número de día
  const dayMatch = lower.match(/(\d{1,2})/);
  // Buscar año (4 dígitos)
  const yearMatch = lower.match(/(202[0-9]|203[0-9])/);
  // Buscar nombre de mes
  let monthNum = -1;
  for (const [name, num] of Object.entries(monthMap)) {
    if (lower.includes(name)) { monthNum = num; break; }
  }
  if (!dayMatch || monthNum === -1) return null;
  const day = parseInt(dayMatch[1], 10);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
  return new Date(year, monthNum, day, 21, 30, 0); // hora por defecto 21:30
}

function calcTimeLeft(target: Date | null) {
  if (!target) return { d: 0, h: 0, m: 0, s: 0 };
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return { d, h, m, s };
}

export default function CumplesTemplate({ data, guestName }: { data: any; guestName: string }) {
  const router = useRouter();

  const eventDate = parseEventDate(data.date);

  const [isEntered, setIsEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(eventDate));

  // RSVP States
  const [rsvpAttending, setRsvpAttending] = useState<"yes" | "no" | null>(null);
  const [rsvpName, setRsvpName] = useState(guestName || "");
  const [rsvpDiet, setRsvpDiet] = useState<Set<string>>(new Set());
  const [rsvpSong, setRsvpSong] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Gifts reveal
  const [showGifts, setShowGifts] = useState(false);

  // Trivia
  const [triviaIdx, setTriviaIdx] = useState(0);
  const [triviaAns, setTriviaAns] = useState<Record<number, number | null>>({});

  // Galería 3D interactiva
  const [galleryIdx, setGalleryIdx] = useState(2);
  const demoPhotos = [
     "https://images.unsplash.com/photo-1541250848049-b4f7141dca3f?auto=format&fit=crop&w=800&q=80",
     "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
     "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
     "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
     "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
     "https://images.unsplash.com/photo-1530103862676-de88921e243c?auto=format&fit=crop&w=800&q=80"
  ];
  const galleryPhotos = data.gallery || demoPhotos;

  // Autoplay para la galería
  useEffect(() => {
    const timer = setInterval(() => {
      setGalleryIdx((prev) => (prev + 1) % galleryPhotos.length);
    }, 3500); // Cambia cada 3.5 segundos
    
    return () => clearInterval(timer);
  }, [galleryPhotos.length]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const target = parseEventDate(data.date);
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [data.date]);

  const handleEnter = () => {
    setIsEntered(true);
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  const toggleDiet = (id: string) => {
    setRsvpDiet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dietOptions = [
    { id: "ninguna", label: "Ninguna", icon: "🍔" },
    { id: "vegano", label: "Vegano/Veggie", icon: "🥗" },
    { id: "celiaco", label: "Sin TACC", icon: "🌾" },
  ];

  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 800], [0, 200]);

  // Color theme overrides based on data
  const accent = data.colorAccent || "#f472b6";
  const isDark = data.id === "cumples-1" || data.id === "cumples-8"; // Basic heuristic for neon styles

  // Helpers para diseccionar la fecha y emular el estilo de diseño top
  const extractDateDetails = (d: string) => {
    const defaultRes = { dayNum: "02", yearText: "2026", monthName: "MAYO", dayName: "SÁBADO" };
    if (!d) return defaultRes;
    const nums = d.match(/\d+/g);
    const numMatches = nums ? nums[0] : "02";
    const yearMatches = nums && nums.length > 1 ? nums[1] : "2026";
    const words = d.replace(/[0-9,]/g, '').split(" ").filter(w => w.trim().length > 0 && w.toLowerCase() !== "de" && w.toLowerCase() !== "del");
    const mName = words.length > 0 ? words[words.length - 1] : "MAYO";
    const dName = words.length > 1 ? words[0] : "SÁBADO";
    return { dayNum: numMatches, yearText: yearMatches, monthName: mName, dayName: dName };
  };
  const { dayNum, yearText, monthName, dayName } = extractDateDetails(data.date);

  return (
    <div className={`min-h-svh selection:bg-pink-300 overflow-x-hidden transition-colors duration-1000 ${isDark ? "bg-[#09090b] text-zinc-300" : "bg-[#fdfdfd] text-zinc-800"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
      <audio ref={audioRef} src={data.music} loop hidden />

      {/* ── GATEKEEPER ── */}
      <AnimatePresence>
        {!isEntered && (
          <motion.div
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Partículas / Fondo */}
            <div className="absolute inset-0 opacity-60">
              <Image src={data.decorGate || data.bgHero} alt="GateDecor" fill className="object-cover blur-sm" priority />
              <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative z-10 flex flex-col items-center text-center px-4">
              <p className="text-[10px] tracking-[0.5em] text-white/50 font-black uppercase mb-6" style={{ color: accent, textShadow: "0 0 20px " + accent }}>
                {data.gateTitle || "MIS XV"}
              </p>
              
              <h1 className="text-7xl font-black text-white mb-6 tracking-tighter" style={{ fontFamily: data.font, textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
                {data.names}
              </h1>

              {guestName && (
                <div className="mb-8 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-xs font-bold text-white tracking-widest uppercase">
                  ENTRADA VIP: <span style={{ color: accent }}>{guestName}</span>
                </div>
              )}

              <button
                onClick={handleEnter}
                className="group relative overflow-hidden px-10 py-4 rounded-full bg-white text-black font-black text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                style={{ boxShadow: `0 0 30px ${accent}40` }}
              >
                Ingresar a la fiesta
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTONES FLOTANTES ── */}
      <motion.button
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
        onClick={() => router.push(data.id?.includes('bodas') ? '/bodas' : '/cumples')}
        className="fixed top-6 left-6 z-40 bg-black/40 backdrop-blur-xl border border-white/10 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-black/60 transition-colors"
      >
        <ArrowLeft size={12} /> Salir
      </motion.button>

      <motion.button
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }}
        onClick={() => setIsPlaying(!isPlaying)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-black/80 backdrop-blur-xl rounded-full flex items-center justify-center border text-white hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,0,0,0.8)]"
        style={{ borderColor: accent }}
      >
        <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-1 border-[2px] border-dashed rounded-full" style={{ borderColor: accent, opacity: 0.5 }} />
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
      </motion.button>

      {/* ── HERO COMPLETO ── */}
      {/* svh y no vh: con 100vh la barra de direcciones del celular corta la
          foto y aparece un salto al scrollear. svh es el alto mínimo garantizado. */}
      <section className="relative min-h-svh flex flex-col items-center justify-end overflow-hidden pb-32">
        <motion.div style={{ y: yHero }} className="absolute inset-0 z-0">
          <Image src={data.bgHero} alt="Hero" fill className="object-cover" priority />
          {/* Overlay oscuro siempre activo para garantizar legibilidad del texto */}
          <div className="absolute inset-0 bg-black/45" />
          {/* Degradado abajo para unir con la página */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfd] via-transparent to-transparent block dark:hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent hidden dark:block" />
        </motion.div>

        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}>
            <span className="text-xl md:text-2xl font-black tracking-[0.4em] uppercase" style={{ color: accent, textShadow: `0 0 20px ${accent}80` }}>
              Mis 15
            </span>
            <h1
              className="text-7xl md:text-8xl font-black mt-2 mb-6 tracking-tighter text-white"
              style={{ fontFamily: data.font, textShadow: "0 4px 24px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.5)" }}
            >
              {data.names}
            </h1>
            <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">
              <span className="text-sm font-bold uppercase tracking-widest text-white drop-shadow-md">{data.date}</span>
            </div>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute bottom-10 text-white/60">
          <ChevronDown size={30} />
        </motion.div>
      </section>

      {/* ── COUNTDOWN GLASS (DISEÑO COMPETENCIA MEJORADO) ── */}
      <section className="relative z-20 -mt-16 px-4">
        <div className={`max-w-3xl mx-auto backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border flex flex-col items-center justify-center ${isDark ? 'bg-zinc-900/90 border-white/10' : 'bg-white/80 border-white/30'}`}>
           
           {/* TEXTO INVITACION */}
           <div className="text-center md:mb-12 mb-8 mt-4 max-w-sm">
             <p className={`font-playfair italic text-2xl md:text-3xl leading-[1.4] ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>
               Me gustaría que me <br /> acompañes en esta noche <br /> especial para mi
             </p>
           </div>

           {/* FECHA ESTILIZADA */}
           <div className="flex flex-col items-center mb-10 md:mb-14 text-center">
             <div className="flex items-center gap-6 md:gap-10 justify-center w-full mb-4">
               <div className={`border-t-[1.5px] border-b-[1.5px] py-3 w-20 md:w-28 ${isDark ? 'border-zinc-700' : 'border-zinc-400'}`}>
                 <span className={`uppercase tracking-[0.1em] text-sm md:text-base font-playfair ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{dayName}</span>
               </div>
               <span className="text-[5.5rem] md:text-[7rem] leading-none font-playfair" style={{ color: accent }}>
                 {dayNum}
               </span>
               <div className={`border-t-[1.5px] border-b-[1.5px] py-3 w-20 md:w-28 ${isDark ? 'border-zinc-700' : 'border-zinc-400'}`}>
                 <span className={`uppercase tracking-[0.1em] text-sm md:text-base font-playfair ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{monthName}</span>
               </div>
             </div>
             
             <div className="flex flex-col items-center justify-center gap-2 mt-4">
               <p className={`text-xl md:text-2xl font-playfair font-medium tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{yearText}</p>
               <p className={`text-xl md:text-2xl font-playfair font-medium tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>21:30 hs</p>
             </div>
           </div>

           {/* TITULO FALTAN */}
           <p className="text-5xl md:text-6xl mb-12" style={{ color: accent, fontFamily: "'Great Vibes', cursive" }}>Faltan</p>

           {/* CUENTA REGRESIVA */}
           <div className="flex gap-6 md:gap-10 justify-center w-full">
             {Object.entries(timeLeft).map(([unit, val]) => (
               <div key={unit} className="flex flex-col items-center w-16 md:w-20">
                 <div className={`text-3xl md:text-4xl font-playfair mb-2 ${isDark ? 'text-zinc-200' : 'text-zinc-500'}`}>
                   {val.toString().padStart(2, '0')}
                 </div>
                 <div className={`text-[10px] md:text-[12px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                   {{d: "Días", h: "Horas", m: "Minutos", s: "Segundos"}[unit]}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* ── ITINERARIO BUBBLE TIMELINE ── */}
      {data.locations && (
        <section className="relative z-[2] py-32 px-6 max-w-xl mx-auto">
          <div className="relative">
            <div className="text-center mb-16">
              <h2 className="text-6xl md:text-7xl font-medium mb-4 leading-none" style={{ color: accent, fontFamily: "'Great Vibes', cursive" }}>La Noche</h2>
              <p className="text-sm font-serif italic text-zinc-600 dark:text-zinc-400">Preparate para pasarla increíble.</p>
            </div>

            <div className="relative border-l-2 ml-4 md:ml-1/2 border-dashed" style={{ borderColor: `${accent}40` }}>
              {data.locations.map((loc: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="mb-12 relative pl-8">
                  <div className="absolute -left-[13px] top-1 w-6 h-6 rounded-full border-4 border-[#fdfdfd] dark:border-[#09090b] flex items-center justify-center" style={{ backgroundColor: accent }}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div className={`p-6 rounded-3xl shadow-sm backdrop-blur-sm border ${isDark ? 'bg-black/20 border-white/10' : 'bg-white/70 border-zinc-200/60'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black px-3 py-1 rounded-full" style={{ color: accent, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>{loc.time}</span>
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{loc.type}</h3>
                    </div>
                    <p className={`font-medium text-xl leading-tight mb-2 ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>{loc.title}</p>
                    <p className={`text-sm mb-5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{loc.address}</p>
                    
                    {/* GOOGLE MAPS IFRAME DE PRUEBA */}
                    <div className="w-full h-32 rounded-xl overflow-hidden mb-2 shadow-inner border border-zinc-100 dark:border-white/5">
                      <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016713276848!2d-58.38375908477038!3d-34.60373888045952!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf1d61946b%3A0xc3dcd40bc9f53e7f!2sObelisco!5e0!3m2!1ses-419!2sar!4v1699991234567!5m2!1ses-419!2sar" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>

                    <a href={loc.link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center w-full py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-zinc-900'}`}>
                      <MapPin size={14} className="mr-2" /> ABRIR EN MAPS
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DRESS CODE ── */}
      {data.dressCode && (
        <div className="relative w-full overflow-hidden py-24 transition-colors duration-1000" style={{ backgroundImage: `radial-gradient(circle at 100% 0%, ${accent}25 0%, transparent 60%), radial-gradient(circle at 0% 100%, ${accent}25 0%, transparent 60%)` }}>
          
          <FloralCorner position="top-right" accent={accent} />
          <FloralCorner position="bottom-left" accent={accent} />

          <section className="relative z-10 px-6 max-w-2xl mx-auto flex flex-col items-center text-center mt-6">
             <div className="flex justify-center gap-12 mb-10">
               {/* Elegante Vestido */}
               <div className="flex items-center justify-center opacity-85 transition-transform hover:-translate-y-2 drop-shadow-md">
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={isDark ? "white" : "#27272a"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 4h8" strokeOpacity="0.3" /> 
                    <path d="M9 4l-1.5 5 2 2h5l2-2-1.5-5" fill={isDark ? "rgba(255,255,255,0.05)" : "white"} /> 
                    <path d="M9.5 11.5c-2 2-4 8-4.5 10.5h14c-.5-2.5-2.5-8.5-4.5-10.5" fill={accent} fillOpacity="0.15" /> 
                    <path d="M12 11.5v10" strokeOpacity="0.4" />
                 </svg>
               </div>
               {/* Elegante Traje */}
               <div className="flex items-center justify-center opacity-85 transition-transform hover:-translate-y-2 drop-shadow-md">
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={isDark ? "white" : "#27272a"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 4h10" strokeOpacity="0.3" /> 
                    <path d="M12 10.5l-3-6-3.5 4v11h13v-11l-3.5-4-3 6z" fill={accent} fillOpacity="0.1" />
                    <path d="M12 10.5l1.5 6" />
                    <path d="M12 10.5l-1.5 6" />
                    <path d="M10.5 8l3 0" />
                    <circle cx="12" cy="17" r="1" fill={isDark ? "white" : "#27272a"} />
                 </svg>
               </div>
             </div>
             
             <p className="text-5xl md:text-7xl mb-8 font-medium leading-none drop-shadow-sm" style={{ color: accent, fontFamily: "'Great Vibes', cursive" }}>{data.dressCode.title}</p>
             <p className={`text-[20px] md:text-[22px] font-serif font-medium max-w-sm leading-relaxed ${isDark ? 'text-white' : 'text-zinc-900'}`} style={{ textShadow: isDark ? "0 2px 10px rgba(0,0,0,0.8)" : "0 2px 10px rgba(255,255,255,0.9)" }}>
               {data.dressCode.info}
             </p>
          </section>
        </div>
      )}

      {/* ── GALERÍA 3D MÁGICA ── */}
      <div className="relative w-full py-24 overflow-hidden flex flex-col items-center">
         <FloralCorner position="top-right" accent={accent} />
         
         <div className="relative z-10 flex flex-col items-center mb-16 text-center px-6">
            <Camera size={42} strokeWidth={1} style={{ color: isDark ? "white" : "#27272a" }} className="mb-6 opacity-60" />
            <p className="text-5xl md:text-7xl font-medium leading-none drop-shadow-sm mb-4" style={{ color: accent, fontFamily: "'Great Vibes', cursive" }}>Momentos</p>
            <p className={`text-[18px] md:text-[20px] font-serif font-medium leading-relaxed ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>Capturados para siempre</p>
         </div>

         {/* Contenedor 3D Coverflow */}
         <div className="relative w-full h-[400px] md:h-[500px] flex justify-center items-center" style={{ perspective: "1200px", WebkitPerspective: "1200px" }}>
            <AnimatePresence mode="popLayout">
               {galleryPhotos.map((url: string, i: number) => {
                  const offset = i - galleryIdx;
                  // Renderizamos solo 5 a la vez para rendimiento (2 izquierda, centro, 2 derecha)
                  if (Math.abs(offset) > 2) return null;

                  return (
                     <motion.div
                        key={url}
                        layout
                        initial={{ opacity: 0, scale: 0.8, x: offset * 100 }}
                        animate={{
                           opacity: offset === 0 ? 1 : 0.6 - Math.abs(offset) * 0.2,
                           scale: offset === 0 ? 1 : 0.85 - Math.abs(offset) * 0.05,
                           x: offset * (typeof window !== 'undefined' && window.innerWidth < 768 ? 70 : 180),
                           z: -Math.abs(offset) * 150,
                           rotateY: offset * -25,
                        }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                        className={`absolute w-56 h-80 md:w-72 md:h-96 rounded-t-[120px] rounded-b-3xl overflow-hidden shadow-2xl cursor-pointer ${offset === 0 ? 'border-4 border-white dark:border-zinc-800' : 'border-2 border-white/50'}`}
                        style={{ zIndex: 10 - Math.abs(offset) }}
                        onClick={() => setGalleryIdx(i)}
                     >
                        <Image src={url} alt={`Memory ${i + 1}`} fill className="object-cover" />
                        {offset === 0 && (
                           <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                        )}
                     </motion.div>
                  )
               })}
            </AnimatePresence>
         </div>
         
         {/* Controles del Carrusel */}
         <div className="flex gap-6 mt-12 z-10">
            <button 
               onClick={() => setGalleryIdx((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1))} 
               className="p-3 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:scale-110 active:scale-95"
            >
               <ChevronLeft size={28} strokeWidth={1.5} style={{ color: isDark ? 'white' : 'black' }} />
            </button>
            <button 
               onClick={() => setGalleryIdx((prev) => (prev + 1) % galleryPhotos.length)} 
               className="p-3 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:scale-110 active:scale-95"
            >
               <ChevronRight size={28} strokeWidth={1.5} style={{ color: isDark ? 'white' : 'black' }} />
            </button>
         </div>
      </div>

      {/* ── LLUVIA DE SOBRES ── */}
      {data.gifts && (
        <div className="relative w-full overflow-hidden py-24 transition-colors duration-1000" style={{ backgroundImage: `radial-gradient(circle at 0% 0%, ${accent}25 0%, transparent 60%), radial-gradient(circle at 100% 100%, ${accent}25 0%, transparent 60%)` }}>
          
          <FloralCorner position="top-left" accent={accent} />
          <FloralCorner position="bottom-right" accent={accent} />

          <section className="relative z-10 px-6 max-w-2xl mx-auto flex flex-col items-center text-center mt-6">
             <div className="mb-6 opacity-60">
               <Gift size={42} strokeWidth={1} style={{ color: isDark ? "white" : "black" }} />
             </div>
             <p className="text-5xl md:text-7xl mb-8 font-medium leading-none drop-shadow-sm" style={{ color: accent, fontFamily: "'Great Vibes', cursive" }}>Regalo</p>
             <p className={`text-[20px] md:text-[22px] font-serif font-medium mb-8 max-w-sm leading-relaxed ${isDark ? 'text-white' : 'text-zinc-900'}`} style={{ textShadow: isDark ? "0 2px 10px rgba(0,0,0,0.8)" : "0 2px 10px rgba(255,255,255,0.9)" }}>
               {data.gifts.message}
             </p>
             
             <div className={`font-serif italic text-[18px] flex flex-col gap-2 items-center p-4 rounded-xl backdrop-blur-sm border shadow-sm ${isDark ? 'text-zinc-200 bg-black/40 border-black/40' : 'text-zinc-800 bg-white/40 border-white/60'}`}>
                <p>CBU: {data.gifts.cbu}</p>
                <p>Alias: <span className="font-bold font-sans text-[16px] tracking-wider opacity-90">{data.gifts.alias}</span></p>
                <p className="mt-4 font-sans not-italic text-sm tracking-widest uppercase opacity-60">{data.gifts.bank}</p>
             </div>
          </section>
        </div>
      )}

      {/* ── MINI JUEGO / TRIVIA ── */}
      {data.trivia && Array.isArray(data.trivia) && data.trivia.length > 0 && (() => {
        const currentTrivia = data.trivia[triviaIdx];
        const currentAns = triviaAns[triviaIdx] ?? null;
        return (
          <section className="relative z-[2] py-24 px-6 max-w-lg mx-auto flex flex-col items-center">
             <HelpCircle size={32} className="mb-4 opacity-30" />
             <h2 className="text-6xl md:text-7xl mb-10 text-center font-medium leading-none" style={{ color: accent, fontFamily: "'Great Vibes', cursive" }}>¿Me conocés?</h2>
             
             <div className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.p key={triviaIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-xl font-bold text-center mb-8 h-14 flex items-center justify-center">
                    {currentTrivia.q}
                  </motion.p>
                </AnimatePresence>
                
                <div className="flex flex-col gap-3 mb-8">
                  {currentTrivia.options.map((opt: string, i: number) => {
                    const isSelected = currentAns === i;
                    const isCorrect = i === currentTrivia.correct;
                    let style = "bg-zinc-50 dark:bg-black/50 border-zinc-200 dark:border-white/10 opacity-80 hover:opacity-100";
                    if (currentAns !== null) {
                      if (isSelected && !isCorrect) style = "bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400";
                      if (isCorrect) style = "bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400 font-bold";
                    }
                    return (
                      <button key={i} disabled={currentAns !== null} onClick={() => setTriviaAns(p => ({...p, [triviaIdx]: i}))} className={`w-full py-4 px-6 rounded-2xl border text-sm font-medium transition-all text-left flex justify-between items-center ${style}`}>
                        {opt}
                        {isCorrect && currentAns !== null && <CheckCircle2 size={16} />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={() => setTriviaIdx(p => Math.max(p - 1, 0))} disabled={triviaIdx === 0} className="p-3 bg-zinc-100 dark:bg-white/10 rounded-full disabled:opacity-30"><ChevronLeft size={16} /></button>
                  <div className="flex gap-1.5">
                    {data.trivia.map((_: any, i: number) => (
                      <div key={i} className="w-2 h-2 rounded-full transition-colors" style={{ backgroundColor: i === triviaIdx ? accent : "gray" }} />
                    ))}
                  </div>
                  <button onClick={() => setTriviaIdx(p => Math.min(p + 1, data.trivia.length - 1))} disabled={triviaIdx === data.trivia.length - 1} className="p-3 bg-zinc-100 dark:bg-white/10 rounded-full disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
             </div>
          </section>
        )
      })()}

      {/* ── ALBUM COMPARTIDO / INSTAGRAM ── */}
      <div className="w-full transition-colors duration-500" style={{ backgroundColor: isDark ? `${accent}15` : `${accent}0A` }}>
        <section className="relative z-[2] py-24 px-6 max-w-2xl mx-auto text-center flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDark ? 'bg-zinc-800 text-stone-300' : 'bg-white text-stone-600'}`}>
            <Camera size={28} style={{ color: accent }} />
          </div>
          <h2 className="text-5xl md:text-6xl mb-4 font-medium leading-none" style={{ color: accent, fontFamily: "'Great Vibes', cursive" }}>Álbum Compartido</h2>
          <p className={`text-[16px] font-serif italic mb-8 max-w-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>Elegí la mejor foto o video de la noche y subila al álbum colaborativo, así nos queda el recuerdo a todos.</p>
          
          <div className="flex flex-col md:flex-row gap-4 w-full">
             <button className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] shadow-sm hover:shadow-md transition ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-zinc-200 text-black'}`}>
               <ImagePlus size={18} style={{ color: accent }} />
               <span className="text-xs font-black uppercase tracking-widest">Subir al Álbum</span>
             </button>
             {data.instagram && (
               <a href={`https://instagram.com/explore/tags/${data.instagram}`} target="_blank" rel="noopener noreferrer" className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] shadow-sm hover:shadow-md transition ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-zinc-200 text-black'}`}>
                 <span className="text-xs font-black uppercase tracking-widest">#{data.instagram}</span>
               </a>
             )}
          </div>
        </section>
      </div>

      {/* ── CARRUSEL NORMAL (VESTIDOS/BOOK) Sin título ── */}
      <div className="w-full py-20 overflow-hidden relative" style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
         <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
            className="flex w-max gap-4 px-2"
         >
            {[
               "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80",
               // Duplicate for seamless loop
               "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80",
               "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80"
            ].map((url, i) => (
               <div key={i} className="relative w-56 h-80 md:w-64 md:h-96 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-zinc-200 dark:border-white/10 group">
                  <Image src={url} alt={`Dress inspiration ${i}`} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="256px" />
               </div>
            ))}
         </motion.div>
      </div>
      {/* ── RSVP JUVENIL ── */}
      <section className="relative z-[2] py-24 px-4 bg-zinc-100 dark:bg-white/5 border-t border-zinc-200 dark:border-transparent mt-12 rounded-t-[3rem]">
        <div className="max-w-lg mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-[50px] pointer-events-none" style={{ background: accent }} />
          
          <h2 className="text-6xl md:text-7xl mb-3 font-medium leading-none" style={{ color: accent, fontFamily: "'Great Vibes', cursive" }}>Confirmar</h2>
          <p className="text-[16px] font-serif italic text-zinc-600 dark:text-zinc-300 mb-8">¡No me podés fallar! Avisame si venís así organizo todo.</p>

          {!rsvpSubmitted ? (
            <div className="flex flex-col gap-6 text-left">
               <div>
                 <p className="text-xs font-black uppercase tracking-wider mb-2 text-zinc-500 dark:text-zinc-400 ml-2">Asistencia</p>
                 <div className="flex gap-2">
                   <button onClick={() => setRsvpAttending("yes")} className={`flex-1 py-4 border-2 rounded-2xl font-black text-sm uppercase transition-all ${rsvpAttending === "yes" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:border-zinc-500 dark:hover:border-zinc-400"}`}>Sí, ¡Obvio!</button>
                   <button onClick={() => setRsvpAttending("no")} className={`flex-1 py-4 border-2 rounded-2xl font-black text-sm uppercase transition-all ${rsvpAttending === "no" ? "bg-zinc-700 text-white dark:bg-zinc-600 border-zinc-700 dark:border-zinc-500" : "border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:border-zinc-500 dark:hover:border-zinc-400"}`}>No puedo :(</button>
                 </div>
               </div>

               {rsvpAttending !== "no" && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                   <div className="mb-6">
                     <p className="text-xs font-black uppercase tracking-wider mb-2 text-zinc-500 dark:text-zinc-400 ml-2">Tu Nombre / Familia</p>
                     <input type="text" placeholder="Ej: Sofi y Fede" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-600 dark:focus:border-zinc-400 transition-colors" />
                   </div>

                   <div className="mb-6">
                     <p className="text-xs font-black uppercase tracking-wider mb-2 text-zinc-500 dark:text-zinc-400 ml-2">Menú Especial</p>
                     <div className="flex flex-wrap gap-2">
                       {dietOptions.map(d => (
                         <button key={d.id} onClick={() => toggleDiet(d.id)} className={`px-4 py-2 border rounded-xl text-[10px] sm:text-xs font-bold transition-all ${rsvpDiet.has(d.id) ? "border-black bg-black text-white dark:bg-white dark:text-black dark:border-white" : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:border-zinc-500"}`}>
                           {d.icon} {d.label}
                         </button>
                       ))}
                     </div>
                   </div>

                   <div className="mb-6">
                     <p className="text-xs font-black uppercase tracking-wider mb-2 text-zinc-500 dark:text-zinc-400 ml-2">Sugerir Canción</p>
                     <input type="text" placeholder="¿Qué tema no puede faltar?" value={rsvpSong} onChange={(e) => setRsvpSong(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-600 dark:focus:border-zinc-400 transition-colors" />
                   </div>

                   <button onClick={() => {if(rsvpName) setRsvpSubmitted(true)}} className="w-full py-4 text-sm font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform shadow-lg" style={{ background: accent, color: "white" }}>
                     ENVIAR CONFIRMACIÓN
                   </button>
                 </motion.div>
               )}
            </div>
          ) : (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accent}30`, color: accent }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black mb-2 text-zinc-900 dark:text-white">¡Anotado!</h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-300">Nos vemos en la fiesta.</p>
            </motion.div>
          )}
        </div>
      </section>

    </div>
  );
}
