const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
(async () => {
  const tts = new MsEdgeTTS();
  await tts.setMetadata('de-DE-KatjaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const streams = tts.toStream('Hallo, dies ist ein Test');
  streams.audioStream.on('data', chunk => console.log('got chunk', chunk.length));
  streams.audioStream.on('end', () => console.log('done'));
})();
