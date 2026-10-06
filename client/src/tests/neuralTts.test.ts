import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playNeuralTTS, stopNeuralTTS } from '../lib/neuralTts';

describe('Neural TTS Player & Dual Fallback Engine (neuralTts.ts)', () => {
  let mockSpeak: any;
  let mockCancel: any;
  let mockPlay: any;
  let mockPause: any;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockPlay = vi.fn().mockResolvedValue(undefined);
    mockPause = vi.fn();

    // Mock window.speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: vi.fn().mockReturnValue([{ lang: 'de-DE', name: 'German Voice' }]),
      },
      writable: true,
      configurable: true,
    });

    // Mock SpeechSynthesisUtterance
    (window as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => ({
      text,
      lang: '',
      rate: 1,
      voice: null,
    }));

    // Mock global Audio
    (window as any).Audio = vi.fn().mockImplementation(() => ({
      play: mockPlay,
      pause: mockPause,
      currentTime: 0,
      onended: null,
      onerror: null,
    }));
  });

  afterEach(() => {
    stopNeuralTTS();
    vi.restoreAllMocks();
  });

  it('should ignore empty or whitespace-only text', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    await playNeuralTTS('   ');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('should play neural audio from server when /api/tts succeeds', async () => {
    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/mpeg' });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    } as any);

    await playNeuralTTS('Guten Tag, wie kann ich helfen?');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tts',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Guten Tag, wie kann ich helfen?',
          voice: 'de-DE-KatjaNeural',
        }),
      })
    );

    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(mockSpeak).not.toHaveBeenCalled(); // No fallback needed
  });

  it('should cleanly fallback to window.speechSynthesis if server TTS fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error or server offline'));

    await playNeuralTTS('Entschuldigung, ich verstehe nicht.');

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('should pause active audio and cancel synthesis on stopNeuralTTS', async () => {
    const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/mpeg' });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    } as any);

    await playNeuralTTS('Test sentence');
    stopNeuralTTS();

    expect(mockPause).toHaveBeenCalled();
    expect(mockCancel).toHaveBeenCalled();
  });
});
