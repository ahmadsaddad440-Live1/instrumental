// Web Audio API Sound Synthesizer for Instrumental Relaxation, Lo-Fi Study Beats, Ambient & Deep Work

let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioCtxClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

export type SoundPadType =
  | 'rhodes'
  | 'vinyl'
  | 'kick'
  | 'snare'
  | 'bowl'
  | 'binaural'
  // Backward compatibility types
  | 'dut'
  | 'tak'
  | 'tung'
  | 'horeg'
  | 'kecrek'
  | 'hat';

export type DrumSoundType = SoundPadType;

export function playLiveDrum(type: SoundPadType) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 1. Warm Rhodes Electric Piano Chord (Lush Jazz Dm9 / Cmaj9 chord)
    if (type === 'rhodes' || type === 'tung') {
      const chordNotes = [293.66, 349.23, 440.0, 523.25, 659.25]; // D4, F4, A4, C5, E5
      chordNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(450, now + 1.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18 / chordNotes.length, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.7);
      });
    }
    // 2. Vinyl Crackle & Soft Rain Noise
    else if (type === 'vinyl' || type === 'kecrek') {
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Crackle bursts + pinkish noise
        const isPop = Math.random() < 0.004;
        data[i] = isPop ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.08;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.46);
    }
    // 3. Soft Lo-Fi Boom-Bap Kick (Warm, muffled, rounded - NOT harsh)
    else if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    }
    // 4. Muffled Lo-Fi Snare / Rimclick
    else if (type === 'snare' || type === 'tak' || type === 'hat') {
      // Body tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.06);

      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);

      // Noise layer (gentle warm snare)
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.value = 1.8;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.15);
    }
    // 5. Tibetan Singing Bowl / Zen Meditative Bell
    else if (type === 'bowl' || type === 'horeg') {
      const baseFreq = 261.63; // Middle C (Zen bowl)
      const overtones = [baseFreq, baseFreq * 2.76, baseFreq * 5.4];
      overtones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.6);
      });
    }
    // 6. 432Hz Alpha Brainwave Tone
    else if (type === 'binaural' || type === 'dut') {
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const gain = ctx.createGain();

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(432, now); // Left ear 432Hz
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(442, now); // Right ear 442Hz -> 10Hz Alpha difference!

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      oscL.connect(gain);
      oscR.connect(gain);
      gain.connect(ctx.destination);

      oscL.start(now);
      oscR.start(now);
      oscL.stop(now + 1.9);
      oscR.stop(now + 1.9);
    }
  } catch (err) {
    console.error('Audio play error:', err);
  }
}

// Full Offline Audio Synthesizer to render complete Instrumental Relaxation / Lo-Fi Study track
export async function renderFullLofiAudio(options: {
  bpm: number;
  durationSeconds: number;
  bassType?: 'warm-sub' | 'upright-jazz' | 'ambient-drone' | 'horeg' | 'koplo' | 'senam';
  onProgress?: (percent: number, step: string) => void;
}): Promise<{ blob: Blob; url: string; duration: number }> {
  const { bpm = 75, durationSeconds = 30, onProgress } = options;
  const sampleRate = 44100;
  const totalSamples = sampleRate * durationSeconds;

  const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtxClass(2, totalSamples, sampleRate);

  onProgress?.(15, 'Meracik Suasana Hujan & Vinyl Crackle Analog...');
  await new Promise((r) => setTimeout(r, 60));

  // 1. Continuous Vinyl & Gentle Rain Bed
  synthesizeVinylRainBed(offlineCtx, durationSeconds);

  onProgress?.(35, 'Menyusun Progresi Akord Rhodes Electric Piano Jazz...');
  await new Promise((r) => setTimeout(r, 60));

  const beat = 60 / bpm;
  const bar = beat * 4;

  // 2. Lush Lo-Fi Jazz Chord Progression: Dm9 -> G13 -> Cmaj9 -> Am7
  const chordProgression = [
    // Dm9: D3, F3, A3, C4, E4
    [146.83, 174.61, 220.0, 261.63, 329.63],
    // G13: G2, F3, B3, E4
    [98.0, 174.61, 246.94, 329.63],
    // Cmaj9: C3, E3, G3, B3, D4
    [130.81, 164.81, 196.0, 246.94, 293.66],
    // Am7: A2, E3, G3, C4
    [110.0, 164.81, 196.0, 261.63],
  ];

  let chordIdx = 0;
  for (let t = 0.4; t < durationSeconds - 1; t += bar) {
    const chord = chordProgression[chordIdx % chordProgression.length];
    chord.forEach((freq) => {
      synthesizeRhodesNote(offlineCtx, t, freq, bar * 0.95);
    });

    // Warm sub bass
    const rootBass = chord[0] / 2;
    synthesizeLofiBass(offlineCtx, t, rootBass, bar * 0.85);

    chordIdx++;
  }

  onProgress?.(60, 'Menenun Ketukan Lembut Lo-Fi Boom Bap Drums...');
  await new Promise((r) => setTimeout(r, 60));

  // 3. Gentle Lo-Fi Boom Bap Groove (Relaxing kick & soft snare rim)
  for (let t = beat * 2; t < durationSeconds - 1; t += bar) {
    // Soft kick on beat 1 and beat 3-and
    synthesizeLofiKick(offlineCtx, t);
    synthesizeLofiKick(offlineCtx, t + beat * 2.5);

    // Mellow snare on beat 2 and beat 4
    synthesizeLofiSnare(offlineCtx, t + beat);
    synthesizeLofiSnare(offlineCtx, t + beat * 3);

    // Subtle brushed shaker / hi-hat on every 8th note
    for (let h = 0; h < 8; h++) {
      const hatTime = t + h * (beat / 2);
      if (hatTime < durationSeconds - 0.2) {
        synthesizeLofiHat(offlineCtx, hatTime, h % 2 === 0 ? 0.08 : 0.05);
      }
    }
  }

  onProgress?.(80, 'Menambahkan Melodi Kalimba & Shimmer Solo...');
  await new Promise((r) => setTimeout(r, 60));

  // 4. Meditative Melody Plucks (Kalimba / Bell Arpeggios)
  synthesizeMeditativeMelody(offlineCtx, durationSeconds, bpm);

  onProgress?.(92, 'Mastering Analog Tape Warmth & Dynamic Limiter...');
  await new Promise((r) => setTimeout(r, 60));

  onProgress?.(96, 'Merender Buffer Audio 44.1kHz...');
  const renderedBuffer = await offlineCtx.startRendering();

  onProgress?.(99, 'Mengemas Master Audio WAV...');
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  const url = URL.createObjectURL(wavBlob);

  onProgress?.(100, 'Audio Instrumental Relaksasi Siap!');
  return {
    blob: wavBlob,
    url,
    duration: durationSeconds,
  };
}

