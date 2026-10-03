class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const requested = options && options.processorOptions && options.processorOptions.targetRate;
    this.targetRate = typeof requested === 'number' && requested > 0 ? requested : 24000;
    this.step = sampleRate / this.targetRate;
    this.pos = 0;
    this.prev = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel || channel.length === 0) {
      return true;
    }

    let sum = 0;
    for (let i = 0; i < channel.length; i += 1) {
      const sample = channel[i];
      sum += sample * sample;
    }

    const pcm = [];
    while (this.pos < channel.length) {
      const index = Math.floor(this.pos);
      const frac = this.pos - index;
      const left = index >= 0 && index < channel.length ? channel[index] : this.prev;
      const rightIndex = index + 1;
      const right =
        rightIndex >= 0 && rightIndex < channel.length ? channel[rightIndex] : left;
      const mixed = left + (right - left) * frac;
      const clamped = Math.max(-1, Math.min(1, mixed));
      pcm.push(clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff);
      this.pos += this.step;
    }

    this.pos -= channel.length;
    this.prev = channel[channel.length - 1];

    const rms = Math.sqrt(sum / channel.length);
    if (pcm.length > 0) {
      const frame = new Int16Array(pcm);
      this.port.postMessage({ pcm: frame, rms }, [frame.buffer]);
    } else {
      this.port.postMessage({ rms });
    }
    return true;
  }
}

registerProcessor('pcm-capture', PcmCaptureProcessor);
