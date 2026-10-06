import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { EventEmitter } from 'events';
import { app } from '../app';

vi.mock('msedge-tts', () => {
  const { EventEmitter } = require('events');
  class MockMsEdgeTTS {
    async setMetadata() {
      return Promise.resolve();
    }
    toStream() {
      const emitter = new EventEmitter();
      setTimeout(() => {
        emitter.emit('data', Buffer.from('fake-mp3-stream-data'));
        emitter.emit('end');
      }, 10);
      return { audioStream: emitter };
    }
  }

  return {
    OUTPUT_FORMAT: { AUDIO_24KHZ_48KBITRATE_MONO_MP3: 'audio-format' },
    MsEdgeTTS: MockMsEdgeTTS,
  };
});

describe('TTS API Routes (/api/tts)', () => {
  describe('POST /api/tts', () => {
    it('should return 400 if text is missing', async () => {
      const res = await request(app)
        .post('/api/tts')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing or invalid text in request body');
    });

    it('should return 400 if text is only whitespace', async () => {
      const res = await request(app)
        .post('/api/tts')
        .send({ text: '   ' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing or invalid text in request body');
    });

    it('should synthesize speech and return audio/mpeg buffer on valid text', async () => {
      const res = await request(app)
        .post('/api/tts')
        .send({ text: 'Hallo, wie geht es dir?', voice: 'de-DE-KatjaNeural' });

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('audio/mpeg');
      expect(res.body).toBeInstanceOf(Buffer);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tts', () => {
    it('should return 400 if text query parameter is missing', async () => {
      const res = await request(app).get('/api/tts');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing text parameter');
    });

    it('should synthesize speech via GET query param', async () => {
      const res = await request(app)
        .get('/api/tts')
        .query({ text: 'Guten Tag!' });

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('audio/mpeg');
      expect(res.body).toBeInstanceOf(Buffer);
    });
  });
});
