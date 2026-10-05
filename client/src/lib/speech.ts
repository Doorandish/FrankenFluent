import { playNeuralTTS, stopNeuralTTS } from './neuralTts';

export { playNeuralTTS, stopNeuralTTS };

export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// Neural Edge TTS replacements
export const cancelSpeech = () => {
  stopNeuralTTS();
};

export const speak = (text: string, _lang: string = 'de-DE'): Promise<void> => {
  return playNeuralTTS(text);
};

export interface SpeechRecognitionConfig {
  onResult: (text: string) => void;
  onEnd: () => void;
  onError?: (error: string) => void;
  onAudioStart?: () => void;
}

export const startListening = (
  configOrResult: ((text: string) => void) | SpeechRecognitionConfig,
  legacyOnEnd?: () => void,
  lang: string = 'de-DE'
): any => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser');
    if (typeof configOrResult === 'function' && legacyOnEnd) {
      legacyOnEnd();
    } else if (typeof configOrResult === 'object' && configOrResult.onEnd) {
      configOrResult.onEnd();
    }
    return null;
  }

  const handlers: SpeechRecognitionConfig = typeof configOrResult === 'function'
    ? { onResult: configOrResult, onEnd: legacyOnEnd || (() => {}) }
    : configOrResult;

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onaudiostart = () => {
    if (handlers.onAudioStart) {
      handlers.onAudioStart();
    }
  };

  recognition.onspeechstart = () => {
    if (handlers.onAudioStart) {
      handlers.onAudioStart();
    }
  };

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      handlers.onResult(finalTranscript);
    }
  };

  recognition.onerror = (event: any) => {
    const errorType = event.error;
    if (errorType === 'no-speech' || errorType === 'aborted') {
      return;
    }
    console.warn('Speech recognition warning:', errorType);
    if (handlers.onError) {
      handlers.onError(errorType);
    }
  };

  recognition.onend = () => {
    handlers.onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    console.warn('Failed to start recognition instance:', e);
    handlers.onEnd();
  }
  
  return recognition;
};

export const stopListening = (recognition: any) => {
  if (recognition) {
    try {
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.onaudiostart = null;
      recognition.onspeechstart = null;
      recognition.abort();
    } catch (e) {
      console.warn('Error stopping recognition:', e);
    }
  }
};
