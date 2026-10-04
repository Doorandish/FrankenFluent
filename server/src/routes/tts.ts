import { Router, Request, Response } from 'express';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const router = Router();

// Cache TTS instance to reuse connections
const tts = new MsEdgeTTS();
let ttsInitialized = false;

router.get('/', async (req: Request, res: Response) => {
  try {
    const text = req.query.text as string;
    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    if (!ttsInitialized) {
      await tts.setMetadata('de-DE-KatjaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      ttsInitialized = true;
    }

    const { audioStream } = tts.toStream(text);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    audioStream.pipe(res);

    audioStream.on('error', (err) => {
      console.error('TTS streaming error:', err);
      res.end();
    });

  } catch (error: any) {
    console.error('TTS API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  }
});

export default router;
