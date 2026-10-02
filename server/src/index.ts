import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

import curriculumRoutes from './routes/curriculum';
import progressRoutes from './routes/progress';
import mistakesRoutes from './routes/mistakes';
import chatRoutes from './routes/chat';
import healthRoutes from './routes/health';

const app = express();
const PORT = process.env.PORT || 10000;

// Connect to Database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/mistakes', mistakesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);

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

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
