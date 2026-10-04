import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { startListening, stopListening, isSpeechSupported } from '../../lib/speech';
import { cn } from '../../lib/utils';

interface VoiceRecorderProps {
  onResult: (text: string) => void;
  isProcessing?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onResult, isProcessing = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isManualStopRef = useRef(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isSpeechSupported());
    return () => {
      isManualStopRef.current = true;
      if (recognitionRef.current) {
        stopListening(recognitionRef.current);
      }
    };
  }, []);

  const startRecon = () => {
    recognitionRef.current = startListening(
      (text) => {
        onResult(text);
      },
      () => {
        // onEnd handler
        if (!isManualStopRef.current) {
          // Browser auto-stopped (pause), restart it to keep manual toggle behavior
          try {
            startRecon();
          } catch (e) {
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      }
    );
  };

  const toggleRecording = () => {
    if (isRecording) {
      isManualStopRef.current = true;
      if (recognitionRef.current) {
        stopListening(recognitionRef.current);
      }
      setIsRecording(false);
    } else {
      isManualStopRef.current = false;
      setIsRecording(true);
      startRecon();
    }
  };

  if (!supported) return null;

  return (
    <div className="relative flex items-center group">
      {isRecording && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-red-400 bg-dark-900/90 px-3 py-1 rounded-full whitespace-nowrap shadow-lg border border-red-500/20 animate-pulse pointer-events-none">
          Listening... click to stop
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
