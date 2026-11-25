/** El ruido del papel al rasgarse: ráfagas de ruido filtrado, hechas en el momento. */
export function sonarRasgado() {
  try {
    const ctx = new AudioContext();
    const dur = 0.75;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buffer.getChannelData(0);
    let golpe = 0;
    for (let i = 0; i < d.length; i++) {
      if (Math.random() < 0.006) golpe = 0.4 + Math.random() * 0.6;
      golpe *= 0.9965;
      const t = i / d.length;
      d[i] = (Math.random() * 2 - 1) * (golpe * 0.85 + 0.12) * Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 0.6;
    }
    const fuente = ctx.createBufferSource();
    fuente.buffer = buffer;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.Q.value = 0.7;
    filtro.frequency.setValueAtTime(1800, ctx.currentTime);
    filtro.frequency.linearRampToValueAtTime(4600, ctx.currentTime + dur);
    const volumen = ctx.createGain();
    volumen.gain.value = 0.32;
    fuente.connect(filtro).connect(volumen).connect(ctx.destination);
    fuente.start();
    fuente.onended = () => void ctx.close();
  } catch {
    // Sin audio la invitación se abre igual.
  }
}
