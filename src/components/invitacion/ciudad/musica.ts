/**
 * Música de fondo del estilo "Ciudad": una melodía klezmer original en modo
 * freygish (re, mi bemol, fa sostenido, sol, la, si bemol, do), sintetizada con
 * Web Audio. Es nuestra, así que no hay derechos de autor que cuidar.
 *
 * Cuatro instrumentos simples:
 * - un "clarinete": onda cuadrada filtrada con vibrato;
 * - el bajo en el tiempo fuerte;
 * - un acordeón en el contratiempo (el "um-pa" de la música de fiesta judía);
 * - una pandereta suave.
 */

/** [nota MIDI, duración en corcheas]. Cada compás de 2/4 suma 4 corcheas. */
type Frase = [number, number][];

const A: Frase = [
  [69, 1], [69, 1], [70, 1], [69, 1],
  [67, 1], [66, 1], [67, 2],
  [69, 1], [70, 1], [72, 1], [70, 1],
  [69, 4],
  [74, 1], [72, 1], [70, 1], [69, 1],
  [67, 1], [69, 1], [70, 1], [67, 1],
  [66, 1], [67, 1], [63, 1], [66, 1],
  [62, 4],
];
const B: Frase = [
  [74, 1], [74, 1], [75, 1], [74, 1],
  [72, 1], [70, 1], [72, 2],
  [74, 1], [75, 1], [78, 1], [75, 1],
  [74, 4],
  [79, 1], [78, 1], [75, 1], [74, 1],
  [72, 1], [74, 1], [75, 1], [72, 1],
  [69, 1], [70, 1], [69, 1], [67, 1],
  [66, 1], [63, 1], [62, 2],
];

/** Un acorde por compás: [bajo, ...acordeón]. */
const RE = [38, 57, 62, 66];
const SOLm = [43, 58, 62, 67];
const DOm = [48, 55, 60, 63];
const MIb = [39, 55, 58, 63];
const ACORDES_A = [RE, SOLm, DOm, RE, DOm, SOLm, MIb, RE];
const ACORDES_B = [RE, DOm, RE, RE, SOLm, DOm, SOLm, RE];

const PIEZA: { frase: Frase; acordes: number[][] }[] = [
  { frase: A, acordes: ACORDES_A },
  { frase: A, acordes: ACORDES_A },
  { frase: B, acordes: ACORDES_B },
  { frase: B, acordes: ACORDES_B },
];

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export function crearMusica() {
  let ctx: AudioContext | null = null;
  let salida: GainNode | null = null;
  let ruido: AudioBuffer | null = null;
  let reloj: ReturnType<typeof setInterval> | null = null;
  let proximo = 0;
  let corchea = 0;
  // Si se vuelve a tocar antes de que termine la pausa, la pausa no apaga nada.
  let turno = 0;
  const TEMPO = 126;
  const DUR = 60 / TEMPO / 2;

  // La pieza entera como una lista de eventos por corchea, para recorrerla en loop.
  const melodia: { en: number; nota: number; largo: number }[] = [];
  const acordes: number[][] = [];
  let pos = 0;
  for (const { frase, acordes: ac } of PIEZA) {
    for (const [nota, largo] of frase) {
      melodia.push({ en: pos, nota, largo });
      pos += largo;
    }
    acordes.push(...ac);
  }
  const total = pos;

  function clarinete(t: number, nota: number, largo: number) {
    if (!ctx || !salida) return;
    const osc = ctx.createOscillator();
    const filtro = ctx.createBiquadFilter();
    const g = ctx.createGain();
    const vib = ctx.createOscillator();
    const vibG = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = hz(nota);
    vib.frequency.value = 5.6;
    vibG.gain.setValueAtTime(0, t);
    vibG.gain.linearRampToValueAtTime(hz(nota) * 0.006, t + Math.min(0.25, largo * 0.6));
    vib.connect(vibG).connect(osc.frequency);
    filtro.type = "lowpass";
    filtro.frequency.value = 1700;
    filtro.Q.value = 0.8;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.085, t + 0.025);
    g.gain.setValueAtTime(0.075, t + largo - 0.05);
    g.gain.linearRampToValueAtTime(0, t + largo);
    osc.connect(filtro).connect(g).connect(salida);
    osc.start(t);
    vib.start(t);
    osc.stop(t + largo + 0.02);
    vib.stop(t + largo + 0.02);
  }

  function tono(t: number, nota: number, largo: number, tipo: OscillatorType, vol: number, corte: number) {
    if (!ctx || !salida) return;
    const osc = ctx.createOscillator();
    const filtro = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = hz(nota);
    filtro.type = "lowpass";
    filtro.frequency.value = corte;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + largo);
    osc.connect(filtro).connect(g).connect(salida);
    osc.start(t);
    osc.stop(t + largo + 0.02);
  }

  function pandereta(t: number, vol: number) {
    if (!ctx || !salida || !ruido) return;
    const src = ctx.createBufferSource();
    const filtro = ctx.createBiquadFilter();
    const g = ctx.createGain();
    src.buffer = ruido;
    filtro.type = "highpass";
    filtro.frequency.value = 6000;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    src.connect(filtro).connect(g).connect(salida);
    src.start(t);
    src.stop(t + 0.1);
  }

  function programar() {
    if (!ctx) return;
    while (proximo < ctx.currentTime + 0.15) {
      const c = corchea % total;
      const compas = Math.floor(c / 4);
      const enCompas = c % 4;
      const acorde = acordes[compas % acordes.length];
      for (const m of melodia) if (m.en === c) clarinete(proximo, m.nota, m.largo * DUR * 0.96);
      // Um en el tiempo, pa en el contratiempo.
      if (enCompas === 0 || enCompas === 2) tono(proximo, acorde[0], DUR * 1.6, "triangle", 0.2, 600);
      if (enCompas === 1 || enCompas === 3) {
        for (const n of acorde.slice(1)) tono(proximo, n, DUR * 0.9, "sawtooth", 0.022, 1400);
        pandereta(proximo, 0.035);
      }
      proximo += DUR;
      corchea++;
    }
  }

  return {
    async tocar() {
      turno++;
      if (!ctx) {
        ctx = new AudioContext();
        salida = ctx.createGain();
        salida.gain.value = 0;
        salida.connect(ctx.destination);
        ruido = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const datos = ruido.getChannelData(0);
        for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
      }
      await ctx.resume();
      salida!.gain.cancelScheduledValues(ctx.currentTime);
      salida!.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.2);
      proximo = ctx.currentTime + 0.05;
      if (!reloj) reloj = setInterval(programar, 25);
    },
    pausar() {
      if (!ctx || !salida) return;
      salida.gain.cancelScheduledValues(ctx.currentTime);
      salida.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      const c = ctx;
      const mio = ++turno;
      setTimeout(() => {
        if (mio !== turno) return;
        if (reloj) clearInterval(reloj);
        reloj = null;
        c.suspend();
      }, 450);
    },
    cerrar() {
      if (reloj) clearInterval(reloj);
      ctx?.close();
    },
  };
}
