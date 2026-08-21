import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import otpRoutes from './routes/otpRoutes';

export function createApp(): Express {
  const app = express();
  const publicDirectory = path.join(process.cwd(), 'public');

  app.use(cors());
  app.set('trust proxy', true);
  app.use(express.json());

  app.use('/api', otpRoutes);
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  app.use(express.static(publicDirectory));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDirectory, 'index.html'));
  });

  return app;
}

export default createApp();