// Backward-compatible alias
export const renderFullDangdutAudio = renderFullLofiAudio;

// Helper Synthesizer Functions
function synthesizeVinylRainBed(ctx: BaseAudioContext, duration: number) {
  const bufferSize = ctx.sampleRate * Math.min(duration, 10);
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < bufferSize; i++) {
      const isCrackle = Math.random() < 0.003;
      data[i] = isCrackle ? (Math.random() * 2 - 1) * 0.45 : (Math.random() * 2 - 1) * 0.04;
    }
  }

  // Play loop
  for (let start = 0; start < duration; start += 10) {
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2600;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, start);
    gain.gain.setValueAtTime(0.12, Math.min(start + 9.5, duration - 1));
    if (start + 10 >= duration) {
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(start);
    noise.stop(Math.min(start + 10, duration));
  }
}

function synthesizeRhodesNote(ctx: BaseAudioContext, time: number, freq: number, duration: number) {
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);

  // Slight detune for analog warmth
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 1.0015, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1100, time);
  filter.frequency.exponentialRampToValueAtTime(420, time + duration);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.045, time + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0005, time + duration);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc2.start(time);
  osc.stop(time + duration);
  osc2.stop(time + duration);
}

function synthesizeLofiBass(ctx: BaseAudioContext, time: number, freq: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(160, time);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.22, time + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + duration);
}

function synthesizeLofiKick(ctx: BaseAudioContext, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(95, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);

  gain.gain.setValueAtTime(0.45, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.32);
}

function synthesizeLofiSnare(ctx: BaseAudioContext, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(170, time);
  osc.frequency.exponentialRampToValueAtTime(110, time + 0.07);

  gain.gain.setValueAtTime(0.2, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.13);
}

function synthesizeLofiHat(ctx: BaseAudioContext, time: number, vol = 0.06) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(800, time);

  filter.type = 'highpass';
  filter.frequency.setValueAtTime(4500, time);

  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.05);
}

function synthesizeMeditativeMelody(ctx: BaseAudioContext, duration: number, bpm: number) {
  const beat = 60 / bpm;
  // Pentatonic serene scale notes: D4, F4, G4, A4, C5, D5
  const scale = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33];

  for (let t = beat * 4; t < duration - 2; t += beat * 2) {
    const noteFreq = scale[Math.floor(Math.sin(t) * 100) % scale.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.035, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + beat * 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + beat * 1.6);
  }
}

// Convert AudioBuffer to standard 16-bit PCM WAV Blob
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');

  /* FMT sub-chunk */
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  /* data sub-chunk */
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Write interleaved 16-bit PCM channel samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}
