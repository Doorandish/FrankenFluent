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
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isSpeechSupported());
    return () => {
      if (recognitionRef.current) {
        stopListening(recognitionRef.current);
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopListening(recognitionRef.current);
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current = startListening(
        (text) => {
          onResult(text);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggleRecording}
      disabled={isProcessing}
      className={cn(
        "relative p-3 rounded-full flex items-center justify-center transition-all duration-300 outline-none",
        isRecording ? "bg-red-500/20 text-red-500" : "bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white",
        isProcessing ? "opacity-50 cursor-not-allowed" : ""
      )}
    >
      {isRecording && <span className="pulse-ring"></span>}
      {isRecording ? <Square className="w-5 h-5 fill-current relative z-10" /> : <Mic className="w-5 h-5 relative z-10" />}
    </button>
  );
};
