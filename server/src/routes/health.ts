import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoStatus,
  });
});

export default router;
