import React, { useState, useEffect, useRef, useCallback } from 'react';
import { unlockAudio } from '../../lib/neuralTts';
import { ensureMicrophoneAccess, stopMicrophoneStream } from '../../lib/audioStream';

interface VoiceRecorderProps {
  onResult: (text: string) => void;
  isProcessing?: boolean;
  isLiveMode?: boolean;
  onAutoSend?: () => void;
  onBargeIn?: () => void;
  onToggleRecord?: (active: boolean) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onResult, 
  isProcessing = false,
  isLiveMode = false,
  onAutoSend,
  onBargeIn,
  onToggleRecord
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const isListeningActiveRef = useRef(false);
  const isLiveModeRef = useRef(isLiveMode);
  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef('');
  const hasSpokenRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isLiveModeRef.current = isLiveMode;
  }, [isLiveMode]);

  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + final).trim();
      }

      const combinedText = (accumulatedTextRef.current + ' ' + interim).trim();

      if (combinedText) {
        hasSpokenRef.current = true;
        if (onBargeIn) onBargeIn();
        onResult(combinedText);

        // 1000ms true silence debounce after active speech before auto-sending
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (isLiveModeRef.current && onAutoSend) {
          silenceTimerRef.current = setTimeout(() => {
            if (hasSpokenRef.current && accumulatedTextRef.current) {
              hasSpokenRef.current = false;
              accumulatedTextRef.current = '';
              onAutoSend();
            }
          }, 1000);
        }
      }
    };

    recognition.onerror = (event: any) => {
      // Unhandled no-speech or aborted errors should NEVER kill the session
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[STT] recognition error:', event.error);
      }
    };

    // Resilient Keep-Alive Loop: immediately reconnect on onend if listening is active
    recognition.onend = () => {
      if (isListeningActiveRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setTimeout(() => {
            if (isListeningActiveRef.current) {
              try {
                recognition.start();
              } catch (err) {
                // Next onend or interval will attempt recovery
              }
            }
          }, 200);
        }
      } else {
        setIsRecording(false);
        if (onToggleRecord) onToggleRecord(false);
      }
    };

    return recognition;
  }, [onAutoSend, onBargeIn, onResult, onToggleRecord]);

  const startListening = useCallback(async () => {
    unlockAudio();
    try {
      await ensureMicrophoneAccess();
    } catch (err) {
      console.warn('Microphone permission denied or device error:', err);
      return;
    }

    isListeningActiveRef.current = true;
    setIsRecording(true);
    if (onToggleRecord) onToggleRecord(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recognition = initRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      setTimeout(() => {
        if (isListeningActiveRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {}
        }
      }, 200);
    }
  }, [initRecognition, onToggleRecord]);

  const stopListening = useCallback(() => {
    isListeningActiveRef.current = false;
    setIsRecording(false);
    accumulatedTextRef.current = '';
    hasSpokenRef.current = false;
    if (onToggleRecord) onToggleRecord(false);
    stopMicrophoneStream();

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, [onToggleRecord]);

  // Sync with Live Mode toggle
  useEffect(() => {
    if (isLiveMode) {
      startListening();
    } else {
      stopListening();
    }
  }, [isLiveMode, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningActiveRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const toggleRecording = () => {
    unlockAudio();
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="live-control-wrap">
      <div className={`pulse-ring ${isRecording ? 'active' : ''}`} />
      <button
        type="button"
        onClick={toggleRecording}
        disabled={isProcessing}
        aria-label={isRecording ? 'Stop listening' : 'Start speaking'}
        className={`live-control pressable ${isRecording ? '' : 'paused'}`}
      >
        <div className={`waveform ${isRecording ? '' : 'idle'}`}>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </button>
      <span>
        {isRecording
          ? isLiveMode
            ? 'LIVE LISTENING...'
            : 'LISTENING...'
          : 'TAP TO SPEAK'}
      </span>
    </div>
  );
};
