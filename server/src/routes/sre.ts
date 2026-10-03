import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import os from 'os';

const router = Router();

const startTime = Date.now();

// Mock telemetry data for the interactive dashboard
router.get('/metrics', async (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'degraded';
  
  const metrics = {
    system: {
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      cpu_load: os.loadavg()[0],
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded'
    },
    topology: [
      {
        id: 'frontend',
        name: 'React SPA',
        status: 'healthy',
        type: 'client',
        docs: 'User interface for language practice, handling voice I/O and routing.'
      },
      {
        id: 'backend',
        name: 'Node.js Express API',
        status: 'healthy',
        type: 'server',
        docs: 'Core API gateway handling authentication, routing, and business logic.'
      },
      {
        id: 'database',
        name: 'MongoDB Atlas',
        status: dbStatus,
        type: 'database',
        docs: 'Stores curriculums, user progress, and mistake ledgers.'
      },
      {
        id: 'ai-core',
        name: 'Gemini LLM',
        status: 'healthy',
        type: 'external',
        docs: 'Google Gemini 1.5 Flash for roleplay generation and grammar correction.'
      }
    ]
  };

  res.json(metrics);
});

export default router;
