import { Router, Request, Response } from 'express';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const router = Router();

// In-memory cache for generated TTS audio buffers (max 100 items)
const audioCache = new Map<string, Buffer>();

async function generateTTSBuffer(text: string, voice: string = 'de-DE-KatjaNeural'): Promise<Buffer> {
  const cacheKey = `${voice}:${text.trim()}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text.trim());

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const timeout = setTimeout(() => {
      reject(new Error('Edge TTS generation timed out after 10 seconds'));
    }, 10000);

    audioStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    audioStream.on('end', () => {
      clearTimeout(timeout);
      const buffer = Buffer.concat(chunks);
      if (audioCache.size > 100) {
        const firstKey = audioCache.keys().next().value;
        if (firstKey) audioCache.delete(firstKey);
      }
      audioCache.set(cacheKey, buffer);
      resolve(buffer);
    });

    audioStream.on('error', (err: any) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// POST /api/tts
router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'de-DE-KatjaNeural' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing or invalid text in request body' });
    }

    const audioBuffer = await generateTTSBuffer(text, voice);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(audioBuffer);
  } catch (error: any) {
    console.error('Edge TTS POST Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to synthesize speech', details: error.message });
    }
  }
});

// GET /api/tts?text=...
router.get('/', async (req: Request, res: Response) => {
  try {
    const text = req.query.text as string;
    const voice = (req.query.voice as string) || 'de-DE-KatjaNeural';

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    const audioBuffer = await generateTTSBuffer(text, voice);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(audioBuffer);
  } catch (error: any) {
    console.error('Edge TTS GET Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to synthesize speech', details: error.message });
    }
  }
});

export default router;
