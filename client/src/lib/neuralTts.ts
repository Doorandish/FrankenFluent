// Ultra-Realistic Microsoft Edge Neural German Voice Player
let activeAudio: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;

export const playNeuralTTS = async (text: string): Promise<void> => {
  stopNeuralTTS();

  if (!text || typeof text !== 'string' || !text.trim()) return;

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        voice: 'de-DE-KatjaNeural',
      }),
    });

    if (!response.ok) {
      throw new Error(`Edge TTS API error: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
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
      if (activeAudio === audio) {
        activeAudio = null;
      }
    };

    audio.onerror = (e) => {
      console.warn('Audio playback error:', e);
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
      }
      if (activeAudio === audio) {
        activeAudio = null;
      }
    };

    await audio.play();
  } catch (error) {
    console.error('Failed to play Edge Neural TTS:', error);
  }
};

export const stopNeuralTTS = () => {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (e) {
      console.warn('Error stopping active audio:', e);
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
};
