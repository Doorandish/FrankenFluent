import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';
import { startListening, stopListening, isSpeechSupported } from '../../lib/speech';
import { cn } from '../../lib/utils';

interface VoiceRecorderProps {
  onResult: (text: string) => void;
  isProcessing?: boolean;
  isLiveMode?: boolean;
  onAutoSend?: () => void;
  onBargeIn?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onResult, 
  isProcessing = false,
  isLiveMode = false,
  onAutoSend,
  onBargeIn
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

  // Keep refs in sync with props
  useEffect(() => {
    isLiveModeRef.current = isLiveMode;
  }, [isLiveMode]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

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
    // Only arm watchdog when recording should be active
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

    // Do not restart if user manually stopped in non-live mode
    if (isManualStopRef.current && !isLiveModeRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      return;
    }

    restartTimeoutRef.current = setTimeout(() => {
      // Re-check conditions before starting
      if ((isLiveModeRef.current || isRecordingRef.current) && !isProcessingRef.current) {
        startRecon();
      }
    }, delayMs);
  }, []);

  const startRecon = useCallback(() => {
    // 1. Explicit cleanup before starting new session
    cleanupRecognition();

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    isRecordingRef.current = true;
    setIsRecording(true);
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

          // Auto-send debounce for Live Mode (1000ms of pause after speech)
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
          console.warn('[STT] Recognition error:', error);
          // For network or transient glitches, do not kill the session;
          // onend will handle recovery via scheduleRestart.
        },
        onEnd: () => {
          if (watchdogTimerRef.current) {
            clearTimeout(watchdogTimerRef.current);
            watchdogTimerRef.current = null;
          }
          // Handle onend gracefully with 200ms debounce
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
      isRecordingRef.current = false;
      setIsRecording(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    }
  }, [isLiveMode, cleanupRecognition, startRecon]);

  const toggleRecording = () => {
    if (isLiveMode) return; // In live mode, it is hands-free

    if (isRecording) {
      isManualStopRef.current = true;
      cleanupRecognition();
      isRecordingRef.current = false;
      setIsRecording(false);
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
    <div className="relative flex items-center group">
      {isRecording && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-red-400 bg-dark-900/90 px-3 py-1 rounded-full whitespace-nowrap shadow-lg border border-red-500/20 animate-pulse pointer-events-none">
          {isLiveMode ? 'Live Listening...' : 'Listening... click to stop'}
        </span>
      )}
      <button
        type="button"
        onClick={toggleRecording}
        disabled={isProcessing}
        className={cn(
          "relative p-3 rounded-full flex items-center justify-center transition-all duration-300 outline-none",
          isRecording ? "bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white",
          isProcessing ? "opacity-50 cursor-not-allowed" : ""
        )}
      >
        {isRecording && <span className="pulse-ring bg-red-500"></span>}
        {isRecording ? <Square className="w-5 h-5 fill-current relative z-10" /> : <Mic className="w-5 h-5 relative z-10" />}
      </button>
    </div>
  );
};
