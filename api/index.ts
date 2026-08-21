import type { IncomingMessage, ServerResponse } from 'http';
import app from '../src/app';
import connectDB from '../src/config/db';
import logger from '../src/utils/logger';

let dbReady: Promise<unknown> | null = null;

function ensureDb() {
  if (!dbReady) {
    dbReady = connectDB().catch((err) => {
      
      
      dbReady = null;
      logger.error('Mongo connect failed:', err?.message || err);
      throw err;
    });
  }
  return dbReady;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    await ensureDb();
  } catch {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Database connection failed' }));
    return;
  }
  
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
