import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * MULTILINGUAL TEXT-TO-SPEECH SERVICE
 *
 * Supports:
 * English
 * Telugu
 * Hindi
 * Tamil
 * Kannada
 * Malayalam
 *
 * Supports:
 * Female / Male voice preference
 *
 * Uses the browser/device Speech Synthesis API.
 */

const TTS_LOCALES: Record<
  SupportedLanguageCode,
  string[]
> = {
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
  te: ['te-IN', 'te'],
  ta: ['ta-IN', 'ta'],
  hi: ['hi-IN', 'hi'],
  kn: ['kn-IN', 'kn'],
  ml: ['ml-IN', 'ml']
};


/*
 * Keywords used to identify voices.
 *
 * IMPORTANT:
 * Browser voice names are different on
 * Windows, Android, Chrome, Edge, etc.
 *
 * Therefore we use multiple keywords and
 * fall back to the first matching language
 * voice if a gender-specific voice cannot
 * be identified.
 */
const FEMALE_VOICE_KEYWORDS = [
  'female',
  'woman',
  'zira',
  'susan',
  'hazel',
  'samantha',
  'heera',
  'priya',
  'kavya',
  'swara',
  'veena',
  'neerja',
  'google telugu female',
  'google hindi female',
  'google tamil female',
  'google kannada female',
  'google malayalam female'
];


const MALE_VOICE_KEYWORDS = [
  'male',
  'man',
  'david',
  'mark',
  'ravi',
  'mohan',
  'prabhat',
  'hemant',
  'google telugu male',
  'google hindi male',
  'google tamil male',
  'google kannada male',
  'google malayalam male'
];


class TextToSpeechService {

  private synth:
    SpeechSynthesis | null = null;


  constructor() {

    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {

      this.synth =
        window.speechSynthesis;
    }
  }


  public isSupported(): boolean {

    return !!this.synth;
  }


  public isSpeaking(): boolean {

    return (
      !!this.synth &&
      this.synth.speaking &&
      !this.synth.paused
    );
  }


  public isPaused(): boolean {

    return (
      !!this.synth &&
      this.synth.paused
    );
  }


  /*
   * Return all voices available
   * on the user's device/browser.
   */
  public getAllVoices():
    SpeechSynthesisVoice[] {

    if (!this.synth) {
      return [];
    }

    return this.synth.getVoices();
  }


  /*
   * Return voices matching the
   * selected application language.
   */
  public getVoicesForLanguage(
    language: SupportedLanguageCode
  ): SpeechSynthesisVoice[] {

    if (!this.synth) {
      return [];
    }


    const all =
      this.synth.getVoices();


    const locales =
      TTS_LOCALES[language] ||
      [language];


    return all.filter(
      (voice) => {

        const voiceLang =
          voice.lang.toLowerCase();


        return locales.some(
          (locale) => {

            const target =
              locale.toLowerCase();


            return (
              voiceLang === target ||
              voiceLang.startsWith(
                language.toLowerCase()
              )
            );
          }
        );
      }
    );
  }


  /*
   * Check whether at least one
   * voice exists for a language.
   */
  public hasVoiceForLanguage(
    language: SupportedLanguageCode
  ): boolean {

    return (
      this.getVoicesForLanguage(
        language
      ).length > 0
    );
  }


  /*
   * Find the best voice based on:
   *
   * Language
   * Female / Male preference
   */
  private findVoiceForGender(
    voices: SpeechSynthesisVoice[],
    gender: 'female' | 'male'
  ): SpeechSynthesisVoice | undefined {

    if (voices.length === 0) {
      return undefined;
    }


    const keywords =
      gender === 'female'
        ? FEMALE_VOICE_KEYWORDS
        : MALE_VOICE_KEYWORDS;


    /*
     * First try to find an explicit
     * gender keyword in the voice name.
     */
    const genderVoice =
      voices.find(
        (voice) => {

          const name =
            voice.name.toLowerCase();


          return keywords.some(
            (keyword) =>
              name.includes(
                keyword.toLowerCase()
              )
          );
        }
      );


    if (genderVoice) {
      return genderVoice;
    }


    /*
     * Some browsers expose voice
     * names without "male/female".
     *
     * In that case use a sensible
     * language-specific fallback.
     */
    return voices[0];
  }


