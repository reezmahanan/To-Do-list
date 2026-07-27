export class SoundManager {
  private static readonly MUTE_KEY = 'todo_sound_muted';
  private isMuted: boolean = false;

  constructor() {
    this.isMuted = localStorage.getItem(SoundManager.MUTE_KEY) === 'true';
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem(SoundManager.MUTE_KEY, String(this.isMuted));
    return this.isMuted;
  }

  public playCompleteChime(): void {
    if (this.isMuted) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Programmatic synthesis of dual-tone chime: G5 -> C6
      this.playTone(ctx, 784, now, 0.25);
      this.playTone(ctx, 1046.5, now + 0.07, 0.4);
    } catch (e) {
      console.warn('AudioContext failed to initialize.', e);
    }
  }

  private playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}
