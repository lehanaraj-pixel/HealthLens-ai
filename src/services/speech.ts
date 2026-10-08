/**
 * Web SpeechSynthesis wrapper with English and Hindi voice support,
 * playback state listeners, and slow-rate clarity for elderly patients.
 */

type SpeechStatus = 'idle' | 'playing' | 'paused';

class SpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private status: SpeechStatus = 'idle';
  private listeners: Set<(status: SpeechStatus, activeText: string) => void> = new Set();
  private activeText: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Pre-warm voices
      };
    }
  }

  public subscribe(listener: (status: SpeechStatus, activeText: string) => void) {
    this.listeners.add(listener);
    listener(this.status, this.activeText);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(status: SpeechStatus, text: string = '') {
    this.status = status;
    this.activeText = text;
    this.listeners.forEach((fn) => fn(status, text));
  }

  public getStatus(): SpeechStatus {
    return this.status;
  }

  public getActiveText(): string {
    return this.activeText;
  }

  public speak(text: string, lang: 'en' | 'hi' = 'en') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported in this browser.');
      return;
    }

    this.stop();

    if (!text || !text.trim()) return;

    // Clean markdown hashes/asterisks for natural speech
    const cleanText = text
      .replace(/[#*`_~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    // Auto-detect Hindi script if present in text
    const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
    const targetLang = lang === 'hi' || hasDevanagari ? 'hi' : 'en';

    // Pick best available voice for language
    const voices = window.speechSynthesis.getVoices();
    if (targetLang === 'hi') {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      utterance.lang = 'en-US';
      const englishVoice = voices.find(
        (v) =>
          (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))) ||
          v.lang === 'en-US'
      );
      if (englishVoice) utterance.voice = englishVoice;
    }

    // Steady, gentle rate suitable for patients and older adults
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.notify('playing', cleanText);
    };

    utterance.onpause = () => {
      this.notify('paused', cleanText);
    };

    utterance.onresume = () => {
      this.notify('playing', cleanText);
    };

    utterance.onend = () => {
      this.notify('idle', '');
      this.currentUtterance = null;
    };

    utterance.onerror = (e) => {
      console.warn('Speech error or cancellation:', e);
      this.notify('idle', '');
      this.currentUtterance = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this.notify('paused', this.activeText);
      }
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.notify('playing', this.activeText);
      }
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.notify('idle', '');
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();
