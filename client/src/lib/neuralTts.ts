// Bulletproof Dual-Fallback Audio Engine (Edge Neural TTS + Local SpeechSynthesis)
let activeAudio: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;

// User-gesture unlocker for AudioContext and SpeechSynthesis
let audioUnlocked = false;
export const unlockAudio = () => {
  if (audioUnlocked) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    audioUnlocked = true;
  } catch (e) {
    // ignore
  }
};

export const stopNeuralTTS = () => {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (e) {
      console.warn('Error pausing active audio:', e);
    }
    activeAudio = null;
  }

  if (currentBlobUrl) {
    try {
      URL.revokeObjectURL(currentBlobUrl);
    } catch (e) {
      // ignore
    }
    currentBlobUrl = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
};

export const playNeuralTTS = async (text: string): Promise<void> => {
  stopNeuralTTS();

  if (!text || typeof text !== 'string' || !text.trim()) return;
  const trimmedText = text.trim();

  // Attempt 1: High-Quality Edge Neural TTS from Server
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmedText,
        voice: 'de-DE-KatjaNeural',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server TTS returned HTTP ${res.status}`);
    }

    const blob = await res.blob();
    if (blob.size === 0) {
      throw new Error('Received empty audio blob from TTS server');
    }

    const audioUrl = URL.createObjectURL(blob);
    currentBlobUrl = audioUrl;

    const audio = new Audio(audioUrl);
    activeAudio = audio;

    audio.onended = () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
      }
      if (activeAudio === audio) activeAudio = null;
    };

    audio.onerror = () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
      }
      if (activeAudio === audio) activeAudio = null;
    };

    await audio.play();
    return; // Played successfully!
  } catch (err) {
    console.warn('Edge Neural TTS failed, falling back to local SpeechSynthesis:', err);
  }

  // Attempt 2: Dual Fallback via Local Web Speech Synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.lang = 'de-DE';
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const deVoice = voices.find((v) => v.lang.startsWith('de') || v.lang.includes('de-')) || null;
      if (deVoice) {
        utterance.voice = deVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (fallbackErr) {
      console.error('Local SpeechSynthesis fallback error:', fallbackErr);
    }
  }
};
