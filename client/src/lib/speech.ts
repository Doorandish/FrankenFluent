export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const speak = (text: string, lang: string = 'de-DE'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; 
    
    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (e) => {
      reject(e);
    };

    window.speechSynthesis.speak(utterance);
  });
};

export const startListening = (
  onResult: (text: string) => void,
  onEnd: () => void,
  lang: string = 'de-DE'
): any => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported');
    onEnd();
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript);
    }
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error', event.error);
    onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    console.error(e);
    onEnd();
  }
  
  return recognition;
};

export const stopListening = (recognition: any) => {
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      console.error(e);
    }
  }
};
