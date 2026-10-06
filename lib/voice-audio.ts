/** PCM16 little-endian 24 kHz, format audio/pcm de la voix temps réel. */
export const VOICE_SAMPLE_RATE = 24000;

export function createVoiceAudioContext(): AudioContext {
  try {
    return new AudioContext({ sampleRate: VOICE_SAMPLE_RATE });
  } catch {
    return new AudioContext();
  }
}

export function int16ToBase64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function pcm16Base64ToFloat32(payload: string): Float32Array {
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const samples = Math.floor(bytes.byteLength / 2);
  const view = new DataView(bytes.buffer, bytes.byteOffset, samples * 2);
  const out = new Float32Array(samples);
  for (let i = 0; i < samples; i += 1) {
    out[i] = view.getInt16(i * 2, true) / 32768;
  }
  return out;
}

export function resampleLinear(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (input.length === 0 || fromRate === toRate) return input;
  const outLength = Math.max(1, Math.round((input.length * toRate) / fromRate));
  const out = new Float32Array(outLength);
  const scale = fromRate / toRate;
  const last = input.length - 1;
  for (let i = 0; i < outLength; i += 1) {
    const pos = i * scale;
    const i0 = Math.min(last, Math.floor(pos));
    const i1 = Math.min(last, i0 + 1);
    const frac = pos - i0;
    out[i] = input[i0] + (input[i1] - input[i0]) * frac;
  }
  return out;
}

/** File de lecture sans trou sur un AudioContext déjà repris. */
export class GaplessPcmPlayer {
  private next = 0;
  private nodes: AudioBufferSourceNode[] = [];

  constructor(
    private readonly ctx: AudioContext,
    private readonly sourceRate: number,
    private readonly output: AudioNode = ctx.destination
  ) {}

  enqueue(pcm: Float32Array) {
    if (pcm.length === 0 || this.ctx.state === 'closed') return;
    const samples =
      this.ctx.sampleRate === this.sourceRate
        ? pcm
        : resampleLinear(pcm, this.sourceRate, this.ctx.sampleRate);
    const buffer = this.ctx.createBuffer(1, samples.length, this.ctx.sampleRate);
    buffer.getChannelData(0).set(samples);
    const node = this.ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(this.output);
    const now = this.ctx.currentTime;
    if (this.next < now + 0.02) this.next = now + 0.02;
    node.start(this.next);
    this.next += buffer.duration;
    this.nodes.push(node);
    node.onended = () => {
      this.nodes = this.nodes.filter((item) => item !== node);
    };
  }

  /** Durée (ms) de l’audio déjà reçu qui reste à jouer. */
  pendingMs(): number {
    if (this.ctx.state === 'closed' || this.nodes.length === 0) return 0;
    return Math.max(0, (this.next - this.ctx.currentTime) * 1000);
  }

  stop() {
    for (const node of this.nodes) {
      try {
        node.stop();
      } catch {
        /* déjà arrêté */
      }
    }
    this.nodes = [];
    this.next = 0;
  }
}

export async function attachMicWorklet(
  ctx: AudioContext,
  stream: MediaStream
): Promise<AudioWorkletNode> {
  const moduleUrl = '/pcm-worklet.js';
  try {
    await ctx.audioWorklet.addModule(moduleUrl);
  } catch {
    const source = await fetch(moduleUrl).then((response) => {
      if (!response.ok) throw new Error('worklet');
      return response.text();
    });
    const blob = new Blob([source], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    try {
      await ctx.audioWorklet.addModule(blobUrl);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  const source = ctx.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(ctx, 'pcm-capture', {
    processorOptions: { targetRate: VOICE_SAMPLE_RATE },
  });
  const mute = ctx.createGain();
  mute.gain.value = 0;
  source.connect(worklet);
  worklet.connect(mute);
  mute.connect(ctx.destination);
  return worklet;
}
