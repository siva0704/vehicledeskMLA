import type { Request, Response } from 'express';
import app from './index';

export default function handler(req: Request, res: Response) {
  const originalUrl = (req.headers['x-forwarded-uri'] || req.headers['x-matched-path']) as string;
  if (originalUrl && (req.url === '/api' || req.url === '/')) {
    req.url = originalUrl;
  }
  return (app as any)(req, res);
}
