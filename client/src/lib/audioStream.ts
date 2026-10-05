// Explicit Hardware Audio Stream Controller for macOS / WebKit / Chromium
let audioStream: MediaStream | null = null;

export const ensureMicrophoneAccess = async (): Promise<MediaStream> => {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('MediaDevices.getUserMedia is not supported in this browser');
  }

  if (!audioStream || !audioStream.active) {
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log('Hardware microphone stream captured successfully (macOS orange mic dot active)');
    } catch (err) {
      console.error('Failed to get hardware mic stream:', err);
      throw err;
    }
  }
  return audioStream;
};

export const stopMicrophoneStream = () => {
  if (audioStream) {
    try {
      audioStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.warn('Error stopping audio stream tracks:', e);
    }
    audioStream = null;
  }
};

export const isMicrophoneStreamActive = (): boolean => {
  return !!audioStream && audioStream.active && audioStream.getAudioTracks().some((t) => t.readyState === 'live');
};
