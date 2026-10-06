import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import curriculumRoutes from './routes/curriculum';
import progressRoutes from './routes/progress';
import mistakesRoutes from './routes/mistakes';
import chatRoutes from './routes/chat';
import healthRoutes from './routes/health';
import sreRoutes from './routes/sre';
import ttsRoutes from './routes/tts';

export const app = express();

// Middleware
app.use(helmet());
app.use(cors());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/mistakes', mistakesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/sre', sreRoutes);
app.use('/api/tts', ttsRoutes);

// Serve Static Files in Production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);