  /*
   * Speak text.
   *
   * gender:
   *   female
   *   male
   */
  public speak(
    text: string,

    language: SupportedLanguageCode = 'en',

    gender: 'female' | 'male' = 'female',

    onEnd?: () => void,

    onError?: (
      err: string
    ) => void,

    onVoiceUnavailable?: (
      lang: SupportedLanguageCode
    ) => void
  ): void {

    if (!this.isSupported()) {

      if (onError) {

        onError(
          'Text-to-speech is not supported in this browser.'
        );
      }

      return;
    }


    /*
     * Stop any existing speech.
     */
    this.stop();


    /*
     * Clean response text.
     */
    const cleanText =
      this.sanitizeTextForSpeech(
        text
      );


    if (!cleanText) {
      return;
    }


    /*
     * Get voices for selected language.
     */
    const availableVoices =
      this.getVoicesForLanguage(
        language
      );


    const hasVoice =
      availableVoices.length > 0;


    /*
     * No voice available.
     */
    if (!hasVoice) {

      if (onVoiceUnavailable) {

        onVoiceUnavailable(
          language
        );
      }


      if (onError) {

        onError(
          `${language.toUpperCase()} voice is not available on this device.`
        );
      }


      return;
    }


    /*
     * Create speech object.
     */
    const utterance =
      new SpeechSynthesisUtterance(
        cleanText
      );


    const targetLocales =
      TTS_LOCALES[language] ||
      ['en-IN'];


    utterance.lang =
      targetLocales[0];


    /*
     * Speech speed.
     */
    utterance.rate =
      0.92;


    /*
     * Normal pitch.
     */
    utterance.pitch =
      1.0;


    /*
     * Find Female / Male voice.
     */
    const matchedVoice =
      this.findVoiceForGender(
        availableVoices,
        gender
      );


    if (matchedVoice) {

      utterance.voice =
        matchedVoice;


      utterance.lang =
        matchedVoice.lang;


      console.log(
        `TTS voice selected: ${matchedVoice.name} (${matchedVoice.lang})`
      );

      console.log(
        `TTS gender preference: ${gender}`
      );
    }


    /*
     * Speech completed.
     */
    utterance.onend =
      () => {

        if (onEnd) {
          onEnd();
        }
      };


    /*
     * Speech error.
     */
    utterance.onerror =
      (event) => {

        console.error(
          'TTS error:',
          event
        );


        if (onError) {

          onError(
            'Speech synthesis playback error.'
          );
        }
      };


    /*
     * Start speaking.
     */
    this.synth!.speak(
      utterance
    );
  }


  /*
   * Pause speech.
   */
  public pause(): void {

    if (
      this.synth &&
      this.synth.speaking &&
      !this.synth.paused
    ) {

      this.synth.pause();
    }
  }


  /*
   * Resume speech.
   */
  public resume(): void {

    if (
      this.synth &&
      this.synth.paused
    ) {

      this.synth.resume();
    }
  }


  /*
   * Stop speech.
   */
  public stop(): void {

    if (
      this.synth &&
      (
        this.synth.speaking ||
        this.synth.paused
      )
    ) {

      this.synth.cancel();
    }
  }


  /*
   * Remove URLs and markdown
   * before speaking.
   */
  private sanitizeTextForSpeech(
    text: string
  ): string {

    return text

      .replace(
        /https?:\/\/\S+/g,
        ''
      )

      .replace(
        /[*_#`~[\]()]/g,
        ' '
      )

      .replace(
        /\s+/g,
        ' '
      )

      .trim();
  }
}


export const textToSpeechService =
  new TextToSpeechService();
