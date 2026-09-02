import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * MULTILINGUAL TEXT-TO-SPEECH SERVICE
 * Supports English, Telugu, Hindi, Tamil, Kannada, Malayalam.
 * Features voice availability detection, voice selection, pause/resume, and device fallback notification.
 */

const TTS_LOCALES: Record<SupportedLanguageCode, string[]> = {
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
  te: ['te-IN', 'te'],
  ta: ['ta-IN', 'ta'],
  hi: ['hi-IN', 'hi'],
  kn: ['kn-IN', 'kn'],
  ml: ['ml-IN', 'ml']
};

class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return !!this.synth;
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking && !this.synth.paused;
  }

  public isPaused(): boolean {
    return !!this.synth && this.synth.paused;
  }

  public getAllVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public getVoicesForLanguage(language: SupportedLanguageCode): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const all = this.synth.getVoices();
    const locales = TTS_LOCALES[language] || [language];

    return all.filter((v) =>
      locales.some(
        (loc) =>
          v.lang.toLowerCase() === loc.toLowerCase() ||
          v.lang.toLowerCase().startsWith(language.toLowerCase())
      )
    );
  }

  public hasVoiceForLanguage(language: SupportedLanguageCode): boolean {
    const matchingVoices = this.getVoicesForLanguage(language);
    return matchingVoices.length > 0;
  }

  public speak(
    text: string,
    language: SupportedLanguageCode = 'en',
    voiceURI?: string,
    onEnd?: () => void,
    onError?: (err: string) => void,
    onVoiceUnavailable?: (lang: SupportedLanguageCode) => void
  ): void {
    if (!this.isSupported()) {
      if (onError) onError('Text-to-speech is not supported in this browser.');
      return;
    }

    this.stop();

    const cleanText = this.sanitizeTextForSpeech(text);
    if (!cleanText) return;

    const availableVoices = this.getVoicesForLanguage(language);
    const hasVoice = availableVoices.length > 0;

    if (!hasVoice) {
      if (onVoiceUnavailable) {
        onVoiceUnavailable(language);
      }
      if (onError) {
        onError(`${language.toUpperCase()} voice is not available on this device.`);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLocales = TTS_LOCALES[language] || ['en-IN'];
    utterance.lang = targetLocales[0];
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    let matchedVoice: SpeechSynthesisVoice | undefined;
    if (voiceURI) {
      matchedVoice = availableVoices.find((v) => v.voiceURI === voiceURI);
    }
    if (!matchedVoice) {
      matchedVoice = availableVoices[0];
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      if (onError) onError('Speech synthesis playback error.');
    };

    this.synth!.speak(utterance);
  }

  public pause(): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop(): void {
    if (this.synth && (this.synth.speaking || this.synth.paused)) {
      this.synth.cancel();
    }
  }

  private sanitizeTextForSpeech(text: string): string {
    return text
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const textToSpeechService = new TextToSpeechService();
