import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Square, AlertCircle, Globe, Mic, Settings } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from '../../config/languageConfig';
import { textToSpeechService } from '../../services/textToSpeechService';
import './MultilingualVoiceBar.css';

interface MultilingualVoiceBarProps {
  lastResponseText?: string;
}

export const MultilingualVoiceBar: React.FC<MultilingualVoiceBarProps> = ({ lastResponseText }) => {
  const {
    currentLanguage,
    setLanguage,
    autoSpeak,
    setAutoSpeak,
    selectedVoiceURI,
    setSelectedVoiceURI
  } = useLanguage();

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceUnavailableWarning, setVoiceUnavailableWarning] = useState<string | null>(null);

  // Load system voices on mount and when voices change
  useEffect(() => {
    const updateVoices = () => {
      const voices = textToSpeechService.getVoicesForLanguage(currentLanguage);
      setAvailableVoices(voices);

      const hasVoice = textToSpeechService.hasVoiceForLanguage(currentLanguage);
      const langConfig = SUPPORTED_LANGUAGES[currentLanguage];

      if (!hasVoice) {
        setVoiceUnavailableWarning(
          `${langConfig.displayName} text response ready. (${langConfig.displayName} voice playback is not available on this device).`
        );
      } else {
        setVoiceUnavailableWarning(null);
        if (!selectedVoiceURI && voices.length > 0) {
          setSelectedVoiceURI(voices[0].voiceURI);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [currentLanguage]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as SupportedLanguageCode;
    setLanguage(newLang);
    textToSpeechService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoiceURI(e.target.value);
  };

  const handleListenClick = () => {
    if (!lastResponseText) return;

    const hasVoice = textToSpeechService.hasVoiceForLanguage(currentLanguage);
    const langConfig = SUPPORTED_LANGUAGES[currentLanguage];

    if (!hasVoice) {
      setVoiceUnavailableWarning(
        `${langConfig.displayName} text response ready. (${langConfig.displayName} voice playback is not available on this device).`
      );
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);

    textToSpeechService.speak(
      lastResponseText,
      currentLanguage,
      selectedVoiceURI,
      () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
      (err) => {
        console.warn(err);
        setIsPlaying(false);
        setIsPaused(false);
      },
      (unavailLang) => {
        const langName = SUPPORTED_LANGUAGES[unavailLang].displayName;
        setVoiceUnavailableWarning(
          `${langName} text response ready. (${langName} voice playback is not available on this device).`
        );
      }
    );
  };

  const handlePauseClick = () => {
    textToSpeechService.pause();
    setIsPaused(true);
  };

  const handleResumeClick = () => {
    textToSpeechService.resume();
    setIsPaused(false);
  };

  const handleStopClick = () => {
    textToSpeechService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="multilingual-voice-bar glass-card">
      <div className="voice-bar-top-row">
        {/* Language Selector */}
        <div className="control-group">
          <label className="control-label">
            <Globe size={14} className="icon-cyan" /> Language:
          </label>
          <select
            className="voice-select-field"
            value={currentLanguage}
            onChange={handleLanguageChange}
          >
            {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguageCode[]).map((code) => {
              const lang = SUPPORTED_LANGUAGES[code];
              return (
                <option key={code} value={code}>
                  {lang.flagEmoji} {lang.displayName} ({lang.nativeName})
                </option>
              );
            })}
          </select>
        </div>

        {/* Voice Selector */}
        <div className="control-group">
          <label className="control-label">
            <Mic size={14} className="icon-violet" /> Voice:
          </label>
          <select
            className="voice-select-field"
            value={selectedVoiceURI}
            onChange={handleVoiceChange}
            disabled={availableVoices.length === 0}
          >
            {availableVoices.length > 0 ? (
              availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))
            ) : (
              <option value="">Default System Voice (Playback Unavailable)</option>
            )}
          </select>
        </div>

        {/* Auto Speak Toggle */}
        <div className="control-group auto-speak-group">
          <span className="control-label">Auto Speak:</span>
          <button
            type="button"
            className={`btn-toggle-auto-speak ${autoSpeak ? 'active' : ''}`}
            onClick={() => setAutoSpeak(!autoSpeak)}
          >
            {autoSpeak ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Playback Control Buttons */}
      <div className="voice-bar-playback-row">
        <div className="playback-btn-group">
          {!isPlaying ? (
            <button
              type="button"
              className="btn btn-primary btn-sm btn-playback"
              onClick={handleListenClick}
              disabled={!lastResponseText}
            >
              <Volume2 size={15} />
              <span>🔊 Listen</span>
            </button>
          ) : isPaused ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-playback"
              onClick={handleResumeClick}
            >
              <Play size={15} className="icon-emerald" />
              <span>▶ Resume</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-playback"
              onClick={handlePauseClick}
            >
              <Pause size={15} className="icon-amber" />
              <span>⏸ Pause</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm btn-playback"
            onClick={handleStopClick}
            disabled={!isPlaying && !isPaused}
          >
            <Square size={14} className="icon-rose" />
            <span>⏹ Stop</span>
          </button>
        </div>

        {isPlaying && !isPaused && (
          <div className="voice-speaking-indicator">
            <span className="speaking-wave"></span>
            <span>AI Speaking response in {SUPPORTED_LANGUAGES[currentLanguage].displayName}...</span>
          </div>
        )}
      </div>

      {/* Fallback Warning Toast when Voice is Unavailable */}
      {voiceUnavailableWarning && (
        <div className="voice-unavailable-toast">
          <AlertCircle size={15} className="icon-amber" style={{ flexShrink: 0 }} />
          <span>{voiceUnavailableWarning}</span>
        </div>
      )}
    </div>
  );
};
