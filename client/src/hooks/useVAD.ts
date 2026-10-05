import { useEffect, useRef, useState } from 'react';

interface UseVADOptions {
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  silenceThresholdMs?: number;
  volumeThreshold?: number;
  enabled: boolean;
}

export function useVAD({
  onSpeechStart,
  onSpeechEnd,
  silenceThresholdMs = 700,
  volumeThreshold = 10,
  enabled
}: UseVADOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlySpeakingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      stopVAD();
      return;
    }

    let isMounted = true;

    const startVAD = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) return;
        
        streamRef.current = stream;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.5;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const averageVolume = sum / dataArray.length;

          if (averageVolume > volumeThreshold) {
            // Speech detected
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
            if (!isCurrentlySpeakingRef.current) {
              isCurrentlySpeakingRef.current = true;
              setIsSpeaking(true);
              onSpeechStart();
            }
          } else {
            // Silence detected
            if (isCurrentlySpeakingRef.current && !silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                isCurrentlySpeakingRef.current = false;
                setIsSpeaking(false);
                onSpeechEnd();
                silenceTimerRef.current = null;
              }, silenceThresholdMs);
            }
          }

          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        console.error('Error accessing microphone for VAD:', err);
      }
    };

    startVAD();

    return () => {
      isMounted = false;
      stopVAD();
    };
  }, [enabled, silenceThresholdMs, volumeThreshold, onSpeechStart, onSpeechEnd]);

  const stopVAD = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    
    isCurrentlySpeakingRef.current = false;
    setIsSpeaking(false);
  };

  return { isSpeaking };
}
