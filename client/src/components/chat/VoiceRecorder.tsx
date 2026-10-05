import React, { useState, useEffect, useRef, useCallback } from 'react';
import { startListening, stopListening, isSpeechSupported } from '../../lib/speech';

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
  const recognitionRef = useRef<any>(null);
  const isManualStopRef = useRef(false);
  const isLiveModeRef = useRef(isLiveMode);
  const isRecordingRef = useRef(false);
  const isProcessingRef = useRef(isProcessing);
  const [supported, setSupported] = useState(true);

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isLiveModeRef.current = isLiveMode;
  }, [isLiveMode]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  const updateRecordingState = (active: boolean) => {
    isRecordingRef.current = active;
    setIsRecording(active);
    if (onToggleRecord) onToggleRecord(active);
  };

  // Explicit cleanup of recognition instance
  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        stopListening(recognitionRef.current);
      } catch (e) {
        console.warn('Error during recognition cleanup:', e);
      }
      recognitionRef.current = null;
    }
  }, []);

  // Watchdog timer to detect stalled recognition
  const resetWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    if (isRecordingRef.current || isLiveModeRef.current) {
      watchdogTimerRef.current = setTimeout(() => {
        console.warn('[STT Watchdog] Recognition stalled (no audio/results for 10s). Re-instantiating...');
        cleanupRecognition();
        scheduleRestart(50);
      }, 10000);
    }
  }, [cleanupRecognition]);

  // Debounced auto-restart for continuous/live mode
  const scheduleRestart = useCallback((delayMs: number = 200) => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (isManualStopRef.current && !isLiveModeRef.current) {
      updateRecordingState(false);
      return;
    }

    restartTimeoutRef.current = setTimeout(() => {
      if ((isLiveModeRef.current || isRecordingRef.current) && !isProcessingRef.current) {
        startRecon();
      }
    }, delayMs);
  }, []);

  const startRecon = useCallback(() => {
    cleanupRecognition();

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    updateRecordingState(true);
    resetWatchdog();

    try {
      recognitionRef.current = startListening({
        onAudioStart: () => {
          resetWatchdog();
        },
        onResult: (text: string) => {
          resetWatchdog();
          if (onBargeIn) {
            onBargeIn();
          }
          
          onResult(text);

          if (isLiveModeRef.current && onAutoSend) {
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            silenceTimerRef.current = setTimeout(() => {
              onAutoSend();
            }, 1000);
          }
        },
        onError: (error: string) => {
          console.warn('[STT] Recognition warning/error:', error);
        },
        onEnd: () => {
          if (watchdogTimerRef.current) {
            clearTimeout(watchdogTimerRef.current);
            watchdogTimerRef.current = null;
          }
          scheduleRestart(200);
        }
      }, 'de-DE');
    } catch (err) {
      console.warn('[STT] Failed to initialize recognition:', err);
      scheduleRestart(200);
    }
  }, [cleanupRecognition, onAutoSend, onBargeIn, onResult, resetWatchdog, scheduleRestart]);

  // Initial check and cleanup on unmount
  useEffect(() => {
    setSupported(isSpeechSupported());
    return () => {
      isManualStopRef.current = true;
      cleanupRecognition();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    };
  }, [cleanupRecognition]);

  // Sync with Live Mode changes
  useEffect(() => {
    if (isLiveMode) {
      isManualStopRef.current = false;
      startRecon();
    } else {
      isManualStopRef.current = true;
      cleanupRecognition();
      updateRecordingState(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    }
  }, [isLiveMode, cleanupRecognition, startRecon]);

  const toggleRecording = () => {
    if (isRecording) {
      isManualStopRef.current = true;
      cleanupRecognition();
      updateRecordingState(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    } else {
      isManualStopRef.current = false;
      startRecon();
    }
  };

  if (!supported) return null;

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
      <span>{isRecording ? (isLiveMode ? 'LIVE LISTENING...' : 'LISTENING...') : 'TAP TO SPEAK'}</span>
    </div>
  );
};
