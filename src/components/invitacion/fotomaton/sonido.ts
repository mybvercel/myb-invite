/**
 * El sonido del estilo fotomatón, generado en el navegador con Web Audio.
 *
 * No hay archivos de audio: el motor de la cabina y la caja de música se
 * sintetizan. Pesa cero, no hay licencia de nadie, y suena igual en todos los
 * celulares. Si la pareja manda su canción (`invitacion.musica`), esa
 * reemplaza a la caja de música; el sonido de la impresión queda igual.
 *
 * Todo arranca desde el toque del invitado: los navegadores no dejan sonar
 * nada que no venga de un gesto.
 */

type Contexto = AudioContext;

/** Ruido blanco de 2 segundos, reutilizable para el motor y el crujido. */
function ruido(ctx: Contexto, segundos = 2) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * segundos, ctx.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
  return buffer;
}

/* ── La cabina imprimiendo ──────────────────────────────────────
   Los tramos están calibrados contra `@keyframes fm-imprime` (2,5 s): el
   motor suena sólo cuando la tira avanza, y en cada frenada hay un clic de
   engranaje. Si se cambian los keyframes, se cambian estos números. */
const TRAMOS: [number, number][] = [
  [0, 0.5],
  [0.75, 1.25],
  [1.5, 2.0],
  [2.2, 2.5],
];

export function sonarImpresion(ctx: Contexto, destino: AudioNode) {
  const t0 = ctx.currentTime + 0.02;
  const base = ruido(ctx);

  for (const [desde, hasta] of TRAMOS) {
    const a = t0 + desde, b = t0 + hasta;

    // El motor: un zumbido grave más el roce del papel contra el rodillo.
    const motor = ctx.createOscillator();
    motor.type = "sawtooth";
    motor.frequency.setValueAtTime(92, a);
    motor.frequency.linearRampToValueAtTime(104, b);
    const filtroMotor = ctx.createBiquadFilter();
    filtroMotor.type = "lowpass";
    filtroMotor.frequency.value = 420;

    const roce = ctx.createBufferSource();
    roce.buffer = base;
    const filtroRoce = ctx.createBiquadFilter();
    filtroRoce.type = "bandpass";
    filtroRoce.frequency.value = 2300;
    filtroRoce.Q.value = 0.9;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, a);
    env.gain.linearRampToValueAtTime(0.22, a + 0.04);
    env.gain.setValueAtTime(0.22, b - 0.05);
    env.gain.linearRampToValueAtTime(0, b);

    const mezcla = ctx.createGain();
    mezcla.gain.value = 0.55;
    motor.connect(filtroMotor).connect(env);
    roce.connect(filtroRoce).connect(mezcla).connect(env);
    env.connect(destino);
    motor.start(a);
    motor.stop(b + 0.05);
    roce.start(a, Math.random());
    roce.stop(b + 0.05);

    clic(ctx, destino, base, b, 0.35);
  }

  // Al final, la tira cae en la bandeja.
  clic(ctx, destino, base, t0 + 2.56, 0.5, 900);
}

/** Un clic mecánico: ruido muy corto y agudo. */
function clic(ctx: Contexto, destino: AudioNode, base: AudioBuffer, t: number, fuerza: number, tono = 3200) {
  const fuente = ctx.createBufferSource();
  fuente.buffer = base;
  const filtro = ctx.createBiquadFilter();
  filtro.type = "highpass";
  filtro.frequency.value = tono;
  const env = ctx.createGain();
  env.gain.setValueAtTime(fuerza, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  fuente.connect(filtro).connect(env).connect(destino);
  fuente.start(t, Math.random());
  fuente.stop(t + 0.08);
}

/* ── La caja de música ───────────────────────────────────────────
   Un vals original en Fa mayor, arpegiado como una caja de música, con un
   eco cálido y el crujido de un vinilo debajo (rima con el disco del
   collage). Dieciséis compases y vuelve a empezar. */

const BPM = 84;
const CORCHEA = 60 / BPM / 2;

// Acordes en MIDI: fundamental, tercera, quinta. I – vi – IV – V, y vuelta.
const ACORDES = [
  [53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55],
  [53, 57, 60], [45, 48, 52], [46, 50, 53], [48, 52, 55],
  [50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55],
  [46, 50, 53], [48, 52, 55], [53, 57, 60], [53, 57, 60],
];

// Melodía arriba de cada compás (3 negras). null = no toca.
const MELODIA: (number | null)[][] = [
  [72, 69, 72], [74, 72, 69], [70, 69, 67], [72, null, 67],
  [77, 76, 72], [76, 72, 69], [74, 72, 70], [69, null, 67],
  [69, 72, 74], [74, 72, 70], [72, 69, 65], [67, 70, 72],
  [74, 72, 70], [72, 70, 67], [69, 67, 65], [65, null, null],
];

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/** Una nota de caja de música: púa metálica, ataque seco y caída larga.
    Los parciales inarmónicos son los de una lengüeta de metal. */
function pua(ctx: Contexto, destino: AudioNode, midi: number, t: number, fuerza: number) {
  const f = hz(midi);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(fuerza, t + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0008, t + 1.6);
  env.connect(destino);

  for (const [mult, vol] of [[1, 1], [2.76, 0.28], [5.4, 0.08]] as const) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f * mult;
    const g = ctx.createGain();
    g.gain.value = vol;
    o.connect(g).connect(env);
    o.start(t);
    o.stop(t + 1.65);
  }
}

