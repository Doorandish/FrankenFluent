import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ensureMicrophoneAccess,
  stopMicrophoneStream,
  isMicrophoneStreamActive,
} from '../lib/audioStream';

describe('Hardware Audio Stream Controller (audioStream.ts)', () => {
  let mockTrack: { stop: any; readyState: string };
  let mockStream: { active: boolean; getTracks: any; getAudioTracks: any };

  beforeEach(() => {
    mockTrack = {
      stop: vi.fn(() => {
        mockTrack.readyState = 'ended';
      }),
      readyState: 'live',
    };

    mockStream = {
      active: true,
      getTracks: vi.fn(() => [mockTrack]),
      getAudioTracks: vi.fn(() => [mockTrack]),
    };

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    stopMicrophoneStream();
    vi.restoreAllMocks();
  });

  it('should request microphone stream with noise suppression & echo cancellation constraints', async () => {
    const stream = await ensureMicrophoneAccess();

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    expect(stream).toBe(mockStream);
    expect(isMicrophoneStreamActive()).toBe(true);
  });

  it('should reuse existing active stream on consecutive calls without requesting mediaDevices again', async () => {
    await ensureMicrophoneAccess();
    const secondCall = await ensureMicrophoneAccess();

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(secondCall).toBe(mockStream);
  });

  it('should stop all tracks and clear the active stream on stopMicrophoneStream', async () => {
    await ensureMicrophoneAccess();
    expect(isMicrophoneStreamActive()).toBe(true);

    stopMicrophoneStream();

    expect(mockTrack.stop).toHaveBeenCalled();
    expect(isMicrophoneStreamActive()).toBe(false);
  });

  it('should throw an error if mediaDevices.getUserMedia fails', async () => {
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(
      new Error('Permission denied by macOS')
    );

    await expect(ensureMicrophoneAccess()).rejects.toThrow('Permission denied by macOS');
    expect(isMicrophoneStreamActive()).toBe(false);
  });
});
