// Web Speech API Voice synthesis helper for JARVIS
// Fully client-side, zero latency, works on iPhone (Safari/iOS) and all desktop browsers

class JarvisVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private voiceEnabled: boolean = true;
  private listeners: ((speaking: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Load preference from localStorage
      const saved = localStorage.getItem('jarvis_voice_enabled');
      this.voiceEnabled = saved !== null ? saved === 'true' : true;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jarvis_voice_enabled', String(enabled));
    }
    if (!enabled && this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }

  public subscribe(cb: (speaking: boolean) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((cb) => cb(speaking));
  }

  /**
   * Speak a text message cleanly in Spanish.
   * Cleans markdown (removes **, #, links, etc.) so speech sounds organic and fluid.
   */
  public speak(text: string, onEnd?: () => void): void {
    if (!this.synth || !this.voiceEnabled || !text) {
      if (onEnd) onEnd();
      return;
    }

    try {
      // Cancel any ongoing speech
      this.synth.cancel();

      // Clean markdown and formatting symbols
      const cleanText = text
        .replace(/[*#_`~]/g, '') // remove asterisks, hash, backticks
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
        .replace(/https?:\/\/\S+/g, '') // urls
        .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // remove emojis for smoother reading
        .replace(/€/g, ' euros ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      // Take first 2 sentences if too long to keep JARVIS direct and fast
      const sentences = cleanText.split(/(?<=[.!?])\s+/);
      const spokenText = sentences.slice(0, 3).join(' ');

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05; // Lively, energetic tempo
      utterance.pitch = 1.0;

      // Select high quality Spanish voice if available
      const voices = this.synth.getVoices();
      const spanishVoice =
        voices.find((v) => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Jorge') || v.name.includes('Mónica') || v.name.includes('Diego'))) ||
        voices.find((v) => v.lang.startsWith('es'));

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onstart = () => this.notify(true);
      utterance.onend = () => {
        this.notify(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.notify(false);
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.notify(false);
      if (onEnd) onEnd();
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const jarvisVoice = new JarvisVoiceEngine();