export type CajaDeMusica = { detener: () => void };

export function tocarCajaDeMusica(ctx: Contexto, destino: AudioNode): CajaDeMusica {
  // Eco cálido: dos retardos que se realimentan, con los agudos recortados.
  const eco = ctx.createGain();
  eco.gain.value = 0.32;
  const d1 = ctx.createDelay(1), d2 = ctx.createDelay(1);
  d1.delayTime.value = 0.27;
  d2.delayTime.value = 0.41;
  const realim = ctx.createGain();
  realim.gain.value = 0.33;
  const tibio = ctx.createBiquadFilter();
  tibio.type = "lowpass";
  tibio.frequency.value = 2600;
  eco.connect(d1).connect(tibio);
  eco.connect(d2).connect(tibio);
  tibio.connect(realim).connect(d1);
  tibio.connect(destino);

  const seco = ctx.createGain();
  seco.gain.value = 1;
  seco.connect(destino);
  seco.connect(eco);

  // El crujido del vinilo: chasquidos sueltos y un siseo muy bajo.
  const crujido = ctx.createBufferSource();
  const largo = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, largo, ctx.sampleRate);
  const datos = buf.getChannelData(0);
  for (let i = 0; i < largo; i++) {
    const chasquido = Math.random() < 0.0007 ? (Math.random() * 2 - 1) * 0.9 : 0;
    datos[i] = chasquido + (Math.random() * 2 - 1) * 0.012;
  }
  crujido.buffer = buf;
  crujido.loop = true;
  const filtroCrujido = ctx.createBiquadFilter();
  filtroCrujido.type = "bandpass";
  filtroCrujido.frequency.value = 3000;
  const volCrujido = ctx.createGain();
  volCrujido.gain.value = 0.16;
  crujido.connect(filtroCrujido).connect(volCrujido).connect(destino);
  crujido.start();

  // Programador con anticipación: agenda las notas un poco antes de que
  // suenen, así un timer de JS perezoso no desafina el ritmo.
  let compas = 0;
  let proxima = ctx.currentTime + 0.15;
  const programar = () => {
    while (proxima < ctx.currentTime + 0.6) {
      const [raiz, tercera, quinta] = ACORDES[compas % ACORDES.length];
      const melodia = MELODIA[compas % MELODIA.length];
      // Bajo en el uno, arpegio en corcheas, melodía en las negras.
      pua(ctx, seco, raiz, proxima, 0.16);
      [tercera + 12, quinta + 12, raiz + 24, quinta + 12, tercera + 12, quinta + 12].forEach((n, i) =>
        pua(ctx, seco, n, proxima + i * CORCHEA, 0.06),
      );
      melodia.forEach((n, i) => n !== null && pua(ctx, seco, n, proxima + i * 2 * CORCHEA, 0.13));
      proxima += 6 * CORCHEA;
      compas++;
    }
  };
  programar();
  const reloj = window.setInterval(programar, 150);

  return {
    detener: () => {
      window.clearInterval(reloj);
      crujido.stop();
      seco.disconnect();
    },
  };
}
