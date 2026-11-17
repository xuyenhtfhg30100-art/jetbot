/**
 * Voice Narrator for JetBot Exploded Component Tour
 * Uses Web Speech API with Vietnamese voice (vi-VN) + Web Audio synth fallback
 */

export type VoiceStateCallback = (isSpeaking: boolean, text: string) => void;

class VoiceNarratorService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private vietnameseVoice: SpeechSynthesisVoice | null = null;
  private speechRate: number = 1.0;
  private speechVolume: number = 1.0;
  private isMuted: boolean = false;

  public setSpeechRate(rate: number) {
    this.speechRate = Math.max(0.6, Math.min(1.6, rate));
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  public setSpeechVolume(vol: number) {
    this.speechVolume = Math.max(0, Math.min(1, vol / 100));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }
  private isSpeakingState: boolean = false;
  private currentTextState: string = '';
  private listeners = new Set<VoiceStateCallback>();
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize Vietnamese voices
    const viVoice = voices.find(
      (v) =>
        v.lang === 'vi-VN' ||
        v.lang === 'vi_VN' ||
        v.lang.startsWith('vi') ||
        v.name.toLowerCase().includes('vietnam')
    );
    if (viVoice) {
      this.vietnameseVoice = viVoice;
    } else {
      // Fallback: pick any natural or default voice
      this.vietnameseVoice = voices.find((v) => v.default) || voices[0] || null;
    }
  }

  public subscribe(cb: VoiceStateCallback): () => void {
    this.listeners.add(cb);
    cb(this.isSpeakingState, this.currentTextState);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isSpeakingState, this.currentTextState));
  }

  public speak(text: string, onEnd?: () => void) {
    this.stop();
    this.currentTextState = text;

    if (this.isMuted) {
      this.isSpeakingState = true;
      this.notify();
      // Even if muted, notify listeners and trigger onEnd after readable duration
      const duration = Math.max(3000, text.length * 55);
      setTimeout(() => {
        if (this.currentTextState === text) {
          this.isSpeakingState = false;
          this.notify();
          onEnd?.();
        }
      }, duration);
      return;
    }

    if (!this.synth) {
      this.playChime();
      this.isSpeakingState = true;
      this.notify();
      const duration = Math.max(3000, text.length * 55);
      setTimeout(() => {
        this.isSpeakingState = false;
        this.notify();
        onEnd?.();
      }, duration);
      return;
    }

    try {
      this.synth.cancel(); // Clear any queued speech

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.vietnameseVoice) {
        utterance.voice = this.vietnameseVoice;
      }
      utterance.lang = 'vi-VN';
      utterance.rate = this.speechRate;
      utterance.pitch = 1.02;
      utterance.volume = this.speechVolume;

      utterance.onstart = () => {
        this.isSpeakingState = true;
        this.notify();
      };

      utterance.onend = () => {
        this.isSpeakingState = false;
        this.notify();
        onEnd?.();
      };

      utterance.onerror = (e) => {
        // Ignored cancelled errors
        if (e.error !== 'canceled') {
          console.warn('Speech synthesis warning:', e.error);
        }
        this.isSpeakingState = false;
        this.notify();
        onEnd?.();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error, falling back:', err);
      this.playChime();
      this.isSpeakingState = true;
      this.notify();
      setTimeout(() => {
        this.isSpeakingState = false;
        this.notify();
        onEnd?.();
      }, 4000);
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    this.currentUtterance = null;
    this.isSpeakingState = false;
    this.notify();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public getCurrentText(): string {
    return this.currentTextState;
  }

  private playChime() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch {}
  }
}

export const voiceNarrator = new VoiceNarratorService();
