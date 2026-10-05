export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    'speechSynthesis' in window && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// Chrome voice loading lifecycle management
let cachedVoices: SpeechSynthesisVoice[] = [];

export const initVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
};

// Initialize voices immediately on module load
initVoices();

export const getGermanVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (!cachedVoices.length) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices.find(v => v.lang.startsWith('de') || v.lang.includes('de-')) || null;
};

export const cancelSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('speechSynthesis.cancel error:', e);
    }
  }
};

export const speak = (text: string, lang: string = 'de-DE'): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      // Clear frozen queue before speaking
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;

      const deVoice = getGermanVoice();
      if (deVoice) {
        utterance.voice = deVoice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('SpeechSynthesis.speak failed:', e);
      resolve();
    }
  });
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
    // Transient events like 'no-speech' or 'aborted' are normal in continuous voice mode
    if (errorType === 'no-speech' || errorType === 'aborted') {
      return;
    }
    console.warn('Speech recognition warning:', errorType);
    if (handlers.onError) {
      handlers.onError(errorType);
    }
    // IMPORTANT: Do NOT call onEnd() here.
    // The browser will automatically trigger onend right after onerror.
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
