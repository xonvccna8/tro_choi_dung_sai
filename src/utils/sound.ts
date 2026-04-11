let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq: number, duration = 0.08, type: OscillatorType = "sine") {
  const audio = getCtx();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

export function playCorrect(enabled: boolean) {
  if (!enabled) return;
  beep(760, 0.06, "triangle");
  setTimeout(() => beep(930, 0.08, "triangle"), 60);
}

export function playWrong(enabled: boolean) {
  if (!enabled) return;
  beep(220, 0.12, "sawtooth");
}

export function playReward(enabled: boolean) {
  if (!enabled) return;
  beep(980, 0.05, "square");
  setTimeout(() => beep(1240, 0.06, "square"), 70);
  setTimeout(() => beep(1480, 0.07, "square"), 140);
}
