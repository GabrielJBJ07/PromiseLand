// Web Audio API Synthesizer for Children's Praise Background Music & Sound Effects

class BGMManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private currentNoteIndex: number = 0;
  private volume: number = 0.15;
  private listeners: ((playing: boolean) => void)[] = [];

  // Cheerful Praise Tune Notes (Praise / Worship Melody in C Major & G Major)
  // Frequencies corresponding to notes: C4, D4, E4, F4, G4, A4, B4, C5, D5, E5
  private praiseMelody = [
    { note: 523.25, duration: 0.25 }, // C5
    { note: 587.33, duration: 0.25 }, // D5
    { note: 659.25, duration: 0.5 },  // E5
    { note: 659.25, duration: 0.25 }, // E5
    { note: 659.25, duration: 0.25 }, // E5
    { note: 587.33, duration: 0.25 }, // D5
    { note: 523.25, duration: 0.25 }, // C5
    { note: 587.33, duration: 0.5 },  // D5

    { note: 659.25, duration: 0.25 }, // E5
    { note: 659.25, duration: 0.25 }, // E5
    { note: 659.25, duration: 0.25 }, // E5
    { note: 587.33, duration: 0.25 }, // D5
    { note: 523.25, duration: 0.25 }, // C5
    { note: 440.00, duration: 0.5 },  // A4
    { note: 392.00, duration: 0.5 },  // G4

    { note: 523.25, duration: 0.25 }, // C5
    { note: 587.33, duration: 0.25 }, // D5
    { note: 659.25, duration: 0.25 }, // E5
    { note: 698.46, duration: 0.25 }, // F5
    { note: 783.99, duration: 0.5 },  // G5
    { note: 783.99, duration: 0.25 }, // G5
    { note: 698.46, duration: 0.25 }, // F5
    { note: 659.25, duration: 0.5 },  // E5

    { note: 587.33, duration: 0.25 }, // D5
    { note: 523.25, duration: 0.25 }, // C5
    { note: 587.33, duration: 0.5 },  // D5
    { note: 523.25, duration: 0.75 }, // C5
  ];

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleBGM(): boolean {
    if (this.isPlaying) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isPlaying;
  }

  public startBGM() {
    try {
      const ctx = this.getAudioContext();
      this.isPlaying = true;
      this.notifyListeners();

      const playNextNote = () => {
        if (!this.isPlaying || !this.ctx) return;

        const current = this.praiseMelody[this.currentNoteIndex];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm Marimba / Chiptune synthesis type
        osc.type = 'sine';
        osc.frequency.setValueAtTime(current.note, ctx.currentTime);

        // Soft envelope
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + current.duration * 0.9);

        // Harmony bass note
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(current.note / 2, ctx.currentTime);
        bassGain.gain.setValueAtTime(0, ctx.currentTime);
        bassGain.gain.linearRampToValueAtTime(this.volume * 0.4, ctx.currentTime + 0.03);
        bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + current.duration * 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        bassOsc.start(ctx.currentTime);

        osc.stop(ctx.currentTime + current.duration);
        bassOsc.stop(ctx.currentTime + current.duration);

        this.currentNoteIndex = (this.currentNoteIndex + 1) % this.praiseMelody.length;

        const nextDelay = current.duration * 600; // Tempo multiplier
        this.timerId = window.setTimeout(playNextNote, nextDelay);
      };

      playNextNote();
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  public stopBGM() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notifyListeners();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public playChime() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.2); // C6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // ignore
    }
  }

  public playFanfare() {
    try {
      const ctx = this.getAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
      });
    } catch (e) {
      // ignore
    }
  }

  public playWarpSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // ignore
    }
  }

  public subscribe(fn: (playing: boolean) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn(this.isPlaying));
  }
}

export const bgmSynth = new BGMManager();
